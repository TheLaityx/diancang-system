import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/login', component: () => import('../views/Login.vue'), meta: { noAuth: true } },
  {
    path: '/',
    component: () => import('../views/Layout.vue'),
    redirect: '/dashboard',
    children: [
      { path: 'dashboard', component: () => import('../views/Dashboard.vue'), meta: { title: '数据概览' } },
      { path: 'orders', component: () => import('../views/Orders.vue'), meta: { title: '订单管理' } },
      { path: 'dishes', component: () => import('../views/Dishes.vue'), meta: { title: '菜品管理' } },
      { path: 'restock', component: () => import('../views/Restock.vue'), meta: { title: '补货提醒' } },
      { path: 'users', component: () => import('../views/Users.vue'), meta: { title: '用户管理' } },
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 路由守卫：未登录跳登录页
router.beforeEach((to) => {
  if (!to.meta.noAuth && !localStorage.getItem('token')) {
    return '/login'
  }
})

export default router
