<template>
  <div 
    class="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 p-3 sm:p-3.5 rounded-2xl border transition-all duration-300 group/item relative overflow-hidden shadow-sm cursor-default"
    :class="[
      getPriorityColor(todo.priority),
      todo.status === 'completed' ? 'bg-emerald-500/5 border-emerald-500/10 opacity-75' : 
      todo.status === 'failed' ? 'bg-red-500/5 border-red-500/10 opacity-75' : 
      'bg-white dark:bg-slate-800/60 border-slate-100 dark:border-white/5 hover:border-primary/20 hover:bg-white dark:hover:bg-slate-700/50'
    ]"
  >
    <!-- Priority Color Bar (Interactive) -->
    <div 
      @click="handleCyclePriority"
      class="absolute left-0 top-0 bottom-0 w-1.5 cursor-pointer hover:w-2.5 transition-all group/prio z-10"
      :title="'点击切换优先级: ' + todo.priority"
    >
      <div class="h-full w-full opacity-0 group-hover/prio:opacity-20 bg-slate-400"></div>
    </div>

    <!-- Component Row 1: Checkbox + Name -->
    <div class="flex items-center gap-3 w-full sm:flex-1 min-w-0">
      <button 
        @click="handleToggleStatus"
        class="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center transition-colors shadow-sm"
        :class="{
          'bg-primary border-2 border-primary text-white': todo.status === 'completed',
          'bg-red-100 dark:bg-red-900/50 border-2 border-red-400 text-red-500': todo.status === 'failed',
          'border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-primary': todo.status === 'pending'
        }"
      >
        <svg v-if="todo.status === 'completed'" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
        </svg>
        <svg v-else-if="todo.status === 'failed'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
      
      <div class="flex-1 min-w-0 flex flex-col justify-center">
        <template v-if="!isEditing">
          <span 
            @dblclick="startEditing"
            class="text-sm font-medium transition-all truncate block cursor-text select-none"
            :class="{ 
              'text-slate-700 dark:text-slate-200': todo.status === 'pending',
              'text-slate-400 line-through decoration-slate-400': todo.status === 'completed',
              'text-red-700 dark:text-red-400 line-through decoration-red-400/50': todo.status === 'failed'
            }"
          >
            <span class="flex items-center gap-1.5">
              <svg v-if="todo.is_private" class="w-3.5 h-3.5 text-amber-500 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"></path></svg>
              {{ todo.text }}
            </span>
          </span>
          <div class="flex items-center gap-2 mt-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
            <span class="text-[9px] text-slate-400 dark:text-slate-500 whitespace-nowrap">
              创建: {{ formatDateSimple(todo.created_at) }}
            </span>
            <span v-if="todo.updated_at && todo.updated_at !== todo.created_at" class="text-[9px] text-slate-400 dark:text-slate-500 whitespace-nowrap">
              更新: {{ formatDateSimple(todo.updated_at) }}
            </span>
          </div>
        </template>
        <div v-else class="py-1 flex items-center gap-2">
           <input 
            v-model="tempText"
            @keyup.enter="saveEdit"
            @keyup.esc="cancelEdit"
            type="text"
            class="flex-1 min-w-0 bg-white dark:bg-slate-800 border border-primary/30 dark:border-primary/20 rounded-lg px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-primary shadow-sm"
            autofocus
          />
          <select 
            v-model="tempPriority"
            class="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg text-xs outline-none cursor-pointer text-slate-600 dark:text-slate-300 w-24"
          >
            <option value="high">🔴 紧急</option>
            <option value="medium">🟡 普通</option>
            <option value="low">🔵 轻松</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Component Row 2: Dates + Actions -->
    <div class="flex items-center gap-2 w-full sm:w-auto mt-1 sm:mt-0 pl-9 sm:pl-0 sm:ml-auto">
      <!-- Dates Display/Edit -->
      <div class="flex-1 sm:flex-initial min-w-0">
         <template v-if="!isEditing">
           <div @dblclick="startEditing" v-if="todo.start_date || todo.due_date" class="text-[10px] sm:text-[11px] tracking-wide flex items-center gap-1 cursor-pointer whitespace-nowrap" :class="getDateClass(todo)">
              <svg class="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z"></path></svg>
              <span class="truncate">{{ formatDateRange(todo.start_date, todo.due_date) }}</span>
              <span v-if="todo.status === 'failed'" class="ml-1 text-red-500 font-bold">(已失效)</span>
           </div>
         </template>
         <div v-else class="flex items-center gap-1">
            <input v-model="tempStartDate" type="date" class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-lg px-1 py-0.5 text-[10px] outline-none [color-scheme:dark] w-20 sm:w-24" />
            <span class="text-slate-400">-</span>
            <input v-model="tempDueDate" type="date" class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-lg px-1 py-0.5 text-[10px] outline-none [color-scheme:dark] w-20 sm:w-24" />
         </div>
      </div>

      <!-- Recurrence & Actions -->
      <div class="flex items-center gap-0.5 sm:gap-1">
        <!-- Recurrence -->
        <button 
          @click="handleCycleRecurrence"
          class="flex-shrink-0 p-1.5 transition-all rounded-lg"
          :class="[
            todo.recurrence && todo.recurrence !== 'none' 
              ? 'text-primary dark:text-primary-light bg-primary/5' 
              : 'text-slate-400 opacity-0 group-hover/item:opacity-100 hover:text-primary hover:bg-primary/10'
          ]"
          :title="'循环周期: ' + recurrenceLabel(todo.recurrence || 'none') + ' (点击切换)'"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
        </button>
        
        <div class="flex items-center sm:opacity-0 group-hover/item:opacity-100 transition-opacity gap-0.5 sm:gap-1">
          <!-- Edit Actions -->
          <template v-if="isEditing">
            <button @click="saveEdit" class="p-1.5 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-all" title="保存">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            </button>
            <button @click="cancelEdit" class="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all" title="取消">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </template>

          <!-- Regular Actions -->
          <template v-else>
            <button v-if="todo.status === 'pending'" @click="startEditing" class="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all" title="编辑内部">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
            </button>

            <div v-if="todo.status === 'pending'" class="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden p-0.5">
              <button @click="emit('postpone', 1)" class="px-1.5 py-1 text-[9px] font-black text-slate-500 hover:text-primary hover:bg-white dark:hover:bg-slate-700 rounded-md transition-all">1D</button>
              <button @click="emit('postpone', 3)" class="px-1.5 py-1 text-[9px] font-black text-slate-500 hover:text-primary hover:bg-white dark:hover:bg-slate-700 rounded-md transition-all border-l border-slate-200 dark:border-white/5">3D</button>
              <button @click="emit('postpone', 7)" class="px-1.5 py-1 text-[9px] font-black text-slate-500 hover:text-primary hover:bg-white dark:hover:bg-slate-700 rounded-md transition-all border-l border-slate-200 dark:border-white/5">1W</button>
            </div>

            <!-- Retry for failed -->
            <button v-if="todo.status === 'failed'" @click="emit('retry')" class="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all" title="重试任务">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            </button>

            <!-- Mark as failed for pending -->
            <button v-if="todo.status === 'pending'" @click="emit('fail')" class="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="标记为失败">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>

            <button @click="emit('remove')" class="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all" title="删除任务">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import dayjs from 'dayjs'
import type { Todo } from '@/api/types'

const props = defineProps<{
  todo: Todo
  isEditing: boolean
}>()

const emit = defineEmits(['toggle-status', 'cycle-priority', 'cycle-recurrence', 'postpone', 'fail', 'retry', 'remove', 'start-edit', 'cancel-edit', 'save-edit'])

const tempText = ref(props.todo.text)
const tempPriority = ref(props.todo.priority || 'medium')
const tempStartDate = ref(props.todo.start_date || '')
const tempDueDate = ref(props.todo.due_date || '')

// Sync internal state if updated externally (like via priority bar click)
watch(() => props.todo.priority, (newPrio) => {
  if (props.isEditing) {
    tempPriority.value = newPrio || 'medium'
  }
})

const startEditing = () => {
  tempText.value = props.todo.text
  tempPriority.value = props.todo.priority || 'medium'
  tempStartDate.value = props.todo.start_date || ''
  tempDueDate.value = props.todo.due_date || ''
  emit('start-edit', props.todo.id)
}

const cancelEdit = () => {
  emit('cancel-edit')
}

const saveEdit = () => {
  if (!tempText.value.trim()) return
  emit('save-edit', {
    text: tempText.value.trim(),
    priority: tempPriority.value,
    start_date: tempStartDate.value || null,
    due_date: tempDueDate.value || null
  })
}

const handleToggleStatus = () => emit('toggle-status')
const handleCyclePriority = () => emit('cycle-priority')
const handleCycleRecurrence = () => emit('cycle-recurrence')

const recurrenceLabel = (r: string) => {
  if (r === 'none') return '不重复'
  if (r === 'daily') return '每日'
  if (r === 'weekly') return '每周'
  if (r === 'monthly') return '每月'
  return r
}

const getPriorityColor = (priority: string) => {
  if (priority === 'high') return 'border-l-4 border-l-red-500'
  if (priority === 'medium') return 'border-l-4 border-l-amber-400'
  if (priority === 'low') return 'border-l-4 border-l-blue-400'
  return 'border-l-4 border-l-slate-300'
}

const formatDueDate = (dateStr: string) => {
  const diffDays = dayjs(dateStr).startOf('day').diff(dayjs().startOf('day'), 'day')
  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '明天'
  if (diffDays === -1) return '昨天'
  return dayjs(dateStr).format('MM-DD')
}

const formatDateRange = (start?: string | null, end?: string | null) => {
  if (!start && !end) return ''
  if (start && end) {
    if (start === end) return formatDueDate(end)
    return `${formatDueDate(start)} 至 ${formatDueDate(end)}`
  }
  if (end) return formatDueDate(end)
  return `${formatDueDate(start!)} 起`
}

const getDateClass = (todo: any) => {
  if (todo.status === 'completed') return 'text-slate-400 dark:text-slate-500'
  if (todo.status === 'failed') return 'text-red-500 font-semibold'
  if (!todo.due_date) return 'text-slate-500 dark:text-slate-400'
  
  const diffDays = dayjs(todo.due_date).startOf('day').diff(dayjs().startOf('day'), 'day')
  if (diffDays < 0) return 'text-red-500 font-semibold'
  if (diffDays === 0) return 'text-orange-500 font-semibold'
  if (diffDays === 1) return 'text-amber-500'
  return 'text-slate-500 dark:text-slate-400'
}

const formatDateSimple = (date: string) => dayjs(date).format('MM-DD HH:mm')
</script>
