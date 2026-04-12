<template>
  <div class="w-full px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up">
    <!-- Hero Banner -->
    <div class="relative overflow-hidden rounded-[2rem] mb-12 bg-gradient-to-br from-primary via-secondary to-slate-800 dark:from-primary/40 dark:via-secondary/40 dark:to-slate-950 border border-white/20 dark:border-white/10 shadow-xl p-10 sm:p-14 md:p-16 text-center sm:text-left">
      <div class="relative z-10">
        <h1 class="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 text-white drop-shadow-md tracking-tight">
          欢迎来到 <span class="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/60">Kirakirastar's Blog</span>
        </h1>
        <p class="text-white/80 dark:text-white/60 text-lg sm:text-xl md:text-2xl max-w-3xl font-medium tracking-wide">
          记录代码灵感、个人沉淀与浩瀚的爱好宇宙。
        </p>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 mb-12">
      <div class="group relative bg-white/60 dark:bg-theme-card-dark/50 backdrop-blur-sm rounded-3xl p-6 border border-white/40 dark:border-white/10 hover:shadow-lg hover:-translate-y-1 transition-[transform,box-shadow] duration-300 overflow-hidden">
        <div class="flex flex-col">
          <div class="p-2 mb-3 w-fit rounded-xl bg-primary/10 text-primary">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
          </div>
          <div class="text-3xl font-black text-slate-800 dark:text-white mb-1">{{ stats.notes_count }}</div>
          <div class="text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">代码笔记</div>
        </div>
      </div>

      <div class="group relative bg-white/60 dark:bg-theme-card-dark/50 backdrop-blur-sm rounded-3xl p-6 border border-white/40 dark:border-white/10 hover:shadow-lg hover:-translate-y-1 transition-[transform,box-shadow] duration-300 overflow-hidden">
        <div class="flex flex-col">
          <div class="p-2 mb-3 w-fit rounded-xl bg-secondary/10 text-secondary">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
          </div>
          <div class="text-3xl font-black text-slate-800 dark:text-white mb-1">{{ stats.journals_count }}</div>
          <div class="text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">个人日志</div>
        </div>
      </div>

      <div class="group relative bg-white/60 dark:bg-theme-card-dark/50 backdrop-blur-sm rounded-3xl p-6 border border-white/40 dark:border-white/10 hover:shadow-lg hover:-translate-y-1 transition-[transform,box-shadow] duration-300 overflow-hidden">
        <div class="flex flex-col">
          <div class="p-2 mb-3 w-fit rounded-xl bg-primary-light/10 text-primary-light">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>
          </div>
          <div class="text-3xl font-black text-slate-800 dark:text-white mb-1">{{ stats.hobbies_count }}</div>
          <div class="text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">爱好条目</div>
        </div>
      </div>

      <div class="group relative bg-white/60 dark:bg-theme-card-dark/50 backdrop-blur-sm rounded-3xl p-6 border border-white/40 dark:border-white/10 hover:shadow-lg hover:-translate-y-1 transition-[transform,box-shadow] duration-300 overflow-hidden">
        <div class="flex flex-col">
          <div class="p-2 mb-3 w-fit rounded-xl bg-secondary-light/10 text-secondary-light">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <div class="text-3xl font-black text-slate-800 dark:text-white mb-1">{{ stats.completed_hobbies }}</div>
          <div class="text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">已完成</div>
        </div>
      </div>

      <div class="group relative bg-white/60 dark:bg-theme-card-dark/50 backdrop-blur-sm rounded-3xl p-6 border border-white/40 dark:border-white/10 hover:shadow-lg hover:-translate-y-1 transition-[transform,box-shadow] duration-300 overflow-hidden col-span-2 lg:col-span-1">
        <div class="flex flex-col">
          <div class="p-2 mb-3 w-fit rounded-xl bg-primary/10 text-primary">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          </div>
          <div class="text-3xl font-black text-slate-800 dark:text-white mb-1">{{ stats.month_updates }}</div>
          <div class="text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">本月更新</div>
        </div>
      </div>
    </div>

    <!-- Latest Activity -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Latest Notes -->
      <div class="bg-white/60 dark:bg-theme-card-dark/50 backdrop-blur-sm rounded-3xl shadow-md dark:shadow-none border border-white/40 dark:border-white/5 p-6 flex flex-col">
        <h2 class="text-xl font-bold mb-5 flex items-center space-x-2">
          <span class="w-1.5 h-6 rounded bg-primary block"></span>
          <span>近期笔记</span>
        </h2>
        <div v-if="loading" class="text-center py-8 text-gray-400 animate-pulse">加载中...</div>
        <div v-else-if="latestNotes.length === 0" class="text-center py-8 text-gray-400">暂无数据</div>
        <div v-else class="space-y-3">
          <router-link
            v-for="note in latestNotes"
            :key="note.id"
            :to="`/notes/${note.id}`"
            class="block p-4 rounded-xl border border-transparent hover:border-primary/20 hover:bg-primary/5 dark:hover:bg-primary/10 transition-all duration-300 group"
          >
            <div class="font-semibold text-gray-800 dark:text-gray-200 truncate group-hover:text-primary transition-colors">{{ note.title }}</div>
            <div class="text-xs text-gray-400 mt-2">{{ formatDate(note.created_at) }}</div>
          </router-link>
        </div>
      </div>

      <!-- Latest Journals -->
      <div class="bg-white/60 dark:bg-theme-card-dark/50 backdrop-blur-sm rounded-3xl shadow-md dark:shadow-none border border-white/40 dark:border-white/5 p-6 flex flex-col">
        <h2 class="text-xl font-bold mb-5 flex items-center space-x-2">
          <span class="w-1.5 h-6 rounded bg-secondary block"></span>
          <span>最新日志</span>
        </h2>
        <div v-if="loading" class="text-center py-8 text-gray-400 animate-pulse">加载中...</div>
        <div v-else-if="latestJournals.length === 0" class="text-center py-8 text-gray-400">暂无数据</div>
        <div v-else class="space-y-3">
          <router-link
            v-for="journal in latestJournals"
            :key="journal.id"
            :to="`/journals/${journal.id}`"
            class="block p-4 rounded-xl border border-transparent hover:border-secondary/20 hover:bg-secondary/5 dark:hover:bg-secondary/10 transition-all duration-300 group"
          >
            <div class="font-semibold text-gray-800 dark:text-gray-200 truncate group-hover:text-secondary transition-colors">{{ journal.title }}</div>
            <div class="text-xs text-gray-400 mt-2">{{ formatDate(journal.created_at) }}</div>
          </router-link>
        </div>
      </div>

      <!-- Latest Hobbies -->
      <div class="bg-white/60 dark:bg-theme-card-dark/50 backdrop-blur-sm rounded-3xl shadow-md dark:shadow-none border border-white/40 dark:border-white/5 p-6 flex flex-col">
        <h2 class="text-xl font-bold mb-5 flex items-center space-x-2">
          <span class="w-1.5 h-6 rounded bg-primary-light block"></span>
          <span>爱好追踪</span>
        </h2>
        <div v-if="loading" class="text-center py-8 text-gray-400 animate-pulse">加载中...</div>
        <div v-else-if="latestHobbies.length === 0" class="text-center py-8 text-gray-400">暂无数据</div>
        <div v-else class="space-y-3">
          <div
            v-for="hobby in latestHobbies"
            :key="hobby.id"
            class="p-4 rounded-xl border border-transparent hover:border-primary/20 hover:bg-primary/5 dark:hover:bg-primary/10 transition-all duration-300 group"
          >
            <div class="font-semibold text-gray-800 dark:text-gray-200 truncate group-hover:text-primary transition-colors">{{ hobby.title }}</div>
            <div class="text-xs text-gray-400 mt-2 flex items-center gap-2">
              <span class="px-2 py-0.5 rounded-full bg-primary/10 text-primary dark:text-primary-light">{{ hobby.type }}</span>
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
