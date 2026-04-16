<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">{{ isEdit ? '编辑条目' : '新建条目' }}</h1>
      <p class="text-gray-600 dark:text-gray-400">记录动漫、书籍、游戏的状态与评分</p>
    </div>

    <form @submit.prevent="saveHobby" class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-2">标题</label>
          <input v-model="form.title" type="text" required class="w-full px-4 py-2 border rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary outline-none transition-shadow" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">分类文件夹</label>
          <select v-model="form.folder_id" class="w-full px-4 py-2 border rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary outline-none transition-shadow cursor-pointer">
            <option :value="null">未分类</option>
            <option v-for="folder in folders" :key="folder.id" :value="folder.id">{{ folder.name }}</option>
          </select>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-2">类型</label>
          <select v-model="form.type" class="w-full px-4 py-2 border rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary outline-none transition-shadow cursor-pointer">
            <option value="anime">动漫</option>
            <option value="book">书籍</option>
            <option value="game">游戏</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">状态</label>
          <select v-model="form.status" class="w-full px-4 py-2 border rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary outline-none transition-shadow cursor-pointer">
            <option value="want">想看</option>
            <option value="in_progress">在看</option>
            <option value="completed">已完成</option>
            <option value="paused">搁置</option>
          </select>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-2">评分（1-10）</label>
          <input v-model.number="form.rating" type="number" min="1" max="10" class="w-full px-4 py-2 border rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary outline-none transition-shadow" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">封面上传</label>
          <div class="space-y-2">
            <input type="file" accept="image/*" @change="handleCoverUpload" class="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
            <p class="text-xs text-gray-500 dark:text-gray-400">支持点击上传或从剪贴板粘贴图片</p>
          </div>
        </div>
      </div>
      <div v-if="form.cover_url" class="relative group w-40">
        <img :src="imageUrl" class="w-full rounded-2xl border-2 border-primary/20 shadow-lg transition-transform group-hover:scale-105" alt="cover" />
        <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
          <button @click.prevent="form.cover_url = ''" class="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          </button>
        </div>
      </div>
      <div>
        <label class="block text-sm font-medium mb-2">标签 (英文逗号分隔)</label>
        <input 
          v-model="tagsInput" 
          type="text" 
          placeholder="例如: 治愈, 奇幻, 2026" 
          class="w-full px-4 py-2 border rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary outline-none transition-shadow" 
        />
      </div>
      <div>
        <label class="block text-sm font-medium mb-2">详细记录 / 评价</label>
        <div class="border rounded-xl dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-800 focus-within:ring-2 focus-within:ring-primary transition-shadow">
          <!-- Toolbar -->
          <div class="flex flex-wrap gap-1 p-2 bg-slate-50 dark:bg-slate-900 border-b dark:border-slate-700">
            <button type="button" @click="editor?.chain().focus().toggleBold().run()" :class="{ 'bg-slate-200 dark:bg-slate-700': editor?.isActive('bold') }" class="px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-sm font-bold">B</button>
            <button type="button" @click="editor?.chain().focus().toggleItalic().run()" :class="{ 'bg-slate-200 dark:bg-slate-700': editor?.isActive('italic') }" class="px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-sm italic">I</button>
            <button type="button" @click="editor?.chain().focus().toggleUnderline().run()" :class="{ 'bg-slate-200 dark:bg-slate-700': editor?.isActive('underline') }" class="px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-sm underline">U</button>
            <button type="button" @click="editor?.chain().focus().toggleBulletList().run()" :class="{ 'bg-primary/20 text-primary': editor?.isActive('bulletList') }" class="px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-sm">•</button>
            <button type="button" @click="editor?.chain().focus().toggleOrderedList().run()" :class="{ 'bg-primary/20 text-primary': editor?.isActive('orderedList') }" class="px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-sm">1.</button>
            <button type="button" @click="editor?.chain().focus().toggleBlockquote().run()" :class="{ 'bg-primary/20 text-primary': editor?.isActive('blockquote') }" class="px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-sm">引用</button>
            <button type="button" @click="editor?.chain().focus().toggleStrike().run()" :class="{ 'bg-slate-200 dark:bg-slate-700': editor?.isActive('strike') }" class="px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-sm line-through">S</button>
            <button type="button" @click="editor?.chain().focus().undo().run()" class="px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-sm ml-auto">撤销</button>
            <button type="button" @click="editor?.chain().focus().redo().run()" class="px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-sm">重做</button>
          </div>
          <EditorContent :editor="editor" class="prose dark:prose-invert max-w-none p-4 min-h-[200px]" />
        </div>
      </div>

      <div class="flex items-center gap-3 py-2">
        <label class="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" v-model="form.is_private" class="sr-only peer">
          <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/30 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
        </label>
        <div class="flex flex-col">
          <span class="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <svg v-if="form.is_private" class="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"></path></svg>
            私密条目
          </span>
          <span class="text-[10px] text-slate-500">此爱好记录仅在您登录后显示在列表中及统计中。</span>
        </div>
      </div>
      <div class="flex gap-3">
        <button type="submit" :disabled="saving" class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light disabled:opacity-50 transition-colors">
          {{ saving ? '保存中...' : '保存' }}
        </button>
        <router-link to="/hobbies" class="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">取消</router-link>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { hobbiesApi } from '@/api/hobbies'
import { supabaseFoldersApi } from '@/api/supabaseData'
import { resolveAssetUrl } from '@/api/http'
import { uploadApi } from '@/api/upload'
import { deleteFileByUrl } from '@/api/cleanup'
import { useUiStore } from '@/stores/ui'
import { validateAndSanitizeMarkdown, convertLegacyHTMLToBBCode } from '@/utils/markdown-sanitizer'
import { EditorContent } from '@tiptap/vue-3'
import { useMarkdownEditor } from '@/hooks/useMarkdownEditor'
import type { Hobby } from '@/api/types'

const uiStore = useUiStore()

const route = useRoute()
const router = useRouter()
const isEdit = computed(() => Boolean(route.params.id))
const saving = ref(false)
const folders = ref<any[]>([])
const tagsInput = ref('')
const form = ref({
  title: '',
  type: 'anime' as Hobby['type'],
  status: 'want' as Hobby['status'],
  rating: null as number | null,
  review: '',
  cover_url: '',
  folder_id: null as number | null,
  tags: [] as any[],
  is_private: false,
})



const imageUrl = computed(() => resolveAssetUrl(form.value.cover_url))

const loadHobby = async () => {
  if (!isEdit.value) return
  const data = await hobbiesApi.get(Number(route.params.id))
  form.value = {
    title: data.title,
    type: data.type,
    status: data.status,
    rating: data.rating,
    review: data.review,
    cover_url: data.cover_url,
    folder_id: data.folder_id,
    tags: data.tags,
    is_private: data.is_private || false,
  }
  tagsInput.value = data.tags.map(t => t.name).join(', ')
  const cleaned = validateAndSanitizeMarkdown(data.review || '')
  editor.value?.commands.setContent(cleaned)
  form.value.review = data.review
}

const loadFolders = async () => {
  try {
    folders.value = await supabaseFoldersApi.list('hobby')
  } catch (error) {
    console.error('加载文件夹失败:', error)
  }
}

const handleCoverUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  uploadAndSetCover(file)
}

const uploadAndSetCover = async (file: File) => {
  try {
    const oldUrl = form.value.cover_url
    const result = await uploadApi.image(file, form.value.is_private, 'hobbies-covers')
    form.value.cover_url = result.url
    uiStore.addToast('封面设置成功', 'success')
    
    // 如果之前已经是云端图片，则清理旧文件
    if (oldUrl && oldUrl !== result.url) {
      deleteFileByUrl(oldUrl)
    }
  } catch (error) {
    console.error('上传封面失败:', error)
    uiStore.addToast('封面上传失败', 'error')
  }
}

const { editor } = useMarkdownEditor({
  placeholder: '在这里写下你的评价与笔记...',
  onUpdate: (markdown) => {
    form.value.review = markdown
  },
  isPrivate: computed(() => form.value.is_private),
  imageBucket: 'hobbies-covers'
})

const handlePaste = (event: ClipboardEvent) => {
  if (event.defaultPrevented) return
  const items = event.clipboardData?.items
  if (!items) return

  for (const item of items) {
    if (item.type.indexOf('image') !== -1) {
      const file = item.getAsFile()
      if (file) {
        uploadAndSetCover(file)
        break // Only take the first image if multiple
      }
    }
  }
}

const saveHobby = async () => {
  saving.value = true
  try {
    // Process tags
    const tags = tagsInput.value
      .split(',')
      .map(t => t.trim())
      .filter(Boolean)
    
    const currentMarkdown = editor.value?.storage.markdown.getMarkdown() || form.value.review
    const sanitizedMarkdown = validateAndSanitizeMarkdown(currentMarkdown)

    const payload = {
      ...form.value, 
      review: sanitizedMarkdown,
      tags 
    }

    if (isEdit.value) {
      await hobbiesApi.update(Number(route.params.id), payload)
      uiStore.addToast('更新成功', 'success')
    } else {
      await hobbiesApi.create(payload)
      uiStore.addToast('创建成功', 'success')
    }
    router.push('/hobbies')
  } catch (error) {
    console.error('保存条目失败:', error)
    uiStore.addToast('保存失败', 'error')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadHobby()
  loadFolders()
  window.addEventListener('paste', handlePaste)
})

onBeforeUnmount(() => {
  editor.value?.destroy()
  window.removeEventListener('paste', handlePaste)
})
</script>
