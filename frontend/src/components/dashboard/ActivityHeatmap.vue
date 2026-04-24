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
    class="grid-container transition-all duration-700 ease-in-out w-full max-h-[800px] opacity-100 overflow-visible relative"
    >
      <!-- Shared Floating Tooltip -->
      <Transition name="tooltip-fade">
        <div 
          v-if="hoveredDayData"
          class="absolute px-5 py-4.5 bg-slate-900/80 backdrop-blur-2xl text-white text-[11px] rounded-[1.5rem] pointer-events-none z-[100] shadow-[0_25px_60px_rgba(0,0,0,0.6)] ring-1 ring-white/20 w-64"
          :style="tooltipStyle"
        >
          <div class="font-black border-b border-white/10 pb-3 mb-3.5 flex justify-between items-center text-white/90 tracking-wide text-[13px]">
            <span>{{ hoveredDayData.dateDisplay }}</span>
            <span 
              v-if="hoveredDayData.count.total > 0" 
              class="px-3 py-1.5 rounded-xl text-[12px] font-black transition-colors duration-500"
              :style="{ 
                backgroundColor: props.activeCategory === 'all' ? 'rgba(255,255,255,0.1)' : `${currentCategoryInfo.color}30`,
                color: props.activeCategory === 'all' ? 'white' : currentCategoryInfo.color 
              }"
            >
              {{ props.activeCategory === 'all' ? hoveredDayData.count.total : hoveredDayData.count[props.activeCategory] }}
            </span>
          </div>
          
          <!-- Detailed Title List for Specific Categories -->
          <div v-if="props.activeCategory !== 'all' && hoveredDayData.count.total > 0" class="mt-4 space-y-2.5 max-h-[300px] overflow-hidden">
            <template v-if="hoveredDayData.count[props.activeCategory + '_list']">
              <div 
                v-for="(title, idx) in hoveredDayData.count[props.activeCategory + '_list'].slice(0, 10)" 
                :key="idx"
                class="flex items-start gap-3 text-[11px] leading-relaxed group/item"
              >
                <div class="mt-1 w-1.5 h-1.5 rounded-full shrink-0 transition-transform duration-300 group-hover/item:scale-125" :style="{ backgroundColor: currentCategoryInfo.color, boxShadow: `0 0 8px ${currentCategoryInfo.color}80` }"></div>
                <span class="text-white/80 line-clamp-2">{{ title }}</span>
              </div>
              
              <!-- Indicator for more items -->
              <div 
                v-if="hoveredDayData.count[props.activeCategory + '_list'].length > 10"
                class="pt-2 flex items-center justify-center border-t border-white/5 mt-2"
              >
                <div class="px-2.5 py-1 rounded-lg bg-white/5 text-[9px] font-black uppercase tracking-widest text-white/40">
                  + {{ hoveredDayData.count[props.activeCategory + '_list'].length - 10 }} More Items
                </div>
              </div>
            </template>
            <div v-else-if="hoveredDayData.count[props.activeCategory] === 0" class="text-slate-500 italic py-1 text-center font-bold text-[10px] uppercase tracking-widest">
              No {{ currentCategoryInfo.name }}
            </div>
            <div v-else class="flex items-start gap-3 text-[11px] leading-relaxed group/item">
              <div class="mt-1 w-1.5 h-1.5 rounded-full shrink-0 transition-transform duration-300 group-hover/item:scale-125" :style="{ backgroundColor: currentCategoryInfo.color, boxShadow: `0 0 8px ${currentCategoryInfo.color}80` }"></div>
              <span class="text-white/80 line-clamp-2">{{ currentCategoryInfo.name }} +{{ hoveredDayData.count[props.activeCategory] }}</span>
            </div>
          </div>

          <!-- Summary View for 'All' Category -->
          <div v-if="props.activeCategory === 'all' && hoveredDayData.count.total > 0" class="space-y-3">
            <div v-if="hoveredDayData.count.notes" class="flex justify-between items-center"><span class="flex items-center gap-3.5"><div class="w-2.5 h-2.5 rounded-full shadow-[0_0_12px_#6366f1]" style="background: #6366f1"></div>学习笔记</span> <span class="font-black">{{ hoveredDayData.count.notes }}</span></div>
            <div v-if="hoveredDayData.count.journals" class="flex justify-between items-center"><span class="flex items-center gap-3.5"><div class="w-2.5 h-2.5 rounded-full shadow-[0_0_12px_#a855f7]" style="background: #a855f7"></div>个人日志</span> <span class="font-black">{{ hoveredDayData.count.journals }}</span></div>
            <div v-if="hoveredDayData.count.checkins" class="flex justify-between items-center"><span class="flex items-center gap-3.5"><div class="w-2.5 h-2.5 rounded-full shadow-[0_0_12px_#06b6d4]" style="background: #06b6d4"></div>每日打卡</span> <span class="font-black">{{ hoveredDayData.count.checkins }}</span></div>
            <div v-if="hoveredDayData.count.schedules" class="flex justify-between items-center"><span class="flex items-center gap-3.5"><div class="w-2.5 h-2.5 rounded-full shadow-[0_0_12px_#0ea5e9]" style="background: #0ea5e9"></div>日程计划</span> <span class="font-black">{{ hoveredDayData.count.schedules }}</span></div>
            <div v-if="hoveredDayData.count.todos" class="flex justify-between items-center"><span class="flex items-center gap-3.5"><div class="w-2.5 h-2.5 rounded-full shadow-[0_0_12px_#10b981]" style="background: #10b981"></div>任务完成</span> <span class="font-black">{{ hoveredDayData.count.todos }}</span></div>
            <div v-if="hoveredDayData.count.hobbies" class="flex justify-between items-center"><span class="flex items-center gap-3.5"><div class="w-2.5 h-2.5 rounded-full shadow-[0_0_12px_#3b82f6]" style="background: #3b82f6"></div>生活爱好</span> <span class="font-black">{{ hoveredDayData.count.hobbies }}</span></div>
          </div>
          
          <div v-if="hoveredDayData.count.total === 0" class="text-slate-500 italic py-1.5 text-center font-bold text-[12px] tracking-widest uppercase">Calm Day</div>

          <!-- Dynamic Arrow -->
          <div 
            class="absolute border-[9px] border-transparent"
            :class="tooltipArrowClass"
          ></div>
        </div>
      </Transition>

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
          <div class="flex heatmap-grid w-max relative" @mouseleave="hoveredDayData = null">
            <div 
              v-for="(week, weekIndex) in heatmapData" 
              :key="weekIndex" 
              v-memo="[week, props.activeCategory, props.selectedDate, hoveredRow, hoveredMonth]"
              class="flex flex-col heatmap-week relative"
            >
              
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
                @click="$emit('day-click', day.date === props.selectedDate ? null : day.date)"
                @mouseenter="handleMouseEnter($event, day, dayIndex, weekIndex)"
                :id="day.date === dayjs().format('YYYY-MM-DD') ? 'today-cell' : ''"
                class="heatmap-cell rounded-[4px] sm:rounded-[5px] md:rounded-[6.5px] relative group/cell transition-all duration-500 hover:z-50 cursor-pointer hover:scale-110 hover:brightness-110 hover:ring-2 hover:ring-white/30"
                :class="[
                  // Only add grey bg for truly empty days (no inline backgroundColor set)
                  !day.style.backgroundColor ? 'bg-slate-100/80 dark:bg-slate-700/40 hover:bg-slate-200 dark:hover:bg-slate-600/60' : '',
                  day.date === props.selectedDate ? 'ring-2 ring-primary ring-offset-2 dark:ring-offset-slate-800 scale-110 z-20' : '',
                  (hoveredRow === dayIndex || hoveredMonth === day.monthKey) ? 'ring-4 ring-sky-400 z-10 scale-[1.08] !opacity-100 shadow-[0_0_25px_rgba(14,165,233,0.6)] !bg-sky-400/20' : ''
                ]"
                :style="day.style"
              >
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
  
  let startDate: dayjs.Dayjs, endDate: dayjs.Dayjs
  
  if (selectedYear.value === 'rolling') {
    endDate = dayjs().add(6, 'month') 
    startDate = dayjs().subtract(6, 'month').startOf('month').startOf('week')
  } else {
    // Year view: show only that calendar year (Jan 1 → Dec 31)
    startDate = dayjs(`${selectedYear.value}-01-01`).startOf('week')
    endDate = dayjs(`${selectedYear.value}-12-31`)
  }
  
  const todayStr = dayjs().format('YYYY-MM-DD')
  const activeCat = props.activeCategory === 'all' ? 'total' : props.activeCategory
  const categoryConfig = categories.find(c => c.id === props.activeCategory)
  const baseTargetColor = categoryConfig?.color || '#f59e0b'

  let current = startDate
  let lastMonth = -1
  let lastYear = startDate.year()
  let weeksSinceLastLabel = 10 

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

    if (isFirstRow && currentMonth !== lastMonth && weeksSinceLastLabel >= 2) {
      isMonthStart = true
      if (currentYear !== lastYear) {
        isYearStart = true
        lastYear = currentYear
      }
      monthLabel = isYearStart ? current.format('YYYY年M月') : current.format('M月')
      lastMonth = currentMonth
      weeksSinceLastLabel = 0
    }

    // --- Pre-calculate Styles for Performance ---
    const isFuture = current.isAfter(dayjs(), 'day')
    let intensityValue = data[activeCat]
    if (props.activeCategory === 'all') {
      intensityValue = data.total - (data.checkins || 0)
    }

    let targetColor = baseTargetColor
    if (isFuture) {
      targetColor = '#64748b' 
      if (data.schedules > 0) targetColor = '#0ea5e9'
    }

    const intensity = Math.min(0.2 + (intensityValue * 0.15), 1)
    const showSchedules = props.activeCategory === 'all' || props.activeCategory === 'schedules'
    const showCheckins = props.activeCategory === 'all' || props.activeCategory === 'checkins'
    const hasContentToFill = intensityValue > 0 || (isFuture && data.schedules > 0 && showSchedules)

    const cellStyle = {
      backgroundColor: hasContentToFill ? targetColor : undefined,
      opacity: hasContentToFill ? intensity : undefined,
      boxShadow: (hasContentToFill && intensityValue > 3) ? `0 0 20px ${targetColor}60` : undefined,
      border: (isFuture && showSchedules) ? '1px dashed rgba(148, 163, 184, 0.4)' : 'none',
      ...(showCheckins && (data.checkins > 0 || (dateStr === todayStr && props.todayCheckedIn)) ? {
        outline: '2.5px solid #f59e0b',
        outlineOffset: '2px',
        boxShadow: `0 0 15px #f59e0b90, ${(hasContentToFill && intensityValue > 3) ? `0 0 20px ${targetColor}60` : '0 0 0 transparent'}`,
        zIndex: 10
      } : {})
    }

    currentWeek.push({
      date: dateStr,
      dateDisplay: current.format('YYYY年MM月DD日'),
      isMonthStart,
      isYearStart,
      monthLabel,
      monthKey: current.format('YYYY-M'),
      count: data,
      style: cellStyle
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

// Shared Tooltip State
const hoveredDayData = ref<any>(null)
const tooltipStyle = ref({ top: '0px', left: '0px', opacity: '0', transform: 'scale(0.9) translateX(-50%)' })
const tooltipArrowClass = ref('')

let throttleTimeout: any = null
const handleMouseEnter = (event: MouseEvent, day: any, dayIndex: number, weekIndex: number) => {
  if (throttleTimeout) return
  
  throttleTimeout = setTimeout(() => {
    throttleTimeout = null
  }, 16) // ~60fps throttle

  hoveredDayData.value = day
  
  const cell = event.currentTarget as HTMLElement
  const container = cell.closest('.grid-container') as HTMLElement
  if (!cell || !container) return

  const cellRect = cell.getBoundingClientRect()
  const containerRect = container.getBoundingClientRect()

  const top = cellRect.top - containerRect.top
  const left = cellRect.left - containerRect.left + (cellRect.width / 2)

  const isInTopHalf = dayIndex <= 3
  const isInStartWeeks = weekIndex < 4
  const isInEndWeeks = weekIndex > heatmapData.value.length - 4

  const translateX = isInStartWeeks ? 'translateX(0)' : (isInEndWeeks ? 'translateX(-100%)' : 'translateX(-50%)')
  const translateY = isInTopHalf ? 'translateY(0)' : 'translateY(-100%)'

  tooltipStyle.value = {
    top: isInTopHalf ? `${top + cellRect.height + 15}px` : `${top - 15}px`,
    left: `${left}px`,
    opacity: '1',
    transform: `scale(1) ${translateX} ${translateY}`
  }

  tooltipArrowClass.value = [
    isInTopHalf ? 'bottom-full -translate-y-[1px] border-b-slate-900/98' : 'top-full translate-y-[1px] border-t-slate-900/98',
    isInStartWeeks ? 'left-4' : (isInEndWeeks ? 'right-4' : 'left-1/2 -translate-x-1/2')
  ].join(' ')
}

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

// Only scroll to today when the user explicitly switches year — not on every data refresh.
// Listening to heatmapData was causing the viewport to jump back to today whenever
// the activities prop updated (e.g. after completing a todo).
watch(selectedYear, () => {
  scrollToToday()
})

// Tooltip positioning is now much simpler and pre-calculated logic in style helps
// remove the need for getCellStyle entirely
const getCellStyle = null; // Mark for removal or just don't define
</script>

<style scoped>
/* Tooltip Animation */
.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(5px) !important;
}

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
