<template>
  <div class="fixed inset-0 pointer-events-none -z-10 overflow-hidden" 
       style="will-change: opacity; transform: translateZ(0);" 
       :style="{ opacity: 'var(--live-bg-opacity, 0.5)' }">
    <img 
      v-if="settingsStore.bgUrl"
      :src="settingsStore.bgUrl"
      @load="handleImageLoad"
      :class="[settingsStore.bgFit === 'cover' ? 'object-cover' : 'object-contain']"
      class="w-full h-full transition-opacity duration-700"
      style="will-change: transform, filter; transform: translateZ(0);"
      :style="{
        objectPosition: 'center',
        transform: `scale(var(--live-bg-scale, ${settingsStore.bgScale / 100})) translate(var(--live-bg-offset-x, ${settingsStore.bgPosX - 50}%), var(--live-bg-offset-y, ${settingsStore.bgPosY - 50}%)) translateZ(0)`,
        filter: `blur(var(--live-bg-blur, ${settingsStore.bgBlur}px))`
      }"
    />
  </div>
  
  <!-- Theme Tint Overlay -->
  <div 
    class="fixed inset-0 pointer-events-none -z-5"
    :style="{ backgroundColor: tintColor, opacity: 'var(--live-tint-opacity, 0.1)', willChange: 'opacity' }"
  ></div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { getDominantColor } from '@/utils/colorExtraction'

const settingsStore = useSettingsStore()

const THEME_COLORS: Record<string, string> = {
  blue:    '#2563eb',
  purple:  '#9333ea',
  emerald: '#059669',
  rose:    '#e11d48',
}

const tintColor = computed(() => THEME_COLORS[settingsStore.themeColor] ?? '#2563eb')

const updateCssVars = () => {
  const r = document.documentElement.style
  r.setProperty('--live-tint-opacity', String(settingsStore.bgTintOpacity / 100))
  r.setProperty('--live-bg-opacity',   String(settingsStore.bgOpacity / 100))
  r.setProperty('--live-bg-blur',      `${settingsStore.bgBlur}px`)
  r.setProperty('--live-bg-scale',     String(settingsStore.bgScale / 100))
  r.setProperty('--live-bg-pos-x',     `${settingsStore.bgPosX}%`)
  r.setProperty('--live-bg-pos-y',     `${settingsStore.bgPosY}%`)
}

onMounted(() => {
  updateCssVars()
})

const handleImageLoad = async () => {
  if (!settingsStore.bgUrl) return
  try {
    const color = await getDominantColor(settingsStore.bgUrl)
    document.documentElement.style.setProperty('--live-primary-color', color)
    // Also derive a lighter version for hover states/badges
    document.documentElement.style.setProperty('--live-primary-light', color.replace('%)', ', 0.15)'))
  } catch (e) {
    console.error('Failed to extract color:', e)
  }
}

// Update CSS variables when settings change
watch([
  () => settingsStore.bgTintOpacity,
  () => settingsStore.bgOpacity,
  () => settingsStore.bgBlur,
  () => settingsStore.bgScale,
  () => settingsStore.bgPosX,
  () => settingsStore.bgPosY,
  () => settingsStore.bgUrl
], () => {
  updateCssVars()
})
</script>
