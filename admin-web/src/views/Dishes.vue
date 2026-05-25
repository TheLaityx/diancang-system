<template>
  <div class="dishes-page">
    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-select v-model="filter.category_id" placeholder="全部分类" clearable @change="loadDishes" style="width:140px">
          <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
        </el-select>
        <el-select v-model="filter.status" placeholder="全部状态" clearable @change="loadDishes" style="width:120px">
          <el-option label="上架中" :value="1" />
          <el-option label="已下架" :value="0" />
        </el-select>
        <el-input v-model="filter.keyword" placeholder="搜索菜品名称" clearable @keyup.enter="loadDishes" style="width:200px">
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <el-button type="primary" @click="loadDishes">搜索</el-button>
      </div>
      <el-button type="primary" @click="openAdd">
        <el-icon><Plus /></el-icon> 添加菜品
      </el-button>
    </div>

    <!-- 菜品表格 -->
    <el-table :data="dishes" v-loading="loading" border stripe>
      <el-table-column label="图片" width="90" align="center">
        <template #default="{ row }">
          <el-image
            v-if="row.image"
            :src="resolveImg(row.image)"
            :preview-src-list="[resolveImg(row.image)]"
            preview-teleported
            fit="cover"
            style="width:60px;height:60px;border-radius:8px;cursor:pointer"
          />
          <div v-else class="no-img-box">{{ catLabel(row.category_id) }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="菜品名称" min-width="120" />
      <el-table-column label="分类" width="100">
        <template #default="{ row }">
          {{ catName(row.category_id) }}
        </template>
      </el-table-column>
      <el-table-column prop="price" label="价格(元)" width="100" align="right">
        <template #default="{ row }">¥ {{ Number(row.price).toFixed(2) }}</template>
      </el-table-column>
      <el-table-column prop="sales" label="月售" width="80" align="center" />
      <el-table-column label="状态" width="90" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
            {{ row.status === 1 ? '上架' : '下架' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" align="center" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="openEdit(row)">编辑</el-button>
          <el-button size="small" :type="row.status === 1 ? 'warning' : 'success'" @click="toggleStatus(row)">
            {{ row.status === 1 ? '下架' : '上架' }}
          </el-button>
          <el-popconfirm title="确认删除该菜品？" @confirm="removeDish(row.id)" confirm-button-text="删除" cancel-button-text="取消">
            <template #reference>
              <el-button size="small" type="danger">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <div class="empty-tip" v-if="!loading && dishes.length === 0">
      暂无菜品，点击「添加菜品」新增第一道菜
    </div>

    <!-- 添加/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="editId ? '编辑菜品' : '添加菜品'"
      width="560px"
      destroy-on-close
    >
      <el-form :model="form" label-width="80px" :rules="rules" ref="formRef">
        <el-form-item label="菜品名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入菜品名称" />
        </el-form-item>

        <el-form-item label="分类" prop="category_id">
          <el-select v-model="form.category_id" placeholder="选择分类" style="width:100%">
            <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>

        <el-form-item label="价格(元)" prop="price">
          <el-input-number v-model="form.price" :min="0" :step="0.5" :precision="2" style="width:100%" />
        </el-form-item>

        <!-- 图片上传区域 -->
        <el-form-item label="菜品图片">
          <!-- 已有图片预览 -->
          <div v-if="imgPreview" class="img-preview-wrap">
            <img :src="imgPreview" class="img-preview" />
            <el-button class="img-remove-btn" type="danger" circle size="small" @click="clearImage">
              <el-icon><Close /></el-icon>
            </el-button>
          </div>

          <!-- 上传区（无图时显示） -->
          <div v-else class="img-upload-area">
            <!-- Tab 切换：文件 / URL -->
            <div class="img-tab-btns">
              <button :class="['img-tab', imgMode === 'file' ? 'active' : '']" @click.prevent="imgMode='file'">上传文件</button>
              <button :class="['img-tab', imgMode === 'url' ? 'active' : '']" @click.prevent="imgMode='url'">图片URL</button>
            </div>

            <!-- 文件上传 -->
            <div v-if="imgMode === 'file'" class="img-file-zone" @click="triggerFileInput" @dragover.prevent @drop.prevent="onFileDrop">
              <input ref="fileInputRef" type="file" accept="image/*" style="display:none" @change="onFileChange" />
              <div class="img-file-placeholder">
                <span class="img-file-icon">图</span>
                <span class="img-file-text">点击选择图片，或拖拽到此处</span>
                <span class="img-file-hint">支持 JPG / PNG / WebP，最大 5MB</span>
              </div>
              <div v-if="uploading" class="img-uploading">
                <el-icon class="is-loading"><Loading /></el-icon> 上传中...
              </div>
            </div>

            <!-- URL 输入 -->
            <div v-if="imgMode === 'url'" class="img-url-zone">
              <el-input
                v-model="urlInput"
                placeholder="粘贴图片 URL，例如 https://example.com/food.jpg"
                clearable
                @change="onUrlInput"
              />
              <div class="img-url-hint">粘贴 URL 后自动预览</div>
            </div>
          </div>
        </el-form-item>

        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="可选，简短描述" />
        </el-form-item>

        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">上架</el-radio>
            <el-radio :label="0">下架</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveDish">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Plus, Close, Loading } from '@element-plus/icons-vue'
import { dishApi, categoryApi, uploadApi } from '../api/index.js'

const BASE_URL = 'http://localhost:3000'

// ---- 状态 ----
const dishes     = ref([])
const categories = ref([])
const loading    = ref(false)
const saving     = ref(false)

const filter = reactive({ category_id: '', status: '', keyword: '' })

// 弹窗
const dialogVisible = ref(false)
const editId = ref(null)
const formRef = ref(null)
const form = reactive({
  name: '', category_id: '', price: 0, description: '', status: 1, image: ''
})

const rules = {
  name:        [{ required: true, message: '请输入菜品名称', trigger: 'blur' }],
  category_id: [{ required: true, message: '请选择分类', trigger: 'change' }],
  price:       [{ required: true, message: '请输入价格', trigger: 'blur' }]
}

// 图片相关
const imgPreview   = ref('')   // 当前预览 URL（blob 或 http URL）
const imgMode      = ref('file') // 'file' | 'url'
const urlInput     = ref('')
const uploading    = ref(false)
const fileInputRef = ref(null)

// ---- 工具函数 ----
function catName(id) {
  const c = categories.value.find(c => c.id == id)
  return c ? c.name : '-'
}
function catLabel(id) {
  const map = { 1: '热', 2: '凉', 3: '汤', 4: '主', 5: '饮' }
  return map[id] || '餐'
}
function resolveImg(img) {
  if (!img) return ''
  if (img.startsWith('http')) return img
  return BASE_URL + img
}

// ---- 数据加载 ----
async function loadDishes() {
  loading.value = true
  try {
    const params = {}
    if (filter.category_id !== '') params.category_id = filter.category_id
    if (filter.status !== '')      params.status = filter.status
    if (filter.keyword)            params.keyword = filter.keyword
    const res = await dishApi.list(params)
    dishes.value = res.data || []
  } catch (e) {
    console.error('加载菜品失败', e)
  } finally {
    loading.value = false
  }
}

async function loadCategories() {
  try {
    const res = await categoryApi.list()
    categories.value = res.data || []
  } catch (e) {
    console.error('加载分类失败', e)
  }
}

// ---- 添加/编辑 ----
function openAdd() {
  editId.value = null
  Object.assign(form, { name: '', category_id: '', price: 0, description: '', status: 1, image: '' })
  imgPreview.value = ''
  urlInput.value = ''
  imgMode.value = 'file'
  dialogVisible.value = true
}

function openEdit(row) {
  editId.value = row.id
  Object.assign(form, {
    name: row.name,
    category_id: row.category_id,
    price: Number(row.price),
    description: row.description || '',
    status: row.status,
    image: row.image || ''
  })
  imgPreview.value = row.image ? resolveImg(row.image) : ''
  urlInput.value = row.image || ''
  imgMode.value = row.image && !row.image.startsWith('http') ? 'file' : 'url'
  dialogVisible.value = true
}

async function saveDish() {
  await formRef.value.validate()
  saving.value = true
  try {
    const payload = { ...form }
    if (editId.value) {
      await dishApi.update(editId.value, payload)
      ElMessage.success('菜品已更新')
    } else {
      await dishApi.add(payload)
      ElMessage.success('菜品已添加')
    }
    dialogVisible.value = false
    await loadDishes()
  } catch (e) {
    console.error('保存失败', e)
  } finally {
    saving.value = false
  }
}

async function toggleStatus(row) {
  const newStatus = row.status === 1 ? 0 : 1
  try {
    await dishApi.updateStatus(row.id, newStatus)
    row.status = newStatus
    ElMessage.success(newStatus === 1 ? '已上架' : '已下架')
  } catch (e) {}
}

async function removeDish(id) {
  try {
    await dishApi.remove(id)
    ElMessage.success('已删除')
    await loadDishes()
  } catch (e) {}
}

// ---- 图片处理 ----
function clearImage() {
  imgPreview.value = ''
  form.image = ''
  urlInput.value = ''
}

function triggerFileInput() {
  fileInputRef.value?.click()
}

async function onFileChange(e) {
  const file = e.target.files[0]
  if (!file) return
  await uploadFile(file)
  e.target.value = ''
}

async function onFileDrop(e) {
  const file = e.dataTransfer.files[0]
  if (!file || !file.type.startsWith('image/')) {
    ElMessage.error('请拖入图片文件')
    return
  }
  await uploadFile(file)
}

async function uploadFile(file) {
  if (file.size > 5 * 1024 * 1024) {
    ElMessage.error('图片不能超过 5MB')
    return
  }
  uploading.value = true
  try {
    const res = await uploadApi.image(file)
    form.image = res.data.url          // 相对路径，如 /uploads/2026-03-30/xxx.jpg
    imgPreview.value = BASE_URL + res.data.url
    ElMessage.success('图片上传成功')
  } catch (e) {
    ElMessage.error('上传失败，请重试')
  } finally {
    uploading.value = false
  }
}

function onUrlInput(val) {
  if (!val) { clearImage(); return }
  // 简单校验
  if (!val.startsWith('http')) {
    ElMessage.warning('请输入 http 开头的图片链接')
    return
  }
  form.image = val
  imgPreview.value = val
}

onMounted(() => {
  loadCategories()
  loadDishes()
})
</script>

<style scoped>
.dishes-page { padding: 16px; }
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 10px;
}
.toolbar-left { display: flex; gap: 8px; flex-wrap: wrap; }

.no-img-box {
  width: 60px; height: 60px;
  background: linear-gradient(135deg, #FDEBD0, #E8D5C4);
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-size: 20px;
  font-weight: 700;
  color: #C68D56;
}

.empty-tip {
  text-align: center;
  color: #999;
  padding: 48px 0;
  font-size: 15px;
}

/* ---- 图片上传区域 ---- */
.img-preview-wrap {
  position: relative;
  display: inline-block;
}
.img-preview {
  width: 160px; height: 160px;
  object-fit: cover;
  border-radius: 10px;
  border: 1px solid #eee;
  display: block;
}
.img-remove-btn {
  position: absolute;
  top: -8px; right: -8px;
}

.img-upload-area {
  width: 100%;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
}

.img-tab-btns {
  display: flex;
  border-bottom: 1px solid #e4e7ed;
}
.img-tab {
  flex: 1;
  padding: 8px 0;
  border: none;
  background: #fafafa;
  cursor: pointer;
  font-size: 13px;
  color: #666;
  transition: all .2s;
}
.img-tab.active {
  background: #fff;
  color: #C68D56;
  font-weight: 600;
  border-bottom: 2px solid #C68D56;
}

.img-file-zone {
  min-height: 110px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  transition: background .2s;
}
.img-file-zone:hover { background: #fdf6ee; }
.img-file-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 20px;
}
.img-file-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #C68D56, #A97240);
  color: #fff;
  font-size: 18px;
  font-weight: 700;
}
.img-file-text { font-size: 14px; color: #555; }
.img-file-hint { font-size: 12px; color: #aaa; }
.img-uploading {
  position: absolute;
  inset: 0;
  background: rgba(255,255,255,.85);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  color: #C68D56;
}

.img-url-zone {
  padding: 14px;
}
.img-url-hint { font-size: 12px; color: #aaa; margin-top: 6px; }

.form-hint { font-size: 12px; color: #aaa; margin-top: 4px; }
</style>
