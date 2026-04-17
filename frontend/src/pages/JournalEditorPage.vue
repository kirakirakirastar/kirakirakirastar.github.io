<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">{{ isEdit ? '编辑日志' : '新建日志' }}</h1>
      <p class="text-gray-600 dark:text-gray-400">富文本编辑，支持图片上传与多种格式</p>
    </div>

    <form @submit.prevent="saveJournal" class="space-y-6">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-2">标题</label>
            <input v-model="form.title" type="text" required class="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">分类文件夹</label>
            <select v-model="form.folder_id" class="w-full px-4 py-2 border rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-secondary outline-none transition-shadow cursor-pointer">
              <option :value="null">未分类</option>
              <option v-for="folder in folders" :key="folder.id" :value="folder.id">{{ folder.name }}</option>
            </select>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">摘要</label>
          <input v-model="form.excerpt" type="text" class="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">标签（逗号分隔）</label>
          <input v-model="tagsInput" type="text" placeholder="生活, 随笔, 计划" class="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" />
        </div>

        <div class="flex items-center gap-3 py-2">
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" v-model="form.is_private" class="sr-only peer" />
            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-secondary/20 rounded-full peer dark:bg-gray-700 peer-checked:bg-secondary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
          </label>
          <div class="flex flex-col">
            <span class="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <svg v-if="form.is_private" class="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
              </svg>
              私密日志
            </span>
            <span class="text-[10px] text-slate-500">仅登录后可见。</span>
          </div>
        </div>

        <!-- Rich Text Toolbar -->
        <div>
          <label class="block text-sm font-medium mb-2">内容</label>
          <div class="border rounded-lg dark:border-gray-600 overflow-hidden">
            <div class="flex flex-wrap gap-1 p-2 bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
              <button type="button" @click="editor?.chain().focus().toggleBold().run()" :class="{ 'bg-gray-200 dark:bg-gray-600': editor?.isActive('bold') }" class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-bold">B</button>
              <button type="button" @click="editor?.chain().focus().toggleItalic().run()" :class="{ 'bg-gray-200 dark:bg-gray-600': editor?.isActive('italic') }" class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-sm italic">I</button>
              <button type="button" @click="editor?.chain().focus().toggleHeading({ level: 1 }).run()" :class="{ 'bg-gray-200 dark:bg-gray-600': editor?.isActive('heading', { level: 1 }) }" class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-sm">H1</button>
              <button type="button" @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()" :class="{ 'bg-gray-200 dark:bg-gray-600': editor?.isActive('heading', { level: 2 }) }" class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-sm">H2</button>
              <button type="button" @click="editor?.chain().focus().toggleBulletList().run()" :class="{ 'bg-secondary/20 text-secondary': editor?.isActive('bulletList') }" class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-sm">• 列表</button>
              <button type="button" @click="editor?.chain().focus().toggleOrderedList().run()" :class="{ 'bg-secondary/20 text-secondary': editor?.isActive('orderedList') }" class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-sm">1. 列表</button>
              <button type="button" @click="editor?.chain().focus().toggleBlockquote().run()" :class="{ 'bg-secondary/20 text-secondary': editor?.isActive('blockquote') }" class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-sm">引用</button>
              <button type="button" @click="editor?.chain().focus().toggleCodeBlock().run()" :class="{ 'bg-secondary/20 text-secondary': editor?.isActive('codeBlock') }" class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-sm">代码</button>
              <button type="button" @click="editor?.chain().focus().undo().run()" class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-sm">撤销</button>
              <button type="button" @click="editor?.chain().focus().redo().run()" class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-sm">重做</button>
              
              <div class="w-px h-4 bg-gray-300 dark:bg-gray-600 self-center mx-1"></div>
              
              <div class="flex items-center gap-1 ml-1 group relative">
                <input 
                  type="color" 
                  class="w-8 h-8 p-0 border-none bg-transparent cursor-pointer"
                  :value="editor?.getAttributes('textStyle').color || '#000000'"
                  @input="(e) => editor?.chain().focus().setColor((e.target as HTMLInputElement).value).run()"
                  title="文字颜色"
                />
                <button type="button" @click="editor?.chain().focus().unsetColor().run()" class="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-400 hover:text-red-500 transition-colors" title="清除颜色">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>

              <button type="button" 
                @click="editor?.getAttributes('textStyle').backgroundColor ? editor?.chain().focus().setMark('textStyle', { backgroundColor: null }).run() : editor?.chain().focus().setMark('textStyle', { backgroundColor: 'yellow' }).run()" 
                :class="{ 'bg-yellow-200 dark:bg-yellow-900/40 text-slate-900 dark:text-yellow-100': editor?.getAttributes('textStyle').backgroundColor }" 
                class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-sm" title="背景高亮">M</button>

              <label class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-sm cursor-pointer">
                插入图片
                <input type="file" accept="image/*" class="hidden" @change="handleImageUpload" />
              </label>
            </div>
            <EditorContent :editor="editor" class="markdown-editor-view max-w-none p-4 min-h-[150px]" />
          </div>
        </div>

        <div class="flex gap-3">
          <button type="submit" :disabled="saving" class="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary-light disabled:opacity-50 transition-colors">
            {{ saving ? '保存中...' : '保存' }}
          </button>
          <router-link to="/journals" class="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">取消</router-link>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { EditorContent } from '@tiptap/vue-3'
import { useMarkdownEditor } from '@/hooks/useMarkdownEditor'

import { journalsApi } from '@/api/journals'
import { supabaseFoldersApi } from '@/api/supabaseData'
import { resolveAssetUrl } from '@/api/http'
import { uploadApi } from '@/api/upload'
import { useUiStore } from '@/stores/ui'
import { validateAndSanitizeMarkdown, convertLegacyHTMLToBBCode, renderMarkdownToHTML } from '@/utils/markdown-sanitizer'

const uiStore = useUiStore()
const route = useRoute()
const router = useRouter()
const isEdit = computed(() => Boolean(route.params.id))
const saving = ref(false)
const tagsInput = ref('')
const folders = ref<any[]>([])
const form = ref({
  title: '',
  excerpt: '',
  content_md: '',
  folder_id: null as number | null,
  is_private: false,
})

const { editor, getEditorColor, handleImageUpload } = useMarkdownEditor({
  placeholder: '在这里写日志...',
  onUpdate: (markdown) => {
    form.value.content_md = markdown
  },
  isPrivate: computed(() => form.value.is_private),
  imageBucket: 'journals-images'
})

const loadJournal = async () => {
  if (!isEdit.value) return
  const data = await journalsApi.get(Number(route.params.id))
  form.value.title = data.title
  form.value.excerpt = data.excerpt
  form.value.content_md = data.content_md
  form.value.folder_id = data.folder_id
  form.value.is_private = data.is_private || false
  tagsInput.value = (data.tags || []).map((t: any) => t.name).join(', ')
  editor.value?.commands.setContent(renderMarkdownToHTML(data.content_md || ''))
  form.value.content_md = data.content_md
}

const loadFolders = async () => {
  try {
    folders.value = await supabaseFoldersApi.list('journal')
  } catch (error) {
    console.error('加载文件夹失败:', error)
  }
}



const saveJournal = async () => {
  saving.value = true
  try {
    const currentMarkdown = editor.value?.storage.markdown.getMarkdown() || form.value.content_md
    const sanitizedMarkdown = validateAndSanitizeMarkdown(currentMarkdown)

    const payload = {
      ...form.value,
      content_md: sanitizedMarkdown,
      tags: tagsInput.value.split(',').map(t => t.trim()).filter(Boolean),
    }
    if (isEdit.value) {
      await journalsApi.update(Number(route.params.id), payload)
      uiStore.addToast('保存成功', 'success')
      router.push(`/journals/${route.params.id}`)
    } else {
      const created = await journalsApi.create(payload)
      uiStore.addToast('保存成功', 'success')
      router.push(`/journals/${created.id}`)
    }
  } catch (error) {
    console.error('保存日志失败:', error)
    uiStore.addToast('保存失败', 'error', '请稍后重试')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadJournal()
  loadFolders()
})

onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<style>
/* TipTap editor styles */
.ProseMirror {
  outline: none;
}
.ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: #9ca3af;
  pointer-events: none;
  height: 0;
}
.ProseMirror img {
  max-width: 100%;
  height: auto;
  border-radius: 0.5rem;
}
</style>
