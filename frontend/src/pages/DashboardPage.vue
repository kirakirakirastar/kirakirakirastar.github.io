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
    </div>
    
    <!-- Hero Banner -->


    <!-- Stats -->
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-12">
      <div 
        @click="toggleCategory('notes')"
        class="reveal group bg-white/70 dark:bg-slate-800/80 backdrop-blur-md rounded-[2.5rem] p-7 border transition-all duration-500 cursor-pointer relative overflow-hidden active:scale-[0.98]" 
        :class="activeHeatmapCategory === 'notes' ? 'border-indigo-500/50 shadow-[0_20px_50px_rgba(99,102,241,0.2)] ring-2 ring-indigo-500/20 -translate-y-2' : 'border-white/60 dark:border-slate-700/60 shadow-sm hover:shadow-[0_20px_40px_rgba(99,102,241,0.15)] hover:border-indigo-500/30 hover:-translate-y-2'"
        style="--delay: 200ms"
      >
        <div class="flex flex-col h-full">
          <router-link to="/notes" title="查看所有笔记" class="w-12 h-12 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-5 hover:scale-110 active:scale-95 transition-transform duration-300 cursor-pointer">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
          </router-link>
          <div class="flex items-center justify-between mb-2">
            <Skeleton v-if="loading" width="60px" height="40px" />
            <div v-else class="text-4xl font-black text-slate-800 dark:text-white tracking-tight">{{ stats.notes_count }}</div>
          </div>
          <div class="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">
            <span>学习笔记</span>
          </div>
          <div class="absolute bottom-5 right-7 opacity-40 group-hover:opacity-100 transition-opacity">
             <MiniHeatmap v-if="!loading" :activities="activities" category="notes" color="#6366f1" />
          </div>
        </div>
      </div>

      <div 
        @click="toggleCategory('journals')"
        class="reveal group bg-white/70 dark:bg-slate-800/80 backdrop-blur-md rounded-[2.5rem] p-7 border transition-all duration-500 cursor-pointer relative overflow-hidden active:scale-[0.98]" 
        :class="activeHeatmapCategory === 'journals' ? 'border-purple-500/50 shadow-[0_20px_50px_rgba(168,85,247,0.2)] ring-2 ring-purple-500/20 -translate-y-2' : 'border-white/60 dark:border-slate-700/60 shadow-sm hover:shadow-[0_20px_40px_rgba(168,85,247,0.15)] hover:border-purple-500/30 hover:-translate-y-2'"
        style="--delay: 300ms"
      >
        <div class="flex flex-col h-full">
          <router-link to="/journals" title="查看所有日志" class="w-12 h-12 rounded-2xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-5 hover:scale-110 active:scale-95 transition-transform duration-300 cursor-pointer">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
          </router-link>
          <div class="flex items-center justify-between mb-2">
            <Skeleton v-if="loading" width="60px" height="40px" />
            <div v-else class="text-4xl font-black text-slate-800 dark:text-white tracking-tight">{{ stats.journals_count }}</div>
          </div>
          <div class="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">
            <span>个人日志</span>
          </div>
          <div class="absolute bottom-5 right-7 opacity-40 group-hover:opacity-100 transition-opacity">
             <MiniHeatmap v-if="!loading" :activities="activities" category="journals" color="#a855f7" />
          </div>
        </div>
      </div>

      <div 
        @click="toggleCategory('hobbies')"
        class="reveal group bg-white/70 dark:bg-slate-800/80 backdrop-blur-md rounded-[2.5rem] p-7 border transition-all duration-500 cursor-pointer relative overflow-hidden active:scale-[0.98]" 
        :class="activeHeatmapCategory === 'hobbies' ? 'border-blue-500/50 shadow-[0_20px_50px_rgba(59,130,246,0.2)] ring-2 ring-blue-500/20 -translate-y-2' : 'border-white/60 dark:border-slate-700/60 shadow-sm hover:shadow-[0_20px_40px_rgba(59,130,246,0.15)] hover:border-blue-500/30 hover:-translate-y-2'"
        style="--delay: 400ms"
      >
        <div class="flex flex-col h-full">
          <router-link to="/hobbies" title="查看所有条目" class="w-12 h-12 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-5 hover:scale-110 active:scale-95 transition-transform duration-300 cursor-pointer">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>
          </router-link>
          <div class="flex items-center justify-between mb-2">
            <Skeleton v-if="loading" width="60px" height="40px" />
            <div v-else class="text-4xl font-black text-slate-800 dark:text-white tracking-tight">{{ stats.hobbies_count }}</div>
          </div>
          <div class="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">
            <span>爱好条目</span>
          </div>
          <div class="absolute bottom-5 right-7 opacity-40 group-hover:opacity-100 transition-opacity">
             <MiniHeatmap v-if="!loading" :activities="activities" category="hobbies" color="#3b82f6" />
          </div>
        </div>
      </div>

      <!-- Todos Stat -->
      <div 
        @click="toggleCategory('todos')"
        class="reveal group bg-white/70 dark:bg-slate-800/80 backdrop-blur-md rounded-[2.5rem] p-7 border transition-all duration-500 cursor-pointer relative overflow-hidden active:scale-[0.98]" 
        :class="activeHeatmapCategory === 'todos' ? 'border-emerald-500/50 shadow-[0_20px_50px_rgba(16,185,129,0.2)] ring-2 ring-emerald-500/20 -translate-y-2' : 'border-white/60 dark:border-slate-700/60 shadow-sm hover:shadow-[0_20px_40px_rgba(16,185,129,0.15)] hover:border-emerald-500/30 hover:-translate-y-2'"
        style="--delay: 500ms"
      >
        <div class="flex flex-col h-full">
          <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
          </div>
          <Skeleton v-if="loading" width="50px" height="40px" custom-class="mb-2" />
          <div v-else class="flex items-baseline gap-2">
            <div class="text-4xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">{{ completedTodosToday }}</div>
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
          <div class="absolute bottom-5 right-7 opacity-40 group-hover:opacity-100 transition-opacity">
             <MiniHeatmap v-if="!loading" :activities="activities" category="todos" color="#10b981" />
          </div>
        </div>
      </div>

      <!-- Master Perspective Stat (All Categories) -->
      <div 
        @click="activeHeatmapCategory = 'all'; selectedDate = null; isHeatmapExpanded = !isHeatmapExpanded"
        class="reveal group bg-white/70 dark:bg-slate-800/80 backdrop-blur-md rounded-[2.5rem] p-7 border transition-all duration-500 cursor-pointer relative overflow-hidden active:scale-[0.98]" 
        :class="[
          isHeatmapExpanded ? 'col-span-2 md:col-span-3 lg:col-span-5' : '',
          activeHeatmapCategory === 'all' ? 'border-amber-500 shadow-[0_20px_60px_rgba(245,158,11,0.25)] ring-2 ring-amber-500/30 -translate-y-2' : 'border-white/60 dark:border-slate-700/60 shadow-sm hover:shadow-[0_20px_40px_rgba(245,158,11,0.15)] hover:border-amber-500/30 hover:-translate-y-2'
        ]"
        style="--delay: 550ms"
      >
        <div class="flex flex-col h-full">
          <div class="flex items-start justify-between mb-5">
            <div class="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
            
            <div v-if="!isHeatmapExpanded" class="p-2 rounded-xl bg-amber-500/5 text-amber-500/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>
            </div>
            <div v-else class="p-2 rounded-xl bg-amber-500/20 text-amber-600">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </div>
          </div>

          <div class="flex items-center justify-between mb-2">
            <div>
              <Skeleton v-if="loading" width="60px" height="40px" />
              <div v-else class="text-4xl font-black text-slate-800 dark:text-white tracking-tight">{{ stats.month_updates }}</div>
              <div class="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-1">
                <span>全域概览</span>
              </div>
            </div>
          </div>

          <!-- Heatmap Content: Only mounts when expanded for better initial stability -->
          <div 
            v-if="isHeatmapExpanded"
            class="mt-10 transition-all duration-500 ease-in-out opacity-100 scale-100"
            @click.stop
          >
            <ActivityHeatmap 
              :activities="activities" 
              :active-category="activeHeatmapCategory" 
              :selected-date="selectedDate"
              :today-checked-in="!gadgetStore.canCheckin()"
              @day-click="selectedDate = $event"
            />
          </div>
        </div>

        <!-- Mini Preview (hidden when expanded) -->
        <div v-if="!isHeatmapExpanded" class="absolute bottom-5 right-7 opacity-20 group-hover:opacity-60 transition-opacity pointer-events-none">
          <MiniHeatmap :activities="activities" category="total" color="#f59e0b" :weeks="5" />
        </div>
        
        <!-- Ornamental Background -->
        <div class="absolute -right-4 -bottom-4 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-colors pointer-events-none"></div>
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
        <h2 class="text-xl font-bold mb-5 text-slate-800 dark:text-white flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <span class="w-1.5 h-6 rounded bg-primary block"></span>
            <span>近期笔记</span>
          </div>
          <div v-if="selectedDate" class="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded-lg">仅看 {{ formatShortDate(selectedDate) }}</div>
        </h2>
        
        <div v-if="loading" class="space-y-3">
          <Skeleton v-for="i in 3" :key="i" height="64px" />
        </div>
        <div v-else-if="latestNotes.length === 0">
          <EmptyState title="笔耕不辍" message="记录瞬时的灵感与深度思考。" />
        </div>
        <div v-else class="space-y-3">
          <router-link
            v-for="note in filteredNotes"
            :key="note.id"
            :to="`/notes/${note.id}`"
            class="block p-4 rounded-xl border border-transparent hover:border-primary/20 hover:bg-primary/5 dark:hover:bg-primary/10 transition-all duration-300 group"
          >
            <div class="font-semibold text-slate-800 dark:text-slate-100 truncate group-hover:text-primary transition-colors flex items-center gap-2">
              <svg v-if="note.is_private" class="w-3.5 h-3.5 text-amber-500 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"></path></svg>
              {{ note.title }}
            </div>
            <div class="text-xs text-slate-400 dark:text-slate-400 mt-2 flex flex-wrap gap-x-3 gap-y-1">
              <span>{{ formatShortDate(note.created_at) }}</span>
              <span v-if="note.updated_at && note.updated_at !== note.created_at" class="opacity-60">更于 {{ formatShortDate(note.updated_at) }}</span>
            </div>
          </router-link>
          <div v-if="filteredNotes.length === 0" class="text-center py-8 text-slate-400 text-xs italic">该日期暂无笔记</div>
        </div>
      </div>

      <!-- Latest Journals -->
      <div class="bg-white/70 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl shadow-md dark:shadow-none border border-white/60 dark:border-slate-700/60 p-6 flex flex-col">
        <h2 class="text-xl font-bold mb-5 text-slate-800 dark:text-white flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <span class="w-1.5 h-6 rounded bg-secondary block"></span>
            <span>最新日志</span>
          </div>
          <div v-if="selectedDate" class="text-[10px] bg-secondary/10 text-secondary px-2 py-1 rounded-lg">仅看 {{ formatShortDate(selectedDate) }}</div>
        </h2>
        <div v-if="loading" class="space-y-3">
          <Skeleton v-for="i in 3" :key="i" height="64px" />
        </div>
        <div v-else-if="latestJournals.length === 0">
          <EmptyState title="岁月留痕" message="捕捉当下的情绪，给未来留一份回忆。" />
        </div>
        <div v-else class="space-y-3">
          <router-link
            v-for="journal in filteredJournals"
            :key="journal.id"
            :to="`/journals/${journal.id}`"
            class="block p-4 rounded-xl border border-transparent hover:border-secondary/20 hover:bg-secondary/5 dark:hover:bg-secondary/10 transition-all duration-300 group"
          >
            <div class="font-semibold text-slate-800 dark:text-slate-100 truncate group-hover:text-secondary transition-colors flex items-center gap-2">
              <svg v-if="journal.is_private" class="w-3.5 h-3.5 text-amber-500 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"></path></svg>
              {{ journal.title }}
            </div>
            <div class="text-xs text-slate-400 dark:text-slate-400 mt-2 flex flex-wrap gap-x-3 gap-y-1">
              <span>{{ formatShortDate(journal.created_at) }}</span>
              <span v-if="journal.updated_at && journal.updated_at !== journal.created_at" class="opacity-60">修于 {{ formatShortDate(journal.updated_at) }}</span>
            </div>
          </router-link>
          <div v-if="filteredJournals.length === 0" class="text-center py-8 text-slate-400 text-xs italic">该日期暂无日志</div>
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
          <EmptyState title="趣享生活" message="标记你所热爱的，探索更广阔的兴趣宇宙。" />
        </div>
        <div v-else class="space-y-3">
          <router-link
            v-for="hobby in filteredHobbies"
            :key="hobby.id"
            :to="`/hobbies/${hobby.id}`"
            class="block p-4 rounded-xl border border-transparent hover:border-primary/20 hover:bg-primary/5 dark:hover:bg-primary/10 transition-all duration-300 group"
          >
            <div class="font-semibold text-slate-800 dark:text-slate-100 truncate group-hover:text-primary transition-colors flex items-center gap-2">
              <svg v-if="hobby.is_private" class="w-3.5 h-3.5 text-amber-500 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"></path></svg>
              {{ hobby.title }}
            </div>
            <div class="text-xs text-gray-400 mt-2 flex flex-col gap-1">
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded-full bg-primary/10 text-primary dark:text-primary-light">{{ typeLabel(hobby.type) }}</span>
                <span>· {{ statusLabel(hobby.status) }}</span>
              </div>
              <div class="flex flex-wrap gap-x-3 gap-y-1 opacity-80">
                <span>{{ formatShortDate(hobby.created_at) }}</span>
                <span v-if="hobby.updated_at && hobby.updated_at !== hobby.created_at">更于 {{ formatShortDate(hobby.updated_at) }}</span>
              </div>
            </div>
          </router-link>
          <div v-if="filteredHobbies.length === 0" class="text-center py-8 text-slate-400 text-xs italic">该日期暂无条目</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import dayjs from 'dayjs'
import { dashboardApi } from '@/api/dashboard'
import type { Todo } from '@/api/types'
import { useAuthStore } from '@/stores/auth'
import { useGadgetStore } from '@/stores/gadgets'
import { formatShortDate } from '@/utils/format'
import AnnouncementBar from '@/components/widgets/AnnouncementBar.vue'
import TodoWidget from '@/components/widgets/TodoWidget.vue'
import CheckinWidget from '@/components/widgets/CheckinWidget.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import ActivityHeatmap from '@/components/dashboard/ActivityHeatmap.vue'
import MiniHeatmap from '@/components/dashboard/MiniHeatmap.vue'

const authStore = useAuthStore()
const gadgetStore = useGadgetStore()
const loading = ref(true)
const activeHeatmapCategory = ref('all')
const selectedDate = ref<string | null>(null)
const isHeatmapExpanded = ref(false)

const toggleCategory = (cat: string) => {
  if (activeHeatmapCategory.value === cat) {
    activeHeatmapCategory.value = 'all'
    // Collapse heatmap if clicking the already-active category
    isHeatmapExpanded.value = false
  } else {
    activeHeatmapCategory.value = cat
    // Always expand heatmap when selecting a category so user can see the detail
    isHeatmapExpanded.value = true
    selectedDate.value = null
  }
}
const stats = ref({
  notes_count: 0,
  journals_count: 0,
  hobbies_count: 0,
  completed_todos_today: 0,
  completed_todos_week: 0,
  completed_todos_month: 0,
  month_updates: 0,
})

// Reactively compute today's completed count directly from the live store
// so the dashboard stat card updates the moment a todo is ticked.
const completedTodosToday = computed(() => {
  const todayStr = dayjs().format('YYYY-MM-DD')
  return gadgetStore.todos.filter((t: Todo) =>
    t.status === 'completed' &&
    t.completed_at &&
    dayjs(t.completed_at).format('YYYY-MM-DD') === todayStr
  ).length
})
const latestNotes = ref<any[]>([])
const latestJournals = ref<any[]>([])
const latestHobbies = ref<any[]>([])
const activities = ref<Record<string, any>>({})

const filteredNotes = computed(() => {
  if (!selectedDate.value) return latestNotes.value
  return latestNotes.value.filter(item => dayjs(item.created_at).format('YYYY-MM-DD') === selectedDate.value)
})

const filteredJournals = computed(() => {
  if (!selectedDate.value) return latestJournals.value
  return latestJournals.value.filter(item => dayjs(item.created_at).format('YYYY-MM-DD') === selectedDate.value)
})

const filteredHobbies = computed(() => {
  if (!selectedDate.value) return latestHobbies.value
  return latestHobbies.value.filter(item => dayjs(item.created_at).format('YYYY-MM-DD') === selectedDate.value)
})

const statusLabel = (status: string) => {
  const labels: Record<string, string> = {
    want: '想看',
    in_progress: '在看',
    completed: '已完成',
    paused: '搁置'
  }
  return labels[status] || status
}

const typeLabel = (type: string) => {
  const labels: Record<string, string> = {
    anime: '动漫',
    book: '书籍',
    game: '游戏'
  }
  return labels[type] || type
}

const loadDashboard = async () => {
  try {
    const [data, activityData] = await Promise.all([
      dashboardApi.get(),
      dashboardApi.activities ? dashboardApi.activities() : Promise.resolve({})
    ])
    stats.value = data.stats
    latestNotes.value = data.latest_notes
    latestJournals.value = data.latest_journals
    latestHobbies.value = data.latest_hobbies
    activities.value = activityData
  } catch (error) {
    console.error('加载 Dashboard 失败:', error)
  } finally {
    loading.value = false
  }
}

// Re-fetch heatmap activity data when todos change (e.g., after completing a task).
// Debounced to avoid hammering the API on rapid sequential updates.
let refreshActivityTimer: ReturnType<typeof setTimeout> | null = null
const refreshActivities = () => {
  if (refreshActivityTimer) clearTimeout(refreshActivityTimer)
  refreshActivityTimer = setTimeout(async () => {
    try {
      if (dashboardApi.activities) {
        activities.value = await dashboardApi.activities()
      }
      // Also refresh server-side stats (weekly/monthly counts)
      const data = await dashboardApi.get()
      stats.value = data.stats
    } catch (e) {
      console.error('刷新热力图数据失败:', e)
    }
  }, 800) // 800ms debounce
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

// Keep heatmap in sync: when todos change (complete/add/remove),
// refresh the activity map so the heatmap reflects the latest state.
watch(
  () => gadgetStore.todos.map((t: Todo) => `${t.id}:${t.status}:${t.completed_at}`).join('|'),
  (newVal, oldVal) => {
    // Only trigger when the user is logged in and data has actually changed
    if (authStore.user && newVal !== oldVal) {
      refreshActivities()
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
