<template>
  <div class="bg-white/70 dark:bg-slate-800/80 backdrop-blur-md rounded-[2.5rem] p-7 sm:p-9 border border-white/60 dark:border-slate-700/60 shadow-lg transition-all duration-500 overflow-visible relative">
    
    <!-- Optimized Header: Centered & Balanced -->
    <div class="max-w-6xl mx-auto flex flex-wrap items-center justify-center sm:justify-between gap-6 mb-10">
      <div class="flex items-center gap-4">
        <div class="p-3 rounded-2xl bg-primary/15 text-primary shadow-inner">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
        </div>
        <div>
          <h2 class="text-2xl font-black text-slate-800 dark:text-white leading-tight tracking-tight">活跃贡献图</h2>
          <p class="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.2em] mt-1 opacity-70">Activity Analytics</p>
        </div>
      </div>

      <div class="flex items-center gap-4">
        <!-- Mode Switcher -->
        <div class="flex p-1.5 bg-slate-100/80 dark:bg-slate-900/60 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-inner">
          <button 
            v-for="cat in categories" 
            :key="cat.id"
            @click="activeCategory = cat.id"
            class="px-4 py-2 rounded-xl text-[11px] font-black transition-all duration-500 flex items-center gap-2.5 whitespace-nowrap"
            :class="activeCategory === cat.id ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xl ring-1 ring-black/5 scale-105' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'"
          >
            <div v-if="cat.color" class="w-2 h-2 rounded-full shadow-sm" :style="{ backgroundColor: cat.color }"></div>
            {{ cat.name }}
          </button>
        </div>

        <button 
          @click="isCollapsed = !isCollapsed"
          class="p-3 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800 text-slate-400 transition-all duration-500 hover:shadow-md active:scale-95"
        >
          <svg class="w-5 h-5 transition-transform duration-700 cubic-bezier(0.34, 1.56, 0.64, 1)" :class="{ 'rotate-180': isCollapsed }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>
      </div>
    </div>

    <!-- Main Content Area -->
    <div 
      class="grid-container transition-all duration-700 ease-in-out px-2"
      :class="isCollapsed ? 'max-h-0 opacity-0 overflow-hidden' : 'max-h-[600px] opacity-100 overflow-visible'"
    >
      <div class="flex max-w-6xl mx-auto">
        <!-- Y-Axis: Day Labels -->
        <div class="flex flex-col justify-between py-1.5 pr-5 text-[11px] font-black text-slate-400/40 select-none uppercase tracking-tighter h-[115px] sm:h-[138px] shrink-0 text-right w-10">
          <span></span>
          <span>一</span>
          <span></span>
          <span>三</span>
          <span></span>
          <span>五</span>
          <span></span>
        </div>

        <!-- Heatmap Grid -->
        <div class="flex-1 overflow-x-auto custom-scrollbar pb-16 pt-16 px-1">
          <div class="flex gap-1.5 sm:gap-2 w-max relative">
            <div v-for="(week, weekIndex) in heatmapData" :key="weekIndex" class="flex flex-col gap-1.5 sm:gap-2 relative week-col">
              
              <!-- X-Axis: Month Labels (Precise Alignment) -->
              <div 
                v-if="week[0].isMonthStart" 
                class="absolute -top-10 left-0 text-[10px] sm:text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap bg-slate-100/50 dark:bg-slate-700/20 px-2 py-0.5 rounded-md"
              >
                {{ week[0].monthLabel }}
              </div>

              <!-- Cells -->
              <div
                v-for="(day, dayIndex) in week"
                :key="day.date"
                class="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-[4px] sm:rounded-[4.5px] relative group/cell transition-all duration-500 hover:z-50"
                :class="day.count[activeCategory === 'all' ? 'total' : activeCategory] === 0 ? 'bg-slate-100 dark:bg-slate-700/30' : ''"
                :style="getCellStyle(day)"
              >
                <!-- Smart Tooltip: Positions based on row to prevent clipping -->
                <div 
                  class="absolute left-1/2 -translate-x-1/2 w-44 px-4 py-3.5 bg-slate-900/98 backdrop-blur-2xl text-white text-[11px] rounded-[1.25rem] opacity-0 scale-90 invisible group-hover/cell:opacity-100 group-hover/cell:scale-100 group-hover/cell:visible transition-all duration-300 pointer-events-none z-[100] shadow-[0_20px_50px_rgba(0,0,0,0.3)] ring-1 ring-white/10"
                  :class="dayIndex <= 3 ? 'top-full mt-3' : 'bottom-full mb-3'"
                >
                  <div class="font-black border-b border-white/10 pb-2.5 mb-2.5 flex justify-between items-center text-white/90 tracking-wide">
                    <span>{{ day.dateDisplay }}</span>
                    <span v-if="day.count.total > 0" class="px-2.5 py-1 rounded-lg bg-white/10 text-[10px]">{{ day.count.total }}</span>
                  </div>
                  
                  <div v-if="day.count.total > 0" class="space-y-2">
                    <div v-if="day.count.notes" class="flex justify-between items-center"><span class="flex items-center gap-2.5"><div class="w-2 h-2 rounded-full shadow-[0_0_8px_#6366f1]" style="background: #6366f1"></div>学习笔记</span> <span class="font-black">{{ day.count.notes }}</span></div>
                    <div v-if="day.count.journals" class="flex justify-between items-center"><span class="flex items-center gap-2.5"><div class="w-2 h-2 rounded-full shadow-[0_0_8px_#a855f7]" style="background: #a855f7"></div>个人日志</span> <span class="font-black">{{ day.count.journals }}</span></div>
                    <div v-if="day.count.todos" class="flex justify-between items-center"><span class="flex items-center gap-2.5"><div class="w-2 h-2 rounded-full shadow-[0_0_8px_#10b981]" style="background: #10b981"></div>任务待办</span> <span class="font-black">{{ day.count.todos }}</span></div>
                    <div v-if="day.count.hobbies" class="flex justify-between items-center"><span class="flex items-center gap-2.5"><div class="w-2 h-2 rounded-full shadow-[0_0_8px_#f59e0b]" style="background: #f59e0b"></div>生活爱好</span> <span class="font-black">{{ day.count.hobbies }}</span></div>
                  </div>
                  <div v-else class="text-slate-400 italic py-1 text-center font-medium">这一天风平浪静</div>

                  <!-- Dynamic Arrow -->
                  <div 
                    class="absolute left-1/2 -translate-x-1/2 border-[7px] border-transparent"
                    :class="dayIndex <= 3 ? 'bottom-full border-b-slate-900/98' : 'top-full border-t-slate-900/98'"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'

dayjs.locale('zh-cn')

const props = defineProps<{
  activities: Record<string, { notes: number, journals: number, todos: number, hobbies: number, total: number }>
}>()

const isCollapsed = ref(false)
const activeCategory = ref('all')

const categories = [
  { id: 'all', name: '全能巡航', color: '' },
  { id: 'notes', name: '笔记', color: '#6366f1' },
  { id: 'journals', name: '日志', color: '#a855f7' },
  { id: 'todos', name: '任务', color: '#10b981' },
  { id: 'hobbies', name: '爱好', color: '#f59e0b' }
]

const heatmapData = computed(() => {
  const weeks = []
  let currentWeek = []
  
  // Exactly 53 weeks (~1 year)
  const endDate = dayjs()
  const startDate = dayjs().subtract(52, 'week').startOf('week')
  
  let current = startDate
  let lastMonth = -1

  while (current.isBefore(endDate) || current.isSame(endDate, 'day')) {
    const dateStr = current.format('YYYY-MM-DD')
    const data = props.activities[dateStr] || { notes: 0, journals: 0, todos: 0, hobbies: 0, total: 0 }
    
    // Month transition logic
    const isFirstRow = currentWeek.length === 0
    const currentMonth = current.month()
    let isMonthStart = false
    let monthLabel = ''

    if (isFirstRow && currentMonth !== lastMonth) {
      isMonthStart = true
      monthLabel = current.format('YYYY年M月')
      lastMonth = currentMonth
    }

    currentWeek.push({
      date: dateStr,
      dateDisplay: current.format('YYYY年MM月DD日'),
      isMonthStart,
      monthLabel,
      count: data
    })
    
    if (currentWeek.length === 7) {
      weeks.push(currentWeek)
      currentWeek = []
    }
    current = current.add(1, 'day')
  }
  
  if (currentWeek.length > 0) weeks.push(currentWeek)
  return weeks
})

const getCellStyle = (day: any) => {
  const currentCount = activeCategory.value === 'all' ? day.count.total : day.count[activeCategory.value]
  if (currentCount === 0) return {}

  let targetColor = ''
  if (activeCategory.value !== 'all') {
    targetColor = categories.find(c => c.id === activeCategory.value)?.color || '#6366f1'
  } else {
    // Dominant-category algorithm
    const catData = [
      { id: 'notes', val: day.count.notes, col: '#6366f1' },
      { id: 'journals', val: day.count.journals, col: '#a855f7' },
      { id: 'todos', val: day.count.todos, col: '#10b981' },
      { id: 'hobbies', val: day.count.hobbies, col: '#f59e0b' }
    ]
    const dominant = catData.reduce((max, c) => c.val > max.val ? c : max, catData[0])
    targetColor = dominant.col
  }
  
  // Power-scale intensity (0.3 to 1.0)
  const intensity = Math.min(0.3 + (currentCount * 0.1), 1)
  
  return {
    backgroundColor: targetColor,
    opacity: intensity,
    boxShadow: currentCount > 3 ? `0 0 12px ${targetColor}40` : 'none',
    transform: `scale(${isCollapsed.value ? 0.85 : 1})`
  }
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0,0,0,0.08);
  border-radius: 20px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.12);
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--primary-rgb), 0.3);
}

.week-col:hover .bg-slate-100,
.week-col:hover .bg-slate-700\/30 {
  background-color: rgba(var(--primary-rgb), 0.1);
}

.grid-container {
  overflow: visible; /* Required for tooltips */
}
</style>
