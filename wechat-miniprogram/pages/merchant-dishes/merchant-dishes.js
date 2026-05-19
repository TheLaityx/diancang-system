// pages/merchant-dishes/merchant-dishes.js
const { getMerchantDishes, toggleDishStatus, deleteDish, normalizeDish } = require('../../utils/api');

Page({
  data: {
    dishes: [],
    refreshing: false,
    loading: false
  },

  onLoad() {
    this.loadDishes();
  },

  onShow() {
    this.loadDishes();
  },

  onPullDownRefresh() {
    this.loadDishes();
  },

  async loadDishes() {
    this.setData({ loading: true });
    try {
      const res = await getMerchantDishes();
      this.setData({
        dishes: res.data || [],
        loading: false,
        refreshing: false
      });
    } catch (e) {
      this.setData({ loading: false, refreshing: false });
    }
  },

  onRefresh() {
    this.setData({ refreshing: true });
    this.loadDishes();
  },

  addDish() {
    wx.navigateTo({
      url: '/pages/merchant-dish-edit/merchant-dish-edit'
    });
  },

  editDish(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/merchant-dish-edit/merchant-dish-edit?id=${id}`
    });
  },

  async toggleStatus(e) {
    const id = e.currentTarget.dataset.id;
    const status = e.currentTarget.dataset.status;
    const newStatus = status === 1 ? 0 : 1;
    
    try {
      await toggleDishStatus(id, newStatus);
      wx.showToast({
        title: newStatus === 1 ? '已上架' : '已下架',
        icon: 'success'
      });
      this.loadDishes();
    } catch (e) {
      wx.showToast({ title: '操作失败', icon: 'none' });
    }
  },

  async deleteDish(e) {
    const id = e.currentTarget.dataset.id;
    const name = e.currentTarget.dataset.name;
    wx.showModal({
      title: '提示',
      content: `确定要删除「${name || '该菜品'}」吗？`,
      success: async (res) => {
        if (res.confirm) {
          try {
            wx.showLoading({ title: '删除中...' });
            await deleteDish(id);
            wx.hideLoading();
            wx.showToast({ title: '已删除', icon: 'success' });
            this.loadDishes();
          } catch (err) {
            wx.hideLoading();
            wx.showToast({ title: '删除失败: ' + (err || '未知错误'), icon: 'none' });
          }
        }
      }
    });
  }
});
