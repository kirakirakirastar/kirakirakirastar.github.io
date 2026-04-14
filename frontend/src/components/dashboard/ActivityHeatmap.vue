<template>
  <div class="activity-heatmap bg-white/70 dark:bg-slate-800/80 backdrop-blur-md rounded-[2.5rem] p-6 sm:p-10 border border-white/60 dark:border-slate-700/60 shadow-xl transition-all duration-500 overflow-visible relative">
    
    <!-- Header: Full Width -->
    <div class="flex flex-wrap items-center justify-between gap-6 mb-8 w-full px-2" :style="{ color: currentCategoryInfo.color }">
      <div class="flex items-center gap-4">
        <div 
          class="p-3.5 rounded-2xl transition-all duration-500 shadow-inner ring-1 ring-white/20"
          :style="{ backgroundColor: currentCategoryInfo.id === 'all' ? 'var(--primary-light)' : `${currentCategoryInfo.color}20`, color: currentCategoryInfo.color || 'var(--primary)' }"
        >
          <component :is="currentCategoryInfo.icon" class="w-6 h-6" />
        </div>
        <div>
          <h2 class="text-2xl font-black leading-tight tracking-tight transition-colors duration-500" :style="{ color: currentCategoryInfo.id === 'all' ? 'inherit' : currentCategoryInfo.color }">
            {{ currentCategoryInfo.name }}贡献图
          </h2>
          <p class="text-[11px] font-bold uppercase tracking-[0.2em] mt-1.5 opacity-60">
            {{ currentCategoryInfo.id === 'all' ? 'Activity Pulse' : `${currentCategoryInfo.id.toUpperCase()} PULSE` }}
          </p>
        </div>
      </div>

      <!-- Combined Controls -->
      <div class="flex flex-wrap items-center gap-4">
        <!-- Year Selector -->
        <div class="flex p-1.5 bg-slate-100/60 dark:bg-slate-900/40 rounded-[1.25rem] border border-slate-200/50 dark:border-slate-700/50">
          <button 
            @click.stop="selectedYear = 'rolling'"
            class="px-4 py-2 rounded-xl text-[11px] font-black transition-all duration-300"
            :class="selectedYear === 'rolling' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-md ring-1 ring-black/5' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'"
          >
            最近一年
          </button>
          <button 
            v-for="year in availableYears" 
            :key="year"
            @click.stop="selectedYear = year"
            class="px-4 py-2 rounded-xl text-[11px] font-black transition-all duration-300"
            :class="selectedYear === year ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-md ring-1 ring-black/5' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'"
          >
            {{ year }}
          </button>
        </div>


      </div>
    </div>

    <!-- Main Content Area: Centered Grid -->
    <div 
    class="grid-container transition-all duration-700 ease-in-out w-full max-h-[800px] opacity-100 overflow-visible"
    >
      <div class="flex w-full items-start px-2">
        <div class="flex flex-col day-labels-col shrink-0 text-right pr-5 select-none pt-12" @mouseleave="hoveredRow = null">
          <span 
            v-for="(day, index) in ['一', '二', '三', '四', '五', '六', '日']" 
            :key="day" 
            class="day-label font-black text-slate-400/50 dark:text-slate-500/40 uppercase tracking-tighter transition-all duration-300"
            :class="{ 'text-primary dark:text-sky-400 scale-125 !opacity-100 drop-shadow-[0_0_8px_rgba(14,165,233,0.3)]': hoveredRow === index }"
            @mouseenter="hoveredRow = index"
          >
            {{ day }}
          </span>
        </div>

        <!-- Heatmap Grid -->
        <div ref="scrollContainer" class="flex-1 overflow-x-auto custom-scrollbar pt-12 pb-20 scroll-smooth">
          <div class="flex heatmap-grid w-max relative">
            <div v-for="(week, weekIndex) in heatmapData" :key="weekIndex" class="flex flex-col heatmap-week relative">
              
              <!-- X-Axis: Month Labels -->
              <div 
                v-if="week[0].isMonthStart" 
                class="absolute -top-9 left-0 text-[11px] font-black uppercase tracking-widest whitespace-nowrap px-3 py-1.5 rounded-xl border transition-all duration-500 shadow-sm cursor-help select-none"
                :class="[
                  week[0].isYearStart 
                    ? 'bg-primary/20 text-primary border-primary/40 scale-105 z-10 shadow-primary/20 ring-2 ring-primary/10' 
                    : 'bg-slate-50/50 dark:bg-slate-700/20 text-slate-500 dark:text-slate-400 border-slate-200/30 dark:border-slate-600/20',
                  hoveredMonth === week[0].monthKey ? 'scale-110 ring-4 ring-sky-400/30 !bg-sky-400/10 !text-sky-500 !border-sky-400/50 z-20' : ''
                ]"
                @mouseenter="hoveredMonth = week[0].monthKey"
                @mouseleave="hoveredMonth = null"
              >
                {{ week[0].monthLabel }}
              </div>

              <!-- Cells -->
              <div
                v-for="(day, dayIndex) in week"
                :key="day.date"
                @click="$emit('day-click', day.date === selectedDate ? null : day.date)"
                :id="day.date === dayjs().format('YYYY-MM-DD') ? 'today-cell' : ''"
                class="heatmap-cell rounded-[4px] sm:rounded-[5px] md:rounded-[6.5px] relative group/cell transition-all duration-500 hover:z-50 cursor-pointer"
                :class="[
                  day.count[props.activeCategory === 'all' ? 'total' : props.activeCategory] === 0 ? 'bg-slate-100/80 dark:bg-slate-700/40 hover:bg-slate-200 dark:hover:bg-slate-600/60' : '',
                  day.date === selectedDate ? 'ring-2 ring-primary ring-offset-2 dark:ring-offset-slate-800 scale-110 z-20' : '',
                  (hoveredRow === dayIndex || hoveredMonth === day.monthKey) ? 'ring-4 ring-sky-400 z-10 scale-[1.08] !opacity-100 shadow-[0_0_25px_rgba(14,165,233,0.6)] !bg-sky-400/20' : ''
                ]"
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
                    <div v-if="day.count.journals" class="flex justify-between items-center"><span class="flex items-center gap-3.5"><div class="w-2.5 h-2.5 rounded-full shadow-[0_0_12px_#a855f7]" style="background: #a855f7"></div>个人日志</span> <span class="font-black">{{ day.count.journals }}</span></div>
                    <div v-if="day.count.checkins" class="flex justify-between items-center"><span class="flex items-center gap-3.5"><div class="w-2.5 h-2.5 rounded-full shadow-[0_0_12px_#06b6d4]" style="background: #06b6d4"></div>每日打卡</span> <span class="font-black">{{ day.count.checkins }}</span></div>
                    <div v-if="day.count.schedules" class="flex justify-between items-center"><span class="flex items-center gap-3.5"><div class="w-2.5 h-2.5 rounded-full shadow-[0_0_12px_#0ea5e9]" style="background: #0ea5e9"></div>日程计划</span> <span class="font-black">{{ day.count.schedules }}</span></div>
                    <div v-if="day.count.todos" class="flex justify-between items-center"><span class="flex items-center gap-3.5"><div class="w-2.5 h-2.5 rounded-full shadow-[0_0_12px_#10b981]" style="background: #10b981"></div>任务完成</span> <span class="font-black">{{ day.count.todos }}</span></div>
                    <div v-if="day.count.hobbies" class="flex justify-between items-center"><span class="flex items-center gap-3.5"><div class="w-2.5 h-2.5 rounded-full shadow-[0_0_12px_#3b82f6]" style="background: #3b82f6"></div>生活爱好</span> <span class="font-black">{{ day.count.hobbies }}</span></div>
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
import { ref, computed, defineComponent, h, onMounted, nextTick, watch } from 'vue'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'

dayjs.locale('zh-cn')

const IconNotes = defineComponent({ render: () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24', strokeWidth: '2' }, [h('path', { d: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4', strokeLinecap: 'round', strokeLinejoin: 'round' })]) })
const IconJournals = defineComponent({ render: () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24', strokeWidth: '2' }, [h('path', { d: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', strokeLinecap: 'round', strokeLinejoin: 'round' })]) })
const IconTodos = defineComponent({ render: () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24', strokeWidth: '2' }, [h('path', { d: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4', strokeLinecap: 'round', strokeLinejoin: 'round' })]) })
const IconHobbies = defineComponent({ render: () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24', strokeWidth: '2' }, [h('path', { d: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z', strokeLinecap: 'round', strokeLinejoin: 'round' })]) })
const IconActivity = defineComponent({ render: () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24', strokeWidth: '2' }, [h('path', { d: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', strokeLinecap: 'round', strokeLinejoin: 'round' })]) })

interface DayCount {
  [key: string]: number;
  notes: number;
  journals: number;
  todos: number;
  hobbies: number;
  checkins: number; 
  schedules: number; // Added
  total: number;
}

const props = defineProps<{
  activities: Record<string, DayCount>
  activeCategory: keyof DayCount | 'all'
  selectedDate?: string | null
  todayCheckedIn?: boolean
}>()

const emit = defineEmits<{
  (e: 'day-click', date: string | null): void
}>()


const selectedYear = ref<'rolling' | number>('rolling')

const categories = [
  { id: 'all', name: '全域', color: '#f59e0b', icon: IconActivity },
  { id: 'notes', name: '学习笔记', color: '#6366f1', icon: IconNotes },
  { id: 'journals', name: '个人日志', color: '#a855f7', icon: IconJournals },
  { id: 'checkins', name: '每日打卡', color: '#06b6d4', icon: IconActivity },
  { id: 'schedules', name: '日程计划', color: '#0ea5e9', icon: IconTodos }, // Added
  { id: 'todos', name: '任务完成', color: '#10b981', icon: IconTodos },
  { id: 'hobbies', name: '爱好条目', color: '#3b82f6', icon: IconHobbies }
]

const currentCategoryInfo = computed(() => {
  return categories.find(c => c.id === props.activeCategory) || categories[0]
})

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
    endDate = dayjs().add(6, 'month') 
    startDate = dayjs().subtract(1, 'year').startOf('month').startOf('week') // Ensure start of month 12 months ago
  } else {
    // Fixed calendar year: Jan 1 to Dec 31
    startDate = dayjs(`${selectedYear.value}-01-01`).startOf('week')
    endDate = dayjs(`${selectedYear.value}-12-31`).add(6, 'month') // Also extend for fixed years to see next year's plans
  }
  
  let current = startDate
  let lastMonth = -1
  let lastYear = startDate.year()
  let weeksSinceLastLabel = 10 // Start with enough buffer

  while (current.isBefore(endDate) || current.isSame(endDate, 'day')) {
    const dateStr = current.format('YYYY-MM-DD')
    const data = props.activities[dateStr] || { notes: 0, journals: 0, todos: 0, hobbies: 0, checkins: 0, schedules: 0, total: 0 }
    
    const isFirstRow = currentWeek.length === 0
    const currentMonth = current.month()
    const currentYear = current.year()
    
    if (isFirstRow) {
      weeksSinceLastLabel++
    }
    
    let isMonthStart = false
    let isYearStart = false
    let monthLabel = ''

    // Only show month label if it's the first time we see this month in the first row
    // AND it's not too close to the previous label (min 2 weeks gap)
    if (isFirstRow && currentMonth !== lastMonth && weeksSinceLastLabel >= 2) {
      isMonthStart = true
      if (currentYear !== lastYear) {
        isYearStart = true
        lastYear = currentYear
      }
      // Formatting change to fix overlap: shorter labels if year is the same
      monthLabel = isYearStart ? current.format('YYYY年M月') : current.format('M月')
      lastMonth = currentMonth
      weeksSinceLastLabel = 0
    }

    currentWeek.push({
      date: dateStr,
      monthKey: current.format('YYYY-M'), // Match the label logic month format
      isMonthStart,
      isYearStart,
      monthLabel,
      monthKey: isMonthStart ? current.format('YYYY-M') : current.format('YYYY-M'), // Ensure every day has a consistent key
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

const hoveredRow = ref<number | null>(null)
const hoveredMonth = ref<string | null>(null)
const scrollContainer = ref<HTMLElement | null>(null)

const scrollToToday = () => {
  nextTick(() => {
    const todayEl = document.getElementById('today-cell')
    if (todayEl && scrollContainer.value) {
      todayEl.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest'
      })
    }
  })
}

onMounted(() => {
  setTimeout(scrollToToday, 500) // Buffer for initial render
})

watch([heatmapData, selectedYear], () => {
  scrollToToday()
})

const getCellStyle = (day: any) => {
  const isFuture = dayjs(day.date).isAfter(dayjs(), 'day')
  const currentCategory = props.activeCategory === 'all' ? 'total' : props.activeCategory
  
  // Logic: Only fill if there's content OTHER than check-ins (unless specifically viewing check-ins)
  let intensityValue = day.count[currentCategory]
  if (props.activeCategory === 'all') {
    intensityValue = day.count.total - (day.count.checkins || 0)
  }

  const currentCount = intensityValue
  const categoryConfig = categories.find(c => c.id === props.activeCategory)
  let targetColor = categoryConfig?.color || '#f59e0b'
  
  // Future dates use a distinct schedule color if schedules exist
  if (isFuture) {
    targetColor = '#64748b' // Standard future color
    if (day.count.schedules > 0) targetColor = '#0ea5e9' // Cyan for plans
  }

  const intensity = Math.min(0.2 + (currentCount * 0.15), 1)
  
  const hasContentToFill = currentCount > 0 || (isFuture && day.count.schedules > 0)

  return {
    ...(hasContentToFill ? {
      backgroundColor: targetColor,
      opacity: intensity,
      boxShadow: currentCount > 3 ? `0 0 20px ${targetColor}60` : 'none',
    } : {}),
    transform: 'scale(1)',
    border: isFuture ? '1px dashed rgba(148, 163, 184, 0.4)' : 'none',
    ...(day.date === dayjs().format('YYYY-MM-DD') && props.todayCheckedIn ? {
      outline: '2.5px solid #f59e0b',
      outlineOffset: '2px',
      boxShadow: `0 0 15px #f59e0b90, ${currentCount > 3 ? `0 0 20px ${targetColor}60` : '0 0 0 transparent'}`,
      zIndex: 10
    } : {})
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
