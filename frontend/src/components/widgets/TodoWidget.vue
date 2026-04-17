<template>
  <div class="bg-white/70 dark:bg-slate-800/80 backdrop-blur-md rounded-3xl shadow-md border border-white/60 dark:border-slate-700/60 p-6 flex flex-col h-full group">
    <div class="flex justify-between items-center mb-5">
      <h2 class="text-xl font-bold text-slate-800 dark:text-white flex items-center space-x-2">
        <span class="w-1.5 h-6 rounded bg-primary block"></span>
        <span>待办清单</span>
      </h2>
      <div class="flex items-center bg-slate-100 dark:bg-slate-900/50 p-1 rounded-xl">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          @click="activeTab = tab.id"
          class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
          :class="activeTab === tab.id 
            ? 'bg-white dark:bg-slate-800 text-primary shadow-sm ring-1 ring-slate-200 dark:ring-white/10' 
            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'"
        >
          {{ tab.label }}
          <span v-if="tab.count > 0" class="ml-1 opacity-60">{{ tab.count }}</span>
        </button>
        <div class="flex items-center gap-2">
          <button 
            @click="showBundleEditor = true"
            class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-xl text-[10px] font-black uppercase tracking-tighter hover:bg-primary/20 transition-all active:scale-95"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            关卡包模式
          </button>
        </div>
      </div>
    </div>

    <!-- Add Input Form -->
    <TodoForm v-if="activeTab === 'active' || activeTab === 'planned'" @add="handleAdd" />

    <!-- List -->
    <div class="flex-1 overflow-y-auto space-y-3 custom-scrollbar max-h-[400px] pr-1">
      <div v-if="gadgetStore.loading" class="flex justify-center py-8">
        <div class="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
      <div v-else-if="displayTodos.length === 0" class="py-12">
        <EmptyState 
          :title="emptyStateText.title" 
          :message="emptyStateText.message"
        />
      </div>
      <transition-group v-else name="list-complete" tag="div" class="space-y-3">
        <TodoItem 
          v-for="todo in displayTodos" 
          :key="todo.id"
          :todo="todo"
          :is-editing="editingTodoId === todo.id"
          @toggle-status="toggleStatus(todo)"
          @cycle-priority="cyclePriority(todo)"
          @cycle-recurrence="cycleRecurrence(todo)"
          @postpone="(days) => gadgetStore.postponeTodo(todo.id, days)"
          @fail="gadgetStore.failTodo(todo.id)"
          @retry="gadgetStore.updateTodoStatus(todo.id, 'pending')"
          @remove="gadgetStore.removeTodo(todo.id)"
          @start-edit="(id) => editingTodoId = id"
          @cancel-edit="editingTodoId = null"
          @save-edit="(updates) => handleSaveEdit(todo.id, updates)"
          @show-report="handleShowReport"
        />
      </transition-group>
    </div>

    <!-- Bundle Editor Modal -->
    <BundleEditor 
      v-if="showBundleEditor" 
      @close="showBundleEditor = false"
      @saved="activeTab = 'active'"
    />

    <!-- Settlement Report Modal -->
    <SettlementReport
      v-if="reportData"
      :todo="reportData.todo"
      :stats="reportData.stats"
      @close="reportData = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import dayjs from 'dayjs'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import type { Todo } from '@/api/types'
import { useGadgetStore } from '@/stores/gadgets'
import { useUiStore } from '@/stores/ui'
import TodoForm from './todo/TodoForm.vue'
import TodoItem from './todo/TodoItem.vue'
import BundleEditor from './todo/BundleEditor.vue'
import SettlementReport from './todo/SettlementReport.vue'
import EmptyState from '@/components/ui/EmptyState.vue'

dayjs.extend(isSameOrAfter)

const gadgetStore = useGadgetStore()
const uiStore = useUiStore()
const editingTodoId = ref<string | null>(null)
const activeTab = ref('active')
const showBundleEditor = ref(false)
const reportData = ref<{ todo: any, stats: any } | null>(null)

const handleShowReport = (data: { todo: any, stats: any }) => {
  reportData.value = data
}

const today = dayjs().startOf('day')

const priorityMap: Record<string, number> = { high: 3, medium: 2, low: 1 }

const sortTodos = (list: any[]) => {
  return [...list].sort((a, b) => {
    const pA = priorityMap[a.priority] || 0
    const pB = priorityMap[b.priority] || 0
    if (pA !== pB) return pB - pA
    return dayjs(b.created_at).diff(dayjs(a.created_at))
  })
}

const categorized = computed(() => {
  const all = gadgetStore.todos
  const today = dayjs().startOf('day')

  // Helper to group series
  const groupSeries = (list: Todo[]) => {
    const groups: Record<string, Todo[]> = {}
    const singleTasks: Todo[] = []

    list.forEach(t => {
      if (!t.recurrence || t.recurrence === 'none') {
        singleTasks.push(t)
      } else {
        const key = `${t.text}_${t.recurrence}`
        if (!groups[key]) groups[key] = []
        groups[key].push(t)
      }
    })

    const aggregated = [...singleTasks]
    Object.values(groups).forEach(seriesItems => {
      // Find the "representative" for today:
      // Priority: 1. Today's pending, 2. Today's completed, 3. Future pending, 4. Latest overall
      const todayPending = seriesItems.find(t => t.status === 'pending' && dayjs(t.start_date).isSameOrBefore(today) && dayjs(t.due_date).isSameOrAfter(today))
      const todayCompleted = seriesItems.find(t => t.status === 'completed' && dayjs(t.completed_at || t.updated_at).isSame(today, 'day'))
      const futurePending = seriesItems.filter(t => t.status === 'pending' && dayjs(t.start_date).isAfter(today)).sort((a,b) => dayjs(a.start_date).diff(dayjs(b.start_date)))[0]
      
      const rep = todayPending || todayCompleted || futurePending || seriesItems.sort((a,b) => dayjs(b.created_at).diff(dayjs(a.created_at)))[0]
      if (rep) aggregated.push(rep)
    })

    return aggregated
  }

  // Active: Pending items + today's completed recurring items (so they stay in list)
  const activeRaw = all.filter(t => {
    const isToday = t.start_date ? dayjs(t.start_date).isSameOrBefore(today) : true
    const isPending = t.status === 'pending'
    const isRecurringTodayCompleted = t.recurrence !== 'none' && t.status === 'completed' && dayjs(t.completed_at || t.updated_at).isSame(today, 'day')
    
    return isToday && (isPending || isRecurringTodayCompleted)
  })

  // Planned: Future pending items
  const plannedRaw = all.filter(t => {
    if (t.status !== 'pending') return false
    if (!t.start_date) return false
    return dayjs(t.start_date).isAfter(today)
  })

  return {
    active: gadgetStore.getTodoTree(sortTodos(groupSeries(activeRaw))),
    planned: gadgetStore.getTodoTree(sortTodos(groupSeries(plannedRaw))),
    failed: gadgetStore.getTodoTree(sortTodos(all.filter(t => t.status === 'failed'))),
    completed: gadgetStore.getTodoTree(sortTodos(all.filter(t => t.status === 'completed')))
  }
})

const tabs = computed(() => [
  { id: 'active', label: '进行中', count: categorized.value.active.length },
  { id: 'planned', label: '计划', count: categorized.value.planned.length },
  { id: 'failed', label: '失败', count: categorized.value.failed.length },
  { id: 'completed', label: '完成', count: categorized.value.completed.length }
])

const displayTodos = computed(() => {
  const cat = categorized.value as any
  return cat[activeTab.value] || []
})

const emptyStateText = computed(() => {
  const texts: any = {
    active: { title: '暂无待办', message: '今天似乎还没安排任务？休息或是开始新的一页吧。' },
    planned: { title: '虚位以待', message: '暂时没有未来的计划，去发现点新目标？' },
    failed: { title: '轻装上阵', message: '这里没有任何遗憾，继续保持！' },
    completed: { title: '硕果累累', message: '每一个勾选都是一次成长。' }
  }
  return texts[activeTab.value]
})

const handleAdd = async (payload: any) => {
  await gadgetStore.addTodo(payload.text, payload)
  uiStore.addToast('已添加新任务', 'success')
}

const handleSaveEdit = async (id: string, updates: any) => {
  await gadgetStore.updateTodo(id, updates)
  editingTodoId.value = null
  uiStore.addToast('任务已保存', 'success')
}

const toggleStatus = (todo: any) => {
  if (todo.status === 'pending') {
    gadgetStore.updateTodoStatus(todo.id, 'completed')
  } else {
    gadgetStore.updateTodoStatus(todo.id, 'pending')
  }
}

const cyclePriority = (todo: any) => {
  const priorities = ['low', 'medium', 'high']
  const currentIndex = priorities.indexOf(todo.priority)
  const nextPriority = priorities[(currentIndex + 1) % priorities.length]
  gadgetStore.updateTodo(todo.id, { priority: nextPriority })
}

const cycleRecurrence = (todo: any) => {
  const options = ['none', 'daily', 'weekly', 'monthly']
  const currentIndex = options.indexOf(todo.recurrence || 'none')
  const nextRecurrence = options[(currentIndex + 1) % options.length]
  gadgetStore.updateTodo(todo.id, { recurrence: nextRecurrence })
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0,0,0,0.1);
  border-radius: 10px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.1);
}

.list-complete-enter-from,
.list-complete-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
.list-complete-leave-active {
  position: absolute;
}
</style>
