const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件：让 /uploads/... 可直接访问图片
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 路由
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/dishes',     require('./routes/dishes'));
app.use('/api/orders',     require('./routes/orders'));
app.use('/api/tables',     require('./routes/tables'));
app.use('/api/users',      require('./routes/users'));
app.use('/api/stats',      require('./routes/stats'));
app.use('/api/upload',     require('./routes/upload'));

// 健康检查
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: '点餐系统后端运行中', time: new Date() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ 服务器启动成功：http://localhost:${PORT}`);
});
