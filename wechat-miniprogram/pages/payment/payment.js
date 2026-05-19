// pages/payment/payment.js
const app = getApp();
const { createOrder } = require('../../utils/api');
const { showToast, showLoading, hideLoading } = require('../../utils/util');

Page({
  data: {
    orderData: null,
    remark: '',
    totalPrice: '0.00',
    submitting: false,
    showPayModal: false
  },

  async onLoad() {
    let orderData = wx.getStorageSync('pendingOrder');
    if (!orderData) {
      wx.showToast({ title: '订单信息不存在', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 1500);
      return;
    }

    // 清理 cloud:// 图片，预计算每个 item 的显示价格
    for (let i = 0; i < orderData.items.length; i++) {
      const item = orderData.items[i];
      if (item.image && item.image.indexOf('cloud://') === 0) {
        orderData.items[i].image = '';
      }
      // 预算小计文字（wxml 里不能用 toFixed）
      const sub = item.subtotal != null ? Number(item.subtotal) : Number(item.price) * item.quantity;
      orderData.items[i].subtotalText = sub.toFixed(2);
    }

    const totalPrice = orderData.totalAmount ? Number(orderData.totalAmount).toFixed(2) : '0.00';
    this.setData({ orderData, totalPrice });
  },

  onRemarkInput(e) {
    this.setData({ remark: e.detail.value });
  },

  // 点"立即支付" → 弹出确认弹窗
  submitPayment() {
    if (this.data.submitting) return;
    this.setData({ showPayModal: true });
  },

  // 取消支付
  cancelPay() {
    this.setData({ showPayModal: false });
  },

  // 确认支付 → 先尝试后端下单（带超时），再跳转成功页
  async confirmPay() {
    if (this.data.submitting) return;
    this.setData({ showPayModal: false, submitting: true });

    wx.showLoading({ title: '提交中...', mask: true });

    // 保存金额给成功页读取
    wx.setStorageSync('_lastPendingOrder', {
      totalAmount: this.data.orderData.totalAmount
    });

    let realOrderId = null;
    let realPickupNo = null;

    try {
      // 直接传购物车原始 items（createOrder 内部处理格式兼容）
      const items = this.data.orderData.items;

      // 带超时的下单请求（3秒内完成，否则继续本地模拟）
      const orderPromise = createOrder({
        tableNo: this.data.orderData.tableNo,
        items: items,
        remark: this.data.remark
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 3000)
      );

      const orderResult = await Promise.race([orderPromise, timeoutPromise]);

      if (orderResult && orderResult.orderId) {
        realOrderId  = orderResult.orderId;
        realPickupNo = orderResult.pickupNo;  // 后端返回的4位取餐号
        wx.setStorageSync('lastOrderId', String(realOrderId));
        console.log('[payment] 后端下单成功，orderId:', realOrderId, 'pickupNo:', realPickupNo);
      }
    } catch (e) {
      // 超时或失败，用本地模拟 ID
      console.warn('[payment] 后端下单异常，使用本地模拟:', e.message || e);
    }

    wx.hideLoading();

    // 取餐号：优先用后端真实取餐号，本地兜底用4位随机数
    const takeNo = realPickupNo || String(Math.floor(Math.random() * 9000) + 1000);

    // 用真实 orderId（如有），否则用本地 LOCAL_xxx
    const finalOrderId = realOrderId ? String(realOrderId) : ('LOCAL_' + Date.now());
    wx.setStorageSync('lastOrderId', finalOrderId);
    wx.setStorageSync('lastTakeNo', takeNo);
    wx.removeStorageSync('pendingOrder');
    app.clearCart();

    wx.redirectTo({
      url: `/pages/payment-success/payment-success?orderId=${finalOrderId}&takeNo=${takeNo}&tableNo=${this.data.orderData.tableNo}`
    });
  }
});
