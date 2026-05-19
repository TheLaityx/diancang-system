<template>
  <el-card shadow="never">
    <el-table :data="users" v-loading="loading" stripe>
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="nickname" label="昵称" />
      <el-table-column prop="openid" label="OpenID" show-overflow-tooltip />
      <el-table-column prop="phone" label="手机号" width="130" />
      <el-table-column prop="created_at" label="注册时间" width="180">
        <template #default="{ row }">{{ new Date(row.created_at).toLocaleString('zh-CN') }}</template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { userApi } from '../api'
const users = ref([])
const loading = ref(false)
onMounted(async () => {
  loading.value = true
  try { const res = await userApi.list(); users.value = res.data }
  finally { loading.value = false }
})
</script>
