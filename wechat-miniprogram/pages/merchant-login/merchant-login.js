// pages/merchant-login/merchant-login.js
const app = getApp();
const { merchantLogin: apiLogin } = require('../../utils/api');
const { showToast, showLoading, hideLoading, parseQrCode } = require('../../utils/util');

Page({
  data: {
    username: '',
    password: '',
    remember: false,
    loading: false
  },

  onLoad() {
    const savedUsername = wx.getStorageSync('savedUsername');
    const savedPassword = wx.getStorageSync('savedPassword');
    const remember = wx.getStorageSync('rememberPassword');
    
    if (remember && savedUsername && savedPassword) {
      this.setData({
        username: savedUsername,
        password: savedPassword,
        remember: true
      });
    }
  },

  onUsernameInput(e) {
    this.setData({
      username: e.detail.value
    });
  },

  onPasswordInput(e) {
    this.setData({
      password: e.detail.value
    });
  },

  onRememberChange(e) {
    this.setData({
      remember: e.detail.value.includes('remember')
    });
  },

  async handleLogin() {
    const { username, password, loading } = this.data;
    
    if (!username) {
      showToast('请输入账号', 'none');
      return;
    }
    
    if (!password) {
      showToast('请输入密码', 'none');
      return;
    }
    
    if (loading) return;
    
    this.setData({ loading: true });
    showLoading('登录中...');
    
    try {
      const mockMerchant = {
        _id: 'merchant_001',
        username: username,
        name: '扫码点餐商家'
      };
      
      if (this.data.remember) {
        wx.setStorageSync('savedUsername', username);
        wx.setStorageSync('savedPassword', password);
        wx.setStorageSync('rememberPassword', true);
      } else {
        wx.removeStorageSync('savedUsername');
        wx.removeStorageSync('savedPassword');
        wx.setStorageSync('rememberPassword', false);
      }
      
      app.merchantLogin(mockMerchant);
      hideLoading();
      
      wx.showToast({
        title: '登录成功',
        icon: 'success'
      });
      
      setTimeout(() => {
        wx.redirectTo({
          url: '/pages/merchant/merchant'
        });
      }, 1500);
      
    } catch (e) {
      hideLoading();
      showToast(e.message || '登录失败');
      this.setData({ loading: false });
    }
  },

  scanLogin() {
    wx.scanCode({
      success: (res) => {
        const username = parseQrCode(res.result);
        if (username) {
          this.setData({ username });
          showToast('请输入密码');
        } else {
          showToast('无效的二维码', 'none');
        }
      },
      fail: () => {
        showToast('扫码失败', 'none');
      }
    });
  }
});
