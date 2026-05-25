// pages/order-detail/order-detail.js
const { getOrderDetail } = require('../../utils/api');
const { formatDate } = require('../../utils/util');

Page({
  data: {
    orderId: '',
    order: null,
    statusText: {
      0: '待接单',
      1: '待接单',
      2: '制作中',
      3: '已完成',
      4: '退款申请中',
      5: '已退款',
      6: '已取消'
    }
  },

  onLoad(options) {
    const { id } = options;
    if (id) {
      this.setData({ orderId: id });
      this.loadOrderDetail(id);
    }
  },

  async loadOrderDetail(id) {
    try {
      const res = await getOrderDetail(id);
      const orderData = res.data;

      if (orderData && orderData._id) {
        orderData.createTime = formatDate(orderData.createTime, 'YYYY-MM-DD HH:mm');

        // 检查该订单是否已评价
        const reviewedOrders = wx.getStorageSync('reviewedOrders') || [];
        orderData.isReviewed = reviewedOrders.includes(orderData._id);

        this.setData({ order: orderData });
      } else {
        wx.showToast({ title: '订单不存在', icon: 'none' });
      }
    } catch (e) {
      console.error('加载订单失败:', e);
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  applyRefund() {
    const { orderId } = this.data;
    wx.navigateTo({
      url: `/pages/refund/refund?orderId=${orderId}`
    });
  },

  goToReview() {
    const { order, orderId } = this.data;
    const items = order.items || [];
    if (items.length > 0) {
      const firstDish = items[0];
      wx.navigateTo({
        url: `/pages/dish/dish?id=${firstDish.dishId}&canReview=1&orderId=${orderId}`
      });
    } else {
      wx.showToast({ title: '订单中没有菜品', icon: 'none' });
    }
  },

  viewReview() {
    const { order, orderId } = this.data;
    const items = order.items || [];
    if (items.length > 0) {
      const firstDish = items[0];
      wx.navigateTo({
        url: `/pages/dish/dish?id=${firstDish.dishId}&viewReview=1&orderId=${orderId}`
      });
    } else {
      wx.showToast({ title: '订单中没有菜品', icon: 'none' });
    }
  },

  backToList() {
    wx.navigateBack();
  }
});
