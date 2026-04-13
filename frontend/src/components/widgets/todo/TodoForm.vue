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
        <button 
          @click="toggleRecurrence"
          type="button"
          class="px-2.5 py-1.5 border rounded-xl text-[10px] font-bold flex items-center gap-1.5 transition-all outline-none"
          :class="recurrence !== 'none' 
            ? 'bg-primary/10 border-primary/20 text-primary' 
            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'"
          :title="'重复周期: ' + recurrenceLabel(recurrence)"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          <span>{{ recurrenceLabel(recurrence) }}</span>
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

const emit = defineEmits(['add'])

const text = ref('')
const priority = ref('medium')
const todayStr = dayjs().format('YYYY-MM-DD')
const startDate = ref(todayStr)
const dueDate = ref(todayStr)
const recurrence = ref('none')

const recurrenceOptions = ['none', 'daily', 'weekly', 'monthly']
const toggleRecurrence = () => {
  const currentIndex = recurrenceOptions.indexOf(recurrence.value)
  recurrence.value = recurrenceOptions[(currentIndex + 1) % recurrenceOptions.length]
}

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
    recurrence: recurrence.value
  })
  
  // Reset
  text.value = ''
  priority.value = 'medium'
  startDate.value = todayStr
  dueDate.value = todayStr
  recurrence.value = 'none'
}
</script>
