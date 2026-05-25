// pages/order/order.js
const app = getApp();
const { getOrders, getOrderDetail } = require('../../utils/api');
const { formatDate } = require('../../utils/util');

Page({
  data: {
    currentTab: -1,
    orders: [],
    statusText: {
      0: '待接单',
      1: '待接单',
      2: '制作中',
      3: '已完成',
      4: '退款申请中',
      5: '已退款',
      6: '已取消'
    },
    refreshing: false,
    loading: false
  },

  onLoad() {
    this.loadOrders();
  },

  onShow() {
    this.loadOrders();
  },

  switchTab(e) {
    const status = parseInt(e.currentTarget.dataset.status);
    this.setData({ currentTab: status });
    this.loadOrders();
  },

  async loadOrders() {
    let userId = wx.getStorageSync('userId') || app.globalData.userId;
    
    if (!userId) {
      userId = 'user_' + Date.now();
      wx.setStorageSync('userId', userId);
      app.globalData.userId = userId;
    }
    
    this.setData({ loading: true });
    
    try {
      let res;
      const tab = this.data.currentTab;
      
      if (tab === 5) {
        // 退款 tab：同时查退款申请中(4)和已退款(5)，用 == 兼容类型
        const [res4, res5] = await Promise.all([
          getOrders(userId, 4),   // status=4: refunding/refunded
          getOrders(userId, 5)    // status=5: refund_done
        ]);
        const allRefund = [...(res4.data || []), ...(res5.data || [])];
        // 按时间倒序
        allRefund.sort((a, b) => new Date(b.createTime || 0) - new Date(a.createTime || 0));
        res = { data: allRefund };
      } else if (tab === -1) {
        res = await getOrders(userId, null);
      } else {
        res = await getOrders(userId, tab);
      }
      
      const reviewedOrders = wx.getStorageSync('reviewedOrders') || [];
      const orders = (res.data || []).map(item => ({
        ...item,
        createTime: formatDate(item.createTime, 'MM-DD HH:mm'),
        isReviewed: reviewedOrders.includes(item._id)
      }));
      
      this.setData({
        orders: orders,
        loading: false,
        refreshing: false
      });
    } catch (e) {
      wx.showToast({ title: '加载失败: ' + (e.message || e.errMsg || '未知错误'), icon: 'none' });
      this.setData({ 
        orders: [],
        loading: false, 
        refreshing: false 
      });
    }
  },

  onRefresh() {
    this.setData({ refreshing: true });
    this.loadOrders();
  },

  onPullDownRefresh() {
    this.loadOrders();
    wx.stopPullDownRefresh();
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/order-detail/order-detail?id=${id}`
    });
  },

  applyRefund(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/refund/refund?orderId=${id}`
    });
  },

  goToReview(e) {
    const id = e.currentTarget.dataset.id;
    // 先获取订单详情，拿到第一个菜品进行评价
    getOrderDetail(id).then(res => {
      const order = res.data;
      const items = order.items || [];
      if (items.length > 0) {
        const firstDish = items[0];
        wx.navigateTo({
          url: `/pages/dish/dish?id=${firstDish.dishId}&canReview=1&orderId=${id}`
        });
      } else {
        wx.showToast({ title: '订单中没有菜品', icon: 'none' });
      }
    }).catch(() => {
      wx.showToast({ title: '加载订单失败', icon: 'none' });
    });
  },

  viewReview(e) {
    const id = e.currentTarget.dataset.id;
    // 跳转到菜品详情页查看评价（viewReview=1 表示查看已评价模式，隐藏购物车）
    getOrderDetail(id).then(res => {
      const order = res.data;
      const items = order.items || [];
      if (items.length > 0) {
        const firstDish = items[0];
        wx.navigateTo({
          url: `/pages/dish/dish?id=${firstDish.dishId}&viewReview=1&orderId=${id}`
        });
      } else {
        wx.showToast({ title: '订单中没有菜品', icon: 'none' });
      }
    }).catch(() => {
      wx.showToast({ title: '加载订单失败', icon: 'none' });
    });
  }
});
