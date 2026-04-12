<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up">
    <div class="mb-10 flex justify-between items-end">
      <div>
        <h1 class="text-4xl font-black mb-2 bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">公告管理</h1>
        <p class="text-slate-500 dark:text-slate-400 font-medium">管理展示在 Dashboard 顶部的通知与激励语</p>
      </div>
      <router-link 
        to="/"
        class="px-4 py-2 text-sm font-bold text-slate-500 hover:text-primary transition-colors flex items-center gap-2"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        返回仪表盘
      </router-link>
    </div>

    <!-- Create Form -->
    <div class="bg-white/70 dark:bg-slate-800/80 backdrop-blur-md rounded-3xl p-6 mb-10 border border-white/60 dark:border-slate-700/60 shadow-xl shadow-primary/5">
      <h2 class="text-lg font-bold mb-4 text-slate-800 dark:text-white">新增公告</h2>
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="flex-1">
          <input 
            v-model="newText"
            type="text"
            placeholder="输入公告内容 (示例：保持热爱，奔赴山海...)"
            class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all dark:text-slate-200"
            @keyup.enter="handleCreate"
          />
        </div>
        <div class="flex gap-4">
          <select 
            v-model="newType"
            class="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-primary outline-none dark:text-slate-200"
          >
            <option value="info">常规 (Blue)</option>
            <option value="success">成功 (Green)</option>
            <option value="warning">提醒 (Amber)</option>
          </select>
          <button 
            @click="handleCreate"
            :disabled="!newText.trim() || loading"
            class="px-8 py-3 bg-primary text-white font-bold rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:grayscale"
          >
            发布
          </button>
        </div>
      </div>
    </div>

    <!-- Announcements List -->
    <div class="space-y-4">
      <div v-if="gadgetStore.loading" class="text-center py-20 text-slate-400 animate-pulse">
        加载中...
      </div>
      <div v-else-if="gadgetStore.announcements.length === 0" class="text-center py-20 bg-slate-50 dark:bg-slate-900/30 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
        <p class="text-slate-400">目前没有任何公告</p>
      </div>
      <div 
        v-for="ann in gadgetStore.announcements" 
        :key="ann.id"
        class="flex items-center gap-4 p-5 bg-white/50 dark:bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-white/60 dark:border-slate-700/60 hover:shadow-md transition-all group"
      >
        <div 
          class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          :class="{
            'bg-blue-500/10 text-blue-500': ann.type === 'info',
            'bg-emerald-500/10 text-emerald-500': ann.type === 'success',
            'bg-amber-500/10 text-amber-500': ann.type === 'warning'
          }"
        >
          <svg v-if="ann.type === 'info'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <svg v-else-if="ann.type === 'success'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.268 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        </div>

        <div class="flex-1 min-w-0">
          <div class="text-slate-800 dark:text-slate-100 font-semibold truncate">{{ ann.text }}</div>
          <div class="text-xs text-slate-400 mt-1 uppercase tracking-tighter">{{ ann.type }} · {{ formatDate(ann.created_at) }}</div>
        </div>

        <button 
          @click="gadgetStore.removeAnnouncement(ann.id)"
          class="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all opacity-0 group-hover:opacity-100"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useGadgetStore } from '@/stores/gadgets'
import dayjs from 'dayjs'

const gadgetStore = useGadgetStore()
const newText = ref('')
const newType = ref('info')
const loading = ref(false)

const handleCreate = async () => {
  if (!newText.value.trim() || loading.value) return
  loading.value = true
  try {
    await gadgetStore.addAnnouncement(newText.value, newType.value)
    newText.value = ''
  } finally {
    loading.value = false
  }
}

const formatDate = (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm')

onMounted(() => {
  gadgetStore.initGadgets()
})
</script>
