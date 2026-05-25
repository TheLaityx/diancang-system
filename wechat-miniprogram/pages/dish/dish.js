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
    reviewSummary: { avg_rating: '0.0', total: 0 },
    canReview: false,
    viewReview: false,
    orderId: '',
    hasUserReviewed: false,
    myReviewId: null,
    loadingReview: false,
    showReviewModal: false,
    reviewRating: 5,
    reviewContent: ''
  },

  onLoad(options) {
    const { id, canReview, viewReview, orderId } = options;
    if (id) {
      this.setData({
        dishId: id,
        canReview: canReview === '1',
        viewReview: viewReview === '1',
        orderId: orderId || ''
      });
      this.loadDishDetail(id);
    }
  },

  backToOrder() {
    wx.navigateBack();
  },

  async deleteReview() {
    const { dishId, myReviewId, orderId } = this.data;
    if (!myReviewId) {
      showToast('未找到您的评价', 'none');
      return;
    }

    try {
      const res = await wx.showModal({
        title: '确认删除',
        content: '删除后不可恢复，确定要删除您的评价吗？',
        confirmText: '删除',
        confirmColor: '#FF4D4F'
      });
      if (!res.confirm) return;

      const userId = wx.getStorageSync('userId') || '';
      const userName = wx.getStorageSync('userName') || '微信用户';

      wx.request({
        url: 'http://localhost:3000/api/reviews/delete-self',
        method: 'POST',
        data: { review_id: myReviewId, dish_id: dishId, user_id: userId, user_name: userName },
        header: { 'Content-Type': 'application/json' },
        success: (res) => {
          const body = res.data;
          if (body && body.code === 0) {
            showToast('删除成功', 'success');
            // 从 reviewedOrders 中移除该订单
            if (orderId) {
              const reviewedOrders = wx.getStorageSync('reviewedOrders') || [];
              const idx = reviewedOrders.indexOf(orderId);
              if (idx > -1) {
                reviewedOrders.splice(idx, 1);
                wx.setStorageSync('reviewedOrders', reviewedOrders);
              }
            }
            this.setData({ hasUserReviewed: false, myReviewId: null });
            this.loadReviews(dishId);
          } else {
            showToast(body.msg || '删除失败', 'none');
          }
        },
        fail: () => {
          showToast('网络错误，请检查后端服务', 'none');
        }
      });
    } catch (e) {
      console.error('删除评价失败:', e);
      showToast('删除失败', 'none');
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

  async loadReviews(dishId) {
    this.setData({ loadingReview: true });
    try {
      const res = await getDishReviews(dishId);
      const reviewList = (res.data || []).map(r => ({
        ...r,
        user_name: r.user_name || '匿名用户'
      }));

      // 检查当前用户是否已评价过该菜品，并记录评论ID
      const userId = wx.getStorageSync('userId') || '';
      const userName = wx.getStorageSync('userName') || '微信用户';
      const myReview = reviewList.find(r =>
        (r.user_id && r.user_id === userId) ||
        (r.user_name && r.user_name === userName)
      );
      const hasUserReviewed = !!myReview;

      this.setData({
        reviews: reviewList,
        reviewSummary: res.summary || { avg_rating: '0.0', total: 0 },
        hasUserReviewed,
        myReviewId: myReview ? myReview.id : null,
        loadingReview: false
      });
    } catch (e) {
      console.error('加载评论失败:', e);
      this.setData({ reviews: [], reviewSummary: { avg_rating: '0.0', total: 0 }, hasUserReviewed: false, loadingReview: false });
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
    const { dishId, reviewRating, reviewContent, orderId } = this.data;
    const userId = wx.getStorageSync('userId') || '';
    const userName = wx.getStorageSync('userName') || '微信用户';

    if (!reviewContent.trim()) {
      showToast('请输入评价内容', 'none');
      return;
    }

    try {
      await addReview(dishId, reviewRating, reviewContent.trim(), userId, userName);
      showToast('评价成功', 'success');

      // 标记该订单已评价
      if (orderId) {
        const reviewedOrders = wx.getStorageSync('reviewedOrders') || [];
        if (!reviewedOrders.includes(orderId)) {
          reviewedOrders.push(orderId);
          wx.setStorageSync('reviewedOrders', reviewedOrders);
        }
      }

      this.setData({ showReviewModal: false, reviewRating: 5, reviewContent: '', hasUserReviewed: true });
      this.loadReviews(dishId);
    } catch (e) {
      showToast('评价失败: ' + (e || '未知错误'), 'none');
      console.error('提交评论失败:', e);
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
  },

});
