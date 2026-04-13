<template>
  <div class="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-3 pointer-events-none">
    <TransitionGroup 
      name="toast"
      tag="div"
      class="flex flex-col items-center gap-3"
    >
      <div 
        v-for="toast in uiStore.toasts" 
        :key="toast.id"
        class="pointer-events-auto flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-2xl min-w-[200px] max-w-md animate-toast-in"
      >
        <div 
          class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          :class="getTypeStyles(toast.type)"
        >
          <svg v-if="toast.type === 'success'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path>
          </svg>
          <svg v-else-if="toast.type === 'error'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <div class="flex flex-col">
          <span class="text-sm font-bold text-slate-800 dark:text-white">{{ toast.message }}</span>
          <span v-if="toast.description" class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{{ toast.description }}</span>
        </div>
        <button 
          @click="uiStore.removeToast(toast.id)"
          class="ml-auto p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { useUiStore } from '@/stores/ui'

const uiStore = useUiStore()

const getTypeStyles = (type: string) => {
  switch (type) {
    case 'success': return 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
    case 'error':   return 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400'
    default:        return 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
  }
}
</script>

<style scoped>
.toast-enter-active, .toast-leave-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.9);
}
.toast-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.9);
}

@keyframes toast-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
