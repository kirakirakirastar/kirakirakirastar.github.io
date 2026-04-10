<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold mb-2">代码笔记</h1>
        <p class="text-gray-600 dark:text-gray-400">Markdown 编写与渲染，代码高亮</p>
      </div>
      <router-link
        to="/notes/new"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        新建笔记
      </router-link>
    </div>

    <!-- Filters -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
      <div class="flex flex-wrap gap-4">
        <input
          v-model="keyword"
          type="text"
          placeholder="搜索笔记..."
          class="flex-1 min-w-48 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          @input="debouncedSearch"
        />
        <select
          v-model="selectedTag"
          class="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          @change="loadNotes"
        >
          <option value="">所有标签</option>
          <option v-for="tag in tags" :key="tag.id" :value="tag.name">{{ tag.name }}</option>
        </select>
        <select
          v-model="selectedArchive"
          class="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
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
    <div v-if="loading" class="text-center py-12 text-gray-500">加载中...</div>
    <div v-else-if="notes.length === 0" class="text-center py-12 text-gray-500">暂无笔记，点击上方新建按钮创建</div>
    <div v-else class="space-y-4">
      <div
        v-for="note in notes"
        :key="note.id"
        class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-md transition-shadow"
      >
        <router-link :to="`/notes/${note.id}`" class="block">
          <h2 class="text-xl font-semibold mb-2 hover:text-blue-600 dark:hover:text-blue-400">
            {{ note.title }}
          </h2>
          <p class="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{{ note.summary || '暂无摘要' }}</p>
          <div class="flex items-center justify-between">
            <div class="flex gap-2">
              <span
                v-for="tag in note.tags"
                :key="tag.id"
                class="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded"
              >
                {{ tag.name }}
              </span>
            </div>
            <span class="text-sm text-gray-500">{{ formatDate(note.created_at) }}</span>
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

const loading = ref(true)
const notes = ref<any[]>([])
const tags = ref<any[]>([])
const archives = ref<any[]>([])
const keyword = ref('')
const selectedTag = ref('')
const selectedArchive = ref('')

let searchTimer: number | null = null
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
