<template>
  <div 
    class="relative w-full overflow-hidden mb-8 group cursor-default select-none touch-pan-y"
    @mouseenter="stopTimer"
    @mouseleave="startTimer"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
  >
    <!-- Background Decor -->
    <div class="absolute inset-0 bg-white/30 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/40 dark:border-white/5 shadow-sm pointer-events-none z-0"></div>
    
    <div class="relative flex items-center h-12 px-4 sm:px-6 z-10">
      <!-- Prev Button (Desktop Hover) -->
      <button 
        v-if="gadgetStore.announcements.length > 1"
        @click.stop="prev"
        class="hidden md:flex flex-shrink-0 w-8 h-8 items-center justify-center rounded-full hover:bg-white/50 dark:hover:bg-slate-800/50 text-slate-400 hover:text-primary transition-all opacity-0 group-hover:opacity-100 -ml-2 mr-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
      </button>

      <!-- Icon Wrapper -->
      <div class="flex-shrink-0 w-8 h-8 rounded-full bg-primary/15 dark:bg-primary/25 flex items-center justify-center text-primary dark:text-primary-light mr-4">
        <svg class="w-4 h-4" :class="{ 'animate-pulse': gadgetStore.announcements.length > 0 }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
        </svg>
      </div>

      <!-- Text Content -->
      <div class="flex-1 relative h-full flex items-center overflow-hidden pointer-events-none">
        <div v-if="gadgetStore.loading" class="flex gap-2">
          <div class="w-24 h-4 bg-slate-200 dark:bg-slate-700 animate-pulse rounded"></div>
        </div>
        <div v-else-if="gadgetStore.announcements.length === 0" class="text-sm font-medium text-slate-400">
          暂无公告，保持好心情 🎉
        </div>
        <transition 
          v-else
          :name="slideDirection" 
          mode="out-in"
        >
          <div 
            :key="currentIndex" 
            class="text-sm sm:text-base font-medium text-slate-700 dark:text-slate-200 truncate pr-6 pointer-events-auto"
          >
            {{ gadgetStore.announcements[currentIndex]?.text }}
          </div>
        </transition>
      </div>

      <!-- Next Button (Desktop Hover) -->
      <button 
        v-if="gadgetStore.announcements.length > 1"
        @click.stop="next"
        class="hidden md:flex flex-shrink-0 w-8 h-8 items-center justify-center rounded-full hover:bg-white/50 dark:hover:bg-slate-800/50 text-slate-400 hover:text-primary transition-all opacity-0 group-hover:opacity-100 mr-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19l7-7-7-7"></path></svg>
      </button>

      <!-- Manage Button -->
      <router-link 
        v-if="authStore.user"
        to="/announcements"
        class="flex-shrink-0 p-2 text-slate-400 hover:text-primary hover:bg-white/50 dark:hover:bg-slate-700/50 rounded-xl transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
        title="管理公告"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z"></path></svg>
      </router-link>

      <!-- Pagination Dots -->
      <div v-if="gadgetStore.announcements.length > 1" class="hidden sm:flex items-center gap-1.5 ml-4">
        <span 
          v-for="(_, i) in gadgetStore.announcements" 
          :key="i"
          @click.stop="currentIndex = i"
          class="w-1.5 h-1.5 rounded-full transition-all duration-300 cursor-pointer"
          :class="i === currentIndex ? 'bg-primary w-4' : 'bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'"
        ></span>
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
const slideDirection = ref('slide-next')
let timer: any = null

// Touch Swiping logic
const touchStartX = ref(0)
const handleTouchStart = (e: TouchEvent) => {
  touchStartX.value = e.touches[0].clientX
}
const handleTouchEnd = (e: TouchEvent) => {
  const diff = touchStartX.value - e.changedTouches[0].clientX
  if (Math.abs(diff) > 30) {
    if (diff > 0) next()
    else prev()
  }
}

const next = () => {
  if (gadgetStore.announcements.length <= 1) return
  slideDirection.value = 'slide-next'
  currentIndex.value = (currentIndex.value + 1) % gadgetStore.announcements.length
}

const prev = () => {
  if (gadgetStore.announcements.length <= 1) return
  slideDirection.value = 'slide-prev'
  currentIndex.value = (currentIndex.value - 1 + gadgetStore.announcements.length) % gadgetStore.announcements.length
}

const startTimer = () => {
  stopTimer()
  if (gadgetStore.announcements.length > 1) {
    timer = setInterval(next, 6000)
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

watch(() => gadgetStore.announcements.length, () => {
  currentIndex.value = 0
  startTimer()
})
</script>

<style scoped>
.slide-next-enter-active, .slide-next-leave-active,
.slide-prev-enter-active, .slide-prev-leave-active {
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-next-enter-from, .slide-prev-leave-to {
  transform: translateX(30px);
  opacity: 0;
}
.slide-next-leave-to, .slide-prev-enter-from {
  transform: translateX(-30px);
  opacity: 0;
}
</style>
