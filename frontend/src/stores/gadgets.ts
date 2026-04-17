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
    
    let processedUpdates = { ...payloadUpdates }

    // Logic: If daily recurrence, normalize to 1-day stages
    if (processedUpdates.recurrence === 'daily') {
      const start = processedUpdates.start_date || dayjs().format('YYYY-MM-DD')
      const originalDue = processedUpdates.due_date || start
      
      // If user had a range (e.g. 17-19), cap the series at 19 but make instance 17-17
      if (dayjs(originalDue).isAfter(dayjs(start))) {
        processedUpdates.recurrence_until = originalDue
        processedUpdates.due_date = start
      } else {
        processedUpdates.due_date = start
      }
    }

    // Pass through series_started_at if manual back-filling is used
    if (payloadUpdates?.series_started_at) {
      processedUpdates.series_started_at = payloadUpdates.series_started_at
    }

    // Optimistic Update
    const tempId = `temp-${Date.now()}`
    const tempTodo: Todo = {
      id: tempId,
      text: text.trim(),
      completed: false,
      status: 'pending',
      priority: processedUpdates?.priority || 'medium',
      recurrence: processedUpdates?.recurrence || 'none',
      created_at: new Date().toISOString(),
      ...processedUpdates
    }
    
    todos.value.unshift(tempTodo)

    try {
      const newTodo = await todosApi.create(text.trim(), processedUpdates)
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

  /**
   * Bulk creates a parent bundle and all its defined children
   */
  const addBundle = async (parentText: string, parentPayload: any, childDrafts: any[]) => {
    loading.value = true
    try {
      // 1. Create parent
      const parent = await todosApi.create(parentText, { ...parentPayload, is_bundle: true })
      todos.value.unshift(parent)

      // 2. Create children
      const childPromises = childDrafts.map(child => {
        return todosApi.create(child.text, {
          ...child,
          parent_id: parent.id,
          priority: child.priority || parent.priority,
          is_private: parent.is_private
        })
      })

      const createdChildren = await Promise.all(childPromises)
      todos.value.push(...createdChildren)
      
    } catch (e) {
      console.error('Failed to create bundle:', e)
    } finally {
      loading.value = false
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
      
      // Cascaded completion: If a bundle is completed, auto-complete children
      if (status === 'completed' && todo.is_bundle) {
        const children = todos.value.filter(t => t.parent_id === id && t.status === 'pending')
        for (const child of children) {
          // Sequential to keep logic clean and trigger their handleRecurrence if needed
          await updateTodoStatus(child.id, 'completed')
        }
      }

      // Reverse cascaded completion: If all children of a bundle are now finished, the parent should be settled
      if (todo.parent_id) {
        const parent = todos.value.find(t => t.id === todo.parent_id)
        if (parent && parent.status === 'pending') {
          const siblingsAndSelf = todos.value.filter(t => t.parent_id === parent.id)
          const allFinished = siblingsAndSelf.every(t => t.status !== 'pending')
          if (allFinished) {
            await updateTodoStatus(parent.id, 'completed')
          }
        }
      }

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

    // For Daily cycles, always use 1-day duration for "Stage Mode"
    // Otherwise, calculate the original relative duration
    const start = dayjs(todo.start_date || todo.created_at)
    const due = dayjs(todo.due_date || todo.start_date || todo.created_at)
    
    const durationDays = todo.recurrence === 'daily' ? 0 : due.diff(start, 'day')

    let nextStart = start.add(1, unit)
    let nextDue = nextStart.add(durationDays, 'day')

    let iterations = 0
    const maxIterations = 31 // Limit catch-up to 1 month to prevent infinite loops

    while (iterations < maxIterations) {
      iterations++

      // Hard Cap check: Don't create if next stage overflows the series deadline
      if (todo.recurrence_until && nextStart.isAfter(dayjs(todo.recurrence_until))) {
        break
      }
      
      // Perfectionist cap: if it overflows original due date and that was intended as the series end
      if (!todo.recurrence_until && todo.due_date && nextStart.isAfter(dayjs(todo.due_date))) {
         // This handles the "17-19 Daily" where 19 was the specific end
         break
      }

      // Deduplication: Don't create if an instance with same text and due_date already exists
      const exists = todos.value.some(t => 
        t.text === todo.text && 
        dayjs(t.due_date).isSame(nextDue, 'day')
      )

      if (!exists) {
        const followingWindowStarts = nextStart.add(1, unit).startOf('day')
        const isHistorical = followingWindowStarts.isSameOrBefore(now)
        const finalDueDatePassed = nextDue.isBefore(now)

        const newStatus = (isHistorical || finalDueDatePassed) ? 'failed' : 'pending'

        const newParent = await todosApi.create(todo.text, {
          priority: todo.priority,
          start_date: nextStart.format('YYYY-MM-DD'),
          due_date: nextDue.format('YYYY-MM-DD'),
          recurrence: todo.recurrence,
          recurrence_until: todo.recurrence_until || todo.due_date,
          series_started_at: todo.series_started_at,
          is_private: todo.is_private,
          is_bundle: todo.is_bundle,
          status: newStatus
        })
        todos.value.unshift(newParent)

        // LOGIC FIX: If it's a bundle, we MUST clone the recursive children for the new cycle
        if (todo.is_bundle) {
          const originalChildren = todos.value.filter(t => t.parent_id === todo.id)
          const childPromises = originalChildren.map(cTemplate => {
            const cStart = nextStart.add(cTemplate.start_offset || 0, 'day')
            const cDue = cStart.add(cTemplate.duration_days || 1, 'day').subtract(1, 'day')
            
            return todosApi.create(cTemplate.text, {
              parent_id: newParent.id,
              priority: cTemplate.priority || todo.priority,
              status: newStatus, // Inherit failed/pending status
              start_date: cStart.format('YYYY-MM-DD'),
              due_date: cDue.format('YYYY-MM-DD'),
              start_offset: cTemplate.start_offset,
              duration_days: cTemplate.duration_days,
              is_private: todo.is_private
            })
          })
          const nextChildren = await Promise.all(childPromises)
          todos.value.push(...nextChildren)
        }

        if (newStatus === 'pending') break
      } else {
        const instance = todos.value.find(t => t.text === todo.text && dayjs(t.due_date).isSame(nextDue, 'day'))
        if (instance && instance.status === 'pending') break
      }

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

    // Cascaded Postpone: If this has children, move them too!
    const children = todos.value.filter(t => t.parent_id === id)
    if (children.length > 0) {
      for (const child of children) {
        await postponeTodo(child.id, days)
      }
    }

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
    
    // Cascaded Local Cleanup: Remove the item AND any of its children from the store
    todos.value = todos.value.filter(t => t.id !== id && t.parent_id !== id)

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

  const getSeriesStats = (todo: Todo) => {
    if (!todo.recurrence || todo.recurrence === 'none') return null

    const series = todos.value.filter(t => 
      t.text === todo.text && 
      t.recurrence === todo.recurrence
    ).sort((a, b) => dayjs(b.start_date || b.created_at).diff(dayjs(a.start_date || a.created_at)))
    
    if (series.length === 0) return null

    // 1. Determine Anchor Date (Prefer manually set series_started_at)
    const earlyTask = series[series.length - 1]
    const earliestData = earlyTask.start_date || earlyTask.created_at
    const anchor = todo.series_started_at || earliestData

    // 2. Completion Metrics
    const completed = series.filter(t => t.status === 'completed').length
    const today = dayjs().startOf('day')
    const start = dayjs(anchor).startOf('day')
    let end = today

    if (todo.recurrence_until && today.isAfter(dayjs(todo.recurrence_until))) {
      end = dayjs(todo.recurrence_until).startOf('day')
    }

    const elapsed = Math.max(1, end.diff(start, 'day') + 1)
    
    // 3. Success Perfection vs Threshold
    const rate = completed / elapsed
    const isPerfect = todo.recurrence_until ? (completed === elapsed) : (rate >= 0.9)
    const isFinished = !!(todo.recurrence_until && today.isAfter(dayjs(todo.recurrence_until)))

    // 4. Streak Calculation
    let streak = 0
    const checkDate = today
    
    // Scan series items to find continuous completed chain starting from today or yesterday
    let currentInChain = checkDate
    
    // If today exists and is pending, start checking from yesterday
    const todayTask = series.find(t => dayjs(t.start_date).isSame(today, 'day'))
    if (todayTask && todayTask.status !== 'completed') {
      currentInChain = today.subtract(1, 'day')
    }

    while (true) {
      const taskOnDate = series.find(t => dayjs(t.start_date).isSame(currentInChain, 'day'))
      if (taskOnDate && taskOnDate.status === 'completed') {
        streak++
        currentInChain = currentInChain.subtract(1, 'day')
      } else {
        // Break chain if we don't find a completed task for that day 
        // OR we've checked back before the series started
        break
      }
      if (currentInChain.isBefore(start)) break
      if (streak > 999) break // Safety
    }

    return {
      completed,
      total: elapsed,
      anchor_date: anchor,
      isPerfect,
      isFinished,
      rate: Math.round(rate * 100),
      streak,
      grade: calculateGrade(rate),
      sub_progress: getSubProgress(todo)
    }
  }

  const calculateGrade = (rate: number) => {
    if (rate >= 1) return 'S'
    if (rate >= 0.9) return 'A'
    if (rate >= 0.75) return 'B'
    return 'C'
  }

  const getSubProgress = (todo: Todo) => {
    if (!todo.is_bundle) return null
    const children = todos.value.filter(t => t.parent_id === todo.id)
    if (children.length === 0) return null
    const comp = children.filter(t => t.status === 'completed').length
    return {
      completed: comp,
      total: children.length,
      percent: Math.round((comp / children.length) * 100)
    }
  }

  /**
   * Builds a tree structure for UI rendering
   * Returns top-level items that represent either standalone tasks, 
   * aggregated series cards, or parent task bundles.
   */
  const getTodoTree = (rawList: Todo[]) => {
    // 1. First, identify standalone vs child tasks
    const topLevel = rawList.filter(t => !t.parent_id)
    const childrenMap: Record<string, Todo[]> = {}
    
    rawList.forEach(t => {
      if (t.parent_id) {
        if (!childrenMap[t.parent_id]) childrenMap[t.parent_id] = []
        childrenMap[t.parent_id].push(t)
      }
    })

    // 2. Map children into parents and attach stats
    return topLevel.map(todo => {
      const children = childrenMap[todo.id] || []
      return {
         ...todo,
         children: children.sort((a,b) => (a.start_offset || 0) - (b.start_offset || 0)),
         series_stats: getSeriesStats(todo)
      }
    })
  }

  onUnmounted(() => {
    cleanupRealtime()
  })

  return {
    todos, checkin, checkinHistory, announcements, loading,
    initGadgets, addTodo, addBundle, updateTodoStatus, postponeTodo, updateTodo, failTodo, removeTodo,
    canCheckin, doCheckin, updateCheckinRecord, fetchCheckinHistory, addAnnouncement, removeAnnouncement,
    getSeriesStats, getTodoTree
  }
}, {
  persist: {
    // Only persist the lightweight checkin state (a few fields).
    // todos / checkinHistory / announcements are always fetched fresh from the server.
    // Persisting them wastes localStorage space and causes stale data flashes on page load.
    paths: ['checkin']
  }
})
