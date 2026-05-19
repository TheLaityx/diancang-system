// pages/merchant-dish-edit/merchant-dish-edit.js
const { getDishDetail, addDish, updateDish, getCategories } = require('../../utils/api');
const { showToast, showLoading, hideLoading } = require('../../utils/util');

Page({
  data: {
    dishId: '',
    name: '',
    price: '',
    stock: 999,
    description: '',
    categoryId: '',
    categories: [],
    image: ''
  },

  onLoad(options) {
    const { id } = options;
    if (id) {
      this.setData({ dishId: id });
      this.loadDishDetail(id);
    }
    this.loadCategories();
  },

  async loadCategories() {
    try {
      const res = await getCategories();
      const categories = res.data || [];
      this.setData({
        categories: categories,
        categoryId: this.data.categoryId || (categories.length > 0 ? categories[0].id : '')
      });
    } catch (e) {
      console.error('加载分类失败:', e);
    }
  },

  async loadDishDetail(id) {
    try {
      const res = await getDishDetail(id);
      const dish = res.data; // Node后端返回单个对象，不是数组
      if (dish) {
        this.setData({
          name: dish.name,
          price: String(dish.price),          // MySQL直接存元，不用除以100
          stock: dish.stock || 999,
          description: dish.description || '',
          categoryId: dish.category_id,       // 用 category_id
          image: dish.image || ''
        });
      }
    } catch (e) {
      showToast('加载失败', 'none');
    }
  },

  onNameInput(e) { this.setData({ name: e.detail.value }); },
  onPriceInput(e) { this.setData({ price: e.detail.value }); },
  onStockInput(e) { this.setData({ stock: e.detail.value }); },
  onDescInput(e) { this.setData({ description: e.detail.value }); },

  onCategoryChange(e) {
    const idx = e.detail.value;
    const categories = this.data.categories;
    this.setData({ categoryId: categories[idx].id });
  },

  chooseImage() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        // 本地演示：直接使用本地路径，不上传云存储
        const tempFilePath = res.tempFiles[0].tempFilePath;
        this.setData({ image: tempFilePath });
        wx.showToast({ title: '图片已选择（本地预览）', icon: 'none' });
      }
    });
  },

  async submit() {
    const { dishId, name, price, stock, description, categoryId, image } = this.data;

    if (!name) return showToast('请输入菜品名称', 'none');
    if (!price || isNaN(parseFloat(price))) return showToast('请输入有效价格', 'none');
    if (!categoryId) return showToast('请选择分类', 'none');

    showLoading('保存中...');

    const dishData = {
      name,
      price: parseFloat(price),   // 直接存元，不乘100
      stock: parseInt(stock) || 999,
      description: description || '',
      category_id: categoryId,    // 使用 category_id
      image: image || ''
    };

    try {
      if (dishId) {
        await updateDish(dishId, dishData);
      } else {
        await addDish(dishData);
      }
      hideLoading();
      wx.showToast({ title: '保存成功', icon: 'success' });
      setTimeout(() => wx.navigateBack(), 1500);
    } catch (e) {
      hideLoading();
      showToast(String(e) || '保存失败', 'none');
    }
  }
});

