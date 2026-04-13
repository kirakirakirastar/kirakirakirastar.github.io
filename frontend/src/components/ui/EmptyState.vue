<template>
  <div class="flex flex-col items-center justify-center py-10 px-6 text-center animate-fade-in">
    <div class="mb-6 relative">
      <!-- Animated SVG Blob Background -->
      <div class="absolute inset-0 bg-primary/5 dark:bg-primary/10 rounded-full blur-2xl scale-150 animate-pulse"></div>
      
      <!-- Themed SVG Illustration (Starry Space) -->
      <svg class="relative w-32 h-32 text-primary/40 dark:text-primary/30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L14.45 8.35H21L15.77 12.25L18.22 18.6L12 14.7L5.78 18.6L8.23 12.25L3 8.35H9.55L12 2Z" fill="currentColor" />
        <circle cx="18" cy="5" r="1.5" fill="currentColor" opacity="0.6">
          <animate attributeName="opacity" values="0.6;0.2;0.6" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="5" cy="18" r="1" fill="currentColor" opacity="0.4">
          <animate attributeName="opacity" values="0.4;0.1;0.4" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="21" cy="14" r="0.8" fill="currentColor" opacity="0.3">
          <animate attributeName="opacity" values="0.3;0.1;0.3" dur="4s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
    
    <h3 class="text-lg font-bold text-slate-700 dark:text-slate-200 mb-2">{{ title }}</h3>
    <p class="text-sm text-slate-500 dark:text-slate-400 max-w-[240px] leading-relaxed">
      {{ message }}
    </p>
    
    <slot name="action"></slot>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  message: string
}>()
</script>

<style scoped>
@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fade-in 0.6s ease-out forwards;
}
</style>
