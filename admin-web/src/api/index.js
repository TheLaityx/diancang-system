import axios from 'axios'
import { ElMessage } from 'element-plus'

const http = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 10000
})

// 请求拦截：自动带 token
http.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// 响应拦截：统一错误提示
http.interceptors.response.use(
  res => {
    if (res.data.code !== 0) {
      ElMessage.error(res.data.msg || '请求失败')
      return Promise.reject(res.data)
    }
    return res.data
  },
  err => {
    ElMessage.error('网络错误，请检查后端是否启动')
    return Promise.reject(err)
  }
)

export const authApi = {
  login: (data) => http.post('/auth/login', data)
}

export const dishApi = {
  list: (params) => http.get('/dishes', { params }),
  get: (id) => http.get(`/dishes/${id}`),
  add: (data) => http.post('/dishes', data),
  update: (id, data) => http.put(`/dishes/${id}`, data),
  updateStatus: (id, status) => http.patch(`/dishes/${id}/status`, { status }),
  remove: (id) => http.delete(`/dishes/${id}`)
}

export const categoryApi = {
  list: () => http.get('/categories'),
  add: (data) => http.post('/categories', data),
  remove: (id) => http.delete(`/categories/${id}`)
}

export const orderApi = {
  list: (params) => http.get('/orders', { params }),
  get: (id) => http.get(`/orders/${id}`),
  updateStatus: (id, status) => http.patch(`/orders/${id}/status`, { status }),
  remove: (id) => http.delete(`/orders/${id}`)
}

export const statsApi = {
  overview: () => http.get('/stats/overview'),
  revenue: () => http.get('/stats/revenue'),
  topDishes: () => http.get('/stats/top-dishes'),
  categoryStats: () => http.get('/stats/category-stats'),
  restock: () => http.get('/stats/restock')
}

export const userApi = {
  list: () => http.get('/users')
}

export const tableApi = {
  list: () => http.get('/tables')
}

export const uploadApi = {
  // 上传图片文件，返回 { url }
  image: (file) => {
    const form = new FormData()
    form.append('file', file)
    return http.post('/upload/image', form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}

export const reviewApi = {
  list: () => http.get('/reviews/all/list'),
  reply: (id, reply) => http.put(`/reviews/${id}/reply`, { reply }),
  remove: (id) => http.delete(`/reviews/${id}`)
}
