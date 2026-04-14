<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div v-if="loading" class="text-center py-12 text-gray-500">加载中...</div>
    <div v-else-if="!journal" class="text-center py-12 text-gray-500">日志不存在</div>
    <div v-else>
      <!-- Header -->
      <div class="mb-8">
        <div class="flex justify-between items-start mb-4">
          <div>
            <h1 class="text-3xl font-bold mb-2">{{ journal.title }}</h1>
            <div class="flex items-center gap-4 text-gray-500 text-sm">
              <span>{{ formatDate(journal.created_at) }}</span>
              <span class="flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                阅读 {{ readingTime }} 分钟
              </span>
            </div>
          </div>
          <div v-if="authStore.user" class="flex gap-2">
            <router-link
              :to="`/journals/${journal.id}/edit`"
              class="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary-light transition-colors"
            >
              编辑
            </router-link>
            <button
              @click="deleteJournal"
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              删除
            </button>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-8">
        <div class="rich-html" v-html="journal.content_html"></div>
      </div>
      <!-- Scroll to Top Button -->
      <button 
        v-if="showScrollTop"
        @click="scrollToTop"
        class="fixed bottom-8 right-8 p-3 bg-secondary text-white rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all z-50 mr-4"
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
import { journalsApi } from '@/api/journals'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()
const loading = ref(true)
const journal = ref<any>(null)

const readingTime = computed(() => {
  if (!journal.value?.content_html) return 0
  const text = journal.value.content_html.replace(/<[^>]*>/g, '') // Strip HTML
  const words = text.trim().split(/\s+/).length
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

const loadJournal = async () => {
  try {
    journal.value = await journalsApi.get(Number(route.params.id))
    document.title = `${journal.value.title} | Kirakirastar's Blog`
  } catch (error) {
    console.error('加载日志失败:', error)
  } finally {
    loading.value = false
  }
}

const deleteJournal = async () => {
  if (!confirm('确定要删除这篇日志吗？')) return

  try {
    await journalsApi.delete(Number(route.params.id))
    router.push('/journals')
  } catch (error) {
    console.error('删除日志失败:', error)
  }
}

onMounted(() => {
  loadJournal()
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>
