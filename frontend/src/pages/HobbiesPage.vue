<template>
  <div class="w-full min-h-[calc(100vh-120px)] animate-fade-in-up px-4 sm:px-6 lg:px-8 py-8 pb-32 mx-auto max-w-[1600px]">
    <!-- Header -->
    <div class="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-10 gap-6">
      <div class="shrink-0">
        <h1 class="text-4xl font-extrabold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">爱好追踪</h1>
        <p class="text-gray-500 dark:text-gray-400">ACG、影视游戏记录与评分</p>
      </div>
      
      <div class="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-start lg:justify-end">
        <FolderDropdown 
          :folders="folders"
          :selectedId="selectedFolderId"
          @select="onFolderSelect"
          @add="onFolderAdd"
          @edit="onFolderEdit"
          @delete="onFolderDelete"
        />
        
        <div class="h-8 w-px bg-gray-200 dark:bg-white/10 hidden sm:block mx-1"></div>

        <button 
          v-if="authStore.user"
          @click="isBatchMode = !isBatchMode"
          class="px-5 py-2.5 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-200 rounded-xl font-bold transition-all hover:bg-gray-200 dark:hover:bg-white/20 whitespace-nowrap"
          :class="{ 'bg-primary/10 text-primary border border-primary/30': isBatchMode }"
        >
          {{ isBatchMode ? '取消选择' : '批量管理' }}
        </button>
        
        <router-link
          v-if="authStore.user"
          to="/hobbies/new"
          class="px-5 py-2.5 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all whitespace-nowrap"
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
          class="flex-1 min-w-[120px] px-4 py-3 border border-slate-200 dark:border-slate-700/50 rounded-xl bg-white/50 dark:bg-slate-900/40 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary outline-none transition-all backdrop-blur-sm cursor-pointer"
          @change="loadHobbies"
        >
          <option value="">所有类型</option>
          <option value="anime">动漫</option>
          <option value="book">书籍</option>
          <option value="game">游戏</option>
        </select>
        <select
          v-model="selectedStatus"
          class="flex-1 min-w-[120px] px-4 py-3 border border-slate-200 dark:border-slate-700/50 rounded-xl bg-white/50 dark:bg-slate-900/40 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary outline-none transition-all backdrop-blur-sm cursor-pointer"
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
          class="flex-1 min-w-[120px] px-4 py-3 border border-slate-200 dark:border-slate-700/50 rounded-xl bg-white/50 dark:bg-slate-900/40 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary outline-none transition-all backdrop-blur-sm cursor-pointer"
          @change="resetAndLoad"
        >
          <option value="">所有标签</option>
          <option v-for="tag in tags" :key="tag.id" :value="tag.name">{{ tag.name }}</option>
        </select>

        <!-- Page Size Selector -->
        <div class="flex items-center gap-2 ml-auto">
          <span class="text-xs text-slate-500 font-bold uppercase tracking-wider">每页显示</span>
          <select
            v-model="pageSize"
            class="px-3 py-2 border border-slate-200 dark:border-slate-700/50 rounded-lg bg-white/50 dark:bg-slate-900/40 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary outline-none transition-all text-xs font-bold cursor-pointer"
            @change="resetAndLoad"
          >
            <option :value="20">20</option>
            <option :value="50">50</option>
            <option :value="100">100</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div v-if="stats" class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-10">
      <div class="bg-theme-bg/70 dark:bg-theme-card-dark/70 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 p-4 md:p-6 text-center hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
        <div class="text-2xl md:text-3xl font-extrabold text-primary dark:text-primary-light">{{ stats.total }}</div>
        <div class="text-[10px] md:text-sm text-gray-500 dark:text-slate-400 mt-1 font-medium">总条目</div>
      </div>
      <div class="bg-theme-bg/70 dark:bg-theme-card-dark/70 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 p-4 md:p-6 text-center hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
        <div class="text-2xl md:text-3xl font-extrabold text-secondary">{{ stats.completed }}</div>
        <div class="text-[10px] md:text-sm text-gray-500 dark:text-slate-400 mt-1 font-medium">已完成</div>
      </div>
      <div class="bg-theme-bg/70 dark:bg-theme-card-dark/70 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 p-4 md:p-6 text-center hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
        <div class="text-2xl md:text-3xl font-extrabold text-primary-light">{{ stats.in_progress }}</div>
        <div class="text-[10px] md:text-sm text-gray-500 dark:text-slate-400 mt-1 font-medium">在看/玩</div>
      </div>
      <div class="bg-theme-bg/70 dark:bg-theme-card-dark/70 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 p-4 md:p-6 text-center hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
        <div class="text-2xl md:text-3xl font-extrabold text-secondary-light">{{ stats.avg_rating?.toFixed(1) || '-' }}</div>
        <div class="text-[10px] md:text-sm text-gray-500 dark:text-slate-400 mt-1 font-medium">平均评分</div>
      </div>
    </div>

    <!-- List Content -->
    <div>
      <div v-if="loading" class="text-center py-12 text-gray-500">
        <div class="animate-pulse flex flex-col items-center">
          <div class="w-12 h-12 bg-primary/20 rounded-full mb-4"></div>
          <p>加载中...</p>
        </div>
      </div>
      <div v-else-if="hobbies.length === 0">
        <EmptyState title="暂无内容" message="点击上方按钮或筛选其他分类" />
      </div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 pt-1">
        <div
          v-for="hobby in hobbies"
          :key="hobby.id"
          class="relative bg-theme-bg/70 dark:bg-theme-card-dark/70 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col"
          :class="[
            isSelected(hobby.id) ? 'ring-2 ring-primary border-primary/50 shadow-lg' : '',
            isBatchMode ? 'cursor-pointer' : ''
          ]"
          @click="isBatchMode ? toggleSelection(hobby.id) : null"
        >
          <!-- Selection Checkbox Area -->
          <div 
            v-if="isBatchMode" 
            class="absolute top-4 left-4 z-10 w-6 h-6 rounded-lg border-2 border-primary/30 flex items-center justify-center transition-all hover:scale-110"
            :class="[isSelected(hobby.id) ? 'bg-primary border-primary text-white shadow-md' : 'bg-white/80 dark:bg-slate-800/80']"
          >
            <svg v-if="isSelected(hobby.id)" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
          </div>

          <div v-if="hobby.cover_url" class="aspect-[3/4] bg-gray-200 dark:bg-theme-bg-dark/50 overflow-hidden relative">
            <img
              :src="getImageUrl(hobby.cover_url)"
              :alt="hobby.title"
              loading="lazy"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
              <span class="text-white text-[10px] sm:text-xs font-medium flex items-center gap-1.5 mb-1">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                添加于: {{ formatDate(hobby.created_at) }}
              </span>
              <span v-if="hobby.updated_at && hobby.updated_at !== hobby.created_at" class="text-white text-[10px] sm:text-xs font-medium flex items-center gap-1.5 opacity-90">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                更新于: {{ formatDate(hobby.updated_at) }}
              </span>
            </div>
          </div>
          <div v-else class="aspect-[3/4] bg-gray-50 dark:bg-theme-bg-dark/30 flex items-center justify-center">
            <svg class="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 00-2 2z"></path></svg>
          </div>

          <div class="p-5 flex flex-col flex-1">
            <div class="flex items-start justify-between mb-2" :class="{ 'pl-8': isBatchMode }">
              <h3 class="font-extrabold text-lg line-clamp-2 leading-tight text-slate-800 dark:text-slate-100 group-hover:text-primary transition-colors flex items-center gap-2">
                <svg v-if="hobby.is_private" class="w-4 h-4 text-amber-500 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"></path></svg>
                {{ hobby.title }}
              </h3>
              <span
                class="px-2 py-0.5 text-[10px] font-bold rounded-full whitespace-nowrap ml-2 shadow-sm"
                :class="statusClass(hobby.status)"
              >
                {{ statusLabel(hobby.status) }}
              </span>
            </div>
            <div class="flex items-center gap-2 mb-3 text-xs text-gray-500 dark:text-gray-400">
              <span class="bg-gray-100 dark:bg-white/5 px-1.5 py-0.5 rounded">{{ typeLabel(hobby.type) }}</span>
              <span v-if="hobby.rating" class="text-secondary font-bold">★ {{ hobby.rating }}/10</span>
            </div>
            
            <!-- Tags display -->
            <div v-if="hobby.tags?.length" class="flex flex-wrap gap-1 mb-4">
              <span 
                v-for="tag in hobby.tags" 
                :key="tag.id"
                class="px-1.5 py-0.5 text-[10px] font-bold bg-primary/5 text-primary/70 dark:text-primary-light border border-primary/10 rounded"
              >
                #{{ tag.name }}
              </span>
            </div>

            <p class="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4 flex-1 italic leading-relaxed">
              {{ hobby.review || '暂无点评' }}
            </p>
            
            <div v-if="authStore.user" class="flex gap-2">
              <router-link
                :to="isBatchMode ? '' : `/hobbies/${hobby.id}/edit`"
                class="flex-1 px-3 py-2 text-center bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-white text-xs font-bold transition-all shadow-sm"
                @click="isBatchMode ? $event.preventDefault() : null"
              >
                详情/编辑
              </router-link>
              <button
                v-if="!isBatchMode"
                @click.stop="deleteHobby(hobby.id)"
                class="px-3 py-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white text-xs font-bold transition-all"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Load More -->
    <div v-if="hasMore" class="mt-12 flex justify-center pb-20">
      <button 
        @click="loadMore"
        :disabled="loading"
        class="px-10 py-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200 dark:border-slate-700/50 text-slate-600 dark:text-slate-300 rounded-2xl font-black shadow-lg hover:shadow-primary/20 hover:border-primary/50 hover:-translate-y-1 transition-all flex items-center gap-3 disabled:opacity-50"
      >
        <svg v-if="loading" class="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>{{ loading ? '努力加载中...' : '加载更多条目' }}</span>
      </button>
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
import dayjs from 'dayjs'
import { hobbiesApi } from '@/api/hobbies'
import { supabaseFoldersApi } from '@/api/supabaseData'
import { resolveAssetUrl } from '@/api/http'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import FolderDropdown from '@/components/ui/FolderDropdown.vue'
import BatchActionBar from '@/components/ui/BatchActionBar.vue'
import EmptyState from '@/components/ui/EmptyState.vue'

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

// Pagination state
const page = ref(1)
const pageSize = ref(20)
const hasMore = ref(true)

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
  resetAndLoad()
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
    await resetAndLoad()
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
    await resetAndLoad()
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
    await resetAndLoad()
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
    completed: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
    paused: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
  }
  return classes[status] || 'bg-gray-100 text-gray-700'
}

const getImageUrl = (url: string) => resolveAssetUrl(url)
const formatDate = (date: string) => dayjs(date).format('YYYY-MM-DD')

const loadHobbies = async () => {
  loading.value = true
  try {
    const params: any = {
      page: page.value,
      pageSize: pageSize.value
    }
    if (selectedType.value) params.type = selectedType.value
    if (selectedStatus.value) params.status = selectedStatus.value
    if (selectedTag.value) params.tag = selectedTag.value
    if (selectedFolderId.value !== undefined) params.folderId = selectedFolderId.value
    
    const data = await hobbiesApi.list(params)
    if (page.value === 1) {
      hobbies.value = data
    } else {
      hobbies.value = [...hobbies.value, ...data]
    }
    hasMore.value = data.length === pageSize.value
  } catch (error) {
    console.error('加载条目失败:', error)
  } finally {
    loading.value = false
  }
}

const resetAndLoad = () => {
  page.value = 1
  loadHobbies()
}

const loadMore = () => {
  if (loading.value || !hasMore.value) return
  page.value++
  loadHobbies()
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
    uiStore.addToast('已删除', 'success')
    await resetAndLoad()
    await loadStats()
  } catch (error) {
    console.error('删除条目失败:', error)
    uiStore.addToast('删除失败', 'error')
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
</style>
