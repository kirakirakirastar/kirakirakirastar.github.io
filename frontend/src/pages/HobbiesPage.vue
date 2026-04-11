<template>
  <div class="w-full px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
      <div>
        <h1 class="text-4xl font-extrabold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">爱好追踪</h1>
        <p class="text-gray-500 dark:text-gray-400">ACG、影视游戏记录与评分</p>
      </div>
      <router-link
        v-if="authStore.user"
        to="/hobbies/new"
        class="px-5 py-2.5 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
      >
        追加爱好
      </router-link>
    </div>

    <!-- Filters -->
    <div class="bg-theme-bg/60 dark:bg-theme-card-dark/60 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 p-6 mb-8 flex flex-col md:flex-row gap-4">
      <div class="flex flex-wrap gap-4 w-full">
        <select
          v-model="selectedType"
          class="px-4 py-2 border rounded-xl bg-white dark:bg-slate-900 dark:border-slate-700/50 focus:ring-2 focus:ring-primary outline-none transition-shadow"
          @change="loadHobbies"
        >
          <option value="">所有类型</option>
          <option value="anime">动漫</option>
          <option value="book">书籍</option>
          <option value="game">游戏</option>
        </select>
        <select
          v-model="selectedStatus"
          class="px-4 py-2 border rounded-xl bg-white dark:bg-slate-900 dark:border-slate-700/50 focus:ring-2 focus:ring-primary outline-none transition-shadow"
          @change="loadHobbies"
        >
          <option value="">所有状态</option>
          <option value="want">想看</option>
          <option value="in_progress">在看</option>
          <option value="completed">已完成</option>
          <option value="paused">搁置</option>
        </select>
      </div>
    </div>

    <!-- Stats -->
    <div v-if="stats" class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
      <div class="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700/50 p-6 text-center hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
        <div class="text-3xl font-extrabold text-primary dark:text-primary-light">{{ stats.total }}</div>
        <div class="text-sm text-gray-500 dark:text-slate-400 mt-1 font-medium">总条目</div>
      </div>
      <div class="bg-theme-bg/70 dark:bg-theme-card-dark/70 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 p-6 text-center hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
        <div class="text-3xl font-extrabold text-secondary">{{ stats.completed }}</div>
        <div class="text-sm text-gray-500 dark:text-slate-400 mt-1 font-medium">已完成</div>
      </div>
      <div class="bg-theme-bg/70 dark:bg-theme-card-dark/70 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 p-6 text-center hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
        <div class="text-3xl font-extrabold text-primary-light">{{ stats.in_progress }}</div>
        <div class="text-sm text-gray-500 dark:text-slate-400 mt-1 font-medium">在看</div>
      </div>
      <div class="bg-theme-bg/70 dark:bg-theme-card-dark/70 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 p-6 text-center hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
        <div class="text-3xl font-extrabold text-secondary-light">{{ stats.avg_rating?.toFixed(1) || '-' }}</div>
        <div class="text-sm text-gray-500 dark:text-slate-400 mt-1 font-medium">平均评分</div>
      </div>
    </div>

    <!-- Hobbies List -->
    <div v-if="loading" class="text-center py-12 text-gray-500">加载中...</div>
    <div v-else-if="hobbies.length === 0" class="text-center py-12 text-gray-500">暂无条目，点击上方新建按钮创建</div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
      <div
        v-for="hobby in hobbies"
        :key="hobby.id"
        class="bg-theme-bg/70 dark:bg-theme-card-dark/70 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
      >
        <div v-if="hobby.cover_url" class="aspect-[3/4] bg-gray-200 dark:bg-slate-700">
          <img
            :src="getImageUrl(hobby.cover_url)"
            :alt="hobby.title"
            class="w-full h-full object-cover"
          />
        </div>
        <div v-else class="aspect-[3/4] bg-gray-50 dark:bg-slate-700/50 flex items-center justify-center">
          <span class="text-gray-400 text-sm">无海报</span>
        </div>
        <div class="p-6 flex flex-col flex-1">
          <div class="flex items-start justify-between mb-3">
            <h3 class="font-extrabold text-lg line-clamp-2 leading-tight">{{ hobby.title }}</h3>
            <span
              class="px-2 py-1 text-xs rounded-full"
              :class="statusClass(hobby.status)"
            >
              {{ statusLabel(hobby.status) }}
            </span>
          </div>
          <div class="flex items-center gap-2 mb-3 text-sm text-gray-500">
            <span>{{ typeLabel(hobby.type) }}</span>
            <span v-if="hobby.rating">· {{ hobby.rating }}/10</span>
          </div>
          <p class="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-4">
            {{ hobby.review || '暂无短评' }}
          </p>
          <div v-if="authStore.user" class="flex gap-2">
            <router-link
              :to="`/hobbies/${hobby.id}/edit`"
              class="flex-1 px-3 py-2 text-center bg-primary text-white rounded-lg hover:bg-primary-dark text-sm transition-colors"
            >
              编辑
            </router-link>
            <button
              @click="deleteHobby(hobby.id)"
              class="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm transition-colors"
            >
              删除
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { hobbiesApi } from '@/api/hobbies'
import { resolveAssetUrl } from '@/api/http'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const loading = ref(true)
const hobbies = ref<any[]>([])
const stats = ref<any>(null)
const selectedType = ref('')
const selectedStatus = ref('')

const statusLabel = (status: string) => {
  const labels: Record<string, string> = {
    want: '想看',
    in_progress: '在看',
    completed: '已完成',
    paused: '搁置'
  }
  return labels[status] || status
}

const typeLabel = (type: string) => {
  const labels: Record<string, string> = {
    anime: '动漫',
    book: '书籍',
    game: '游戏'
  }
  return labels[type] || type
}

const statusClass = (status: string) => {
  const classes: Record<string, string> = {
    want: 'bg-primary/10 text-primary dark:text-primary-light',
    in_progress: 'bg-secondary/10 text-secondary dark:text-secondary-light',
    completed: 'bg-primary/20 text-primary dark:text-primary-light font-bold',
    paused: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
  }
  return classes[status] || 'bg-gray-100 text-gray-700'
}

const getImageUrl = (url: string) => resolveAssetUrl(url)

const loadHobbies = async () => {
  loading.value = true
  try {
    const params: any = {}
    if (selectedType.value) params.type = selectedType.value
    if (selectedStatus.value) params.status = selectedStatus.value
    hobbies.value = await hobbiesApi.list(params)
  } catch (error) {
    console.error('加载条目失败:', error)
  } finally {
    loading.value = false
  }
}

const loadStats = async () => {
  try {
    stats.value = await hobbiesApi.stats()
  } catch (error) {
    console.error('加载统计失败:', error)
  }
}

const deleteHobby = async (id: number) => {
  if (!confirm('确定要删除这个条目吗？')) return

  try {
    await hobbiesApi.delete(id)
    await loadHobbies()
    await loadStats()
  } catch (error) {
    console.error('删除条目失败:', error)
  }
}

onMounted(() => {
  loadHobbies()
  loadStats()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
