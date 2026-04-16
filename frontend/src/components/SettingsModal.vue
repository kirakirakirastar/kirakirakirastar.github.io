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
                type="range" 
                :value="bgTintOpacityInput" 
                @input="e => { bgTintOpacityInput = Number((e.target as HTMLInputElement).value); applyBgParams() }" 
                min="0" max="50" 
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
              
              <!-- Workspace Arena (Zoomed out view to show full overflow) -->
              <div v-if="bgUrlInput" class="relative bg-slate-100 dark:bg-slate-900 rounded-[2.5rem] h-[360px] flex items-center justify-center overflow-hidden border border-slate-200 dark:border-white/5 shadow-inner">
                <!-- Direct Manipulation Area (Everything inside is visually scaled down) -->
                <div class="relative w-full h-full flex items-center justify-center transform scale-[0.6] sm:scale-[0.7] transition-transform duration-500">
                  
                  <!-- Viewport (The Fixed 16:9 Frame) -->
                  <div 
                    ref="previewContainer"
                    class="relative z-30 w-[800px] aspect-video rounded-[3rem] border-8 border-primary shadow-[0_0_0_1000px_rgba(15,23,42,0.6)] cursor-move select-none"
                    @mousedown="startDrag"
                    @touchstart="startDrag"
                  >
                    <!-- Composition Grid -->
                    <div 
                      class="absolute inset-0 pointer-events-none transition-opacity duration-300 grid grid-cols-3 grid-rows-3"
                      :class="[isDragging || isResizing ? 'opacity-40' : 'opacity-0']"
                    >
                      <div v-for="i in 9" :key="i" class="border-[1px] border-white/40"></div>
                      <div class="absolute inset-0 flex items-center justify-center">
                        <div class="w-8 h-[1px] bg-primary"></div>
                        <div class="h-8 w-[1px] bg-primary"></div>
                      </div>
                    </div>

                    <!-- Handles (Optimized for Mobile) -->
                    <div @mousedown.stop="startResize" @touchstart.stop="startResize" class="absolute -top-4 -left-4 sm:-top-7 sm:-left-7 w-8 h-8 sm:w-14 sm:h-14 rounded-full bg-white border-4 sm:border-[8px] border-primary shadow-2xl hover:scale-110 active:scale-125 transition-transform cursor-nwse-resize z-40"></div>
                    <div @mousedown.stop="startResize" @touchstart.stop="startResize" class="absolute -top-4 -right-4 sm:-top-7 sm:-right-7 w-8 h-8 sm:w-14 sm:h-14 rounded-full bg-white border-4 sm:border-[8px] border-primary shadow-2xl hover:scale-110 active:scale-125 transition-transform cursor-nesw-resize z-40"></div>
                    <div @mousedown.stop="startResize" @touchstart.stop="startResize" class="absolute -bottom-4 -left-4 sm:-bottom-7 sm:-left-7 w-8 h-8 sm:w-14 sm:h-14 rounded-full bg-white border-4 sm:border-[8px] border-primary shadow-2xl hover:scale-110 active:scale-125 transition-transform cursor-nesw-resize z-40"></div>
                    <div @mousedown.stop="startResize" @touchstart.stop="startResize" class="absolute -bottom-4 -right-4 sm:-bottom-7 sm:-right-7 w-8 h-8 sm:w-14 sm:h-14 rounded-full bg-white border-4 sm:border-[8px] border-primary shadow-2xl hover:scale-110 active:scale-125 transition-transform cursor-nwse-resize z-40"></div>
                  </div>

                  <!-- The Full Image (Under the viewport) -->
                  <div class="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                    <img 
                      :src="bgUrlInput" 
                      class="max-w-none max-h-none transition-all duration-300"
                      :style="{
                        width: '800px', // Base width matches viewport
                        height: 'auto',
                        transform: `scale(${Number(bgScaleInput)/100}) translate(${Number(bgPosXInput) - 50}%, ${Number(bgPosYInput) - 50}%)`,
                        willChange: 'transform'
                      }"
                    />
                  </div>
                </div>

              </div>

              <!-- Stable Control Bar (Outside Arena) -->
              <div v-if="bgUrlInput" class="mt-4 flex flex-wrap items-center justify-between gap-3 px-1">
                <div class="flex gap-2.5">
                  <button @click.stop="triggerFileSelect" class="px-4 py-2.5 bg-primary text-white rounded-2xl text-xs font-bold transition-all flex items-center gap-2 hover:bg-primary-light shadow-lg shadow-primary/20">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    更换背景
                  </button>
                  <button @click.stop="resetPosition" class="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 border border-slate-200 dark:border-white/5">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                    重置位置
                  </button>
                </div>
                
                <button @click.stop="bgUrlInput = ''; applyBgUrl()" class="px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-2xl text-xs font-bold transition-all flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  移除背景
                </button>
              </div>

              <!-- Placeholder (When no image) -->
              <div v-if="!bgUrlInput" @click="triggerFileSelect" class="aspect-video rounded-3xl border-2 border-dashed border-slate-200 dark:border-white/10 hover:border-primary transition-all bg-slate-50 dark:bg-slate-900/30 flex flex-col items-center justify-center gap-3 cursor-pointer">
                <div v-if="isUploading" class="flex flex-col items-center gap-2">
                  <svg class="w-10 h-10 animate-spin text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  <span class="text-sm font-medium text-slate-500">正在读取图片...</span>
                </div>
                <template v-else>
                  <div class="p-4 rounded-2xl bg-white dark:bg-slate-800 shadow-sm transition-transform"><svg class="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>
                  <span class="text-sm font-bold text-slate-500">上传本地背景图片</span>
                </template>
              </div>

              <!-- Hidden File Input -->
              <input type="file" ref="fileInput" class="hidden" accept="image/jpeg,image/png,image/webp" @change="onFileSelected" />

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
                  <input type="range" :value="bgOpacityInput" @input="e => { bgOpacityInput = Number((e.target as HTMLInputElement).value); applyBgParams() }" min="0" max="100" class="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary" />
                </div>
                
                <!-- Blur -->
                <div class="col-span-2 sm:col-span-1">
                  <div class="flex justify-between mb-2 px-1">
                    <label class="text-xs font-bold text-slate-500">模糊度</label>
                    <span class="text-xs font-mono text-primary">{{ bgBlurInput }}px</span>
                  </div>
                  <input type="range" :value="bgBlurInput" @input="e => { bgBlurInput = Number((e.target as HTMLInputElement).value); applyBgParams() }" min="0" max="30" class="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary" />
                </div>

                <!-- Scale (Zoom) -->
                <div class="col-span-2">
                  <div class="flex justify-between mb-2 px-1">
                    <label class="text-xs font-bold text-slate-500">缩放与裁剪 (Zoom)</label>
                    <span class="text-xs font-mono text-primary">{{ bgScaleInput }}%</span>
                  </div>
                  <input type="range" :value="bgScaleInput" @input="e => { bgScaleInput = Number((e.target as HTMLInputElement).value); applyBgParams() }" min="10" max="800" step="1" class="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary" />
                  <p class="text-[9px] text-slate-400 mt-2">放大后配合位移滑块可实现图片裁剪效果</p>
                </div>
                
                <!-- Position X -->
                <div class="col-span-2 sm:col-span-1">
                  <div class="flex justify-between mb-2 px-1">
                    <label class="text-xs font-bold text-slate-500">水平位移</label>
                    <span class="text-xs font-mono text-primary">{{ bgPosXInput }}%</span>
                  </div>
                  <input type="range" :value="bgPosXInput" @input="e => { bgPosXInput = Number((e.target as HTMLInputElement).value); applyBgParams() }" min="-100" max="200" step="1" class="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary" />
                </div>

                <!-- Position Y -->
                <div class="col-span-2 sm:col-span-1">
                  <div class="flex justify-between mb-2 px-1">
                    <label class="text-xs font-bold text-slate-500">垂直位移</label>
                    <span class="text-xs font-mono text-primary">{{ bgPosYInput }}%</span>
                  </div>
                  <input type="range" :value="bgPosYInput" @input="e => { bgPosYInput = Number((e.target as HTMLInputElement).value); applyBgParams() }" min="-100" max="200" step="1" class="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary" />
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
import { ref, watch, nextTick } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { useDebounceFn } from '@vueuse/core'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const settings = useSettingsStore()
import { uploadApi } from '@/api/upload';
import { deleteFileByUrl } from '@/api/cleanup'
import { useUiStore } from '@/stores/ui'

const uiStore = useUiStore()

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
const previewContainer = ref<HTMLElement | null>(null)
const isUploading = ref(false)

// Manipulation State
const isDragging = ref(false)
const isResizing = ref(false)
const dragStart = { x: 0, y: 0, startPos: { x: 0, y: 0 }, startScale: 0 }

const startDrag = (e: MouseEvent | TouchEvent) => {
  if (!bgUrlInput.value) return
  isDragging.value = true
  const point = 'touches' in e ? e.touches[0] : e
  dragStart.x = point.clientX
  dragStart.y = point.clientY
  dragStart.startPos.x = bgPosXInput.value
  dragStart.startPos.y = bgPosYInput.value
  
  window.addEventListener('mousemove', onDragging)
  window.addEventListener('mouseup', endDrag)
  window.addEventListener('touchmove', onDragging, { passive: false })
  window.addEventListener('touchend', endDrag)
}

const startResize = (e: MouseEvent | TouchEvent) => {
  if (!bgUrlInput.value) return
  e.stopPropagation()
  isResizing.value = true
  const point = 'touches' in e ? e.touches[0] : e
  dragStart.x = point.clientX
  dragStart.y = point.clientY
  dragStart.startScale = bgScaleInput.value
  
  window.addEventListener('mousemove', onResizing)
  window.addEventListener('mouseup', endDrag)
  window.addEventListener('touchmove', onResizing, { passive: false })
  window.addEventListener('touchend', endDrag)
}

const onDragging = (e: MouseEvent | TouchEvent) => {
  if (!isDragging.value || !previewContainer.value) return
  if ('preventDefault' in e) e.preventDefault()
  
  const point = 'touches' in e ? e.touches[0] : e
  const dx = point.clientX - dragStart.x
  const dy = point.clientY - dragStart.y
  
  const rect = previewContainer.value.getBoundingClientRect()
  const pxSize = rect.width
  
  // Convert pixels to percentage change
  // We account for the internal fixed width of 800px used in the template
  const visualScale = pxSize / 800
  const sensitivity = 100 / (800 * visualScale)
  
  bgPosXInput.value = dragStart.startPos.x + (dx / visualScale) / 8
  bgPosYInput.value = dragStart.startPos.y + (dy / visualScale) / 4.5
  
  applyBgParams()
}

const onResizing = (e: MouseEvent | TouchEvent) => {
  if (!isResizing.value) return
  if ('preventDefault' in e) e.preventDefault()
  
  const point = 'touches' in e ? e.touches[0] : e
  const dy = dragStart.y - point.clientY // Upwards = larger
  const dx = point.clientX - dragStart.x // Rightwards = larger
  
  // Use the larger delta to drive scale
  const delta = Math.abs(dx) > Math.abs(dy) ? dx : dy
  bgScaleInput.value = Math.max(10, Math.min(400, dragStart.startScale + delta))
  
  applyBgParams()
}

const endDrag = () => {
  isDragging.value = false
  isResizing.value = false
  window.removeEventListener('mousemove', onDragging)
  window.removeEventListener('mouseup', endDrag)
  window.removeEventListener('mousemove', onResizing)
  window.removeEventListener('touchmove', onDragging)
  window.removeEventListener('touchend', endDrag)
  window.removeEventListener('touchmove', onResizing)
}

const triggerFileSelect = () => {
  fileInput.value?.click()
}

const onFileSelected = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  try {
    const oldUrl = bgUrlInput.value
    isUploading.value = true
    // 背景图片设为公开路径，存入 system-assets 桶
    const { url } = await uploadApi.image(file, false, 'system-assets')
    bgUrlInput.value = url
    applyBgUrl()

    // 清理旧背景图
    if (oldUrl && oldUrl !== url) {
      deleteFileByUrl(oldUrl)
    }
  } catch (err: any) {
    console.error('Failed to upload image', err)
    uiStore.addToast('图片选择失败', 'error', err.message || '请尝试较小的图片（建议 5MB 以下）')
  } finally {
    isUploading.value = false
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
    nextTick(syncCssVars)
  }
})

/**
 * DIRECT DOM UPDATE (PERFORMANCE CRITICAL)
 * This bypasses Vue's Reactivity System during drag to ensure 60FPS
 */
const syncCssVars = () => {
  const root = document.documentElement
  const style = root.style
  
  style.setProperty('--live-tint-opacity',  String(bgTintOpacityInput.value / 100))
  style.setProperty('--live-bg-opacity',    String(bgOpacityInput.value / 100))
  style.setProperty('--live-bg-blur',       `${bgBlurInput.value}px`)
  style.setProperty('--live-bg-scale',      String(bgScaleInput.value / 100))
  style.setProperty('--live-bg-offset-x',   `${bgPosXInput.value - 50}%`)
  style.setProperty('--live-bg-offset-y',   `${bgPosYInput.value - 50}%`)
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

// Debounce URL updates
const debouncedBgUpdate = useDebounceFn((url: string) => {
  settings.updateSettings({ bgUrl: url })
}, 300)

const applyBgUrl = () => {
  const url = bgUrlInput.value?.trim() || ''
  debouncedBgUpdate(url)
}

/**
 * Debounced Pinia Save
 * Prevents constant disk/store writes during slider movement
 */
const scheduleSave = useDebounceFn(() => {
  settings.updateSettings({
    bgOpacity:     bgOpacityInput.value,
    bgBlur:        bgBlurInput.value,
    bgScale:       bgScaleInput.value,
    bgTintOpacity: bgTintOpacityInput.value,
    bgPosX:        bgPosXInput.value,
    bgPosY:        bgPosYInput.value,
    bgFit:         bgFitInput.value,
  })
}, 150) // Short debounce for snappy state sync without blocking

/**
 * Handle Slider Input (@input)
 */
const applyBgParams = () => {
  syncCssVars()   // Instant Visual Sync (Native CSS Variable)
  scheduleSave()  // Debounced Pinia Sync (Reactivity System)
}

const resetPosition = () => {
  bgScaleInput.value = 100
  bgPosXInput.value = 50
  bgPosYInput.value = 50
  bgFitInput.value = 'cover'
  applyBgParams()
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

