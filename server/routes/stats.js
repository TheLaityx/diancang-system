const router = require('express').Router();
const db = require('../db');

// 数据概览
router.get('/overview', async (req, res) => {
  try {
    const [[todayOrders]] = await db.query(
      "SELECT COUNT(*) as count, COALESCE(SUM(total_price),0) as revenue FROM orders WHERE DATE(created_at)=CURDATE() AND status != 'refunded'"
    );
    const [[totalOrders]] = await db.query("SELECT COUNT(*) as count FROM orders");
    const [[dishes]] = await db.query("SELECT COUNT(*) as count FROM dishes WHERE status=1");
    const [[users]] = await db.query("SELECT COUNT(*) as count FROM users");
    const [[pending]] = await db.query("SELECT COUNT(*) as count FROM orders WHERE status='pending'");

    res.json({
      code: 0, data: {
        today_revenue: Number(todayOrders.revenue),
        today_orders: todayOrders.count,
        total_orders: totalOrders.count,
        online_dishes: dishes.count,
        total_users: users.count,
        pending_orders: pending.count
      }
    });
  } catch (e) {
    res.json({ code: 500, msg: e.message });
  }
});

// 近7天营收趋势
router.get('/revenue', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT DATE(created_at) as date, COUNT(*) as orders, COALESCE(SUM(total_price),0) as revenue
      FROM orders WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY) AND status != 'refunded'
      GROUP BY DATE(created_at) ORDER BY date
    `);
    res.json({ code: 0, data: rows });
  } catch (e) {
    res.json({ code: 500, msg: e.message });
  }
});

// 菜品销量排行
router.get('/top-dishes', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT oi.dish_name, SUM(oi.quantity) as total_qty, SUM(oi.quantity * oi.price) as total_revenue
      FROM order_items oi JOIN orders o ON oi.order_id = o.id
      WHERE o.status != 'refunded'
      GROUP BY oi.dish_name ORDER BY total_qty DESC LIMIT 10
    `);
    res.json({ code: 0, data: rows });
  } catch (e) {
    res.json({ code: 500, msg: e.message });
  }
});

// 分类销量占比
router.get('/category-stats', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT c.name, SUM(oi.quantity) as total_qty
      FROM order_items oi
      JOIN dishes d ON oi.dish_id = d.id
      JOIN categories c ON d.category_id = c.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status != 'refunded'
      GROUP BY c.name ORDER BY total_qty DESC
    `);
    res.json({ code: 0, data: rows });
  } catch (e) {
    res.json({ code: 500, msg: e.message });
  }
});

// 补货提醒：销量高 + 库存低的菜品预警
router.get('/restock', async (req, res) => {
  try {
    // 近7天各菜品销量
    const [salesRows] = await db.query(`
      SELECT d.id, d.name, d.stock, d.status, d.category_id,
             c.name as category_name,
             COALESCE(SUM(oi.quantity), 0) as week_sales,
             COALESCE(SUM(oi.quantity * oi.price), 0) as week_revenue
      FROM dishes d
      LEFT JOIN categories c ON d.category_id = c.id
      LEFT JOIN order_items oi ON d.id = oi.dish_id
      LEFT JOIN orders o ON oi.order_id = o.id
        AND o.status != 'refunded'
        AND o.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      WHERE d.status = 1
      GROUP BY d.id, d.name, d.stock, d.status, d.category_id, c.name
      ORDER BY week_sales DESC
    `);

    // 计算平均日销量，判断预警等级
    const result = salesRows.map(row => {
      const dailyAvg = Number((row.week_sales / 7).toFixed(1));
      const stock = row.stock >= 9999 ? null : row.stock; // 9999视为无限库存
      let level = 'normal'; // normal / warning / danger
      let reason = [];

      if (stock !== null) {
        if (stock === 0) { level = 'danger'; reason.push('库存为0'); }
        else if (dailyAvg > 0 && stock < dailyAvg * 2) { level = 'danger'; reason.push(`库存仅够${(stock/dailyAvg).toFixed(1)}天`); }
        else if (dailyAvg > 0 && stock < dailyAvg * 5) { level = 'warning'; reason.push(`库存约还够${(stock/dailyAvg).toFixed(1)}天`); }
      }
      if (row.week_sales >= 20) reason.push(`近7天热销${row.week_sales}份`);

      return {
        ...row,
        week_sales: Number(row.week_sales),
        week_revenue: Number(row.week_revenue),
        daily_avg: dailyAvg,
        stock_display: stock === null ? '无限' : stock,
        level,
        reason: reason.join('，') || '正常'
      };
    });

    // 按预警等级排序：danger > warning > normal
    const order = { danger: 0, warning: 1, normal: 2 };
    result.sort((a, b) => order[a.level] - order[b.level] || b.week_sales - a.week_sales);

    res.json({ code: 0, data: result });
  } catch (e) {
    res.json({ code: 500, msg: e.message });
  }
});

module.exports = router;
