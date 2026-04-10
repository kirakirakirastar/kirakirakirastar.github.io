<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold mb-2">个人日志</h1>
        <p class="text-gray-600 dark:text-gray-400">富文本编辑，图片上传，支持搜索</p>
      </div>
      <router-link
        to="/journals/new"
        class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
      >
        新建日志
      </router-link>
    </div>

    <!-- Search -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
      <div class="flex flex-wrap gap-4">
        <input
          v-model="keyword"
          type="text"
          placeholder="搜索日志..."
          class="flex-1 min-w-48 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          @input="debouncedSearch"
        />
        <select
          v-model="selectedArchive"
          class="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
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
    <div v-if="loading" class="text-center py-12 text-gray-500">加载中...</div>
    <div v-else-if="journals.length === 0" class="text-center py-12 text-gray-500">暂无日志，点击上方新建按钮创建</div>
    <div v-else class="space-y-4">
      <div
        v-for="journal in journals"
        :key="journal.id"
        class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-md transition-shadow"
      >
        <router-link :to="`/journals/${journal.id}`" class="block">
          <h2 class="text-xl font-semibold mb-2 hover:text-green-600 dark:hover:text-green-400">
            {{ journal.title }}
          </h2>
          <p class="text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">{{ journal.excerpt || '暂无摘要' }}</p>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-500">{{ formatDate(journal.created_at) }}</span>
            <span class="text-sm text-green-600 dark:text-green-400">查看详情 →</span>
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

const loading = ref(true)
const journals = ref<any[]>([])
const archives = ref<any[]>([])
const keyword = ref('')
const selectedArchive = ref('')

let searchTimer: number | null = null
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
