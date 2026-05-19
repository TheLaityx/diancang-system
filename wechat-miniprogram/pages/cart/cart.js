// pages/cart/cart.js
const app = getApp();

Page({
  data: {
    cart: [],
    tableNo: null,
    totalPrice: '0.00',
    remark: ''
  },

  onLoad() {
    this.setData({
      tableNo: app.globalData.tableNo
    });
  },

  onShow() {
    this.loadCart();
  },

  loadCart() {
    const cart = app.globalData.cart;
    this.setData({
      cart: cart,
      tableNo: app.globalData.tableNo,
      totalPrice: Number(app.getCartTotal()).toFixed(2)
    });
  },

  onRemarkInput(e) {
    this.setData({
      remark: e.detail.value
    });
  },

  decreaseQuantity(e) {
    const key = e.currentTarget.dataset.key;
    app.updateCartQuantity(key, app.globalData.cart.find(item => item.key === key).quantity - 1);
    this.loadCart();
  },

  increaseQuantity(e) {
    const key = e.currentTarget.dataset.key;
    app.updateCartQuantity(key, app.globalData.cart.find(item => item.key === key).quantity + 1);
    this.loadCart();
  },

  goMenu() {
    wx.switchTab({
      url: '/pages/index/index'
    });
  },

  goPayment() {
    if (!this.data.tableNo) {
      const tableList = [];
      for (let i = 1; i <= 10; i++) {
        tableList.push(`${i}号桌`);
      }
      
      wx.showActionSheet({
        itemList: tableList,
        success: (res) => {
          const tableNo = res.tapIndex + 1;
          app.bindTable(tableNo);
          this.setData({ tableNo });
          this.goPayment();
        }
      });
      return;
    }

    const cartData = {
      items: this.data.cart,
      totalAmount: app.getCartTotal(),
      remark: this.data.remark,
      tableNo: this.data.tableNo
    };

    wx.setStorageSync('pendingOrder', cartData);

    wx.navigateTo({
      url: '/pages/payment/payment'
    });
  }
});
