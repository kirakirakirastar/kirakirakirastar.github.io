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
            <p class="text-gray-500">{{ formatDate(journal.created_at) }}</p>
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { journalsApi } from '@/api/journals'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()
const loading = ref(true)
const journal = ref<any>(null)

const formatDate = (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm')

const loadJournal = async () => {
  try {
    journal.value = await journalsApi.get(Number(route.params.id))
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
})
</script>
