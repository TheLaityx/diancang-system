// pages/merchant/merchant.js
const app = getApp();
const { getMerchantOrders, updateOrderStatus, getTodayStats } = require('../../utils/api');

Page({
  data: {
    merchantInfo: null,
    stats: {
      todayOrders: 0,
      todayRevenue: '0.00',
      completedOrders: 0
    },
    pendingCount: 0,
    pendingOrders: [],
    polling: null
  },

  onLoad() {
    this.setData({
      merchantInfo: app.globalData.merchantInfo
    });
    this.loadStats();
    this.loadPendingOrders();
    this.startPolling();
  },

  onUnload() {
    this.stopPolling();
  },

  onShow() {
    this.loadStats();
    this.loadPendingOrders();
  },

  startPolling() {
    this.data.polling = setInterval(() => {
      this.loadPendingOrders();
      this.loadStats();
    }, 10000);
  },

  stopPolling() {
    if (this.data.polling) {
      clearInterval(this.data.polling);
      this.data.polling = null;
    }
  },

  async loadStats() {
    try {
      const stats = await getTodayStats();
      this.setData({
        stats: {
          todayOrders: stats.totalOrders || 0,
          todayRevenue: Number(stats.totalAmount || 0).toFixed(2),  // MySQL直接存元
          cookingOrders: stats.cookingOrders || 0
        }
      });
    } catch (e) {
      console.error('加载统计数据失败:', e);
    }
  },

  async loadPendingOrders() {
    try {
      const res = await getMerchantOrders(1);
      const orders = res.data || [];
      this.setData({
        pendingOrders: orders.slice(0, 5),
        pendingCount: orders.length
      });
    } catch (e) {
      console.error('加载待处理订单失败:', e);
    }
  },

  goToOrders() {
    wx.navigateTo({
      url: '/pages/merchant-orders/merchant-orders'
    });
  },

  goToDishes() {
    wx.navigateTo({
      url: '/pages/merchant-dishes/merchant-dishes'
    });
  },

  goToStats() {
    wx.navigateTo({
      url: '/pages/merchant-stats/merchant-stats'
    });
  },

  goToSettings() {
    wx.navigateTo({
      url: '/pages/merchant-settings/merchant-settings'
    });
  },

  viewOrder(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/order-detail/order-detail?id=${id}`
    });
  },

  async acceptOrder(e) {
    const id = e.currentTarget.dataset.id;
    try {
      await updateOrderStatus(id, 2);
      wx.showToast({
        title: '已接单',
        icon: 'success'
      });
      this.loadPendingOrders();
      this.loadStats();
    } catch (e) {
      wx.showToast({
        title: '操作失败',
        icon: 'none'
      });
    }
  }
});
