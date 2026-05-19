const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 确保 uploads 目录存在
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// multer 配置：按日期分子目录，保留原始扩展名
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const today = new Date().toISOString().slice(0, 10); // 2026-03-30
    const dir = path.join(uploadDir, today);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const name = Date.now() + '_' + Math.random().toString(36).slice(2, 8) + ext;
    cb(null, name);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件'));
    }
  }
});

// POST /api/upload/image  — 上传单张图片
router.post('/image', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.json({ code: 400, msg: '没有收到文件' });
  }
  // 返回可访问的 URL
  const today = new Date().toISOString().slice(0, 10);
  const url = `/uploads/${today}/${req.file.filename}`;
  res.json({ code: 0, data: { url, filename: req.file.filename } });
});

module.exports = router;
