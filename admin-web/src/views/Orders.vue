<template>
  <div>
    <!-- 状态统计卡片 -->
    <el-row :gutter="12" style="margin-bottom:16px">
      <el-col :span="6" v-for="s in statusCards" :key="s.value">
        <el-card shadow="hover" style="cursor:pointer" @click="filterByStatus(s.value)">
          <div style="display:flex;align-items:center;gap:12px">
            <span class="status-dot" :class="s.dotClass"></span>
            <div>
              <div style="font-size:13px;color:#999">{{ s.label }}</div>
              <div style="font-size:24px;font-weight:bold;color:#333">{{ s.count }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 筛选栏 -->
    <el-card shadow="never" style="margin-bottom:16px">
      <el-row :gutter="12" align="middle">
        <el-col :span="6">
          <el-select v-model="filter.status" placeholder="全部状态" clearable @change="loadOrders">
            <el-option label="待处理（已付款）" value="pending" />
            <el-option label="已接单（制作中）" value="accepted" />
            <el-option label="已完成" value="completed" />
            <el-option label="退款申请中" value="refunding" />
            <el-option label="已退款" value="refund_done" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="loadOrders">刷新</el-button>
        </el-col>
        <el-col :span="6" style="margin-left:auto;text-align:right">
          <el-button type="text" size="small" @click="autoRefresh = !autoRefresh">
            {{ autoRefresh ? '停止自动刷新' : '开启自动刷新（10s）' }}
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 订单表格 -->
    <el-card shadow="never">
      <el-table :data="orders" v-loading="loading" stripe row-key="id">
        <el-table-column prop="order_no" label="订单号" width="170" />
        <el-table-column prop="table_no" label="桌号" width="70" align="center">
          <template #default="{ row }">
            <el-tag size="small" type="info">{{ row.table_no || '外卖' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="菜品" min-width="160">
          <template #default="{ row }">
            <span v-if="row.items && row.items.length">
              {{ row.items.map(i => i.dish_name + '×' + i.quantity).join('、') }}
            </span>
            <span v-else style="color:#ccc">—</span>
          </template>
        </el-table-column>
        <el-table-column prop="total_price" label="金额" width="90" align="right">
          <template #default="{ row }">
            <span style="font-weight:bold;color:#C68D56">¥{{ Number(row.total_price).toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="110" align="center">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" effect="light">{{ statusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="下单时间" width="155">
          <template #default="{ row }">{{ formatTime(row.created_at) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="340" fixed="right">
          <template #default="{ row }">
            <el-button size="small" plain @click="viewDetail(row)">详情</el-button>
            <el-button
              size="small" type="success"
              v-if="row.status === 'pending'"
              @click="updateStatus(row, 'accepted')"
            >接单</el-button>
            <el-button
              size="small" type="primary"
              v-if="row.status === 'accepted'"
              @click="updateStatus(row, 'completed')"
            >完成</el-button>
            <!-- 用户申请退款：同意 / 拒绝 -->
            <el-button
              size="small" type="danger"
              v-if="row.status === 'refunding'"
              @click="updateStatus(row, 'refund_done')"
            >同意退款</el-button>
            <el-button
              size="small" type="warning"
              v-if="row.status === 'refunding'"
              @click="updateStatus(row, 'completed')"
            >拒绝退款</el-button>
            <!-- 商家主动退款（仅限待处理/制作中） -->
            <el-button
              size="small" type="danger" plain
              v-if="['pending', 'accepted'].includes(row.status)"
              @click="updateStatus(row, 'refund_done')"
            >退款</el-button>
            <el-button
              size="small" type="danger" plain
              @click="deleteOrder(row)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        style="margin-top:16px;justify-content:flex-end;display:flex"
        v-model:current-page="page"
        :page-size="20"
        :total="total"
        layout="total, prev, pager, next"
        @current-change="loadOrders"
      />
    </el-card>

    <!-- 订单详情弹窗 -->
    <el-dialog v-model="detailVisible" title="订单详情" width="560px">
      <template v-if="currentOrder">
        <el-descriptions :column="2" border size="small" style="margin-bottom:16px">
          <el-descriptions-item label="订单号">
            <span style="font-family:monospace">{{ currentOrder.order_no }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="桌号">{{ currentOrder.table_no || '外卖' }}</el-descriptions-item>
          <el-descriptions-item label="用户">{{ currentOrder.user_name || '匿名' }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="statusType(currentOrder.status)" effect="light">{{ statusText(currentOrder.status) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="总价">
            <span style="font-size:16px;font-weight:bold;color:#C68D56">¥{{ Number(currentOrder.total_price).toFixed(2) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="下单时间">{{ formatTime(currentOrder.created_at) }}</el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{ currentOrder.remark || '无' }}</el-descriptions-item>
        </el-descriptions>

        <!-- 菜品明细 -->
        <div style="font-weight:bold;margin-bottom:8px;color:#333">菜品明细</div>
        <el-table :data="currentOrder.items || []" size="small" border>
          <el-table-column label="图片" width="60">
            <template #default="{ row }">
              <el-image
                v-if="row.image"
                :src="row.image"
                style="width:40px;height:40px;border-radius:6px;object-fit:cover"
                fit="cover"
              />
              <span v-else class="no-img-placeholder">餐</span>
            </template>
          </el-table-column>
          <el-table-column prop="dish_name" label="菜品名" />
          <el-table-column prop="price" label="单价" width="80">
            <template #default="{ row }">¥{{ Number(row.price).toFixed(2) }}</template>
          </el-table-column>
          <el-table-column prop="quantity" label="数量" width="55" align="center" />
          <el-table-column label="小计" width="80" align="right">
            <template #default="{ row }">
              <span style="color:#C68D56;font-weight:bold">¥{{ (Number(row.price) * row.quantity).toFixed(2) }}</span>
            </template>
          </el-table-column>
        </el-table>

        <!-- 操作按钮 -->
        <div style="margin-top:16px;display:flex;gap:8px;justify-content:flex-end">
          <el-button
            type="success"
            v-if="currentOrder.status === 'pending'"
            @click="updateStatusFromDetail('accepted')"
          >接单</el-button>
          <el-button
            type="primary"
            v-if="currentOrder.status === 'accepted'"
            @click="updateStatusFromDetail('completed')"
          >标记完成</el-button>
          <!-- 用户申请退款：同意 / 拒绝 -->
          <el-button
            type="danger"
            v-if="currentOrder.status === 'refunding'"
            @click="updateStatusFromDetail('refund_done')"
          >同意退款</el-button>
          <el-button
            type="warning"
            v-if="currentOrder.status === 'refunding'"
            @click="updateStatusFromDetail('completed')"
          >拒绝退款</el-button>
          <!-- 商家主动退款 -->
          <el-button
            type="danger" plain
            v-if="['pending','accepted'].includes(currentOrder.status)"
            @click="updateStatusFromDetail('refund_done')"
          >退款</el-button>
          <el-button
            type="danger" plain
            @click="deleteOrderFromDetail"
          >删除订单</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { orderApi } from '../api'

const orders = ref([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const filter = ref({ status: '' })
const detailVisible = ref(false)
const currentOrder = ref(null)
const autoRefresh = ref(false)
let refreshTimer = null

// 状态统计卡片数据
const statusCards = computed(() => [
  { label: '待处理（已付款）', value: 'pending', dotClass: 'dot-pending', count: orders.value.filter(o => o.status === 'pending').length },
  { label: '已接单（制作中）', value: 'accepted', dotClass: 'dot-accepted', count: orders.value.filter(o => o.status === 'accepted').length },
  { label: '已完成', value: 'completed', dotClass: 'dot-completed', count: orders.value.filter(o => o.status === 'completed').length },
  { label: '退款申请中', value: 'refunding', dotClass: 'dot-refunding', count: orders.value.filter(o => o.status === 'refunding').length },
])

async function loadOrders() {
  loading.value = true
  try {
    const params = { page: page.value }
    if (filter.value.status) params.status = filter.value.status
    const res = await orderApi.list(params)
    orders.value = res.data || []
    total.value = res.total || 0
  } catch (e) {
    ElMessage.error('加载订单失败，请检查后端服务')
  } finally {
    loading.value = false
  }
}

function filterByStatus(status) {
  filter.value.status = status === filter.value.status ? '' : status
  page.value = 1
  loadOrders()
}

async function viewDetail(row) {
  try {
    const res = await orderApi.get(row.id)
    const data = res.data
    // 处理菜品图片路径：相对路径拼上后端 host，cloud:// 旧地址清空
    if (data.items) {
      data.items.forEach(item => {
        if (item.image && item.image.startsWith('/')) {
          item.image = 'http://localhost:3000' + item.image
        } else if (item.image && item.image.indexOf('cloud://') === 0) {
          item.image = ''
        }
      })
    }
    currentOrder.value = data
    detailVisible.value = true
  } catch (e) {
    ElMessage.error('获取详情失败')
  }
}

async function updateStatus(row, status) {
  const labels = { accepted: '接单', completed: '标记完成', refund_done: '同意退款/退款', refunding: '退款申请中' }
  const types = { accepted: 'success', completed: 'primary', refund_done: 'danger', refunding: 'warning' }
  try {
    await ElMessageBox.confirm(`确认${labels[status] || status}？`, '操作确认', { type: types[status] || 'warning' })
    await orderApi.updateStatus(row.id, status)
    ElMessage.success('操作成功')
    loadOrders()
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('操作失败')
  }
}

async function updateStatusFromDetail(status) {
  if (!currentOrder.value) return
  try {
    const labels = { accepted: '接单', completed: '标记完成', refund_done: '同意退款/退款' }
    await ElMessageBox.confirm(`确认${labels[status] || status}？`, '操作确认', { type: 'warning' })
    await orderApi.updateStatus(currentOrder.value.id, status)
    ElMessage.success('操作成功')
    // 刷新详情
    const res = await orderApi.get(currentOrder.value.id)
    currentOrder.value = res.data
    loadOrders()
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('操作失败')
  }
}

async function deleteOrder(row) {
  try {
    await ElMessageBox.confirm(
      `确认删除订单 ${row.order_no}？此操作不可恢复。`,
      '删除确认',
      { type: 'warning', confirmButtonText: '确认删除', confirmButtonClass: 'el-button--danger' }
    )
    await orderApi.remove(row.id)
    ElMessage.success('删除成功')
    loadOrders()
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('删除失败')
  }
}

async function deleteOrderFromDetail() {
  if (!currentOrder.value) return
  try {
    await ElMessageBox.confirm(
      `确认删除订单 ${currentOrder.value.order_no}？此操作不可恢复。`,
      '删除确认',
      { type: 'warning', confirmButtonText: '确认删除', confirmButtonClass: 'el-button--danger' }
    )
    await orderApi.remove(currentOrder.value.id)
    ElMessage.success('删除成功')
    detailVisible.value = false
    loadOrders()
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('删除失败')
  }
}

const statusText = s => ({
  pending:    '待处理',
  accepted:   '已接单',
  completed:  '已完成',
  refunding:  '退款申请中',
  refund_done:'已退款',
  refunded:   '已退款(旧)',
}[s] || s)

const statusType = s => ({
  pending:    'warning',
  accepted:   'primary',
  completed:  'success',
  refunding:  'danger',
  refund_done:'info',
  refunded:   'info',
}[s])

const formatTime = t => t ? new Date(t).toLocaleString('zh-CN') : ''

// 自动刷新
function startAutoRefresh() {
  refreshTimer = setInterval(() => {
    if (autoRefresh.value) loadOrders()
    else stopAutoRefresh()
  }, 10000)
}
function stopAutoRefresh() {
  if (refreshTimer) { clearInterval(refreshTimer); refreshTimer = null }
}

onMounted(() => {
  loadOrders()
  startAutoRefresh()
})
onUnmounted(stopAutoRefresh)
</script>

<style scoped>
.status-dot {
  display: inline-block;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  flex-shrink: 0;
}
.dot-pending    { background: #E6A23C; box-shadow: 0 0 6px rgba(230, 162, 60, 0.4); }
.dot-accepted   { background: #409EFF; box-shadow: 0 0 6px rgba(64, 158, 255, 0.4); }
.dot-completed  { background: #67C23A; box-shadow: 0 0 6px rgba(103, 194, 58, 0.4); }
.dot-refunding  { background: #F56C6C; box-shadow: 0 0 6px rgba(245, 108, 108, 0.4); }
.no-img-placeholder {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: #f5f5f5;
  border-radius: 6px;
  font-size: 12px;
  color: #999;
}
</style>
