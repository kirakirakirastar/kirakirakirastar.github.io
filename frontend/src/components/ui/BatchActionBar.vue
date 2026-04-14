<template>
  <transition name="action-bar">
    <div 
      v-if="count > 0"
      class="fixed bottom-10 left-1/2 -translate-x-1/2 z-[60] px-6 py-4 bg-slate-900/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-2xl flex items-center gap-6 text-white min-w-[400px]"
    >
      <div class="flex items-center gap-3 pr-6 border-r border-white/10">
        <span class="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold text-sm">{{ count }}</span>
        <span class="text-sm font-medium">已选择</span>
      </div>

      <div class="flex items-center gap-2">
        <div class="relative group">
          <button 
            @click="isMoveMenuOpen = !isMoveMenuOpen"
            class="px-4 py-2 hover:bg-white/10 rounded-xl transition-all flex items-center gap-2 text-sm font-medium"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
            移动到
          </button>

          <!-- Move Menu -->
          <div 
            v-if="isMoveMenuOpen"
            class="absolute bottom-full mb-4 left-0 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 p-2 text-slate-900 dark:text-white"
          >
            <button 
              @click="$emit('move', null); isMoveMenuOpen = false"
              class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl text-sm transition-all flex items-center gap-2"
            >
              <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5l-2-2H5a2 2 0 00-2 2z"></path></svg>
              未分类
            </button>
            <div class="h-[1px] bg-gray-100 dark:bg-white/5 my-1"></div>
            <div class="max-h-48 overflow-y-auto min-h-0 scrollbar-hide">
              <button 
                v-for="folder in folders" 
                :key="folder.id"
                @click="$emit('move', folder.id); isMoveMenuOpen = false"
                class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl text-sm transition-all flex items-center gap-2"
              >
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>
                {{ folder.name }}
              </button>
            </div>
            <div v-if="folders.length === 0" class="px-4 py-2 text-xs text-gray-500 italic">暂无文件夹</div>
          </div>
        </div>

        <button 
          @click="$emit('delete')"
          class="px-4 py-2 hover:bg-red-500/20 text-red-400 rounded-xl transition-all flex items-center gap-2 text-sm font-medium"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          批量删除
        </button>
      </div>

      <button 
        @click="$emit('clear')"
        class="ml-auto p-2 hover:bg-white/10 rounded-full transition-all"
        title="取消选择"
      >
        <svg class="w-5 h-5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  count: number
  folders: any[]
}>()

const emit = defineEmits(['move', 'delete', 'clear'])

const isMoveMenuOpen = ref(false)
</script>

<style scoped>
.action-bar-enter-active,
.action-bar-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.action-bar-enter-from,
.action-bar-leave-to {
  transform: translate(-50%, 100px);
  opacity: 0;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
