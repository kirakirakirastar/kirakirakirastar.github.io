import { defineStore } from 'pinia'
import { ref } from 'vue'
import dayjs from 'dayjs'
import { todosApi, checkinApi, announcementsApi } from '@/api/gadgets'

export interface Todo {
  id: string
  text: string
  completed: boolean
  created_at: string
}

export interface CheckinState {
  last_date: string | null
  streak: number
  total_count: number
}

export interface Announcement {
  id: string
  text: string
  type: 'info' | 'success' | 'warning'
  created_at: string
}

export const useGadgetStore = defineStore('gadgets', () => {
  const todos = ref<Todo[]>([])
  const checkin = ref<CheckinState>({
    last_date: null,
    streak: 0,
    total_count: 0
  })
  const announcements = ref<Announcement[]>([])
  const loading = ref(false)

  const initGadgets = async () => {
    loading.value = true
    try {
      const [todosData, checkinData, announcementsData] = await Promise.all([
        todosApi.list(),
        checkinApi.get(),
        announcementsApi.list()
      ])
      
      todos.value = todosData
      if (checkinData) {
        checkin.value = checkinData
      } else {
        // Reset to default if no record found
        checkin.value = { last_date: null, streak: 0, total_count: 0 }
      }
      announcements.value = announcementsData
    } catch (e) {
      console.error('Failed to fetch gadgets from backend:', e)
    } finally {
      loading.value = false
    }
  }

  // --- Todo Actions ---
  const addTodo = async (text: string) => {
    if (!text.trim()) return
    try {
      const newTodo = await todosApi.create(text.trim())
      todos.value.unshift(newTodo)
    } catch (e) {
      console.error('Failed to create todo:', e)
    }
  }

  const toggleTodo = async (id: string) => {
    const todo = todos.value.find(t => t.id === id)
    if (todo) {
      try {
        const updated = await todosApi.toggle(id, !todo.completed)
        todo.completed = updated.completed
      } catch (e) {
        console.error('Failed to toggle todo:', e)
      }
    }
  }

  const removeTodo = async (id: string) => {
    try {
      await todosApi.delete(id)
      todos.value = todos.value.filter(t => t.id !== id)
    } catch (e) {
      console.error('Failed to delete todo:', e)
    }
  }

  // --- Checkin Actions ---
  const canCheckin = () => {
    if (!checkin.value.last_date) return true
    const last = dayjs(checkin.value.last_date)
    const now = dayjs()
    return !last.isSame(now, 'day')
  }

  const doCheckin = async () => {
    if (!canCheckin()) return false
    
    const now = dayjs()
    const last = checkin.value.last_date ? dayjs(checkin.value.last_date) : null
    
    let newStreak = 1
    const isNextDay = last && now.diff(last, 'day') <= 1.5 && now.isAfter(last.endOf('day'))
    
    // Simple logic: if checked in yesterday, increment. Otherwise reset to 1.
    // dayjs yesterday check: now.subtract(1, 'day').isSame(last, 'day')
    if (last && now.subtract(1, 'day').isSame(last, 'day')) {
      newStreak = checkin.value.streak + 1
    }

    try {
      const updated = await checkinApi.upsert({
        last_date: now.format('YYYY-MM-DD'),
        streak: newStreak,
        total_count: (checkin.value.total_count || 0) + 1
      })
      checkin.value = updated
      return true
    } catch (e) {
      console.error('Failed to checkin:', e)
      return false
    }
  }

  // --- Announcement Actions (For management page) ---
  const addAnnouncement = async (text: string, type: string = 'info') => {
    try {
      const newAnn = await announcementsApi.create(text, type)
      announcements.value.unshift(newAnn)
    } catch (e) {
      console.error('Failed to create announcement:', e)
    }
  }

  const removeAnnouncement = async (id: string) => {
    try {
      await announcementsApi.delete(id)
      announcements.value = announcements.value.filter(a => a.id !== id)
    } catch (e) {
      console.error('Failed to delete announcement:', e)
    }
  }

  return {
    todos, checkin, announcements, loading,
    initGadgets, addTodo, toggleTodo, removeTodo,
    canCheckin, doCheckin, addAnnouncement, removeAnnouncement
  }
})
