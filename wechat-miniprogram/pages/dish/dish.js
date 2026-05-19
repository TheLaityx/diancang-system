// pages/dish/dish.js
const app = getApp();
const { getDishDetail, getDishReviews, addReview } = require('../../utils/api');
const { showToast } = require('../../utils/util');

Page({
  data: {
    dishId: '',
    dish: null,
    quantity: 1,
    totalPrice: '0.00',
    reviews: [],
    canReview: false,
    loadingReview: false,
    showReviewModal: false,
    reviewRating: 5,
    reviewContent: ''
  },

  onLoad(options) {
    const { id } = options;
    if (id) {
      this.setData({ dishId: id });
      this.loadDishDetail(id);
    }
  },

  async loadDishDetail(id) {
    try {
      const res = await getDishDetail(id);
      const dishData = res.data;
      
      if (dishData && dishData._id) {
        let image = dishData.image;
        // cloud:// 图片在新后端不再使用，清空避免报错
        if (image && image.indexOf('cloud://') === 0) {
          image = '';
        }

        this.setData({
          dish: { ...dishData, image: image },
          totalPrice: Number(dishData.price).toFixed(2)  // MySQL直接存元，不除以100
        });

        this.checkCanReview(dishData._id);
        this.loadReviews(dishData._id);
      } else {
        wx.showToast({ title: '菜品不存在', icon: 'none' });
        setTimeout(() => wx.navigateBack(), 1500);
      }
    } catch (e) {
      console.error('加载菜品失败:', e);
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  async checkCanReview(dishId) {
    const userId = wx.getStorageSync('userId');
    if (!userId) {
      this.setData({ canReview: false });
      return;
    }

    try {
      const db = require('../../utils/api').db;
      const orderRes = await db.collection('orders').where({
        userId: userId,
        status: db.command.in([1, 2, 3])
      }).get();

      const hasOrdered = orderRes.data.some(order => {
        return order.items && order.items.some(item => item.dishId === dishId);
      });

      this.setData({ canReview: hasOrdered });
    } catch (e) {
      this.setData({ canReview: false });
    }
  },

  async loadReviews(dishId) {
    this.setData({ loadingReview: true });
    try {
      const reviews = await getDishReviews(dishId);
      const reviewList = (reviews.data || []).map(r => ({
        ...r,
        userId: r.userId ? r.userId.substring(0, 8) : '匿名用户'
      }));
      this.setData({ reviews: reviewList, loadingReview: false });
    } catch (e) {
      this.setData({ reviews: [], loadingReview: false });
    }
  },

  showReviewModal() {
    this.setData({ showReviewModal: true, reviewRating: 5, reviewContent: '' });
  },

  hideReviewModal() {
    this.setData({ showReviewModal: false });
  },

  setRating(e) {
    this.setData({ reviewRating: e.currentTarget.dataset.rating });
  },

  onReviewInput(e) {
    this.setData({ reviewContent: e.detail.value });
  },

  async submitReview() {
    const { dishId, reviewRating, reviewContent } = this.data;
    const userId = wx.getStorageSync('userId');

    if (!reviewContent.trim()) {
      showToast('请输入评价内容', 'none');
      return;
    }

    try {
      await addReview(dishId, reviewRating, reviewContent, userId);
      showToast('评价成功', 'success');
      this.setData({ showReviewModal: false, canReview: false });
      this.loadReviews(dishId);
    } catch (e) {
      showToast('评价失败', 'none');
    }
  },

  decreaseQuantity() {
    if (this.data.quantity > 1) {
      const quantity = this.data.quantity - 1;
      const price = this.data.dish ? this.data.dish.price : 0;
      this.setData({
        quantity: quantity,
        totalPrice: (price * quantity).toFixed(2)
      });
    }
  },

  increaseQuantity() {
    const quantity = this.data.quantity + 1;
    const price = this.data.dish ? this.data.dish.price : 0;
    this.setData({
      quantity: quantity,
        totalPrice: (price * quantity).toFixed(2)
    });
  },

  addToCart() {
    const { dish, quantity } = this.data;
    
    if (!dish) {
      showToast('菜品信息加载中，请稍候', 'none');
      return;
    }
    
    if (!app.globalData.tableNo) {
      showToast('请先绑定桌号', 'none');
      return;
    }
    
    app.addToCart(dish, '', quantity);
    
    wx.showToast({
      title: '已加入购物车',
      icon: 'success'
    });

    setTimeout(() => {
      wx.navigateBack();
    }, 1500);
  }
});
