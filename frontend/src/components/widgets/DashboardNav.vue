<template>
  <div class="relative z-30 mb-8">
    <div class="flex flex-col md:flex-row gap-4 items-center">
      <!-- Quick Navigation Links -->
      <nav class="flex items-center gap-2 p-1.5 bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/40 dark:border-slate-700/40 rounded-2xl shadow-sm">
        <router-link 
          v-for="link in quickLinks" 
          :key="link.path"
          :to="link.path"
          class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 hover:bg-white/60 dark:hover:bg-slate-700/60"
          :class="$route.path === link.path ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-slate-600 dark:text-slate-300'"
        >
          <div v-html="link.icon" class="w-4 h-4"></div>
          <span class="hidden sm:inline">{{ link.name }}</span>
        </router-link>
      </nav>

      <!-- Advanced Search Hub -->
      <div class="flex-1 w-full relative">
        <div class="relative group">
          <input
            v-model="query"
            type="text"
            placeholder="搜索笔记、日志或爱好... (输入 / 聚焦)"
            ref="searchInput"
            class="w-full pl-12 pr-4 py-3.5 bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/40 dark:border-slate-700/40 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary/40 outline-none transition-all duration-300 text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
          />
          <div class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
            <svg v-if="!searching" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <div v-else class="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          </div>
        </div>

        <!-- Search Results Dropdown -->
        <transition name="fade-slide">
          <div v-if="results.length > 0 && query" class="absolute top-full left-0 right-0 mt-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-2xl border border-white/50 dark:border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
            <div class="p-2 space-y-1">
              <router-link
                v-for="res in results"
                :key="res.id"
                :to="res.url"
                @click="query = ''"
                class="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors group"
              >
                <div class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors" :class="getTypeColor(res.type)">
                  <div v-html="getTypeIcon(res.type)" class="w-5 h-5"></div>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-primary transition-colors">{{ res.title }}</div>
                  <div class="text-[10px] uppercase font-black tracking-widest text-slate-400">{{ res.type }} • {{ formatDate(res.date) }}</div>
                </div>
                <div class="text-slate-300 dark:text-slate-600">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                </div>
              </router-link>
            </div>
            <div class="p-3 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100/50 dark:border-slate-700/50 text-center">
              <span class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">找到 {{ results.length }} 条结果</span>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useSearch } from '@/hooks/useSearch'
import dayjs from 'dayjs'

const { query, results, searching } = useSearch()
const searchInput = ref<HTMLInputElement | null>(null)

const quickLinks = [
  { 
    name: '笔记', 
    path: '/notes', 
    icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>'
  },
  { 
    name: '日志', 
    path: '/journals', 
    icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>'
  },
  { 
    name: '爱好', 
    path: '/hobbies', 
    icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>'
  }
]

const getTypeIcon = (type: string) => {
  switch(type) {
    case 'note': return quickLinks[0].icon
    case 'journal': return quickLinks[1].icon
    case 'hobby': return quickLinks[2].icon
    default: return null
  }
}

const getTypeColor = (type: string) => {
  switch(type) {
    case 'note': return 'bg-indigo-500/10 text-indigo-500'
    case 'journal': return 'bg-purple-500/10 text-purple-500'
    case 'hobby': return 'bg-rose-500/10 text-rose-500'
    default: return 'bg-slate-500/10 text-slate-500'
  }
}

const formatDate = (date?: string) => {
  if (!date) return 'N/A'
  return dayjs(date).format('YYYY-MM-DD')
}

// Hotkey support
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === '/' && document.activeElement !== searchInput.value) {
    e.preventDefault()
    searchInput.value?.focus()
  }
}

onMounted(() => window.addEventListener('keydown', handleKeyDown))
onUnmounted(() => window.removeEventListener('keydown', handleKeyDown))
</script>

<style scoped>
.fade-slide-enter-active, .fade-slide-leave-active {
  transition: all 0.3s ease-out;
}
.fade-slide-enter-from, .fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
