<template>
  <div class="w-full px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up">
    <div class="flex justify-between items-end mb-10">
      <div>
        <h1 class="text-4xl font-extrabold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">个人日志</h1>
        <p class="text-gray-500 dark:text-gray-400">生活点滴与富文本记录</p>
      </div>
      <router-link
        v-if="authStore.user"
        to="/journals/new"
        class="px-5 py-2.5 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
      >
        写新日志
      </router-link>
    </div>

    <!-- Search -->
    <div class="bg-theme-bg/60 dark:bg-theme-card-dark/60 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 p-6 mb-8 flex flex-col md:flex-row gap-4">
      <div class="flex w-full flex-wrap gap-4">
        <input
          v-model="keyword"
          type="text"
          placeholder="搜索日志..."
          class="flex-1 min-w-[12rem] px-4 py-3 border rounded-xl bg-white/50 dark:bg-theme-bg-dark/50 dark:border-slate-700/50 focus:ring-2 focus:ring-primary outline-none transition-shadow backdrop-blur-sm"
          @input="debouncedSearch"
        />
        <select
          v-model="selectedArchive"
          class="w-full sm:w-auto px-4 py-3 border rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary outline-none transition-shadow cursor-pointer"
          @change="loadJournals"
        >
          <option value="">所有时间</option>
          <option v-for="arch in archives" :key="`${arch.year}-${arch.month}`" :value="`${arch.year}-${arch.month}`">
            {{ arch.year }}年{{ arch.month }}月 ({{ arch.count }})
          </option>
        </select>
      </div>
    </div>

    <!-- Journals List -->
    <div v-if="loading" class="text-center py-12 text-gray-400 animate-pulse">加载中...</div>
    <div v-else-if="journals.length === 0" class="text-center py-12 text-gray-500">暂无日志，点击上方新建按钮创建</div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
      <div
        v-for="journal in journals"
        :key="journal.id"
        class="bg-theme-bg/70 dark:bg-theme-card-dark/70 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
      >
        <router-link :to="`/journals/${journal.id}`" class="block p-6">
          <div class="flex justify-between items-start mb-3">
            <h2 class="text-xl font-bold group-hover:text-secondary transition-colors">
              {{ journal.title }}
            </h2>
            <span class="text-sm text-gray-400 whitespace-nowrap ml-4">{{ formatDate(journal.created_at) }}</span>
          </div>
          <p class="text-gray-600 dark:text-gray-300 mb-3 line-clamp-3 leading-relaxed">{{ journal.excerpt || '暂无摘要' }}</p>
          <div class="flex items-center justify-end mt-4">
            <span class="text-sm text-secondary dark:text-secondary-light font-medium group-hover:translate-x-1 transition-transform">查看详情 &rarr;</span>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import dayjs from 'dayjs'
import { journalsApi } from '@/api/journals'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const loading = ref(true)
const journals = ref<any[]>([])
const archives = ref<any[]>([])
const keyword = ref('')
const selectedArchive = ref('')

let searchTimer: any = null
const debouncedSearch = () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => loadJournals(), 300)
}

const formatDate = (date: string) => dayjs(date).format('YYYY-MM-DD')

const loadJournals = async () => {
  loading.value = true
  try {
    const params: any = {}
    if (keyword.value) params.keyword = keyword.value
    if (selectedArchive.value) {
      const [year, month] = selectedArchive.value.split('-').map(Number)
      params.year = year
      params.month = month
    }
    journals.value = await journalsApi.list(params)
  } catch (error) {
    console.error('加载日志失败:', error)
  } finally {
    loading.value = false
  }
}

const loadArchives = async () => {
  try {
    archives.value = await journalsApi.archives()
  } catch (error) {
    console.error('加载归档失败:', error)
  }
}

onMounted(() => {
  loadJournals()
  loadArchives()
})
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
