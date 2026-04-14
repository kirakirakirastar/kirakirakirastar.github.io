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
            <p class="text-gray-500">{{ formatDate(note.created_at) }}</p>
          </div>
          <div v-if="authStore.user" class="flex gap-2">
            <router-link
              :to="`/notes/${note.id}/edit`"
              class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors"
            >
              编辑
            </router-link>
            <button
              @click="deleteNote"
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import dayjs from 'dayjs'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import { notesApi } from '@/api/notes'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()
const loading = ref(true)
const note = ref<any>(null)

const md: MarkdownIt = new MarkdownIt({
  html: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return '<pre class="hljs"><code>' +
               hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
               '</code></pre>'
      } catch (_) {}
    }
    return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>'
  }
})

const renderedContent = computed(() => {
  if (!note.value) return ''
  return md.render(note.value.content_md)
})

const formatDate = (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm')

const loadNote = async () => {
  try {
    note.value = await notesApi.get(Number(route.params.id))
  } catch (error) {
    console.error('加载笔记失败:', error)
  } finally {
    loading.value = false
  }
}

const deleteNote = async () => {
  if (!confirm('确定要删除这篇笔记吗？')) return

  try {
    await notesApi.delete(Number(route.params.id))
    router.push('/notes')
  } catch (error) {
    console.error('删除笔记失败:', error)
  }
}

onMounted(() => {
  loadNote()
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
