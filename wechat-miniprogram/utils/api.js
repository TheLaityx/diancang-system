// utils/api.js - HTTP API 封装（对接 Node.js + MySQL 后端）
// 后端地址：http://localhost:3000（本地开发）
// 注意：发布小程序时需换成线上 HTTPS 域名

const BASE_URL = 'http://localhost:3000/api';
// 图片 Host（去掉 /api）
const IMG_HOST = 'http://localhost:3000';

/**
 * 基础 HTTP 请求封装
 */
function request(method, path, data = {}) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: BASE_URL + path,
      method: method.toUpperCase(),
      data,
      header: { 'Content-Type': 'application/json' },
      success(res) {
        const body = res.data;
        if (body && body.code === 0) {
          resolve(body.data !== undefined ? body.data : body);
        } else {
          reject(body?.msg || '请求失败');
        }
      },
      fail(err) {
        console.error('[API Error]', method, path, err);
        if (err.errMsg && err.errMsg.indexOf('url not in domain list') !== -1) {
          reject('请在微信开发者工具 → 详情 → 本地设置 → 勾选「不校验合法域名」后重试');
        } else {
          reject('网络错误，请检查后端服务是否启动（node index.js）');
        }
      }
    });
  });
}

const get  = (path, data) => request('GET', path, data);
const post = (path, data) => request('POST', path, data);
const put  = (path, data) => request('PUT', path, data);
const patch = (path, data) => request('PATCH', path, data);
const del  = (path) => request('DELETE', path);

// ==================== 分类 ====================

function getCategories() {
  // 给每个分类加 _id 字段，兼容 WXML 里的 item._id 判断
  return get('/categories').then(data => ({
    data: (data || []).map(c => ({ ...c, _id: String(c.id) }))
  }));
}

// ==================== 菜品 ====================

// 将 MySQL 字段映射为小程序原有字段格式
function normalizeDish(dish) {
  // 相对路径图片拼上后端 host，http 开头的不处理
  let image = dish.image || '';
  if (image && image.startsWith('/')) {
    image = IMG_HOST + image;
  }
  // price 确保是格式化字符串（如 "38.00"）
  const price = dish.price !== undefined && dish.price !== null
    ? Number(dish.price).toFixed(2)
    : '0.00';
  return {
    ...dish,
    image,
    price,                         // 覆盖原始 price，保证是格式化字符串
    _id: String(dish.id),          // 兼容原有 dish._id 用法
    categoryId: dish.category_id,  // 兼容原有 categoryId 用法
  };
}

function getDishes(categoryId, keyword) {
  const params = {};
  // categoryId 可能是字符串形式的数字 id，直接传给后端
  if (categoryId) params.category_id = categoryId;
  params.status = 1;
  if (keyword) params.keyword = keyword;
  return get('/dishes', params).then(data => ({ data: data.map(normalizeDish) }));
}

function getDishDetail(dishId) {
  return get(`/dishes/${dishId}`).then(data => ({ data: normalizeDish(data) }));
}

// 评价（暂不支持，返回空数据）
function getDishReviews(dishId) {
  return Promise.resolve({ data: [] });
}

function addReview(dishId, rating, content, userId) {
  return Promise.resolve({ success: true });
}

// ==================== 订单 ====================

async function createOrder(orderData) {
  // 支持两种 items 格式：
  //   格式A（小程序购物车）：{ dishId, name, price, quantity }
  //   格式B（已处理）：{ dish_id, dish_name, price, quantity }
  const items = (orderData.items || []).map(item => ({
    dish_id: item.dish_id !== undefined ? item.dish_id : (item.dishId || item._id),
    dish_name: item.dish_name !== undefined ? item.dish_name : item.name,
    price: Number(item.price) || 0,
    quantity: item.quantity || 1
  }));

  const result = await post('/orders', {
    user_id: null,   // 演示系统不绑定用户
    table_no: orderData.tableNo || '',
    items,
    remark: orderData.remark || ''
  });

  return {
    orderId: result.order_id,
    orderNo: result.order_no,
    pickupNo: result.pickup_no   // 4位取餐号
  };
}

async function payOrder(orderId) {
  // 本地演示：直接将订单状态改为 accepted（已接单）
  return patch(`/orders/${orderId}/status`, { status: 'accepted' });
}

async function generateTakeNo() {
  const now = new Date();
  const seq = String(Math.floor(Math.random() * 900) + 100);
  return `${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}${seq}`;
}

// 将 MySQL 订单字段映射为小程序原有格式
function normalizeOrder(order) {
  // pending=待接单(1)，accepted=制作中(2)，completed=已完成(3)，refunding=退款申请中(4)，refunded=退款中(4，旧兼容)，refund_done=已退款(5)
  const statusMap = { pending: 1, accepted: 2, completed: 3, refunding: 4, refunded: 4, refund_done: 5 };
  return {
    ...order,
    _id: String(order.id),
    tableNo: order.table_no,
    totalAmount: Number(order.total_price),
    totalAmountText: Number(order.total_price || 0).toFixed(2),
    orderNo: order.order_no,
    pickupNo: order.pickup_no || String(order.id % 10000).padStart(4, '0'), // 4位取餐号
    takeNo:   order.pickup_no || String(order.id % 10000).padStart(4, '0'), // 兼容 order-detail 页
    status: statusMap[order.status] ?? 0,
    createTime: order.created_at,
    items: (order.items || []).map(i => {
      const price = Number(i.price) || 0;
      const quantity = i.quantity || 1;
      const subtotal = i.subtotal != null ? Number(i.subtotal) : price * quantity;
      return {
        ...i,
        dishId: String(i.dish_id),
        name: i.dish_name,
        quantity,
        price,
        priceText: price.toFixed(2),
        subtotal,
        subtotalText: subtotal.toFixed(2)
      };
    })
  };
}

function getOrders(userId, status) {
  const params = {};
  if (status !== undefined && status !== -1 && status !== null) {
    // status=4 时同时查 refunding（新）和 refunded（旧数据兼容）
    const statusMap = { 0: 'pending', 1: 'pending', 2: 'accepted', 3: 'completed', 4: 'refunding,refunded', 5: 'refund_done' };
    params.status = statusMap[status] || status;
  }
  return get('/orders', params).then(data => ({ data: data.map(normalizeOrder) }));
}

function getMerchantOrders(status) {
  return getOrders(null, status);
}

function getOrderDetail(orderId) {
  return get(`/orders/${orderId}`).then(data => ({ data: normalizeOrder(data) }));
}

function updateOrderStatus(orderId, status) {
  const statusMap = { 0: 'pending', 1: 'pending', 2: 'accepted', 3: 'completed', 4: 'refunding', 5: 'refund_done' };
  const newStatus = statusMap[status] || status;
  return patch(`/orders/${orderId}/status`, { status: newStatus });
}

function createRefund(orderId, reason, userId) {
  // refunding = 用户已申请退款，待商家审核(4)
  return patch(`/orders/${orderId}/status`, { status: 'refunding' });
}

function getRefunds(userId) {
  return get('/orders', { status: 'refunded' }).then(data => ({ data }));
}

async function processRefund(refundId, status) {
  // status=1 同意退款→refund_done(已退款5)，status=2 拒绝→completed(已完成3)
  const newStatus = status === 1 ? 'refund_done' : 'completed';
  return patch(`/orders/${refundId}/status`, { status: newStatus });
}

// ==================== 统计 ====================

function getTodayStats() {
  return get('/stats/overview').then(data => ({
    totalOrders: data.today_orders,
    totalAmount: data.today_revenue,
    completedOrders: data.today_orders,
    refundCount: 0,
    refundAmount: 0
  }));
}

// ==================== 菜品管理（商家端） ====================

function getMerchantDishes() {
  return get('/dishes').then(data => ({ data: data.map(normalizeDish) }));
}

function addDish(dishData) {
  return post('/dishes', {
    name: dishData.name,
    category_id: dishData.categoryId,
    price: dishData.price,
    image: dishData.image || '',
    description: dishData.description || '',
    status: dishData.status || 1,
    stock: dishData.stock || 999
  });
}

function updateDish(dishId, dishData) {
  return put(`/dishes/${dishId}`, dishData);
}

function deleteDish(dishId) {
  return del(`/dishes/${dishId}`);
}

function toggleDishStatus(dishId, status) {
  return patch(`/dishes/${dishId}/status`, { status });
}

// ==================== 桌位 ====================

function bindTable(tableNo, userId) {
  // 更新桌位状态为使用中（找到对应桌位）
  return get('/tables').then(tables => {
    const t = (tables || []).find(t => t.table_no === tableNo);
    if (t) return patch(`/tables/${t.id}/status`, { status: 1 });
    return Promise.resolve({ success: true });
  });
}

function unbindTable(tableNo) {
  return get('/tables').then(tables => {
    const t = (tables || []).find(t => t.table_no === tableNo);
    if (t) return patch(`/tables/${t.id}/status`, { status: 0 });
    return Promise.resolve({ success: true });
  });
}

// ==================== 用户登录 ====================

function merchantLogin(username, password) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: BASE_URL + '/auth/login',
      method: 'POST',
      data: { username, password },
      header: { 'Content-Type': 'application/json' },
      success(res) {
        const body = res.data;
        if (body && body.code === 0) {
          // 存储 JWT token
          wx.setStorageSync('adminToken', body.data.token);
          resolve(body.data);
        } else {
          reject(body?.msg || '登录失败');
        }
      },
      fail() { reject('网络错误'); }
    });
  });
}

// 兼容旧版 callFunction（不再实际调用云函数）
function callFunction(name, data = {}) {
  console.warn('[api.js] callFunction 已废弃，请直接使用对应函数');
  return Promise.reject('云函数已迁移至 HTTP API');
}

// 兼容旧版云数据库引用（提供空对象避免报错）
const db = {};
const _ = {};
const $ = {};

module.exports = {
  callFunction,
  merchantLogin,
  getCategories,
  getDishes,
  getDishDetail,
  getDishReviews,
  addReview,
  createOrder,
  payOrder,
  generateTakeNo,
  getOrders,
  getMerchantOrders,
  getOrderDetail,
  updateOrderStatus,
  createRefund,
  getRefunds,
  processRefund,
  getTodayStats,
  getMerchantDishes,
  addDish,
  updateDish,
  deleteDish,
  toggleDishStatus,
  bindTable,
  unbindTable,
  db,
  _,
  $
};
