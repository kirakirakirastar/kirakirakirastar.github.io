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
            <input v-model="tagsInput" type="text" placeholder="Vue, Vite, Markdown" class="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Markdown 内容</label>
            <div class="border rounded-lg dark:border-gray-600 overflow-hidden">
              <div class="flex flex-wrap gap-1 p-2 bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                <button type="button" @click="insertText('**', '**')" class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-bold">B</button>
                <button type="button" @click="insertText('*', '*')" class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-sm italic">I</button>
                <button type="button" @click="insertText('# ', '')" class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-bold">H1</button>
                <button type="button" @click="insertText('## ', '')" class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-bold">H2</button>
                <button type="button" @click="insertText('- ', '')" class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-sm">• 列表</button>
                <button type="button" @click="insertText('1. ', '')" class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-sm">1. 列表</button>
                <button type="button" @click="insertText('> ', '')" class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-sm">引用</button>
                <button type="button" @click="insertText('\n```\n', '\n```\n')" class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-sm">代码段</button>
                <label class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-sm cursor-pointer ml-auto flex items-center text-primary dark:text-primary-light">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  插图
                  <input type="file" accept="image/*" class="hidden" @change="handleImageUpload" />
                </label>
              </div>
              <textarea 
                ref="textareaRef"
                v-model="form.content_md" 
                required 
                rows="20" 
                class="w-full px-4 py-3 border-0 bg-white dark:bg-gray-700 font-mono text-sm outline-none resize-y focus:ring-0"
              ></textarea>
            </div>
          </div>
          <div class="flex gap-3">
            <button type="submit" :disabled="saving" class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light disabled:opacity-50 transition-colors">
              {{ saving ? '保存中...' : '保存' }}
            </button>
            <router-link to="/notes" class="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">取消</router-link>
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
import { uploadApi } from '@/api/upload'
import { resolveAssetUrl } from '@/api/http'

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
const textareaRef = ref<HTMLTextAreaElement | null>(null)

const insertText = (before: string, after: string = '') => {
  const el = textareaRef.value
  if (!el) return
  
  const start = el.selectionStart
  const end = el.selectionEnd
  const selectedText = form.value.content_md.substring(start, end)
  
  const newText = form.value.content_md.substring(0, start) + before + selectedText + after + form.value.content_md.substring(end)
  form.value.content_md = newText
  
  // Set cursor position back after Vue updates
  setTimeout(() => {
    el.focus()
    el.setSelectionRange(start + before.length, start + before.length + selectedText.length)
  }, 0)
}

const handleImageUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  try {
    const result = await uploadApi.image(file)
    const imgMd = `![${result.original_name}](${resolveAssetUrl(result.url)})`
    insertText(imgMd, '')
  } catch (error) {
    console.error('上传图片失败:', error)
    alert('图片上传失败')
  } finally {
    target.value = '' // reset
  }
}


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
    alert('保存失败，请稍后重试')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadNote()
})
</script>
