// pages/merchant-orders/merchant-orders.js
const { getMerchantOrders, updateOrderStatus } = require('../../utils/api');
const { formatDate } = require('../../utils/util');

Page({
  data: {
    currentTab: 1,
    orders: [],
    counts: { 1: 0, 2: 0, 3: 0, 4: 0 },
    statusText: {
      0: '待支付',
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
    this.loadRefundBadge();
  },
  
  loadRefundBadge() {
    const isRefundRead = wx.getStorageSync('merchantRefundBadge') === 0;
    getMerchantOrders(4)
      .then(res => {
        const count = isRefundRead ? 0 : (res.data || []).length;
        this.setData({ 'counts[4]': count });
      })
      .catch(() => {
        this.setData({ 'counts[4]': 0 });
      });
  },

  onShow() {
    this.loadOrders();
  },

  onPullDownRefresh() {
    this.loadOrders();
  },

  switchTab(e) {
    const status = parseInt(e.currentTarget.dataset.status);
    this.setData({ currentTab: status });
    
    if (status === 4) {
      this.setData({ 'counts[4]': 0 });
      wx.setStorageSync('merchantRefundBadge', 0);
    }
    
    this.loadOrders();
  },

  async loadOrders() {
    this.setData({ loading: true });
    try {
      let res;
      if (this.data.currentTab === 4) {
        // 退款 tab：一次查 status=4（refunding/refunded）+ status=5（refund_done）
        const [res4, res5] = await Promise.all([
          getMerchantOrders(4),   // refunding + refunded（旧）
          getMerchantOrders(5)    // refund_done
        ]);
        const orders4 = res4.data || [];
        const orders5 = res5.data || [];
        res = { data: [...orders4, ...orders5] };
      } else {
        res = await getMerchantOrders(this.data.currentTab);
      }
      
      let orders = (res.data || []).map(item => ({
        ...item,
        createTime: formatDate(item.createTime || item.created_at, 'MM-DD HH:mm')
      }));
      
      this.setData({
        orders,
        loading: false,
        refreshing: false
      });
      
      this.loadCounts();
    } catch (e) {
      wx.showToast({ title: '加载失败: ' + (e.message || e.errMsg || '未知错误'), icon: 'none' });
      this.setData({ loading: false, refreshing: false });
    }
  },

  async loadCounts() {
    const counts = {};
    const isRefundRead = wx.getStorageSync('merchantRefundBadge') === 0;
    
    try {
      const res1 = await getMerchantOrders(1);
      counts[1] = (res1.data || []).length;
    } catch (e) {
      counts[1] = 0;
    }
    
    try {
      const res3 = await getMerchantOrders(3);
      counts[3] = (res3.data || []).length;
    } catch (e) {
      counts[3] = 0;
    }
    
    try {
      const [res4, res5] = await Promise.all([getMerchantOrders(4), getMerchantOrders(5)]);
      const refundCount = (res4.data || []).length + (res5.data || []).length;
      counts[4] = isRefundRead ? 0 : refundCount;
    } catch (e) {
      counts[4] = 0;
    }
    
    this.setData({ counts });
  },

  onRefresh() {
    this.setData({ refreshing: true });
    this.loadOrders();
  },

  onPullDownRefresh() {
    this.loadOrders();
    wx.stopPullDownRefresh();
  },

  async acceptOrder(e) {
    const id = e.currentTarget.dataset.id;
    try {
      await updateOrderStatus(id, 2);
      wx.showToast({ title: '已接单', icon: 'success' });
      this.loadOrders();
    } catch (e) {
      console.error('acceptOrder error:', e);
      wx.showToast({ title: '操作失败: ' + (e.message || '未知错误'), icon: 'none' });
    }
  },

  async completeOrder(e) {
    const id = e.currentTarget.dataset.id;
    try {
      await updateOrderStatus(id, 3);
      wx.showToast({ title: '已完成', icon: 'success' });
      this.loadOrders();
    } catch (e) {
      console.error('completeOrder error:', e);
      wx.showToast({ title: '操作失败: ' + (e.message || '未知错误'), icon: 'none' });
    }
  },

  async approveRefund(e) {
    const orderId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '提示',
      content: '确定同意该退款申请吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            // 直接用订单 id 更新状态为 refund_done（已退款=5）
            await updateOrderStatus(orderId, 5);
            wx.showToast({ title: '已退款', icon: 'success' });
            this.loadOrders();
          } catch (e) {
            console.error('approveRefund error:', e);
            wx.showToast({ title: '操作失败: ' + (e.message || '未知错误'), icon: 'none' });
          }
        }
      }
    });
  },

  async rejectRefund(e) {
    const orderId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '提示',
      content: '确定拒绝该退款申请吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            // 直接用订单 id 更新状态为 completed（已完成=3，表示拒绝退款）
            await updateOrderStatus(orderId, 3);
            wx.showToast({ title: '已拒绝', icon: 'success' });
            this.loadOrders();
          } catch (e) {
            console.error('rejectRefund error:', e);
            wx.showToast({ title: '操作失败: ' + (e.message || '未知错误'), icon: 'none' });
          }
        }
      }
    });
  }
});
