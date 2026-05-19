// pages/index/index.js
const app = getApp();
const { getCategories, getDishes } = require('../../utils/api');
const { showToast, showLoading, hideLoading, parseQrCode } = require('../../utils/util');

Page({
  data: {
    categories: [],
    dishes: [],
    currentCategory: '',
    searchKeyword: '',
    tableNo: null,
    cartCount: 0,
    cartTotal: 0,
    cart: [],
    showCart: false,
    showCartPreview: false,
    page: 1,
    pageSize: 20,
    hasMore: true,
    loading: false,
    refreshing: false,
    // 选桌弹窗
    showTableModal: false,
    tableOptions: [1,2,3,4,5,6,7,8,9,10]
  },

  onLoad(options) {
    // ---- 扫码自动绑桌 ----
    // 支持路径参数 ?table=1 ~ ?table=10
    const tableParam = options.table || options.tableNo; // 兼容旧参数名
    if (tableParam) {
      const tableNo = String(tableParam);
      app.bindTable(tableNo);
      this.setData({ tableNo });
      wx.showToast({ title: `已自动入座 ${tableNo} 号桌`, icon: 'success', duration: 2000 });
    } else {
      // 没有扫码参数，读取已缓存桌号
      this.setData({ tableNo: app.globalData.tableNo });
    }

    this.loadCategories();
    this.loadDishes();
    this.updateCartInfo();
  },

  onShow() {
    this.setData({
      tableNo: app.globalData.tableNo
    });
    this.updateCartInfo();
    this.loadDishes();
  },

  // ==================== 加载数据 ====================

  // 加载分类
  async loadCategories() {
    try {
      const res = await getCategories();
      this.setData({
        categories: res.data || []
      });
    } catch (e) {
      console.error('加载分类失败:', e);
    }
  },

  // 加载菜品
  async loadDishes(loadMore = false) {
    if (this.data.loading) return;
    
    this.setData({ loading: true });
    
    try {
      const page = loadMore ? this.data.page + 1 : 1;
      const res = await getDishes(
        this.data.currentCategory || null,
        this.data.searchKeyword || null
      );
      
      const cart = app.globalData.cart;
      const newDishes = (res.data || []).slice(0, this.data.pageSize).map(dish => {
        const cartItem = cart.find(item => item.dishId === dish._id);
        if (cartItem) {
          return {
            ...dish,
            inCart: true,
            cartKey: cartItem.key,
            cartQuantity: cartItem.quantity
          };
        }
        return {
          ...dish,
          inCart: false
        };
      });
      
      this.setData({
        dishes: loadMore ? [...this.data.dishes, ...newDishes] : newDishes,
        page: page,
        hasMore: newDishes.length >= this.data.pageSize,
        loading: false,
        refreshing: false
      });
    } catch (e) {
      console.error('加载菜品失败:', e);
      this.setData({ loading: false, refreshing: false });
    }
  },

  // ==================== 搜索 ====================

  onSearchInput(e) {
    this.setData({
      searchKeyword: e.detail.value
    });
  },

  onSearch() {
    this.setData({
      page: 1,
      hasMore: true,
      loading: false
    });
    this.loadDishes();
  },

  // ==================== 分类 ====================

  onCategoryChange(e) {
    const category = e.currentTarget.dataset.category;
    this.setData({
      currentCategory: category,
      page: 1,
      hasMore: true
    });
    this.loadDishes();
  },

  // ==================== 下拉刷新 / 加载更多 ====================

  onRefresh() {
    this.setData({ refreshing: true });
    this.loadDishes();
  },

  onLoadMore() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadDishes(true);
    }
  },

  // ==================== 桌号 ====================

  // 🪑 桌号芯片点击 → 打开自定义选桌弹窗
  showTablePicker() {
    this.setData({ showTableModal: true });
  },

  closeTableModal() {
    this.setData({ showTableModal: false });
  },

  selectTable(e) {
    const tableNo = String(e.currentTarget.dataset.no);
    app.bindTable(tableNo);
    this.setData({ tableNo, showTableModal: false });
    showToast(`已选择 ${tableNo} 号桌`);
  },

  scanQrCode() {
    wx.scanCode({
      success: (res) => {
        const raw = res.result.trim();
        // 优先识别 ?table=X 格式（如 pages/index/index?table=3）
        const tableMatch = raw.match(/[?&]table=(\d+)/);
        // 兼容纯数字
        const numMatch = raw.match(/^(\d{1,2})$/);
        if (tableMatch) {
          const num = parseInt(tableMatch[1]);
          if (num >= 1 && num <= 10) {
            app.bindTable(String(num));
            this.setData({ tableNo: String(num) });
            showToast(`已入座 ${num} 号桌`);
          } else {
            showToast('无效的二维码', 'none');
          }
        } else if (numMatch) {
          const num = parseInt(numMatch[1]);
          if (num >= 1 && num <= 10) {
            app.bindTable(String(num));
            this.setData({ tableNo: String(num) });
            showToast(`已入座 ${num} 号桌`);
          } else {
            showToast('无效的二维码', 'none');
          }
        } else {
          showToast('无效的二维码', 'none');
        }
      },
      fail: () => {
        showToast('扫码失败', 'none');
      }
    });
  },

  // ==================== 购物车操作 ====================

  updateCartInfo() {
    this.setData({
      cartCount: app.getCartCount(),
      cartTotal: Number(app.getCartTotal()).toFixed(2)  // MySQL直接存元，不除以100
    });
  },

  addToCart(e) {
    const dish = e.currentTarget.dataset.dish;
    app.addToCart(dish);
    this.updateCartInfo();
    this.setData({
      showCartPreview: true,
      cart: app.globalData.cart
    });
    // 2秒后自动隐藏小提示
    if (this._previewTimer) clearTimeout(this._previewTimer);
    this._previewTimer = setTimeout(() => {
      this.setData({ showCartPreview: false });
    }, 2000);
    // 刷新菜品列表中的购物车状态
    const updatedDishes = this.data.dishes.map(d => {
      if (d._id === dish._id) {
        const cartItem = app.globalData.cart.find(i => i.dishId === d._id);
        return cartItem
          ? { ...d, inCart: true, cartKey: cartItem.key, cartQuantity: cartItem.quantity }
          : { ...d, inCart: false };
      }
      return d;
    });
    this.setData({ dishes: updatedDishes });
  },

  // 阻止事件冒泡（数量控制器使用 catchtap，此函数兜底）
  stopProp() {},

  openCartPanel() {
    this.setData({
      showCartPreview: false,
      showCart: true,
      cart: app.globalData.cart
    });
  },

  hideCartPanel() {
    this.setData({ showCart: false });
  },

  showCartPreview() {
    this.setData({
      showCartPreview: true,
      cart: app.globalData.cart
    });
  },

  hideCartPreview() {
    this.setData({ showCartPreview: false });
  },

  showCartPanel() {
    this.setData({
      showCart: true,
      cart: app.globalData.cart
    });
  },

  clearCart() {
    app.clearCart();
    this.updateCartInfo();
    this.setData({
      showCart: false,
      cart: []
    });
    this.loadDishes();
    showToast('已清空');
  },

  decreaseCartItem(e) {
    const key = e.currentTarget.dataset.key;
    const item = app.globalData.cart.find(i => i.key === key);
    if (item) {
      app.updateCartQuantity(key, item.quantity - 1);
      this.updateCartInfo();
      this.setData({ cart: app.globalData.cart });
      this.loadDishes();
    }
  },

  increaseCartItem(e) {
    const key = e.currentTarget.dataset.key;
    const item = app.globalData.cart.find(i => i.key === key);
    if (item) {
      app.updateCartQuantity(key, item.quantity + 1);
      this.updateCartInfo();
      this.setData({ cart: app.globalData.cart });
      this.loadDishes();
    }
  },

  // ==================== 跳转 ====================

  goToDish(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/dish/dish?id=${id}`
    });
  },

  goToCart() {
    wx.navigateTo({
      url: '/pages/cart/cart'
    });
  },

  goToPayment() {
    if (!this.data.tableNo) {
      showToast('请先扫码绑定桌号', 'none');
      return;
    }
    const cart = app.globalData.cart;
    if (!cart || cart.length === 0) {
      showToast('购物车为空', 'none');
      return;
    }
    const totalAmount = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const pendingOrder = {
      tableNo: this.data.tableNo,
      items: cart.map(item => ({
        dishId: item.dishId,
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.subtotal
      })),
      totalAmount
    };
    wx.setStorageSync('pendingOrder', pendingOrder);
    this.setData({ showCart: false });
    wx.navigateTo({ url: '/pages/payment/payment' });
  }
});
