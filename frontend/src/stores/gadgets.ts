import { defineStore } from 'pinia'
import { ref, onUnmounted } from 'vue'
import dayjs from 'dayjs'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import { todosApi, checkinApi, announcementsApi } from '@/api/gadgets'

dayjs.extend(isSameOrBefore)
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/api/supabase'
import { getErrorMessage } from '@/utils/error'
import type { Todo, DashboardStats, ActivityDay, Announcement } from '@/api/types'

export interface CheckinState {
  last_date: string | null
  streak: number
  total_count: number
  last_record?: string | null
}


export const useGadgetStore = defineStore('gadgets', () => {
  const authStore = useAuthStore()
  const todos = ref<Todo[]>([])
  const checkin = ref<CheckinState>({
    last_date: null,
    streak: 0,
    total_count: 0
  })
  const checkinHistory = ref<any[]>([])
  const announcements = ref<Announcement[]>([])
  const loading = ref(false)

  let currentRequestId = 0
  let todoChannel: any = null
  let checkinChannel: any = null

  const initGadgets = async () => {
    const requestId = ++currentRequestId
    loading.value = true
    
    try {
      if (authStore.user) {
        const [todosRes, checkinRes, announcementsRes] = await Promise.allSettled([
          todosApi.list(),
          checkinApi.get(),
          announcementsApi.list()
        ])
        
        if (requestId !== currentRequestId) return
        
        let fetchedTodos = todosRes.status === 'fulfilled' ? todosRes.value : []
        checkin.value = checkinRes.status === 'fulfilled' ? (checkinRes.value || { last_date: null, streak: 0, total_count: 0 }) : { last_date: null, streak: 0, total_count: 0 }
        announcements.value = announcementsRes.status === 'fulfilled' ? announcementsRes.value : []
        
        await fetchCheckinHistory()

        // --- Domain Logic: Evaluate Todo Statuses/Failures ---
        const today = dayjs().startOf('day')
        
        let processedTodos = fetchedTodos.map((t: Todo) => {
          let updated = { ...t }
          // 1. Auto-migrate legacy boolean
          if (updated.completed === true && (!updated.status || updated.status === 'pending')) {
            updated.status = 'completed'
          } 
          return updated
        })

        // 2. Critical: Update state BEFORE processing overdue tasks to avoid overwriting newly created instances
        todos.value = processedTodos

        // 3. Identify and handle overdue tasks (Auto-Failure)
        const overdueTasks = todos.value.filter((t: Todo) => {
          if (t.status !== 'pending') return false
          
          // Pure Deadline Check: If due_date passed yesterday
          if (t.due_date && dayjs(t.due_date).isBefore(today)) return true
          
          // Recurrence Span Check: If a recurring task's interval has passed, fail current to make room for next
          if (t.recurrence && t.recurrence !== 'none') {
            const unit = t.recurrence === 'weekly' ? 'week' 
                       : t.recurrence === 'monthly' ? 'month' 
                       : 'day'
            const refDate = t.start_date || t.created_at
            const nextWindowStarts = dayjs(refDate).add(1, unit as dayjs.ManipulateType).startOf('day')
            
            if (nextWindowStarts.isSameOrBefore(today)) {
              return true
            }
          }
          
          return false
        })

        if (overdueTasks.length > 0) {
          console.log(`Auto-failing ${overdueTasks.length} overdue tasks...`)
          for (const task of overdueTasks) {
            // Update local state first (todos.value is already set)
            const localTask = todos.value.find((t: Todo) => t.id === task.id)
            if (localTask) {
               localTask.status = 'failed'
               localTask.completed = false
            }
            
            // Sync to DB
            todosApi.updateStatus(task.id, 'failed')
              .then(updated => {
                if (localTask) Object.assign(localTask, updated)
              })
              .catch(e => console.error('Failed to sync auto-failure:', e))
            
            // Trigger next instance for recurring tasks
            if (task.recurrence && task.recurrence !== 'none') {
              handleRecurrence(task)
            }
          }
        }

        setupRealtime()
      } else {
        // ... (Guest handling)
        try {
          const announcementsData = await announcementsApi.list()
          if (requestId !== currentRequestId) return
          announcements.value = announcementsData
        } catch (e) {
          console.error('Failed to fetch announcements for guest:', e)
        }
        
        if (requestId !== currentRequestId) return
        todos.value = []
        checkin.value = { last_date: null, streak: 0, total_count: 0 }
        checkinHistory.value = []
        cleanupRealtime()
      }
    } catch (e) {
      console.error('Critical failure in initGadgets:', e)
    } finally {
      if (requestId === currentRequestId) {
        loading.value = false
      }
    }
  }

  const setupRealtime = () => {
    cleanupRealtime()
    
    if (!authStore.user) return

    // Subscribe to todos for current user
    todoChannel = supabase
      .channel('todos-realtime')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'todos',
        filter: `user_id=eq.${authStore.user.id}`
      }, (payload) => {
        handleTodoRealtime(payload)
      })
      .subscribe()

    // Subscribe to checkins
    checkinChannel = supabase
      .channel('checkins-realtime')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'checkins',
        filter: `user_id=eq.${authStore.user.id}`
      }, (payload) => {
        if (payload.new) checkin.value = payload.new as CheckinState
      })
      .subscribe()
  }

  const cleanupRealtime = () => {
    if (todoChannel) supabase.removeChannel(todoChannel)
    if (checkinChannel) supabase.removeChannel(checkinChannel)
    todoChannel = null
    checkinChannel = null
  }

  const handleTodoRealtime = (payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload
    
    if (eventType === 'INSERT') {
      if (!todos.value.find(t => t.id === newRecord.id)) {
        todos.value.unshift(newRecord as Todo)
      }
    } else if (eventType === 'UPDATE') {
      const index = todos.value.findIndex(t => t.id === newRecord.id)
      if (index !== -1) {
        todos.value[index] = { ...todos.value[index], ...newRecord }
      }
    } else if (eventType === 'DELETE') {
      todos.value = todos.value.filter(t => t.id !== oldRecord.id)
    }
  }

  // --- Todo Actions ---
  const addTodo = async (text: string, payloadUpdates?: any) => {
    if (!text.trim()) return
    
    // Optimistic Update
    const tempId = `temp-${Date.now()}`
    const tempTodo: Todo = {
      id: tempId,
      text: text.trim(),
      completed: false,
      status: 'pending',
      priority: payloadUpdates?.priority || 'medium',
      recurrence: payloadUpdates?.recurrence || 'none',
      created_at: new Date().toISOString(),
      ...payloadUpdates
    }
    
    todos.value.unshift(tempTodo)

    try {
      const newTodo = await todosApi.create(text.trim(), payloadUpdates)
      // Replace temp id with real id
      const index = todos.value.findIndex(t => t.id === tempId)
      if (index !== -1) {
        todos.value[index] = newTodo
      }
    } catch (e) {
      // Rollback
      todos.value = todos.value.filter(t => t.id !== tempId)
      console.error(getErrorMessage(e))
    }
  }

  const updateTodoStatus = async (id: string, status: Todo['status']) => {
    const todo = todos.value.find(t => t.id === id)
    if (!todo || todo.status === status) return

    const oldStatus = todo.status
    const oldCompleted = todo.completed

    // Optimistic Update
    todo.status = status
    todo.completed = status === 'completed'

    try {
      const updated = await todosApi.updateStatus(id, status)
      
      if ((status === 'completed' || status === 'failed') && todo.recurrence && todo.recurrence !== 'none') {
        await handleRecurrence(todo)
      }

      // Sync with exact server data
      todo.status = updated.status
      todo.completed = updated.completed
    } catch (e) {
      // Rollback
      todo.status = oldStatus
      todo.completed = oldCompleted
      console.error(getErrorMessage(e))
    }
  }

  const handleRecurrence = async (todo: Todo) => {
    if (!todo.recurrence || todo.recurrence === 'none') return

    const now = dayjs().startOf('day')
    let unit: dayjs.ManipulateType = 'day'
    if (todo.recurrence === 'weekly') unit = 'week'
    else if (todo.recurrence === 'monthly') unit = 'month'

    // Determine the original duration to maintain it in future instances
    const start = dayjs(todo.start_date || todo.created_at)
    const due = dayjs(todo.due_date || todo.start_date || todo.created_at)
    const durationDays = due.diff(start, 'day')

    let nextStart = start.add(1, unit)
    let nextDue = nextStart.add(durationDays, 'day')

    let iterations = 0
    const maxIterations = 31 // Limit catch-up to 1 month to prevent infinite loops

    while (iterations < maxIterations) {
      iterations++

      // Series boundary check
      if (todo.recurrence_until && nextDue.isAfter(dayjs(todo.recurrence_until))) {
        break
      }

      // Deduplication: Don't create if an instance with same text and due_date already exists
      const exists = todos.value.some(t => 
        t.text === todo.text && 
        dayjs(t.due_date).isSame(nextDue, 'day')
      )

      if (!exists) {
        // Determine status: If the next instance's window has already passed, create it as failed
        // A window is passed if its next iteration would have already started
        const followingWindowStarts = nextStart.add(1, unit).startOf('day')
        const isHistorical = followingWindowStarts.isSameOrBefore(now)
        const finalDueDatePassed = nextDue.isBefore(now)

        // As per user request: "If a day is missed, it should be failed"
        // So any instance whose period is in the past gets created as failed.
        const newStatus = (isHistorical || finalDueDatePassed) ? 'failed' : 'pending'

        await addTodo(todo.text, {
          priority: todo.priority,
          start_date: nextStart.format('YYYY-MM-DD'),
          due_date: nextDue.format('YYYY-MM-DD'),
          recurrence: todo.recurrence,
          recurrence_until: todo.recurrence_until,
          is_private: todo.is_private,
          status: newStatus
        })

        // If we just created the current/future pending task, we can stop
        if (newStatus === 'pending') break
      } else {
        // If it already exists, check if it's the current one. If so, stop.
        const instance = todos.value.find(t => t.text === todo.text && dayjs(t.due_date).isSame(nextDue, 'day'))
        if (instance && instance.status === 'pending') break
      }

      // Move to next potential window
      nextStart = nextStart.add(1, unit)
      nextDue = nextStart.add(durationDays, 'day')
    }
  }

  const postponeTodo = async (id: string, days: number = 1) => {
    const todo = todos.value.find(t => t.id === id)
    if (!todo) return

    const updates: any = {}
    if (todo.start_date) updates.start_date = dayjs(todo.start_date).add(days, 'day').format('YYYY-MM-DD')
    if (todo.due_date) updates.due_date = dayjs(todo.due_date).add(days, 'day').format('YYYY-MM-DD')
    if (!todo.start_date && !todo.due_date) updates.due_date = dayjs().add(days, 'day').format('YYYY-MM-DD')

    // Optional: Optimistic update for postpone too, but it's less frequent
    await updateTodo(id, updates)
  }

  const updateTodo = async (id: string, updates: any) => {
    const todo = todos.value.find(t => t.id === id)
    if (!todo) return

    const backup = { ...todo }
    Object.assign(todo, updates)

    try {
      const data = await todosApi.update(id, updates)
      Object.assign(todo, data)
    } catch (e) {
      Object.assign(todo, backup)
      console.error(getErrorMessage(e))
    }
  }

  const failTodo = async (id: string) => {
    await updateTodoStatus(id, 'failed')
  }

  const removeTodo = async (id: string) => {
    const backup = [...todos.value]
    todos.value = todos.value.filter(t => t.id !== id)

    try {
      await todosApi.delete(id)
    } catch (e) {
      todos.value = backup
      console.error(getErrorMessage(e))
    }
  }

  // --- Checkin Actions ---
  const canCheckin = () => {
    if (!checkin.value.last_date) return true
    const last = dayjs(checkin.value.last_date)
    const now = dayjs()
    return !last.isSame(now, 'day')
  }

  const doCheckin = async (record: string = '') => {
    if (!canCheckin()) return false
    
    const now = dayjs()
    const last = checkin.value.last_date ? dayjs(checkin.value.last_date) : null
    
    let newStreak = 1
    if (last && now.subtract(1, 'day').isSame(last, 'day')) {
      newStreak = (checkin.value.streak || 0) + 1
    }

    const backup = { ...checkin.value }
    // Optimistic
    checkin.value = {
      ...checkin.value,
      last_date: now.format('YYYY-MM-DD'),
      streak: newStreak,
      total_count: (checkin.value.total_count || 0) + 1,
      last_record: record
    }

    try {
      const updated = await checkinApi.upsert({
        user_id: authStore.user?.id,
        last_date: now.format('YYYY-MM-DD'),
        streak: newStreak,
        total_count: (backup.total_count || 0) + 1,
        last_record: record
      })
      checkin.value = updated
      await fetchCheckinHistory()
      return true
    } catch (e) {
      checkin.value = backup
      console.error(getErrorMessage(e))
      return false
    }
  }

  const updateCheckinRecord = async (record: string) => {
    if (!authStore.user?.id) return false
    
    const backup = { ...checkin.value }
    checkin.value.last_record = record

    try {
      const updated = await checkinApi.upsert({
        user_id: authStore.user.id,
        last_date: checkin.value.last_date,
        streak: checkin.value.streak,
        total_count: checkin.value.total_count,
        last_record: record
      })
      checkin.value = updated
      await fetchCheckinHistory()
      return true
    } catch (e) {
      checkin.value = backup
      console.error(getErrorMessage(e))
      return false
    }
  }

  const fetchCheckinHistory = async () => {
    try {
      const data = await checkinApi.getHistory()
      checkinHistory.value = data
    } catch (e) {
      console.error('Failed to fetch checkin history:', e)
    }
  }

  // --- Announcement Actions ---
  const addAnnouncement = async (text: string, type: Announcement['type'] = 'info') => {
    try {
      const newAnn = await announcementsApi.create(text, type)
      announcements.value.unshift(newAnn)
    } catch (e) {
      console.error(getErrorMessage(e))
    }
  }

  const removeAnnouncement = async (id: string) => {
    const backup = [...announcements.value]
    announcements.value = announcements.value.filter(a => a.id !== id)
    try {
      await announcementsApi.delete(id)
    } catch (e) {
      announcements.value = backup
      console.error(getErrorMessage(e))
    }
  }

  onUnmounted(() => {
    cleanupRealtime()
  })

  return {
    todos, checkin, checkinHistory, announcements, loading,
    initGadgets, addTodo, updateTodoStatus, postponeTodo, updateTodo, failTodo, removeTodo,
    canCheckin, doCheckin, updateCheckinRecord, fetchCheckinHistory, addAnnouncement, removeAnnouncement
  }
}, {
  persist: {
    // Only persist the lightweight checkin state (a few fields).
    // todos / checkinHistory / announcements are always fetched fresh from the server.
    // Persisting them wastes localStorage space and causes stale data flashes on page load.
    paths: ['checkin']
  }
})
