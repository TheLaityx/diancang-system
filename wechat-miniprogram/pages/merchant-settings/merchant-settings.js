// pages/merchant-settings/merchant-settings.js
const app = getApp();

Page({
  changePassword() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  logout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          app.merchantLogout();
          wx.showToast({
            title: '已退出登录'
          });
          setTimeout(() => {
            wx.reLaunch({
              url: '/pages/index/index'
            });
          }, 1500);
        }
      }
    });
  }
});
