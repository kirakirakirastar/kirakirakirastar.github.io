<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div v-if="loading" class="text-center py-12 text-gray-500">加载中...</div>
    <div v-else-if="!note" class="text-center py-12 text-gray-500">笔记不存在</div>
    <div v-else>
      <!-- Header -->
      <div class="mb-8">
        <div class="flex justify-between items-start mb-4">
          <div>
            <h1 class="text-3xl font-bold mb-2">{{ note.title }}</h1>
            <div class="flex flex-wrap gap-2 mb-4">
              <span
                v-for="tag in note.tags"
                :key="tag.id"
                class="px-2 py-1 text-xs bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light rounded"
              >
                {{ tag.name }}
              </span>
            </div>
            <div class="flex items-center gap-4 text-gray-500 text-sm">
              <span v-if="note.is_private" class="flex items-center gap-1.5 px-2 py-0.5 bg-amber-500/10 text-amber-600 rounded-md font-bold text-[10px] border border-amber-500/20">
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"></path></svg>
                仅您可见
              </span>
              <div class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                <span class="flex items-center gap-1">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  发布于 {{ formatDate(note.created_at) }}
                </span>
                <span v-if="note.updated_at && note.updated_at !== note.created_at" class="flex items-center gap-1">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                  修改于 {{ formatDate(note.updated_at) }}
                </span>
              </div>
              <span class="flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                预计阅读 {{ readingTime }} 分钟
              </span>
            </div>
          </div>
          <div v-if="authStore.user" class="flex gap-2">
            <router-link
              :to="`/notes/${note.id}/edit`"
              class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors"
            >
              编辑
            </router-link>
            <button
              @click="handleDelete"
              class="px-4 py-2 bg-red-600/10 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-all duration-300"
            >
              删除
            </button>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-8 overflow-hidden break-words">
        <div 
          :key="note.id + '_' + renderCounter"
          class="markdown-body" 
          v-html="renderedContent" 
          @click="handleCopyCode"
        ></div>
      </div>
      <!-- Scroll to Top Button -->
      <button 
        v-if="showScrollTop"
        @click="scrollToTop"
        class="fixed bottom-8 right-8 p-3 bg-primary text-white rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all z-50 mr-4"
        title="回到顶部"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import dayjs from 'dayjs'
import mermaid from 'mermaid'
import 'katex/dist/katex.min.css'
import { renderMarkdown } from '@/utils/markdown'
import { notesApi } from '@/api/notes'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import { calculateReadingTime } from '@/utils/text'

const uiStore = useUiStore()
const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()
const loading = ref(true)
const note = ref<any>(null)
const renderCounter = ref(0)

const renderedContent = computed(() => {
  if (!note.value) return ''
  return renderMarkdown(note.value.content_md)
})

const readingTime = computed(() => {
  return calculateReadingTime(note.value?.content_md)
})

const showScrollTop = ref(false)
const handleScroll = () => {
  showScrollTop.value = window.scrollY > 400
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const formatDate = (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm')

const handleCopyCode = async (event: MouseEvent) => {
  const target = event.target as HTMLElement
  const btn = target.closest('.copy-code-btn')
  if (!btn) return
  
  const code = decodeURIComponent(btn.getAttribute('data-code') || '')
  try {
    await navigator.clipboard.writeText(code)
    uiStore.addToast('代码已复制到剪贴板', 'success')
    
    // Feedback: temporary icon change
    const originalIcon = btn.innerHTML
    btn.innerHTML = `<svg class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`
    setTimeout(() => { btn.innerHTML = originalIcon }, 2000)
  } catch (err) {
    uiStore.addToast('复制失败', 'error')
  }
}

const loadNote = async () => {
  try {
    note.value = await notesApi.get(Number(route.params.id))
    renderCounter.value++
    document.title = `${note.value.title} | Kirakirastar's Blog`
  } catch (error) {
    console.error('加载笔记失败:', error)
    uiStore.addToast('加载失败', 'error', '无法获取笔记详情')
  } finally {
    loading.value = false
  }
}

const handleDelete = async () => {
  if (!confirm('确定要删除这篇笔记吗？')) return

  try {
    await notesApi.delete(Number(route.params.id))
    uiStore.addToast('删除成功', 'success')
    router.push('/notes')
  } catch (error) {
    console.error('删除笔记失败:', error)
    uiStore.addToast('删除失败', 'error', '请稍后重试')
  }
}

onMounted(async () => {
  await loadNote()
  window.addEventListener('scroll', handleScroll)
  
  mermaid.initialize({ 
    startOnLoad: false,
    theme: document.documentElement.classList.contains('dark') ? 'dark' : 'default',
    securityLevel: 'loose'
  })
  mermaid.run({ querySelector: '.mermaid' })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

watch(renderedContent, async () => {
  await nextTick()
  mermaid.run({ querySelector: '.mermaid' })
})
</script>

<style scoped>
:deep(.hljs) {
  background: #f3f4f6;
  color: #1f2937;
}

:global(.dark) :deep(.hljs) {
  background: #1f2937;
  color: #f3f4f6;
}
</style>
