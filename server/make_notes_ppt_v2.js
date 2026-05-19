/**
 * 手机版完整讲稿 PPT v2
 * 竖屏，字体大，完整原文，不省略任何台词
 */
const PptxGenJS = require('pptxgenjs');
const pptx = new PptxGenJS();

pptx.defineLayout({ name: 'PHONE', width: 5.4, height: 9.6 });
pptx.layout = 'PHONE';

// ===== 颜色 =====
const BG     = 'F4F5F7';
const ORANGE = 'C68D56';
const DARK   = 'A97240';
const TEXT   = '1A1A2E';
const WHITE  = 'FFFFFF';
const GRAY   = '666677';
const GREEN  = '2D7D2D';
const GBGC   = 'E8F5E8';
const YBGC   = 'FFF8E8';
const OBGC   = 'FFF0E0';

// ===== 工具：背景 =====
function bg(s) {
  s.addShape(pptx.ShapeType.rect, { x:0, y:0, w:'100%', h:'100%', fill:{color:BG} });
}

// ===== 工具：顶部橙色标题条 =====
function header(s, label, time, color) {
  const c = color || ORANGE;
  s.addShape(pptx.ShapeType.rect, { x:0, y:0, w:'100%', h:0.72, fill:{color:c} });
  s.addText(label, {
    x:0.18, y:0.07, w:3.8, h:0.55,
    fontSize:18, bold:true, color:WHITE
  });
  if (time) {
    s.addText(time, {
      x:3.8, y:0.1, w:1.42, h:0.5,
      fontSize:13, color:'FFE4C0', align:'right'
    });
  }
}

// ===== 工具：说话气泡（可多行） =====
function bubble(s, lines, y, opts) {
  const o = opts || {};
  const lineH = o.lineH || 0.62;
  const fSize = o.fSize || 18;
  const totalH = 0.45 + lines.length * lineH;
  s.addShape(pptx.ShapeType.roundRect, {
    x:0.18, y, w:5.04, h:totalH,
    fill:{color: o.bgColor || WHITE},
    line:{color: o.borderColor || ORANGE, width:1.8},
    rectRadius:0.14
  });
  if (o.label !== false) {
    s.addText(o.label || '💬 你说：', {
      x:0.35, y:y+0.06, w:2.5, h:0.34,
      fontSize:13, color: o.labelColor || ORANGE, bold:true
    });
  }
  const textY = (o.label === false) ? y+0.1 : y+0.42;
  lines.forEach((line, i) => {
    s.addText(line, {
      x:0.32, y: textY + i*lineH, w:4.82, h:lineH,
      fontSize:fSize, color: o.textColor || TEXT, wrap:true
    });
  });
  return y + totalH + 0.18;
}

// ===== 工具：提示条 =====
function tip(s, text, y) {
  const lines = typeof text === 'string' ? [text] : text;
  const h = 0.24 + lines.length * 0.42;
  s.addShape(pptx.ShapeType.roundRect, {
    x:0.18, y, w:5.04, h,
    fill:{color:GBGC}, line:{color:'90C890', width:1.2}, rectRadius:0.1
  });
  lines.forEach((l,i) => {
    s.addText('💡 ' + l, {
      x:0.3, y:y+0.1+i*0.42, w:4.84, h:0.38,
      fontSize:14, color:GREEN
    });
  });
  return y + h + 0.14;
}

// ===== 工具：指示标签 =====
function pointTo(s, text, y) {
  s.addShape(pptx.ShapeType.roundRect, {
    x:0.18, y, w:5.04, h:0.48,
    fill:{color:OBGC}, line:{color:ORANGE, width:1}, rectRadius:0.1
  });
  s.addText('👉 ' + text, {
    x:0.3, y:y+0.05, w:4.84, h:0.38,
    fontSize:15, color:DARK, bold:true
  });
  return y + 0.62;
}

// ===== 工具：分隔线 =====
function divider(s, y) {
  s.addShape(pptx.ShapeType.line, {
    x:0.18, y, w:5.04, h:0,
    line:{color:'DDD', width:1.2}
  });
  return y + 0.2;
}

// ========================
// 封面页
// ========================
{
  const s = pptx.addSlide();
  s.addShape(pptx.ShapeType.rect, { x:0, y:0, w:'100%', h:'100%', fill:{color:ORANGE} });
  s.addText('📱', { x:0.5, y:0.9, w:4.4, h:1.1, fontSize:60, align:'center' });
  s.addText('手机讲稿', {
    x:0.2, y:2.1, w:5.0, h:0.88,
    fontSize:42, bold:true, color:WHITE, align:'center'
  });
  s.addText('点餐系统演示汇报', {
    x:0.2, y:3.05, w:5.0, h:0.55,
    fontSize:21, color:'FFE4C0', align:'center'
  });
  // 使用说明卡片
  const tips2 = [
    ['📊','右边电脑放汇报PPT'],
    ['📱','左手拿手机看这个'],
    ['💬','照上面的台词说'],
    ['😊','放松，不用背稿'],
  ];
  tips2.forEach(([ico, txt], i) => {
    const col = i%2, row = Math.floor(i/2);
    const x = col===0 ? 0.22 : 2.85;
    const y = 4.0 + row*1.45;
    s.addShape(pptx.ShapeType.roundRect, {
      x, y, w:2.32, h:1.3,
      fill:{color:'A97240'}, line:{color:WHITE, width:1}, rectRadius:0.14
    });
    s.addText(ico, { x, y:y+0.1, w:2.32, h:0.52, fontSize:28, align:'center' });
    s.addText(txt, { x:x+0.1, y:y+0.66, w:2.12, h:0.52, fontSize:14, color:WHITE, align:'center' });
  });
  s.addText('每页对应汇报PPT一页，同步翻', {
    x:0.2, y:6.98, w:5.0, h:0.4,
    fontSize:14, color:'FFE4C0', align:'center'
  });
  s.addText('⏱ 全程约 10~15 分钟', {
    x:0.2, y:7.44, w:5.0, h:0.44,
    fontSize:15, bold:true, color:WHITE, align:'center'
  });
  // 演示前提醒
  s.addShape(pptx.ShapeType.roundRect, {
    x:0.22, y:8.05, w:4.96, h:1.38,
    fill:{color:'8B5E35'}, line:{color:WHITE, width:1}, rectRadius:0.14
  });
  s.addText('演示前确认：', {
    x:0.4, y:8.12, w:4.6, h:0.35,
    fontSize:13, color:'FFE4C0', bold:true
  });
  s.addText('✅ node server.js 已启动（端口3000）', {
    x:0.4, y:8.48, w:4.6, h:0.3, fontSize:12, color:WHITE
  });
  s.addText('✅ npm run dev 已启动（端口5173）', {
    x:0.4, y:8.8, w:4.6, h:0.3, fontSize:12, color:WHITE
  });
  s.addText('✅ 小程序可正常扫码打开', {
    x:0.4, y:9.12, w:4.6, h:0.3, fontSize:12, color:WHITE
  });
}

// ========================
// 总体建议页
// ========================
{
  const s = pptx.addSlide();
  bg(s);
  header(s, '📌 总体建议', '', '555566');
  const items = [
    ['⏱', '全程控制在 10~15 分钟'],
    ['🧘', '讲之前深呼吸，不用背稿\n用自己的话说出来就行'],
    ['😅', '遇到卡顿没关系\n"这个地方我解释一下……"\n这样自然过渡就好'],
    ['📲', '演示时提前打开小程序\n和后台页面\n讲到哪里就点开演示'],
  ];
  let y = 0.9;
  items.forEach(([ico, txt]) => {
    const lines = txt.split('\n');
    const h = 0.42 + lines.length * 0.52;
    s.addShape(pptx.ShapeType.roundRect, {
      x:0.18, y, w:5.04, h,
      fill:{color:WHITE}, line:{color:ORANGE, width:1.5}, rectRadius:0.12
    });
    s.addText(ico, { x:0.28, y:y+0.1, w:0.55, h:h-0.2, fontSize:24, valign:'middle' });
    lines.forEach((l, i) => {
      s.addText(l, {
        x:0.9, y:y+0.12+i*0.52, w:4.2, h:0.48,
        fontSize:17, color:TEXT
      });
    });
    y += h + 0.18;
  });
}

// ========================
// 第1页：封面台词
// ========================
{
  const s = pptx.addSlide();
  bg(s);
  header(s, '汇报第1页：封面', '⏱ 约20秒');

  let y = 0.88;
  y = bubble(s, [
    '"大家好，我今天要汇报的',
    '是我开发实训课上做的一',
    '个作品——微信小程序点',
    '餐系统。',
  ], y);
  y = bubble(s, [
    '这套系统包括用户点餐的',
    '小程序、还有商家管理用',
    '的网页后台，用的是微信',
    '云开发 + Node.js +',
    'Vue3 这些技术。',
  ], y);
  y = bubble(s, [
    '接下来我大概用10分钟',
    '跟大家介绍一下。"',
  ], y);
  tip(s, '说完就翻页，不用介绍名字（除非老师要求）', y);
}

// ========================
// 第2页：目录
// ========================
{
  const s = pptx.addSlide();
  bg(s);
  header(s, '汇报第2页：目录', '⏱ 约30秒');

  let y = 0.88;
  y = bubble(s, [
    '"我的汇报分六个部分：',
    '先说为什么做这个、',
    '然后讲架构、接着演示',
    '核心功能、介绍后台管',
    '理系统、聊一下技术亮',
    '点，最后做个总结。"',
  ], y);
  tip(s, '快速扫一遍就行，不用逐项解释，保持节奏感', y);
}

// ========================
// 第3页：项目背景（拆2张）
// ========================
{
  const s = pptx.addSlide();
  bg(s);
  header(s, '汇报第3页：项目背景①', '⏱ 共约1.5分钟');

  let y = 0.88;
  y = bubble(s, ['"首先说一下为什么要做这个系统。"'], y, {fSize:18});
  y = pointTo(s, '指左侧红色卡片', y);
  y = bubble(s, [
    '"传统餐厅点餐有几个',
    '明显痛点：',
    '排队叫号效率低、',
    '手写菜单容易出错、',
    '结账慢、',
    '老板也没办法随时看',
    '数据——这些都是真实',
    '存在的问题。"',
  ], y);
}

{
  const s = pptx.addSlide();
  bg(s);
  header(s, '汇报第3页：项目背景②', '⏱ 接着讲');

  let y = 0.88;
  y = pointTo(s, '指右侧绿色卡片', y);
  y = bubble(s, [
    '"所以我们做了这套系统',
    '来解决这些问题：',
    '顾客扫桌贴上的二维码',
    '就能直接在手机上点菜，',
    '订单自动推送给商家，',
    '微信支付一键结账，',
    '商家也可以随时在后台',
    '看订单和收入。"',
  ], y);
  tip(s, '左右两列对比着讲，逻辑清晰，听众容易跟上', y+0.1);
}

// ========================
// 第4页：系统架构（拆2张）
// ========================
{
  const s = pptx.addSlide();
  bg(s);
  header(s, '汇报第4页：系统架构①', '⏱ 共约1.5分钟');

  let y = 0.88;
  y = bubble(s, ['"接下来简单说一下系统的整体架构。"'], y, {fSize:18});
  y = pointTo(s, '指三列，逐个说', y);
  y = bubble(s, [
    '"整个系统分三块：',
    '第一块是用户端小程序，',
    '顾客用手机扫码点餐、',
    '支付、查订单；',
    '第二块是服务端，用',
    'Node.js + Express写的，',
    '负责处理所有业务逻辑，',
    '提供REST API接口；",',
  ], y);
}

{
  const s = pptx.addSlide();
  bg(s);
  header(s, '汇报第4页：系统架构②', '⏱ 接着讲');

  let y = 0.88;
  y = bubble(s, [
    '"第三块是商家后台，',
    '用Vue3写的网页，',
    '商家在电脑上接单、',
    '管理菜品、查数据。"',
  ], y);
  y = pointTo(s, '指底部数据库', y);
  y = bubble(s, [
    '"三块都共用同一个',
    'MySQL数据库，',
    '数据实时同步。"',
  ], y);
  tip(s, '别读技术名词全称，讲"谁用、做什么"就够了', y);
}

// ========================
// 第5页：点餐流程（拆3张）
// ========================
{
  const s = pptx.addSlide();
  bg(s);
  header(s, '汇报第5页：点餐流程①', '⏱ 共约2分钟');

  let y = 0.88;
  y = bubble(s, [
    '"核心功能是用户的点餐',
    '流程，我按步骤走一遍。"'
  ], y, {fSize:18});
  tip(s, '如果条件允许，这页打开小程序走一遍真实流程，效果非常好！', y);
  y += 0.9;
  // 步骤1-3
  const steps1 = [
    ['① 扫码进入', '"顾客坐下，掏出手机扫桌上的二维码，直接跳转到我们的小程序首页。"'],
    ['② 浏览菜品', '"首页展示所有菜品，按分类显示，点进去可以看图片和详情。"'],
    ['③ 加入购物车', '"选好之后加入购物车，可以设置数量，也可以备注特殊要求，比如少辣少盐。"'],
  ];
  steps1.forEach(([title, speech]) => {
    s.addShape(pptx.ShapeType.roundRect, {
      x:0.18, y, w:5.04, h:1.7,
      fill:{color:WHITE}, line:{color:ORANGE, width:1.5}, rectRadius:0.12
    });
    s.addText(title, { x:0.32, y:y+0.1, w:4.7, h:0.4, fontSize:16, color:ORANGE, bold:true });
    s.addText(speech, { x:0.32, y:y+0.52, w:4.7, h:1.0, fontSize:16, color:TEXT, wrap:true });
    y += 1.88;
  });
}

{
  const s = pptx.addSlide();
  bg(s);
  header(s, '汇报第5页：点餐流程②', '⏱ 接着讲');

  let y = 0.88;
  const steps2 = [
    ['④ 提交支付', '"确认订单后点支付，直接调微信支付，安全便捷。"'],
    ['⑤ 商家接单', '"支付成功后，商家后台马上收到通知，可以接单并开始制作。"'],
    ['⑥ 取餐完成', '"制作完成后商家标记完成，顾客也能在订单页看到历史记录。"'],
  ];
  steps2.forEach(([title, speech]) => {
    s.addShape(pptx.ShapeType.roundRect, {
      x:0.18, y, w:5.04, h:1.7,
      fill:{color:WHITE}, line:{color:ORANGE, width:1.5}, rectRadius:0.12
    });
    s.addText(title, { x:0.32, y:y+0.1, w:4.7, h:0.4, fontSize:16, color:ORANGE, bold:true });
    s.addText(speech, { x:0.32, y:y+0.52, w:4.7, h:1.0, fontSize:16, color:TEXT, wrap:true });
    y += 1.88;
  });
}

// ========================
// 第6页：退款流程（拆2张）
// ========================
{
  const s = pptx.addSlide();
  bg(s);
  header(s, '汇报第6页：退款流程①', '⏱ 共约1.5分钟');

  let y = 0.88;
  y = bubble(s, [
    '"除了正常点餐流程，',
    '我还做了完整的退款',
    '功能，这是很多系统',
    '都缺失的。"',
  ], y);
  y = pointTo(s, '指左侧（用户端）', y);
  y = bubble(s, [
    '"用户这边：进入订单',
    '列表的退款Tab，找到',
    '订单，点申请退款，',
    '状态就会变成',
    '"退款申请中"，然后',
    '等待商家处理就行。"',
  ], y);
}

{
  const s = pptx.addSlide();
  bg(s);
  header(s, '汇报第6页：退款流程②', '⏱ 接着讲');

  let y = 0.88;
  y = pointTo(s, '指右侧（商家端）', y);
  y = bubble(s, [
    '"商家这边：后台会显示',
    '这条订单有退款申请，',
    '商家可以点"同意退款"',
    '或者"拒绝退款"。',
    '处理完之后，数据库',
    '同步更新，用户下拉',
    '刷新就能看到结果。"',
  ], y);
  tip(s, '重点强调"双向确认"机制，说明设计的严谨性', y);
}

// ========================
// 第7页：商家后台（拆2张）
// ========================
{
  const s = pptx.addSlide();
  bg(s);
  header(s, '汇报第7页：商家后台①', '⏱ 共约1.5分钟');

  let y = 0.88;
  y = bubble(s, [
    '"接下来介绍商家后台，',
    '这是一个网页端的管理',
    '系统，用Vue3 + Element',
    'Plus做的。"',
  ], y);
  y = pointTo(s, '指四个模块，逐个说', y);
  const mods1 = [
    ['订单管理', '"可以按状态筛选订单，比如待处理、制作中、已退款，表格里一键操作，还可以点进去看订单详情。"'],
    ['菜品管理', '"商家可以添加菜品、上传图片、设置分类和价格，随时上下架。"'],
  ];
  mods1.forEach(([name, speech]) => {
    s.addShape(pptx.ShapeType.roundRect, {
      x:0.18, y, w:5.04, h:1.9,
      fill:{color:WHITE}, line:{color:ORANGE, width:1.5}, rectRadius:0.12
    });
    s.addText(name, { x:0.32, y:y+0.1, w:4.7, h:0.4, fontSize:17, color:ORANGE, bold:true });
    s.addText(speech, { x:0.32, y:y+0.55, w:4.7, h:1.15, fontSize:16, color:TEXT, wrap:true });
    y += 2.08;
  });
}

{
  const s = pptx.addSlide();
  bg(s);
  header(s, '汇报第7页：商家后台②', '⏱ 接着讲');

  let y = 0.88;
  const mods2 = [
    ['数据统计', '"用ECharts做了销售图表，可以看今日营收、热门菜品排行、订单量趋势。"'],
    ['系统设置', '"支持填入微信API密钥切换真实数据，也有演示模式方便展示。"'],
  ];
  mods2.forEach(([name, speech]) => {
    s.addShape(pptx.ShapeType.roundRect, {
      x:0.18, y, w:5.04, h:1.9,
      fill:{color:WHITE}, line:{color:ORANGE, width:1.5}, rectRadius:0.12
    });
    s.addText(name, { x:0.32, y:y+0.1, w:4.7, h:0.4, fontSize:17, color:ORANGE, bold:true });
    s.addText(speech, { x:0.32, y:y+0.55, w:4.7, h:1.15, fontSize:16, color:TEXT, wrap:true });
    y += 2.08;
  });
  tip(s, '时间紧可合并讲，重点突出订单管理和统计两个模块', y);
}

// ========================
// 第8页：技术亮点（拆2张）
// ========================
{
  const s = pptx.addSlide();
  bg(s);
  header(s, '汇报第8页：技术亮点①', '⏱ 共约1.5分钟');

  let y = 0.88;
  y = bubble(s, ['"讲几个我认为做得比较好的技术点。"'], y, {fSize:18});
  y = pointTo(s, '逐个指，按这个句式：做了什么→解决了什么', y);
  const pts1 = [
    ['☁️ 云开发', '"我用了微信的云开发CloudBase，不需要自己买服务器，直接用云数据库，降低了部署成本，适合实训项目。"'],
    ['🔄 退款状态机', '"退款这里设计了完整的状态机：从待处理到制作中，再到申请退款、已退款，每个状态对应不同的操作权限，避免出错。"'],
  ];
  pts1.forEach(([title, speech]) => {
    s.addShape(pptx.ShapeType.roundRect, {
      x:0.18, y, w:5.04, h:2.0,
      fill:{color:WHITE}, line:{color:ORANGE, width:1.5}, rectRadius:0.12
    });
    s.addText(title, { x:0.32, y:y+0.1, w:4.7, h:0.42, fontSize:17, color:ORANGE, bold:true });
    s.addText(speech, { x:0.32, y:y+0.58, w:4.7, h:1.2, fontSize:16, color:TEXT, wrap:true });
    y += 2.18;
  });
}

{
  const s = pptx.addSlide();
  bg(s);
  header(s, '汇报第8页：技术亮点②', '⏱ 接着讲');

  let y = 0.88;
  const pts2 = [
    ['🔀 前后端分离', '"小程序和后台网页各自独立开发，都通过同一套API访问数据，结构清晰，以后可以单独替换某一端。"'],
    ['🎨 UI设计', '"专门设计了一套暖橙色风格，从颜色到圆角到卡片都有规范，整体视觉比较统一。"'],
  ];
  pts2.forEach(([title, speech]) => {
    s.addShape(pptx.ShapeType.roundRect, {
      x:0.18, y, w:5.04, h:2.0,
      fill:{color:WHITE}, line:{color:ORANGE, width:1.5}, rectRadius:0.12
    });
    s.addText(title, { x:0.32, y:y+0.1, w:4.7, h:0.42, fontSize:17, color:ORANGE, bold:true });
    s.addText(speech, { x:0.32, y:y+0.58, w:4.7, h:1.2, fontSize:16, color:TEXT, wrap:true });
    y += 2.18;
  });
  tip(s, '别堆砌技术词汇，每个点用"做了什么→解决了什么"讲', y);
}

// ========================
// 第9页：总结收获（拆2张）
// ========================
{
  const s = pptx.addSlide();
  bg(s);
  header(s, '汇报第9页：总结收获①', '⏱ 共约1分钟');

  let y = 0.88;
  y = pointTo(s, '指左侧功能清单', y);
  y = bubble(s, [
    '"这是我已经实现的功能',
    '清单，从用户点餐到退',
    '款处理，再到后台统计，',
    '核心功能都做完了。"',
  ], y);
  y = pointTo(s, '指右侧收获', y);
  y = bubble(s, [
    '"通过这次实训，我最大',
    '的收获是真正理解了',
    '前后端分离的开发模式，',
    '以及怎么设计RESTful',
    'API。"',
  ], y);
}

{
  const s = pptx.addSlide();
  bg(s);
  header(s, '汇报第9页：总结收获②', '⏱ 接着讲');

  let y = 0.88;
  y = bubble(s, [
    '"当然也有不足：退款',
    '目前是靠用户手动刷新',
    '查看结果的，理想状态',
    '是加WebSocket实时推',
    '送；另外支付宝退款接',
    '口也没完全接入。',
    '这些是我后续改进的',
    '方向。"',
  ], y);
}

// ========================
// 第10页：结尾
// ========================
{
  const s = pptx.addSlide();
  bg(s);
  header(s, '汇报第10页：结尾', '⏱ 约20秒');

  let y = 0.88;
  y = bubble(s, [
    '"好，我的汇报到这里',
    '就结束了，感谢大家',
    '的聆听！如果有任何',
    '问题或者想更深入了',
    '解某个功能，欢迎',
    '提问。"',
  ], y);

  s.addShape(pptx.ShapeType.roundRect, {
    x:0.18, y, w:5.04, h:1.05,
    fill:{color:OBGC}, line:{color:ORANGE, width:1.5}, rectRadius:0.14
  });
  s.addText('说完就不说话了\n微笑，等待提问 😊', {
    x:0.3, y:y+0.1, w:4.84, h:0.85,
    fontSize:20, color:DARK, bold:true, align:'center'
  });
  y += 1.22;

  s.addShape(pptx.ShapeType.roundRect, {
    x:0.18, y, w:5.04, h:0.62,
    fill:{color:'FFEDED'}, line:{color:'DD6666', width:1}, rectRadius:0.1
  });
  s.addText('⚠️ 不要低头看手机！', {
    x:0.3, y:y+0.1, w:4.84, h:0.42,
    fontSize:18, color:'CC3333', bold:true, align:'center'
  });
}

// ========================
// Q&A - 微信支付
// ========================
{
  const s = pptx.addSlide();
  bg(s);
  header(s, '常见提问 1/4', '', '555566');

  let y = 0.88;
  s.addShape(pptx.ShapeType.roundRect, {
    x:0.18, y, w:5.04, h:0.72,
    fill:{color:OBGC}, line:{color:ORANGE, width:1.5}, rectRadius:0.12
  });
  s.addText('Q：你们是怎么实现微信支付的？', {
    x:0.3, y:y+0.1, w:4.84, h:0.52,
    fontSize:16, color:DARK, bold:true, wrap:true
  });
  y += 0.9;
  y = bubble(s, [
    '"我这里用的是模拟支',
    '付的方式，真实的微信',
    '支付需要企业主体认证，',
    '个人开发者没办法直接',
    '调。不过接口对接的逻',
    '辑我已经实现好了，换',
    '上真实的appid和密钥',
    '就可以接通。"',
  ], y, {bgColor:YBGC, borderColor:'CCC090', labelColor:DARK});
}

// ========================
// Q&A - 数据库安全
// ========================
{
  const s = pptx.addSlide();
  bg(s);
  header(s, '常见提问 2/4', '', '555566');

  let y = 0.88;
  s.addShape(pptx.ShapeType.roundRect, {
    x:0.18, y, w:5.04, h:0.72,
    fill:{color:OBGC}, line:{color:ORANGE, width:1.5}, rectRadius:0.12
  });
  s.addText('Q：数据库有没有做安全防护？', {
    x:0.3, y:y+0.1, w:4.84, h:0.52,
    fontSize:16, color:DARK, bold:true
  });
  y += 0.9;
  y = bubble(s, [
    '"后端API做了基本的',
    '参数校验，status字段',
    '有白名单限制，防止乱',
    '填状态。完整的鉴权',
    '（比如JWT token）作',
    '为后续优化项，时间关',
    '系没有完全实现。"',
  ], y, {bgColor:YBGC, borderColor:'CCC090', labelColor:DARK});
}

// ========================
// Q&A - 能否上线
// ========================
{
  const s = pptx.addSlide();
  bg(s);
  header(s, '常见提问 3/4', '', '555566');

  let y = 0.88;
  s.addShape(pptx.ShapeType.roundRect, {
    x:0.18, y, w:5.04, h:0.72,
    fill:{color:OBGC}, line:{color:ORANGE, width:1.5}, rectRadius:0.12
  });
  s.addText('Q：这个系统能真实上线使用吗？', {
    x:0.3, y:y+0.1, w:4.84, h:0.52,
    fontSize:16, color:DARK, bold:true
  });
  y += 0.9;
  y = bubble(s, [
    '"核心功能是完整的，',
    '云开发可以直接部署到',
    '生产环境。主要差的是',
    '支付接口需要真实的商',
    '业主体，还有一些边缘',
    'case的测试。"',
  ], y, {bgColor:YBGC, borderColor:'CCC090', labelColor:DARK});
}

// ========================
// Q&A - 开发时间
// ========================
{
  const s = pptx.addSlide();
  bg(s);
  header(s, '常见提问 4/4', '', '555566');

  let y = 0.88;
  s.addShape(pptx.ShapeType.roundRect, {
    x:0.18, y, w:5.04, h:0.72,
    fill:{color:OBGC}, line:{color:ORANGE, width:1.5}, rectRadius:0.12
  });
  s.addText('Q：整个项目开发了多久？', {
    x:0.3, y:y+0.1, w:4.84, h:0.52,
    fontSize:16, color:DARK, bold:true
  });
  y += 0.9;
  y = bubble(s, [
    '"大概用了几周时间，',
    '前期主要是设计数据库',
    '结构和API接口，后期',
    '主要是调UI和退款逻辑。"',
  ], y, {bgColor:YBGC, borderColor:'CCC090', labelColor:DARK});
}

// ========================
// 演示前检查清单
// ========================
{
  const s = pptx.addSlide();
  bg(s);
  header(s, '📋 演示前检查清单', '', GREEN);

  const checks = [
    ['✅', 'node server.js 已启动', '端口 3000'],
    ['✅', 'npm run dev 已启动', '端口 5173，即后台网页'],
    ['✅', '浏览器打开后台', 'localhost:5173 可正常显示'],
    ['✅', '手机打开小程序', '扫码可以正常进入'],
    ['✅', '汇报PPT全屏', '电脑投屏已就绪'],
    ['✅', '讲稿PPT在手机', '这份文件已打开'],
    ['😊', '深呼吸，放轻松', '不用背稿，说自己话'],
  ];
  let y = 0.88;
  checks.forEach(([ico, main, sub]) => {
    s.addShape(pptx.ShapeType.roundRect, {
      x:0.18, y, w:5.04, h:1.1,
      fill:{color:WHITE}, line:{color:'90C890', width:1.5}, rectRadius:0.12
    });
    s.addText(ico, { x:0.28, y:y+0.2, w:0.52, h:0.7, fontSize:22 });
    s.addText(main, { x:0.88, y:y+0.1, w:4.2, h:0.44, fontSize:17, color:TEXT, bold:true });
    s.addText(sub, { x:0.88, y:y+0.56, w:4.2, h:0.38, fontSize:14, color:GRAY });
    y += 1.26;
  });
}

// ========================
// 保存
// ========================
const out = 'F:/点餐系统讲稿（手机版）.pptx';
pptx.writeFile({ fileName: out })
  .then(() => console.log('✅ 完整讲稿PPT已生成：' + out))
  .catch(e => console.error('❌ 失败：', e));
