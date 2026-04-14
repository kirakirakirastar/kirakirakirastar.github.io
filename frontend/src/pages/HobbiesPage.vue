<template>
  <div class="w-full flex h-[calc(100vh-120px)] animate-fade-in-up">
    <!-- Sidebar -->
    <FolderSidebar 
      title="爱好分类" 
      :folders="folders" 
      :selectedId="selectedFolderId"
      @select="onFolderSelect"
      @add="onFolderAdd"
      @edit="onFolderEdit"
      @delete="onFolderDelete"
    />

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
        <div>
          <h1 class="text-4xl font-extrabold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">爱好追踪</h1>
          <p class="text-gray-500 dark:text-gray-400">ACG、影视游戏记录与评分</p>
        </div>
        <div class="flex gap-3">
          <button 
            v-if="authStore.user"
            @click="isBatchMode = !isBatchMode"
            class="px-5 py-2.5 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-200 rounded-xl font-bold transition-all hover:bg-gray-200 dark:hover:bg-white/20"
            :class="{ 'bg-primary/20 text-primary border border-primary/30': isBatchMode }"
          >
            {{ isBatchMode ? '取消选择' : '批量管理' }}
          </button>
          <router-link
            v-if="authStore.user"
            to="/hobbies/new"
            class="px-5 py-2.5 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            追加爱好
          </router-link>
        </div>
      </div>

    <!-- Filters -->
    <div class="bg-theme-bg/60 dark:bg-theme-card-dark/60 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 p-6 mb-8 flex flex-col md:flex-row gap-4">
      <div class="flex flex-wrap gap-4 w-full">
        <select
          v-model="selectedType"
          class="w-full sm:w-auto px-4 py-3 border border-slate-200 dark:border-slate-700/50 rounded-xl bg-white/50 dark:bg-slate-900/40 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary outline-none transition-all backdrop-blur-sm cursor-pointer"
          @change="loadHobbies"
        >
          <option value="">所有类型</option>
          <option value="anime">动漫</option>
          <option value="book">书籍</option>
          <option value="game">游戏</option>
        </select>
        <select
          v-model="selectedStatus"
          class="w-full sm:w-auto px-4 py-3 border border-slate-200 dark:border-slate-700/50 rounded-xl bg-white/50 dark:bg-slate-900/40 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary outline-none transition-all backdrop-blur-sm cursor-pointer"
          @change="loadHobbies"
        >
          <option value="">所有状态</option>
          <option value="want">想看</option>
          <option value="in_progress">在看</option>
          <option value="completed">已完成</option>
          <option value="paused">搁置</option>
        </select>
        <select
          v-model="selectedTag"
          class="w-full sm:w-auto px-4 py-3 border border-slate-200 dark:border-slate-700/50 rounded-xl bg-white/50 dark:bg-slate-900/40 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary outline-none transition-all backdrop-blur-sm cursor-pointer"
          @change="loadHobbies"
        >
          <option value="">所有标签</option>
          <option v-for="tag in tags" :key="tag.id" :value="tag.name">{{ tag.name }}</option>
        </select>
      </div>
    </div>

    <!-- Stats -->
    <div v-if="stats" class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
      <div class="bg-theme-bg/70 dark:bg-theme-card-dark/70 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 p-6 text-center hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
        <div class="text-3xl font-extrabold text-primary dark:text-primary-light">{{ stats.total }}</div>
        <div class="text-sm text-gray-500 dark:text-slate-400 mt-1 font-medium">总条目</div>
      </div>
      <div class="bg-theme-bg/70 dark:bg-theme-card-dark/70 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 p-6 text-center hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
        <div class="text-3xl font-extrabold text-secondary">{{ stats.completed }}</div>
        <div class="text-sm text-gray-500 dark:text-slate-400 mt-1 font-medium">已完成</div>
      </div>
      <div class="bg-theme-bg/70 dark:bg-theme-card-dark/70 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 p-6 text-center hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
        <div class="text-3xl font-extrabold text-primary-light">{{ stats.in_progress }}</div>
        <div class="text-sm text-gray-500 dark:text-slate-400 mt-1 font-medium">在看</div>
      </div>
      <div class="bg-theme-bg/70 dark:bg-theme-card-dark/70 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 p-6 text-center hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
        <div class="text-3xl font-extrabold text-secondary-light">{{ stats.avg_rating?.toFixed(1) || '-' }}</div>
        <div class="text-sm text-gray-500 dark:text-slate-400 mt-1 font-medium">平均评分</div>
      </div>
    </div>

    <!-- List Content -->
    <div class="flex-1 overflow-y-auto min-h-0 scrollbar-hide pb-20">
      <!-- Hobbies List -->
      <div v-if="loading" class="text-center py-12 text-gray-500">加载中...</div>
      <div v-else-if="hobbies.length === 0" class="text-center py-12 text-gray-500">暂无条目，点击上方新建按钮或筛选其他分类</div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 pt-1">
        <div
          v-for="hobby in hobbies"
          :key="hobby.id"
          class="relative bg-theme-bg/70 dark:bg-theme-card-dark/70 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col"
          :class="{ 'ring-2 ring-primary border-primary/50 shadow-lg': isSelected(hobby.id) }"
        >
          <!-- Selection Checkbox Area -->
          <div 
            v-if="isBatchMode" 
            @click.stop="toggleSelection(hobby.id)"
            class="absolute top-4 left-4 z-10 w-6 h-6 rounded-lg border-2 border-primary/30 flex items-center justify-center cursor-pointer transition-all hover:scale-110"
            :class="[isSelected(hobby.id) ? 'bg-primary border-primary text-white shadow-md' : 'bg-white/80 dark:bg-slate-800/80']"
          >
            <svg v-if="isSelected(hobby.id)" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
          </div>

          <div v-if="hobby.cover_url" class="aspect-[3/4] bg-gray-200 dark:bg-theme-bg-dark/50">
            <img
              :src="getImageUrl(hobby.cover_url)"
              :alt="hobby.title"
              class="w-full h-full object-cover"
            />
          </div>
          <div v-else class="aspect-[3/4] bg-gray-50 dark:bg-theme-bg-dark/30 flex items-center justify-center">
            <span class="text-gray-400 text-sm">无海报</span>
          </div>
          <div class="p-6 flex flex-col flex-1">
            <div class="flex items-start justify-between mb-3" :class="{ 'pl-8': isBatchMode }">
              <h3 class="font-extrabold text-lg line-clamp-2 leading-tight">{{ hobby.title }}</h3>
              <span
                class="px-2 py-1 text-xs rounded-full whitespace-nowrap ml-2"
                :class="statusClass(hobby.status)"
              >
                {{ statusLabel(hobby.status) }}
              </span>
            </div>
            <div class="flex items-center gap-2 mb-3 text-sm text-gray-500">
              <span>{{ typeLabel(hobby.type) }}</span>
              <span v-if="hobby.rating">· {{ hobby.rating }}/10</span>
            </div>
            
            <!-- Tags display -->
            <div v-if="hobby.tags?.length" class="flex flex-wrap gap-1.5 mb-4">
              <span 
                v-for="tag in hobby.tags" 
                :key="tag.id"
                class="px-2 py-0.5 text-[10px] font-bold bg-primary/5 text-primary/70 dark:text-primary-light border border-primary/10 rounded"
              >
                #{{ tag.name }}
              </span>
            </div>

            <p class="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-4 flex-1">
              {{ hobby.review || '暂无短评' }}
            </p>
            <div v-if="authStore.user" class="flex gap-2">
              <router-link
                :to="`/hobbies/${hobby.id}/edit`"
                class="flex-1 px-3 py-2 text-center bg-primary text-white rounded-lg hover:bg-primary-dark text-sm transition-colors"
              >
                编辑
              </router-link>
              <button
                @click="deleteHobby(hobby.id)"
                class="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm transition-colors"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>

    <!-- Batch Actions -->
    <BatchActionBar 
      :count="selectedIds.length" 
      :folders="folders"
      @move="onBatchMove"
      @delete="onBatchDelete"
      @clear="clearSelection"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { hobbiesApi } from '@/api/hobbies'
import { supabaseFoldersApi } from '@/api/supabaseData'
import { resolveAssetUrl } from '@/api/http'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import FolderSidebar from '@/components/ui/FolderSidebar.vue'
import BatchActionBar from '@/components/ui/BatchActionBar.vue'

const authStore = useAuthStore()
const uiStore = useUiStore()
const loading = ref(true)
const hobbies = ref<any[]>([])
const stats = ref<any>(null)
const folders = ref<any[]>([])
const tags = ref<any[]>([])
const selectedType = ref('')
const selectedStatus = ref('')
const selectedTag = ref('')
const selectedFolderId = ref<number | null | undefined>(undefined)

// Batch selection state
const isBatchMode = ref(false)
const selectedIds = ref<number[]>([])

const isSelected = (id: number) => selectedIds.value.includes(id)
const toggleSelection = (id: number) => {
  const index = selectedIds.value.indexOf(id)
  if (index > -1) {
    selectedIds.value.splice(index, 1)
  } else {
    selectedIds.value.push(id)
  }
}
const clearSelection = () => {
  selectedIds.value = []
  isBatchMode.value = false
}

// Folder actions
const loadFolders = async () => {
  try {
    folders.value = await supabaseFoldersApi.list('hobby')
  } catch (error) {
    console.error('加载文件夹失败:', error)
  }
}

const onFolderSelect = (id: number | null | undefined) => {
  selectedFolderId.value = id
  loadHobbies()
}

const onFolderAdd = async () => {
  const name = prompt('请输入新文件夹名称')
  if (!name) return
  try {
    await supabaseFoldersApi.create(name, 'hobby')
    await loadFolders()
    uiStore.addToast('文件夹已创建', 'success')
  } catch (error: any) {
    console.error('创建失败:', error)
    uiStore.addToast(error.message || '创建文件夹失败', 'error')
  }
}

const onFolderEdit = async (folder: any) => {
  const name = prompt('请输入新文件夹名称', folder.name)
  if (!name || name === folder.name) return
  try {
    await supabaseFoldersApi.update(folder.id, name)
    await loadFolders()
    uiStore.addToast('文件夹已更新', 'success')
  } catch (error: any) {
    console.error('更新失败:', error)
    uiStore.addToast(error.message || '更新文件夹失败', 'error')
  }
}

const onFolderDelete = async (id: number) => {
  if (!confirm('确定要删除这个文件夹吗？其中的相关爱好将被移出分类。')) return
  try {
    await supabaseFoldersApi.delete(id)
    if (selectedFolderId.value === id) selectedFolderId.value = undefined
    await loadFolders()
    await loadHobbies()
    uiStore.addToast('文件夹已删除', 'success')
  } catch (error: any) {
    console.error('删除失败:', error)
    uiStore.addToast(error.message || '删除文件夹失败', 'error')
  }
}

// Batch actions
const onBatchMove = async (folderId: number | null) => {
  if (selectedIds.value.length === 0) return
  try {
    await hobbiesApi.batchMove(selectedIds.value, folderId)
    uiStore.addToast(`成功移动 ${selectedIds.value.length} 条爱好`, 'success')
    clearSelection()
    await loadHobbies()
  } catch (error) {
    console.error('批量移动失败:', error)
    uiStore.addToast('操作失败', 'error')
  }
}

const onBatchDelete = async () => {
  if (selectedIds.value.length === 0) return
  if (!confirm(`确定要删除选中的 ${selectedIds.value.length} 条爱好吗？此操作不可撤销。`)) return
  try {
    await hobbiesApi.batchDelete(selectedIds.value)
    uiStore.addToast('删除成功', 'success')
    clearSelection()
    await loadHobbies()
    await loadStats()
  } catch (error) {
    console.error('批量删除失败:', error)
    uiStore.addToast('删除失败', 'error')
  }
}

const statusLabel = (status: string) => {
  const labels: Record<string, string> = {
    want: '想看',
    in_progress: '在看',
    completed: '已完成',
    paused: '搁置'
  }
  return labels[status] || status
}

const typeLabel = (type: string) => {
  const labels: Record<string, string> = {
    anime: '动漫',
    book: '书籍',
    game: '游戏'
  }
  return labels[type] || type
}

const statusClass = (status: string) => {
  const classes: Record<string, string> = {
    want: 'bg-primary/10 text-primary dark:text-primary-light',
    in_progress: 'bg-secondary/10 text-secondary dark:text-secondary-light',
    completed: 'bg-primary/20 text-primary dark:text-primary-light font-bold',
    paused: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
  }
  return classes[status] || 'bg-gray-100 text-gray-700'
}

const getImageUrl = (url: string) => resolveAssetUrl(url)

const loadHobbies = async () => {
  loading.value = true
  try {
    const params: any = {}
    if (selectedType.value) params.type = selectedType.value
    if (selectedStatus.value) params.status = selectedStatus.value
    if (selectedTag.value) params.tag = selectedTag.value
    if (selectedFolderId.value !== undefined) params.folderId = selectedFolderId.value
    
    hobbies.value = await hobbiesApi.list(params)
  } catch (error) {
    console.error('加载条目失败:', error)
  } finally {
    loading.value = false
  }
}

const loadFilters = async () => {
  try {
    tags.value = await hobbiesApi.tags()
  } catch (error) {
    console.error('加载标签失败:', error)
  }
}

const loadStats = async () => {
  try {
    stats.value = await hobbiesApi.stats()
  } catch (error) {
    console.error('加载统计失败:', error)
  }
}

const deleteHobby = async (id: number) => {
  if (!confirm('确定要删除这个条目吗？')) return

  try {
    await hobbiesApi.delete(id)
    await loadHobbies()
    await loadStats()
  } catch (error) {
    console.error('删除条目失败:', error)
  }
}

onMounted(() => {
  loadHobbies()
  loadStats()
  loadFolders()
  loadFilters()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
