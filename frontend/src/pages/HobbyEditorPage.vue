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
          <input type="file" accept="image/*" @change="handleCoverUpload" />
        </div>
      </div>
      <div v-if="form.cover_url" class="w-40">
        <img :src="imageUrl" class="w-full rounded-lg border" alt="cover" />
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
        <label class="block text-sm font-medium mb-2">短评</label>
        <textarea v-model="form.review" rows="5" class="w-full px-4 py-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"></textarea>
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
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { hobbiesApi } from '@/api/hobbies'
import { supabaseFoldersApi } from '@/api/supabaseData'
import { resolveAssetUrl } from '@/api/http'
import { uploadApi } from '@/api/upload'

const route = useRoute()
const router = useRouter()
const isEdit = computed(() => Boolean(route.params.id))
const saving = ref(false)
const folders = ref<any[]>([])
const tagsInput = ref('')
const form = ref({
  title: '',
  type: 'anime',
  status: 'want',
  rating: null as number | null,
  review: '',
  cover_url: '',
  folder_id: null as number | null,
  tags: [] as any[],
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
  }
  tagsInput.value = data.tags.map(t => t.name).join(', ')
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
  try {
    const result = await uploadApi.image(file)
    form.value.cover_url = result.url
  } catch (error) {
    console.error('上传封面失败:', error)
    alert('封面上传失败')
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
    
    const payload = { ...form.value, tags }

    if (isEdit.value) {
      await hobbiesApi.update(Number(route.params.id), payload)
    } else {
      await hobbiesApi.create(payload)
    }
    router.push('/hobbies')
  } catch (error) {
    console.error('保存条目失败:', error)
    alert('保存失败，请稍后重试')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadHobby()
  loadFolders()
})
</script>
