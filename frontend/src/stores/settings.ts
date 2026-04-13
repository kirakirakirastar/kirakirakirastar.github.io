import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ThemeColor = 'purple' | 'blue' | 'emerald' | 'rose'

export const useSettingsStore = defineStore('settings', () => {
  const themeColor = ref<ThemeColor>('blue')
  const bgUrl = ref('')
  const bgOpacity = ref(50)
  const bgBlur = ref(0)
  const bgScale = ref(100)
  const bgTintOpacity = ref(10)
  const bgPosX = ref(50)
  const bgPosY = ref(50)
  const bgFit = ref<'cover' | 'contain'>('cover')

  const applyThemeClass = () => {
    document.documentElement.classList.remove('theme-purple', 'theme-blue', 'theme-emerald', 'theme-rose')
    document.documentElement.classList.add(`theme-${themeColor.value}`)
  }

  const initSettings = () => {
    // Note: Hydration is now handled by persistencePlugin
    applyThemeClass()
  }

  const updateSettings = (updates: Partial<{
    themeColor: ThemeColor
    bgUrl: string
    bgOpacity: number
    bgBlur: number
    bgScale: number
    bgTintOpacity: number
    bgPosX: number
    bgPosY: number
    bgFit: 'cover' | 'contain'
  }>) => {
    const colorChanged = updates.themeColor !== undefined && updates.themeColor !== themeColor.value

    if (updates.themeColor) themeColor.value = updates.themeColor
    if (updates.bgUrl !== undefined) bgUrl.value = updates.bgUrl
    if (updates.bgOpacity !== undefined) bgOpacity.value = updates.bgOpacity
    if (updates.bgBlur !== undefined) bgBlur.value = updates.bgBlur
    if (updates.bgScale !== undefined) bgScale.value = updates.bgScale
    if (updates.bgTintOpacity !== undefined) bgTintOpacity.value = updates.bgTintOpacity
    if (updates.bgPosX !== undefined) bgPosX.value = updates.bgPosX
    if (updates.bgPosY !== undefined) bgPosY.value = updates.bgPosY
    if (updates.bgFit !== undefined) bgFit.value = updates.bgFit

    if (colorChanged) applyThemeClass()
  }

  return {
    themeColor, bgUrl, bgOpacity, bgBlur, bgScale, bgTintOpacity,
    bgPosX, bgPosY, bgFit,
    initSettings, updateSettings,
  }
}, {
  persist: { key: 'app-settings' }
})
