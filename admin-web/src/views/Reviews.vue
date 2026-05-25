<template>
  <div>
    <!-- 统计卡片 -->
    <el-row :gutter="16" style="margin-bottom: 20px">
      <el-col :span="6">
        <el-card shadow="hover">
          <div style="display: flex; align-items: center; gap: 12px">
            <el-icon :size="32" color="#C68D56"><ChatDotRound /></el-icon>
            <div>
              <div style="font-size: 24px; font-weight: 700; color: #1a1a2e">{{ stats.total }}</div>
              <div style="font-size: 13px; color: #999">总评论数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div style="display: flex; align-items: center; gap: 12px">
            <el-icon :size="32" color="#FAAD14"><Star /></el-icon>
            <div>
              <div style="font-size: 24px; font-weight: 700; color: #1a1a2e">{{ stats.avgRating }}</div>
              <div style="font-size: 13px; color: #999">平均评分</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div style="display: flex; align-items: center; gap: 12px">
            <el-icon :size="32" color="#52c41a"><ChatLineRound /></el-icon>
            <div>
              <div style="font-size: 24px; font-weight: 700; color: #1a1a2e">{{ stats.replied }}</div>
              <div style="font-size: 13px; color: #999">已回复</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div style="display: flex; align-items: center; gap: 12px">
            <el-icon :size="32" color="#ff4d4f"><ChatLineSquare /></el-icon>
            <div>
              <div style="font-size: 24px; font-weight: 700; color: #1a1a2e">{{ stats.pending }}</div>
              <div style="font-size: 13px; color: #999">待回复</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 评论表格 -->
    <el-card>
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center">
          <span style="font-weight: 600">评论列表</span>
          <el-input
            v-model="searchKeyword"
            placeholder="搜索菜品名称或评论内容"
            style="width: 280px"
            clearable
            @input="filterReviews"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
      </template>

      <el-table :data="filteredReviews" v-loading="loading" stripe v-if="!loadError && reviews.length > 0">
        <el-table-column type="index" width="50" />
        <el-table-column label="菜品" width="120">
          <template #default="{ row }">
            <span style="font-weight: 600; color: #C68D56">{{ row.dish_name || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="用户" width="120">
          <template #default="{ row }">
            <div style="display: flex; align-items: center; gap: 8px">
              <div style="width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, #C68D56, #A97240); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700">
                {{ row.user_name ? row.user_name[0] : '匿' }}
              </div>
              <span>{{ row.user_name || '匿名用户' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="评分" width="120">
          <template #default="{ row }">
            <el-rate :model-value="row.rating" disabled text-color="#FAAD14" />
          </template>
        </el-table-column>
        <el-table-column label="评论内容" min-width="200">
          <template #default="{ row }">
            <div style="color: #333; line-height: 1.5">{{ row.content }}</div>
            <div v-if="row.reply" style="margin-top: 8px; background: #f8f8fa; padding: 8px 10px; border-radius: 6px; font-size: 13px; color: #666">
              <span style="color: #C68D56; font-weight: 600">商家回复：</span>{{ row.reply }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="时间" width="160">
          <template #default="{ row }">
            <span style="color: #999; font-size: 13px">{{ formatTime(row.created_at) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="!row.reply"
              type="primary"
              link
              size="small"
              @click="openReplyDialog(row)"
            >
              回复
            </el-button>
            <el-button
              v-else
              type="primary"
              link
              size="small"
              @click="openReplyDialog(row)"
            >
              修改回复
            </el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 空状态 -->
      <div v-if="!loading && !loadError && reviews.length === 0" style="text-align: center; padding: 60px 0">
        <el-icon :size="48" color="#ddd"><ChatDotRound /></el-icon>
        <div style="margin-top: 12px; color: #999; font-size: 14px">暂无评论数据</div>
        <div style="margin-top: 8px; color: #bbb; font-size: 12px">用户提交的评价将显示在这里</div>
      </div>

      <!-- 错误状态 -->
      <div v-if="loadError" style="text-align: center; padding: 60px 0">
        <el-icon :size="48" color="#ff4d4f"><Warning /></el-icon>
        <div style="margin-top: 12px; color: #666; font-size: 14px">{{ loadError }}</div>
        <div style="margin-top: 8px; color: #bbb; font-size: 12px">
          提示：若数据库未创建 reviews 表，请在 MySQL 中执行 db.sql 中的评论表创建语句
        </div>
        <el-button type="primary" style="margin-top: 16px" @click="loadReviews">重新加载</el-button>
      </div>
    </el-card>

    <!-- 回复对话框 -->
    <el-dialog
      v-model="replyDialogVisible"
      :title="currentReview?.reply ? '修改回复' : '回复评论'"
      width="500px"
    >
      <div style="margin-bottom: 16px">
        <div style="font-size: 13px; color: #999; margin-bottom: 4px">评论内容</div>
        <div style="background: #f8f8fa; padding: 10px 12px; border-radius: 6px; color: #333; line-height: 1.5">
          {{ currentReview?.content }}
        </div>
      </div>
      <el-input
        v-model="replyContent"
        type="textarea"
        :rows="4"
        placeholder="请输入回复内容..."
        maxlength="200"
        show-word-limit
      />
      <template #footer>
        <el-button @click="replyDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitReply">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { reviewApi } from '../api'

const loading = ref(false)
const loadError = ref('')
const reviews = ref([])
const searchKeyword = ref('')
const replyDialogVisible = ref(false)
const currentReview = ref(null)
const replyContent = ref('')

const stats = computed(() => {
  const total = reviews.value.length
  const replied = reviews.value.filter(r => r.reply).length
  const pending = total - replied
  const avgRating = total > 0
    ? (reviews.value.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1)
    : '0.0'
  return { total, replied, pending, avgRating }
})

const filteredReviews = computed(() => {
  if (!searchKeyword.value.trim()) return reviews.value
  const kw = searchKeyword.value.trim().toLowerCase()
  return reviews.value.filter(r =>
    (r.dish_name && r.dish_name.toLowerCase().includes(kw)) ||
    (r.content && r.content.toLowerCase().includes(kw)) ||
    (r.user_name && r.user_name.toLowerCase().includes(kw))
  )
})

function filterReviews() {
  // 由computed自动处理
}

function formatTime(t) {
  if (!t) return '-'
  const d = new Date(t)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

async function loadReviews() {
  loading.value = true
  loadError.value = ''
  try {
    const res = await reviewApi.list()
    reviews.value = res.data || []
  } catch (e) {
    console.error('加载评论失败:', e)
    loadError.value = e?.msg || e?.message || '加载失败，请检查后端服务或数据库连接'
    ElMessage.error(loadError.value)
  } finally {
    loading.value = false
  }
}

function openReplyDialog(row) {
  currentReview.value = row
  replyContent.value = row.reply || ''
  replyDialogVisible.value = true
}

async function submitReply() {
  if (!replyContent.value.trim()) {
    ElMessage.warning('回复内容不能为空')
    return
  }
  try {
    await reviewApi.reply(currentReview.value.id, replyContent.value.trim())
    ElMessage.success('回复成功')
    replyDialogVisible.value = false
    loadReviews()
  } catch (e) {
    ElMessage.error('回复失败')
  }
}

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm('确定删除这条评论吗？删除后不可恢复。', '确认删除', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await reviewApi.remove(row.id)
    ElMessage.success('删除成功')
    loadReviews()
  } catch (e) {
    if (e !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

onMounted(loadReviews)
</script>
