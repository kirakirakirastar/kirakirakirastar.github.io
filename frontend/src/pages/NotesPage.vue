<template>
  <div class="w-full px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up">
    <div class="flex justify-between items-end mb-10">
      <div>
        <h1 class="text-4xl font-extrabold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">学习笔记</h1>
        <p class="text-gray-500 dark:text-gray-400">所有技术探索的堆叠与存放区</p>
      </div>
      <router-link
        v-if="authStore.user"
        to="/notes/new"
        class="px-5 py-2.5 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
      >
        写新笔记
      </router-link>
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

    <!-- Notes List -->
    <div v-if="loading" class="text-center py-12 text-gray-400 animate-pulse">加载中...</div>
    <div v-else-if="notes.length === 0">
      <EmptyState title="暂无笔记" message="点击上方新建按钮创建" />
    </div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
      <div
        v-for="note in notes"
        :key="note.id"
        class="bg-theme-bg/70 dark:bg-theme-card-dark/70 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
      >
        <router-link :to="`/notes/${note.id}`" class="block p-6">
          <div class="flex justify-between items-start mb-3">
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
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import dayjs from 'dayjs'
import { notesApi } from '@/api/notes'
import { useAuthStore } from '@/stores/auth'
import EmptyState from '@/components/ui/EmptyState.vue'

const authStore = useAuthStore()
const loading = ref(true)
const notes = ref<any[]>([])
const tags = ref<any[]>([])
const archives = ref<any[]>([])
const keyword = ref('')
const selectedTag = ref('')
const selectedArchive = ref('')

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
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
