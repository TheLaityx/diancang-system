const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');

// 验证JWT的中间件
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ code: 401, msg: '未登录' });
  }
  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'diancang-secret-key');
    req.adminId = decoded.id;
    next();
  } catch (e) {
    return res.status(401).json({ code: 401, msg: '登录已过期' });
  }
}

// GET /api/reviews?dish_id=xxx  获取某菜品的评论列表（公开接口，无需登录）
router.get('/', async (req, res) => {
  const { dish_id } = req.query;
  if (!dish_id) {
    return res.json({ code: 400, msg: '缺少dish_id参数' });
  }
  try {
    const [rows] = await db.query(
      `SELECT id, dish_id, user_id, user_name, rating, content, reply, created_at
       FROM reviews WHERE dish_id = ? ORDER BY created_at DESC`,
      [dish_id]
    );
    // 计算平均分
    const [avgRow] = await db.query(
      `SELECT AVG(rating) as avg_rating, COUNT(*) as total FROM reviews WHERE dish_id = ?`,
      [dish_id]
    );
    res.json({
      code: 0,
      data: rows,
      summary: {
        avg_rating: avgRow[0].avg_rating ? Number(avgRow[0].avg_rating).toFixed(1) : '0.0',
        total: avgRow[0].total
      }
    });
  } catch (e) {
    console.error('获取评论失败:', e);
    res.json({ code: 500, msg: '获取评论失败' });
  }
});

// POST /api/reviews  提交评论（公开接口，小程序端调用）
router.post('/', async (req, res) => {
  const { dish_id, user_id, user_name, rating, content } = req.body;
  if (!dish_id || !rating || !content) {
    return res.json({ code: 400, msg: '缺少必要参数' });
  }
  if (rating < 1 || rating > 5) {
    return res.json({ code: 400, msg: '评分必须在1-5之间' });
  }
  try {
    const [result] = await db.query(
      `INSERT INTO reviews (dish_id, user_id, user_name, rating, content)
       VALUES (?, ?, ?, ?, ?)`,
      [dish_id, user_id || null, user_name || '匿名用户', rating, content]
    );
    res.json({ code: 0, data: { id: result.insertId } });
  } catch (e) {
    console.error('提交评论失败:', e);
    res.json({ code: 500, msg: '提交评论失败' });
  }
});

// PUT /api/reviews/:id/reply  商家回复评论（需要JWT）
router.put('/:id/reply', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { reply } = req.body;
  if (!reply || !reply.trim()) {
    return res.json({ code: 400, msg: '回复内容不能为空' });
  }
  try {
    await db.query(
      `UPDATE reviews SET reply = ? WHERE id = ?`,
      [reply.trim(), id]
    );
    res.json({ code: 0, msg: '回复成功' });
  } catch (e) {
    console.error('回复评论失败:', e);
    res.json({ code: 500, msg: '回复失败' });
  }
});

// POST /api/reviews/delete-self  用户删除自己的评论（公开接口，小程序端调用）
// 使用 POST 而非 DELETE，确保 wx.request 的 data 能正确传递到 req.body
router.post('/delete-self', async (req, res) => {
  const { review_id, dish_id, user_id, user_name } = req.body;

  try {
    // 优先：直接用 review_id 删除（最精确）
    if (review_id) {
      const [result] = await db.query(
        `DELETE FROM reviews WHERE id = ? LIMIT 1`,
        [review_id]
      );
      if (result.affectedRows > 0) {
        return res.json({ code: 0, msg: '删除成功' });
      }
      return res.json({ code: 404, msg: '未找到该评价' });
    }

    // Fallback：用 dish_id + user_id/user_name 删除
    if (!dish_id) {
      return res.json({ code: 400, msg: '缺少评价标识参数' });
    }

    let sql = `DELETE FROM reviews WHERE dish_id = ?`;
    let params = [dish_id];

    if (user_id) {
      // user_id 和 user_name 同时作为 OR 条件，更宽松更可靠
      sql += ` AND (user_id = ? OR user_name = ?)`;
      params.push(user_id, user_name || user_id);
    } else if (user_name) {
      sql += ` AND user_name = ?`;
      params.push(user_name);
    } else {
      return res.json({ code: 400, msg: '缺少用户标识' });
    }

    sql += ` ORDER BY created_at DESC LIMIT 1`;
    const [result] = await db.query(sql, params);
    if (result.affectedRows > 0) {
      res.json({ code: 0, msg: '删除成功' });
    } else {
      res.json({ code: 404, msg: '未找到您的评价' });
    }
  } catch (e) {
    console.error('删除评价失败:', e);
    res.json({ code: 500, msg: '删除失败' });
  }
});

// DELETE /api/reviews/:id  商家删除评论（需要JWT）
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    await db.query(`DELETE FROM reviews WHERE id = ?`, [id]);
    res.json({ code: 0, msg: '删除成功' });
  } catch (e) {
    console.error('删除评论失败:', e);
    res.json({ code: 500, msg: '删除失败' });
  }
});

// GET /api/reviews/all  获取全部评论（管理端使用，需要JWT）
router.get('/all/list', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT r.*, d.name as dish_name
       FROM reviews r
       LEFT JOIN dishes d ON r.dish_id = d.id
       ORDER BY r.created_at DESC`
    );
    res.json({ code: 0, data: rows });
  } catch (e) {
    console.error('获取全部评论失败:', e);
    res.json({ code: 500, msg: '获取失败' });
  }
});

module.exports = router;
