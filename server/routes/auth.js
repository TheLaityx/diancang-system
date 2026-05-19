const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

// 管理员登录
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await db.query('SELECT * FROM admins WHERE username = ?', [username]);
    if (!rows.length) return res.json({ code: 401, msg: '用户名或密码错误' });

    const valid = await bcrypt.compare(password, rows[0].password);
    if (!valid) return res.json({ code: 401, msg: '用户名或密码错误' });

    const token = jwt.sign({ id: rows[0].id, username }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ code: 0, msg: '登录成功', data: { token, username } });
  } catch (e) {
    res.json({ code: 500, msg: e.message });
  }
});

module.exports = router;
