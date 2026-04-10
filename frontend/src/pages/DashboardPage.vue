<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Dashboard</h1>
      <p class="text-gray-600 dark:text-gray-400">汇总展示最新动态与简单统计</p>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div class="text-2xl font-bold text-blue-600">{{ stats.notes_count }}</div>
        <div class="text-sm text-gray-600 dark:text-gray-400">代码笔记</div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div class="text-2xl font-bold text-green-600">{{ stats.journals_count }}</div>
        <div class="text-sm text-gray-600 dark:text-gray-400">个人日志</div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div class="text-2xl font-bold text-purple-600">{{ stats.hobbies_count }}</div>
        <div class="text-sm text-gray-600 dark:text-gray-400">爱好条目</div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div class="text-2xl font-bold text-orange-600">{{ stats.completed_hobbies }}</div>
        <div class="text-sm text-gray-600 dark:text-gray-400">已完成</div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div class="text-2xl font-bold text-red-600">{{ stats.month_updates }}</div>
        <div class="text-sm text-gray-600 dark:text-gray-400">本月更新</div>
      </div>
    </div>

    <!-- Latest Activity -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Latest Notes -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold mb-4">最新笔记</h2>
        <div v-if="loading" class="text-center py-8 text-gray-500">加载中...</div>
        <div v-else-if="latestNotes.length === 0" class="text-center py-8 text-gray-500">暂无数据</div>
        <div v-else class="space-y-3">
          <router-link
            v-for="note in latestNotes"
            :key="note.id"
            :to="`/notes/${note.id}`"
            class="block p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <div class="font-medium">{{ note.title }}</div>
            <div class="text-sm text-gray-500 mt-1">{{ formatDate(note.created_at) }}</div>
          </router-link>
        </div>
      </div>

      <!-- Latest Journals -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold mb-4">最新日志</h2>
        <div v-if="loading" class="text-center py-8 text-gray-500">加载中...</div>
        <div v-else-if="latestJournals.length === 0" class="text-center py-8 text-gray-500">暂无数据</div>
        <div v-else class="space-y-3">
          <router-link
            v-for="journal in latestJournals"
            :key="journal.id"
            :to="`/journals/${journal.id}`"
            class="block p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <div class="font-medium">{{ journal.title }}</div>
            <div class="text-sm text-gray-500 mt-1">{{ formatDate(journal.created_at) }}</div>
          </router-link>
        </div>
      </div>

      <!-- Latest Hobbies -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold mb-4">最新爱好动态</h2>
        <div v-if="loading" class="text-center py-8 text-gray-500">加载中...</div>
        <div v-else-if="latestHobbies.length === 0" class="text-center py-8 text-gray-500">暂无数据</div>
        <div v-else class="space-y-3">
          <div
            v-for="hobby in latestHobbies"
            :key="hobby.id"
            class="p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <div class="font-medium">{{ hobby.title }}</div>
            <div class="text-sm text-gray-500 mt-1">
              {{ hobby.type }} · {{ hobby.status }} · {{ formatDate(hobby.updated_at) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import dayjs from 'dayjs'
import { dashboardApi } from '@/api/dashboard'

const loading = ref(true)
const stats = ref({
  notes_count: 0,
  journals_count: 0,
  hobbies_count: 0,
  completed_hobbies: 0,
  month_updates: 0,
})
const latestNotes = ref<any[]>([])
const latestJournals = ref<any[]>([])
const latestHobbies = ref<any[]>([])

const formatDate = (date: string) => dayjs(date).format('MM-DD HH:mm')

const loadDashboard = async () => {
  try {
    const data = await dashboardApi.get()
    stats.value = data.stats
    latestNotes.value = data.latest_notes
    latestJournals.value = data.latest_journals
    latestHobbies.value = data.latest_hobbies
  } catch (error) {
    console.error('加载 Dashboard 失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadDashboard()
})
</script>
