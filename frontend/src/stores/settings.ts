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

  // Debounced localStorage write — avoids blocking the main thread on every slider tick
  let saveTimer: ReturnType<typeof setTimeout> | null = null
  const scheduleSave = () => {
    if (saveTimer) clearTimeout(saveTimer)
    saveTimer = setTimeout(() => {
      localStorage.setItem('app-settings', JSON.stringify({
        themeColor: themeColor.value,
        bgUrl: bgUrl.value,
        bgOpacity: bgOpacity.value,
        bgBlur: bgBlur.value,
        bgScale: bgScale.value,
        bgTintOpacity: bgTintOpacity.value,
      }))
    }, 500)
  }

  const initSettings = () => {
    const saved = localStorage.getItem('app-settings')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed.themeColor) themeColor.value = parsed.themeColor
        if (parsed.bgUrl !== undefined) bgUrl.value = parsed.bgUrl
        if (parsed.bgOpacity !== undefined) bgOpacity.value = parsed.bgOpacity
        if (parsed.bgBlur !== undefined) bgBlur.value = parsed.bgBlur
        if (parsed.bgScale !== undefined) bgScale.value = parsed.bgScale
        if (parsed.bgTintOpacity !== undefined) bgTintOpacity.value = parsed.bgTintOpacity
      } catch (e) {
        console.error('Failed to parse settings', e)
      }
    }
    applyThemeClass()
  }

  const applyThemeClass = () => {
    document.documentElement.classList.remove('theme-purple', 'theme-blue', 'theme-emerald', 'theme-rose')
    document.documentElement.classList.add(`theme-${themeColor.value}`)
  }

  const updateSettings = (updates: Partial<{
    themeColor: ThemeColor
    bgUrl: string
    bgOpacity: number
    bgBlur: number
    bgScale: number
    bgTintOpacity: number
  }>) => {
    // Only trigger DOM class change when theme color actually changes
    const colorChanged = updates.themeColor !== undefined && updates.themeColor !== themeColor.value

    if (updates.themeColor) themeColor.value = updates.themeColor
    if (updates.bgUrl !== undefined) bgUrl.value = updates.bgUrl
    if (updates.bgOpacity !== undefined) bgOpacity.value = updates.bgOpacity
    if (updates.bgBlur !== undefined) bgBlur.value = updates.bgBlur
    if (updates.bgScale !== undefined) bgScale.value = updates.bgScale
    if (updates.bgTintOpacity !== undefined) bgTintOpacity.value = updates.bgTintOpacity

    // Only update DOM class when color actually changed — not on every slider tick
    if (colorChanged) applyThemeClass()

    // Debounced save — won't write to disk until 500ms after last change
    scheduleSave()
  }

  return {
    themeColor, bgUrl, bgOpacity, bgBlur, bgScale, bgTintOpacity,
    initSettings, updateSettings,
  }
})
