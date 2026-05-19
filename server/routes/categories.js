const router = require('express').Router();
const db = require('../db');

// 获取所有分类
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM categories ORDER BY sort');
    res.json({ code: 0, data: rows });
  } catch (e) {
    res.json({ code: 500, msg: e.message });
  }
});

// 新增分类
router.post('/', async (req, res) => {
  const { name, sort = 0 } = req.body;
  try {
    const [result] = await db.query('INSERT INTO categories (name, sort) VALUES (?, ?)', [name, sort]);
    res.json({ code: 0, data: { id: result.insertId } });
  } catch (e) {
    res.json({ code: 500, msg: e.message });
  }
});

// 删除分类
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
    res.json({ code: 0, msg: '删除成功' });
  } catch (e) {
    res.json({ code: 500, msg: e.message });
  }
});

module.exports = router;
