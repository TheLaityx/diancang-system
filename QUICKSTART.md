# 新手上手教程（零基础上手）

> 本文档面向第一次运行本项目的新人。按顺序执行，15 分钟内可跑通全套系统。

---

## 目录

1. [安装 MySQL 数据库](#1-安装-mysql-数据库)
2. [创建数据库并导入数据](#2-创建数据库并导入数据)
3. [启动后端服务](#3-启动后端服务)
4. [启动管理后台](#4-启动管理后台)
5. [导入微信小程序](#5-导入微信小程序)
6. [常见问题](#6-常见问题)

---

## 1. 安装 MySQL 数据库

本项目后端需要 MySQL 5.7+。以下提供两种方式，**二选一即可**：

### 方式 A：安装 MySQL 官方版（推荐，纯净）

1. 下载 MySQL Installer：https://dev.mysql.com/downloads/installer/
2. 安装时选择 **"Server only"**，一路下一步
3. **记住 root 密码**（后面要用）
4. 安装完成后，按 `Win + R` 输入 `services.msc`，确认 **MySQL80** 正在运行

### 方式 B：安装 XAMPP（带图形化工具，适合新手）

1. 下载 XAMPP：https://www.apachefriends.org/
2. 安装时只勾选 **MySQL** 和 **phpMyAdmin**
3. 打开 XAMPP Control Panel，点击 MySQL 的 **Start**
4. MySQL root 默认密码为空（不填）

> 两种方式装完效果一样，选一种就行。

---

## 2. 创建数据库并导入数据

### 2.1 打开 MySQL 命令行

按 `Win + R`，输入 `cmd` 回车，执行：

```bash
mysql -u root -p
```

输入 root 密码后进入 MySQL 提示符（显示 `mysql>`）。

> 如果用 XAMPP 且密码为空，直接回车即可。

### 2.2 创建数据库

在 `mysql>` 提示符下执行：

```sql
CREATE DATABASE diancang DEFAULT CHARSET utf8mb4;
USE diancang;
```

### 2.3 导入数据

**不要退出 MySQL**，继续执行（注意替换为你的实际路径）：

```sql
SOURCE F:/diancang-system/server/db.sql;
```

> `SOURCE` 后面跟的是 `db.sql` 文件的绝对路径。如果路径有空格，用引号包起来：`SOURCE "F:/my folder/db.sql";`

看到一堆 `Query OK` 就是成功了。执行：

```sql
SHOW TABLES;
```

应该显示这些表：

```
categories
dishes
tables_info
users
orders
order_items
admins
```

输入 `EXIT;` 退出 MySQL。

### 2.4 验证数据

```bash
mysql -u root -p diancang -e "SELECT * FROM dishes;"
```

能看到菜品列表就说明数据导入成功了。

---

## 3. 启动后端服务

### 3.1 进入后端目录

```bash
cd F:/diancang-system/server
```

### 3.2 安装依赖

```bash
npm install
```

### 3.3 配置环境变量

将 `.env.example` 复制一份为 `.env`：

```bash
cp .env.example .env
```

用记事本或 VS Code 打开 `.env` 文件，修改密码为你 MySQL 的 root 密码：

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=你的root密码     <-- 改成你安装时设的密码
DB_NAME=diancang
JWT_SECRET=diancang_secret_2026
PORT=3000
```

> XAMPP 默认密码为空时，写 `DB_PASSWORD=` 即可。

### 3.4 启动后端

```bash
npm start
```

看到以下输出表示成功：

```
✅ 服务器启动成功：http://localhost:3000
```

**不要关闭这个窗口**，保持后端运行。

验证后端是否正常：浏览器打开 http://localhost:3000 ，应该看到：

```json
{"status":"ok","message":"点餐系统后端运行中"}
```

---

## 4. 启动管理后台

**另开一个命令行窗口**（不要关掉后端窗口），执行：

```bash
cd F:/diancang-system/admin-web
npm install
npm run dev
```

看到以下输出表示成功：

```
  VITE v8.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  press h + enter to show help
```

浏览器打开 http://localhost:5173/ ，用默认账号登录：

- 用户名：`admin`
- 密码：`admin123`

---

## 5. 导入微信小程序

1. 打开 **微信开发者工具**
2. 点击「导入项目」
3. 项目目录选择：`F:/diancang-system/wechat-miniprogram`
4. **AppID**：填写你的小程序 AppID（如果没有，点「测试号」使用测试 AppID）
5. 点击「确定」

### 5.1 配置后端地址

打开 `wechat-miniprogram/utils/api.js`，找到第 5 行：

```javascript
const BASE_URL = 'http://localhost:3000/api';
```

如果后端不在本机，改成实际 IP。本地开发保持 `localhost` 即可。

### 5.2 开启不校验域名

在微信开发者工具中：

1. 点击右上角「详情」
2. 切换到「本地设置」
3. 勾选 **「不校验合法域名、web-view...」**

### 5.3 编译预览

点击「编译」，首页应该能加载出菜品了。

---

## 6. 常见问题

### Q1：小程序首页空白，显示"暂无符合的菜品"

**原因**：后端连不上 MySQL 数据库，返回空数据。

**排查步骤**：

1. 浏览器访问 http://localhost:3000 看后端是否启动
2. 检查 `.env` 里的 `DB_PASSWORD` 是否正确
3. 在 MySQL 里执行 `USE diancang; SHOW TABLES;` 确认数据库和数据都存在
4. 看后端命令行窗口有没有报错（红色的错误信息）

### Q2：后端启动报错 "Access denied for user 'root'@'localhost'"

**原因**：MySQL 密码填错了。

**解决**：重新检查 `.env` 里的 `DB_PASSWORD`，确保和安装 MySQL 时设的一致。

### Q3：后端启动报错 "Unknown database 'diancang'"

**原因**：还没执行 `db.sql` 创建数据库。

**解决**：回到第 2 步，执行 `db.sql` 导入数据。

### Q4：管理后台能打开但登录报错

**原因**：后端没启动，或者 `.env` 配置错误导致后端连不上数据库。

**解决**：先确保后端能正常返回 http://localhost:3000 的 JSON 数据。

### Q5：小程序请求报错 "url not in domain list"

**原因**：微信小程序要求 HTTPS 域名，本地 HTTP 开发需要关闭域名校验。

**解决**：在微信开发者工具 → 详情 → 本地设置 → 勾选「不校验合法域名」。

### Q6：MySQL 命令提示 "mysql 不是内部或外部命令"

**原因**：MySQL 的 bin 目录没有添加到系统环境变量 PATH。

**解决**：
- 方式 A：找到 MySQL 安装目录（如 `C:\Program Files\MySQL\MySQL Server 8.0\bin`），复制完整路径
- 方式 B：用 XAMPP 的话，路径是 `C:\xampp\mysql\bin`
- 右键「此电脑」→ 属性 → 高级系统设置 → 环境变量 → 系统变量 Path → 编辑 → 新建 → 粘贴路径 → 确定
- **重启命令行窗口** 后重试

---

## 快速检查清单

拿到代码后按这个顺序检查：

- [ ] MySQL 已安装并运行（services.msc 里 MySQL 正在运行）
- [ ] 数据库已创建（`diancang`）
- [ ] 数据已导入（`db.sql` 已执行）
- [ ] 后端 `.env` 密码正确
- [ ] 后端已启动（浏览器能访问 http://localhost:3000）
- [ ] 管理端已启动（浏览器能访问 http://localhost:5173）
- [ ] 小程序已导入（微信开发者工具能编译）
- [ ] 小程序已勾选「不校验合法域名」

以上全部 ✅ 后，系统就能正常使用了。
