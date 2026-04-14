<template>
  <div class="mini-heatmap flex gap-[3.5px] select-none pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity duration-500">
    <div v-for="(week, weekIndex) in miniData" :key="weekIndex" class="flex flex-col gap-[3.5px]">
      <div 
        v-for="(day, dayIndex) in week" 
        :key="dayIndex"
        class="w-[6px] h-[6px] rounded-[1.8px] transition-colors duration-500"
        :style="getCellStyle(day)"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import dayjs from 'dayjs'

const props = withDefaults(defineProps<{
  activities: Record<string, any>
  category: string
  color: string
  weeks?: number
}>(), {
  weeks: 5
})

const miniData = computed(() => {
  const weeks = []
  let currentWeek = []
  
  // Display based on requested weeks (default 35 days)
  const endDate = dayjs()
  const startDate = dayjs().subtract((props.weeks * 7) - 1, 'day').startOf('week')
  
  let current = startDate
  while (current.isBefore(endDate) || current.isSame(endDate, 'day')) {
    const dateStr = current.format('YYYY-MM-DD')
    const count = props.activities[dateStr]?.[props.category] || 0
    
    currentWeek.push(count)
    
    if (currentWeek.length === 7) {
      weeks.push(currentWeek)
      currentWeek = []
    }
    current = current.add(1, 'day')
  }
  
  if (currentWeek.length > 0) weeks.push(currentWeek)
  return weeks
})

const getCellStyle = (count: number) => {
  if (count === 0) return { backgroundColor: 'currentColor', opacity: 0.05 }
  
  const intensity = Math.min(0.2 + (count * 0.2), 1)
  return {
    backgroundColor: props.color,
    opacity: intensity
  }
}
</script>

<style scoped>
.mini-heatmap {
  /* Inherit text color for empty cells (slate-500/slate-400) */
  color: inherit;
}
</style>
