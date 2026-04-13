<template>
  <div v-if="isOpen" class="fixed inset-0 z-[9999] flex items-center justify-center">
    <!-- Backdrop -->
    <div 
      class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
      @click="close"
    ></div>

    <!-- Modal Content -->
    <div class="relative bg-white/95 dark:bg-theme-card-dark/95 backdrop-blur-lg w-full max-w-lg rounded-3xl shadow-2xl border border-white/40 dark:border-white/10 p-6 sm:p-8 m-4">
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

        <!-- Custom Background Selection -->
        <div>
          <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">自定义背景图片</h3>
          
          <div 
            @click="triggerFileSelect"
            class="relative group cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/10 hover:border-primary dark:hover:border-primary transition-all duration-300 bg-slate-50 dark:bg-slate-900/30 aspect-video flex flex-col items-center justify-center gap-3"
          >
            <!-- Preview or Placeholder -->
            <img 
              v-if="bgUrlInput" 
              :src="bgUrlInput" 
              class="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity"
            />
            
            <div class="relative z-10 flex flex-col items-center gap-2 text-slate-500 group-hover:text-primary transition-colors">
              <div v-if="isUploading" class="flex flex-col items-center gap-2">
                <svg class="w-10 h-10 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span class="text-sm font-medium">正在读取图片...</span>
              </div>
              <template v-else>
                <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <span class="text-sm font-medium">{{ bgUrlInput ? '更换背景图片' : '选择本地图片上传' }}</span>
                <span class="text-[10px] opacity-70">支持 JPG, PNG, WebP</span>
              </template>
            </div>
          </div>

          <!-- Hidden File Input -->
          <input 
            type="file" 
            ref="fileInput" 
            class="hidden" 
            accept="image/*" 
            @change="onFileSelected"
          />

          <div v-if="bgUrlInput" class="mt-3 flex justify-end">
            <button 
              @click.stop="bgUrlInput = ''; applyBgUrl()" 
              class="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1 transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              移除当前背景
            </button>
          </div>
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
import { ref, watch, onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { useDebounceFn } from '@vueuse/core'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const settings = useSettingsStore()
import { uploadImageLocally } from '@/api/supabaseData'

const bgUrlInput = ref(settings.bgUrl)
const bgOpacityInput = ref(settings.bgOpacity)
const bgBlurInput = ref(settings.bgBlur)
const bgScaleInput = ref(settings.bgScale)
const bgTintOpacityInput = ref(settings.bgTintOpacity)

const fileInput = ref<HTMLInputElement | null>(null)
const isUploading = ref(false)

const triggerFileSelect = () => {
  fileInput.value?.click()
}

const onFileSelected = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  try {
    isUploading.value = true
    const { url } = await uploadImageLocally(file)
    bgUrlInput.value = url
    applyBgUrl()
  } catch (err) {
    console.error('Failed to upload image', err)
    alert('图片选择失败，请重试')
  } finally {
    isUploading.value = false
    // Reset input value so same file can be selected again if needed
    target.value = ''
  }
}

// Sync local refs and CSS vars when modal opens
watch(() => props.isOpen, (open) => {
  if (open) {
    bgUrlInput.value = settings.bgUrl
    bgOpacityInput.value = settings.bgOpacity
    bgBlurInput.value = settings.bgBlur
    bgScaleInput.value = settings.bgScale
    bgTintOpacityInput.value = settings.bgTintOpacity
    // Ensure CSS vars match store values
    syncCssVars()
  }
})

// Direct CSS custom property update — zero Vue/VDOM overhead during slider drag
const syncCssVars = () => {
  const r = document.documentElement.style
  r.setProperty('--live-tint-opacity',  String(Number(bgTintOpacityInput.value) / 100))
  r.setProperty('--live-bg-opacity',    String(Number(bgOpacityInput.value) / 100))
  r.setProperty('--live-bg-blur',       `${bgBlurInput.value}px`)
  r.setProperty('--live-bg-scale',      String(Number(bgScaleInput.value) / 100))
}

const themeOptions = [
  { id: 'blue', name: '星空蓝', bgClass: 'bg-indigo-600', ringClass: 'ring-indigo-500' },
  { id: 'purple', name: '幻影紫', bgClass: 'bg-purple-600', ringClass: 'ring-purple-500' },
  { id: 'emerald', name: '极光绿', bgClass: 'bg-emerald-600', ringClass: 'ring-emerald-500' },
  { id: 'rose', name: '晚霞粉', bgClass: 'bg-rose-600', ringClass: 'ring-rose-500' },
]

const setTheme = (colorId: 'blue' | 'purple' | 'emerald' | 'rose') => {
  settings.updateSettings({ themeColor: colorId })
}

// Debounce URL updates to prevent network spam and string splicing bugs
const debouncedBgUpdate = useDebounceFn((url: string) => {
  settings.updateSettings({ bgUrl: url })
}, 300)

const applyBgUrl = () => {
  const url = bgUrlInput.value?.trim() || ''
  debouncedBgUpdate(url)
}

// Debounced Pinia/localStorage save — fires 500ms after last slider change
let saveTimer: ReturnType<typeof setTimeout> | null = null
const scheduleSave = () => {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    settings.updateSettings({
      bgOpacity:     Number(bgOpacityInput.value),
      bgBlur:        Number(bgBlurInput.value),
      bgScale:       Number(bgScaleInput.value),
      bgTintOpacity: Number(bgTintOpacityInput.value),
    })
    saveTimer = null
  }, 500)
}

// Slider @input handler: directly set CSS vars (instant, no Vue overhead) + schedule save
const applyBgParams = () => {
  syncCssVars()
  scheduleSave()
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
