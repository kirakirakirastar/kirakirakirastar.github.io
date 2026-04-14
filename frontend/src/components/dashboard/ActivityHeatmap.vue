<template>
  <div class="bg-white/70 dark:bg-slate-800/80 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/60 dark:border-slate-700/60 shadow-sm overflow-hidden">
    <div class="flex items-center justify-between mb-8">
      <h2 class="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
        <div class="p-2 rounded-xl bg-primary/10 text-primary">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
        </div>
        活跃贡献图
      </h2>
      <div class="flex gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        <div class="flex items-center gap-1.5"><div class="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> 笔记</div>
        <div class="flex items-center gap-1.5"><div class="w-1.5 h-1.5 rounded-full bg-purple-500"></div> 日志</div>
        <div class="flex items-center gap-1.5"><div class="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> 待办</div>
        <div class="flex items-center gap-1.5"><div class="w-1.5 h-1.5 rounded-full bg-amber-500"></div> 爱好</div>
      </div>
    </div>

    <!-- Heatmap Grid -->
    <div class="relative overflow-x-auto custom-scrollbar pb-2">
      <div class="flex gap-1.5 w-max">
        <div v-for="(week, weekIndex) in heatmapData" :key="weekIndex" class="flex flex-col gap-1.5">
          <div
            v-for="(day, dayIndex) in week"
            :key="dayIndex"
            class="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-[4px] relative group/cell transition-all duration-300"
            :class="day.count === 0 ? 'bg-slate-100 dark:bg-slate-700/50' : ''"
            :style="getCellStyle(day)"
          >
            <!-- Tooltip -->
            <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 px-3 py-2 bg-slate-900 text-white text-[10px] rounded-xl opacity-0 scale-90 peer-hover:opacity-100 group-hover/cell:opacity-100 group-hover/cell:scale-100 transition-all pointer-events-none z-10 shadow-xl border border-white/10">
              <div class="font-bold border-b border-white/10 pb-1 mb-1">{{ day.dateLabel }}</div>
              <div v-if="day.count > 0" class="space-y-0.5">
                <div v-if="day.notes" class="flex justify-between"><span>笔记</span> <span>{{ day.notes }}</span></div>
                <div v-if="day.journals" class="flex justify-between"><span>日志</span> <span>{{ day.journals }}</span></div>
                <div v-if="day.todos" class="flex justify-between"><span>待办</span> <span>{{ day.todos }}</span></div>
                <div v-if="day.hobbies" class="flex justify-between"><span>爱好</span> <span>{{ day.hobbies }}</span></div>
              </div>
              <div v-else class="text-slate-500">当日无活动</div>
              <div class="absolute top-full left-1/2 -translate-x-1/2 border-error border-8 border-transparent border-t-slate-900"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import dayjs from 'dayjs'

const props = defineProps<{
  activities: Record<string, { notes: number, journals: number, todos: number, hobbies: number, total: number }>
}>()

const heatmapData = computed(() => {
  const weeks = []
  let currentWeek = []
  
  // Last 180 days (approx 26 weeks)
  const endDate = dayjs()
  const startDate = dayjs().subtract(182, 'day').startOf('week') // Align to week start (Sunday/Monday)
  
  let current = startDate
  while (current.isBefore(endDate) || current.isSame(endDate, 'day')) {
    const dateStr = current.format('YYYY-MM-DD')
    const data = props.activities[dateStr] || { notes: 0, journals: 0, todos: 0, hobbies: 0, total: 0 }
    
    currentWeek.push({
      date: dateStr,
      dateLabel: current.format('MMM D, YYYY'),
      notes: data.notes,
      journals: data.journals,
      todos: data.todos,
      hobbies: data.hobbies,
      count: data.total
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
  if (day.count === 0) return {}

  // Determine dominant category
  const categories = [
    { type: 'notes', count: day.notes, color: '#6366f1' }, // Indigo
    { type: 'journals', count: day.journals, color: '#a855f7' }, // Purple
    { type: 'todos', count: day.todos, color: '#10b981' }, // Emerald
    { type: 'hobbies', count: day.hobbies, color: '#f59e0b' } // Amber
  ]
  
  const dominant = categories.reduce((max, c) => c.count > max.count ? c : max, categories[0])
  
  // Calculate intensity (0.2 to 1.0)
  const intensity = Math.min(0.2 + (day.count * 0.15), 1)
  
  return {
    backgroundColor: dominant.color,
    opacity: intensity,
    boxShadow: day.count > 5 ? `0 0 8px ${dominant.color}66` : 'none'
  }
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  height: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0,0,0,0.05);
  border-radius: 10px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.05);
}
</style>
