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
    <TodoForm @add="handleAdd" />

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
        <TodoItem 
          v-for="todo in activeTodos" 
          :key="todo.id"
          :todo="todo"
          :is-editing="editingTodoId === todo.id"
          @toggle-status="toggleStatus(todo)"
          @cycle-priority="cyclePriority(todo)"
          @cycle-recurrence="cycleRecurrence(todo)"
          @postpone="(days) => gadgetStore.postponeTodo(todo.id, days)"
          @fail="gadgetStore.failTodo(todo.id)"
          @remove="gadgetStore.removeTodo(todo.id)"
          @start-edit="(id) => editingTodoId = id"
          @cancel-edit="editingTodoId = null"
          @save-edit="(updates) => handleSaveEdit(todo.id, updates)"
        />
      </transition-group>

      <!-- Archive Section -->
      <TodoArchive 
        :todos="archivedTodos"
        @toggle-status="toggleStatus"
        @remove="(id) => gadgetStore.removeTodo(id)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import dayjs from 'dayjs'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import { useGadgetStore } from '@/stores/gadgets'
import { useUiStore } from '@/stores/ui'
import TodoForm from './todo/TodoForm.vue'
import TodoItem from './todo/TodoItem.vue'
import TodoArchive from './todo/TodoArchive.vue'

dayjs.extend(isSameOrAfter)

const gadgetStore = useGadgetStore()
const uiStore = useUiStore()
const editingTodoId = ref<string | null>(null)

const activeTodos = computed(() => {
  return gadgetStore.todos.filter(t => {
    if (t.status === 'completed' || t.status === 'failed') return false
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

const handleAdd = async (payload: any) => {
  await gadgetStore.addTodo(payload.text, payload)
  uiStore.addToast('已添加新任务', 'success')
}

const handleSaveEdit = async (id: string, updates: any) => {
  await gadgetStore.updateTodo(id, updates)
  editingTodoId.value = null
  uiStore.addToast('任务已保存', 'success')
}

const toggleStatus = (todo: any) => {
  if (todo.status === 'pending') {
    gadgetStore.updateTodoStatus(todo.id, 'completed')
  } else {
    gadgetStore.updateTodoStatus(todo.id, 'pending')
  }
}

const cyclePriority = (todo: any) => {
  const priorities = ['high', 'medium', 'low']
  const currentIndex = priorities.indexOf(todo.priority)
  const nextPriority = priorities[(currentIndex + 1) % priorities.length]
  gadgetStore.updateTodo(todo.id, { priority: nextPriority })
}

const cycleRecurrence = (todo: any) => {
  const options = ['none', 'daily', 'weekly', 'monthly']
  const currentIndex = options.indexOf(todo.recurrence || 'none')
  const nextRecurrence = options[(currentIndex + 1) % options.length]
  gadgetStore.updateTodo(todo.id, { recurrence: nextRecurrence })
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
