<template>
  <div class="flex flex-col gap-3 mb-6 bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-2xl border border-slate-100 dark:border-white/5 transition-all shadow-sm focus-within:ring-2 focus-within:ring-primary/30">
    <input 
      v-model="text"
      @keyup.enter="handleSubmit"
      type="text"
      placeholder="准备做些什么？"
      class="w-full bg-transparent border-none focus:ring-0 outline-none text-slate-700 dark:text-slate-200 placeholder-slate-400 font-medium"
    />
    <div class="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/60 dark:border-white/10 pt-3 mt-1">
      <div class="flex flex-wrap items-center gap-2">
        <!-- Priority -->
        <select 
          v-model="priority"
          class="px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-xs outline-none cursor-pointer text-slate-600 dark:text-slate-300 transition-colors focus:border-primary"
        >
          <option value="high">🔴 紧急</option>
          <option value="medium">🟡 普通</option>
          <option value="low">🔵 轻松</option>
        </select>
        
        <!-- Dates -->
        <div class="flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-2 py-1 text-slate-600 dark:text-slate-300">
          <input type="date" v-model="startDate" class="bg-transparent text-xs outline-none w-[105px] dark:[color-scheme:dark]" />
          <span class="text-slate-400 text-xs">-</span>
          <input type="date" v-model="dueDate" class="bg-transparent text-xs outline-none w-[105px] dark:[color-scheme:dark]" />
        </div>

        <!-- Recurrence -->
        <!-- Integrated Recurrence Button & Popover -->
        <div class="relative" ref="containerRef">
          <button 
            @click="showRecurrenceMenu = !showRecurrenceMenu"
            type="button"
            class="px-2.5 py-1.5 border rounded-xl text-[10px] font-bold flex items-center gap-1.5 transition-all outline-none"
            :class="recurrence !== 'none' 
              ? 'bg-primary/10 border-primary/20 text-primary' 
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'"
            :title="'重复设置: ' + recurrenceLabel(recurrence)"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            <span>{{ recurrenceLabel(recurrence) }}</span>
            <span v-if="recurrenceUntil" class="ml-1 text-[8px] opacity-70">至 {{ formatDateHeader(recurrenceUntil) }}</span>
          </button>

          <!-- Recurrence Popover -->
          <div 
            v-if="showRecurrenceMenu" 
            class="absolute bottom-full mb-2 left-0 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl z-50 p-3 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200"
          >
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-700 dark:text-slate-300">循环设置</span>
              <button @click="showRecurrenceMenu = false" class="text-slate-400 hover:text-slate-600">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <!-- Frequency Selection -->
            <div class="grid grid-cols-4 gap-1.5">
              <button 
                v-for="opt in recurrenceOptions" 
                :key="opt"
                @click="recurrence = opt"
                class="px-1 py-1.5 rounded-lg text-[10px] font-medium border transition-all"
                :class="recurrence === opt ? 'bg-primary text-white border-primary shadow-sm' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-white/5 text-slate-500 hover:border-primary/30'"
              >
                {{ recurrenceLabel(opt) }}
              </button>
            </div>

            <!-- End Condition -->
            <div v-if="recurrence !== 'none'" class="flex flex-col gap-2 pt-2 border-t border-slate-100 dark:border-white/5">
               <div class="flex items-center justify-between">
                  <span class="text-[10px] font-bold text-slate-500">系列截止于</span>
                  <button 
                    v-if="dueDate"
                    @click="recurrenceUntil = dueDate"
                    class="text-[9px] text-primary hover:underline"
                  >
                    同步任务截止日
                  </button>
               </div>
               <div class="flex items-center gap-2">
                 <input 
                   type="date" 
                   v-model="recurrenceUntil" 
                   class="flex-1 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-white/10 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-primary dark:[color-scheme:dark]"
                 />
                 <button 
                   v-if="recurrenceUntil"
                   @click="recurrenceUntil = null"
                   class="p-1 px-2 text-[10px] text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                 >
                   清除
                 </button>
               </div>
               <!-- Start Date for Back-filling -->
               <div v-if="recurrence !== 'none'" class="flex flex-col gap-2 pt-2 border-t border-slate-100 dark:border-white/5">
                 <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">习惯起始于 (补录)</span>
                 <input 
                   type="date" 
                   v-model="seriesStart" 
                   class="bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-white/10 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-primary dark:[color-scheme:dark]"
                 />
                 <p class="text-[8px] text-slate-400">设置过去的日期以追溯之前的习惯统计</p>
               </div>

               <p class="text-[9px] text-slate-400 italic">若留空，则循环一直进行到 {{ dueDate || '任务截止' }}（即该任务的最终寿命）。</p>
            </div>
          </div>
        </div>

        <!-- Privacy Toggle -->
        <button 
          @click="isPrivate = !isPrivate"
          type="button"
          class="px-2.5 py-1.5 border rounded-xl text-[10px] font-bold flex items-center gap-1.5 transition-all outline-none"
          :class="isPrivate 
            ? 'bg-amber-500/10 border-amber-500/20 text-amber-600' 
            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'"
          title="私密任务：仅登录后可见"
        >
          <svg v-if="isPrivate" class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"></path></svg>
          <svg v-else class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"></path></svg>
          <span>{{ isPrivate ? '私密' : '公开' }}</span>
        </button>
      </div>
      
      <button 
        @click="handleSubmit"
        class="flex-shrink-0 flex items-center justify-center h-8 px-4 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark active:scale-95 transition-all hover:shadow-md"
      >
        添加日程
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import dayjs from 'dayjs'
import { onClickOutside } from '@vueuse/core'

const emit = defineEmits(['add'])

const text = ref('')
const priority = ref('medium')
const todayStr = dayjs().format('YYYY-MM-DD')
const startDate = ref(todayStr)
const dueDate = ref(todayStr)
const recurrence = ref('none')
const recurrenceUntil = ref<string | null>(null)
const seriesStart = ref<string | null>(null)
const isPrivate = ref(false)
const showRecurrenceMenu = ref(false)

const formatDateHeader = (d: string) => dayjs(d).format('MM-DD')

const recurrenceOptions = ['none', 'daily', 'weekly', 'monthly']

// Auto-close menu on outside click
const containerRef = ref(null)
// @ts-ignore
onClickOutside(containerRef, () => showRecurrenceMenu.value = false)

const recurrenceLabel = (r: string) => {
  if (r === 'none') return '不重复'
  if (r === 'daily') return '每日'
  if (r === 'weekly') return '每周'
  if (r === 'monthly') return '每月'
  return r
}

const handleSubmit = () => {
  if (!text.value.trim()) return
  emit('add', {
    text: text.value.trim(),
    priority: priority.value,
    start_date: startDate.value || null,
    due_date: dueDate.value || null,
    recurrence: recurrence.value,
    recurrence_until: recurrenceUntil.value || null,
    series_started_at: seriesStart.value || null,
    is_private: isPrivate.value
  })
  
  // Reset
  text.value = ''
  priority.value = 'medium'
  startDate.value = dayjs().format('YYYY-MM-DD')
  dueDate.value = dayjs().format('YYYY-MM-DD')
  recurrence.value = 'none'
  recurrenceUntil.value = null
  seriesStart.value = null
  isPrivate.value = false
  showRecurrenceMenu.value = false
}
</script>
