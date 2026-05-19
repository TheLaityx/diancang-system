const router = require('express').Router();
const db = require('../db');

// 获取菜品列表（支持分类筛选 + 名称搜索）
router.get('/', async (req, res) => {
  const { category_id, status, keyword } = req.query;
  let sql = `SELECT d.*, c.name as category_name
             FROM dishes d LEFT JOIN categories c ON d.category_id = c.id WHERE 1=1`;
  const params = [];
  if (category_id) { sql += ' AND d.category_id = ?'; params.push(category_id); }
  if (status !== undefined) { sql += ' AND d.status = ?'; params.push(status); }
  if (keyword) { sql += ' AND d.name LIKE ?'; params.push('%' + keyword + '%'); }
  sql += ' ORDER BY d.category_id, d.id';
  try {
    const [rows] = await db.query(sql, params);
    res.json({ code: 0, data: rows });
  } catch (e) {
    res.json({ code: 500, msg: e.message });
  }
});

// 获取单个菜品
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM dishes WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.json({ code: 404, msg: '菜品不存在' });
    res.json({ code: 0, data: rows[0] });
  } catch (e) {
    res.json({ code: 500, msg: e.message });
  }
});

// 新增菜品
router.post('/', async (req, res) => {
  const { name, category_id, price, image, description, status = 1, stock = 30 } = req.body;
  if (!name) return res.json({ code: 400, msg: '菜品名称不能为空' });
  if (!category_id) return res.json({ code: 400, msg: '请选择菜品分类' });
  if (price === undefined || price === null || price === '') return res.json({ code: 400, msg: '价格不能为空' });
  try {
    const [result] = await db.query(
      'INSERT INTO dishes (name, category_id, price, image, description, status, stock) VALUES (?,?,?,?,?,?,?)',
      [name, category_id, Number(price), image || '', description || '', status, stock]
    );
    res.json({ code: 0, data: { id: result.insertId }, msg: '添加成功' });
  } catch (e) {
    res.json({ code: 500, msg: e.message });
  }
});

// 修改菜品
router.put('/:id', async (req, res) => {
  const { name, category_id, price, image, description, status, stock } = req.body;
  try {
    await db.query(
      'UPDATE dishes SET name=?, category_id=?, price=?, image=?, description=?, status=?, stock=? WHERE id=?',
      [name, category_id, price, image, description, status, stock, req.params.id]
    );
    res.json({ code: 0, msg: '修改成功' });
  } catch (e) {
    res.json({ code: 500, msg: e.message });
  }
});

// 上下架
router.patch('/:id/status', async (req, res) => {
  const { status } = req.body;
  try {
    await db.query('UPDATE dishes SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ code: 0, msg: status == 1 ? '已上架' : '已下架' });
  } catch (e) {
    res.json({ code: 500, msg: e.message });
  }
});

// 删除菜品
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM dishes WHERE id = ?', [req.params.id]);
    res.json({ code: 0, msg: '删除成功' });
  } catch (e) {
    res.json({ code: 500, msg: e.message });
  }
});

module.exports = router;
