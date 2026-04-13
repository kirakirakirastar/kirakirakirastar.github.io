<template>
  <div 
    class="skeleton relative overflow-hidden bg-slate-200 dark:bg-slate-700/50"
    :class="[
      shape === 'circle' ? 'rounded-full' : 'rounded-xl',
      customClass
    ]"
    :style="{ 
      width: width || '100%', 
      height: height || '20px' 
    }"
  >
    <!-- Shimmer Effect -->
    <div class="shimmer-wrapper absolute inset-0">
      <div class="shimmer absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  width?: string
  height?: string
  shape?: 'text' | 'circle' | 'rect'
  customClass?: string
}>()
</script>

<style scoped>
.skeleton {
  will-change: transform;
}

.shimmer {
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}
</style>
