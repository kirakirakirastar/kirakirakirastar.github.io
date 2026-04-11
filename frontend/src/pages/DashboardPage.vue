<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up">
    <div class="mb-10 text-center sm:text-left">
      <h1 class="text-4xl font-extrabold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">欢迎来到 Siana's Space</h1>
      <p class="text-gray-500 dark:text-gray-400 text-lg">记录代码、日志与浩瀚的爱好宇宙。</p>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
      <div class="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700/50 p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
        <div class="text-3xl font-extrabold text-blue-600 dark:text-blue-400">{{ stats.notes_count }}</div>
        <div class="text-sm text-gray-500 dark:text-slate-400 mt-1 font-medium">代码笔记</div>
      </div>
      <div class="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700/50 p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
        <div class="text-3xl font-extrabold text-green-600 dark:text-green-400">{{ stats.journals_count }}</div>
        <div class="text-sm text-gray-500 dark:text-slate-400 mt-1 font-medium">个人日志</div>
      </div>
      <div class="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700/50 p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
        <div class="text-3xl font-extrabold text-purple-600 dark:text-purple-400">{{ stats.hobbies_count }}</div>
        <div class="text-sm text-gray-500 dark:text-slate-400 mt-1 font-medium">爱好条目</div>
      </div>
      <div class="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700/50 p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
        <div class="text-3xl font-extrabold text-orange-600 dark:text-orange-400">{{ stats.completed_hobbies }}</div>
        <div class="text-sm text-gray-500 dark:text-slate-400 mt-1 font-medium">已完成</div>
      </div>
      <div class="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700/50 p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
        <div class="text-3xl font-extrabold text-rose-500 dark:text-rose-400">{{ stats.month_updates }}</div>
        <div class="text-sm text-gray-500 dark:text-slate-400 mt-1 font-medium">本月更新</div>
      </div>
    </div>

    <!-- Latest Activity -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Latest Notes -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700/50 p-6 flex flex-col">
        <h2 class="text-xl font-bold mb-5 flex items-center space-x-2">
          <span class="w-2 h-6 rounded bg-blue-500 block"></span>
          <span>近期笔记</span>
        </h2>
        <div v-if="loading" class="text-center py-8 text-gray-400 animate-pulse">加载中...</div>
        <div v-else-if="latestNotes.length === 0" class="text-center py-8 text-gray-400">暂无数据</div>
        <div v-else class="space-y-3">
          <router-link
            v-for="note in latestNotes"
            :key="note.id"
            :to="`/notes/${note.id}`"
            class="block p-4 rounded-xl border border-transparent hover:border-blue-100 hover:bg-blue-50 dark:hover:bg-slate-700/50 dark:hover:border-slate-600 transition-colors"
          >
            <div class="font-semibold text-gray-800 dark:text-gray-200 truncate">{{ note.title }}</div>
            <div class="text-xs text-gray-400 mt-2">{{ formatDate(note.created_at) }}</div>
          </router-link>
        </div>
      </div>

      <!-- Latest Journals -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700/50 p-6 flex flex-col">
        <h2 class="text-xl font-bold mb-5 flex items-center space-x-2">
          <span class="w-2 h-6 rounded bg-green-500 block"></span>
          <span>最新日志</span>
        </h2>
        <div v-if="loading" class="text-center py-8 text-gray-400 animate-pulse">加载中...</div>
        <div v-else-if="latestJournals.length === 0" class="text-center py-8 text-gray-400">暂无数据</div>
        <div v-else class="space-y-3">
          <router-link
            v-for="journal in latestJournals"
            :key="journal.id"
            :to="`/journals/${journal.id}`"
            class="block p-4 rounded-xl border border-transparent hover:border-green-100 hover:bg-green-50 dark:hover:bg-slate-700/50 dark:hover:border-slate-600 transition-colors"
          >
            <div class="font-semibold text-gray-800 dark:text-gray-200 truncate">{{ journal.title }}</div>
            <div class="text-xs text-gray-400 mt-2">{{ formatDate(journal.created_at) }}</div>
          </router-link>
        </div>
      </div>

      <!-- Latest Hobbies -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700/50 p-6 flex flex-col">
        <h2 class="text-xl font-bold mb-5 flex items-center space-x-2">
          <span class="w-2 h-6 rounded bg-purple-500 block"></span>
          <span>爱好追踪</span>
        </h2>
        <div v-if="loading" class="text-center py-8 text-gray-400 animate-pulse">加载中...</div>
        <div v-else-if="latestHobbies.length === 0" class="text-center py-8 text-gray-400">暂无数据</div>
        <div v-else class="space-y-3">
          <div
            v-for="hobby in latestHobbies"
            :key="hobby.id"
            class="p-4 rounded-xl border border-transparent hover:border-purple-100 hover:bg-purple-50 dark:hover:bg-slate-700/50 dark:hover:border-slate-600 transition-colors"
          >
            <div class="font-semibold text-gray-800 dark:text-gray-200 truncate">{{ hobby.title }}</div>
            <div class="text-xs text-gray-400 mt-2 flex items-center gap-2">
              <span class="px-2 py-0.5 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300">{{ hobby.type }}</span>
              <span>· {{ hobby.status }}</span>
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
