<template>
  <div class="relative bg-white/70 dark:bg-slate-800/80 backdrop-blur-md rounded-3xl shadow-md border border-white/60 dark:border-slate-700/60 p-6 flex flex-col items-center justify-between overflow-hidden group h-full">
    <!-- Background Decoration -->
    <div class="absolute -right-10 -bottom-10 w-40 h-40 bg-secondary/10 dark:bg-secondary/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>

    <div class="w-full mb-4">
      <h2 class="text-xl font-bold text-slate-800 dark:text-white flex items-center space-x-2">
        <span class="w-1.5 h-6 rounded bg-secondary block"></span>
        <span>每日打卡</span>
      </h2>
    </div>

    <!-- Streak Display -->
    <div class="flex flex-col items-center py-4">
      <div class="relative">
        <div class="text-6xl font-black bg-gradient-to-br from-secondary to-pink-500 bg-clip-text text-transparent drop-shadow-sm">
          {{ gadgetStore.checkin.streak }}
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
          <p class="text-sm text-slate-600 dark:text-slate-300 italic whitespace-pre-wrap">{{ gadgetStore.checkin.last_record ? `"${gadgetStore.checkin.last_record}"` : '（暂无记录）' }}</p>
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
</template>

<script setup lang="ts">
import { ref } from 'vue'
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

const startEditing = () => {
  editingText.value = gadgetStore.checkin.last_record || ''
  isEditingRecord.value = true
}

const cancelEditing = () => {
  isEditingRecord.value = false
  editingText.value = ''
}

const saveRecord = async () => {
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
</style>
