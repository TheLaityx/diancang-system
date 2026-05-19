const router = require('express').Router();
const db = require('../db');

// 获取订单列表（支持状态筛选，含菜品明细）
router.get('/', async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;
  let sql = `SELECT o.*, u.nickname as user_name
             FROM orders o LEFT JOIN users u ON o.user_id = u.id WHERE 1=1`;
  const params = [];
  if (status) {
    // 支持多状态逗号分隔，如 status=refunding,refunded,refund_done
    const statusList = status.split(',').map(s => s.trim()).filter(Boolean);
    if (statusList.length === 1) {
      sql += ' AND o.status = ?'; params.push(statusList[0]);
    } else {
      sql += ` AND o.status IN (${statusList.map(() => '?').join(',')})`;
      params.push(...statusList);
    }
  }
  sql += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
  params.push(Number(limit), Number(offset));
  try {
    const [rows] = await db.query(sql, params);
    // 批量查询所有订单的菜品明细
    if (rows.length > 0) {
      const orderIds = rows.map(r => r.id);
      const [items] = await db.query(
        `SELECT oi.*, d.image FROM order_items oi LEFT JOIN dishes d ON oi.dish_id = d.id WHERE oi.order_id IN (?)`,
        [orderIds]
      );
      // 将明细挂到对应订单上
      const itemsMap = {};
      items.forEach(item => {
        if (!itemsMap[item.order_id]) itemsMap[item.order_id] = [];
        itemsMap[item.order_id].push(item);
      });
      rows.forEach(r => { r.items = itemsMap[r.id] || []; });
    }
    // 查询总数
    let countSql = 'SELECT COUNT(*) as total FROM orders WHERE 1=1';
    const countParams = [];
    if (status) {
      const statusList = status.split(',').map(s => s.trim()).filter(Boolean);
      if (statusList.length === 1) {
        countSql += ' AND status = ?'; countParams.push(statusList[0]);
      } else {
        countSql += ` AND status IN (${statusList.map(() => '?').join(',')})`;
        countParams.push(...statusList);
      }
    }
    const [countRows] = await db.query(countSql, countParams);
    res.json({ code: 0, data: rows, total: countRows[0].total });
  } catch (e) {
    res.json({ code: 500, msg: e.message });
  }
});

// 获取订单详情（含明细 + 菜品图片）
router.get('/:id', async (req, res) => {
  try {
    const [orders] = await db.query(
      'SELECT o.*, u.nickname as user_name FROM orders o LEFT JOIN users u ON o.user_id = u.id WHERE o.id = ?',
      [req.params.id]
    );
    if (!orders.length) return res.json({ code: 404, msg: '订单不存在' });
    // 关联查询菜品图片
    const [items] = await db.query(
      `SELECT oi.*, d.image FROM order_items oi LEFT JOIN dishes d ON oi.dish_id = d.id WHERE oi.order_id = ?`,
      [req.params.id]
    );
    res.json({ code: 0, data: { ...orders[0], items } });
  } catch (e) {
    res.json({ code: 500, msg: e.message });
  }
});

// 创建订单（小程序调用）
router.post('/', async (req, res) => {
  const { user_id, table_no, items, remark } = req.body;
  if (!items || !items.length) return res.json({ code: 400, msg: '订单不能为空' });

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    // 计算总价
    const total_price = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    // 先插入（获取 insertId），再用 insertId 生成订单号和取餐号
    const [result] = await conn.query(
      'INSERT INTO orders (order_no, pickup_no, user_id, table_no, total_price, remark) VALUES (?,?,?,?,?,?)',
      ['TMP', '0000', user_id, table_no, total_price, remark]
    );
    const order_id = result.insertId;
    // 订单号：ORD + 6位序号；取餐号：后4位（0001~9999 循环）
    const order_no  = 'ORD' + String(order_id).padStart(6, '0');
    const pickup_no = String(order_id % 10000).padStart(4, '0');
    await conn.query('UPDATE orders SET order_no=?, pickup_no=? WHERE id=?', [order_no, pickup_no, order_id]);

    // 检查库存 & 插入明细 & 扣减库存
    for (const item of items) {
      // 查询当前库存
      const [[dish]] = await conn.query('SELECT stock FROM dishes WHERE id = ?', [item.dish_id]);
      if (!dish) {
        throw new Error(`菜品「${item.dish_name}」不存在`);
      }
      // stock === -1 表示不限量，不检查
      if (dish.stock !== -1 && dish.stock < item.quantity) {
        throw new Error(`菜品「${item.dish_name}」库存不足，仅剩 ${dish.stock} 份`);
      }
      await conn.query(
        'INSERT INTO order_items (order_id, dish_id, dish_name, price, quantity) VALUES (?,?,?,?,?)',
        [order_id, item.dish_id, item.dish_name, item.price, item.quantity]
      );
      // 增加销量
      await conn.query('UPDATE dishes SET sales = sales + ? WHERE id = ?', [item.quantity, item.dish_id]);
      // 减少库存（-1为不限量，不减）
      if (dish.stock !== -1) {
        await conn.query('UPDATE dishes SET stock = stock - ? WHERE id = ?', [item.quantity, item.dish_id]);
      }
    }
    await conn.commit();
    res.json({ code: 0, data: { order_id, order_no, pickup_no }, msg: '下单成功' });
  } catch (e) {
    await conn.rollback();
    res.json({ code: 500, msg: e.message });
  } finally {
    conn.release();
  }
});

// 更新订单状态（接单/完成/退款）
router.patch('/:id/status', async (req, res) => {
  const { status } = req.body;
  const validStatus = ['pending', 'accepted', 'completed', 'refunding', 'refunded', 'refund_done'];
  if (!validStatus.includes(status)) return res.json({ code: 400, msg: '无效状态' });
  try {
    await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
    const msgs = { accepted: '已接单', completed: '已完成', refunding: '退款申请中', refunded: '退款中', refund_done: '已退款' };
    res.json({ code: 0, msg: msgs[status] || '状态更新' });
  } catch (e) {
    res.json({ code: 500, msg: e.message });
  }
});

// 删除订单
router.delete('/:id', async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('DELETE FROM order_items WHERE order_id = ?', [req.params.id]);
    const [result] = await conn.query('DELETE FROM orders WHERE id = ?', [req.params.id]);
    await conn.commit();
    if (result.affectedRows === 0) return res.json({ code: 404, msg: '订单不存在' });
    res.json({ code: 0, msg: '删除成功' });
  } catch (e) {
    await conn.rollback();
    res.json({ code: 500, msg: e.message });
  } finally {
    conn.release();
  }
});

module.exports = router;
