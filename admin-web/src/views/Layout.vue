<template>
  <el-container style="height:100vh">
    <!-- 侧边栏 -->
    <el-aside width="220px" style="background:#1a1a2e">
      <div style="padding:24px 20px 16px;color:#C68D56;font-size:18px;font-weight:700;border-bottom:1px solid #2a2a3e">
        🍽️ 点餐后台
      </div>
      <el-menu
        :default-active="$route.path"
        router
        background-color="#1a1a2e"
        text-color="#aaa"
        active-text-color="#C68D56"
        style="border:none"
      >
        <el-menu-item index="/dashboard"><el-icon><DataLine /></el-icon>数据概览</el-menu-item>
        <el-menu-item index="/orders"><el-icon><List /></el-icon>订单管理</el-menu-item>
        <el-menu-item index="/dishes"><el-icon><Food /></el-icon>菜品管理</el-menu-item>
        <el-menu-item index="/restock">
          <el-icon><Bell /></el-icon>
          补货提醒
          <el-badge v-if="restockCount > 0" :value="restockCount" style="margin-left:6px" />
        </el-menu-item>
        <el-menu-item index="/users"><el-icon><User /></el-icon>用户管理</el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 主区域 -->
    <el-container>
      <el-header style="background:#fff;border-bottom:1px solid #eee;display:flex;align-items:center;justify-content:space-between;padding:0 24px">
        <span style="font-size:16px;font-weight:600;color:#1a1a2e">{{ $route.meta.title || '点餐系统' }}</span>
        <div style="display:flex;align-items:center;gap:12px">
          <span style="color:#666">👤 {{ username }}</span>
          <el-button link type="danger" @click="logout">退出</el-button>
        </div>
      </el-header>
      <el-main style="background:#f4f5f7;padding:24px">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { statsApi } from '../api'

const router = useRouter()
const username = localStorage.getItem('username') || 'admin'
const restockCount = ref(0)

async function loadRestockCount() {
  try {
    const res = await statsApi.restock()
    restockCount.value = (res.data || []).filter(r => r.level === 'danger' || r.level === 'warning').length
  } catch {}
}

function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('username')
  router.push('/login')
}

onMounted(loadRestockCount)
</script>
