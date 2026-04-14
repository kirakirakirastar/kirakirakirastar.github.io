<template>
  <div class="max-w-6xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <div>
        <h1 class="text-4xl font-black text-slate-900 dark:text-white flex items-center gap-3">
          <span class="p-3 bg-red-500/10 text-red-500 rounded-3xl">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          </span>
          回收站
        </h1>
        <p class="text-slate-500 dark:text-slate-400 mt-2 font-medium">逻辑删除的项目会保留在此处，您可以随时还原或彻底销毁。</p>
      </div>

      <div class="flex gap-2">
        <button 
          @click="loadAll"
          class="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-all text-slate-600 dark:text-slate-300 active:scale-95"
          title="刷新"
        >
          <svg class="w-5 h-5" :class="{ 'animate-spin': loading }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
        </button>
        <button 
          v-if="hasItems"
          @click="confirmEmptyTrash"
          class="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold shadow-lg shadow-red-500/20 transition-all active:scale-95 flex items-center gap-2"
        >
          清空回收站
        </button>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex p-1 bg-slate-100 dark:bg-slate-800/50 rounded-2xl mb-8 max-w-sm transition-all duration-500">
      <button 
        v-for="tab in (['notes', 'journals', 'hobbies'] as const)"
        :key="tab"
        @click="activeTab = tab"
        class="flex-1 py-2 text-sm font-bold rounded-xl transition-all duration-300"
        :class="activeTab === tab 
          ? 'bg-white dark:bg-slate-700 shadow-lg text-primary dark:text-white' 
          : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'"
      >
        {{ tab === 'notes' ? '笔记' : tab === 'journals' ? '日志' : '爱好' }}
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-20 animate-pulse">
      <div class="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
      <p class="text-slate-400 font-medium">正在检索已删除内容...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="!hasItems" class="bg-white dark:bg-slate-800/40 backdrop-blur-md rounded-[2.5rem] border border-slate-100 dark:border-white/5 p-20 flex flex-col items-center text-center">
      <div class="w-24 h-24 bg-slate-50 dark:bg-slate-900/50 rounded-full flex items-center justify-center mb-6 text-slate-300">
        <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
        </svg>
      </div>
      <h3 class="text-xl font-bold text-slate-800 dark:text-slate-200">回收站是空的</h3>
      <p class="text-slate-400 mt-2">在这里删除的项目将会暂时保留。</p>
    </div>

    <!-- List -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="item in currentItems" 
        :key="item.id"
        class="group relative bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-white/5 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500"
      >
        <div class="flex justify-between items-start mb-4">
          <span class="px-3 py-1 bg-slate-50 dark:bg-slate-900 text-[10px] font-black uppercase text-slate-400 rounded-full tracking-widest">
            删除于 {{ formatDate(item.deleted_at) }}
          </span>
          <div class="flex gap-1">
            <button 
              @click="restoreItem(item.id)" 
              class="p-2 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-all"
              title="还原"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path></svg>
            </button>
            <button 
              @click="confirmPurge(item.id)" 
              class="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
              title="彻底删除"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
          </div>
        </div>

        <h3 class="text-lg font-black text-slate-800 dark:text-slate-100 mb-2 line-clamp-1 leading-tight group-hover:text-primary transition-colors">
          {{ item.title }}
        </h3>
        <p class="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {{ activeTab === 'notes' ? item.summary : item.excerpt }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { supabaseNotesApi, supabaseJournalsApi, supabaseHobbiesApi } from '@/api/supabaseData'
import { useUiStore } from '@/stores/ui'
import dayjs from 'dayjs'

const uiStore = useUiStore()
const activeTab = ref<'notes' | 'journals' | 'hobbies'>('notes')
const loading = ref(false)

const trashedNotes = ref<any[]>([])
const trashedJournals = ref<any[]>([])
const trashedHobbies = ref<any[]>([])

const hasItems = computed(() => {
  if (activeTab.value === 'notes') return trashedNotes.value.length > 0
  if (activeTab.value === 'journals') return trashedJournals.value.length > 0
  return trashedHobbies.value.length > 0
})

const currentItems = computed(() => {
  if (activeTab.value === 'notes') return trashedNotes.value
  if (activeTab.value === 'journals') return trashedJournals.value
  return trashedHobbies.value
})

const loadAll = async () => {
  loading.value = true
  try {
    // 采用更具容错性的并发处理，防止单一模块失败阻塞全局
    const [notesRes, journalsRes, hobbiesRes] = await Promise.allSettled([
      supabaseNotesApi.listTrash(),
      supabaseJournalsApi.listTrash(),
      supabaseHobbiesApi.listTrash()
    ])
    
    if (notesRes.status === 'fulfilled') trashedNotes.value = notesRes.value
    if (journalsRes.status === 'fulfilled') trashedJournals.value = journalsRes.value
    if (hobbiesRes.status === 'fulfilled') trashedHobbies.value = hobbiesRes.value
    
    // 如果有失败的（通常是数据库字段未准备好），进行静默处理或个别提示
    if (hobbiesRes.status === 'rejected') {
      console.warn('Hobbies trash failed to load, probably missing deleted_at column:', hobbiesRes.reason)
    }
  } catch (err) {
    console.error('Critical failed to load trash:', err)
    uiStore.addToast('回收站服务暂时不可用', 'error')
  } finally {
    loading.value = false
  }
}

const restoreItem = async (id: number) => {
  try {
    if (activeTab.value === 'notes') {
      await supabaseNotesApi.restore(id)
      trashedNotes.value = trashedNotes.value.filter(n => n.id !== id)
    } else if (activeTab.value === 'journals') {
      await supabaseJournalsApi.restore(id)
      trashedJournals.value = trashedJournals.value.filter(j => j.id !== id)
    } else {
      await supabaseHobbiesApi.restore(id)
      trashedHobbies.value = trashedHobbies.value.filter(h => h.id !== id)
    }
    uiStore.addToast('已成功还原', 'success')
  } catch (err) {
    uiStore.addToast('还原失败', 'error')
  }
}

const confirmPurge = async (id: number) => {
  if (!confirm('确定要永久销毁此条目吗？关联的云端资源也将被同步清理，此操作不可撤销！')) return
  
  try {
    if (activeTab.value === 'notes') {
      await supabaseNotesApi.permanentlyDelete(id)
      trashedNotes.value = trashedNotes.value.filter(n => n.id !== id)
    } else if (activeTab.value === 'journals') {
      await supabaseJournalsApi.permanentlyDelete(id)
      trashedJournals.value = trashedJournals.value.filter(j => j.id !== id)
    } else {
      await supabaseHobbiesApi.permanentlyDelete(id)
      trashedHobbies.value = trashedHobbies.value.filter(h => h.id !== id)
    }
    uiStore.addToast('已永久销毁', 'success')
  } catch (err) {
    uiStore.addToast('销毁失败', 'error')
  }
}

const confirmEmptyTrash = async () => {
  const typeName = activeTab.value === 'notes' ? '笔记' : activeTab.value === 'journals' ? '日志' : '爱好'
  if (!confirm(`确定要清空所有已删除的${typeName}吗？此操作将永久抹除所有数据及关联图片。`)) return
  
  try {
    const ids = currentItems.value.map(i => i.id)
    if (activeTab.value === 'notes') {
      await supabaseNotesApi.batchPermanentlyDelete(ids)
      trashedNotes.value = []
    } else if (activeTab.value === 'journals') {
      await supabaseJournalsApi.batchPermanentlyDelete(ids)
      trashedJournals.value = []
    } else {
      await supabaseHobbiesApi.batchPermanentlyDelete(ids)
      trashedHobbies.value = []
    }
    uiStore.addToast('回收站已清空', 'success')
  } catch (err) {
    uiStore.addToast('清空失败', 'error')
  }
}

const formatDate = (dateString?: string) => {
  if (!dateString) return '未知时间'
  return dayjs(dateString).format('YYYY-MM-DD HH:mm')
}

onMounted(loadAll)
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
