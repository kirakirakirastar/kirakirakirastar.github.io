<template>
  <div class="bg-white/70 dark:bg-slate-800/80 backdrop-blur-md rounded-3xl shadow-md border border-white/60 dark:border-slate-700/60 p-6 flex flex-col h-full group">
    <div class="flex justify-between items-center mb-5">
      <h2 class="text-xl font-bold text-slate-800 dark:text-white flex items-center space-x-2">
        <span class="w-1.5 h-6 rounded bg-primary block"></span>
        <span>待办清单</span>
      </h2>
      <span class="text-xs font-semibold px-2 py-1 rounded-lg bg-primary/10 text-primary dark:text-primary-light">
        {{ gadgetStore.todos.filter(t => !t.completed).length }} 待办
      </span>
    </div>

    <!-- Add Input -->
    <div class="relative mb-6">
      <input 
        v-model="newTodoText"
        @keyup.enter="handleAdd"
        type="text"
        placeholder="添加新任务..."
        class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all dark:text-slate-200 placeholder-slate-400"
      />
      <button 
        @click="handleAdd"
        class="absolute right-2 top-2 p-1.5 rounded-xl bg-primary text-white hover:scale-105 active:scale-95 transition-transform"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
        </svg>
      </button>
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
          class="flex items-center gap-3 p-3.5 rounded-2xl bg-white/50 dark:bg-slate-700/30 border border-transparent hover:border-primary/20 hover:bg-white dark:hover:bg-slate-700/50 transition-all duration-300 group/item"
          :class="{ 'opacity-60': todo.completed }"
        >
          <button 
            @click="gadgetStore.toggleTodo(todo.id)"
            class="flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors"
            :class="todo.completed ? 'bg-primary border-primary text-white' : 'border-slate-300 dark:border-slate-600'"
          >
            <svg v-if="todo.completed" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
            </svg>
          </button>
          
          <span 
            class="flex-1 text-sm font-medium text-slate-700 dark:text-slate-200 transition-all"
            :class="{ 'line-through decoration-slate-400': todo.completed }"
          >
            {{ todo.text }}
          </span>

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
import { useGadgetStore } from '@/stores/gadgets'

const gadgetStore = useGadgetStore()
const newTodoText = ref('')

const handleAdd = async () => {
  if (!newTodoText.value.trim()) return
  await gadgetStore.addTodo(newTodoText.value)
  newTodoText.value = ''
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
