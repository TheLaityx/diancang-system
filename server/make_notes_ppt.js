/**
 * 手机端讲稿 PPT 生成脚本
 * 竖屏 9:16，字体大，每页对应一张汇报PPT，告诉你说什么
 */
const PptxGenJS = require('pptxgenjs');
const pptx = new PptxGenJS();

// 竖屏 9:16 (单位 inches)
pptx.layout = 'LAYOUT_4x3'; // 先用默认，再手动设定宽高
pptx.defineLayout({ name: 'PHONE', width: 5.4, height: 9.6 });
pptx.layout = 'PHONE';

// ===== 颜色 =====
const BG       = 'F4F5F7';
const ACCENT   = 'C68D56';  // 暖橙
const DARK     = '2C1810';
const WHITE    = 'FFFFFF';
const GRAY     = '888899';
const TAG_BG   = 'FFF0E0';
const TAG_TXT  = 'A97240';
const TIP_BG   = 'E8F4E8';
const TIP_TXT  = '2D7D2D';

// ===== 工具函数 =====
function addBg(slide) {
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: '100%', fill: { color: BG } });
}

function addHeader(slide, pageNum, totalPages, title) {
  // 顶部橙色条
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.55, fill: { color: ACCENT } });
  // 页码
  slide.addText(`${pageNum} / ${totalPages}`, {
    x: 0.2, y: 0.07, w: 1.2, h: 0.38,
    fontSize: 14, color: WHITE, bold: true
  });
  // 标题
  slide.addText(title, {
    x: 1.5, y: 0.07, w: 3.7, h: 0.38,
    fontSize: 15, color: WHITE, bold: true, align: 'right'
  });
}

function addTag(slide, text, x, y) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w: 1.6, h: 0.35,
    fill: { color: TAG_BG }, line: { color: ACCENT, width: 1 }, rectRadius: 0.08
  });
  slide.addText(text, { x, y, w: 1.6, h: 0.35, fontSize: 13, color: TAG_TXT, bold: true, align: 'center' });
}

function addTip(slide, text, y) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.2, y, w: 5.0, h: 0.46,
    fill: { color: TIP_BG }, line: { color: '90C890', width: 1 }, rectRadius: 0.1
  });
  slide.addText('💡 ' + text, {
    x: 0.3, y: y + 0.02, w: 4.8, h: 0.42,
    fontSize: 14, color: TIP_TXT, bold: false
  });
}

function addSpeech(slide, lines, startY) {
  // 说话气泡区
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.2, y: startY, w: 5.0, h: lines.length * 0.56 + 0.3,
    fill: { color: WHITE }, line: { color: ACCENT, width: 1.5 }, rectRadius: 0.14
  });
  slide.addText('💬 你说：', {
    x: 0.38, y: startY + 0.06, w: 2, h: 0.35,
    fontSize: 13, color: ACCENT, bold: true
  });
  lines.forEach((line, i) => {
    slide.addText(line, {
      x: 0.35, y: startY + 0.42 + i * 0.56, w: 4.7, h: 0.52,
      fontSize: 17, color: DARK, bold: false, wrap: true
    });
  });
}

const TOTAL = 14; // 总页数

// ===========================
// 第1页：使用说明
// ===========================
{
  const s = pptx.addSlide();
  addBg(s);
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: '100%', fill: { color: ACCENT } });
  s.addText('📱 手机讲稿', {
    x: 0.3, y: 1.2, w: 4.8, h: 0.9,
    fontSize: 38, color: WHITE, bold: true, align: 'center'
  });
  s.addText('点餐系统演示汇报', {
    x: 0.3, y: 2.2, w: 4.8, h: 0.6,
    fontSize: 22, color: WHITE, align: 'center'
  });
  // 卡片说明
  const cards = [
    ['📊', '右边电脑', '放汇报PPT'],
    ['📱', '左手手机', '看这份讲稿'],
    ['👀', '看手机', '不看PPT念'],
    ['😊', '放松说', '用自己话'],
  ];
  cards.forEach((c, i) => {
    const row = Math.floor(i / 2);
    const col = i % 2;
    const x = col === 0 ? 0.2 : 2.85;
    const y = 3.3 + row * 1.4;
    s.addShape(pptx.ShapeType.roundRect, {
      x, y, w: 2.35, h: 1.2,
      fill: { color: 'A97240', transparency: 20 }, line: { color: WHITE, width: 1 }, rectRadius: 0.14
    });
    s.addText(c[0], { x, y: y + 0.1, w: 2.35, h: 0.45, fontSize: 26, align: 'center' });
    s.addText(c[1], { x, y: y + 0.5, w: 2.35, h: 0.3, fontSize: 14, color: WHITE, bold: true, align: 'center' });
    s.addText(c[2], { x, y: y + 0.78, w: 2.35, h: 0.3, fontSize: 13, color: 'FFE4C0', align: 'center' });
  });
  s.addText('📌 每页对应一张汇报PPT，跟着翻就行', {
    x: 0.2, y: 6.4, w: 5.0, h: 0.5,
    fontSize: 14, color: 'FFE4C0', align: 'center'
  });
  s.addText('⏱ 总时长约 10~12 分钟', {
    x: 0.2, y: 6.95, w: 5.0, h: 0.5,
    fontSize: 15, color: WHITE, bold: true, align: 'center'
  });
}

// ===========================
// 第2页：汇报PPT第1页 - 封面
// ===========================
{
  const s = pptx.addSlide();
  addBg(s);
  addHeader(s, 1, 10, '汇报PPT：封面');
  addTag(s, '⏱ 约20秒', 0.2, 0.7);
  addTag(s, '翻页即可', 3.6, 0.7);

  s.addText('开场怎么说：', {
    x: 0.2, y: 1.25, w: 5.0, h: 0.4,
    fontSize: 16, color: ACCENT, bold: true
  });

  addSpeech(s, [
    '"大家好，我今天要汇报',
    '的是我做的微信小程序',
    '点餐系统。"',
    '"系统包括用户点餐小程',
    '序和商家管理后台，用',
    '的是云开发+Vue3。"',
    '"大概用10分钟给大家',
    '介绍一下。"',
  ], 1.7);

  addTip(s, '说完就翻页，不用介绍名字（除非老师要求）', 8.7);
}

// ===========================
// 第3页：汇报PPT第2页 - 目录
// ===========================
{
  const s = pptx.addSlide();
  addBg(s);
  addHeader(s, 2, 10, '汇报PPT：目录');
  addTag(s, '⏱ 约30秒', 0.2, 0.7);

  s.addText('怎么说：', {
    x: 0.2, y: 1.25, w: 5.0, h: 0.4,
    fontSize: 16, color: ACCENT, bold: true
  });

  addSpeech(s, [
    '"汇报分六部分：',
    '项目背景、系统架构、',
    '核心功能演示、后台',
    '管理、技术亮点、',
    '最后做个总结。"',
  ], 1.7);

  s.addText('👆 扫一遍PPT，不用逐项解释', {
    x: 0.2, y: 5.2, w: 5.0, h: 0.45,
    fontSize: 15, color: GRAY, align: 'center'
  });

  addTip(s, '保持节奏感，10秒以内翻页', 5.8);
}

// ===========================
// 第4页：汇报PPT第3页 - 项目背景
// ===========================
{
  const s = pptx.addSlide();
  addBg(s);
  addHeader(s, 3, 10, '汇报PPT：项目背景');
  addTag(s, '⏱ 约1.5分钟', 0.2, 0.7);

  s.addText('指左侧红卡片：', { x: 0.2, y: 1.25, w: 5.0, h: 0.38, fontSize: 15, color: ACCENT, bold: true });
  addSpeech(s, [
    '"传统餐厅点餐有几个',
    '痛点：排队慢、菜单',
    '容易出错、结账麻烦，',
    '老板也看不到数据。"',
  ], 1.7);

  s.addText('指右侧绿卡片：', { x: 0.2, y: 4.25, w: 5.0, h: 0.38, fontSize: 15, color: ACCENT, bold: true });
  addSpeech(s, [
    '"所以做了这套系统：',
    '扫码点菜，自动推单，',
    '微信一键支付，后台',
    '实时看数据。"',
  ], 4.7);

  addTip(s, '左右对比讲，逻辑清晰', 8.7);
}

// ===========================
// 第5页：汇报PPT第4页 - 系统架构
// ===========================
{
  const s = pptx.addSlide();
  addBg(s);
  addHeader(s, 4, 10, '汇报PPT：系统架构');
  addTag(s, '⏱ 约1.5分钟', 0.2, 0.7);

  s.addText('指三列逐个说：', { x: 0.2, y: 1.25, w: 5.0, h: 0.38, fontSize: 15, color: ACCENT, bold: true });
  addSpeech(s, [
    '"系统分三块：',
    '①用户端小程序——',
    '顾客扫码点餐支付；',
    '②服务端——处理',
    '业务逻辑，提供API；',
    '③商家后台——网页',
    '接单、管菜品、看数据。"',
    '"三块共用一个MySQL',
    '数据库，数据同步。"',
  ], 1.7);

  addTip(s, '别读技术全称，讲"谁用、做什么"就够', 8.7);
}

// ===========================
// 第6页：汇报PPT第5页 - 点餐流程
// ===========================
{
  const s = pptx.addSlide();
  addBg(s);
  addHeader(s, 5, 10, '汇报PPT：点餐流程');
  addTag(s, '⏱ 约2分钟', 0.2, 0.7);
  addTag(s, '最好演示', 3.6, 0.7);

  s.addText('按步骤指着说：', { x: 0.2, y: 1.25, w: 5.0, h: 0.38, fontSize: 15, color: ACCENT, bold: true });

  const steps = [
    ['①扫码进入', '扫桌上二维码，跳转小程序首页'],
    ['②浏览菜品', '按分类展示，点进去看图和详情'],
    ['③加购物车', '选数量，可以备注少辣少盐'],
    ['④支付下单', '调微信支付，一键完成'],
    ['⑤商家接单', '后台收到通知，确认制作'],
    ['⑥取餐完成', '商家标记完成，顾客看历史'],
  ];
  steps.forEach(([title, desc], i) => {
    const y = 1.75 + i * 1.12;
    s.addShape(pptx.ShapeType.roundRect, {
      x: 0.2, y, w: 5.0, h: 1.0,
      fill: { color: WHITE }, line: { color: ACCENT, width: 1 }, rectRadius: 0.1
    });
    s.addText(title, { x: 0.35, y: y + 0.08, w: 1.6, h: 0.36, fontSize: 15, color: ACCENT, bold: true });
    s.addText(desc, { x: 0.35, y: y + 0.48, w: 4.6, h: 0.4, fontSize: 14, color: DARK });
  });
}

// ===========================
// 第7页：汇报PPT第6页 - 退款流程
// ===========================
{
  const s = pptx.addSlide();
  addBg(s);
  addHeader(s, 6, 10, '汇报PPT：退款流程');
  addTag(s, '⏱ 约1.5分钟', 0.2, 0.7);

  s.addText('开场：', { x: 0.2, y: 1.25, w: 5.0, h: 0.38, fontSize: 15, color: ACCENT, bold: true });
  addSpeech(s, [
    '"我还做了完整的退款',
    '功能，很多系统都缺。"',
  ], 1.7);

  s.addText('指左侧（用户）：', { x: 0.2, y: 3.4, w: 5.0, h: 0.38, fontSize: 15, color: ACCENT, bold: true });
  addSpeech(s, [
    '"用户在订单里点退款',
    '申请，状态变为申请中，',
    '等商家处理。"',
  ], 3.85);

  s.addText('指右侧（商家）：', { x: 0.2, y: 5.8, w: 5.0, h: 0.38, fontSize: 15, color: ACCENT, bold: true });
  addSpeech(s, [
    '"商家在后台看到申请，',
    '点同意或拒绝，用户',
    '刷新就能看到结果。"',
  ], 6.25);

  addTip(s, '重点说"双向确认机制"，体现设计严谨', 8.7);
}

// ===========================
// 第8页：汇报PPT第7页 - 商家后台
// ===========================
{
  const s = pptx.addSlide();
  addBg(s);
  addHeader(s, 7, 10, '汇报PPT：商家后台');
  addTag(s, '⏱ 约1.5分钟', 0.2, 0.7);
  addTag(s, '可打开演示', 3.2, 0.7);

  s.addText('开场+逐模块说：', { x: 0.2, y: 1.25, w: 5.0, h: 0.38, fontSize: 15, color: ACCENT, bold: true });

  const modules = [
    ['订单管理', '按状态筛选，一键接单/退款'],
    ['菜品管理', '添加菜品，上传图，随时上下架'],
    ['数据统计', 'ECharts图表，看营收和热门菜'],
    ['系统设置', '填API密钥切换真实/演示数据'],
  ];
  modules.forEach(([name, desc], i) => {
    const y = 1.75 + i * 1.65;
    s.addShape(pptx.ShapeType.roundRect, {
      x: 0.2, y, w: 5.0, h: 1.5,
      fill: { color: WHITE }, line: { color: ACCENT, width: 1.5 }, rectRadius: 0.12
    });
    s.addText(name, { x: 0.38, y: y + 0.12, w: 4.6, h: 0.42, fontSize: 18, color: ACCENT, bold: true });
    s.addText(desc, { x: 0.38, y: y + 0.62, w: 4.6, h: 0.72, fontSize: 16, color: DARK });
  });
}

// ===========================
// 第9页：汇报PPT第8页 - 技术亮点
// ===========================
{
  const s = pptx.addSlide();
  addBg(s);
  addHeader(s, 8, 10, '汇报PPT：技术亮点');
  addTag(s, '⏱ 约1.5分钟', 0.2, 0.7);

  s.addText('句式："做了什么→解决了什么"', {
    x: 0.2, y: 1.25, w: 5.0, h: 0.42,
    fontSize: 14, color: GRAY
  });

  const points = [
    ['☁️ 云开发', '不用买服务器，直接云数据库，省钱省事'],
    ['🔄 退款状态机', '每个状态对应操作权限，不会乱'],
    ['🔀 前后端分离', '小程序和后台各自独立，结构清晰'],
    ['🎨 UI规范', '暖橙色系，颜色圆角都有设计规范'],
  ];
  points.forEach(([title, desc], i) => {
    const y = 1.82 + i * 1.72;
    s.addShape(pptx.ShapeType.roundRect, {
      x: 0.2, y, w: 5.0, h: 1.55,
      fill: { color: WHITE }, line: { color: ACCENT, width: 1.5 }, rectRadius: 0.12
    });
    s.addText(title, { x: 0.35, y: y + 0.1, w: 4.6, h: 0.44, fontSize: 18, color: ACCENT, bold: true });
    s.addText(desc, { x: 0.35, y: y + 0.6, w: 4.6, h: 0.8, fontSize: 15, color: DARK });
  });
}

// ===========================
// 第10页：汇报PPT第9页 - 总结收获
// ===========================
{
  const s = pptx.addSlide();
  addBg(s);
  addHeader(s, 9, 10, '汇报PPT：总结收获');
  addTag(s, '⏱ 约1分钟', 0.2, 0.7);

  s.addText('指左侧功能清单：', { x: 0.2, y: 1.25, w: 5.0, h: 0.38, fontSize: 15, color: ACCENT, bold: true });
  addSpeech(s, [
    '"功能清单里这些，从',
    '点餐到退款到后台统计',
    '都做完了。"',
  ], 1.7);

  s.addText('指右侧收获：', { x: 0.2, y: 4.05, w: 5.0, h: 0.38, fontSize: 15, color: ACCENT, bold: true });
  addSpeech(s, [
    '"最大收获是真正理解了',
    '前后端分离开发模式',
    '和RESTful API设计。"',
    '"不足：退款要手动刷，',
    '后续想加WebSocket实',
    '时推送，支付宝退款',
    '接口也没完全接入。"',
  ], 4.5);
}

// ===========================
// 第11页：汇报PPT第10页 - 结尾
// ===========================
{
  const s = pptx.addSlide();
  addBg(s);
  addHeader(s, 10, 10, '汇报PPT：结尾');
  addTag(s, '⏱ 约20秒', 0.2, 0.7);

  addSpeech(s, [
    '"好，我的汇报到这里',
    '结束了，感谢大家聆',
    '听！有任何问题欢迎',
    '提问。"',
  ], 1.4);

  s.addText('说完→微笑→等待提问', {
    x: 0.2, y: 4.2, w: 5.0, h: 0.5,
    fontSize: 16, color: ACCENT, bold: true, align: 'center'
  });
  s.addText('不要低头看手机！', {
    x: 0.2, y: 4.75, w: 5.0, h: 0.5,
    fontSize: 15, color: GRAY, align: 'center'
  });
}

// ===========================
// 第12页：Q&A 提问1
// ===========================
{
  const s = pptx.addSlide();
  addBg(s);
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.55, fill: { color: '555566' } });
  s.addText('常见提问参考 1/2', { x: 0.2, y: 0.07, w: 5.0, h: 0.4, fontSize: 15, color: WHITE, bold: true, align: 'center' });

  const qas = [
    ['Q：怎么实现微信支付？', '"用的模拟支付，真实支付需要企业主体认证，接口逻辑做好了，换真实密钥就能接通。"'],
    ['Q：数据库有安全防护吗？', '"做了参数校验和status白名单，JWT鉴权作为后续优化项。"'],
  ];
  qas.forEach(([q, a], i) => {
    const y = 0.75 + i * 4.2;
    // 问题
    s.addShape(pptx.ShapeType.roundRect, {
      x: 0.2, y, w: 5.0, h: 0.65,
      fill: { color: 'FFF0E0' }, line: { color: ACCENT, width: 1 }, rectRadius: 0.1
    });
    s.addText(q, { x: 0.35, y: y + 0.08, w: 4.7, h: 0.5, fontSize: 15, color: TAG_TXT, bold: true });
    // 回答
    s.addShape(pptx.ShapeType.roundRect, {
      x: 0.2, y: y + 0.75, w: 5.0, h: 3.2,
      fill: { color: WHITE }, line: { color: GRAY, width: 1 }, rectRadius: 0.1
    });
    s.addText(a, { x: 0.35, y: y + 0.88, w: 4.7, h: 2.9, fontSize: 17, color: DARK });
  });
}

// ===========================
// 第13页：Q&A 提问2
// ===========================
{
  const s = pptx.addSlide();
  addBg(s);
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.55, fill: { color: '555566' } });
  s.addText('常见提问参考 2/2', { x: 0.2, y: 0.07, w: 5.0, h: 0.4, fontSize: 15, color: WHITE, bold: true, align: 'center' });

  const qas2 = [
    ['Q：能真实上线使用吗？', '"核心功能完整，云开发可直接部署。主要差支付接口需要商业主体，和一些边缘情况测试。"'],
    ['Q：开发了多久？', '"大概几周，前期设计数据库和API，后期调UI和退款逻辑。"'],
  ];
  qas2.forEach(([q, a], i) => {
    const y = 0.75 + i * 4.2;
    s.addShape(pptx.ShapeType.roundRect, {
      x: 0.2, y, w: 5.0, h: 0.65,
      fill: { color: 'FFF0E0' }, line: { color: ACCENT, width: 1 }, rectRadius: 0.1
    });
    s.addText(q, { x: 0.35, y: y + 0.08, w: 4.7, h: 0.5, fontSize: 15, color: TAG_TXT, bold: true });
    s.addShape(pptx.ShapeType.roundRect, {
      x: 0.2, y: y + 0.75, w: 5.0, h: 3.2,
      fill: { color: WHITE }, line: { color: GRAY, width: 1 }, rectRadius: 0.1
    });
    s.addText(a, { x: 0.35, y: y + 0.88, w: 4.7, h: 2.9, fontSize: 17, color: DARK });
  });
}

// ===========================
// 第14页：演示前检查清单
// ===========================
{
  const s = pptx.addSlide();
  addBg(s);
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.55, fill: { color: '2D7D2D' } });
  s.addText('📋 演示前检查清单', { x: 0.2, y: 0.07, w: 5.0, h: 0.4, fontSize: 16, color: WHITE, bold: true, align: 'center' });

  const checks = [
    '✅ 手机打开小程序可以正常扫码',
    '✅ node server.js 已启动（端口3000）',
    '✅ npm run dev 已启动（端口5173）',
    '✅ 浏览器打开后台 localhost:5173',
    '✅ PPT 在电脑上全屏显示',
    '✅ 这份讲稿PPT在手机上打开',
    '✅ 深呼吸，放轻松 😊',
  ];
  checks.forEach((c, i) => {
    const y = 0.75 + i * 1.18;
    s.addShape(pptx.ShapeType.roundRect, {
      x: 0.2, y, w: 5.0, h: 1.05,
      fill: { color: WHITE }, line: { color: '90C890', width: 1.5 }, rectRadius: 0.12
    });
    s.addText(c, { x: 0.35, y: y + 0.15, w: 4.7, h: 0.72, fontSize: 16, color: DARK });
  });
}

// ===========================
// 保存
// ===========================
const outPath = 'F:/点餐系统讲稿（手机版）.pptx';
pptx.writeFile({ fileName: outPath })
  .then(() => console.log('✅ 讲稿PPT生成完成：' + outPath))
  .catch(e => console.error('❌ 失败：', e));
