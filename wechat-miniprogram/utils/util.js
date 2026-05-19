// utils/util.js - 工具函数

/**
 * 格式化金额（分转元）
 */
function formatPrice(price) {
  return (price / 100).toFixed(2);
}

/**
 * 格式化日期
 */
function formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!date) return '';
  
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hour = String(d.getHours()).padStart(2, '0');
  const minute = String(d.getMinutes()).padStart(2, '0');
  const second = String(d.getSeconds()).padStart(2, '0');
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hour)
    .replace('mm', minute)
    .replace('ss', second);
}

/**
 * 生成取餐号
 */
function generateTakeNo(tableNo) {
  const timestamp = Date.now().toString().slice(-6);
  const tablePrefix = String(tableNo).padStart(2, '0');
  return `${tablePrefix}${timestamp}`;
}

/**
 * 生成订单号
 */
function generateOrderNo() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD${timestamp}${random}`;
}

/**
 * 显示Toast
 */
function showToast(title, icon = 'none') {
  wx.showToast({
    title,
    icon,
    duration: 2000
  });
}

/**
 * 显示Loading
 */
function showLoading(title = '加载中...') {
  wx.showLoading({
    title,
    mask: true
  });
}

/**
 * 隐藏Loading
 */
function hideLoading() {
  wx.hideLoading();
}

/**
 * 显示确认对话框
 */
function showConfirm(title, content) {
  return new Promise((resolve) => {
    wx.showModal({
      title,
      content,
      success: (res) => {
        resolve(res.confirm);
      },
      fail: () => {
        resolve(false);
      }
    });
  });
}

/**
 * 解析二维码参数
 */
function parseQrCode(qrCode) {
  try {
    const url = decodeURIComponent(qrCode);
    const match = url.match(/[?&]table=(\d+)/);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
    return null;
  } catch (e) {
    return null;
  }
}

/**
 * 防抖
 */
function debounce(fn, delay = 300) {
  let timer = null;
  return function(...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

/**
 * 节流
 */
function throttle(fn, delay = 300) {
  let last = 0;
  return function(...args) {
    const now = Date.now();
    if (now - last > delay) {
      last = now;
      fn.apply(this, args);
    }
  };
}

/**
 * 获取订单状态颜色
 */
function getStatusColor(status) {
  const colorMap = {
    0: '#E6A23C',
    1: '#409EFF',
    2: '#E6A23C',
    3: '#67C23A',
    4: '#F56C6C',
    5: '#909399',
    6: '#909399'
  };
  return colorMap[status] || '#909399';
}

/**
 * 获取订单状态文本
 */
function getStatusText(status) {
  const textMap = {
    0: '待支付',
    1: '待接单',
    2: '制作中',
    3: '已完成',
    4: '退款中',
    5: '已退款',
    6: '已取消'
  };
  return textMap[status] || '未知';
}

/**
 * 深拷贝
 */
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  
  const clone = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      clone[key] = deepClone(obj[key]);
    }
  }
  return clone;
}

module.exports = {
  formatPrice,
  formatDate,
  generateTakeNo,
  generateOrderNo,
  showToast,
  showLoading,
  hideLoading,
  showConfirm,
  parseQrCode,
  debounce,
  throttle,
  getStatusColor,
  getStatusText,
  deepClone
};
