<template>
  <div class="w-full px-4 sm:px-6 lg:px-8 py-8">
    <!-- Announcement Bar -->
    <AnnouncementBar />

    <!-- Hero Banner -->
    <div class="reveal relative overflow-hidden rounded-[2rem] mb-12 bg-gradient-to-br from-primary via-secondary to-slate-800 dark:from-primary/40 dark:via-secondary/40 dark:to-slate-950 border border-white/20 dark:border-white/10 shadow-xl p-10 sm:p-14 md:p-16 text-center sm:text-left shadow-primary/20" style="--delay: 100ms">
      <div class="relative z-10">
        <h1 class="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 text-white drop-shadow-md tracking-tight">
          欢迎来到 <span class="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/60">Kirakirastar's Blog</span>
        </h1>
        <p class="text-white/80 dark:text-white/60 text-lg sm:text-xl md:text-2xl max-w-3xl font-medium tracking-wide">
          记录代码灵感、个人沉淀与浩瀚的爱好宇宙。
        </p>
      </div>
    <!-- Quick Nav & Search Hub -->
    <DashboardNav />

    <!-- Stats -->
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-12">
      <!-- Notes Stat -->
      <router-link to="/notes" class="reveal group bg-white/70 dark:bg-slate-800/80 backdrop-blur-md rounded-[2.5rem] p-7 border border-white/60 dark:border-slate-700/60 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300" style="--delay: 200ms">
        <div class="flex flex-col h-full">
          <div class="w-12 h-12 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
          </div>
          <Skeleton v-if="loading" width="60px" height="40px" custom-class="mb-2" />
          <div v-else class="text-4xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">{{ stats.notes_count }}</div>
          <div class="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest flex items-center justify-between">
            <span>学习笔记</span>
            <div class="flex gap-1 ml-2">
              <div v-for="i in 7" :key="i" class="w-1 h-1 rounded-full" :class="i <= (gadgetStore.checkin.streak % 7 || (gadgetStore.checkin.streak > 0 ? 7 : 0)) ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-700'"></div>
            </div>
          </div>
        </div>
      </router-link>

      <!-- Journals Stat -->
      <router-link to="/journals" class="reveal group bg-white/70 dark:bg-slate-800/80 backdrop-blur-md rounded-[2.5rem] p-7 border border-white/60 dark:border-slate-700/60 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300" style="--delay: 300ms">
        <div class="flex flex-col h-full">
          <div class="w-12 h-12 rounded-2xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
          </div>
          <Skeleton v-if="loading" width="60px" height="40px" custom-class="mb-2" />
          <div v-else class="text-4xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">{{ stats.journals_count }}</div>
          <div class="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest flex items-center justify-between">
            <span>个人日志</span>
            <div class="flex gap-1 ml-2">
              <div v-for="i in 7" :key="i" class="w-1 h-1 rounded-full" :class="i <= (gadgetStore.checkin.streak % 7 || (gadgetStore.checkin.streak > 0 ? 7 : 0)) ? 'bg-purple-500' : 'bg-slate-200 dark:bg-slate-700'"></div>
            </div>
          </div>
        </div>
      </router-link>

      <!-- Hobbies Stat -->
      <router-link to="/hobbies" class="reveal group bg-white/70 dark:bg-slate-800/80 backdrop-blur-md rounded-[2.5rem] p-7 border border-white/60 dark:border-slate-700/60 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300" style="--delay: 400ms">
        <div class="flex flex-col h-full">
          <div class="w-12 h-12 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>
          </div>
          <Skeleton v-if="loading" width="60px" height="40px" custom-class="mb-2" />
          <div v-else class="text-4xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">{{ stats.hobbies_count }}</div>
          <div class="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest flex items-center justify-between">
            <span>爱好条目</span>
            <div class="flex gap-1 ml-2">
              <div v-for="i in 7" :key="i" class="w-1 h-1 rounded-full" :class="i <= (gadgetStore.checkin.streak % 7 || (gadgetStore.checkin.streak > 0 ? 7 : 0)) ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-700'"></div>
            </div>
          </div>
        </div>
      </router-link>

      <!-- Todos Stat -->
      <div class="reveal group bg-white/70 dark:bg-slate-800/80 backdrop-blur-md rounded-[2.5rem] p-7 border border-white/60 dark:border-slate-700/60 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300" style="--delay: 500ms">
        <div class="flex flex-col h-full">
          <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
          </div>
          <Skeleton v-if="loading" width="50px" height="40px" custom-class="mb-2" />
          <div v-else class="flex items-baseline gap-2">
            <div class="text-4xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">{{ stats.completed_todos_today }}</div>
          </div>
          <div class="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mb-3">今日完成量</div>
          
          <div class="mt-auto flex gap-3">
            <div class="flex flex-col">
              <span class="text-[9px] text-slate-400 uppercase font-black">W: {{ loading ? '...' : stats.completed_todos_week }}</span>
            </div>
            <div class="w-px h-3 bg-slate-200 dark:bg-slate-700"></div>
            <div class="flex flex-col">
              <span class="text-[9px] text-slate-400 uppercase font-black">M: {{ loading ? '...' : stats.completed_todos_month }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Updates Stat -->
      <div class="reveal group bg-white/70 dark:bg-slate-800/80 backdrop-blur-md rounded-[2.5rem] p-7 border border-white/60 dark:border-slate-700/60 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 col-span-2 lg:col-span-1" style="--delay: 600ms">
        <div class="flex flex-col h-full">
          <div class="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          </div>
          <Skeleton v-if="loading" width="60px" height="40px" custom-class="mb-2" />
          <div v-else class="text-4xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">{{ stats.month_updates }}</div>
          <div class="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest flex items-center justify-between">
            <span>本月更新</span>
            <div class="flex gap-1 ml-2">
              <div v-for="i in 7" :key="i" class="w-1 h-1 rounded-full" :class="i <= (gadgetStore.checkin.streak % 7 || (gadgetStore.checkin.streak > 0 ? 7 : 0)) ? 'bg-amber-500' : 'bg-slate-200 dark:bg-slate-700'"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Personal Workspace Gadgets -->
    <div v-if="authStore.user" class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
      <TodoWidget class="reveal" style="--delay: 700ms" />
      <CheckinWidget class="reveal" style="--delay: 800ms" />
    </div>

    <!-- Latest Activity -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Latest Notes -->
      <div class="bg-white/70 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl shadow-md dark:shadow-none border border-white/60 dark:border-slate-700/60 p-6 flex flex-col">
        <h2 class="text-xl font-bold mb-5 text-slate-800 dark:text-white flex items-center space-x-2">
          <span class="w-1.5 h-6 rounded bg-primary block"></span>
          <span>近期笔记</span>
        </h2>
        
        <div v-if="loading" class="space-y-3">
          <Skeleton v-for="i in 3" :key="i" height="64px" />
        </div>
        <div v-else-if="latestNotes.length === 0">
          <EmptyState title="未发现笔记" message="开始记录您的第一个灵感吧。" />
        </div>
        <div v-else class="space-y-3">
          <router-link
            v-for="note in latestNotes"
            :key="note.id"
            :to="`/notes/${note.id}`"
            class="block p-4 rounded-xl border border-transparent hover:border-primary/20 hover:bg-primary/5 dark:hover:bg-primary/10 transition-all duration-300 group"
          >
            <div class="font-semibold text-slate-800 dark:text-slate-100 truncate group-hover:text-primary transition-colors">{{ note.title }}</div>
            <div class="text-xs text-slate-400 dark:text-slate-400 mt-2">{{ formatShortDate(note.created_at) }}</div>
          </router-link>
        </div>
      </div>

      <!-- Latest Journals -->
      <div class="bg-white/70 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl shadow-md dark:shadow-none border border-white/60 dark:border-slate-700/60 p-6 flex flex-col">
        <h2 class="text-xl font-bold mb-5 text-slate-800 dark:text-white flex items-center space-x-2">
          <span class="w-1.5 h-6 rounded bg-secondary block"></span>
          <span>最新日志</span>
        </h2>
        <div v-if="loading" class="space-y-3">
          <Skeleton v-for="i in 3" :key="i" height="64px" />
        </div>
        <div v-else-if="latestJournals.length === 0">
          <EmptyState title="虚位以待" message="最近还没有写日志，给自己留些思考时间吧。" />
        </div>
        <div v-else class="space-y-3">
          <router-link
            v-for="journal in latestJournals"
            :key="journal.id"
            :to="`/journals/${journal.id}`"
            class="block p-4 rounded-xl border border-transparent hover:border-secondary/20 hover:bg-secondary/5 dark:hover:bg-secondary/10 transition-all duration-300 group"
          >
            <div class="font-semibold text-slate-800 dark:text-slate-100 truncate group-hover:text-secondary transition-colors">{{ journal.title }}</div>
            <div class="text-xs text-slate-400 dark:text-slate-400 mt-2">{{ formatShortDate(journal.created_at) }}</div>
          </router-link>
        </div>
      </div>

      <!-- Latest Hobbies -->
      <div class="bg-white/70 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl shadow-md dark:shadow-none border border-white/60 dark:border-slate-700/60 p-6 flex flex-col">
        <h2 class="text-xl font-bold mb-5 text-slate-800 dark:text-white flex items-center space-x-2">
          <span class="w-1.5 h-6 rounded bg-primary-light block"></span>
          <span>爱好追踪</span>
        </h2>
        <div v-if="loading" class="space-y-3">
          <Skeleton v-for="i in 3" :key="i" height="64px" />
        </div>
        <div v-else-if="latestHobbies.length === 0">
          <EmptyState title="空空如也" message="追踪您的兴趣爱好，让生活更充实。" />
        </div>
        <div v-else class="space-y-3">
          <router-link
            v-for="hobby in latestHobbies"
            :key="hobby.id"
            to="/hobbies"
            class="block p-4 rounded-xl border border-transparent hover:border-primary/20 hover:bg-primary/5 dark:hover:bg-primary/10 transition-all duration-300 group"
          >
            <div class="font-semibold text-slate-800 dark:text-slate-100 truncate group-hover:text-primary transition-colors">{{ hobby.title }}</div>
            <div class="text-xs text-gray-400 mt-2 flex items-center gap-2">
              <span class="px-2 py-0.5 rounded-full bg-primary/10 text-primary dark:text-primary-light">{{ hobby.type }}</span>
              <span>· {{ hobby.status }}</span>
            </div>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { dashboardApi } from '@/api/dashboard'
import { useAuthStore } from '@/stores/auth'
import { useGadgetStore } from '@/stores/gadgets'
import { formatShortDate } from '@/utils/format'
import AnnouncementBar from '@/components/widgets/AnnouncementBar.vue'
import TodoWidget from '@/components/widgets/TodoWidget.vue'
import CheckinWidget from '@/components/widgets/CheckinWidget.vue'
import DashboardNav from '@/components/widgets/DashboardNav.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import EmptyState from '@/components/ui/EmptyState.vue'

const authStore = useAuthStore()
const gadgetStore = useGadgetStore()
const loading = ref(true)
const stats = ref({
  notes_count: 0,
  journals_count: 0,
  hobbies_count: 0,
  completed_todos_today: 0,
  completed_todos_week: 0,
  completed_todos_month: 0,
  month_updates: 0,
})
const latestNotes = ref<any[]>([])
const latestJournals = ref<any[]>([])
const latestHobbies = ref<any[]>([])

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

// Watch authStore to initialize gadgets correctly when auth state is resolved
watch(
  () => authStore.initialized,
  (initialized) => {
    if (initialized) {
      gadgetStore.initGadgets()
    }
  },
  { immediate: true }
)

// Also watch for user changes (like login/logout) after initialized
watch(
  () => authStore.user,
  () => {
    if (authStore.initialized) {
      gadgetStore.initGadgets()
    }
  }
)
</script>

<style scoped>
.reveal {
  opacity: 0;
  transform: translateY(20px);
  animation: reveal-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  animation-delay: var(--delay, 0ms);
}

@keyframes reveal-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
