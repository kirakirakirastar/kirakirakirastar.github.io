<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">{{ isEdit ? '编辑笔记' : '新建笔记' }}</h1>
      <p class="text-gray-600 dark:text-gray-400">富文本编辑，所见即所得，并向下兼容 Markdown 格式读取</p>
    </div>

    <form @submit.prevent="saveNote" class="space-y-6">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-2">标题</label>
            <input v-model="form.title" type="text" required class="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">分类文件夹</label>
            <select v-model="form.folder_id" class="w-full px-4 py-2 border rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary outline-none transition-shadow cursor-pointer">
              <option :value="null">未分类</option>
              <option v-for="folder in folders" :key="folder.id" :value="folder.id">{{ folder.name }}</option>
            </select>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">摘要</label>
          <input v-model="form.summary" type="text" class="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">标签（逗号分隔）</label>
          <input v-model="tagsInput" type="text" placeholder="Vue, Vite, Markdown" class="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" />
        </div>

        <div class="flex items-center gap-3 py-2">
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" v-model="form.is_private" class="sr-only peer">
            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/30 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
          </label>
          <div class="flex flex-col">
            <span class="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <svg v-if="form.is_private" class="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"></path></svg>
              私密发布
            </span>
            <span class="text-[10px] text-slate-500">私密内容不会在未登录状态下显示。</span>
          </div>
        </div>

        <!-- Rich Text Toolbar -->
        <div>
          <label class="block text-sm font-medium mb-2">内容</label>
          <div class="border rounded-lg dark:border-gray-600 overflow-hidden">
            <div class="flex flex-wrap gap-1 p-2 bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
              <!-- Text Style Group -->
              <div class="flex items-center border-r dark:border-gray-600 pr-1 mr-1">
                <button type="button" @click="editor?.chain().focus().toggleBold().run()" :class="{ 'bg-gray-200 dark:bg-gray-600': editor?.isActive('bold') }" class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-bold" title="加粗">B</button>
                <button type="button" @click="editor?.chain().focus().toggleItalic().run()" :class="{ 'bg-gray-200 dark:bg-gray-600': editor?.isActive('italic') }" class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-sm italic" title="斜体">I</button>
                <button type="button" @click="editor?.chain().focus().toggleUnderline().run()" :class="{ 'bg-gray-200 dark:bg-gray-600': editor?.isActive('underline') }" class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-sm underline" title="下划线">U</button>
                <button type="button" @click="editor?.chain().focus().toggleStrike().run()" :class="{ 'bg-gray-200 dark:bg-gray-600': editor?.isActive('strike') }" class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-sm line-through" title="删除线 (Ctrl+D)">S</button>
                <button type="button" @click="editor?.chain().focus().toggleMask().run()" :class="{ 'bg-slate-900 text-white': editor?.isActive('mask') }" class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-sm" title="黑条/马赛克 (Ctrl+M)">■</button>
                <input type="color" @input="editor?.chain().focus().setColor(($event.target as HTMLInputElement).value).run()" :value="editor?.getAttributes('textStyle').color || '#000000'" class="w-6 h-6 p-0 border-0 bg-transparent cursor-pointer ml-1" title="文字颜色" />
                <button type="button" @click="editor?.chain().focus().toggleHighlight().run()" :class="{ 'bg-yellow-200 dark:bg-yellow-900/40': editor?.isActive('highlight') }" class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-sm" title="背景高亮">M</button>
                <button type="button" @click="editor?.chain().focus().toggleCode().run()" :class="{ 'bg-gray-200 dark:bg-gray-600': editor?.isActive('code') }" class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-mono" title="行内代码">C</button>
              </div>

              <!-- Headings Group -->
              <div class="flex border-r dark:border-gray-600 pr-1 mr-1">
                <button type="button" @click="editor?.chain().focus().toggleHeading({ level: 1 }).run()" :class="{ 'bg-gray-200 dark:bg-gray-600': editor?.isActive('heading', { level: 1 }) }" class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-sm" title="一级标题">H1</button>
                <button type="button" @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()" :class="{ 'bg-gray-200 dark:bg-gray-600': editor?.isActive('heading', { level: 2 }) }" class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-sm" title="二级标题">H2</button>
                <button type="button" @click="editor?.chain().focus().toggleHeading({ level: 3 }).run()" :class="{ 'bg-gray-200 dark:bg-gray-600': editor?.isActive('heading', { level: 3 }) }" class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-sm" title="三级标题">H3</button>
                <button type="button" @click="editor?.chain().focus().toggleHeading({ level: 4 }).run()" :class="{ 'bg-gray-200 dark:bg-gray-600': editor?.isActive('heading', { level: 4 }) }" class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-sm" title="四级标题">H4</button>
              </div>

              <!-- List Group -->
              <div class="flex border-r dark:border-gray-600 pr-1 mr-1">
                <button type="button" @click="editor?.chain().focus().toggleBulletList().run()" :class="{ 'bg-primary/20 text-primary': editor?.isActive('bulletList') }" class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-sm" title="无序列表">•</button>
                <button type="button" @click="editor?.chain().focus().toggleOrderedList().run()" :class="{ 'bg-primary/20 text-primary': editor?.isActive('orderedList') }" class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-sm" title="有序列表">1.</button>
                <button type="button" @click="editor?.chain().focus().toggleTaskList().run()" :class="{ 'bg-primary/20 text-primary': editor?.isActive('taskList') }" class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-sm" title="任务列表">[]</button>
              </div>

              <!-- Structure Group -->
              <div class="flex border-r dark:border-gray-600 pr-1 mr-1">
                <button type="button" @click="editor?.chain().focus().toggleBlockquote().run()" :class="{ 'bg-primary/20 text-primary': editor?.isActive('blockquote') }" class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-sm" title="引用 blockquote">引用</button>
                <button type="button" @click="editor?.chain().focus().toggleCodeBlock().run()" :class="{ 'bg-primary/20 text-primary': editor?.isActive('codeBlock') }" class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-sm" title="代码块 block">代码块</button>
                <button type="button" @click="editor?.chain().focus().setHorizontalRule().run()" class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-sm" title="分割线 divider">分割线</button>
              </div>

              <!-- Tables -->
              <div class="flex border-r dark:border-gray-600 pr-1 mr-1">
                <button type="button" @click="editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()" class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-sm" title="插入表格">表格</button>
              </div>

              <!-- History & Media -->
              <div class="flex gap-1">
                <button type="button" @click="editor?.chain().focus().undo().run()" class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-sm" title="撤销 undo">撤销</button>
                <button type="button" @click="editor?.chain().focus().redo().run()" class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-sm" title="重做 redo">重做</button>
                <label class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-sm cursor-pointer" title="上传图片">
                  图片
                  <input type="file" accept="image/*" class="hidden" @change="handleImageUpload" />
                </label>
              </div>
            </div>
            <EditorContent :editor="editor" class="prose dark:prose-invert max-w-none p-4 min-h-[300px]" />
          </div>
        </div>

        <div class="flex gap-3">
          <button type="submit" :disabled="saving" class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light disabled:opacity-50 transition-colors">
            {{ saving ? '保存中...' : '保存' }}
          </button>
          <router-link to="/notes" class="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">取消</router-link>
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
import { renderMarkdown } from '@/utils/markdown'
import { notesApi } from '@/api/notes'
import { supabaseFoldersApi } from '@/api/supabaseData'
import { resolveAssetUrl } from '@/api/http'
import { uploadApi } from '@/api/upload'
import { useUiStore } from '@/stores/ui'
import { validateAndSanitizeMarkdown } from '@/utils/markdown-sanitizer'

const uiStore = useUiStore()
const route = useRoute()
const router = useRouter()
const isEdit = computed(() => Boolean(route.params.id))
const saving = ref(false)
const tagsInput = ref('')
const folders = ref<any[]>([])
const form = ref({
  title: '',
  summary: '',
  content_md: '', // This will hold HTML
  folder_id: null as number | null,
  is_private: false,
})

const { editor, getEditorColor, handleImageUpload } = useMarkdownEditor({
  placeholder: '在这里写内容...',
  onUpdate: (markdown) => {
    form.value.content_md = markdown
  },
  isPrivate: computed(() => form.value.is_private),
  imageBucket: 'notes-images'
})

const loadNote = async () => {
  if (!isEdit.value) return
  const data = await notesApi.get(Number(route.params.id))
  form.value.title = data.title
  form.value.summary = data.summary
  form.value.content_md = data.content_md
  form.value.folder_id = data.folder_id
  form.value.is_private = data.is_private || false
  tagsInput.value = (data.tags || []).map((t: any) => t.name).join(', ')

  editor.value?.commands.setContent(data.content_md || '')
}

const loadFolders = async () => {
  try {
    folders.value = await supabaseFoldersApi.list('note')
  } catch (error) {
    console.error('加载文件夹失败:', error)
  }
}

const DRAFT_KEY = 'note_editor_draft'

const saveDraft = () => {
  if (isEdit.value || saving.value) return
  const draft = {
    title: form.value.title,
    summary: form.value.summary,
    content_md: form.value.content_md,
    folder_id: form.value.folder_id,
    is_private: form.value.is_private,
    tags: tagsInput.value,
    timestamp: Date.now()
  }
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
}

const clearDraft = () => {
  localStorage.removeItem(DRAFT_KEY)
}

const checkDraft = () => {
  if (isEdit.value) return
  const saved = localStorage.getItem(DRAFT_KEY)
  if (saved) {
    const draft = JSON.parse(saved)
    if (confirm(`发现于 ${new Date(draft.timestamp).toLocaleString()} 保存的草稿，是否还原？`)) {
      form.value.title = draft.title
      form.value.summary = draft.summary
      form.value.content_md = draft.content_md
      form.value.folder_id = draft.folder_id
      form.value.is_private = draft.is_private || false
      tagsInput.value = draft.tags
      editor.value?.commands.setContent(draft.content_md)
      uiStore.addToast('草稿已还原', 'success')
    } else {
      clearDraft()
    }
  }
}

watch([() => form.value.title, () => form.value.summary, () => form.value.content_md, tagsInput], () => {
  saveDraft()
}, { deep: true })


const saveNote = async () => {
  saving.value = true
  try {
    const currentMarkdown = editor.value?.storage.markdown.getMarkdown() || form.value.content_md
    const sanitizedMarkdown = validateAndSanitizeMarkdown(currentMarkdown, 'NoteEditor')
    
    // Sync back to editor if replication was detected and cleaned
    if (sanitizedMarkdown !== currentMarkdown && editor.value) {
      editor.value.commands.setContent(sanitizedMarkdown, false)
    }

    const payload = {
      ...form.value,
      content_md: sanitizedMarkdown,
      tags: tagsInput.value.split(',').map(t => t.trim()).filter(Boolean),
    }
    if (isEdit.value) {
      await notesApi.update(Number(route.params.id), payload)
      uiStore.addToast('保存成功', 'success')
      router.push(`/notes/${route.params.id}`)
    } else {
      const created = await notesApi.create(payload)
      clearDraft() // Clear draft after successful creation
      uiStore.addToast('保存成功', 'success')
      router.push(`/notes/${created.id}`)
    }
  } catch (error) {
    console.error('保存笔记失败:', error)
    uiStore.addToast('保存失败', 'error', '请稍后重试')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  if (isEdit.value) {
    await loadNote()
  } else {
    checkDraft()
  }
  await loadFolders()

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
