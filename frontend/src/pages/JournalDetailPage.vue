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
            <div class="flex items-center gap-4 text-gray-500 text-sm mb-4">
              <span v-if="journal.is_private" class="flex items-center gap-1.5 px-2 py-0.5 bg-secondary/10 text-secondary rounded-md font-bold text-[10px] border border-secondary/20">
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"></path></svg>
                仅您可见
              </span>
              <div class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                <span class="flex items-center gap-1">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  记录于 {{ formatDate(journal.created_at) }}
                </span>
                <span v-if="journal.updated_at && journal.updated_at !== journal.created_at" class="flex items-center gap-1">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                  修订于 {{ formatDate(journal.updated_at) }}
                </span>
              </div>
              <span class="flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                阅读 {{ readingTime }} 分钟
              </span>
            </div>
            <div v-if="journal.tags && journal.tags.length > 0" class="flex flex-wrap gap-2">
              <span
                v-for="tag in journal.tags"
                :key="tag.id"
                class="px-2.5 py-1 text-xs font-medium bg-secondary/10 text-secondary dark:text-secondary-light border border-secondary/20 rounded-full"
              >
                {{ tag.name }}
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
import { calculateReadingTime } from '@/utils/text'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()
const loading = ref(true)
const journal = ref<any>(null)

const readingTime = computed(() => {
  if (!journal.value?.content_html) return 0
  const text = journal.value.content_html.replace(/<[^>]*>/g, '') // Strip HTML
  return calculateReadingTime(text)
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
