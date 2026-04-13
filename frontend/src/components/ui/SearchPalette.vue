<template>
  <transition name="fade">
    <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 pointer-events-auto">
      <!-- Backdrop -->
      <div 
        class="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        @click="close"
      ></div>

      <!-- Palette Container -->
      <div class="relative w-full max-w-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/40 dark:border-slate-800/60 overflow-hidden transform transition-all duration-300 animate-in fade-in zoom-in-95 duration-200">
        <!-- Search Input -->
        <div class="relative border-b border-slate-100 dark:border-slate-800">
          <div class="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400">
            <svg v-if="!searching" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <div v-else class="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          </div>
          <input
            ref="inputRef"
            v-model="query"
            type="text"
            placeholder="搜索任何想找的内容..."
            class="w-full pl-16 pr-6 py-6 bg-transparent outline-none text-lg text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
            @keydown.esc="close"
            @keydown.down.prevent="moveHighlight(1)"
            @keydown.up.prevent="moveHighlight(-1)"
            @keydown.enter="selectHighlighted"
          />
          <div class="absolute right-6 top-1/2 -translate-y-1/2 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-200 dark:border-slate-700">ESC</div>
        </div>

        <!-- Scrollable Results -->
        <div class="max-h-[60vh] overflow-y-auto py-3">
          <!-- Empty State -->
          <div v-if="!query" class="px-6 py-12 text-center">
            <div class="text-slate-300 dark:text-slate-700 mb-4 flex justify-center">
              <svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <p class="text-slate-500 dark:text-slate-400">输入关键词开始搜索笔记、日志或爱好</p>
          </div>

          <div v-else-if="results.length === 0 && !searching" class="px-6 py-12 text-center text-slate-500">
            未找到与 "{{ query }}" 相关的结果
          </div>

          <!-- Results List -->
          <div v-else class="px-3 space-y-1">
            <router-link
              v-for="(res, index) in results"
              :key="res.id"
              :to="res.url"
              @click="close"
              class="flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 group relative"
              :class="highlightIndex === index ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'"
              @mouseenter="highlightIndex = index"
            >
              <div 
                class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" 
                :class="highlightIndex === index ? 'bg-white/20' : getTypeColor(res.type)"
              >
                <div v-html="getTypeIcon(res.type)" class="w-6 h-6"></div>
              </div>
              <div class="flex-1 min-w-0">
                <div class="font-bold truncate" :class="highlightIndex === index ? 'text-white' : 'text-slate-800 dark:text-slate-100'">
                  {{ res.title }}
                </div>
                <div class="text-[10px] uppercase font-black tracking-widest mt-1" :class="highlightIndex === index ? 'text-white/70' : 'text-slate-400'">
                  {{ res.type }} • {{ formatDate(res.date) }}
                </div>
              </div>
              <div v-if="highlightIndex === index" class="text-white/50">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path></svg>
              </div>
            </router-link>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-4 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
           <div class="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
             <span class="flex items-center gap-1"><kbd class="bg-white dark:bg-slate-800 px-1 rounded shadow-sm border border-slate-200 dark:border-slate-700">↵</kbd> 选择</span>
             <span class="flex items-center gap-1"><kbd class="bg-white dark:bg-slate-800 px-1 rounded shadow-sm border border-slate-200 dark:border-slate-700">↑↓</kbd> 移动</span>
           </div>
           <div class="text-[10px] font-bold text-primary uppercase tracking-widest">Kirakirastar Search</div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useSearch } from '@/hooks/useSearch'
import dayjs from 'dayjs'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits(['close'])

const router = useRouter()
const { query, results, searching } = useSearch()
const inputRef = ref<HTMLInputElement | null>(null)
const highlightIndex = ref(0)

const close = () => {
  query.value = ''
  emit('close')
}

const moveHighlight = (dir: number) => {
  const newIndex = highlightIndex.value + dir
  if (newIndex >= 0 && newIndex < results.value.length) {
    highlightIndex.value = newIndex
  }
}

const selectHighlighted = () => {
  const selected = results.value[highlightIndex.value]
  if (selected) {
    router.push(selected.url)
    close()
  }
}

const getTypeIcon = (type: string) => {
  switch(type) {
    case 'note': return '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>'
    case 'journal': return '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>'
    case 'hobby': return '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>'
    default: return ''
  }
}

const getTypeColor = (type: string) => {
  switch(type) {
    case 'note': return 'bg-indigo-500/10 text-indigo-500'
    case 'journal': return 'bg-purple-500/10 text-purple-500'
    case 'hobby': return 'bg-rose-500/10 text-rose-500'
    default: return 'bg-slate-500/10 text-slate-500'
  }
}

const formatDate = (date?: string) => {
  if (!date) return 'N/A'
  return dayjs(date).format('YYYY-MM-DD')
}

watch(() => props.isOpen, (val) => {
  if (val) {
    highlightIndex.value = 0
    nextTick(() => inputRef.value?.focus())
  }
})

watch(results, () => {
  highlightIndex.value = 0
})
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
