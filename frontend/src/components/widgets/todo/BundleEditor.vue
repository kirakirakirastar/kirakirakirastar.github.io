<template>
  <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
    <div class="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
      
      <!-- Header -->
      <div class="px-6 py-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-bold text-slate-800 dark:text-slate-100">复合关卡包编辑器</h3>
            <p class="text-xs text-slate-500">创建多阶段、具有时序逻辑的任务体系</p>
          </div>
        </div>
        <div v-if="hasConflict" class="hidden md:flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full animate-pulse">
            <svg class="w-3 h-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            <span class="text-[10px] font-black text-red-500 uppercase tracking-widest">排期冲突</span>
        </div>
        <button @click="$emit('close')" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-6 space-y-8">
        
        <!-- Parent Config -->
        <section class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="md:col-span-2 space-y-2">
            <label class="text-xs font-black text-slate-400 uppercase tracking-widest">父计划名称</label>
            <input 
              v-model="parentTask.text"
              type="text"
              placeholder="例如：15天生活作息重塑计划"
              class="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary/50 outline-none text-slate-700 dark:text-slate-200 font-bold"
            />
          </div>
          <div class="space-y-2">
            <label class="text-xs font-black text-slate-400 uppercase tracking-widest">总预计天数</label>
            <div class="flex items-center gap-2">
              <input 
                v-model.number="parentTask.duration"
                type="number"
                min="1"
                max="100"
                class="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary/50 outline-none text-slate-700 dark:text-slate-200 font-bold text-center"
              />
              <span class="text-sm font-bold text-slate-500">天</span>
            </div>
          </div>
        </section>

        <!-- Visual Timeline (Gantt-lite) -->
        <section class="space-y-3">
          <div class="flex items-center justify-between">
            <label class="text-xs font-black text-slate-400 uppercase tracking-widest">可视化时序预览</label>
            <span class="text-[10px] text-primary bg-primary/5 px-2 py-0.5 rounded-full">可直接拖动色块调整偏移或时长</span>
          </div>
          
          <div class="relative bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-4 border border-slate-100 dark:border-white/5 overflow-x-auto min-h-[220px]">
            <!-- Timeline Ruler -->
            <div class="flex mb-6 border-b border-slate-200 dark:border-white/10 pb-2 sticky top-0 bg-slate-50 dark:bg-slate-800 z-10">
              <div v-for="d in parentTask.duration" :key="d" 
                class="flex-1 min-w-[35px] text-center text-[9px] font-bold text-slate-400"
                :class="{ 'text-primary border-t-2 border-primary pt-1': d === 1 || d % 5 === 0 }"
              >
                {{ d }}
              </div>
            </div>

            <!-- Task Tracks -->
            <div class="space-y-4">
              <div v-for="(child, idx) in children" :key="idx" class="relative h-10 group/track">
                <!-- Track Background -->
                <div class="absolute inset-x-0 inset-y-0 bg-slate-100/30 dark:bg-white/5 rounded-xl opacity-0 group-hover/track:opacity-100 transition-opacity"></div>
                
                <!-- Task Bar -->
                <div 
                  class="absolute h-8 top-1 rounded-xl shadow-md border border-white/20 flex items-center px-4 transition-all cursor-move select-none overflow-hidden"
                  :style="{ 
                    left: `${(child.start_offset / parentTask.duration) * 100}%`,
                    width: `${((child.duration_days) / parentTask.duration) * 100}%`,
                    backgroundColor: getTrackColor(idx)
                  }"
                  @mousedown="(e) => startDrag(e, idx)"
                >
                  <span class="text-[11px] font-black text-white truncate drop-shadow-sm">{{ child.text || `阶段 ${idx + 1}` }}</span>
                  <!-- Resize Handle -->
                  <div 
                    class="absolute right-0 top-0 bottom-0 w-3 hover:bg-white/30 cursor-ew-resize flex items-center justify-center"
                    @mousedown.stop="(e) => startResize(e, idx)"
                  >
                    <div class="w-1 h-3 bg-white/40 rounded-full"></div>
                  </div>
                </div>
              </div>
              
              <!-- Placeholder if empty -->
              <div v-if="children.length === 0" class="h-24 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl text-slate-400 text-xs italic">
                还没有添加关卡任务，点击下方按钮开始
              </div>
            </div>
          </div>
        </section>

        <!-- List Editor -->
        <section class="space-y-4">
          <div class="flex items-center justify-between">
            <label class="text-xs font-black text-slate-400 uppercase tracking-widest">任务明细列表</label>
            <button 
              @click="addChild"
              class="px-4 py-2 rounded-xl bg-primary text-white text-[10px] font-black hover:shadow-lg transition-all active:scale-95 flex items-center gap-1.5"
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
              添加新关卡
            </button>
          </div>

          <div class="grid gap-3">
            <div v-for="(child, idx) in children" :key="idx" 
              class="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm group animate-in slide-in-from-left-2 duration-200"
            >
              <div class="w-2 h-10 rounded-full shrink-0" :style="{ backgroundColor: getTrackColor(idx) }"></div>
              
              <div class="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                <div class="lg:col-span-6">
                  <input 
                    v-model="child.text"
                    placeholder="例如：第一周 基础适应"
                    class="w-full bg-slate-50 dark:bg-slate-900/50 border-none rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-1 focus:ring-primary/30 font-medium"
                  />
                </div>
                <div class="lg:col-span-3 flex items-center gap-2">
                  <span class="text-[10px] text-slate-400 font-bold shrink-0">第</span>
                  <input 
                    v-model.number="child.start_offset"
                    type="number"
                    min="0"
                    :max="parentTask.duration - 1"
                    class="w-full bg-slate-50 dark:bg-slate-900/50 border-none rounded-xl px-2 py-2.5 text-xs outline-none text-center font-bold"
                  />
                  <span class="text-[10px] text-slate-400 font-bold shrink-0">天开启</span>
                </div>
                <div class="lg:col-span-3 flex items-center gap-2">
                  <span class="text-[10px] text-slate-400 font-bold shrink-0">持续</span>
                  <input 
                    v-model.number="child.duration_days"
                    type="number"
                    min="1"
                    :max="parentTask.duration - child.start_offset"
                    class="w-full bg-slate-50 dark:bg-slate-900/50 border-none rounded-xl px-2 py-2.5 text-xs outline-none text-center font-bold"
                  />
                  <span class="text-[10px] text-slate-400 font-bold shrink-0">天</span>
                </div>
              </div>

              <button @click="removeChild(idx)" class="p-2.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              </button>
            </div>
          </div>
        </section>

      </div>

      <!-- Footer -->
      <div class="px-8 py-5 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-2 text-[10px] text-slate-400">
          <svg class="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>
          所有子任务将自动继承父任务的优先级和可见性设置。
        </div>
        <div class="flex gap-3 w-full sm:w-auto">
          <button 
            @click="$emit('close')"
            class="flex-1 sm:flex-none px-8 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-slate-200 dark:border-white/10"
          >
            取消
          </button>
          <button 
            @click="handleSave"
            :disabled="!isValid"
            class="flex-1 sm:flex-none px-10 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:shadow-xl hover:shadow-primary/20 disabled:opacity-50 disabled:grayscale transition-all active:scale-95"
          >
            一键创建计划包
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useGadgetStore } from '@/stores/gadgets'
import dayjs from 'dayjs'

const emit = defineEmits(['close', 'saved'])
const gadgetStore = useGadgetStore()

const parentTask = ref({
  text: '',
  duration: 15,
  priority: 'medium'
})

const children = ref<any[]>([
  { text: '第一阶段: 环境适应', start_offset: 0, duration_days: 7 },
  { text: '第二阶段: 高强度挑战', start_offset: 7, duration_days: 8 }
])

const isValid = computed(() => {
  return parentTask.value.text.trim().length > 0 && 
         children.value.length > 0 && 
         children.value.every(c => c.text.trim().length > 0) &&
         !hasConflict.value
})

const hasConflict = computed(() => {
  return children.value.some(c => (c.start_offset + c.duration_days) > parentTask.value.duration)
})

const colors = [
  '#6366f1', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6', '#06b6d4', '#f43f5e'
]
const getTrackColor = (idx: number) => colors[idx % colors.length]

const addChild = () => {
  const lastChild = children.value[children.value.length - 1]
  const newOffset = lastChild ? Math.min(parentTask.value.duration - 1, lastChild.start_offset + lastChild.duration_days) : 0
  
  children.value.push({ 
    text: `新阶段 ${children.value.length + 1}`, 
    start_offset: newOffset, 
    duration_days: Math.max(1, Math.min(7, parentTask.value.duration - newOffset))
  })
}

const removeChild = (idx: number) => {
  children.value.splice(idx, 1)
}

// Drag & Resize Logic
const draggingIdx = ref<number | null>(null)
const resizingIdx = ref<number | null>(null)
const startX = ref(0)
const initialOffset = ref(0)
const initialDuration = ref(0)

const startDrag = (e: MouseEvent, idx: number) => {
  draggingIdx.value = idx
  startX.value = e.clientX
  initialOffset.value = children.value[idx].start_offset
}

const startResize = (e: MouseEvent, idx: number) => {
  resizingIdx.value = idx
  startX.value = e.clientX
  initialDuration.value = children.value[idx].duration_days
}

const handleGlobalMouseMove = (e: MouseEvent) => {
  if (draggingIdx.value === null && resizingIdx.value === null) return

  const container = document.querySelector('.relative.bg-slate-50')
  if (!container) return
  
  const widthPerDay = container.clientWidth / parentTask.value.duration
  const deltaX = e.clientX - startX.value
  const deltaDays = Math.round(deltaX / widthPerDay)

  if (draggingIdx.value !== null) {
    let newOffset = initialOffset.value + deltaDays
    newOffset = Math.max(0, Math.min(newOffset, parentTask.value.duration - children.value[draggingIdx.value].duration_days))
    children.value[draggingIdx.value].start_offset = newOffset
  }

  if (resizingIdx.value !== null) {
    let newDuration = initialDuration.value + deltaDays
    newDuration = Math.max(1, Math.min(newDuration, parentTask.value.duration - children.value[resizingIdx.value].start_offset))
    children.value[resizingIdx.value].duration_days = newDuration
  }
}

const handleGlobalMouseUp = () => {
  draggingIdx.value = null
  resizingIdx.value = null
}

onMounted(() => {
  window.addEventListener('mousemove', handleGlobalMouseMove)
  window.addEventListener('mouseup', handleGlobalMouseUp)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleGlobalMouseMove)
  window.removeEventListener('mouseup', handleGlobalMouseUp)
})

const handleSave = async () => {
  if (!isValid.value) return
  
  const today = dayjs().format('YYYY-MM-DD')
  const parentDueDate = dayjs().add(parentTask.value.duration - 1, 'day').format('YYYY-MM-DD')

  await gadgetStore.addBundle(parentTask.value.text, {
    start_date: today,
    due_date: parentDueDate,
    priority: parentTask.value.priority,
    is_bundle: true
  }, children.value)

  emit('saved')
  emit('close')
}
</script>

<style scoped>
.fade-slide-enter-active, .fade-slide-leave-active {
  transition: all 0.3s ease;
}
.fade-slide-enter-from, .fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.overflow-x-auto::-webkit-scrollbar {
  height: 4px;
}
.overflow-x-auto::-webkit-scrollbar-track {
  background: transparent;
}
.overflow-x-auto::-webkit-scrollbar-thumb {
  background: rgba(100, 116, 139, 0.2);
  border-radius: 10px;
}
</style>
