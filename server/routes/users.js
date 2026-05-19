const router = require('express').Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, openid, nickname, avatar, phone, created_at FROM users ORDER BY created_at DESC');
    res.json({ code: 0, data: rows });
  } catch (e) {
    res.json({ code: 500, msg: e.message });
  }
});

// 注册或更新用户（小程序登录时调用）
router.post('/login', async (req, res) => {
  const { openid, nickname, avatar } = req.body;
  try {
    const [existing] = await db.query('SELECT * FROM users WHERE openid = ?', [openid]);
    if (existing.length) {
      await db.query('UPDATE users SET nickname=?, avatar=? WHERE openid=?', [nickname, avatar, openid]);
      res.json({ code: 0, data: existing[0] });
    } else {
      const [result] = await db.query(
        'INSERT INTO users (openid, nickname, avatar) VALUES (?,?,?)',
        [openid, nickname, avatar]
      );
      res.json({ code: 0, data: { id: result.insertId, openid, nickname, avatar } });
    }
  } catch (e) {
    res.json({ code: 500, msg: e.message });
  }
});

module.exports = router;
