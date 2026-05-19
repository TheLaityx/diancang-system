-- 点餐系统数据库初始化脚本
-- 执行方式：在 MySQL 中运行此文件

CREATE DATABASE IF NOT EXISTS diancang DEFAULT CHARSET utf8mb4;
USE diancang;

-- 分类表
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL COMMENT '分类名称',
  sort INT DEFAULT 0 COMMENT '排序',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) COMMENT='菜品分类';

-- 菜品表
CREATE TABLE IF NOT EXISTS dishes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL COMMENT '菜品名称',
  category_id INT COMMENT '分类ID',
  price DECIMAL(10,2) NOT NULL COMMENT '价格',
  image VARCHAR(255) COMMENT '图片URL',
  description TEXT COMMENT '描述',
  status TINYINT DEFAULT 1 COMMENT '1=上架 0=下架',
  stock INT DEFAULT 999 COMMENT '库存',
  sales INT DEFAULT 0 COMMENT '销量',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
) COMMENT='菜品';

-- 桌位表
CREATE TABLE IF NOT EXISTS tables_info (
  id INT AUTO_INCREMENT PRIMARY KEY,
  table_no VARCHAR(20) NOT NULL COMMENT '桌号',
  capacity INT DEFAULT 4 COMMENT '容纳人数',
  status TINYINT DEFAULT 0 COMMENT '0=空闲 1=使用中',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) COMMENT='桌位';

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  openid VARCHAR(100) UNIQUE COMMENT '微信openid',
  nickname VARCHAR(100) COMMENT '昵称',
  avatar VARCHAR(255) COMMENT '头像',
  phone VARCHAR(20) COMMENT '手机号',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) COMMENT='用户';

-- 订单表
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_no VARCHAR(50) UNIQUE NOT NULL COMMENT '订单号',
  user_id INT COMMENT '用户ID',
  table_no VARCHAR(20) COMMENT '桌号',
  total_price DECIMAL(10,2) NOT NULL COMMENT '总价',
  status VARCHAR(20) DEFAULT 'pending' COMMENT 'pending/accepted/completed/refunded',
  remark TEXT COMMENT '备注',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) COMMENT='订单';

-- 订单明细表
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL COMMENT '订单ID',
  dish_id INT COMMENT '菜品ID',
  dish_name VARCHAR(100) NOT NULL COMMENT '菜品名称快照',
  price DECIMAL(10,2) NOT NULL COMMENT '单价快照',
  quantity INT NOT NULL COMMENT '数量',
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (dish_id) REFERENCES dishes(id) ON DELETE SET NULL
) COMMENT='订单明细';

-- 管理员表
CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL COMMENT 'bcrypt加密',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) COMMENT='管理员';

-- ============ 初始数据 ============

-- 分类
INSERT INTO categories (name, sort) VALUES
('热菜', 1), ('凉菜', 2), ('汤类', 3), ('主食', 4), ('饮品', 5);

-- 菜品（库存按销量合理设置：热销品60-100，普通品30-55，冷门品20-30）
INSERT INTO dishes (name, category_id, price, description, status, sales, stock) VALUES
('红烧肉', 1, 38.00, '软糯鲜香，入口即化', 1, 120, 50),
('鱼香肉丝', 1, 28.00, '酸甜微辣，下饭神器', 1, 98, 45),
('宫保鸡丁', 1, 32.00, '花生香脆，鸡肉嫩滑', 1, 156, 60),
('麻婆豆腐', 1, 22.00, '麻辣鲜香，豆腐嫩滑', 1, 88, 40),
('夫妻肺片', 2, 26.00, '麻辣鲜香，口感丰富', 1, 76, 35),
('凉拌黄瓜', 2, 12.00, '清爽解腻，夏日必备', 1, 145, 55),
('番茄蛋汤', 3, 15.00, '酸甜开胃，家常美味', 1, 67, 30),
('老鸭汤', 3, 48.00, '滋补养生，汤鲜味美', 1, 43, 25),
('白米饭', 4, 3.00, '香软可口', 1, 320, 100),
('扬州炒饭', 4, 18.00, '粒粒分明，鲜香美味', 1, 210, 80),
('可口可乐', 5, 6.00, '冰镇', 1, 180, 80),
('鲜榨橙汁', 5, 12.00, '现榨现卖', 1, 95, 40);

-- 桌位
INSERT INTO tables_info (table_no, capacity) VALUES
('A01', 2), ('A02', 2), ('B01', 4), ('B02', 4), ('B03', 4),
('C01', 6), ('C02', 6), ('D01', 8);

-- 管理员（密码: admin123）
INSERT INTO admins (username, password) VALUES
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lihO');

-- 测试订单
INSERT INTO users (openid, nickname) VALUES
('test_openid_001', '测试用户A'),
('test_openid_002', '测试用户B');

INSERT INTO orders (order_no, user_id, table_no, total_price, status) VALUES
('ORD20260330001', 1, 'B01', 98.00, 'pending'),
('ORD20260330002', 2, 'C01', 56.00, 'accepted'),
('ORD20260330003', 1, 'A01', 21.00, 'completed');

INSERT INTO order_items (order_id, dish_id, dish_name, price, quantity) VALUES
(1, 1, '红烧肉', 38.00, 1),
(1, 3, '宫保鸡丁', 32.00, 1),
(1, 9, '白米饭', 3.00, 2),
(2, 2, '鱼香肉丝', 28.00, 1),
(2, 6, '凉拌黄瓜', 12.00, 1),
(2, 11, '可口可乐', 6.00, 2),
(3, 9, '白米饭', 3.00, 2),
(3, 7, '番茄蛋汤', 15.00, 1);
