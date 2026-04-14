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
              <label class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-sm cursor-pointer">
                插入图片
                <input type="file" accept="image/*" class="hidden" @change="handleImageUpload" />
              </label>
            </div>
            <EditorContent :editor="editor" class="prose dark:prose-invert max-w-none p-4 min-h-[300px]" />
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
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import { journalsApi } from '@/api/journals'
import { supabaseFoldersApi } from '@/api/supabaseData'
import { resolveAssetUrl } from '@/api/http'
import { uploadApi } from '@/api/upload'
import { useUiStore } from '@/stores/ui'

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
  content_html: '',
  content_json: '{}',
  folder_id: null as number | null,
})

const uploadAndInsertImage = async (file: File) => {
  if (!editor.value) return
  try {
    const result = await uploadApi.image(file)
    editor.value.chain().focus().setImage({ src: resolveAssetUrl(result.url), alt: result.original_name }).run()
  } catch (error) {
    console.error('上传图片失败:', error)
    uiStore.addToast('上传图片失败', 'error')
  }
}

const editor = useEditor({
  extensions: [
    StarterKit,
    Image.configure({
      inline: true,
      allowBase64: true,
    }),
    Placeholder.configure({
      placeholder: '在这里写日志...',
    }),
  ],
  content: '',
  editorProps: {
    handlePaste(view, event) {
      const items = Array.from(event.clipboardData?.items || [])
      const imageItems = items.filter(item => item.type.startsWith('image'))

      if (imageItems.length > 0) {
        event.preventDefault()
        imageItems.forEach(item => {
          const file = item.getAsFile()
          if (file) uploadAndInsertImage(file)
        })
        return true
      }
      return false
    },
    handleDrop(view, event, slice, moved) {
      if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
        const files = Array.from(event.dataTransfer.files)
        const imageFiles = files.filter(file => file.type.startsWith('image'))

        if (imageFiles.length > 0) {
          event.preventDefault()
          imageFiles.forEach(file => uploadAndInsertImage(file))
          return true
        }
      }
      return false
    },
  },
  onUpdate: ({ editor }) => {
    form.value.content_html = editor.getHTML()
    form.value.content_json = JSON.stringify(editor.getJSON())
  },
})

  const data = await journalsApi.get(Number(route.params.id))
  form.value = {
    title: data.title,
    excerpt: data.excerpt,
    content_html: data.content_html,
    content_json: data.content_json,
    folder_id: data.folder_id,
  }
  tagsInput.value = (data.tags || []).map((t: any) => t.name).join(', ')
  editor.value?.commands.setContent(data.content_html)
}

const loadFolders = async () => {
  try {
    folders.value = await supabaseFoldersApi.list('journal')
  } catch (error) {
    console.error('加载文件夹失败:', error)
  }
}

const handleImageUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  uploadAndInsertImage(file)
}

const saveJournal = async () => {
  saving.value = true
  try {
    const payload = {
      ...form.value,
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
