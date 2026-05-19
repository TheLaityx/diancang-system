// pages/payment-success/payment-success.js
const app = getApp();
const { getOrderDetail } = require('../../utils/api');

Page({
  data: {
    orderId: '',
    takeNo: '',
    tableNo: '',
    status: 1,
    orderNo: '',
    totalAmount: '0.00',
    invoiceTime: '',
    polling: null
  },

  onLoad(options) {
    const { orderId, takeNo, tableNo } = options;
    const now = new Date();
    const invoiceTime = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    // 先从本地缓存取金额（模拟支付时后端可能还没完成）
    const pending = wx.getStorageSync('_lastPendingOrder') || {};
    const localTotal = pending.totalAmount ? Number(pending.totalAmount).toFixed(2) : '0.00';

    this.setData({
      orderId,
      takeNo,
      tableNo,
      invoiceTime,
      totalAmount: localTotal,
      orderNo: 'SIM' + Date.now()
    });

    // 异步尝试从后端补全信息
    this.loadOrderInfo(orderId);
    // 只有真实订单ID才轮询状态
    if (!String(orderId).startsWith('LOCAL_')) {
      this.startPolling();
    }
  },

  async loadOrderInfo(orderId) {
    // LOCAL_ 开头是本地模拟订单，跳过后端查询
    if (String(orderId).startsWith('LOCAL_')) return;
    try {
      const res = await getOrderDetail(orderId);
      const order = res.data;
      
      if (order) {
        const now = new Date();
        const invoiceTime = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        this.setData({
          orderNo: order.orderNo || '',
          totalAmount: order.totalAmount ? Number(order.totalAmount).toFixed(2) : '0.00',
          invoiceTime: invoiceTime
        });
      }
    } catch (e) {
      console.error('加载订单信息失败:', e);
    }
  },

  onUnload() {
    this.stopPolling();
  },

  startPolling() {
    this.data.polling = setInterval(() => {
      this.checkOrderStatus();
    }, 3000);
  },

  stopPolling() {
    if (this.data.polling) {
      clearInterval(this.data.polling);
      this.data.polling = null;
    }
  },

  async checkOrderStatus() {
    try {
      const res = await getOrderDetail(this.data.orderId);
      const order = res.data;
      
      if (order) {
        let displayStatus = 1;
        if (order.status === 1) displayStatus = 1;
        else if (order.status === 2) displayStatus = 2;
        else if (order.status === 3) displayStatus = 3;
        
        this.setData({ status: displayStatus });

        if (order.status >= 3) {
          this.stopPolling();
        }
      }
    } catch (e) {
      console.error('检查订单状态失败:', e);
    }
  },

  viewOrderDetail() {
    wx.navigateTo({
      url: `/pages/order-detail/order-detail?id=${this.data.orderId}`
    });
  },

  backToMenu() {
    wx.switchTab({
      url: '/pages/index/index'
    });
  }
});
