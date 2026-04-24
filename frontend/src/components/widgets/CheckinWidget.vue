<template>
  <div class="relative bg-white/70 dark:bg-slate-800/80 backdrop-blur-md rounded-3xl shadow-md border border-white/60 dark:border-slate-700/60 p-6 flex flex-col items-center justify-between overflow-hidden group h-full">
    <!-- Background Decoration -->
    <div class="absolute -right-10 -bottom-10 w-40 h-40 bg-secondary/10 dark:bg-secondary/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>

    <div class="w-full mb-4 flex justify-between items-center">
      <h2 class="text-xl font-bold text-slate-800 dark:text-white flex items-center space-x-2">
        <span class="w-1.5 h-6 rounded bg-secondary block"></span>
        <span>{{ showHistory ? '打卡历史' : '每日打卡' }}</span>
      </h2>
      <button 
        @click="toggleHistory" 
        class="p-2 rounded-xl transition-all duration-300 transform active:scale-90"
        :class="showHistory ? 'bg-secondary text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 hover:bg-secondary/10 hover:text-secondary'"
        aria-label="查看打卡历史"
      >
        <svg v-if="!showHistory" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>
    </div>

    <!-- History View -->
    <Transition name="fade-slide">
      <div v-if="showHistory" class="w-full flex-1 overflow-y-auto px-1 space-y-3 custom-scrollbar z-10">
        <div v-if="gadgetStore.checkinHistory.length === 0" class="flex flex-col items-center justify-center py-10 text-slate-400">
          <svg class="w-12 h-12 mb-2 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          <p class="text-xs">暂无历史记录</p>
        </div>
        <div 
          v-for="item in gadgetStore.checkinHistory" 
          :key="item.id" 
          class="bg-white/50 dark:bg-slate-900/40 rounded-2xl p-4 border border-white/40 dark:border-white/5 hover:border-secondary/20 transition-colors"
        >
          <div class="flex justify-between items-center mb-2">
            <span class="text-[10px] font-bold text-slate-400 font-mono">{{ formatDate(item.checkin_date) }}</span>
            <div v-if="isToday(item.checkin_date)" class="text-[10px] bg-secondary/10 text-secondary px-2 py-0.5 rounded-full font-bold">今天</div>
          </div>
          <p class="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
            {{ item.message || '开启了精彩的一天' }}
          </p>
        </div>
      </div>

      <!-- Default View -->
      <div v-else class="w-full flex flex-col items-center justify-between flex-1">
        <!-- Streak Display -->
        <div class="flex flex-col items-center py-4">
          <div class="relative">
            <div class="text-6xl font-black bg-gradient-to-br from-secondary to-pink-500 bg-clip-text text-transparent drop-shadow-sm">
              {{ gadgetStore.currentStreak }}
            </div>
            <div class="absolute -top-1 -right-6 text-2xl animate-bounce">🔥</div>
          </div>
          <div class="text-sm font-bold text-slate-500 dark:text-slate-400 mt-2 tracking-widest uppercase">
            连续打卡天数
          </div>
        </div>

        <!-- Stats Row -->
        <div class="w-full grid grid-cols-2 gap-4 mb-4">
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

        <!-- Record Module -->
        <div class="w-full mb-6">
          <div v-if="gadgetStore.canCheckin()" class="space-y-2">
            <label class="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">今日感悟 / 目标</label>
            <textarea 
              v-model="recordText"
              placeholder="简单记录一下今天吧..."
              class="w-full h-20 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-white/60 dark:border-slate-700/60 focus:border-secondary/50 focus:ring-2 focus:ring-secondary/10 transition-all text-sm resize-none outline-none text-slate-700 dark:text-slate-200"
            ></textarea>
          </div>
          <div v-else class="bg-secondary/5 dark:bg-secondary/10 rounded-2xl p-4 border border-secondary/10 relative group/record min-h-[90px] w-full">
            <div class="flex justify-between items-center mb-2">
              <div class="text-[10px] font-bold text-secondary uppercase tracking-widest">今日记录</div>
              <!-- Edit & Actions -->
              <div v-if="!isEditingRecord" class="opacity-0 group-hover/record:opacity-100 transition-opacity">
                <button @click="startEditing" class="text-xs text-secondary hover:text-pink-500 font-bold transition-colors">修改</button>
              </div>
              <div v-else class="flex space-x-3">
                <button @click="cancelEditing" class="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors" :disabled="loadingRecord">取消</button>
                <button @click="saveRecord" class="text-xs text-secondary hover:text-pink-500 font-bold transition-colors disabled:opacity-50" :disabled="loadingRecord">
                  {{ loadingRecord ? '保存中...' : '保存' }}
                </button>
              </div>
            </div>

            <div v-if="!isEditingRecord">
              <p class="text-sm text-slate-600 dark:text-slate-300 italic whitespace-pre-wrap leading-relaxed">{{ gadgetStore.checkin.last_record ? `"${gadgetStore.checkin.last_record}"` : '（暂无记录）' }}</p>
            </div>
            <div v-else>
              <textarea 
                v-model="editingText"
                placeholder="修改今日感悟..."
                class="w-full h-16 p-2 rounded-xl bg-white/60 dark:bg-slate-900/40 border border-secondary/30 focus:border-secondary focus:ring-1 focus:ring-secondary/20 transition-all text-sm resize-none outline-none text-slate-700 dark:text-slate-200"
              ></textarea>
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
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import dayjs from 'dayjs'
import { useGadgetStore } from '@/stores/gadgets'
import { useUiStore } from '@/stores/ui'
import { fireConfetti } from '@/utils/confetti'

const gadgetStore = useGadgetStore()
const uiStore = useUiStore()
const loading = ref(false)
const recordText = ref('')
const isEditingRecord = ref(false)
const editingText = ref('')
const loadingRecord = ref(false)
const showHistory = ref(false)

const startEditing = () => {
  editingText.value = gadgetStore.checkin.last_record || ''
  isEditingRecord.value = true
}

const cancelEditing = () => {
  isEditingRecord.value = false
  editingText.value = ''
}

const toggleHistory = () => {
  showHistory.value = !showHistory.value
  if (showHistory.value) {
    gadgetStore.fetchCheckinHistory()
  }
}

const isToday = (date: string) => dayjs(date).isSame(dayjs(), 'day')
const formatDate = (date: string) => dayjs(date).format('YYYY年MM月DD日')

const saveRecord = async () => {
  if (!editingText.value.trim()) return
  loadingRecord.value = true
  try {
    const success = await gadgetStore.updateCheckinRecord(editingText.value)
    if (success) {
      isEditingRecord.value = false
    }
  } finally {
    loadingRecord.value = false
  }
}

const handleCheckin = async () => {
  loading.value = true
  try {
    const success = await gadgetStore.doCheckin(recordText.value)
    if (success) {
      recordText.value = ''
      // Center pop confetti
      fireConfetti(0.5, 0.7)
      uiStore.addToast('打卡成功！又是充满活力的一天 ✨', 'success', '已记录您的今日挑战')
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

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(var(--secondary-rgb), 0.2);
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--secondary-rgb), 0.5);
}
</style>

