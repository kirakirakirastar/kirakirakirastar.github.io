<template>
  <div class="bg-white/70 dark:bg-slate-800/80 backdrop-blur-md rounded-3xl shadow-md border border-white/60 dark:border-slate-700/60 p-6 flex flex-col h-full group">
    <div class="flex justify-between items-center mb-5">
      <h2 class="text-xl font-bold text-slate-800 dark:text-white flex items-center space-x-2">
        <span class="w-1.5 h-6 rounded bg-primary block"></span>
        <span>待办清单</span>
      </h2>
      <span class="text-xs font-semibold px-2 py-1 rounded-lg bg-primary/10 text-primary dark:text-primary-light">
        {{ gadgetStore.todos.filter(t => t.status === 'pending').length }} 待办
      </span>
    </div>

    <!-- Add Input Form -->
    <div class="flex flex-col gap-3 mb-6 bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-2xl border border-slate-100 dark:border-white/5 transition-all shadow-sm focus-within:ring-2 focus-within:ring-primary/30">
      <input 
        v-model="newTodoText"
        @keyup.enter="handleAdd"
        type="text"
        placeholder="准备做些什么？"
        class="w-full bg-transparent border-none focus:ring-0 outline-none text-slate-700 dark:text-slate-200 placeholder-slate-400 font-medium"
      />
      <div class="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/60 dark:border-white/10 pt-3 mt-1">
        <div class="flex flex-wrap items-center gap-2">
          <!-- Priority -->
          <select 
            v-model="newTodoPriority"
            class="px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-xs outline-none cursor-pointer text-slate-600 dark:text-slate-300 transition-colors focus:border-primary"
          >
            <option value="high">🔴 紧急</option>
            <option value="medium">🟡 普通</option>
            <option value="low">🔵 轻松</option>
          </select>
          
          <!-- Dates -->
          <div class="flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-2 py-1 text-slate-600 dark:text-slate-300">
            <input type="date" v-model="newTodoStartDate" class="bg-transparent text-xs outline-none w-[105px] dark:[color-scheme:dark]" />
            <span class="text-slate-400 text-xs">-</span>
            <input type="date" v-model="newTodoDueDate" class="bg-transparent text-xs outline-none w-[105px] dark:[color-scheme:dark]" />
          </div>
        </div>
        
        <button 
          @click="handleAdd"
          class="flex-shrink-0 flex items-center justify-center h-8 px-4 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark active:scale-95 transition-all hover:shadow-md"
        >
          添加日程
        </button>
      </div>
    </div>

    <!-- List -->
    <div class="flex-1 overflow-y-auto space-y-3 custom-scrollbar max-h-[300px] pr-1">
      <div v-if="gadgetStore.loading" class="flex justify-center py-8">
        <div class="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
      <div v-else-if="gadgetStore.todos.length === 0" class="text-center py-10 text-slate-400 dark:text-slate-500">
        <div class="mb-2">☕️</div>
        <p class="text-sm">暂无任务，放松一下吧</p>
      </div>
      <transition-group v-else name="list-complete" tag="div" class="space-y-3">
        <div 
          v-for="todo in gadgetStore.todos" 
          :key="todo.id"
          class="flex items-center gap-3 p-3.5 rounded-2xl bg-white/50 dark:bg-slate-700/30 border-y border-r border-transparent hover:border-primary/20 hover:bg-white dark:hover:bg-slate-700/50 transition-all duration-300 group/item relative overflow-hidden"
          :class="[getPriorityColor(todo.priority), { 'opacity-60': todo.status === 'completed', 'opacity-80 bg-red-50/50 dark:bg-red-900/10': todo.status === 'failed' }]"
        >
          <button 
            @click="toggleStatus(todo)"
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
            <span 
              class="text-sm font-medium transition-all truncate block"
              :class="{ 
                'text-slate-700 dark:text-slate-200': todo.status === 'pending',
                'text-slate-400 line-through decoration-slate-400': todo.status === 'completed',
                'text-red-700 dark:text-red-400 line-through decoration-red-400/50': todo.status === 'failed'
              }"
            >
              {{ todo.text }}
            </span>
            <div v-if="todo.start_date || todo.due_date" class="text-[11px] mt-0.5 tracking-wide flex items-center gap-1" :class="getDateClass(todo)">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              {{ formatDateRange(todo.start_date, todo.due_date) }}
              <span v-if="todo.status === 'failed'" class="ml-1 text-red-500 font-bold">(已失效)</span>
            </div>
          </div>

          <button 
            @click="gadgetStore.removeTodo(todo.id)"
            class="opacity-0 group-hover/item:opacity-100 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          </button>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import dayjs from 'dayjs'
import { useGadgetStore } from '@/stores/gadgets'

const gadgetStore = useGadgetStore()
const newTodoText = ref('')
const newTodoPriority = ref('medium')
const newTodoStartDate = ref('')
const newTodoDueDate = ref('')

const handleAdd = async () => {
  if (!newTodoText.value.trim()) return
  await gadgetStore.addTodo(newTodoText.value, {
    priority: newTodoPriority.value,
    start_date: newTodoStartDate.value || null,
    due_date: newTodoDueDate.value || null
  })
  newTodoText.value = ''
  newTodoPriority.value = 'medium'
  newTodoStartDate.value = ''
  newTodoDueDate.value = ''
}

const toggleStatus = (todo: any) => {
  if (todo.status === 'pending') {
    gadgetStore.updateTodoStatus(todo.id, 'completed')
  } else {
    // Allows toggling back from completed or failed to pending
    gadgetStore.updateTodoStatus(todo.id, 'pending')
  }
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
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0,0,0,0.1);
  border-radius: 10px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.1);
}

.list-complete-enter-from,
.list-complete-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
.list-complete-leave-active {
  position: absolute;
}
</style>
