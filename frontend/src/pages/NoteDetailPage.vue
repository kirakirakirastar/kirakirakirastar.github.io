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
              <span>{{ formatDate(note.created_at) }}</span>
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
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-8">
        <div class="markdown-body" v-html="renderedContent"></div>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { renderMarkdown } from '@/utils/markdown'
import { notesApi } from '@/api/notes'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'

const uiStore = useUiStore()
const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()
const loading = ref(true)
const note = ref<any>(null)

const renderedContent = computed(() => {
  if (!note.value) return ''
  return renderMarkdown(note.value.content_md)
})

const readingTime = computed(() => {
  if (!note.value?.content_md) return 0
  const words = note.value.content_md.trim().split(/\s+/).length
  const minutes = Math.ceil(words / 200)
  return minutes > 0 ? minutes : 1
})

const showScrollTop = ref(false)
const handleScroll = () => {
  showScrollTop.value = window.scrollY > 400
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const formatDate = (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm')

const loadNote = async () => {
  try {
    note.value = await notesApi.get(Number(route.params.id))
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

onMounted(() => {
  loadNote()
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
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
