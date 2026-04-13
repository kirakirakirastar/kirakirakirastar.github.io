<template>
  <div v-if="isOpen" class="fixed inset-0 z-[9999] flex items-center justify-center">
    <!-- Backdrop -->
    <div 
      class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
      @click="close"
    ></div>

    <!-- Modal Content -->
    <div class="relative bg-white/95 dark:bg-theme-card-dark/95 backdrop-blur-xl w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-white/40 dark:border-white/10 flex flex-col m-4 overflow-hidden max-h-[90vh]">
      <!-- Header -->
      <div class="flex justify-between items-center p-6 pb-4">
        <h2 class="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          外观设置
        </h2>
        <button @click="close" class="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-theme-bg-dark transition-colors text-slate-500">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      <!-- Tab Switcher -->
      <div class="px-6 pb-4">
        <div class="flex p-1 bg-slate-100 dark:bg-slate-800/50 rounded-2xl">
          <button 
            v-for="tab in ([{ id: 'theme', name: '主题与颜色', icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01' }, { id: 'background', name: '背景图片', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' }] as const)"
            :key="tab.id"
            @click="activeTab = tab.id"
            class="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-xl transition-all duration-300"
            :class="activeTab === tab.id 
              ? 'bg-white dark:bg-slate-600 shadow-lg shadow-primary/5 text-primary dark:text-white' 
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="tab.icon"></path></svg>
            {{ tab.name }}
          </button>
        </div>
      </div>

      <!-- Scrollable Body -->
      <div class="flex-1 overflow-y-auto px-6 sm:px-8 pb-6 custom-scrollbar">
        <div class="space-y-8 py-2">
          
          <!-- Tab: Theme Settings -->
          <template v-if="activeTab === 'theme'">
            <!-- Theme Colors -->
            <section class="animate-fade-in-up">
              <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full bg-primary"></span>
                主题强调色
              </h3>
              <div class="flex gap-4">
                <button 
                  v-for="color in themeOptions" 
                  :key="color.id"
                  @click="setTheme(color.id as any)"
                  class="relative w-12 h-12 rounded-2xl shadow-sm hover:scale-110 active:scale-95 transition-all duration-300 focus:outline-none"
                  :class="[
                    color.bgClass,
                    settings.themeColor === color.id ? 'ring-4 ring-offset-2 dark:ring-offset-slate-900 ' + color.ringClass : ''
                  ]"
                  :title="color.name"
                >
                  <svg v-if="settings.themeColor === color.id" class="w-6 h-6 text-white absolute inset-0 m-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                </button>
              </div>
            </section>

            <!-- Theme Tint Control -->
            <section class="animate-fade-in-up" style="animation-delay: 0.1s">
              <div class="flex justify-between mb-3">
                <label class="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <span class="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  主题色彩感 (Intensity)
                </label>
                <span class="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-full">{{ bgTintOpacityInput }}%</span>
              </div>
              <input 
                type="range" v-model="bgTintOpacityInput" @input="applyBgParams" min="0" max="50" 
                class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-primary"
              />
              <p class="text-[10px] text-slate-400 mt-2 px-1">调节此滑块可让全局背景（包括自定义图片）向主题色靠拢</p>
            </section>
          </template>

          <!-- Tab: Background Settings -->
          <template v-else>
            <!-- Custom Background Selection -->
            <section class="animate-fade-in-up">
              <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full bg-primary"></span>
                自定义背景图片
              </h3>
              
              <div 
                @click="triggerFileSelect"
                class="relative group cursor-pointer overflow-hidden rounded-3xl border-2 border-dashed border-slate-200 dark:border-white/10 hover:border-primary dark:hover:border-primary transition-all duration-500 bg-slate-50 dark:bg-slate-900/30 aspect-video flex flex-col items-center justify-center gap-3"
              >
                <!-- Preview or Placeholder -->
                <img 
                  v-if="bgUrlInput" 
                  :src="bgUrlInput" 
                  class="absolute inset-0 w-full h-full opacity-60 group-hover:opacity-40 transition-all duration-500"
                  :class="[bgFitInput === 'cover' ? 'object-cover' : 'object-contain']"
                  :style="{
                    transform: `scale(${Number(bgScaleInput)/100})`,
                    objectPosition: `${bgPosXInput}% ${bgPosYInput}%`
                  }"
                />
                
                <div class="relative z-10 flex flex-col items-center gap-2 text-slate-500 group-hover:text-primary transition-colors duration-300">
                  <div v-if="isUploading" class="flex flex-col items-center gap-2">
                    <svg class="w-10 h-10 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span class="text-sm font-medium">正在读取图片...</span>
                  </div>
                  <template v-else>
                    <div class="p-4 rounded-2xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-md shadow-sm group-hover:scale-110 transition-transform duration-500">
                      <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                    <span class="text-sm font-bold mt-1">{{ bgUrlInput ? '更换图片' : '上传本地背景' }}</span>
                  </template>
                </div>
              </div>

              <!-- Hidden File Input -->
              <input type="file" ref="fileInput" class="hidden" accept="image/*" @change="onFileSelected" />

              <div v-if="bgUrlInput" class="mt-4 flex justify-end">
                <button 
                  @click.stop="bgUrlInput = ''; applyBgUrl()" 
                  class="text-xs text-red-500 hover:text-red-600 font-bold flex items-center gap-1.5 transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  移除背景
                </button>
              </div>
            </section>

            <!-- Background Detailed Controls -->
            <section v-if="bgUrlInput" class="animate-fade-in-up space-y-6">
              <div class="grid grid-cols-2 gap-x-6 gap-y-6 p-5 rounded-[2rem] bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-white/5">
                <!-- Opacity -->
                <div class="col-span-2 sm:col-span-1">
                  <div class="flex justify-between mb-2 px-1">
                    <label class="text-xs font-bold text-slate-500">透明度</label>
                    <span class="text-xs font-mono text-primary">{{ bgOpacityInput }}%</span>
                  </div>
                  <input type="range" v-model="bgOpacityInput" @input="applyBgParams" min="0" max="100" class="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary" />
                </div>
                
                <!-- Blur -->
                <div class="col-span-2 sm:col-span-1">
                  <div class="flex justify-between mb-2 px-1">
                    <label class="text-xs font-bold text-slate-500">模糊度</label>
                    <span class="text-xs font-mono text-primary">{{ bgBlurInput }}px</span>
                  </div>
                  <input type="range" v-model="bgBlurInput" @input="applyBgParams" min="0" max="30" class="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary" />
                </div>

                <!-- Scale (Zoom) -->
                <div class="col-span-2">
                  <div class="flex justify-between mb-2 px-1">
                    <label class="text-xs font-bold text-slate-500">缩放与裁剪 (Zoom)</label>
                    <span class="text-xs font-mono text-primary">{{ bgScaleInput }}%</span>
                  </div>
                  <input type="range" v-model="bgScaleInput" @input="applyBgParams" min="100" max="400" step="1" class="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary" />
                  <p class="text-[9px] text-slate-400 mt-2">放大后配合位移滑块可实现图片裁剪效果</p>
                </div>
                
                <!-- Position X -->
                <div class="col-span-2 sm:col-span-1">
                  <div class="flex justify-between mb-2 px-1">
                    <label class="text-xs font-bold text-slate-500">水平位移</label>
                    <span class="text-xs font-mono text-primary">{{ bgPosXInput }}%</span>
                  </div>
                  <input type="range" v-model="bgPosXInput" @input="applyBgParams" min="0" max="100" class="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary" />
                </div>

                <!-- Position Y -->
                <div class="col-span-2 sm:col-span-1">
                  <div class="flex justify-between mb-2 px-1">
                    <label class="text-xs font-bold text-slate-500">垂直位移</label>
                    <span class="text-xs font-mono text-primary">{{ bgPosYInput }}%</span>
                  </div>
                  <input type="range" v-model="bgPosYInput" @input="applyBgParams" min="0" max="100" class="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary" />
                </div>

                <!-- Fit Mode -->
                <div class="col-span-2">
                  <div class="flex justify-between mb-2 px-1">
                    <label class="text-xs font-bold text-slate-500">填充模式</label>
                  </div>
                  <div class="flex p-1 bg-white/50 dark:bg-slate-900/50 rounded-xl border border-slate-200/50 dark:border-white/5">
                    <button 
                      v-for="mode in (['cover', 'contain'] as const)" :key="mode"
                      @click="bgFitInput = mode; applyBgParams()"
                      class="flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all"
                      :class="bgFitInput === mode ? 'bg-primary text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'"
                    >
                      {{ mode === 'cover' ? '覆盖 (Cover)' : '包含 (Contain)' }}
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </template>
        </div>
      </div>
      
      <!-- Footer -->
      <div class="p-6 pt-4 border-t border-slate-100 dark:border-white/5 flex justify-between items-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
        <button 
          @click="resetBackground" 
          class="px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
        >
          恢复默认
        </button>
        <button 
          @click="close" 
          class="px-8 py-2.5 bg-primary hover:bg-primary-light text-white rounded-2xl font-bold transition-all shadow-lg shadow-primary/25 active:scale-95"
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
import { useDebounceFn } from '@vueuse/core'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const settings = useSettingsStore()
import { uploadImageLocally } from '@/api/supabaseData'

const activeTab = ref<'theme' | 'background'>('theme')
const bgUrlInput = ref(settings.bgUrl)
const bgOpacityInput = ref(settings.bgOpacity)
const bgBlurInput = ref(settings.bgBlur)
const bgScaleInput = ref(settings.bgScale)
const bgTintOpacityInput = ref(settings.bgTintOpacity)
const bgPosXInput = ref(settings.bgPosX)
const bgPosYInput = ref(settings.bgPosY)
const bgFitInput = ref(settings.bgFit)

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
    bgPosXInput.value = settings.bgPosX
    bgPosYInput.value = settings.bgPosY
    bgFitInput.value = settings.bgFit
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
  r.setProperty('--live-bg-pos-x',      `${bgPosXInput.value}%`)
  r.setProperty('--live-bg-pos-y',      `${bgPosYInput.value}%`)
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
      bgPosX:        Number(bgPosXInput.value),
      bgPosY:        Number(bgPosYInput.value),
      bgFit:         bgFitInput.value,
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
  bgPosXInput.value = 50
  bgPosYInput.value = 50
  bgFitInput.value = 'cover'
  applyBgUrl()
  applyBgParams()
  setTheme('blue')
}

const close = () => {
  emit('close')
}
</script>
