<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
    <div v-if="loading" class="text-center py-20">
      <div class="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
      <p class="text-gray-500">加载中...</p>
    </div>
    <div v-else-if="!hobby" class="text-center py-20">
      <div class="text-6xl mb-4">🛸</div>
      <h3 class="text-xl font-bold text-gray-800 dark:text-gray-200">条目不存在</h3>
      <router-link to="/hobbies" class="text-primary hover:underline mt-4 inline-block">返回列表</router-link>
    </div>
    <div v-else>
      <!-- Header / Breadcrumb -->
      <div class="flex items-center gap-2 mb-8 text-sm text-gray-500">
        <router-link to="/hobbies" class="hover:text-primary transition-colors">爱好追踪</router-link>
        <span>/</span>
        <span class="text-gray-400">条目详情</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
        <!-- Left Column: Cover & Quick Stats -->
        <div class="md:col-span-4 lg:col-span-3">
          <div class="relative group aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-900 sticky top-24">
            <img 
              v-if="hobby.cover_url"
              :src="getImageUrl(hobby.cover_url)" 
              :alt="hobby.title"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex flex-col items-center justify-center text-gray-400 p-6 text-center">
              <svg class="w-16 h-16 mb-2 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 00-2 2z"></path></svg>
              <span class="text-xs">暂无封面</span>
            </div>
            
            <!-- Type Badge Over Cover -->
            <div class="absolute top-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-lg">
              {{ typeLabel(hobby.type) }}
            </div>
          </div>
        </div>

        <!-- Right Column: Details -->
        <div class="md:col-span-8 lg:col-span-9 flex flex-col">
          <div class="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
            <div class="flex-1">
              <h1 class="text-3xl sm:text-4xl font-black text-slate-800 dark:text-white leading-tight mb-3 flex items-center gap-3 flex-wrap">
                <svg v-if="hobby.is_private" class="w-6 h-6 text-amber-500 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"></path></svg>
                {{ hobby.title }}
              </h1>
              
              <div class="flex flex-wrap items-center gap-3">
                <span 
                  class="px-3 py-1 rounded-full text-xs font-bold shadow-sm"
                  :class="statusClass(hobby.status)"
                >
                  {{ statusLabel(hobby.status) }}
                </span>
                <span v-if="hobby.rating" class="flex items-center gap-1.5 bg-amber-500/10 text-amber-600 px-3 py-1 rounded-full text-xs font-black shadow-inner">
                   <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                   {{ hobby.rating }} / 10
                </span>
              </div>
            </div>

            <!-- Action Buttons for Owner -->
            <div v-if="authStore.user" class="flex gap-2 shrink-0">
              <router-link
                :to="`/hobbies/${hobby.id}/edit`"
                class="p-2.5 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-white transition-all duration-300 shadow-sm"
                title="编辑条目"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
              </router-link>
              <button
                @click="handleDelete"
                class="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all duration-300 shadow-sm"
                title="删除条目"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              </button>
            </div>
          </div>

          <!-- Tags Area -->
          <div v-if="hobby.tags?.length" class="flex flex-wrap gap-2 mb-8 border-b border-gray-100 dark:border-white/5 pb-8">
            <span 
              v-for="tag in hobby.tags" 
              :key="tag.id"
              class="px-3 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold rounded-lg"
            >
              # {{ tag.name }}
            </span>
          </div>

          <!-- Review/Content -->
          <div class="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-3xl p-8 border border-white/60 dark:border-slate-700/60 shadow-sm min-h-[300px] flex flex-col overflow-hidden break-words">
            <div class="text-xs font-black text-primary/40 uppercase tracking-[0.2em] mb-4">心中所想</div>
            <div 
              :key="hobby.id + '_' + renderCounter"
              class="markdown-body flex-1" 
              v-html="renderMarkdown(hobby.review || '暂无详细记录...')"
            ></div>
            
            <div class="mt-12 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-8 border-t border-gray-100 dark:border-white/5 opacity-60">
                <div class="flex items-center gap-6 text-xs text-gray-400">
                    <span class="flex items-center gap-1.5">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        初次记录于 {{ formatDate(hobby.created_at) }}
                    </span>
                    <span v-if="hobby.updated_at && hobby.updated_at !== hobby.created_at" class="flex items-center gap-1.5">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                        最后修订于 {{ formatDate(hobby.updated_at) }}
                    </span>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { hobbiesApi } from '@/api/hobbies'
import { resolveAssetUrl } from '@/api/http'
import { renderMarkdown } from '@/utils/markdown'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import { useTaskListStabilizer } from '@/hooks/useTaskListStabilizer'

const authStore = useAuthStore()
const uiStore = useUiStore()
const { stabilize } = useTaskListStabilizer()
const route = useRoute()
const router = useRouter()

const loading = ref(true)
const hobby = ref<any>(null)
const renderCounter = ref(0)

const loadHobby = async () => {
    try {
        hobby.value = await hobbiesApi.get(Number(route.params.id))
        renderCounter.value++
        document.title = `${hobby.value.title} | 爱好追踪 | Kirakirastar's Blog`
    } catch (error) {
        console.error('加载条目失败:', error)
        uiStore.addToast('获取详情失败', 'error')
    } finally {
        loading.value = false
    }
}

const handleDelete = async () => {
    if (!confirm('确定要删除这个条目吗？此操作无法撤销。')) return
    try {
        await hobbiesApi.delete(hobby.value.id)
        uiStore.addToast('删除成功', 'success')
        router.push('/hobbies')
    } catch (error) {
        console.error('删除失败:', error)
        uiStore.addToast('删除失败', 'error')
    }
}

const getImageUrl = (url: string) => resolveAssetUrl(url)
const formatDate = (date: string) => dayjs(date).format('YYYY年M月D日 HH:mm')

const statusLabel = (status: string) => {
    const labels: Record<string, string> = {
        want: '想看',
        in_progress: '在看',
        completed: '已完成',
        paused: '搁置',
        dropped: '抛弃'
    }
    return labels[status] || status
}

const typeLabel = (type: string) => {
    const labels: Record<string, string> = {
        anime: '动漫',
        book: '书籍',
        game: '游戏',
        other: '其他'
    }
    return labels[type] || type
}

const statusClass = (status: string) => {
    const classes: Record<string, string> = {
        want: 'bg-primary/10 text-primary dark:text-primary-light',
        in_progress: 'bg-secondary/10 text-secondary dark:text-secondary-light',
        completed: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
        paused: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
        dropped: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
    }
    return classes[status] || 'bg-gray-100 text-gray-700'
}

onMounted(() => {
    loadHobby()
    stabilize()
})

watch(() => hobby.value?.review, () => {
    stabilize()
})
</script>

<style scoped>
.animate-fade-in {
    animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
</style>
