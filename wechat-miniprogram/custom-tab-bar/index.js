// custom-tab-bar/index.js
Component({
  data: {
    selected: 0,
    list: [
      {
        pagePath: '/pages/index/index',
        text: '点餐',
        emoji: '☕',
        selectedEmoji: '☕',
        icon: '/images/tab-home.png',
        selectedIcon: '/images/tab-home-active.png'
      },
      {
        pagePath: '/pages/order/order',
        text: '订单',
        emoji: '📋',
        selectedEmoji: '📋',
        icon: '/images/tab-order.png',
        selectedIcon: '/images/tab-order-active.png'
      },
      {
        pagePath: '/pages/user/user',
        text: '我的',
        emoji: '👤',
        selectedEmoji: '👤',
        icon: '/images/tab-user.png',
        selectedIcon: '/images/tab-user-active.png'
      }
    ]
  },

  methods: {
    switchTab(e) {
      const path = e.currentTarget.dataset.path;
      wx.switchTab({ url: path });
    },

    updateSelected() {
      const pages = getCurrentPages();
      if (pages.length === 0) return;
      
      const currentPage = pages[pages.length - 1];
      const path = '/' + currentPage.route;
      
      const index = this.data.list.findIndex(item => {
        const listPath = item.pagePath.replace(/\/$/, '');
        const currentPath = path.replace(/\/$/, '');
        return listPath === currentPath;
      });
      
      if (index !== -1 && this.data.selected !== index) {
        this.setData({ selected: index });
      }
    }
  },

  attached() {
    this.updateSelected();
  },

  ready() {
    this.updateSelected();
  },

  show() {
    this.updateSelected();
  }
});
