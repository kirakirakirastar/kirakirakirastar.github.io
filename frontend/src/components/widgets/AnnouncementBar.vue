<template>
  <div class="relative w-full overflow-hidden mb-8 group">
    <div class="absolute inset-0 bg-white/30 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/40 dark:border-white/5 shadow-sm"></div>
    <div class="relative flex items-center h-12 px-5 sm:px-6">
      <!-- Icon Wrapper -->
      <div class="flex-shrink-0 w-8 h-8 rounded-full bg-primary/15 dark:bg-primary/25 flex items-center justify-center text-primary dark:text-primary-light mr-4" :class="{ 'animate-pulse': gadgetStore.announcements.length > 0 }">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
        </svg>
      </div>

      <!-- Text Container with Transition -->
      <div class="flex-1 relative h-full flex items-center overflow-hidden">
        <div v-if="gadgetStore.loading" class="flex gap-2">
          <div class="w-24 h-4 bg-slate-200 dark:bg-slate-700 animate-pulse rounded"></div>
        </div>
        <div v-else-if="gadgetStore.announcements.length === 0" class="text-sm font-medium text-slate-400">
          暂无公告，保持好心情 🎉
        </div>
        <transition 
          v-else
          name="slide-fade" 
          mode="out-in"
        >
          <div 
            :key="currentIndex" 
            class="text-sm sm:text-base font-medium text-slate-700 dark:text-slate-200 truncate"
          >
            {{ gadgetStore.announcements[currentIndex]?.text }}
          </div>
        </transition>
      </div>

      <!-- Settings / Manage Button -->
      <router-link 
        v-if="authStore.user"
        to="/announcements"
        class="ml-4 p-2 text-slate-400 hover:text-primary hover:bg-white/50 dark:hover:bg-slate-700/50 rounded-xl transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
        title="管理公告"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z"></path>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
        </svg>
      </router-link>

      <!-- Action Button / Navigation -->
      <div v-if="gadgetStore.announcements.length > 1" class="hidden sm:flex items-center gap-2 ml-4">
        <div class="flex gap-1">
          <span 
            v-for="(_, i) in gadgetStore.announcements" 
            :key="i"
            class="w-1.5 h-1.5 rounded-full transition-all duration-300 shadow-sm"
            :class="i === currentIndex ? 'bg-primary w-4' : 'bg-slate-300 dark:bg-slate-700'"
          ></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useGadgetStore } from '@/stores/gadgets'
import { useAuthStore } from '@/stores/auth'

const gadgetStore = useGadgetStore()
const authStore = useAuthStore()
const currentIndex = ref(0)
let timer: any = null

const startTimer = () => {
  stopTimer()
  if (gadgetStore.announcements.length > 1) {
    timer = setInterval(() => {
      currentIndex.value = (currentIndex.value + 1) % gadgetStore.announcements.length
    }, 6000)
  }
}

const stopTimer = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

onMounted(() => {
  startTimer()
})

onUnmounted(() => {
  stopTimer()
})

// Restart timer if announcements change
watch(() => gadgetStore.announcements.length, () => {
  currentIndex.value = 0
  startTimer()
})
</script>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-fade-enter-from {
  transform: translateY(20px) scale(0.95);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateY(-20px) scale(0.95);
  opacity: 0;
}
</style>
