<template>
  <div class="bg-white/70 dark:bg-slate-800/80 backdrop-blur-md rounded-[2.5rem] p-6 border border-white/60 dark:border-slate-700/60 shadow-sm overflow-hidden transition-all duration-500">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
      <div class="flex items-center gap-3">
        <div class="p-2.5 rounded-2xl bg-primary/10 text-primary">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
        </div>
        <div>
          <h2 class="text-xl font-bold text-slate-800 dark:text-white leading-tight">活跃贡献图</h2>
          <p class="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mt-0.5">记录每一个灵感瞬间</p>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <!-- Category Toggles -->
        <div class="flex p-1 bg-slate-100/50 dark:bg-slate-900/40 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
          <button 
            v-for="cat in categories" 
            :key="cat.id"
            @click="activeCategory = cat.id"
            class="px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-300 flex items-center gap-2"
            :class="activeCategory === cat.id ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'"
          >
            <div v-if="cat.color" class="w-1.5 h-1.5 rounded-full" :style="{ backgroundColor: cat.color }"></div>
            {{ cat.name }}
          </button>
        </div>

        <!-- Collapse Toggle -->
        <button 
          @click="isCollapsed = !isCollapsed"
          class="p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 Transition-all duration-300"
          :title="isCollapsed ? '展开' : '折叠'"
        >
          <svg class="w-4 h-4 transition-transform duration-500" :class="{ 'rotate-180': isCollapsed }" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
        </button>
      </div>
    </div>

    <!-- Heatmap Grid Container -->
    <div 
      class="grid-transition overflow-hidden"
      :style="{ maxHeight: isCollapsed ? '0px' : '300px', opacity: isCollapsed ? 0 : 1 }"
    >
      <div class="flex mt-2">
        <!-- Day Labels (Vertical) -->
        <div class="flex flex-col justify-between py-1.5 pr-3 text-[9px] font-bold text-slate-400 select-none uppercase tracking-tighter h-[115px] sm:h-[133px]">
          <span></span>
          <span>周一</span>
          <span></span>
          <span>周三</span>
          <span></span>
          <span>周五</span>
          <span></span>
        </div>

        <div class="flex-1 relative overflow-x-auto custom-scrollbar pb-4 pt-6">
          <!-- Month Labels (Horizontal) -->
          <div class="absolute top-0 left-0 flex gap-1.5 select-none pointer-events-none">
            <div 
              v-for="(label, idx) in monthLabels" 
              :key="idx"
              class="text-[9px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap"
              :style="{ marginLeft: label.offset + 'px' }"
            >
              {{ label.text }}
            </div>
          </div>

          <div class="flex gap-1 sm:gap-1.5 w-max">
            <div v-for="(week, weekIndex) in heatmapData" :key="weekIndex" class="flex flex-col gap-1 sm:gap-1.5">
              <div
                v-for="(day, dayIndex) in week"
                :key="dayIndex"
                class="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-[3.5px] sm:rounded-[4.5px] relative group/cell transition-all duration-500 overflow-visible"
                :class="day.count[activeCategory === 'all' ? 'total' : activeCategory] === 0 ? 'bg-slate-100/80 dark:bg-slate-700/30' : ''"
                :style="getCellStyle(day)"
              >
                <!-- Tooltip -->
                <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-36 px-3.5 py-2.5 bg-slate-900/95 backdrop-blur-md text-white text-[10px] rounded-2xl opacity-0 scale-90 invisible group-hover/cell:opacity-100 group-hover/cell:scale-100 group-hover/cell:visible transition-all duration-300 pointer-events-none z-50 shadow-2xl border border-white/10 ring-1 ring-black/5">
                  <div class="font-bold border-b border-white/10 pb-1.5 mb-1.5 flex justify-between items-center text-white/90">
                    <span>{{ day.dateLabel }}</span>
                    <span v-if="day.count.total > 0" class="px-1.5 py-0.5 rounded-md bg-white/10 text-[8px] font-black">{{ day.count.total }} 总计</span>
                  </div>
                  <div v-if="day.count.total > 0" class="space-y-1">
                    <div v-if="day.count.notes" class="flex justify-between items-center"><span class="flex items-center gap-1.5"><div class="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>笔记</span> <span class="font-black">{{ day.count.notes }}</span></div>
                    <div v-if="day.count.journals" class="flex justify-between items-center"><span class="flex items-center gap-1.5"><div class="w-1.5 h-1.5 rounded-full bg-purple-400"></div>日志</span> <span class="font-black">{{ day.count.journals }}</span></div>
                    <div v-if="day.count.todos" class="flex justify-between items-center"><span class="flex items-center gap-1.5"><div class="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>待办</span> <span class="font-black">{{ day.count.todos }}</span></div>
                    <div v-if="day.count.hobbies" class="flex justify-between items-center"><span class="flex items-center gap-1.5"><div class="w-1.5 h-1.5 rounded-full bg-amber-400"></div>爱好</span> <span class="font-black">{{ day.count.hobbies }}</span></div>
                  </div>
                  <div v-else class="text-slate-400/80 italic py-1">当日无活动</div>
                  <div class="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900/95"></div>
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
import { ref, computed, onMounted } from 'vue'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'

dayjs.locale('zh-cn')

const props = defineProps<{
  activities: Record<string, { notes: number, journals: number, todos: number, hobbies: number, total: number }>
}>()

const isCollapsed = ref(false)
const activeCategory = ref('all')

const categories = [
  { id: 'all', name: '全能', color: '' },
  { id: 'notes', name: '笔记', color: '#6366f1' },
  { id: 'journals', name: '日志', color: '#a855f7' },
  { id: 'todos', name: '待办', color: '#10b981' },
  { id: 'hobbies', name: '爱好', color: '#f59e0b' }
]

const heatmapData = computed(() => {
  const weeks = []
  let currentWeek = []
  
  // Last 182 days (26 weeks) to maintain grid stability
  const endDate = dayjs()
  const startDate = dayjs().subtract(25, 'week').startOf('week')
  
  let current = startDate
  while (current.isBefore(endDate) || current.isSame(endDate, 'day')) {
    const dateStr = current.format('YYYY-MM-DD')
    const data = props.activities[dateStr] || { notes: 0, journals: 0, todos: 0, hobbies: 0, total: 0 }
    
    currentWeek.push({
      date: dateStr,
      dateLabel: current.format('YYYY年MM月DD日'),
      month: current.month(),
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

const monthLabels = computed(() => {
  const labels = []
  const weeks = heatmapData.value
  let lastMonth = -1
  
  const cellWidth = window.innerWidth < 640 ? 14 + 4 : 16 + 6 // w-3.5/4 + gap-1/1.5
  
  weeks.forEach((week, index) => {
    const firstDayMonth = week[0].month
    if (firstDayMonth !== lastMonth) {
      if (index > 0 && index < weeks.length - 2) { // Avoid crowding at edges
        labels.push({
          text: dayjs().month(firstDayMonth).format('M月'),
          offset: index === 0 ? 0 : (index * cellWidth) - (labels.length > 0 ? labels.reduce((acc, l) => acc + l.offset, 0) : 0)
        })
        lastMonth = firstDayMonth
      } else if (index === 0) {
        labels.push({
          text: dayjs().month(firstDayMonth).format('M月'),
          offset: 0
        })
        lastMonth = firstDayMonth
      }
    }
  })
  
  return labels
})

const getCellStyle = (day: any) => {
  const count = activeCategory.value === 'all' ? day.count.total : day.count[activeCategory.value]
  if (count === 0) return {}

  let baseColor = ''
  if (activeCategory.value !== 'all') {
    baseColor = categories.find(c => c.id === activeCategory.value)?.color || '#6366f1'
  } else {
    // Determine dominant category for "All" view
    const cats = [
      { id: 'notes', count: day.count.notes, color: '#6366f1' },
      { id: 'journals', count: day.count.journals, color: '#a855f7' },
      { id: 'todos', count: day.count.todos, color: '#10b981' },
      { id: 'hobbies', count: day.count.hobbies, color: '#f59e0b' }
    ]
    const dominant = cats.reduce((max, c) => c.count > max.count ? c : max, cats[0])
    baseColor = dominant.color
  }
  
  // Calculate intensity (0.25 to 1.0)
  // Max count is normalized to 10 for intensity ceiling
  const intensity = Math.min(0.25 + (count * 0.15), 1)
  
  return {
    backgroundColor: baseColor,
    opacity: intensity,
    boxShadow: count > 3 ? `0 0 10px ${baseColor}40` : 'none',
    transform: `scale(${isCollapsed.value ? 0.8 : 1})`
  }
}
</script>

<style scoped>
.grid-transition {
  transition: max-height 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease;
}

.custom-scrollbar::-webkit-scrollbar {
  height: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0,0,0,0.06);
  border-radius: 10px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.08);
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(0,0,0,0.12);
}
</style>
