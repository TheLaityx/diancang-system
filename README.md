# 扫码点餐系统（微信小程序 + 前后端分离）

一个完整的扫码点餐系统，包含微信小程序客户端、Vue3 管理后台、Node.js + Express 服务端，前后端分离架构，支持桌位扫码点餐、订单管理、库存管理、数据统计等核心功能。

> 📖 **第一次运行？先看 [QUICKSTART.md](./QUICKSTART.md)** — 从零安装 MySQL 到跑通全套系统的完整教程。

---

## 功能特性

| 端 | 核心功能 |
|---|---|
| **微信小程序** | 扫码点餐、桌号选择、菜品分类浏览、购物车、在线支付模拟、订单查询、退款申请 |
| **管理后台** | 数据统计看板、订单处理（接单/完成/退款）、菜品管理（增删改查/上下架/库存）、补货预警、桌位管理、用户管理 |
| **服务端** | RESTful API、JWT 认证、MySQL 数据库、文件上传、库存扣减事务、分类/菜品/订单/桌位/用户/统计全模块接口 |

---

## 技术栈

| 层级 | 技术 |
|---|---|
| 小程序端 | 原生微信小程序（含自定义 TabBar、CSS 矢量图标） |
| 管理后台 | Vue 3 + Vite + Element Plus + Pinia + Vue Router + ECharts |
| 服务端 | Node.js + Express + MySQL2 + bcryptjs + jsonwebtoken + multer + dotenv |
| 数据库 | MySQL 5.7+ |

---

## 项目结构

```
diancang-system/
├── wechat-miniprogram/    # 微信小程序客户端
│   ├── pages/             # 页面目录（首页、菜品、购物车、订单、支付、用户、退款、商户端）
│   ├── components/        # 公共组件
│   ├── custom-tab-bar/    # 自定义底部导航
│   ├── utils/             # 工具函数 & API 封装
│   ├── images/            # 本地图片资源
│   ├── app.js             # 小程序全局逻辑
│   ├── app.json           # 全局配置
│   └── app.wxss           # 全局样式（含设计规范变量）
│
├── admin-web/             # Vue3 管理后台
│   ├── src/
│   │   ├── views/         # 页面（Dashboard、Orders、Dishes、Restock、Users、Login）
│   │   ├── api.js         # 接口封装（axios）
│   │   ├── router/        # 路由配置
│   │   ├── stores/        # Pinia 状态管理
│   │   └── main.js        # 入口文件
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── server/                # Node.js 服务端
│   ├── routes/            # 路由模块（auth、categories、dishes、orders、tables、users、stats、upload）
│   ├── uploads/           # 图片上传目录（运行后自动创建）
│   ├── db.js              # MySQL 连接池配置
│   ├── db.sql             # 数据库初始化脚本（含测试数据）
│   ├── update_stock.sql   # 已有数据库库存更新脚本
│   ├── .env.example       # 环境变量示例
│   ├── index.js           # 服务入口
│   └── package.json
│
└── README.md
```

---

## 环境要求

- **Node.js** >= 18.x
- **MySQL** >= 5.7
- **微信开发者工具**（稳定版）
- **现代浏览器**（Chrome / Edge，用于管理后台）

---

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/TheLaityx/diancang-system.git
cd diancang-system
```

### 2. 数据库初始化

打开 MySQL 命令行或图形化工具（如 Navicat、DataGrip），执行：

```bash
# 方式一：命令行（需先进入 server 目录）
cd server
mysql -u root -p < db.sql

# 方式二：图形化工具直接打开 db.sql 执行
```

> 脚本会自动创建 `diancang` 数据库、所有数据表、分类、菜品、桌位、管理员账号及测试订单。

**如果是已有数据库升级库存字段**，额外执行：
```bash
mysql -u root -p diancang < update_stock.sql
```

### 3. 启动后端服务

```bash
cd server

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env，填写你的 MySQL 密码等配置

# 启动服务
npm start
```

服务默认运行在 `http://localhost:3000`，看到以下输出即成功：
```
✅ 服务器启动成功：http://localhost:3000
```

**后端环境变量说明（.env）**

| 变量 | 说明 | 默认值 |
|---|---|---|
| `DB_HOST` | 数据库地址 | localhost |
| `DB_PORT` | 数据库端口 | 3306 |
| `DB_USER` | 数据库用户名 | root |
| `DB_PASSWORD` | 数据库密码 | 必填 |
| `DB_NAME` | 数据库名 | diancang |
| `JWT_SECRET` | JWT 签名密钥 | 必填（建议随机字符串） |
| `PORT` | 服务端口号 | 3000 |

### 4. 启动管理后台

```bash
cd admin-web

# 安装依赖
npm install

# 开发模式启动
npm run dev
```

默认运行在 `http://localhost:5173`，浏览器打开即可。

> 生产构建：`npm run build`，生成 `dist/` 目录，可部署到任意静态服务器。

### 5. 导入微信小程序

1. 打开 **微信开发者工具**
2. 点击「导入项目」，选择 `wechat-miniprogram` 文件夹
3. **AppID**：填写你的微信小程序 AppID（或点击测试号使用测试 AppID）
4. 点击「确定」导入
5. 编译后即可预览

**小程序网络配置检查**：
- 打开 `wechat-miniprogram/utils/api.js`
- 确保 `BASE_URL` 指向你的后端地址（本地开发一般为 `http://localhost:3000`）
- 在微信开发者工具中勾选「不校验合法域名、web-view...」以支持本地 HTTP 调试

---

## 默认账号

| 系统 | 账号 | 密码 | 说明 |
|---|---|---|---|
| 管理后台 | admin | admin123 | 管理员登录 |
| 小程序商户端 | admin | admin123 | 通过 `pages/merchant-login` 登录 |

> 管理员密码使用 bcrypt 加密存储在数据库 `admins` 表中。

---

## 核心 API 接口

| 模块 | 基础路径 | 主要接口 |
|---|---|---|
| 认证 | `/api/auth` | POST /login（管理员登录） |
| 分类 | `/api/categories` | GET /、POST /、PUT /:id、DELETE /:id |
| 菜品 | `/api/dishes` | GET /（支持 keyword 搜索）、POST /、PUT /:id、DELETE /:id |
| 订单 | `/api/orders` | GET /、POST /（创建并扣减库存）、PUT /:id/status、POST /:id/refund |
| 桌位 | `/api/tables` | GET /、POST /、PUT /:id、DELETE /:id |
| 用户 | `/api/users` | GET / |
| 统计 | `/api/stats` | GET /dashboard（数据看板） |
| 上传 | `/api/upload` | POST /（图片上传） |

> 完整接口定义可查看 `server/routes/` 下的各个路由文件。

---

## 库存管理说明

- 菜品表 `dishes.stock` 字段表示库存：
  - `stock = -1` 表示不限量
  - `stock >= 0` 表示实际库存，下单时会原子性检查并扣减
- 管理后台「补货管理」页面会预警库存 <= 10 的菜品
- 初始数据中的库存已按菜品销量合理分配（热销品 60~100，普通品 30~55）

---

## 设计规范

- **主色**：`#C68D56`（暖橙色）
- **深色**：`#A97240`
- **背景**：`#F4F5F7`
- **卡片背景**：`#FFFFFF`
- **文字主色**：`#1A1A2E`
- **圆角层级**：8px / 12px / 14px / 16px / 22px

---

## 常见问题

### Q1：后端启动报错 "Cannot find module"
确认在 `server/` 目录下执行 `npm install`，且 Node.js 版本 >= 18。

### Q2：小程序请求后端接口失败
1. 确认后端已启动且 `BASE_URL` 正确
2. 微信开发者工具中勾选「详情 → 本地设置 → 不校验合法域名」
3. 确认电脑防火墙未拦截 3000 端口

### Q3：图片上传后无法显示
后端通过 `/uploads/xxx.jpg` 提供静态文件访问，确保 `server/uploads/` 目录存在且有写入权限。

### Q4：管理后台登录后跳转空白
检查浏览器控制台 Network 面板，确认后端接口返回正常，且 `JWT_SECRET` 配置正确。

---

## 开发建议

- 本地开发建议按顺序启动：MySQL → 后端（端口 3000）→ 管理端（端口 5173）→ 微信开发者工具
- 小程序真机调试时，需将后端部署到公网服务器，并配置对应的 request 合法域名
- 生产环境部署建议使用 `pm2` 启动后端，Nginx 反向代理并配置 HTTPS

---

## License

本项目仅供学习交流使用。
