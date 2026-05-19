// utils/constants.js - 常量定义
module.exports = {
  // 订单状态
  ORDER_STATUS: {
    PENDING_PAY: 0,      // 待支付
    PENDING_ACCEPT: 1,  // 待接单
    COOKING: 2,         // 制作中
    COMPLETED: 3,       // 已完成
    REFUNDING: 4,       // 退款中
    REFUNDED: 5,        // 已退款
    CANCELLED: 6        // 已取消
  },
  
  // 订单状态文本
  ORDER_STATUS_TEXT: {
    0: '待支付',
    1: '待接单',
    2: '制作中',
    3: '已完成',
    4: '退款中',
    5: '已退款',
    6: '已取消'
  },

  // 退款状态
  REFUND_STATUS: {
    PENDING: 0,     // 待审核
    APPROVED: 1,   // 已退款
    REJECTED: 2    // 已拒绝
  },

  // 桌台状态
  TABLE_STATUS: {
    FREE: 0,       // 空闲
    OCCUPIED: 1   // 使用中
  },

  // 菜品状态
  DISH_STATUS: {
    OFFLINE: 0,   // 下架
    ONLINE: 1     // 上架
  },

  // 云函数名称
  CLOUD_FUNCTIONS: {
    LOGIN: 'login',
    ORDER_CREATE: 'orderCreate',
    ORDER_PAY: 'orderPay',
    ORDER_UPDATE: 'orderUpdate',
    ORDER_LIST: 'orderList',
    ORDER_DETAIL: 'orderDetail',
    DISH_LIST: 'dishList',
    DISH_DETAIL: 'dishDetail',
    DISH_CREATE: 'dishCreate',
    DISH_UPDATE: 'dishUpdate',
    DISH_DELETE: 'dishDelete',
    CATEGORY_LIST: 'categoryList',
    TABLE_BIND: 'tableBind',
    REFUND_CREATE: 'refundCreate',
    REFUND_LIST: 'refundList',
    REFUND_UPDATE: 'refundUpdate',
    STATS_GET: 'statsGet'
  },

  // 存储key
  STORAGE_KEYS: {
    USER_INFO: 'userInfo',
    USER_ID: 'userId',
    TABLE_NO: 'tableNo',
    MERCHANT_INFO: 'merchantInfo',
    CART: 'cart'
  },

  // 颜色
  COLORS: {
    PRIMARY: '#C68D56',
    PRIMARY_DARK: '#A67B4B',
    PRIMARY_LIGHT: '#E8D5C4',
    BG_COLOR: '#F5F5F5',
    WHITE: '#FFFFFF',
    TEXT_MAIN: '#333333',
    TEXT_SECONDARY: '#666666',
    TEXT_LIGHT: '#999999',
    BORDER: '#E5E5E5',
    SUCCESS: '#67C23A',
    WARNING: '#E6A23C',
    ERROR: '#F56C6C'
  }
};
