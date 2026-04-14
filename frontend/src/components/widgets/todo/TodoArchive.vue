<template>
  <div v-if="todos.length > 0" class="mt-4 pt-4 border-t border-slate-100 dark:border-white/5">
    <button 
      @click="show = !show"
      class="w-full flex items-center justify-between text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors uppercase tracking-wider"
    >
      <span>已归档任务 ({{ todos.length }})</span>
      <svg class="w-4 h-4 transition-transform duration-300" :class="{ 'rotate-180': show }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
      </svg>
    </button>

    <transition name="fade">
      <div v-if="show" class="mt-4 space-y-5">
        <div v-for="group in groups" :key="group.id" class="space-y-2.5">
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
                @click="emit('toggle-status', todo)"
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
                @click="emit('remove', todo.id)"
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
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import dayjs from 'dayjs'
import type { Todo } from '@/api/types'

const props = defineProps<{
  todos: Todo[]
}>()

const emit = defineEmits(['toggle-status', 'remove'])

const show = ref(false)

const groups = computed(() => {
  const arr = [
    { id: 'recent', label: '最近（7天内）', items: [] as Todo[] },
    { id: 'week', label: '一周前', items: [] as Todo[] },
    { id: 'month', label: '一个月前', items: [] as Todo[] },
  ]
  
  const now = dayjs()
  
  // Sort archived todos by target date (most recent first)
  const sorted = [...props.todos].sort((a, b) => {
    const dateA = dayjs(a.completed_at || a.created_at)
    const dateB = dayjs(b.completed_at || b.created_at)
    return dateB.isAfter(dateA) ? 1 : -1
  })

  sorted.forEach(todo => {
    const date = dayjs(todo.completed_at || todo.created_at)
    const diffDays = now.diff(date, 'day')
    
    if (diffDays <= 7) {
      arr[0].items.push(todo)
    } else if (diffDays <= 30) {
      arr[1].items.push(todo)
    } else {
      arr[2].items.push(todo)
    }
  })
  
  return arr.filter(g => g.items.length > 0)
})

const getPriorityColor = (priority: string) => {
  if (priority === 'high') return 'border-l-4 border-l-red-500'
  if (priority === 'medium') return 'border-l-4 border-l-amber-400'
  if (priority === 'low') return 'border-l-4 border-l-blue-400'
  return 'border-l-4 border-l-slate-300'
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
