<template>
  <div class="activity-heatmap bg-white/70 dark:bg-slate-800/80 backdrop-blur-md rounded-[2.5rem] p-6 sm:p-10 border border-white/60 dark:border-slate-700/60 shadow-xl transition-all duration-500 overflow-visible relative">
    
    <!-- Header: Full Width -->
    <div class="flex flex-wrap items-center justify-between gap-6 mb-8 w-full px-2">
      <div class="flex items-center gap-4">
        <div class="p-3.5 rounded-2xl bg-primary/15 text-primary shadow-inner ring-1 ring-white/20">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
        </div>
        <div>
          <h2 class="text-2xl font-black text-slate-800 dark:text-white leading-tight tracking-tight">活跃贡献图</h2>
          <p class="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.2em] mt-1.5 opacity-60">Activity Pulse</p>
        </div>
      </div>

      <!-- Combined Controls -->
      <div class="flex flex-wrap items-center gap-4">
        <!-- Year Selector -->
        <div class="flex p-1.5 bg-slate-100/60 dark:bg-slate-900/40 rounded-[1.25rem] border border-slate-200/50 dark:border-slate-700/50">
          <button 
            @click="selectedYear = 'rolling'"
            class="px-4 py-2 rounded-xl text-[11px] font-black transition-all duration-300"
            :class="selectedYear === 'rolling' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-md ring-1 ring-black/5' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'"
          >
            最近一年
          </button>
          <button 
            v-for="year in availableYears" 
            :key="year"
            @click="selectedYear = year"
            class="px-4 py-2 rounded-xl text-[11px] font-black transition-all duration-300"
            :class="selectedYear === year ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-md ring-1 ring-black/5' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'"
          >
            {{ year }}
          </button>
        </div>

        <button 
          @click="isCollapsed = !isCollapsed"
          class="p-3.5 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800 text-slate-400 transition-all duration-500 hover:shadow-lg active:scale-95 group"
        >
          <svg class="w-5 h-5 transition-transform duration-700 cubic-bezier(0.34, 1.56, 0.64, 1) group-hover:text-primary" :class="{ 'rotate-180': isCollapsed }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>
      </div>
    </div>

    <!-- Main Content Area: Centered Grid -->
    <div 
      class="grid-container transition-all duration-700 ease-in-out w-full"
      :class="isCollapsed ? 'max-h-0 opacity-0 overflow-hidden' : 'max-h-[800px] opacity-100 overflow-visible'"
    >
      <div class="flex w-full items-start px-2">
        <!-- Y-Axis: Day Labels -->
        <div class="flex flex-col day-labels-col shrink-0 text-right pr-5 select-none pt-12">
          <span v-for="day in ['一', '二', '三', '四', '五', '六', '日']" :key="day" class="day-label font-black text-slate-400/50 dark:text-slate-500/40 uppercase tracking-tighter">
            {{ day }}
          </span>
        </div>

        <!-- Heatmap Grid -->
        <div class="flex-1 overflow-x-auto custom-scrollbar pt-12 pb-20">
          <div class="flex heatmap-grid w-max relative">
            <div v-for="(week, weekIndex) in heatmapData" :key="weekIndex" class="flex flex-col heatmap-week relative">
              
              <!-- X-Axis: Month Labels -->
              <div 
                v-if="week[0].isMonthStart" 
                class="absolute -top-9 left-0 text-[11px] font-black uppercase tracking-widest whitespace-nowrap px-3 py-1.5 rounded-xl border transition-all duration-500 shadow-sm"
                :class="week[0].isYearStart 
                  ? 'bg-primary/20 text-primary border-primary/40 scale-105 z-10 shadow-primary/20 ring-2 ring-primary/10' 
                  : 'bg-slate-50/50 dark:bg-slate-700/20 text-slate-500 dark:text-slate-400 border-slate-200/30 dark:border-slate-600/20'"
              >
                {{ week[0].monthLabel }}
              </div>

              <!-- Cells -->
              <div
                v-for="(day, dayIndex) in week"
                :key="day.date"
                class="heatmap-cell rounded-[4px] sm:rounded-[5px] md:rounded-[6.5px] relative group/cell transition-all duration-500 hover:z-50"
                :class="day.count[activeCategory === 'all' ? 'total' : activeCategory] === 0 ? 'bg-slate-100/80 dark:bg-slate-700/40 hover:bg-slate-200 dark:hover:bg-slate-600/60' : ''"
                :style="getCellStyle(day)"
              >
                <!-- Smart Tooltip -->
                <div 
                  class="absolute w-52 px-5 py-4.5 bg-slate-900/98 backdrop-blur-3xl text-white text-[11px] rounded-[1.5rem] opacity-0 scale-90 invisible group-hover/cell:opacity-100 group-hover/cell:scale-100 group-hover/cell:visible transition-all duration-300 pointer-events-none z-[100] shadow-[0_25px_60px_rgba(0,0,0,0.5)] ring-1 ring-white/10"
                  :class="[
                    dayIndex <= 3 ? 'top-full mt-4' : 'bottom-full mb-4',
                    weekIndex < 4 ? 'left-0 translate-x-0' : (weekIndex > heatmapData.length - 4 ? 'right-0 translate-x-0' : 'left-1/2 -translate-x-1/2')
                  ]"
                >
                  <div class="font-black border-b border-white/10 pb-3 mb-3.5 flex justify-between items-center text-white/90 tracking-wide text-[13px]">
                    <span>{{ day.dateDisplay }}</span>
                    <span v-if="day.count.total > 0" class="px-3 py-1.5 rounded-xl bg-white/10 text-[12px] font-black">{{ day.count.total }}</span>
                  </div>
                  
                  <div v-if="day.count.total > 0" class="space-y-3">
                    <div v-if="day.count.notes" class="flex justify-between items-center"><span class="flex items-center gap-3.5"><div class="w-2.5 h-2.5 rounded-full shadow-[0_0_12px_#6366f1]" style="background: #6366f1"></div>学习笔记</span> <span class="font-black">{{ day.count.notes }}</span></div>
                    <div v-if="day.count.journals" class="flex justify-between items-center"><span class="flex items-center gap-3.5"><div class="w-2.5 h-2.5 rounded-full shadow-[0_0_12px_#a855f7]" style="background: #a855f7"></div>个志日志</span> <span class="font-black">{{ day.count.journals }}</span></div>
                    <div v-if="day.count.todos" class="flex justify-between items-center"><span class="flex items-center gap-3.5"><div class="w-2.5 h-2.5 rounded-full shadow-[0_0_12px_#10b981]" style="background: #10b981"></div>任务巡航</span> <span class="font-black">{{ day.count.todos }}</span></div>
                    <div v-if="day.count.hobbies" class="flex justify-between items-center"><span class="flex items-center gap-3.5"><div class="w-2.5 h-2.5 rounded-full shadow-[0_0_12px_#f59e0b]" style="background: #f59e0b"></div>生活爱好</span> <span class="font-black">{{ day.count.hobbies }}</span></div>
                  </div>
                  <div v-else class="text-slate-500 italic py-1.5 text-center font-bold text-[12px] tracking-widest">CALM DAY</div>

                  <!-- Dynamic Arrow -->
                  <div 
                    class="absolute border-[9px] border-transparent"
                    :class="[
                       dayIndex <= 3 ? 'bottom-full border-b-slate-900/98' : 'top-full border-t-slate-900/98',
                       weekIndex < 4 ? 'left-2 translate-x-0' : (weekIndex > heatmapData.length - 4 ? 'right-2 translate-x-0' : 'left-1/2 -translate-x-1/2')
                    ]"
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

interface DayCount {
  [key: string]: number;
  notes: number;
  journals: number;
  todos: number;
  hobbies: number;
  total: number;
}

const props = defineProps<{
  activities: Record<string, DayCount>
  activeCategory: keyof DayCount | 'all'
}>()

const isCollapsed = ref(false)
const selectedYear = ref<'rolling' | number>('rolling')

const categories = [
  { id: 'all', name: '全向巡航', color: '' },
  { id: 'notes', name: '笔记', color: '#6366f1' },
  { id: 'journals', name: '日志', color: '#a855f7' },
  { id: 'todos', name: '任务', color: '#10b981' },
  { id: 'hobbies', name: '爱好', color: '#f59e0b' }
]

// Extract historical years from activity data
const availableYears = computed(() => {
  const years = new Set<number>()
  Object.keys(props.activities).forEach(date => {
    years.add(dayjs(date).year())
  })
  return Array.from(years).sort((a, b) => b - a)
})

const heatmapData = computed(() => {
  const weeks = []
  let currentWeek = []
  
  let startDate, endDate
  
  if (selectedYear.value === 'rolling') {
    endDate = dayjs()
    startDate = dayjs().subtract(52, 'week').startOf('week')
  } else {
    // Fixed calendar year: Jan 1 to Dec 31
    startDate = dayjs(`${selectedYear.value}-01-01`).startOf('week')
    endDate = dayjs(`${selectedYear.value}-12-31`)
  }
  
  let current = startDate
  let lastMonth = -1
  let lastYear = startDate.year()

  while (current.isBefore(endDate) || current.isSame(endDate, 'day')) {
    const dateStr = current.format('YYYY-MM-DD')
    const data = props.activities[dateStr] || { notes: 0, journals: 0, todos: 0, hobbies: 0, total: 0 }
    
    const isFirstRow = currentWeek.length === 0
    const currentMonth = current.month()
    const currentYear = current.year()
    
    let isMonthStart = false
    let isYearStart = false
    let monthLabel = ''

    if (isFirstRow && currentMonth !== lastMonth) {
      isMonthStart = true
      if (currentYear !== lastYear) {
        isYearStart = true
        lastYear = currentYear
      }
      monthLabel = current.format('YYYY年M月')
      lastMonth = currentMonth
    }

    currentWeek.push({
      date: dateStr,
      dateDisplay: current.format('YYYY年MM月DD日'),
      isMonthStart,
      isYearStart,
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
    const catData = [
      { id: 'notes', val: day.count.notes, col: '#6366f1' },
      { id: 'journals', val: day.count.journals, col: '#a855f7' },
      { id: 'todos', val: day.count.todos, col: '#10b981' },
      { id: 'hobbies', val: day.count.hobbies, col: '#f59e0b' }
    ]
    const dominant = catData.reduce((max, c) => c.val > max.val ? c : max, catData[0])
    targetColor = dominant.col
  }
  
  const intensity = Math.min(0.3 + (currentCount * 0.1), 1)
  
  return {
    backgroundColor: targetColor,
    opacity: intensity,
    boxShadow: currentCount > 3 ? `0 0 20px ${targetColor}60` : 'none',
    transform: `scale(${isCollapsed.value ? 0.85 : 1})`
  }
}
</script>

<style scoped>
/* Synchronization via CSS Variables */
.activity-heatmap {
  --cell-size: 14px;
  --cell-gap: 6px;
  --label-font-size: 10px;
}

@media (min-width: 640px) {
  .activity-heatmap {
    --cell-size: 18px;
    --cell-gap: 8px;
    --label-font-size: 11px;
  }
}

@media (min-width: 1024px) {
  .activity-heatmap {
    --cell-size: 22px;
    --cell-gap: 10px;
    --label-font-size: 12px;
  }
}

.day-label {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  height: var(--cell-size);
  margin-bottom: var(--cell-gap);
  font-size: var(--label-font-size);
}

.day-label:last-child {
  margin-bottom: 0;
}

.heatmap-week {
  gap: var(--cell-gap);
  margin-right: var(--cell-gap);
}

.heatmap-cell {
  width: var(--cell-size);
  height: var(--cell-size);
}

.custom-scrollbar::-webkit-scrollbar {
  height: 8px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0,0,0,0.06);
  border-radius: 20px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.08);
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--primary-rgb), 0.2);
}

.grid-container {
  overflow: visible;
}
</style>
