// app.js - 小程序入口文件
App({
  // 全局变量
  globalData: {
    userInfo: null,
    userId: null,
    tableNo: null,        // 当前绑定的桌号
    isMerchant: false,    // 是否是商家端
    merchantInfo: null,   // 商家信息
    cart: []              // 购物车
  },

  onLaunch() {
    // 已迁移至 Node.js + MySQL 后端，不再使用云开发
    // 后端地址：http://localhost:3000
    // 开发时：微信开发者工具 → 详情 → 本地设置 → 勾选"不校验合法域名"

    let userId = wx.getStorageSync('userId');
    if (!userId) {
      userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      wx.setStorageSync('userId', userId);
    }
    
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.globalData.userInfo = userInfo;
    }
    this.globalData.userId = userId;
    
    this.checkMerchantStatus();
    this.checkTableStatus();
  },

  // 检查商家登录状态
  checkMerchantStatus() {
    const merchantInfo = wx.getStorageSync('merchantInfo');
    if (merchantInfo) {
      this.globalData.isMerchant = true;
      this.globalData.merchantInfo = merchantInfo;
    }
  },

  // 检查桌号绑定状态
  checkTableStatus() {
    const tableNo = wx.getStorageSync('tableNo');
    if (tableNo) {
      this.globalData.tableNo = tableNo;
    }
  },

  // 绑定桌号
  bindTable(tableNo) {
    this.globalData.tableNo = tableNo;
    wx.setStorageSync('tableNo', tableNo);
  },

  // 解除桌号绑定
  unbindTable() {
    this.globalData.tableNo = null;
    wx.removeStorageSync('tableNo');
  },

  // 商家登录
  merchantLogin(merchantInfo) {
    this.globalData.isMerchant = true;
    this.globalData.merchantInfo = merchantInfo;
    wx.setStorageSync('merchantInfo', merchantInfo);
  },

  // 商家登出
  merchantLogout() {
    this.globalData.isMerchant = false;
    this.globalData.merchantInfo = null;
    wx.removeStorageSync('merchantInfo');
  },

  // 添加到购物车
  addToCart(dish, specs = '', quantity = 1) {
    const cart = this.globalData.cart;
    const key = dish._id + '_' + specs;
    
    // 检查是否已存在
    const existingIndex = cart.findIndex(item => item.key === key);
    
    if (existingIndex > -1) {
      cart[existingIndex].quantity += quantity;
      cart[existingIndex].subtotal = Number(cart[existingIndex].price) * cart[existingIndex].quantity;
    } else {
      cart.push({
        key: key,
        dishId: dish._id,
        name: dish.name,
        image: dish.image,
        price: dish.price,
        specs: specs,
        quantity: quantity,
        subtotal: Number(dish.price) * quantity
      });
    }
    
    this.globalData.cart = cart;
    return cart;
  },

  // 更新购物车商品数量
  updateCartQuantity(key, quantity) {
    const cart = this.globalData.cart;
    const index = cart.findIndex(item => item.key === key);
    
    if (index > -1) {
      if (quantity <= 0) {
        cart.splice(index, 1);
      } else {
        cart[index].quantity = quantity;
        cart[index].subtotal = cart[index].price * quantity;
      }
    }
    
    this.globalData.cart = cart;
    return cart;
  },

  // 清空购物车
  clearCart() {
    this.globalData.cart = [];
  },

  // 获取购物车总数量
  getCartCount() {
    return this.globalData.cart.reduce((sum, item) => sum + item.quantity, 0);
  },

  // 获取购物车总金额
  getCartTotal() {
    return this.globalData.cart.reduce((sum, item) => sum + item.subtotal, 0);
  }
});
