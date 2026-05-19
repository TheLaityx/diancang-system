const router = require('express').Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM tables_info ORDER BY table_no');
    res.json({ code: 0, data: rows });
  } catch (e) {
    res.json({ code: 500, msg: e.message });
  }
});

router.patch('/:id/status', async (req, res) => {
  const { status } = req.body;
  try {
    await db.query('UPDATE tables_info SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ code: 0, msg: '更新成功' });
  } catch (e) {
    res.json({ code: 500, msg: e.message });
  }
});

module.exports = router;
