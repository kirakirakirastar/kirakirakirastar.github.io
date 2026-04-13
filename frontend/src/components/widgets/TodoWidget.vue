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

          <!-- Recurrence -->
          <button 
            @click="toggleNewRecurrence"
            class="px-2.5 py-1.5 border rounded-xl text-[10px] font-bold flex items-center gap-1.5 transition-all outline-none"
            :class="newTodoRecurrence !== 'none' 
              ? 'bg-primary/10 border-primary/20 text-primary' 
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'"
            :title="'重复周期: ' + recurrenceLabel(newTodoRecurrence)"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            <span>{{ recurrenceLabel(newTodoRecurrence) }}</span>
          </button>
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
      <div v-else-if="activeTodos.length === 0" class="text-center py-10 text-slate-400 dark:text-slate-500">
        <div class="mb-2">☕️</div>
        <p class="text-sm">主列表无任务，休息一下吧</p>
      </div>
      <transition-group v-else name="list-complete" tag="div" class="space-y-3">
        <div 
          v-for="todo in activeTodos" 
          :key="todo.id"
          class="flex items-center gap-3 p-3.5 rounded-2xl bg-white/50 dark:bg-slate-700/30 border-y border-r border-transparent hover:border-primary/20 hover:bg-white dark:hover:bg-slate-700/50 transition-all duration-300 group/item relative overflow-hidden shadow-sm cursor-default"
          :class="[getPriorityColor(todo.priority), { 'opacity-60': todo.status === 'completed', 'opacity-80 bg-red-50/50 dark:bg-red-900/10': todo.status === 'failed' }]"
        >
          <!-- Priority Color Bar (Interactive) -->
          <div 
            @click="cyclePriority(todo)"
            class="absolute left-0 top-0 bottom-0 w-1.5 cursor-pointer hover:w-2.5 transition-all group/prio"
            :title="'点击切换优先级: ' + todo.priority"
          >
            <div class="h-full w-full opacity-0 group-hover/prio:opacity-20 bg-slate-400"></div>
          </div>
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
            <!-- Normal Mode: Text & Dates -->
            <template v-if="editingTodoId !== todo.id">
              <span 
                @dblclick="startEditing(todo)"
                class="text-sm font-medium transition-all truncate block cursor-text select-none"
                :class="{ 
                  'text-slate-700 dark:text-slate-200': todo.status === 'pending',
                  'text-slate-400 line-through decoration-slate-400': todo.status === 'completed',
                  'text-red-700 dark:text-red-400 line-through decoration-red-400/50': todo.status === 'failed'
                }"
              >
                {{ todo.text }}
              </span>
              <div @dblclick="startEditing(todo)" v-if="todo.start_date || todo.due_date" class="text-[11px] mt-0.5 tracking-wide flex items-center gap-1 cursor-pointer" :class="getDateClass(todo)">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                {{ formatDateRange(todo.start_date, todo.due_date) }}
                <span v-if="todo.status === 'failed'" class="ml-1 text-red-500 font-bold">(已失效)</span>
              </div>
            </template>

            <!-- Edit Mode: Inputs -->
            <div v-else class="space-y-2 py-1">
              <input 
                v-model="tempTodoText"
                @keyup.enter="saveEditing(todo)"
                @keyup.esc="cancelEditing"
                type="text"
                class="w-full bg-white dark:bg-slate-800 border border-primary/30 dark:border-primary/20 rounded-lg px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-primary shadow-sm"
                autofocus
              />
              <div class="flex items-center gap-1">
                <input 
                  v-model="tempTodoStartDate"
                  type="date"
                  class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-lg px-1.5 py-0.5 text-[10px] outline-none [color-scheme:dark]"
                />
                <span class="text-slate-400">-</span>
                <input 
                  v-model="tempTodoDueDate"
                  type="date"
                  class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-lg px-1.5 py-0.5 text-[10px] outline-none [color-scheme:dark]"
                />
              </div>
            </div>
          </div>

          <!-- Recurrence indicator in list (Interactive) -->
          <button 
            v-if="todo.recurrence && todo.recurrence !== 'none'" 
            @click="cycleRecurrence(todo)"
            class="flex-shrink-0 p-1.5 text-primary/40 dark:text-primary/30 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
            :title="'循环任务: ' + recurrenceLabel(todo.recurrence) + ' (点击切换)'"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
          </button>
          <!-- If none, show a subtle button on hover to enable -->
          <button 
            v-else
            @click="cycleRecurrence(todo)"
            class="flex-shrink-0 p-1.5 text-slate-300 dark:text-slate-600 opacity-0 group-hover/item:opacity-100 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
            title="设置循环"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
          </button>
          
          <div class="flex items-center opacity-0 group-hover/item:opacity-100 transition-opacity ml-1">
            <!-- Edit Actions (Save/Cancel) -->
            <template v-if="editingTodoId === todo.id">
              <button 
                @click="saveEditing(todo)"
                class="p-1.5 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-all"
                title="保存"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </button>
              <button 
                @click="cancelEditing"
                class="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                title="取消"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </template>

            <!-- Regular Actions -->
            <template v-else>
              <!-- Edit Toggle -->
              <button 
                v-if="todo.status === 'pending'"
                @click="startEditing(todo)"
                class="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                title="编辑内容"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
              </button>

              <!-- Postpone Group -->
              <div v-if="todo.status === 'pending'" class="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg mr-1 overflow-hidden p-0.5">
                <button 
                  @click="gadgetStore.postponeTodo(todo.id, 1)"
                  class="px-1.5 py-1 text-[9px] font-black text-slate-500 hover:text-primary hover:bg-white dark:hover:bg-slate-700 rounded-md transition-all"
                  title="推迟1天"
                >+1D</button>
                <button 
                  @click="gadgetStore.postponeTodo(todo.id, 3)"
                  class="px-1.5 py-1 text-[9px] font-black text-slate-500 hover:text-primary hover:bg-white dark:hover:bg-slate-700 rounded-md transition-all border-l border-slate-200 dark:border-white/5"
                  title="推迟3天"
                >+3D</button>
                <button 
                  @click="gadgetStore.postponeTodo(todo.id, 7)"
                  class="px-1.5 py-1 text-[9px] font-black text-slate-500 hover:text-primary hover:bg-white dark:hover:bg-slate-700 rounded-md transition-all border-l border-slate-200 dark:border-white/5"
                  title="推迟1周"
                >+1W</button>
              </div>

              <!-- Manual Fail -->
              <button 
                v-if="todo.status === 'pending'"
                @click="gadgetStore.failTodo(todo.id)"
                class="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                title="标记为失败"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>

              <!-- Delete -->
              <button 
                @click="gadgetStore.removeTodo(todo.id)"
                class="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                title="删除任务"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </template>
          </div>
        </div>
      </transition-group>

      <!-- Archive Section -->
      <div v-if="archivedTodos.length > 0" class="mt-4 pt-4 border-t border-slate-100 dark:border-white/5">
        <button 
          @click="showArchive = !showArchive"
          class="w-full flex items-center justify-between text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors uppercase tracking-wider"
        >
          <span>已归档任务 ({{ archivedTodos.length }})</span>
          <svg class="w-4 h-4 transition-transform duration-300" :class="{ 'rotate-180': showArchive }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>

        <transition name="fade">
          <div v-if="showArchive" class="mt-4 space-y-5">
            <div v-for="group in archivedGroups" :key="group.id" class="space-y-2.5">
              <!-- Group Header -->
              <div class="text-[10px] font-black text-slate-400/80 dark:text-slate-500/80 uppercase tracking-widest flex items-center gap-2 px-1">
                <span class="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                {{ group.label }}
              </div>
              
              <!-- Group Items -->
              <div class="space-y-2">
                <div 
                  v-for="todo in group.items" 
                  :key="todo.id"
                  class="flex items-center gap-3 p-3 rounded-xl bg-slate-50/50 dark:bg-slate-900/20 border-y border-r border-transparent opacity-60 grayscale hover:grayscale-0 transition-all duration-300 group/archived relative overflow-hidden"
                  :class="getPriorityColor(todo.priority)"
                >
                  <button 
                    @click="toggleStatus(todo)"
                    class="flex-shrink-0 w-5 h-5 rounded flex items-center justify-center transition-colors shadow-sm"
                    :class="{
                      'bg-primary/20 text-primary': todo.status === 'completed',
                      'bg-red-100 dark:bg-red-900/30 text-red-500': todo.status === 'failed'
                    }"
                  >
                    <svg v-if="todo.status === 'completed'" class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                    </svg>
                    <svg v-else class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                  <div class="flex-1 min-w-0 flex flex-col">
                    <span class="text-xs font-medium text-slate-500 line-through decoration-slate-400 truncate">{{ todo.text }}</span>
                    <span v-if="todo.completed_at" class="text-[9px] text-slate-400 mt-0.5">{{ dayjs(todo.completed_at).format('MM-DD HH:mm') }} 已过</span>
                  </div>
                  <button 
                    @click="gadgetStore.removeTodo(todo.id)"
                    class="opacity-0 group-hover/archived:opacity-100 p-1 text-slate-300 hover:text-red-500 transition-opacity"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import dayjs from 'dayjs'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import { useGadgetStore } from '@/stores/gadgets'

dayjs.extend(isSameOrAfter)

const gadgetStore = useGadgetStore()
const newTodoText = ref('')
const newTodoPriority = ref('medium')
const todayStr = dayjs().format('YYYY-MM-DD')
const newTodoStartDate = ref(todayStr)
const newTodoDueDate = ref(todayStr)
const newTodoRecurrence = ref('none')
const showArchive = ref(false)

// Editing State
const editingTodoId = ref<string | null>(null)
const tempTodoText = ref('')
const tempTodoStartDate = ref('')
const tempTodoDueDate = ref('')

const startEditing = (todo: any) => {
  editingTodoId.value = todo.id
  tempTodoText.value = todo.text
  tempTodoStartDate.value = todo.start_date || ''
  tempTodoDueDate.value = todo.due_date || ''
}

const cancelEditing = () => {
  editingTodoId.value = null
}

const saveEditing = async (todo: any) => {
  if (!tempTodoText.value.trim()) return
  await gadgetStore.updateTodo(todo.id, {
    text: tempTodoText.value.trim(),
    start_date: tempTodoStartDate.value || null,
    due_date: tempTodoDueDate.value || null
  })
  editingTodoId.value = null
}

const activeTodos = computed(() => {
  return gadgetStore.todos.filter(t => {
    // Archived if completed or failed
    if (t.status === 'completed' || t.status === 'failed') return false
    
    // Delayed visibility check
    if (t.start_date) {
      const today = dayjs().startOf('day')
      const start = dayjs(t.start_date).startOf('day')
      return today.isSameOrAfter(start)
    }
    
    return true
  })
})

const archivedTodos = computed(() => {
  return gadgetStore.todos.filter(t => t.status === 'completed' || t.status === 'failed')
})

const archivedGroups = computed(() => {
  const groups = [
    { id: 'recent', label: '最近（7天内）', items: [] as any[] },
    { id: 'week', label: '一周前', items: [] as any[] },
    { id: 'month', label: '一个月前', items: [] as any[] },
  ]
  
  const now = dayjs()
  
  // Sort archived todos by target date (most recent first)
  const sorted = [...archivedTodos.value].sort((a, b) => {
    const dateA = dayjs(a.completed_at || a.created_at)
    const dateB = dayjs(b.completed_at || b.created_at)
    return dateB.isAfter(dateA) ? 1 : -1
  })

  sorted.forEach(todo => {
    const date = dayjs(todo.completed_at || todo.created_at)
    const diffDays = now.diff(date, 'day')
    
    if (diffDays <= 7) {
      groups[0].items.push(todo)
    } else if (diffDays <= 30) {
      groups[1].items.push(todo)
    } else {
      groups[2].items.push(todo)
    }
  })
  
  return groups.filter(g => g.items.length > 0)
})

const recurrenceOptions = ['none', 'daily', 'weekly', 'monthly']
const toggleNewRecurrence = () => {
  const currentIndex = recurrenceOptions.indexOf(newTodoRecurrence.value)
  newTodoRecurrence.value = recurrenceOptions[(currentIndex + 1) % recurrenceOptions.length]
}

const cyclePriority = (todo: any) => {
  const priorities = ['high', 'medium', 'low']
  const currentIndex = priorities.indexOf(todo.priority)
  const nextPriority = priorities[(currentIndex + 1) % priorities.length]
  gadgetStore.updateTodo(todo.id, { priority: nextPriority })
}

const cycleRecurrence = (todo: any) => {
  const currentIndex = recurrenceOptions.indexOf(todo.recurrence || 'none')
  const nextRecurrence = recurrenceOptions[(currentIndex + 1) % recurrenceOptions.length]
  gadgetStore.updateTodo(todo.id, { recurrence: nextRecurrence })
}

const recurrenceLabel = (r: string) => {
  if (r === 'none') return '不重复'
  if (r === 'daily') return '每日'
  if (r === 'weekly') return '每周'
  if (r === 'monthly') return '每月'
  return r
}

const handleAdd = async () => {
  if (!newTodoText.value.trim()) return
  await gadgetStore.addTodo(newTodoText.value, {
    priority: newTodoPriority.value,
    start_date: newTodoStartDate.value || null,
    due_date: newTodoDueDate.value || null,
    recurrence: newTodoRecurrence.value
  })
  newTodoText.value = ''
  newTodoPriority.value = 'medium'
  newTodoStartDate.value = ''
  newTodoDueDate.value = ''
  newTodoRecurrence.value = 'none'
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
