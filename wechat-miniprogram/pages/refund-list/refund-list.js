// pages/refund-list/refund-list.js
const app = getApp();
const { getRefunds } = require('../../utils/api');
const { formatDate } = require('../../utils/util');

Page({
  data: {
    refunds: [],
    statusText: {
      0: '退款中',
      1: '退款成功',
      2: '已拒绝'
    },
    refreshing: false,
    loading: false
  },

  onLoad() {
    this.loadRefunds();
  },

  onShow() {
    this.loadRefunds();
  },

  async loadRefunds() {
    this.setData({ loading: true });
    
    try {
      const userId = wx.getStorageSync('userId') || app.globalData.userId || 'user_' + Date.now();
      const res = await getRefunds(userId);
      const refunds = (res.data || []).map(item => ({
        ...item,
        createTime: item.createTime ? formatDate(item.createTime, 'YYYY-MM-DD HH:mm') : '-'
      }));
      
      this.setData({
        refunds: refunds,
        loading: false,
        refreshing: false
      });
    } catch (e) {
      console.error('加载退款记录失败:', e);
      wx.showToast({ title: '加载失败: ' + (e.message || e.errMsg || '未知错误'), icon: 'none' });
      this.setData({ 
        refunds: [], 
        loading: false, 
        refreshing: false 
      });
    }
  },

  onRefresh() {
    this.setData({ refreshing: true });
    this.loadRefunds();
  },

  onPullDownRefresh() {
    this.loadRefunds();
    wx.stopPullDownRefresh();
  }
});
