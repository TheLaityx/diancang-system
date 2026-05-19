<template>
  <div>
    <!-- 统计卡片 -->
    <el-row :gutter="16" style="margin-bottom:24px">
      <el-col :span="4" v-for="card in cards" :key="card.label">
        <el-card shadow="never" style="text-align:center">
          <el-icon :size="28" :color="card.color" style="margin-bottom:4px"><component :is="card.icon" /></el-icon>
          <div style="font-size:22px;font-weight:700;color:#1a1a2e;margin:4px 0">{{ card.value }}</div>
          <div style="font-size:13px;color:#999">{{ card.label }}</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表行 -->
    <el-row :gutter="16">
      <el-col :span="16">
        <el-card shadow="never" header="近7天营收趋势">
          <div ref="revenueChart" style="height:280px"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="never" header="分类销量占比">
          <div ref="pieChart" style="height:280px"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" style="margin-top:16px">
      <el-col :span="24">
        <el-card shadow="never" header="菜品销量 TOP 10">
          <el-table :data="topDishes" size="small">
            <el-table-column type="index" label="排名" width="60" />
            <el-table-column prop="dish_name" label="菜品名称" />
            <el-table-column prop="total_qty" label="销量" width="100" />
            <el-table-column prop="total_revenue" label="营收(元)" width="120">
              <template #default="{ row }">¥{{ Number(row.total_revenue).toFixed(2) }}</template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { Coin, Document, Timer, DataLine, Dish, User } from '@element-plus/icons-vue'
import { statsApi } from '../api'

const cards = ref([
  { label: '今日营收(元)', value: '...', icon: Coin, color: '#C68D56' },
  { label: '今日订单', value: '...', icon: Document, color: '#409EFF' },
  { label: '待处理订单', value: '...', icon: Timer, color: '#E6A23C' },
  { label: '累计订单', value: '...', icon: DataLine, color: '#67C23A' },
  { label: '在售菜品', value: '...', icon: Dish, color: '#F56C6C' },
  { label: '注册用户', value: '...', icon: User, color: '#909399' },
])
const topDishes = ref([])
const revenueChart = ref(null)
const pieChart = ref(null)

onMounted(async () => {
  // 概览数据
  const ov = await statsApi.overview()
  const d = ov.data
  cards.value[0].value = '¥' + d.today_revenue.toFixed(2)
  cards.value[1].value = d.today_orders
  cards.value[2].value = d.pending_orders
  cards.value[3].value = d.total_orders
  cards.value[4].value = d.online_dishes
  cards.value[5].value = d.total_users

  // 菜品排行
  const top = await statsApi.topDishes()
  topDishes.value = top.data

  await nextTick()

  // 营收趋势图
  const rv = await statsApi.revenue()
  const rvData = rv.data
  const rc = echarts.init(revenueChart.value)
  rc.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: rvData.map(r => r.date) },
    yAxis: [
      { type: 'value', name: '营收(元)' },
      { type: 'value', name: '订单数' }
    ],
    series: [
      { name: '营收', type: 'bar', data: rvData.map(r => r.revenue), itemStyle: { color: '#C68D56' } },
      { name: '订单数', type: 'line', yAxisIndex: 1, data: rvData.map(r => r.orders), itemStyle: { color: '#5470c6' } }
    ]
  })

  // 分类饼图
  const cat = await statsApi.categoryStats()
  const pc = echarts.init(pieChart.value)
  pc.setOption({
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie', radius: '65%',
      data: cat.data.map(c => ({ name: c.name, value: c.total_qty }))
    }]
  })
})
</script>
