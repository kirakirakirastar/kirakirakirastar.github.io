<template>
  <div class="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-500">
    <div class="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 relative">
      
      <!-- Confetti Overlay (CSS Pure) -->
      <div class="absolute inset-0 pointer-events-none overflow-hidden" v-if="stats.grade === 'S' || stats.grade === 'A'">
        <div v-for="n in 20" :key="n" class="confetti" :style="getConfettiStyle(n)"></div>
      </div>

      <!-- Grade Header -->
      <div class="pt-12 pb-8 flex flex-col items-center justify-center bg-gradient-to-b from-primary/5 to-transparent relative">
        <div 
          class="w-32 h-32 rounded-full flex items-center justify-center text-7xl font-black shadow-2xl relative"
          :class="getGradeColor(stats.grade)"
        >
          <div class="absolute inset-0 rounded-full animate-ping opacity-20" :class="getGradeBg(stats.grade)"></div>
          <span class="relative z-10 drop-shadow-lg">{{ stats.grade }}</span>
        </div>
        <h3 class="mt-6 text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
          {{ getGradeTitle(stats.grade) }}
        </h3>
        <p class="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">挑战总结报告</p>
      </div>

      <!-- Stats Grid -->
      <div class="px-8 pb-10 space-y-6">
        <div class="grid grid-cols-2 gap-3">
          <div class="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-3xl border border-slate-100 dark:border-white/5 flex flex-col items-center">
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">达成率</span>
            <span class="text-2xl font-black text-primary">{{ stats.rate }}%</span>
            <div class="w-full h-1 bg-slate-200 dark:bg-white/10 rounded-full mt-2 overflow-hidden">
               <div class="h-full bg-primary" :style="{ width: `${stats.rate}%` }"></div>
            </div>
          </div>
          <div class="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-3xl border border-slate-100 dark:border-white/5 flex flex-col items-center">
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">最高连击</span>
            <span class="text-2xl font-black text-amber-500 flex items-center gap-1">
              {{ stats.streak }} 
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.334-.398-1.817a1 1 0 00-1.514-.857 4.028 4.028 0 00-1.159 1.44c-.123.242-.231.503-.316.773a6.996 6.996 0 00-.104 2.101 5.996 5.996 0 001.623 3.31c.8.835 1.602 1.134 2.751 1.134 1.554 0 2.302-1 2.302-2.302 0-1.085-.353-2.084-.353-3.133 0-1.272.21-2.287.898-3.676a10.377 10.377 0 00.577-1.485 1.13 1.13 0 00.073-.499c0-.179-.033-.341-.09-.488z" clip-rule="evenodd"></path></svg>
            </span>
            <span class="text-[9px] font-bold text-slate-400 mt-2">Days Stream</span>
          </div>
        </div>

        <div class="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-white/5">
          <h4 class="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">挑战详情</h4>
          <div class="flex items-center justify-between py-2 border-b border-slate-200 dark:border-white/5">
            <span class="text-xs font-bold text-slate-600 dark:text-slate-300">目标名称</span>
            <span class="text-xs font-black text-slate-800 dark:text-slate-100">{{ todo.text }}</span>
          </div>
          <div class="flex items-center justify-between py-2 border-b border-slate-200 dark:border-white/5">
            <span class="text-xs font-bold text-slate-600 dark:text-slate-300">完成天数</span>
            <span class="text-xs font-black text-slate-800 dark:text-slate-100">{{ stats.completed }} / {{ stats.total }}</span>
          </div>
          <div class="flex items-center justify-between py-2">
            <span class="text-xs font-bold text-slate-600 dark:text-slate-300">完美判定</span>
            <span v-if="stats.isPerfect" class="text-[10px] font-black text-emerald-500 uppercase">PERFECT!</span>
            <span v-else class="text-[10px] font-black text-red-400 uppercase">FAILED</span>
          </div>
        </div>

        <button 
          @click="$emit('close')"
          class="w-full py-4 rounded-[1.5rem] bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
        >
          {{ stats.grade === 'S' ? '享受胜利' : '总结教训，继续出发' }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  todo: any
  stats: any
}>()

const emit = defineEmits(['close'])

const getGradeColor = (g: string) => {
  if (g === 'S') return 'bg-amber-400 text-white shadow-amber-500/50'
  if (g === 'A') return 'bg-emerald-400 text-white shadow-emerald-500/50'
  if (g === 'B') return 'bg-blue-400 text-white shadow-blue-500/50'
  return 'bg-slate-300 text-white shadow-slate-400/50'
}

const getGradeBg = (g: string) => {
  if (g === 'S') return 'bg-amber-400'
  if (g === 'A') return 'bg-emerald-400'
  if (g === 'B') return 'bg-blue-400'
  return 'bg-slate-400'
}

const getGradeTitle = (g: string) => {
  if (g === 'S') return '王者降临'
  if (g === 'A') return '出类拔萃'
  if (g === 'B') return '再接再厉'
  return '现状堪忧'
}

const getConfettiStyle = (n: number) => {
  const left = Math.random() * 100
  const delay = Math.random() * 5
  const duration = 2 + Math.random() * 3
  const size = 5 + Math.random() * 10
  const color = ['#f59e0b', '#fbbf24', '#10b981', '#6366f1'][Math.floor(Math.random() * 4)]
  
  return {
    left: `${left}%`,
    top: '-20px',
    backgroundColor: color,
    width: `${size}px`,
    height: `${size}px`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`
  }
}
</script>

<style scoped>
.confetti {
  position: absolute;
  border-radius: 2px;
  animation: fall linear infinite;
  z-index: 10;
}

@keyframes fall {
  0% { transform: translateY(0) rotate(0deg); opacity: 1; }
  100% { transform: translateY(600px) rotate(720deg); opacity: 0; }
}

@keyframes ping {
  75%, 100% {
    transform: scale(1.5);
    opacity: 0;
  }
}
</style>
