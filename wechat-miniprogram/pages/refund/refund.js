// pages/refund/refund.js
const app = getApp();
const { createRefund } = require('../../utils/api');
const { showToast, showLoading, hideLoading } = require('../../utils/util');

Page({
  data: {
    orderId: '',
    reasons: [
      '菜品口味不佳',
      '菜品与描述不符',
      '等待时间过长',
      '不想点了',
      '其他原因'
    ],
    selectedReason: 0,
    detail: ''
  },

  onLoad(options) {
    const { orderId } = options;
    if (orderId) {
      this.setData({ orderId });
    }
  },

  selectReason(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({ selectedReason: index });
  },

  onReasonInput(e) {
    this.setData({ detail: e.detail.value });
  },

  async submitRefund() {
    const { orderId, reasons, selectedReason, detail } = this.data;
    
    const reason = reasons[selectedReason] + (detail ? ` - ${detail}` : '');
    const userId = wx.getStorageSync('userId') || app.globalData.userId || 'user_' + Date.now();
    
    showLoading('提交申请...');
    
    try {
      await createRefund(orderId, reason, userId);
      hideLoading();
      
      wx.showToast({
        title: '申请已提交',
        icon: 'success'
      });
      
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } catch (e) {
      hideLoading();
      showToast(e.message || '提交失败');
    }
  }
});
