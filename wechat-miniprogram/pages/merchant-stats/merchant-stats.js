// pages/merchant-stats/merchant-stats.js
const { getTodayStats, getMerchantDishes } = require('../../utils/api');

Page({
  data: {
    stats: {
      todayOrders: 0,
      todayRevenue: '0.00',
      cookingOrders: 0,
      completedOrders: 0,
      refundCount: 0,
      refundAmount: '0.00'
    },
    topDishes: []
  },

  onLoad() {
    this.loadStats();
    this.loadTopDishes();
  },

  async loadStats() {
    try {
      const stats = await getTodayStats();
      this.setData({
        stats: {
          todayOrders: stats.totalOrders || 0,
          todayRevenue: Number(stats.totalAmount || 0).toFixed(2),
          completedOrders: stats.completedOrders || 0,
          refundCount: stats.refundCount || 0,
          refundAmount: Number(stats.refundAmount || 0).toFixed(2)
        }
      });
    } catch (e) {
      console.error('加载统计数据失败:', e);
    }
  },

  async loadTopDishes() {
    try {
      const res = await getMerchantDishes();
      const dishes = (res.data || [])
        .sort((a, b) => (b.sales || 0) - (a.sales || 0))
        .slice(0, 10);
      
      this.setData({ topDishes: dishes });
    } catch (e) {
      console.error('加载菜品排行失败:', e);
    }
  }
});
