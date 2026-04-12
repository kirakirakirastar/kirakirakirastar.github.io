<template>
  <div class="relative bg-white/70 dark:bg-slate-800/80 backdrop-blur-md rounded-3xl shadow-md border border-white/60 dark:border-slate-700/60 p-6 flex flex-col items-center justify-between overflow-hidden group h-full">
    <!-- Background Decoration -->
    <div class="absolute -right-10 -bottom-10 w-40 h-40 bg-secondary/10 dark:bg-secondary/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>

    <div class="w-full mb-4">
      <h2 class="text-xl font-bold text-slate-800 dark:text-white flex items-center space-x-2">
        <span class="w-1.5 h-6 rounded bg-secondary block"></span>
        <span>每日打卡</span>
      </h2>
    </div>

    <!-- Streak Display -->
    <div class="flex flex-col items-center py-4">
      <div class="relative">
        <div class="text-6xl font-black bg-gradient-to-br from-secondary to-pink-500 bg-clip-text text-transparent drop-shadow-sm">
          {{ gadgetStore.checkin.streak }}
        </div>
        <div class="absolute -top-1 -right-6 text-2xl animate-bounce">🔥</div>
      </div>
      <div class="text-sm font-bold text-slate-500 dark:text-slate-400 mt-2 tracking-widest uppercase">
        连续打卡天数
      </div>
    </div>

    <!-- Stats Row -->
    <div class="w-full grid grid-cols-2 gap-4 mb-6">
      <div class="bg-slate-50 dark:bg-slate-900/40 rounded-2xl p-3 text-center border border-white/40 dark:border-white/5">
        <div class="text-xs text-slate-400 mb-1">累计打卡</div>
        <div class="text-lg font-bold text-slate-700 dark:text-slate-200">{{ gadgetStore.checkin.total_count }} 次</div>
      </div>
      <div class="bg-slate-50 dark:bg-slate-900/40 rounded-2xl p-3 text-center border border-white/40 dark:border-white/5">
        <div class="text-xs text-slate-400 mb-1">下次打卡</div>
        <div class="text-sm font-bold text-slate-700 dark:text-slate-200">
          {{ gadgetStore.canCheckin() ? '现在可以' : '明天再来' }}
        </div>
      </div>
    </div>

    <!-- Checkin Button -->
    <button 
      @click="handleCheckin"
      :disabled="!gadgetStore.canCheckin() || loading"
      class="w-full py-4 rounded-2xl font-bold text-white transition-all duration-300 relative overflow-hidden group/btn shadow-lg shadow-secondary/20"
      :class="gadgetStore.canCheckin() 
        ? 'bg-gradient-to-r from-secondary to-pink-500 hover:scale-[1.02] active:scale-95' 
        : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none grayscale'"
    >
      <div v-if="loading" class="flex justify-center items-center">
        <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
      <span v-else>{{ gadgetStore.canCheckin() ? '开启今日挑战' : '今日已完成' }}</span>
      
      <!-- Button Shine Effect -->
      <div v-if="gadgetStore.canCheckin()" class="absolute inset-0 w-full h-full bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite]"></div>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useGadgetStore } from '@/stores/gadgets'

const gadgetStore = useGadgetStore()
const loading = ref(false)

const handleCheckin = async () => {
  loading.value = true
  try {
    const success = await gadgetStore.doCheckin()
    if (success) {
      // Could add a confetti effect here
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}
</style>
