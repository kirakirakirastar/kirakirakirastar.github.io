<template>
  <div class="relative inline-block text-left" v-click-outside="close">
    <button 
      @click="toggle"
      class="px-4 py-2.5 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-200 rounded-xl font-bold transition-all hover:bg-gray-200 dark:hover:bg-white/20 flex items-center gap-2"
      :class="{ 'ring-2 ring-primary border-primary/50 text-primary': isOpen || selectedId !== undefined }"
    >
      <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>
      <span class="max-w-[100px] truncate whitespace-nowrap">{{ currentFolderName }}</span>
      <svg class="w-4 h-4 transition-transform duration-200" :class="{ 'rotate-180': isOpen }" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
    </button>

    <!-- Dropdown Menu -->
    <transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <div 
        v-if="isOpen"
        class="absolute right-0 mt-2 w-64 origin-top-right rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10 z-50 overflow-hidden"
      >
        <div class="p-2 space-y-1 max-h-[400px] overflow-y-auto scrollbar-hide">
          <button 
            @click="onSelect(undefined)"
            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
            :class="[selectedId === undefined ? 'bg-primary/10 text-primary font-bold' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-white/5']"
          >
            <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            <span class="truncate">全部内容</span>
          </button>
          
          <button 
            @click="onSelect(null)"
            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
            :class="[selectedId === null ? 'bg-primary/10 text-primary font-bold' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-white/5']"
          >
            <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>
            <span class="truncate">未分类</span>
          </button>

          <div class="h-px bg-gray-100 dark:bg-white/5 my-1 mx-2"></div>

          <div v-for="folder in folders" :key="folder.id" class="group relative">
            <button 
              @click="onSelect(folder.id)"
              class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
              :class="[selectedId === folder.id ? 'bg-primary/10 text-primary font-bold' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-white/5']"
            >
              <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>
              <span class="truncate">{{ folder.name }}</span>
            </button>
            
            <div class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button @click.stop="$emit('edit', folder)" class="p-1.5 text-gray-400 hover:text-primary rounded-lg hover:bg-white/20 dark:hover:bg-slate-800/50"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg></button>
              <button @click.stop="$emit('delete', folder.id)" class="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50/20 dark:hover:bg-red-900/30"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
            </div>
          </div>
        </div>

        <!-- Add Folder Footer -->
        <div class="p-2 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
          <button 
            @click="onAdd"
            class="w-full flex items-center justify-center gap-2 px-3 py-2 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-white transition-all overflow-hidden"
          >
            <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            <span class="font-medium text-sm">新建分类</span>
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  folders: any[]
  selectedId: number | null | undefined
}>()

const emit = defineEmits(['select', 'add', 'edit', 'delete'])

const isOpen = ref(false)

const toggle = () => {
  isOpen.value = !isOpen.value
}

const close = () => {
  isOpen.value = false
}

const onSelect = (id: number | null | undefined) => {
  emit('select', id)
  close()
}

const onAdd = () => {
  emit('add')
  close()
}

const currentFolderName = computed(() => {
  if (props.selectedId === undefined) return '全部分类'
  if (props.selectedId === null) return '未分类'
  const folder = props.folders.find(f => f.id === props.selectedId)
  return folder ? folder.name : '未知分类'
})

// Directives
const vClickOutside = {
  mounted(el: any, binding: any) {
    el.clickOutsideEvent = (event: Event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value()
      }
    }
    document.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted(el: any) {
    document.removeEventListener('click', el.clickOutsideEvent)
  }
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
