<template>
  <div 
    class="relative h-full transition-all duration-300 ease-in-out border-r border-gray-100 dark:border-white/5 bg-white/30 dark:bg-theme-card-dark/30 backdrop-blur-md"
    :class="[isCollapsed ? 'w-16' : 'w-64']"
  >
    <!-- Collapse Toggle -->
    <button 
      @click="toggleCollapse"
      class="absolute -right-3 top-10 w-6 h-6 bg-white dark:bg-slate-800 rounded-full border border-gray-100 dark:border-white/10 flex items-center justify-center shadow-md z-10 hover:scale-110 transition-transform"
    >
      <svg 
        class="w-4 h-4 text-gray-400 transform transition-transform duration-300"
        :class="{ 'rotate-180': isCollapsed }"
        fill="none" stroke="currentColor" viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
    </button>

    <div class="h-full flex flex-col p-4 overflow-hidden">
      <!-- Title / Section -->
      <div class="mb-8 flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shrink-0">
          <slot name="icon">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>
          </slot>
        </div>
        <h2 v-if="!isCollapsed" class="font-bold text-lg truncate whitespace-nowrap">{{ title }}</h2>
      </div>

      <!-- Static Items: All & Unfolder -->
      <div class="space-y-1 mb-6">
        <button 
          @click="$emit('select', undefined)"
          class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
          :class="[selectedId === undefined ? 'bg-primary/10 text-primary font-bold shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-white/5']"
        >
          <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
          <span v-if="!isCollapsed" class="truncate">全部</span>
        </button>
        <button 
          @click="$emit('select', null)"
          class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
          :class="[selectedId === null ? 'bg-primary/10 text-primary font-bold shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-white/5']"
        >
          <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5l-2-2H5a2 2 0 00-2 2z"></path></svg>
          <span v-if="!isCollapsed" class="truncate">未分类</span>
        </button>
      </div>

      <!-- Folders List -->
      <div class="flex-1 overflow-y-auto min-h-0 space-y-1 scrollbar-hide">
        <div v-for="folder in folders" :key="folder.id" class="group relative">
          <button 
            @click="$emit('select', folder.id)"
            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
            :class="[selectedId === folder.id ? 'bg-primary/10 text-primary font-bold shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-white/5']"
          >
            <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>
            <span v-if="!isCollapsed" class="truncate">{{ folder.name }}</span>
          </button>
          
          <!-- Actions Menu (Edit/Delete) - only show when not collapsed -->
          <div v-if="!isCollapsed" class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button @click.stop="$emit('edit', folder)" class="p-1 text-gray-400 hover:text-primary"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg></button>
            <button @click.stop="$emit('delete', folder.id)" class="p-1 text-gray-400 hover:text-red-500"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
          </div>
        </div>
      </div>

      <!-- Add Folder Button -->
      <div class="mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
        <button 
          @click="$emit('add')"
          class="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 rounded-xl hover:bg-primary hover:text-white transition-all overflow-hidden"
        >
          <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
          <span v-if="!isCollapsed" class="truncate font-medium">新建分类</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  title: string
  folders: any[]
  selectedId: number | null | undefined
}>()

const emit = defineEmits(['select', 'add', 'edit', 'delete'])

const isCollapsed = ref(localStorage.getItem('sidebar_collapsed') === 'true')

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
  localStorage.setItem('sidebar_collapsed', String(isCollapsed.value))
}
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
