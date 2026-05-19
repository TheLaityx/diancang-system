<template>
  <div>
    <!-- 顶部统计卡片 -->
    <el-row :gutter="16" style="margin-bottom:16px">
      <el-col :span="8">
        <el-card shadow="never" class="stat-card danger-card">
          <div class="stat-inner">
            <el-icon :size="32" color="#f56c6c" class="stat-icon-svg"><WarningFilled /></el-icon>
            <div>
              <div class="stat-num">{{ dangerCount }}</div>
              <div class="stat-label">紧急补货</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="never" class="stat-card warning-card">
          <div class="stat-inner">
            <el-icon :size="32" color="#e6a23c" class="stat-icon-svg"><Warning /></el-icon>
            <div>
              <div class="stat-num">{{ warningCount }}</div>
              <div class="stat-label">库存预警</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="never" class="stat-card normal-card">
          <div class="stat-inner">
            <el-icon :size="32" color="#67c23a" class="stat-icon-svg"><CircleCheck /></el-icon>
            <div>
              <div class="stat-num">{{ normalCount }}</div>
              <div class="stat-label">库存充足</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 筛选栏 -->
    <el-card shadow="never" style="margin-bottom:16px">
      <el-row :gutter="12" align="middle">
        <el-col :span="5">
          <el-select v-model="filterLevel" placeholder="全部状态" clearable @change="applyFilter">
            <el-option label="紧急补货" value="danger" />
            <el-option label="库存预警" value="warning" />
            <el-option label="库存充足" value="normal" />
          </el-select>
        </el-col>
        <el-col :span="5">
          <el-select v-model="filterCategory" placeholder="全部分类" clearable @change="applyFilter">
            <el-option v-for="c in categories" :key="c" :label="c" :value="c" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="loadData" :loading="loading">刷新</el-button>
        </el-col>
        <el-col :span="10" style="text-align:right;color:#999;font-size:13px">
          数据基于近7天销量计算 · 上次更新：{{ lastUpdate }}
        </el-col>
      </el-row>
    </el-card>

    <!-- 提醒列表 -->
    <el-card shadow="never">
      <el-table :data="filteredList" v-loading="loading" stripe>
        <el-table-column label="状态" width="110">
          <template #default="{ row }">
            <el-tag
              :type="row.level === 'danger' ? 'danger' : row.level === 'warning' ? 'warning' : 'success'"
              size="small"
            >
              {{ row.level === 'danger' ? '紧急' : row.level === 'warning' ? '预警' : '正常' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="菜品名称" min-width="120" />
        <el-table-column prop="category_name" label="分类" width="90" />
        <el-table-column label="当前库存" width="100">
          <template #default="{ row }">
            <span :style="{ color: row.level === 'danger' ? '#f56c6c' : row.level === 'warning' ? '#e6a23c' : '#67c23a', fontWeight: 'bold' }">
              {{ row.stock_display }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="近7天销量" width="110">
          <template #default="{ row }">
            <span style="font-weight:bold">{{ row.week_sales }} 份</span>
          </template>
        </el-table-column>
        <el-table-column label="日均销量" width="100">
          <template #default="{ row }">
            {{ row.daily_avg }} 份/天
          </template>
        </el-table-column>
        <el-table-column label="近7天营收" width="110">
          <template #default="{ row }">
            ¥{{ Number(row.week_revenue).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="reason" label="提醒原因" min-width="160">
          <template #default="{ row }">
            <span :style="{ color: row.level === 'danger' ? '#f56c6c' : row.level === 'warning' ? '#e6a23c' : '#909399' }">
              {{ row.reason }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="130">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="openRestock(row)">补货</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div v-if="filteredList.length === 0 && !loading" style="text-align:center;padding:40px;color:#999">
        暂无需要补货的菜品
      </div>
    </el-card>

    <!-- 补货弹窗 -->
    <el-dialog v-model="restockVisible" :title="`补货 - ${restockForm.name}`" width="380px">
      <el-form label-width="90px">
        <el-form-item label="当前库存">
          <span style="font-weight:bold;color:#f56c6c">{{ restockForm.stock_display }}</span>
        </el-form-item>
        <el-form-item label="近7天销量">
          <span>{{ restockForm.week_sales }} 份（日均 {{ restockForm.daily_avg }} 份）</span>
        </el-form-item>
        <el-form-item label="补货数量">
          <el-input-number v-model="restockQty" :min="1" :max="9999" style="width:100%" />
        </el-form-item>
        <el-form-item label="预计够用">
          <span style="color:#67c23a">
            {{ restockForm.daily_avg > 0
              ? `约 ${((restockForm.stock_display === '无限' ? 9999 : Number(restockForm.stock_display) + restockQty) / restockForm.daily_avg).toFixed(0)} 天`
              : '充足' }}
          </span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="restockVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmRestock" :loading="restockLoading">确认补货</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { WarningFilled, Warning, CircleCheck } from '@element-plus/icons-vue'
import { statsApi, dishApi } from '../api'

const loading = ref(false)
const list = ref([])
const filterLevel = ref('')
const filterCategory = ref('')
const categories = ref([])
const lastUpdate = ref('--')

const restockVisible = ref(false)
const restockForm = ref({})
const restockQty = ref(50)
const restockLoading = ref(false)

const dangerCount = computed(() => list.value.filter(r => r.level === 'danger').length)
const warningCount = computed(() => list.value.filter(r => r.level === 'warning').length)
const normalCount = computed(() => list.value.filter(r => r.level === 'normal').length)

const filteredList = computed(() => {
  return list.value.filter(r => {
    if (filterLevel.value && r.level !== filterLevel.value) return false
    if (filterCategory.value && r.category_name !== filterCategory.value) return false
    return true
  })
})

async function loadData() {
  loading.value = true
  try {
    const res = await statsApi.restock()
    list.value = res.data
    // 提取分类列表
    const cats = [...new Set(res.data.map(r => r.category_name).filter(Boolean))]
    categories.value = cats
    lastUpdate.value = new Date().toLocaleTimeString()
  } catch (e) {
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}

function applyFilter() { /* computed自动处理 */ }

function openRestock(row) {
  restockForm.value = { ...row }
  restockQty.value = Math.max(50, Math.ceil(row.daily_avg * 7))
  restockVisible.value = true
}

async function confirmRestock() {
  restockLoading.value = true
  try {
    const current = restockForm.value.stock_display === '无限' ? 9999 : Number(restockForm.value.stock_display)
    const newStock = current + restockQty.value
    await dishApi.update(restockForm.value.id, {
      name: restockForm.value.name,
      category_id: restockForm.value.category_id,
      price: restockForm.value.price,
      stock: newStock,
      status: restockForm.value.status,
      description: restockForm.value.description || '',
      image: restockForm.value.image || ''
    })
    ElMessage.success(`已补货 ${restockQty.value} 份，当前库存 ${newStock}`)
    restockVisible.value = false
    loadData()
  } catch (e) {
    ElMessage.error('补货操作失败')
  } finally {
    restockLoading.value = false
  }
}

onMounted(loadData)
</script>

<style scoped>
.stat-card { border-radius: 10px; }
.stat-inner { display: flex; align-items: center; gap: 16px; }
.stat-icon-svg { flex-shrink: 0; }
.stat-num { font-size: 28px; font-weight: bold; line-height: 1; }
.stat-label { font-size: 13px; color: #666; margin-top: 4px; }
.danger-card { border-left: 4px solid #f56c6c; }
.warning-card { border-left: 4px solid #e6a23c; }
.normal-card { border-left: 4px solid #67c23a; }
</style>
