/**
 * 微信小程序点餐系统 — 汇报PPT生成脚本
 * 运行：node make_ppt.js
 */
const PptxGenJS = require('pptxgenjs');
const pptx = new PptxGenJS();

// ===== 全局主题 =====
pptx.layout = 'LAYOUT_WIDE'; // 16:9

const BRAND  = '#C68D56';   // 主色（暖橙）
const DARK   = '#A97240';   // 深橙
const BG     = '#FDF8F3';   // 页面背景
const WHITE  = '#FFFFFF';
const DARK_TEXT = '#1A1A2E';
const GRAY   = '#555566';
const LIGHT  = '#F4F5F7';

// 顶部装饰色条
function addTopBar(slide) {
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: '100%', h: 0.08,
    fill: { color: BRAND }
  });
}

// 标准章节标题（左侧竖条 + 大标题）
function addSectionTitle(slide, title, sub) {
  // 左侧色块竖条
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.5, y: 0.55, w: 0.07, h: 0.52,
    fill: { color: BRAND }, line: { color: BRAND }
  });
  slide.addText(title, {
    x: 0.7, y: 0.48, w: 8, h: 0.6,
    fontSize: 26, bold: true, color: DARK_TEXT, fontFace: 'Microsoft YaHei'
  });
  if (sub) {
    slide.addText(sub, {
      x: 0.7, y: 1.05, w: 8, h: 0.35,
      fontSize: 13, color: GRAY, fontFace: 'Microsoft YaHei'
    });
  }
}

// 底部页码
function addFooter(slide, num, total) {
  slide.addText(`${num} / ${total}`, {
    x: 11.8, y: 6.9, w: 1.2, h: 0.25,
    fontSize: 9, color: '#AAAAAA', align: 'right', fontFace: 'Microsoft YaHei'
  });
}

// 带背景的信息卡片
function addCard(slide, x, y, w, h, text, fontSize, color, bgColor) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h,
    fill: { color: bgColor || LIGHT },
    line: { color: '#E8E8EE', width: 0.5 },
    rectRadius: 0.1
  });
  if (text) {
    slide.addText(text, {
      x: x + 0.1, y, w: w - 0.2, h,
      fontSize: fontSize || 12, color: color || DARK_TEXT,
      fontFace: 'Microsoft YaHei', valign: 'middle', align: 'center',
      wrap: true
    });
  }
}

const TOTAL = 11;

// ============================================================
// Slide 1 — 封面
// ============================================================
{
  const s = pptx.addSlide();

  // 渐变背景
  s.background = { color: '#2B1A0E' };

  // 装饰圆
  s.addShape(pptx.ShapeType.ellipse, {
    x: -1.2, y: -1.2, w: 4, h: 4,
    fill: { color: BRAND, transparency: 70 },
    line: { width: 0 }
  });
  s.addShape(pptx.ShapeType.ellipse, {
    x: 10, y: 4.5, w: 3.5, h: 3.5,
    fill: { color: DARK, transparency: 75 },
    line: { width: 0 }
  });

  // 顶部色条
  s.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: '100%', h: 0.06,
    fill: { color: BRAND }
  });

  // 项目标签
  s.addText('开发实训作业汇报', {
    x: 1.2, y: 1.5, w: 10.6, h: 0.5,
    fontSize: 14, color: BRAND, bold: true,
    fontFace: 'Microsoft YaHei', align: 'center',
    charSpacing: 3
  });

  // 主标题
  s.addText('微信小程序\n点餐系统', {
    x: 1.2, y: 2.1, w: 10.6, h: 1.6,
    fontSize: 48, bold: true, color: WHITE,
    fontFace: 'Microsoft YaHei', align: 'center',
    lineSpacingMultiple: 1.3
  });

  // 副标题
  s.addText('WeChat MiniProgram | Vue 3 | Node.js | MySQL', {
    x: 1.2, y: 3.9, w: 10.6, h: 0.45,
    fontSize: 13, color: '#CCBBAA',
    fontFace: 'Consolas', align: 'center'
  });

  // 分割线
  s.addShape(pptx.ShapeType.line, {
    x: 4, y: 4.55, w: 5, h: 0,
    line: { color: BRAND, width: 0.8 }
  });

  // 日期
  s.addText('2026年3月', {
    x: 1.2, y: 4.75, w: 10.6, h: 0.4,
    fontSize: 12, color: '#998877',
    fontFace: 'Microsoft YaHei', align: 'center'
  });

  addFooter(s, 1, TOTAL);
}

// ============================================================
// Slide 2 — 目录
// ============================================================
{
  const s = pptx.addSlide();
  s.background = { color: WHITE };
  addTopBar(s);

  s.addText('目  录', {
    x: 0.5, y: 0.3, w: 12, h: 0.6,
    fontSize: 28, bold: true, color: DARK_TEXT,
    fontFace: 'Microsoft YaHei', align: 'center'
  });

  const items = [
    ['01', '项目简介', '背景、目标与整体概述'],
    ['02', '系统架构', '三端架构与技术栈选型'],
    ['03', '功能演示', '小程序顾客端 & 后台管理'],
    ['04', '数据库设计', '表结构与订单状态流转'],
    ['05', '核心技术难点', '异步可靠性、状态同步等'],
    ['06', '项目成果', '总结与收获'],
  ];

  items.forEach(([num, title, sub], i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.6 + col * 6.3;
    const y = 1.3 + row * 1.6;

    // 卡片背景
    s.addShape(pptx.ShapeType.roundRect, {
      x, y, w: 5.8, h: 1.35,
      fill: { color: i === 0 ? '#FDF3E7' : LIGHT },
      line: { color: i === 0 ? BRAND : '#DDDDE8', width: i === 0 ? 1.2 : 0.5 },
      rectRadius: 0.12
    });

    // 序号
    s.addText(num, {
      x: x + 0.15, y: y + 0.2, w: 0.7, h: 0.7,
      fontSize: 22, bold: true, color: BRAND,
      fontFace: 'Arial', align: 'center'
    });

    // 竖分割
    s.addShape(pptx.ShapeType.line, {
      x: x + 0.9, y: y + 0.2, w: 0, h: 0.8,
      line: { color: '#DDDDE8', width: 0.6 }
    });

    s.addText(title, {
      x: x + 1.05, y: y + 0.12, w: 4.5, h: 0.5,
      fontSize: 15, bold: true, color: DARK_TEXT,
      fontFace: 'Microsoft YaHei'
    });
    s.addText(sub, {
      x: x + 1.05, y: y + 0.6, w: 4.5, h: 0.4,
      fontSize: 11, color: GRAY,
      fontFace: 'Microsoft YaHei'
    });
  });

  addFooter(s, 2, TOTAL);
}

// ============================================================
// Slide 3 — 项目简介
// ============================================================
{
  const s = pptx.addSlide();
  s.background = { color: WHITE };
  addTopBar(s);
  addSectionTitle(s, '01  项目简介', '面向餐厅堂食的扫码点餐全流程系统');

  // 左侧：项目概述文字
  s.addShape(pptx.ShapeType.roundRect, {
    x: 0.5, y: 1.5, w: 5.5, h: 4.8,
    fill: { color: '#FDF8F3' },
    line: { color: '#F0D8B8', width: 0.7 },
    rectRadius: 0.12
  });

  const desc = [
    '📌  项目类型：开发实训作业',
    '🎯  目标场景：餐厅堂食扫码点餐',
    '⏱   开发周期：约 2 天',
    '👥  用户角色：顾客 + 商家',
    '',
    '本项目实现了顾客 扫码 → 点餐 → 支付 →',
    '商家 接单 → 出餐 的完整业务闭环，',
    '包含三个独立端的开发与联调。',
  ];
  s.addText(desc.join('\n'), {
    x: 0.75, y: 1.7, w: 5.0, h: 4.3,
    fontSize: 13, color: DARK_TEXT,
    fontFace: 'Microsoft YaHei',
    lineSpacingMultiple: 1.7
  });

  // 右侧：三端卡片
  const cards = [
    { icon: '📱', title: '小程序顾客端', desc: '原生微信小程序\n点餐、支付、查订单', color: '#FFF3E0' },
    { icon: '🖥', title: 'Vue 3 后台管理', desc: 'Element Plus + ECharts\n接单、菜品、数据看板', color: '#E8F5E9' },
    { icon: '⚙️', title: 'Node.js 后端', desc: 'Express + MySQL\nRESTful API，端口 3000', color: '#E3F2FD' },
  ];
  cards.forEach((c, i) => {
    const y = 1.5 + i * 1.6;
    s.addShape(pptx.ShapeType.roundRect, {
      x: 6.5, y, w: 6.0, h: 1.4,
      fill: { color: c.color },
      line: { color: '#E0D0C0', width: 0.5 },
      rectRadius: 0.1
    });
    s.addText(c.icon, {
      x: 6.7, y: y + 0.25, w: 0.7, h: 0.8,
      fontSize: 24, align: 'center'
    });
    s.addText(c.title, {
      x: 7.5, y: y + 0.1, w: 4.8, h: 0.5,
      fontSize: 15, bold: true, color: DARK_TEXT,
      fontFace: 'Microsoft YaHei'
    });
    s.addText(c.desc, {
      x: 7.5, y: y + 0.6, w: 4.8, h: 0.6,
      fontSize: 11.5, color: GRAY,
      fontFace: 'Microsoft YaHei', lineSpacingMultiple: 1.4
    });
  });

  addFooter(s, 3, TOTAL);
}

// ============================================================
// Slide 4 — 系统架构
// ============================================================
{
  const s = pptx.addSlide();
  s.background = { color: WHITE };
  addTopBar(s);
  addSectionTitle(s, '02  系统架构', '前后端分离，三端独立开发');

  // 架构图（用形状模拟）
  const BOX_H = 1.0;

  // 小程序
  s.addShape(pptx.ShapeType.roundRect, {
    x: 0.5, y: 1.55, w: 3.2, h: BOX_H,
    fill: { color: '#FFF3E0' }, line: { color: BRAND, width: 1 }, rectRadius: 0.1
  });
  s.addText('📱 微信小程序\n顾客端（原生 WXML/JS）', {
    x: 0.5, y: 1.55, w: 3.2, h: BOX_H,
    fontSize: 12, bold: true, color: '#7B4F20',
    fontFace: 'Microsoft YaHei', align: 'center', valign: 'middle', lineSpacingMultiple: 1.4
  });

  // Vue 3 后台
  s.addShape(pptx.ShapeType.roundRect, {
    x: 0.5, y: 3.1, w: 3.2, h: BOX_H,
    fill: { color: '#E8F5E9' }, line: { color: '#4CAF50', width: 1 }, rectRadius: 0.1
  });
  s.addText('🖥 Vue 3 后台管理\nElement Plus + ECharts', {
    x: 0.5, y: 3.1, w: 3.2, h: BOX_H,
    fontSize: 12, bold: true, color: '#2E7D32',
    fontFace: 'Microsoft YaHei', align: 'center', valign: 'middle', lineSpacingMultiple: 1.4
  });

  // 箭头→后端
  [[1.55, 2.05], [3.1, 3.6]].forEach(([ay]) => {
    s.addShape(pptx.ShapeType.line, {
      x: 3.7, y: ay, w: 1.4, h: 0,
      line: { color: BRAND, width: 1.2, endArrowType: 'arrow' }
    });
  });
  s.addText('HTTP\nREST', {
    x: 3.72, y: 1.95, w: 1.35, h: 0.6,
    fontSize: 9, color: BRAND, align: 'center',
    fontFace: 'Consolas'
  });
  s.addText('HTTP\nREST', {
    x: 3.72, y: 3.5, w: 1.35, h: 0.6,
    fontSize: 9, color: '#4CAF50', align: 'center',
    fontFace: 'Consolas'
  });

  // Node.js 后端
  s.addShape(pptx.ShapeType.roundRect, {
    x: 5.1, y: 2.3, w: 3.2, h: BOX_H,
    fill: { color: '#E3F2FD' }, line: { color: '#1976D2', width: 1 }, rectRadius: 0.1
  });
  s.addText('⚙️ Node.js + Express\n后端服务（Port 3000）', {
    x: 5.1, y: 2.3, w: 3.2, h: BOX_H,
    fontSize: 12, bold: true, color: '#0D47A1',
    fontFace: 'Microsoft YaHei', align: 'center', valign: 'middle', lineSpacingMultiple: 1.4
  });

  // 箭头→数据库
  s.addShape(pptx.ShapeType.line, {
    x: 8.3, y: 2.8, w: 1.4, h: 0,
    line: { color: '#1976D2', width: 1.2, endArrowType: 'arrow' }
  });
  s.addText('SQL', {
    x: 8.3, y: 2.62, w: 1.4, h: 0.35,
    fontSize: 9, color: '#1976D2', align: 'center',
    fontFace: 'Consolas'
  });

  // MySQL
  s.addShape(pptx.ShapeType.roundRect, {
    x: 9.7, y: 2.3, w: 3.0, h: BOX_H,
    fill: { color: '#FCE4EC' }, line: { color: '#E91E63', width: 1 }, rectRadius: 0.1
  });
  s.addText('🗄 MySQL 数据库\n库名：diancang', {
    x: 9.7, y: 2.3, w: 3.0, h: BOX_H,
    fontSize: 12, bold: true, color: '#880E4F',
    fontFace: 'Microsoft YaHei', align: 'center', valign: 'middle', lineSpacingMultiple: 1.4
  });

  // 技术栈表格
  const rows = [
    [{ text: '层次', options: { bold: true, color: WHITE, fill: BRAND } },
     { text: '技术选型', options: { bold: true, color: WHITE, fill: BRAND } },
     { text: '说明', options: { bold: true, color: WHITE, fill: BRAND } }],
    [{ text: '小程序前端' }, { text: '原生 WXML / WXSS / JS' }, { text: '顾客扫码点餐界面' }],
    [{ text: '后台管理前端' }, { text: 'Vue 3 + Element Plus + ECharts' }, { text: '商家操作、数据看板' }],
    [{ text: '后端服务' }, { text: 'Node.js + Express' }, { text: 'RESTful API，Port 3000' }],
    [{ text: '数据库' }, { text: 'MySQL（库名：diancang）' }, { text: '7 张表，root/123456' }],
  ];
  s.addTable(rows, {
    x: 0.5, y: 4.45, w: 12.2, h: 2.3,
    fontSize: 11, fontFace: 'Microsoft YaHei',
    color: DARK_TEXT,
    border: { type: 'solid', color: '#E0D8CC', pt: 0.5 },
    rowH: 0.44,
    colW: [1.8, 4.2, 5.9]
  });

  addFooter(s, 4, TOTAL);
}

// ============================================================
// Slide 5 — 小程序功能（顾客端）
// ============================================================
{
  const s = pptx.addSlide();
  s.background = { color: WHITE };
  addTopBar(s);
  addSectionTitle(s, '03  功能演示 — 小程序顾客端', '完整点餐闭环：浏览 → 加购 → 支付 → 查单');

  const features = [
    { icon: '🏠', title: '首页/菜单', lines: ['分类筛选（动态加载）', '菜品卡片（图片/价格/月销）', '热销标签自动识别'] },
    { icon: '🛒', title: '购物车', lines: ['悬浮条始终可见', '弹出面板（加减/清空）', '实时金额更新'] },
    { icon: '💳', title: '模拟支付', lines: ['确认弹窗（演示模式）', '先等后端确认再跳转', '3秒超时本地兜底'] },
    { icon: '📋', title: '我的订单', lines: ['5个Tab（全部/待接/制作中…）', '取餐号显示（4位循环）', '下拉刷新获取最新状态'] },
    { icon: '🔍', title: '订单详情', lines: ['完整菜品明细', '桌号/取餐号/备注', '状态进度展示'] },
    { icon: '🪑', title: '桌号选择', lines: ['三区制 A/B/C 各10桌', '扫二维码自动识别', '兼容旧格式自动映射'] },
  ];

  features.forEach((f, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.5 + col * 4.2;
    const y = 1.5 + row * 2.3;

    s.addShape(pptx.ShapeType.roundRect, {
      x, y, w: 3.9, h: 2.1,
      fill: { color: '#FAFAFA' },
      line: { color: '#E8E0D8', width: 0.6 },
      rectRadius: 0.1
    });

    // 图标
    s.addText(f.icon, {
      x, y: y + 0.1, w: 3.9, h: 0.5,
      fontSize: 20, align: 'center'
    });

    // 标题
    s.addText(f.title, {
      x: x + 0.15, y: y + 0.55, w: 3.6, h: 0.38,
      fontSize: 13, bold: true, color: DARK_TEXT,
      fontFace: 'Microsoft YaHei', align: 'center'
    });

    // 分隔线
    s.addShape(pptx.ShapeType.line, {
      x: x + 0.4, y: y + 0.95, w: 3.1, h: 0,
      line: { color: '#E8E0D8', width: 0.5 }
    });

    // 特性点
    f.lines.forEach((line, j) => {
      s.addText(`• ${line}`, {
        x: x + 0.2, y: y + 1.05 + j * 0.3, w: 3.5, h: 0.3,
        fontSize: 10.5, color: GRAY,
        fontFace: 'Microsoft YaHei'
      });
    });
  });

  addFooter(s, 5, TOTAL);
}

// ============================================================
// Slide 6 — 后台管理功能
// ============================================================
{
  const s = pptx.addSlide();
  s.background = { color: WHITE };
  addTopBar(s);
  addSectionTitle(s, '03  功能演示 — Vue 3 后台管理', '商家操作界面：实时订单 + 菜品管理 + 数据分析');

  const modules = [
    {
      icon: '📊', title: '数据概览 Dashboard',
      color: '#FFF8EE', border: BRAND,
      items: ['今日订单数 / 营业额', '近7天营业额折线图（ECharts）', '菜品分类销售占比饼图', '待处理订单数实时统计']
    },
    {
      icon: '📦', title: '订单管理',
      color: '#F0FFF0', border: '#4CAF50',
      items: ['状态卡片统计（4种状态）', '✅ 接单 / 🎉完成 / ↩退款 / 🗑删除', '订单详情弹窗内可操作', '10秒自动刷新（可手动关）']
    },
    {
      icon: '🍽', title: '菜品管理',
      color: '#F0F8FF', border: '#1976D2',
      items: ['新增 / 编辑 / 删除菜品', '图片上传（拖拽 / 粘贴URL）', '上架 / 下架状态切换', '菜品列表图片预览']
    },
    {
      icon: '⚠️', title: '补货预警',
      color: '#FFF5F5', border: '#E53935',
      items: ['基于近7天销量自动计算', '🔴危险 / 🟡注意 / 🟢正常', '侧边栏显示预警数量徽标', '一键补货更新库存']
    },
  ];

  modules.forEach((m, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.5 + col * 6.3;
    const y = 1.5 + row * 2.5;

    s.addShape(pptx.ShapeType.roundRect, {
      x, y, w: 6.0, h: 2.25,
      fill: { color: m.color },
      line: { color: m.border, width: 0.8 },
      rectRadius: 0.12
    });

    s.addText(m.icon + '  ' + m.title, {
      x: x + 0.2, y: y + 0.12, w: 5.6, h: 0.46,
      fontSize: 14, bold: true, color: DARK_TEXT,
      fontFace: 'Microsoft YaHei'
    });

    s.addShape(pptx.ShapeType.line, {
      x: x + 0.2, y: y + 0.62, w: 5.6, h: 0,
      line: { color: m.border, width: 0.5, dashType: 'dash' }
    });

    m.items.forEach((item, j) => {
      s.addText(`▸  ${item}`, {
        x: x + 0.25, y: y + 0.72 + j * 0.36, w: 5.5, h: 0.35,
        fontSize: 11, color: GRAY,
        fontFace: 'Microsoft YaHei'
      });
    });
  });

  addFooter(s, 6, TOTAL);
}

// ============================================================
// Slide 7 — 数据库设计
// ============================================================
{
  const s = pptx.addSlide();
  s.background = { color: WHITE };
  addTopBar(s);
  addSectionTitle(s, '04  数据库设计', '7张表覆盖完整业务，订单状态清晰流转');

  // 左侧：表结构
  const tableRows = [
    [{ text: '表名', options: { bold: true, color: WHITE, fill: BRAND } },
     { text: '说明', options: { bold: true, color: WHITE, fill: BRAND } },
     { text: '关键字段', options: { bold: true, color: WHITE, fill: BRAND } }],
    [{ text: 'categories' }, { text: '菜品分类' }, { text: 'id, name' }],
    [{ text: 'dishes' }, { text: '菜品信息' }, { text: 'id, name, category_id, price, sales' }],
    [{ text: 'orders' }, { text: '订单主表' }, { text: 'id, order_no, pickup_no, table_no, status' }],
    [{ text: 'order_items' }, { text: '订单明细' }, { text: 'id, order_id, dish_name, price, quantity' }],
    [{ text: 'tables_info' }, { text: '桌位信息' }, { text: 'id, table_no, qr_code' }],
    [{ text: 'users' }, { text: '用户信息' }, { text: 'id, openid, nickname' }],
    [{ text: 'admins' }, { text: '管理员' }, { text: 'id, username, password(bcrypt)' }],
  ];
  s.addTable(tableRows, {
    x: 0.5, y: 1.5, w: 7.8, h: 4.5,
    fontSize: 11, fontFace: 'Microsoft YaHei',
    color: DARK_TEXT,
    border: { type: 'solid', color: '#E8E0D0', pt: 0.5 },
    rowH: 0.5,
    colW: [1.9, 1.8, 3.9]
  });

  // 右侧：状态流转
  s.addText('订单状态流转', {
    x: 8.7, y: 1.4, w: 4.0, h: 0.45,
    fontSize: 14, bold: true, color: DARK_TEXT,
    fontFace: 'Microsoft YaHei', align: 'center'
  });

  const states = [
    { label: 'pending\n待接单', color: '#FFF3E0', border: '#FF9800' },
    { label: 'accepted\n制作中', color: '#E3F2FD', border: '#1976D2' },
    { label: 'completed\n已完成', color: '#E8F5E9', border: '#4CAF50' },
  ];
  states.forEach((st, i) => {
    const y = 2.0 + i * 1.45;
    s.addShape(pptx.ShapeType.roundRect, {
      x: 9.0, y, w: 3.6, h: 1.0,
      fill: { color: st.color },
      line: { color: st.border, width: 1 },
      rectRadius: 0.1
    });
    s.addText(st.label, {
      x: 9.0, y, w: 3.6, h: 1.0,
      fontSize: 12.5, bold: true, color: DARK_TEXT,
      fontFace: 'Microsoft YaHei', align: 'center', valign: 'middle',
      lineSpacingMultiple: 1.3
    });
    if (i < 2) {
      s.addShape(pptx.ShapeType.line, {
        x: 10.8, y: y + 1.0, w: 0, h: 0.45,
        line: { color: BRAND, width: 1.2, endArrowType: 'arrow' }
      });
    }
  });

  // 退款分支
  s.addShape(pptx.ShapeType.roundRect, {
    x: 9.0, y: 5.55, w: 3.6, h: 0.8,
    fill: { color: '#FCE4EC' },
    line: { color: '#E91E63', width: 0.8, dashType: 'dash' },
    rectRadius: 0.1
  });
  s.addText('refunded  已退款\n（异常情况）', {
    x: 9.0, y: 5.55, w: 3.6, h: 0.8,
    fontSize: 11, color: '#880E4F',
    fontFace: 'Microsoft YaHei', align: 'center', valign: 'middle',
    lineSpacingMultiple: 1.3
  });
  s.addText('↙ 退款分支（任意阶段可发生）', {
    x: 8.7, y: 5.3, w: 4.0, h: 0.35,
    fontSize: 9, color: '#E91E63',
    fontFace: 'Microsoft YaHei', align: 'center'
  });

  addFooter(s, 7, TOTAL);
}

// ============================================================
// Slide 8 — 核心技术难点（上）
// ============================================================
{
  const s = pptx.addSlide();
  s.background = { color: WHITE };
  addTopBar(s);
  addSectionTitle(s, '05  核心技术难点', '开发过程中解决的关键工程问题');

  const points = [
    {
      num: '01',
      title: '订单可靠性（先下单再跳转）',
      problem: '问题：wx.redirectTo 后页面销毁，后台异步请求被微信中断，导致订单丢失',
      solution: '方案：Promise.race([下单请求, 3秒超时]) — 等待后端确认再跳转\n超时则用本地 LOCAL_xxx ID 兜底，不阻塞用户体验',
      color: '#FFF8EE', border: BRAND
    },
    {
      num: '02',
      title: '取餐号设计',
      problem: '问题：原订单号为 ORD + 13位时间戳，过长且对用户无意义',
      solution: '方案：后端 INSERT 后取 insertId，pickup_no = LPAD(id%10000, 4, "0")\n循环0001-9999，4位易读，顾客凭号取餐',
      color: '#F0F8FF', border: '#1976D2'
    },
    {
      num: '03',
      title: '商家→顾客状态同步',
      problem: '问题：后端用字符串状态（pending/accepted），前端用数字（1/2），映射混乱导致接单后仍显示"待接单"',
      solution: '方案：normalizeOrder 明确映射：pending→1, accepted→2, completed→3\n顾客端下拉刷新即可拿到最新状态',
      color: '#F0FFF0', border: '#4CAF50'
    },
  ];

  points.forEach((p, i) => {
    const y = 1.5 + i * 1.7;
    s.addShape(pptx.ShapeType.roundRect, {
      x: 0.5, y, w: 12.2, h: 1.55,
      fill: { color: p.color },
      line: { color: p.border, width: 0.8 },
      rectRadius: 0.1
    });

    // 序号
    s.addText(p.num, {
      x: 0.6, y: y + 0.1, w: 0.7, h: 0.7,
      fontSize: 18, bold: true, color: p.border,
      fontFace: 'Arial', align: 'center'
    });

    s.addText(p.title, {
      x: 1.35, y: y + 0.08, w: 11.1, h: 0.42,
      fontSize: 13.5, bold: true, color: DARK_TEXT,
      fontFace: 'Microsoft YaHei'
    });

    s.addText('❌ ' + p.problem, {
      x: 1.35, y: y + 0.5, w: 11.1, h: 0.38,
      fontSize: 10.5, color: '#B03030',
      fontFace: 'Microsoft YaHei'
    });

    s.addText('✅ ' + p.solution, {
      x: 1.35, y: y + 0.88, w: 11.1, h: 0.55,
      fontSize: 10.5, color: '#1A6030',
      fontFace: 'Microsoft YaHei', lineSpacingMultiple: 1.35
    });
  });

  addFooter(s, 8, TOTAL);
}

// ============================================================
// Slide 9 — 核心技术难点（下）
// ============================================================
{
  const s = pptx.addSlide();
  s.background = { color: WHITE };
  addTopBar(s);
  addSectionTitle(s, '05  核心技术难点（续）', '');

  const points2 = [
    {
      num: '04',
      title: '图片管理',
      problem: '问题：菜品图片路径多种来源（云路径/本地路径/外链），小程序无法统一处理',
      solution: '方案：multer 接收上传 → 保存到 /uploads/ 静态目录 → normalizeDish 自动拼接 http://localhost:3000 前缀\n后台支持两种：文件上传 或 粘贴 URL',
      color: '#FFF3E0', border: '#FF9800'
    },
    {
      num: '05',
      title: 'WXML 模板语法限制',
      problem: '问题：{{}} 不支持 .toFixed() / Number() 等方法调用，价格格式化会引发编译报错',
      solution: '方案：所有格式化逻辑（价格保留2位小数、日期格式化）全部在 JS 中预处理\n通过 setData 传入格式化好的字符串，WXML 只做简单展示',
      color: '#F3E5F5', border: '#9C27B0'
    },
    {
      num: '06',
      title: '购物车状态一致性',
      problem: '问题：存在商品时重复加购只增加 quantity，未同步更新 subtotal，导致支付页金额为0',
      solution: '方案：app.js addToCart 中存在商品分支补充 subtotal = price * quantity 计算\n统一用 Number(dish.price) 转换，确保数值类型正确',
      color: '#E8EAF6', border: '#3F51B5'
    },
  ];

  points2.forEach((p, i) => {
    const y = 1.5 + i * 1.7;
    s.addShape(pptx.ShapeType.roundRect, {
      x: 0.5, y, w: 12.2, h: 1.55,
      fill: { color: p.color },
      line: { color: p.border, width: 0.8 },
      rectRadius: 0.1
    });

    s.addText(p.num, {
      x: 0.6, y: y + 0.1, w: 0.7, h: 0.7,
      fontSize: 18, bold: true, color: p.border,
      fontFace: 'Arial', align: 'center'
    });

    s.addText(p.title, {
      x: 1.35, y: y + 0.08, w: 11.1, h: 0.42,
      fontSize: 13.5, bold: true, color: DARK_TEXT,
      fontFace: 'Microsoft YaHei'
    });

    s.addText('❌ ' + p.problem, {
      x: 1.35, y: y + 0.5, w: 11.1, h: 0.38,
      fontSize: 10.5, color: '#B03030',
      fontFace: 'Microsoft YaHei'
    });

    s.addText('✅ ' + p.solution, {
      x: 1.35, y: y + 0.88, w: 11.1, h: 0.55,
      fontSize: 10.5, color: '#1A6030',
      fontFace: 'Microsoft YaHei', lineSpacingMultiple: 1.35
    });
  });

  addFooter(s, 9, TOTAL);
}

// ============================================================
// Slide 10 — 项目成果 & 总结
// ============================================================
{
  const s = pptx.addSlide();
  s.background = { color: WHITE };
  addTopBar(s);
  addSectionTitle(s, '06  项目成果 & 总结', '');

  // 数据亮点卡片
  const stats = [
    { value: '3', unit: '端联调', desc: '小程序 + 后台 + 服务端' },
    { value: '7', unit: '张数据表', desc: '完整业务数据模型' },
    { value: '10+', unit: '个 API', desc: 'RESTful 接口设计' },
    { value: '6', unit: '大技术难点', desc: '全部攻克并落地' },
  ];

  stats.forEach((st, i) => {
    const x = 0.5 + i * 3.1;
    s.addShape(pptx.ShapeType.roundRect, {
      x, y: 1.5, w: 2.85, h: 1.4,
      fill: { color: '#FDF8F3' },
      line: { color: BRAND, width: 0.8 },
      rectRadius: 0.12
    });
    s.addText(st.value, {
      x, y: 1.55, w: 2.85, h: 0.65,
      fontSize: 30, bold: true, color: BRAND,
      fontFace: 'Arial', align: 'center'
    });
    s.addText(st.unit, {
      x, y: 2.2, w: 2.85, h: 0.35,
      fontSize: 12, bold: true, color: DARK_TEXT,
      fontFace: 'Microsoft YaHei', align: 'center'
    });
    s.addText(st.desc, {
      x, y: 2.55, w: 2.85, h: 0.28,
      fontSize: 9.5, color: GRAY,
      fontFace: 'Microsoft YaHei', align: 'center'
    });
  });

  // 主要收获
  s.addText('主要收获', {
    x: 0.5, y: 3.2, w: 5.8, h: 0.4,
    fontSize: 14, bold: true, color: DARK_TEXT,
    fontFace: 'Microsoft YaHei'
  });

  const gains = [
    '掌握微信小程序原生开发（WXML/WXSS/JS）',
    '理解前后端分离架构与 RESTful API 设计规范',
    '实践 Vue 3 + Element Plus 后台管理系统开发',
    '解决多个生产级工程问题（异步可靠性、状态同步等）',
  ];
  gains.forEach((g, i) => {
    s.addShape(pptx.ShapeType.roundRect, {
      x: 0.5, y: 3.65 + i * 0.63, w: 5.8, h: 0.55,
      fill: { color: i % 2 === 0 ? '#FDF8F3' : '#F4F5F7' },
      line: { color: '#E8E0D0', width: 0.4 },
      rectRadius: 0.07
    });
    s.addText(`${i + 1}.  ${g}`, {
      x: 0.65, y: 3.65 + i * 0.63, w: 5.5, h: 0.55,
      fontSize: 11.5, color: DARK_TEXT,
      fontFace: 'Microsoft YaHei', valign: 'middle'
    });
  });

  // 未来展望
  s.addText('未来可扩展', {
    x: 6.8, y: 3.2, w: 5.8, h: 0.4,
    fontSize: 14, bold: true, color: DARK_TEXT,
    fontFace: 'Microsoft YaHei'
  });

  const futures = [
    ['🔐', '对接微信真实支付（生产环境）'],
    ['📡', '接入微信推送通知（订单状态变更）'],
    ['📊', '更丰富的经营分析报表'],
    ['📱', '小程序商家端（实时接单App化）'],
  ];
  futures.forEach((f, i) => {
    const y = 3.65 + i * 0.63;
    s.addShape(pptx.ShapeType.roundRect, {
      x: 6.8, y, w: 5.8, h: 0.55,
      fill: { color: '#F4F8FF' },
      line: { color: '#C0D0E8', width: 0.4 },
      rectRadius: 0.07
    });
    s.addText(f[0], {
      x: 6.9, y, w: 0.45, h: 0.55,
      fontSize: 14, align: 'center', valign: 'middle'
    });
    s.addText(f[1], {
      x: 7.4, y, w: 5.0, h: 0.55,
      fontSize: 11.5, color: DARK_TEXT,
      fontFace: 'Microsoft YaHei', valign: 'middle'
    });
  });

  addFooter(s, 10, TOTAL);
}

// ============================================================
// Slide 11 — 结束页
// ============================================================
{
  const s = pptx.addSlide();
  s.background = { color: '#2B1A0E' };

  // 装饰
  s.addShape(pptx.ShapeType.ellipse, {
    x: 9.5, y: -0.5, w: 4.5, h: 4.5,
    fill: { color: BRAND, transparency: 78 },
    line: { width: 0 }
  });
  s.addShape(pptx.ShapeType.ellipse, {
    x: -1.0, y: 4.5, w: 3.5, h: 3.5,
    fill: { color: DARK, transparency: 80 },
    line: { width: 0 }
  });

  s.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: '100%', h: 0.06,
    fill: { color: BRAND }
  });

  s.addText('感谢观看', {
    x: 1, y: 1.8, w: 11, h: 1.0,
    fontSize: 46, bold: true, color: WHITE,
    fontFace: 'Microsoft YaHei', align: 'center'
  });

  s.addShape(pptx.ShapeType.line, {
    x: 4.5, y: 3.0, w: 4, h: 0,
    line: { color: BRAND, width: 1 }
  });

  s.addText('微信小程序点餐系统  ·  开发实训汇报', {
    x: 1, y: 3.2, w: 11, h: 0.45,
    fontSize: 14, color: '#CCBBAA',
    fontFace: 'Microsoft YaHei', align: 'center'
  });

  s.addText('欢迎提问与交流', {
    x: 1, y: 3.85, w: 11, h: 0.4,
    fontSize: 13, color: BRAND,
    fontFace: 'Microsoft YaHei', align: 'center'
  });

  // 技术栈标签行
  const tags = ['微信小程序', 'Vue 3', 'Node.js', 'MySQL', 'Element Plus', 'ECharts'];
  const startX = (13 - tags.length * 1.8) / 2;
  tags.forEach((tag, i) => {
    s.addShape(pptx.ShapeType.roundRect, {
      x: startX + i * 1.85, y: 5.1, w: 1.7, h: 0.38,
      fill: { color: '#3D2512' },
      line: { color: BRAND, width: 0.5 },
      rectRadius: 0.07
    });
    s.addText(tag, {
      x: startX + i * 1.85, y: 5.1, w: 1.7, h: 0.38,
      fontSize: 9.5, color: BRAND,
      fontFace: 'Microsoft YaHei', align: 'center', valign: 'middle'
    });
  });

  addFooter(s, 11, TOTAL);
}

// ===== 写出文件 =====
const outPath = 'F:/diancangxitong/点餐系统汇报.pptx';
pptx.writeFile({ fileName: outPath })
  .then(() => console.log('✅ PPT 生成成功：' + outPath))
  .catch(e => console.error('❌ 生成失败：', e));
