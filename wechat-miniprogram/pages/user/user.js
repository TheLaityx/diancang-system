// pages/user/user.js
const app = getApp();

Page({
  data: {
    userInfo: null,
    isMerchant: false,
    merchantInfo: null
  },

  onShow() {
    this.setData({
      userInfo: app.globalData.userInfo,
      isMerchant: app.globalData.isMerchant,
      merchantInfo: app.globalData.merchantInfo
    });
  },

  login() {
    if (this.data.userInfo) return;
    
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        const userInfo = res.userInfo;
        app.globalData.userInfo = userInfo;
        app.globalData.userId = 'user_' + Date.now();
        
        wx.setStorageSync('userInfo', userInfo);
        wx.setStorageSync('userId', app.globalData.userId);
        
        this.setData({ userInfo: userInfo });
        wx.showToast({ title: '登录成功', icon: 'success' });
      },
      fail: () => {
        wx.showToast({ title: '授权失败', icon: 'none' });
      }
    });
  },

  goToOrders() {
    wx.switchTab({
      url: '/pages/order/order'
    });
  },

  goToRefunds() {
    wx.navigateTo({
      url: '/pages/refund-list/refund-list'
    });
  },

  contactMerchant() {
    wx.showModal({
      title: '联系商家',
      content: '如需联系商家，请拨打门店电话',
      showCancel: false
    });
  },

  goToMerchantLogin() {
    wx.navigateTo({
      url: '/pages/merchant-login/merchant-login'
    });
  },

  goToMerchant() {
    wx.navigateTo({
      url: '/pages/merchant/merchant'
    });
  },

  clearOrderHistory() {
    wx.showModal({
      title: '清空订单记录',
      content: '将重置用户标识，历史订单记录将不再显示，确认继续？',
      confirmColor: '#e74c3c',
      success: (res) => {
        if (res.confirm) {
          // 生成新 userId，旧订单记录对本设备不可见
          const newUserId = 'user_' + Date.now();
          wx.setStorageSync('userId', newUserId);
          app.globalData.userId = newUserId;
          wx.showToast({ title: '已清空', icon: 'success' });
        }
      }
    });
  },

  logout() {
    wx.showModal({
      title: '提示',
      content: '确定要清除用户数据吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('userInfo');
          wx.removeStorageSync('tableNo');
          wx.removeStorageSync('cart');
          app.globalData.userInfo = null;
          app.globalData.tableNo = null;
          app.globalData.cart = [];
          this.setData({
            userInfo: null
          });
          wx.showToast({
            title: '已清除'
          });
        }
      }
    });
  }
});
