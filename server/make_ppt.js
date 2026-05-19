/**
 * 微信小程序点餐系统 - 演示汇报 PPT 生成脚本
 */
const PptxGenJS = require('pptxgenjs');
const path = require('path');

const pres = new PptxGenJS();
pres.layout = 'LAYOUT_16x9';
pres.title = '微信小程序点餐系统演示汇报';

// ===== 颜色常量 =====
const C = {
  primary:   'C68D56',   // 暖橙主色
  dark:      '3B2A1A',   // 深棕背景
  darkCard:  '4A3523',   // 深棕卡片
  accent:    'F2C177',   // 亮橙强调
  white:     'FFFFFF',
  offWhite:  'FAF6F0',
  gray:      '8C7B6A',
  lightGray: 'EDE8E0',
  green:     '4CAF87',
  blue:      '4A90D9',
  red:       'E05C5C',
};

const makeShadow = () => ({ type: 'outer', color: '000000', blur: 12, offset: 4, angle: 135, opacity: 0.18 });

// ================================================================
// 幻灯片 1 — 封面
// ================================================================
{
  const s = pres.addSlide();
  s.background = { color: C.dark };

  // 左侧暖橙竖条装饰
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.35, h: 5.625, fill: { color: C.primary } });

  // 右侧半透明卡片背景
  s.addShape(pres.shapes.RECTANGLE, {
    x: 5.5, y: 0.5, w: 4.2, h: 4.6,
    fill: { color: C.darkCard }, line: { color: C.primary, width: 1.5 },
    shadow: makeShadow()
  });

  // 主标题
  s.addText('微信小程序', {
    x: 0.6, y: 0.9, w: 4.6, h: 0.8,
    fontSize: 36, bold: true, color: C.accent, fontFace: 'Microsoft YaHei',
    margin: 0
  });
  s.addText('点餐系统', {
    x: 0.6, y: 1.7, w: 4.6, h: 1.0,
    fontSize: 52, bold: true, color: C.white, fontFace: 'Microsoft YaHei',
    margin: 0
  });

  // 副标题标签
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.6, y: 2.85, w: 2.5, h: 0.42,
    fill: { color: C.primary }
  });
  s.addText('开发实训作业汇报', {
    x: 0.6, y: 2.85, w: 2.5, h: 0.42,
    fontSize: 14, color: C.white, align: 'center', valign: 'middle',
    fontFace: 'Microsoft YaHei', margin: 0
  });

  // 右侧卡片内容
  const features = [
    { icon: '🛒', text: '用户扫码点餐' },
    { icon: '💳', text: '在线支付结算' },
    { icon: '🔔', text: '商家实时接单' },
    { icon: '↩', text: '退款申请处理' },
    { icon: '📊', text: '后台统计管理' },
  ];
  features.forEach((f, i) => {
    s.addText(`${f.icon}  ${f.text}`, {
      x: 5.7, y: 0.9 + i * 0.72, w: 3.8, h: 0.55,
      fontSize: 15, color: C.white, fontFace: 'Microsoft YaHei',
      margin: 0
    });
  });

  // 底部信息
  s.addText('基于微信云开发（CloudBase） · Node.js + MySQL · Vue 3 后台', {
    x: 0.6, y: 5.0, w: 8.8, h: 0.4,
    fontSize: 11, color: C.gray, fontFace: 'Microsoft YaHei', margin: 0
  });
}

// ================================================================
// 幻灯片 2 — 目录
// ================================================================
{
  const s = pres.addSlide();
  s.background = { color: C.offWhite };

  // 顶部标题栏
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.05, fill: { color: C.dark } });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 1.05, w: 10, h: 0.06, fill: { color: C.primary } });
  s.addText('演讲大纲', {
    x: 0.5, y: 0, w: 9, h: 1.05,
    fontSize: 30, bold: true, color: C.white, valign: 'middle',
    fontFace: 'Microsoft YaHei', margin: 0
  });

  const items = [
    { num: '01', title: '项目背景与目标', desc: '为什么做这个系统？解决什么问题？' },
    { num: '02', title: '系统架构设计',   desc: '技术选型、整体架构一张图看懂' },
    { num: '03', title: '核心功能演示',   desc: '用户点餐、支付、退款全流程' },
    { num: '04', title: '后台管理系统',   desc: '商家端接单、统计、菜品管理' },
    { num: '05', title: '重点难点解析',   desc: '云开发、退款流程等技术亮点' },
    { num: '06', title: '总结与收获',     desc: '个人成长、待改进方向' },
  ];

  items.forEach((item, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.4 + col * 4.85;
    const y = 1.35 + row * 1.35;

    s.addShape(pres.shapes.RECTANGLE, {
      x, y, w: 4.5, h: 1.1,
      fill: { color: C.white },
      shadow: makeShadow()
    });
    // 左侧数字块
    s.addShape(pres.shapes.RECTANGLE, {
      x, y, w: 0.7, h: 1.1,
      fill: { color: C.primary }
    });
    s.addText(item.num, {
      x, y, w: 0.7, h: 1.1,
      fontSize: 18, bold: true, color: C.white,
      align: 'center', valign: 'middle', fontFace: 'Microsoft YaHei', margin: 0
    });
    s.addText(item.title, {
      x: x + 0.8, y: y + 0.08, w: 3.6, h: 0.42,
      fontSize: 15, bold: true, color: C.dark,
      fontFace: 'Microsoft YaHei', margin: 0
    });
    s.addText(item.desc, {
      x: x + 0.8, y: y + 0.55, w: 3.6, h: 0.4,
      fontSize: 11, color: C.gray,
      fontFace: 'Microsoft YaHei', margin: 0
    });
  });
}

// ================================================================
// 幻灯片 3 — 项目背景
// ================================================================
{
  const s = pres.addSlide();
  s.background = { color: C.offWhite };

  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.05, fill: { color: C.dark } });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 1.05, w: 10, h: 0.06, fill: { color: C.primary } });
  s.addText('01  项目背景与目标', {
    x: 0.5, y: 0, w: 9, h: 1.05,
    fontSize: 26, bold: true, color: C.white, valign: 'middle',
    fontFace: 'Microsoft YaHei', margin: 0
  });

  // 左侧：痛点
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.35, y: 1.3, w: 4.3, h: 3.8,
    fill: { color: C.white }, shadow: makeShadow()
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.35, y: 1.3, w: 4.3, h: 0.5,
    fill: { color: C.red }
  });
  s.addText('❌  传统点餐的痛点', {
    x: 0.35, y: 1.3, w: 4.3, h: 0.5,
    fontSize: 14, bold: true, color: C.white,
    align: 'center', valign: 'middle', fontFace: 'Microsoft YaHei', margin: 0
  });

  const pains = [
    '排队叫号，高峰期效率低',
    '手写菜单容易出错、漏单',
    '结账慢，顾客等待体验差',
    '老板无法实时掌握销售数据',
    '菜品上下架更新麻烦',
  ];
  pains.forEach((p, i) => {
    s.addText(`• ${p}`, {
      x: 0.55, y: 2.0 + i * 0.54, w: 3.9, h: 0.45,
      fontSize: 13, color: C.dark, fontFace: 'Microsoft YaHei', margin: 0
    });
  });

  // 右侧：方案
  s.addShape(pres.shapes.RECTANGLE, {
    x: 5.35, y: 1.3, w: 4.3, h: 3.8,
    fill: { color: C.white }, shadow: makeShadow()
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 5.35, y: 1.3, w: 4.3, h: 0.5,
    fill: { color: C.green }
  });
  s.addText('✅  我们的解决方案', {
    x: 5.35, y: 1.3, w: 4.3, h: 0.5,
    fontSize: 14, bold: true, color: C.white,
    align: 'center', valign: 'middle', fontFace: 'Microsoft YaHei', margin: 0
  });

  const solutions = [
    '扫二维码即可点餐，无需排队',
    '订单数字化，自动推送给厨房',
    '微信在线支付，一键结账',
    '商家后台实时查看订单与收入',
    '菜品管理系统，随时更新',
  ];
  solutions.forEach((sol, i) => {
    s.addText(`• ${sol}`, {
      x: 5.55, y: 2.0 + i * 0.54, w: 3.9, h: 0.45,
      fontSize: 13, color: C.dark, fontFace: 'Microsoft YaHei', margin: 0
    });
  });
}

// ================================================================
// 幻灯片 4 — 系统架构
// ================================================================
{
  const s = pres.addSlide();
  s.background = { color: C.dark };

  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.0, fill: { color: C.darkCard } });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 1.0, w: 10, h: 0.06, fill: { color: C.primary } });
  s.addText('02  系统架构设计', {
    x: 0.5, y: 0, w: 9, h: 1.0,
    fontSize: 26, bold: true, color: C.white, valign: 'middle',
    fontFace: 'Microsoft YaHei', margin: 0
  });

  // 三列架构图
  const layers = [
    {
      title: '前端 — 用户小程序',
      color: C.blue,
      items: ['首页 / 菜品浏览', '购物车 / 下单', '在线支付', '订单查询 / 退款'],
      icon: '📱'
    },
    {
      title: '后端 — 服务层',
      color: C.primary,
      items: ['Node.js + Express', 'REST API 接口', '订单 / 菜品 / 退款', '微信支付对接'],
      icon: '⚙️'
    },
    {
      title: '前端 — 商家后台',
      color: C.green,
      items: ['Vue 3 + Element Plus', '订单实时管理', '菜品上架 / 下架', '营业数据统计'],
      icon: '🖥️'
    },
  ];

  layers.forEach((layer, i) => {
    const x = 0.4 + i * 3.1;
    s.addShape(pres.shapes.RECTANGLE, {
      x, y: 1.25, w: 2.9, h: 3.9,
      fill: { color: C.darkCard }, shadow: makeShadow()
    });
    s.addShape(pres.shapes.RECTANGLE, {
      x, y: 1.25, w: 2.9, h: 0.6,
      fill: { color: layer.color }
    });
    s.addText(`${layer.icon}  ${layer.title}`, {
      x, y: 1.25, w: 2.9, h: 0.6,
      fontSize: 12, bold: true, color: C.white,
      align: 'center', valign: 'middle', fontFace: 'Microsoft YaHei', margin: 0
    });
    layer.items.forEach((item, j) => {
      s.addShape(pres.shapes.RECTANGLE, {
        x: x + 0.15, y: 2.1 + j * 0.72, w: 2.6, h: 0.55,
        fill: { color: '33281E' }
      });
      s.addText(item, {
        x: x + 0.15, y: 2.1 + j * 0.72, w: 2.6, h: 0.55,
        fontSize: 12, color: C.offWhite,
        align: 'center', valign: 'middle', fontFace: 'Microsoft YaHei', margin: 0
      });
    });

    // 箭头（列之间）
    if (i < 2) {
      s.addShape(pres.shapes.RECTANGLE, {
        x: x + 2.9, y: 3.1, w: 0.2, h: 0.06,
        fill: { color: C.primary }
      });
      s.addText('⇄', {
        x: x + 2.92, y: 2.8, w: 0.22, h: 0.5,
        fontSize: 20, color: C.primary, align: 'center', valign: 'middle', margin: 0
      });
    }
  });

  // 数据库
  s.addShape(pres.shapes.RECTANGLE, {
    x: 3.5, y: 5.1, w: 3.0, h: 0.36,
    fill: { color: C.primary }, shadow: makeShadow()
  });
  s.addText('🗄️  MySQL 数据库（orders / dishes / users）', {
    x: 3.5, y: 5.1, w: 3.0, h: 0.36,
    fontSize: 10, color: C.white, align: 'center', valign: 'middle',
    fontFace: 'Microsoft YaHei', margin: 0
  });
}

// ================================================================
// 幻灯片 5 — 用户点餐流程
// ================================================================
{
  const s = pres.addSlide();
  s.background = { color: C.offWhite };

  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.05, fill: { color: C.dark } });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 1.05, w: 10, h: 0.06, fill: { color: C.primary } });
  s.addText('03  用户点餐全流程', {
    x: 0.5, y: 0, w: 9, h: 1.05,
    fontSize: 26, bold: true, color: C.white, valign: 'middle',
    fontFace: 'Microsoft YaHei', margin: 0
  });

  const steps = [
    { icon: '📷', step: '01', title: '扫码进入', desc: '扫桌贴二维码\n打开小程序' },
    { icon: '🍜', step: '02', title: '浏览菜品', desc: '分类展示菜单\n查看详情图片' },
    { icon: '🛒', step: '03', title: '加入购物车', desc: '选择数量\n备注特殊要求' },
    { icon: '💳', step: '04', title: '提交支付', desc: '确认订单\n微信支付' },
    { icon: '🔔', step: '05', title: '商家接单', desc: '实时推送通知\n开始制作' },
    { icon: '✅', step: '06', title: '取餐完成', desc: '订单状态更新\n历史可查询' },
  ];

  steps.forEach((step, i) => {
    const x = 0.3 + i * 1.58;
    s.addShape(pres.shapes.OVAL, {
      x: x + 0.42, y: 1.35, w: 0.75, h: 0.75,
      fill: { color: C.primary }
    });
    s.addText(step.icon, {
      x: x + 0.42, y: 1.35, w: 0.75, h: 0.75,
      fontSize: 22, align: 'center', valign: 'middle', margin: 0
    });

    s.addShape(pres.shapes.RECTANGLE, {
      x: x + 0.08, y: 2.3, w: 1.42, h: 2.9,
      fill: { color: C.white }, shadow: makeShadow()
    });
    s.addShape(pres.shapes.RECTANGLE, {
      x: x + 0.08, y: 2.3, w: 1.42, h: 0.4,
      fill: { color: C.dark }
    });
    s.addText(`STEP ${step.step}`, {
      x: x + 0.08, y: 2.3, w: 1.42, h: 0.4,
      fontSize: 10, bold: true, color: C.accent,
      align: 'center', valign: 'middle', fontFace: 'Microsoft YaHei', margin: 0
    });
    s.addText(step.title, {
      x: x + 0.08, y: 2.78, w: 1.42, h: 0.45,
      fontSize: 13, bold: true, color: C.dark,
      align: 'center', valign: 'middle', fontFace: 'Microsoft YaHei', margin: 0
    });
    s.addText(step.desc, {
      x: x + 0.08, y: 3.28, w: 1.42, h: 1.8,
      fontSize: 11, color: C.gray, align: 'center',
      fontFace: 'Microsoft YaHei', margin: 0
    });

    // 连接箭头
    if (i < 5) {
      s.addText('→', {
        x: x + 1.42, y: 1.45, w: 0.26, h: 0.55,
        fontSize: 18, color: C.primary, align: 'center', valign: 'middle', margin: 0
      });
    }
  });
}

// ================================================================
// 幻灯片 6 — 退款流程
// ================================================================
{
  const s = pres.addSlide();
  s.background = { color: C.offWhite };

  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.05, fill: { color: C.dark } });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 1.05, w: 10, h: 0.06, fill: { color: C.primary } });
  s.addText('03  退款申请处理流程', {
    x: 0.5, y: 0, w: 9, h: 1.05,
    fontSize: 26, bold: true, color: C.white, valign: 'middle',
    fontFace: 'Microsoft YaHei', margin: 0
  });

  // 用户侧
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.3, y: 1.25, w: 4.1, h: 3.9,
    fill: { color: C.white }, shadow: makeShadow()
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.3, y: 1.25, w: 4.1, h: 0.5,
    fill: { color: C.blue }
  });
  s.addText('📱  用户侧操作', {
    x: 0.3, y: 1.25, w: 4.1, h: 0.5,
    fontSize: 14, bold: true, color: C.white,
    align: 'center', valign: 'middle', fontFace: 'Microsoft YaHei', margin: 0
  });

  const userSteps = [
    '① 进入"我的订单"→ 退款 Tab',
    '② 找到已支付的订单',
    '③ 点击「申请退款」',
    '④ 状态变为"退款申请中"',
    '⑤ 等待商家处理',
    '⑥ 下拉刷新查看结果',
  ];
  userSteps.forEach((st, i) => {
    s.addText(st, {
      x: 0.5, y: 1.95 + i * 0.52, w: 3.7, h: 0.44,
      fontSize: 13, color: C.dark, fontFace: 'Microsoft YaHei', margin: 0
    });
  });

  // 中间箭头
  s.addText('⇄', {
    x: 4.5, y: 3.0, w: 1.0, h: 0.8,
    fontSize: 36, color: C.primary, align: 'center', valign: 'middle', margin: 0
  });
  s.addText('实时\n数据库\n同步', {
    x: 4.5, y: 3.8, w: 1.0, h: 0.9,
    fontSize: 10, color: C.gray, align: 'center', fontFace: 'Microsoft YaHei', margin: 0
  });

  // 商家侧
  s.addShape(pres.shapes.RECTANGLE, {
    x: 5.6, y: 1.25, w: 4.1, h: 3.9,
    fill: { color: C.white }, shadow: makeShadow()
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 5.6, y: 1.25, w: 4.1, h: 0.5,
    fill: { color: C.primary }
  });
  s.addText('🖥️  商家后台操作', {
    x: 5.6, y: 1.25, w: 4.1, h: 0.5,
    fontSize: 14, bold: true, color: C.white,
    align: 'center', valign: 'middle', fontFace: 'Microsoft YaHei', margin: 0
  });

  const merchantSteps = [
    '① 打开订单管理后台',
    '② 退款申请中 → 显示红色标签',
    '③ 点击「✅ 同意退款」\n    或「❌ 拒绝退款」',
    '④ 订单状态自动更新为已退款',
    '⑤ 用户刷新后即可看到结果',
  ];
  merchantSteps.forEach((st, i) => {
    s.addText(st, {
      x: 5.8, y: 1.95 + i * 0.68, w: 3.7, h: 0.6,
      fontSize: 13, color: C.dark, fontFace: 'Microsoft YaHei', margin: 0
    });
  });
}

// ================================================================
// 幻灯片 7 — 后台管理系统
// ================================================================
{
  const s = pres.addSlide();
  s.background = { color: C.offWhite };

  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.05, fill: { color: C.dark } });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 1.05, w: 10, h: 0.06, fill: { color: C.primary } });
  s.addText('04  商家后台管理系统', {
    x: 0.5, y: 0, w: 9, h: 1.05,
    fontSize: 26, bold: true, color: C.white, valign: 'middle',
    fontFace: 'Microsoft YaHei', margin: 0
  });

  const modules = [
    { icon: '📋', title: '订单管理', color: C.primary,
      descs: ['实时查看所有订单', '按状态筛选过滤', '一键接单/完成/退款', '订单详情弹窗'] },
    { icon: '🍽️', title: '菜品管理', color: C.blue,
      descs: ['菜品列表 CRUD', '图片上传展示', '分类 / 价格 / 库存', '上架 / 下架切换'] },
    { icon: '📊', title: '数据统计', color: C.green,
      descs: ['今日营收概览', 'ECharts 销售图表', '热门菜品 TOP 排行', '订单量趋势分析'] },
    { icon: '⚙️', title: '系统设置', color: C.gray,
      descs: ['餐厅信息配置', 'API 密钥管理', '管理员账号设置', '演示/真实数据切换'] },
  ];

  modules.forEach((mod, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.35 + col * 4.85;
    const y = 1.28 + row * 2.05;

    s.addShape(pres.shapes.RECTANGLE, {
      x, y, w: 4.55, h: 1.85,
      fill: { color: C.white }, shadow: makeShadow()
    });
    s.addShape(pres.shapes.RECTANGLE, {
      x, y, w: 4.55, h: 0.48,
      fill: { color: mod.color }
    });
    s.addText(`${mod.icon}  ${mod.title}`, {
      x, y, w: 4.55, h: 0.48,
      fontSize: 15, bold: true, color: C.white,
      align: 'center', valign: 'middle', fontFace: 'Microsoft YaHei', margin: 0
    });

    mod.descs.forEach((d, j) => {
      const col2 = j % 2;
      const row2 = Math.floor(j / 2);
      s.addText(`✦ ${d}`, {
        x: x + 0.15 + col2 * 2.2, y: y + 0.6 + row2 * 0.55, w: 2.1, h: 0.45,
        fontSize: 11, color: C.dark, fontFace: 'Microsoft YaHei', margin: 0
      });
    });
  });
}

// ================================================================
// 幻灯片 8 — 技术亮点
// ================================================================
{
  const s = pres.addSlide();
  s.background = { color: C.dark };

  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.05, fill: { color: C.darkCard } });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 1.05, w: 10, h: 0.06, fill: { color: C.primary } });
  s.addText('05  重点难点 & 技术亮点', {
    x: 0.5, y: 0, w: 9, h: 1.05,
    fontSize: 26, bold: true, color: C.white, valign: 'middle',
    fontFace: 'Microsoft YaHei', margin: 0
  });

  const highlights = [
    {
      icon: '☁️', title: '微信云开发',
      body: '无需自建服务器，直接使用 CloudBase 云数据库。开发成本低，部署简单，适合实训项目快速上线。'
    },
    {
      icon: '🔄', title: '退款状态机',
      body: '设计了 pending → accepted → completed / refunding → refund_done 的完整状态流转，商家可同意或拒绝退款，两端实时同步。'
    },
    {
      icon: '🔗', title: '前后端分离',
      body: '小程序 + Vue3 后台分别对接同一套 REST API（Node.js + Express），结构清晰，便于维护和扩展。'
    },
    {
      icon: '📱', title: 'UI 现代化设计',
      body: '自定义暖橙色设计规范，渐变卡片、底部导航、分层圆角，与主流点餐 App 视觉风格对齐。'
    },
  ];

  highlights.forEach((h, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.35 + col * 4.85;
    const y = 1.28 + row * 2.05;

    s.addShape(pres.shapes.RECTANGLE, {
      x, y, w: 4.55, h: 1.85,
      fill: { color: C.darkCard }, shadow: makeShadow()
    });
    s.addShape(pres.shapes.RECTANGLE, {
      x, y, w: 0.65, h: 1.85,
      fill: { color: C.primary }
    });
    s.addText(h.icon, {
      x, y: y + 0.6, w: 0.65, h: 0.65,
      fontSize: 26, align: 'center', valign: 'middle', margin: 0
    });
    s.addText(h.title, {
      x: x + 0.75, y: y + 0.2, w: 3.65, h: 0.42,
      fontSize: 15, bold: true, color: C.accent,
      fontFace: 'Microsoft YaHei', margin: 0
    });
    s.addText(h.body, {
      x: x + 0.75, y: y + 0.65, w: 3.65, h: 1.08,
      fontSize: 11.5, color: C.offWhite,
      fontFace: 'Microsoft YaHei', margin: 0
    });
  });
}

// ================================================================
// 幻灯片 9 — 总结与收获
// ================================================================
{
  const s = pres.addSlide();
  s.background = { color: C.offWhite };

  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.05, fill: { color: C.dark } });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 1.05, w: 10, h: 0.06, fill: { color: C.primary } });
  s.addText('06  总结与收获', {
    x: 0.5, y: 0, w: 9, h: 1.05,
    fontSize: 26, bold: true, color: C.white, valign: 'middle',
    fontFace: 'Microsoft YaHei', margin: 0
  });

  // 左：功能清单
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.35, y: 1.28, w: 4.5, h: 3.9,
    fill: { color: C.white }, shadow: makeShadow()
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.35, y: 1.28, w: 4.5, h: 0.5,
    fill: { color: C.primary }
  });
  s.addText('🎯  已完成功能清单', {
    x: 0.35, y: 1.28, w: 4.5, h: 0.5,
    fontSize: 14, bold: true, color: C.white,
    align: 'center', valign: 'middle', fontFace: 'Microsoft YaHei', margin: 0
  });

  const done = [
    '✅ 用户扫码点餐 & 购物车',
    '✅ 微信支付 & 订单管理',
    '✅ 退款申请 & 商家处理',
    '✅ 商家后台 Vue3 订单管理',
    '✅ 菜品 CRUD & 分类管理',
    '✅ ECharts 数据统计图表',
    '✅ 完整状态机 & 数据同步',
  ];
  done.forEach((d, i) => {
    s.addText(d, {
      x: 0.55, y: 2.0 + i * 0.48, w: 4.1, h: 0.4,
      fontSize: 13, color: C.dark, fontFace: 'Microsoft YaHei', margin: 0
    });
  });

  // 右：收获
  s.addShape(pres.shapes.RECTANGLE, {
    x: 5.2, y: 1.28, w: 4.45, h: 3.9,
    fill: { color: C.white }, shadow: makeShadow()
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 5.2, y: 1.28, w: 4.45, h: 0.5,
    fill: { color: C.green }
  });
  s.addText('💡  个人收获 & 未来改进', {
    x: 5.2, y: 1.28, w: 4.45, h: 0.5,
    fontSize: 14, bold: true, color: C.white,
    align: 'center', valign: 'middle', fontFace: 'Microsoft YaHei', margin: 0
  });

  const gains = [
    ['个人收获', C.green, [
      '掌握前后端分离开发模式',
      '理解 RESTful API 设计规范',
      '熟悉微信小程序生命周期',
    ]],
    ['待改进', C.gray, [
      '加入实时推送（WebSocket）',
      '完善支付宝 / 微信退款接口',
      '移动端后台 App 版本',
    ]],
  ];
  let yOffset = 2.0;
  gains.forEach(([label, color, items]) => {
    s.addShape(pres.shapes.RECTANGLE, {
      x: 5.3, y: yOffset - 0.05, w: 0.08, h: items.length * 0.46 + 0.1,
      fill: { color }
    });
    s.addText(label, {
      x: 5.5, y: yOffset - 0.05, w: 3.8, h: 0.36,
      fontSize: 12, bold: true, color, fontFace: 'Microsoft YaHei', margin: 0
    });
    items.forEach((item, j) => {
      s.addText(`• ${item}`, {
        x: 5.5, y: yOffset + 0.35 + j * 0.46, w: 3.9, h: 0.4,
        fontSize: 12, color: C.dark, fontFace: 'Microsoft YaHei', margin: 0
      });
    });
    yOffset += 0.4 + items.length * 0.46 + 0.3;
  });
}

// ================================================================
// 幻灯片 10 — 结尾页
// ================================================================
{
  const s = pres.addSlide();
  s.background = { color: C.dark };

  // 装饰条
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.18, fill: { color: C.primary } });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.44, w: 10, h: 0.18, fill: { color: C.primary } });

  // 中心区域卡片
  s.addShape(pres.shapes.RECTANGLE, {
    x: 2.0, y: 1.1, w: 6.0, h: 3.4,
    fill: { color: C.darkCard }, shadow: makeShadow()
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 2.0, y: 1.1, w: 6.0, h: 0.08,
    fill: { color: C.primary }
  });

  s.addText('🙏', {
    x: 3.5, y: 1.4, w: 3.0, h: 0.8,
    fontSize: 42, align: 'center', valign: 'middle', margin: 0
  });

  s.addText('感谢聆听', {
    x: 2.5, y: 2.25, w: 5.0, h: 0.8,
    fontSize: 44, bold: true, color: C.white,
    align: 'center', fontFace: 'Microsoft YaHei', margin: 0
  });

  s.addText('欢迎提问 & 交流', {
    x: 2.5, y: 3.1, w: 5.0, h: 0.5,
    fontSize: 18, color: C.accent,
    align: 'center', fontFace: 'Microsoft YaHei', margin: 0
  });

  s.addText('微信小程序点餐系统 · 开发实训作业汇报', {
    x: 2.5, y: 3.75, w: 5.0, h: 0.4,
    fontSize: 12, color: C.gray,
    align: 'center', fontFace: 'Microsoft YaHei', margin: 0
  });
}

// ================================================================
// 输出文件
// ================================================================
const outPath = path.join('F:\\', '点餐系统演示汇报.pptx');
pres.writeFile({ fileName: outPath })
  .then(() => console.log('✅ PPT 已生成：' + outPath))
  .catch(e => { console.error('❌ 生成失败:', e.message); process.exit(1); });
