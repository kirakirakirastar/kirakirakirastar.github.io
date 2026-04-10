<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">{{ isEdit ? '编辑笔记' : '新建笔记' }}</h1>
      <p class="text-gray-600 dark:text-gray-400">支持 Markdown 编写与实时预览</p>
    </div>

    <form @submit.prevent="saveNote" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">标题</label>
            <input v-model="form.title" type="text" required class="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">摘要</label>
            <input v-model="form.summary" type="text" class="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">标签（逗号分隔）</label>
            <input v-model="tagsInput" type="text" placeholder="Vue, FastAPI, SQLite" class="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Markdown 内容</label>
            <textarea v-model="form.content_md" required rows="20" class="w-full px-4 py-3 border rounded-lg font-mono text-sm dark:bg-gray-700 dark:border-gray-600"></textarea>
          </div>
          <div class="flex gap-3">
            <button type="submit" :disabled="saving" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {{ saving ? '保存中...' : '保存' }}
            </button>
            <router-link to="/notes" class="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg">取消</router-link>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold mb-4">预览</h2>
        <div class="markdown-body" v-html="previewHtml"></div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import { notesApi } from '@/api/notes'

const route = useRoute()
const router = useRouter()
const isEdit = computed(() => Boolean(route.params.id))
const saving = ref(false)
const tagsInput = ref('')
const form = ref({
  title: '',
  summary: '',
  content_md: '# 标题\n\n在这里写内容...',
})

const md = new MarkdownIt({
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return '<pre class="hljs"><code>' + hljs.highlight(str, { language: lang, ignoreIllegals: true }).value + '</code></pre>'
      } catch (_) {}
    }
    return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>'
  }
})

const previewHtml = computed(() => md.render(form.value.content_md || ''))

const loadNote = async () => {
  if (!isEdit.value) return
  const data = await notesApi.get(Number(route.params.id))
  form.value.title = data.title
  form.value.summary = data.summary
  form.value.content_md = data.content_md
  tagsInput.value = (data.tags || []).map((t: any) => t.name).join(', ')
}

const saveNote = async () => {
  saving.value = true
  try {
    const payload = {
      ...form.value,
      tags: tagsInput.value.split(',').map(t => t.trim()).filter(Boolean),
    }
    if (isEdit.value) {
      await notesApi.update(Number(route.params.id), payload)
      router.push(`/notes/${route.params.id}`)
    } else {
      const created = await notesApi.create(payload)
      router.push(`/notes/${created.id}`)
    }
  } catch (error) {
    console.error('保存笔记失败:', error)
    alert('保存失败，请检查后端是否启动')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadNote()
})
</script>
