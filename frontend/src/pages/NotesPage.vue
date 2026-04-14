<template>
  <div class="w-full flex h-[calc(100vh-120px)] animate-fade-in-up">
    <!-- Sidebar -->
    <FolderSidebar 
      title="笔记分类" 
      :folders="folders" 
      :selectedId="selectedFolderId"
      @select="onFolderSelect"
      @add="onFolderAdd"
      @edit="onFolderEdit"
      @delete="onFolderDelete"
    />

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex justify-between items-end mb-10">
        <div>
          <h1 class="text-4xl font-extrabold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">学习笔记</h1>
          <p class="text-gray-500 dark:text-gray-400">所有技术探索的堆叠与存放区</p>
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
            to="/notes/new"
            class="px-5 py-2.5 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            写新笔记
          </router-link>
        </div>
      </div>

    <!-- Filters -->
    <div class="bg-theme-bg/60 dark:bg-theme-card-dark/60 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 p-6 mb-8 flex flex-col md:flex-row gap-4">
      <div class="flex w-full flex-wrap gap-4">
        <input
          v-model="keyword"
          type="text"
          placeholder="搜索笔记..."
          class="flex-1 min-w-[12rem] px-4 py-3 border border-slate-200 dark:border-slate-700/50 rounded-xl bg-white/50 dark:bg-slate-900/40 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary outline-none transition-all backdrop-blur-sm"
          @input="debouncedSearch"
        />
        <select
          v-model="selectedTag"
          class="w-full sm:w-auto px-4 py-3 border border-slate-200 dark:border-slate-700/50 rounded-xl bg-white/50 dark:bg-slate-900/40 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary outline-none transition-all backdrop-blur-sm cursor-pointer"
          @change="loadNotes"
        >
          <option value="">所有标签</option>
          <option v-for="tag in tags" :key="tag.id" :value="tag.name">{{ tag.name }}</option>
        </select>
        <select
          v-model="selectedArchive"
          class="w-full sm:w-auto px-4 py-3 border border-slate-200 dark:border-slate-700/50 rounded-xl bg-white/50 dark:bg-slate-900/40 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary outline-none transition-all backdrop-blur-sm cursor-pointer"
          @change="loadNotes"
        >
          <option value="">所有时间</option>
          <option v-for="arch in archives" :key="`${arch.year}-${arch.month}`" :value="`${arch.year}-${arch.month}`">
            {{ arch.year }}年{{ arch.month }}月 ({{ arch.count }})
          </option>
        </select>
      </div>
    </div>

      <!-- List Content -->
      <div class="flex-1 overflow-y-auto min-h-0 scrollbar-hide pb-20">
        <!-- Skeleton Loader -->
        <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          <div v-for="i in 10" :key="i" class="bg-white/50 dark:bg-slate-800/40 rounded-2xl p-6 border border-gray-100 dark:border-white/5 space-y-4">
            <div class="flex justify-between items-center">
              <Skeleton width="60%" height="24px" />
              <Skeleton width="20%" height="16px" />
            </div>
            <Skeleton height="16px" />
            <Skeleton height="16px" width="80%" />
            <div class="flex gap-2 pt-2">
              <Skeleton width="40px" height="20px" shape="rect" />
              <Skeleton width="50px" height="20px" shape="rect" />
            </div>
          </div>
        </div>
        <div v-else-if="notes.length === 0">
          <EmptyState title="暂无笔记" message="点击上方新建按钮或筛选其他分类" />
        </div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 pt-1">
          <div
            v-for="note in notes"
            :key="note.id"
            class="relative bg-theme-bg/70 dark:bg-theme-card-dark/70 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
            :class="{ 'ring-2 ring-primary border-primary/50 shadow-lg': isSelected(note.id) }"
          >
            <!-- Selection Checkbox Area -->
            <div 
              v-if="isBatchMode" 
              @click.stop="toggleSelection(note.id)"
              class="absolute top-4 left-4 z-10 w-6 h-6 rounded-lg border-2 border-primary/30 flex items-center justify-center cursor-pointer transition-all hover:scale-110"
              :class="[isSelected(note.id) ? 'bg-primary border-primary text-white shadow-md' : 'bg-white/80 dark:bg-slate-800/80']"
            >
              <svg v-if="isSelected(note.id)" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
            </div>

            <router-link :to="`/notes/${note.id}`" class="block p-6">
              <div class="flex justify-between items-start mb-3" :class="{ 'pl-8': isBatchMode }">
                <h2 class="text-xl font-bold group-hover:text-primary transition-colors">
                  {{ note.title }}
                </h2>
                <span class="text-sm text-gray-400 whitespace-nowrap ml-4">{{ formatDate(note.created_at) }}</span>
              </div>
              <p class="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2 leading-relaxed">{{ note.summary || '暂无摘要' }}</p>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="tag in note.tags"
                  :key="tag.id"
                  class="px-2.5 py-1 text-xs font-medium bg-primary/10 text-primary dark:text-primary-light border border-primary/20 rounded-full"
                >
                  {{ tag.name }}
                </span>
              </div>
            </router-link>
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
import dayjs from 'dayjs'
import { notesApi } from '@/api/notes'
import { supabaseFoldersApi } from '@/api/supabaseData'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import EmptyState from '@/components/ui/EmptyState.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import FolderSidebar from '@/components/ui/FolderSidebar.vue'
import BatchActionBar from '@/components/ui/BatchActionBar.vue'

const authStore = useAuthStore()
const uiStore = useUiStore()
const loading = ref(true)
const notes = ref<any[]>([])
const tags = ref<any[]>([])
const folders = ref<any[]>([])
const archives = ref<any[]>([])
const keyword = ref('')
const selectedTag = ref('')
const selectedArchive = ref('')
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
    folders.value = await supabaseFoldersApi.list('note')
  } catch (error) {
    console.error('加载文件夹失败:', error)
  }
}

const onFolderSelect = (id: number | null | undefined) => {
  selectedFolderId.value = id
  loadNotes()
}

const onFolderAdd = async () => {
  const name = prompt('请输入新文件夹名称')
  if (!name) return
  try {
    await supabaseFoldersApi.create(name, 'note')
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
  if (!confirm('确定要删除这个文件夹吗？其中的笔记将被移出分类。')) return
  try {
    await supabaseFoldersApi.delete(id)
    if (selectedFolderId.value === id) selectedFolderId.value = undefined
    await loadFolders()
    await loadNotes()
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
    await notesApi.batchMove(selectedIds.value, folderId)
    uiStore.addToast(`成功移动 ${selectedIds.value.length} 条笔记`, 'success')
    clearSelection()
    await loadNotes()
  } catch (error) {
    console.error('批量移动失败:', error)
    uiStore.addToast('操作失败', 'error')
  }
}

const onBatchDelete = async () => {
  if (selectedIds.value.length === 0) return
  if (!confirm(`确定要删除选中的 ${selectedIds.value.length} 条笔记吗？此操作不可撤销。`)) return
  try {
    await notesApi.batchDelete(selectedIds.value)
    uiStore.addToast('删除成功', 'success')
    clearSelection()
    await loadNotes()
    await loadFilters()
  } catch (error) {
    console.error('批量删除失败:', error)
    uiStore.addToast('删除失败', 'error')
  }
}

let searchTimer: any = null
const debouncedSearch = () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => loadNotes(), 300)
}

const formatDate = (date: string) => dayjs(date).format('YYYY-MM-DD')

const loadNotes = async () => {
  loading.value = true
  try {
    const params: any = {}
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
    notes.value = await notesApi.list(params)
  } catch (error) {
    console.error('加载笔记失败:', error)
  } finally {
    loading.value = false
  }
}

const loadFilters = async () => {
  try {
    tags.value = await notesApi.tags()
    archives.value = await notesApi.archives()
  } catch (error) {
    console.error('加载筛选数据失败:', error)
  }
}

onMounted(() => {
  loadNotes()
  loadFilters()
  loadFolders()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
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
