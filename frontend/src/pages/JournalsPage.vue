<template>
  <div class="w-full min-h-[calc(100vh-120px)] animate-fade-in-up px-4 sm:px-6 lg:px-8 py-8 pb-32 mx-auto max-w-[1600px]">
    <!-- Header -->
    <div class="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-10 gap-6">
      <div class="shrink-0">
        <h1 class="text-4xl font-extrabold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">个人日志</h1>
        <p class="text-gray-500 dark:text-gray-400">生活点滴与富文本记录</p>
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
          :class="{ 'bg-secondary/10 text-secondary border border-secondary/30': isBatchMode }"
        >
          {{ isBatchMode ? '取消选择' : '批量管理' }}
        </button>
        
        <router-link
          v-if="authStore.user"
          to="/journals/new"
          class="px-5 py-2.5 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all whitespace-nowrap"
        >
          写新日志
        </router-link>
      </div>
    </div>

    <!-- Search -->
    <div class="bg-theme-bg/60 dark:bg-theme-card-dark/60 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 p-6 mb-8 flex flex-col md:flex-row gap-4">
      <div class="flex w-full flex-wrap gap-4">
        <input
          v-model="keyword"
          type="text"
          placeholder="搜索日志..."
          class="flex-1 min-w-[12rem] px-4 py-3 border border-slate-200 dark:border-slate-700/50 rounded-xl bg-white/50 dark:bg-slate-900/40 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary outline-none transition-all backdrop-blur-sm"
          @input="debouncedSearch"
        />
        <select
          v-model="selectedTag"
          class="w-full sm:w-auto px-4 py-3 border border-slate-200 dark:border-slate-700/50 rounded-xl bg-white/50 dark:bg-slate-900/40 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary outline-none transition-all backdrop-blur-sm cursor-pointer"
          @change="loadJournals"
        >
          <option value="">所有标签</option>
          <option v-for="tag in tags" :key="tag.id" :value="tag.name">{{ tag.name }}</option>
        </select>
        <select
          v-model="selectedArchive"
          class="w-full sm:w-auto px-4 py-3 border border-slate-200 dark:border-slate-700/50 rounded-xl bg-white/50 dark:bg-slate-900/40 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary outline-none transition-all backdrop-blur-sm cursor-pointer"
          @change="resetAndLoad"
        >
          <option value="">所有时间</option>
          <option v-for="arch in archives" :key="`${arch.year}-${arch.month}`" :value="`${arch.year}-${arch.month}`">
            {{ arch.year }}年{{ arch.month }}月 ({{ arch.count }})
          </option>
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

    <!-- List Content -->
    <div class="mt-8">
      <!-- Skeleton Loader -->
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        <div v-for="i in 10" :key="i" class="bg-white/50 dark:bg-slate-800/40 rounded-2xl p-6 border border-gray-100 dark:border-white/5 space-y-4">
          <div class="flex justify-between items-center">
            <Skeleton width="60%" height="24px" />
            <Skeleton width="20%" height="16px" />
          </div>
          <Skeleton height="16px" />
          <Skeleton height="16px" />
          <Skeleton height="16px" width="80%" />
          <div class="flex justify-end pt-2">
            <Skeleton width="60px" height="20px" shape="rect" />
          </div>
        </div>
      </div>
      <div v-else-if="journals.length === 0" class="text-center py-12 text-gray-500">暂无日志，点击上方新建按钮或筛选其他分类</div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 pt-1">
        <div
          v-for="journal in journals"
          :key="journal.id"
          class="relative bg-theme-bg/70 dark:bg-theme-card-dark/70 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
          :class="[
            isSelected(journal.id) ? 'ring-2 ring-secondary border-secondary/50 shadow-lg' : '',
            isBatchMode ? 'cursor-pointer' : ''
          ]"
          @click="isBatchMode ? toggleSelection(journal.id) : null"
        >
          <!-- Selection Checkbox Area -->
          <div 
            v-if="isBatchMode" 
            class="absolute top-4 left-4 z-10 w-6 h-6 rounded-lg border-2 border-secondary/30 flex items-center justify-center transition-all hover:scale-110"
            :class="[isSelected(journal.id) ? 'bg-secondary border-secondary text-white shadow-md' : 'bg-white/80 dark:bg-slate-800/80']"
          >
            <svg v-if="isSelected(journal.id)" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
          </div>

          <router-link 
            :to="`/journals/${journal.id}`" 
            class="block p-6"
            @click="isBatchMode ? $event.preventDefault() : null"
          >
            <div class="flex justify-between items-start mb-3" :class="{ 'pl-8': isBatchMode }">
              <h2 class="text-xl font-bold group-hover:text-secondary transition-colors text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <svg v-if="journal.is_private" class="w-4 h-4 text-amber-500 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"></path></svg>
                {{ journal.title }}
              </h2>
              <span class="text-sm text-gray-400 whitespace-nowrap ml-4">{{ formatDate(journal.created_at) }}</span>
            </div>
            <p class="text-gray-600 dark:text-gray-300 mb-3 line-clamp-3 leading-relaxed">{{ journal.excerpt || '暂无摘要' }}</p>
            <div class="flex flex-wrap gap-2 mb-4">
              <span
                v-for="tag in journal.tags"
                :key="tag.id"
                class="px-2.5 py-1 text-xs font-medium bg-secondary/10 text-secondary dark:text-secondary-light border border-secondary/20 rounded-full"
              >
                {{ tag.name }}
              </span>
            </div>
            <div class="flex items-center justify-end mt-2">
              <span class="text-sm text-secondary dark:text-secondary-light font-medium group-hover:translate-x-1 transition-transform">查看详情 &rarr;</span>
            </div>
          </router-link>
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
        <span>{{ loading ? '努力加载中...' : '加载更多日志' }}</span>
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
import { journalsApi } from '@/api/journals'
import { supabaseFoldersApi } from '@/api/supabaseData'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import Skeleton from '@/components/ui/Skeleton.vue'
import FolderDropdown from '@/components/ui/FolderDropdown.vue'
import BatchActionBar from '@/components/ui/BatchActionBar.vue'

const authStore = useAuthStore()
const uiStore = useUiStore()
const loading = ref(true)
const journals = ref<any[]>([])
const tags = ref<any[]>([])
const folders = ref<any[]>([])
const archives = ref<any[]>([])
const keyword = ref('')
const selectedTag = ref('')
const selectedArchive = ref('')
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
    folders.value = await supabaseFoldersApi.list('journal')
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
    await supabaseFoldersApi.create(name, 'journal')
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
  if (!confirm('确定要删除这个文件夹吗？其中的日志将被移出分类。')) return
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
    await journalsApi.batchMove(selectedIds.value, folderId)
    uiStore.addToast(`成功移动 ${selectedIds.value.length} 条日志`, 'success')
    clearSelection()
    await resetAndLoad()
  } catch (error) {
    console.error('批量移动失败:', error)
    uiStore.addToast('操作失败', 'error')
  }
}

const onBatchDelete = async () => {
  if (selectedIds.value.length === 0) return
  if (!confirm(`确定要删除选中的 ${selectedIds.value.length} 条日志吗？此操作不可撤销。`)) return
  try {
    await journalsApi.batchDelete(selectedIds.value)
    uiStore.addToast('删除成功', 'success')
    clearSelection()
    await resetAndLoad()
    await loadFilters()
  } catch (error) {
    console.error('批量删除失败:', error)
    uiStore.addToast('删除失败', 'error')
  }
}

let searchTimer: any = null
const debouncedSearch = () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => resetAndLoad(), 300)
}

const formatDate = (date: string) => dayjs(date).format('YYYY-MM-DD')

const loadJournals = async () => {
  loading.value = true
  try {
    const params: any = {
      page: page.value,
      pageSize: pageSize.value
    }
    if (keyword.value) params.keyword = keyword.value
    if (selectedTag.value) params.tag = selectedTag.value
    if (selectedArchive.value) {
      const [year, month] = selectedArchive.value.split('-').map(Number)
      params.year = year
      params.month = month
    }
    if (selectedFolderId.value !== undefined) {
      params.folderId = selectedFolderId.value
    }
    const data = await journalsApi.list(params)
    if (page.value === 1) {
      journals.value = data
    } else {
      journals.value = [...journals.value, ...data]
    }
    hasMore.value = data.length === pageSize.value
  } catch (error) {
    console.error('加载日志失败:', error)
  } finally {
    loading.value = false
  }
}

const resetAndLoad = () => {
  page.value = 1
  loadJournals()
}

const loadMore = () => {
  if (loading.value || !hasMore.value) return
  page.value++
  loadJournals()
}

const loadFilters = async () => {
  try {
    tags.value = await journalsApi.tags()
    archives.value = await journalsApi.archives()
  } catch (error) {
    console.error('加载筛选数据失败:', error)
  }
}

onMounted(() => {
  loadJournals()
  loadFilters()
  loadFolders()
})
</script>

<style scoped>
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
