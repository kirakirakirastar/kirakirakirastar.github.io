<template>
  <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center">
    <!-- Backdrop -->
    <div 
      class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
      @click="close"
    ></div>

    <!-- Modal Content -->
    <div class="relative bg-white/90 dark:bg-theme-card-dark/95 backdrop-blur-2xl w-full max-w-lg rounded-3xl shadow-2xl border border-white/40 dark:border-white/10 p-6 sm:p-8 m-4 transform transition-all">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          外观设置
        </h2>
        <button @click="close" class="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-theme-bg-dark transition-colors text-slate-500">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      <div class="space-y-8">
        <!-- Theme Colors -->
        <div>
          <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">主题强调色</h3>
          <div class="flex gap-4">
            <button 
              v-for="color in themeOptions" 
              :key="color.id"
              @click="setTheme(color.id as any)"
              class="relative w-10 h-10 rounded-full shadow-sm hover:scale-110 transition-transform focus:outline-none"
              :class="[
                color.bgClass,
                settings.themeColor === color.id ? 'ring-4 ring-offset-2 dark:ring-offset-slate-800 ' + color.ringClass : ''
              ]"
              :title="color.name"
            ></button>
          </div>
        </div>

        <!-- Custom Background URL -->
        <div>
          <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">自定义背景图片 URL</h3>
          <input 
            v-model="bgUrlInput" 
            type="text" 
            placeholder="https://example.com/wallpaper.jpg"
            class="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-slate-200"
            @change="applyBgUrl"
          />
          <p class="text-xs text-slate-500 mt-2">留空以使用默认纯色背景</p>
        </div>

        <!-- Background Controls -->
        <div v-if="bgUrlInput" class="space-y-5 p-4 rounded-2xl bg-slate-50 dark:bg-theme-bg-dark/30 border border-slate-100 dark:border-white/5">
          <div>
            <div class="flex justify-between mb-2">
              <label class="text-sm font-medium text-slate-600 dark:text-slate-400">背景透明度: {{ bgOpacityInput }}%</label>
            </div>
            <input 
              type="range" v-model="bgOpacityInput" @input="applyBgParams" min="0" max="100" 
              class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-primary"
            />
          </div>
          <div>
            <div class="flex justify-between mb-2">
              <label class="text-sm font-medium text-slate-600 dark:text-slate-400">背景模糊度: {{ bgBlurInput }}px</label>
            </div>
            <input 
              type="range" v-model="bgBlurInput" @input="applyBgParams" min="0" max="30" 
              class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-primary"
            />
          </div>
          <div>
            <div class="flex justify-between mb-2">
              <label class="text-sm font-medium text-slate-600 dark:text-slate-400">背景缩放 (Scale): {{ bgScaleInput }}%</label>
            </div>
            <input 
              type="range" v-model="bgScaleInput" @input="applyBgParams" min="50" max="150" 
              class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-primary"
            />
          </div>
        </div>

        <!-- Theme Tint Control (Always Visible) -->
        <div class="space-y-4">
          <div class="flex justify-between mb-1">
            <label class="text-sm font-semibold text-slate-700 dark:text-slate-300">主题色彩感 (Intensity): {{ bgTintOpacityInput }}%</label>
          </div>
          <input 
            type="range" v-model="bgTintOpacityInput" @input="applyBgParams" min="0" max="50" 
            class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-primary"
          />
          <p class="text-[10px] text-slate-400">调节此滑块可让全局背景（包括自定义图片）向主题色靠拢</p>
        </div>
      </div>
      
      <div class="mt-8 flex justify-end">
        <button 
          @click="resetBackground" 
          class="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mr-auto"
        >
          恢复默认
        </button>
        <button 
          @click="close" 
          class="px-6 py-2 bg-primary hover:bg-primary-light text-white rounded-xl font-medium transition-colors shadow-lg shadow-primary"
        >
          完成
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useSettingsStore } from '@/stores/settings'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const settings = useSettingsStore()

const bgUrlInput = ref(settings.bgUrl)
const bgOpacityInput = ref(settings.bgOpacity)
const bgBlurInput = ref(settings.bgBlur)
const bgScaleInput = ref(settings.bgScale)
const bgTintOpacityInput = ref(settings.bgTintOpacity)

// Watch for external store changes (optional)
watch(() => settings.bgUrl, (val) => bgUrlInput.value = val)
watch(() => settings.bgOpacity, (val) => bgOpacityInput.value = val)
watch(() => settings.bgBlur, (val) => bgBlurInput.value = val)
watch(() => settings.bgScale, (val) => bgScaleInput.value = val)
watch(() => settings.bgTintOpacity, (val) => bgTintOpacityInput.value = val)

const themeOptions = [
  { id: 'blue', name: '星空蓝', bgClass: 'bg-indigo-600', ringClass: 'ring-indigo-500' },
  { id: 'purple', name: '幻影紫', bgClass: 'bg-purple-600', ringClass: 'ring-purple-500' },
  { id: 'emerald', name: '极光绿', bgClass: 'bg-emerald-600', ringClass: 'ring-emerald-500' },
  { id: 'rose', name: '晚霞粉', bgClass: 'bg-rose-600', ringClass: 'ring-rose-500' },
]

const setTheme = (colorId: 'blue' | 'purple' | 'emerald' | 'rose') => {
  settings.updateSettings({ themeColor: colorId })
}

const applyBgUrl = () => {
  settings.updateSettings({ bgUrl: bgUrlInput.value })
}

const applyBgParams = () => {
  settings.updateSettings({ 
    bgOpacity: Number(bgOpacityInput.value),
    bgBlur: Number(bgBlurInput.value),
    bgScale: Number(bgScaleInput.value),
    bgTintOpacity: Number(bgTintOpacityInput.value)
  })
}

const resetBackground = () => {
  bgUrlInput.value = ''
  bgOpacityInput.value = 50
  bgBlurInput.value = 0
  bgScaleInput.value = 100
  bgTintOpacityInput.value = 10
  applyBgUrl()
  applyBgParams()
  setTheme('blue')
}

const close = () => {
  emit('close')
}
</script>
