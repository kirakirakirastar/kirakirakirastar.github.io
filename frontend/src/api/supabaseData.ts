import { supabase } from './supabase'
import type { Note, Journal, Hobby, Todo, Folder } from './types'
import dayjs from 'dayjs'

const includesKeyword = (values: Array<string | undefined>, keyword?: string) => {
  if (!keyword) return true
  const normalizedKeyword = keyword.trim().toLowerCase()
  if (!normalizedKeyword) return true
  return values.some((value) => value?.toLowerCase().includes(normalizedKeyword))
}

const matchesArchive = (dateValue: string, year?: number, month?: number) => {
  if (!year && !month) return true
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return false
  if (year && date.getFullYear() !== Number(year)) return false
  if (month && date.getMonth() + 1 !== Number(month)) return false
  return true
}

const buildArchives = (items: Array<{ created_at: string }>) => {
  const archiveMap = new Map<string, { year: number; month: number; count: number }>()

  for (const item of items) {
    const date = new Date(item.created_at)
    if (Number.isNaN(date.getTime())) continue
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const key = `${year}-${month}`
    const current = archiveMap.get(key)
    if (current) {
      current.count += 1
    } else {
      archiveMap.set(key, { year, month, count: 1 })
    }
  }

  return [...archiveMap.values()].sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year
    return b.month - a.month
  })
}

// Convert string array to the tag objects expected by the frontend
const normalizeTags = (tagsRaw: any) => {
  if (!Array.isArray(tagsRaw)) return []
  return tagsRaw.map((t, index) => {
    if (typeof t === 'string') return { id: index + 1, name: t }
    return t
  })
}

export const supabaseNotesApi = {
  list: async (params?: any): Promise<Note[]> => {
    let query = supabase.from('notes').select('*')
    
    if (params?.keyword) {
      const kw = `%${params.keyword}%`
      query = query.or(`title.ilike.${kw},summary.ilike.${kw},content_md.ilike.${kw}`)
    }

    if (params?.tag) {
      query = query.contains('tags', [params.tag])
    }

    if (params?.folderId !== undefined) {
      if (params.folderId === null) {
        query = query.is('folder_id', null)
      } else {
        query = query.eq('folder_id', params.folderId)
      }
    }

    if (params?.year) {
      const year = Number(params.year)
      const month = params.month ? Number(params.month) : null
      const start = month ? new Date(year, month - 1, 1).toISOString() : new Date(year, 0, 1).toISOString()
      const end = month ? new Date(year, month, 0, 23, 59, 59, 999).toISOString() : new Date(year, 11, 31, 23, 59, 59, 999).toISOString()
      query = query.gte('created_at', start).lte('created_at', end)
    }

    const { data, error } = await query.order('created_at', { ascending: false })
    if (error) throw error
    
    return (data || []).map((n: any) => ({ ...n, tags: normalizeTags(n.tags) }))
  },

  create: async (data: any): Promise<Note> => {
    const payload = {
      title: data.title,
      summary: data.summary || '',
      content_md: data.content_md || '',
      tags: data.tags || [],
      folder_id: data.folder_id || null,
    }
    const { data: created, error } = await supabase.from('notes').insert(payload).select().single()
    if (error) throw error
    return { ...created, tags: normalizeTags(created.tags) }
  },

  get: async (id: number): Promise<Note> => {
    const { data, error } = await supabase.from('notes').select('*').eq('id', id).single()
    if (error) throw error
    return { ...data, tags: normalizeTags(data.tags) }
  },

  update: async (id: number, data: any): Promise<Note> => {
    const payload = {
      title: data.title,
      summary: data.summary || '',
      content_md: data.content_md || '',
      tags: data.tags || [],
      folder_id: data.folder_id !== undefined ? data.folder_id : undefined,
      updated_at: new Date().toISOString(),
    }
    const { data: updated, error } = await supabase.from('notes').update(payload).eq('id', id).select().single()
    if (error) throw error
    return { ...updated, tags: normalizeTags(updated.tags) }
  },

  delete: async (id: number) => {
    const { error } = await supabase.from('notes').delete().eq('id', id)
    if (error) throw error
    return true
  },

  batchDelete: async (ids: number[]) => {
    const { error } = await supabase.from('notes').delete().in('id', ids)
    if (error) throw error
    return true
  },

  batchMove: async (ids: number[], folderId: number | null) => {
    const { error } = await supabase.from('notes').update({ folder_id: folderId }).in('id', ids)
    if (error) throw error
    return true
  },

  archives: async () => {
    const { data, error } = await supabase.from('notes').select('created_at')
    if (error) throw error
    return buildArchives(data || [])
  },

  tags: async () => {
    const { data, error } = await supabase.from('notes').select('tags')
    if (error) throw error
    const tagMap = new Map<string, any>()
    for (const note of data || []) {
      const tags = normalizeTags(note.tags)
      for (const tag of tags) {
        if (!tagMap.has(tag.name)) tagMap.set(tag.name, tag)
      }
    }
    return [...tagMap.values()].sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'))
  },
}

export const supabaseJournalsApi = {
  list: async (params?: any): Promise<Journal[]> => {
    let query = supabase.from('journals').select('*')

    if (params?.keyword) {
      const kw = `%${params.keyword}%`
      query = query.or(`title.ilike.${kw},excerpt.ilike.${kw}`)
    }

    if (params?.tag) {
      query = query.contains('tags', [params.tag])
    }

    if (params?.folderId !== undefined) {
      if (params.folderId === null) {
        query = query.is('folder_id', null)
      } else {
        query = query.eq('folder_id', params.folderId)
      }
    }

    if (params?.year) {
      const year = Number(params.year)
      const month = params.month ? Number(params.month) : null
      const start = month ? new Date(year, month - 1, 1) : new Date(year, 0, 1)
      const end = month ? new Date(year, month, 0, 23, 59, 59) : new Date(year, 11, 31, 23, 59, 59)
      query = query.gte('created_at', start.toISOString()).lte('created_at', end.toISOString())
    }

    const { data, error } = await query.order('created_at', { ascending: false })
    if (error) throw error
    return (data || []).map((j: any) => ({ ...j, tags: normalizeTags(j.tags) }))
  },

  create: async (data: any): Promise<Journal> => {
    const payload = {
      title: data.title,
      excerpt: data.excerpt || '',
      content_html: data.content_html || '',
      content_json: data.content_json || '{}',
      tags: data.tags || [],
      folder_id: data.folder_id || null,
    }
    const { data: created, error } = await supabase.from('journals').insert(payload).select().single()
    if (error) throw error
    return { ...created, tags: normalizeTags(created.tags) }
  },

  get: async (id: number): Promise<Journal> => {
    const { data, error } = await supabase.from('journals').select('*').eq('id', id).single()
    if (error) throw error
    return { ...data, tags: normalizeTags(data.tags) }
  },

  update: async (id: number, data: any): Promise<Journal> => {
    const payload = {
      title: data.title,
      excerpt: data.excerpt || '',
      content_html: data.content_html || '',
      content_json: data.content_json || '{}',
      tags: data.tags || [],
      folder_id: data.folder_id !== undefined ? data.folder_id : undefined,
      updated_at: new Date().toISOString(),
    }
    const { data: updated, error } = await supabase.from('journals').update(payload).eq('id', id).select().single()
    if (error) throw error
    return { ...updated, tags: normalizeTags(updated.tags) }
  },

  delete: async (id: number) => {
    const { error } = await supabase.from('journals').delete().eq('id', id)
    if (error) throw error
    return true
  },

  batchDelete: async (ids: number[]) => {
    const { error } = await supabase.from('journals').delete().in('id', ids)
    if (error) throw error
    return true
  },

  batchMove: async (ids: number[], folderId: number | null) => {
    const { error } = await supabase.from('journals').update({ folder_id: folderId }).in('id', ids)
    if (error) throw error
    return true
  },

  archives: async () => {
    const { data, error } = await supabase.from('journals').select('created_at')
    if (error) throw error
    return buildArchives(data || [])
  },
  
  tags: async () => {
    const { data, error } = await supabase.from('journals').select('tags')
    if (error) throw error
    const tagMap = new Map<string, any>()
    for (const journal of data || []) {
      const tags = normalizeTags(journal.tags)
      for (const tag of tags) {
        if (!tagMap.has(tag.name)) tagMap.set(tag.name, tag)
      }
    }
    return [...tagMap.values()].sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'))
  },
}

export const supabaseHobbiesApi = {
  list: async (params?: any): Promise<Hobby[]> => {
    let query = supabase.from('hobbies').select('*').order('updated_at', { ascending: false })
    if (params?.type) query = query.eq('type', params.type)
    if (params?.status) query = query.eq('status', params.status)
    if (params?.tag) {
      query = query.contains('tags', [params.tag])
    }
    if (params?.folderId !== undefined) {
      if (params.folderId === null) {
        query = query.is('folder_id', null)
      } else {
        query = query.eq('folder_id', params.folderId)
      }
    }
    const { data, error } = await query
    if (error) throw error
    return (data || []).map((h: any) => ({ ...h, tags: normalizeTags(h.tags) }))
  },

  create: async (data: any): Promise<Hobby> => {
    const payload = {
      title: data.title,
      type: data.type || 'anime',
      status: data.status || 'want',
      rating: typeof data.rating === 'number' ? data.rating : null,
      review: data.review || '',
      cover_url: data.cover_url || '',
      tags: data.tags || [],
      folder_id: data.folder_id || null,
    }
    const { data: created, error } = await supabase.from('hobbies').insert(payload).select().single()
    if (error) throw error
    return { ...created, tags: normalizeTags(created.tags) }
  },

  get: async (id: number): Promise<Hobby> => {
    const { data, error } = await supabase.from('hobbies').select('*').eq('id', id).single()
    if (error) throw error
    return { ...data, tags: normalizeTags(data.tags) }
  },

  update: async (id: number, data: any): Promise<Hobby> => {
    const payload = {
      title: data.title,
      type: data.type || 'anime',
      status: data.status || 'want',
      rating: typeof data.rating === 'number' ? data.rating : null,
      review: data.review || '',
      cover_url: data.cover_url || '',
      tags: data.tags || [],
      folder_id: data.folder_id !== undefined ? data.folder_id : undefined,
      updated_at: new Date().toISOString(),
    }
    const { data: updated, error } = await supabase.from('hobbies').update(payload).eq('id', id).select().single()
    if (error) throw error
    return { ...updated, tags: normalizeTags(updated.tags) }
  },

  delete: async (id: number) => {
    const { error } = await supabase.from('hobbies').delete().eq('id', id)
    if (error) throw error
    return true
  },

  batchDelete: async (ids: number[]) => {
    const { error } = await supabase.from('hobbies').delete().in('id', ids)
    if (error) throw error
    return true
  },

  batchMove: async (ids: number[], folderId: number | null) => {
    const { error } = await supabase.from('hobbies').update({ folder_id: folderId }).in('id', ids)
    if (error) throw error
    return true
  },

  tags: async () => {
    const { data, error } = await supabase.from('hobbies').select('tags')
    if (error) throw error
    const tagMap = new Map<string, any>()
    for (const hobby of data || []) {
      const tags = normalizeTags(hobby.tags)
      for (const tag of tags) {
        if (!tagMap.has(tag.name)) tagMap.set(tag.name, tag)
      }
    }
    return [...tagMap.values()].sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'))
  },

  stats: async () => {
    const { data, error } = await supabase.from('hobbies').select('status, rating')
    if (error) throw error
    const hobbies = data || []
    
    const rated = hobbies.filter((item: any) => typeof item.rating === 'number' && item.rating !== null)
    const avgRating = rated.length
      ? rated.reduce((sum: number, item: any) => sum + Number(item.rating), 0) / rated.length
      : null

    return {
      total: hobbies.length,
      completed: hobbies.filter((item: any) => item.status === 'completed').length,
      in_progress: hobbies.filter((item: any) => item.status === 'in_progress').length,
      avg_rating: avgRating,
    }
  },
}

export const supabaseDashboardApi = {
  get: async () => {
    const now = new Date()
    
    const monthStart = new Date(now)
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)
    const monthStartStr = monthStart.toISOString()

    const todayStart = new Date(now)
    todayStart.setHours(0, 0, 0, 0)
    const todayStartStr = todayStart.toISOString()

    const weekStart = new Date(now)
    const day = weekStart.getDay()
    const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1)
    weekStart.setDate(diff)
    weekStart.setHours(0, 0, 0, 0)
    const weekStartStr = weekStart.toISOString()

    const [
      { data: notes, count: notesCount },
      { data: journals, count: journalsCount },
      { data: hobbies, count: hobbiesCount },
      { count: completedTodosToday },
      { count: completedTodosWeek },
      { count: completedTodosMonth },
      { count: monthNotesCount },
      { count: monthJournalsCount },
      { count: monthHobbiesCount },
    ] = await Promise.all([
      supabase.from('notes').select('*', { count: 'exact' }).order('created_at', { ascending: false }).limit(5),
      supabase.from('journals').select('*', { count: 'exact' }).order('created_at', { ascending: false }).limit(5),
      supabase.from('hobbies').select('*', { count: 'exact' }).order('updated_at', { ascending: false }).limit(5),
      supabase.from('todos').select('*', { count: 'exact', head: true }).eq('status', 'completed').gte('completed_at', todayStartStr),
      supabase.from('todos').select('*', { count: 'exact', head: true }).eq('status', 'completed').gte('completed_at', weekStartStr),
      supabase.from('todos').select('*', { count: 'exact', head: true }).eq('status', 'completed').gte('completed_at', monthStartStr),
      supabase.from('notes').select('*', { count: 'exact', head: true }).gte('updated_at', monthStartStr),
      supabase.from('journals').select('*', { count: 'exact', head: true }).gte('updated_at', monthStartStr),
      supabase.from('hobbies').select('*', { count: 'exact', head: true }).gte('updated_at', monthStartStr),
    ])

    const monthUpdates = (monthNotesCount || 0) + (monthJournalsCount || 0) + (monthHobbiesCount || 0)
    
    return {
      stats: {
        notes_count: notesCount || 0,
        journals_count: journalsCount || 0,
        hobbies_count: hobbiesCount || 0,
        completed_todos_today: completedTodosToday || 0,
        completed_todos_week: completedTodosWeek || 0,
        completed_todos_month: completedTodosMonth || 0,
        month_updates: monthUpdates,
      },
      latest_notes: (notes || []).map((n: any) => ({ ...n, tags: normalizeTags(n.tags) })),
      latest_journals: journals || [],
      latest_hobbies: hobbies || [],
    }
  },
  activities: async () => {
    const [
      { data: notes },
      { data: journals },
      { data: hobbies },
      { data: todos },
      { data: checkin },
      { data: pendingTodos },
    ] = await Promise.all([
      supabase.from('notes').select('created_at'),
      supabase.from('journals').select('created_at'),
      supabase.from('hobbies').select('updated_at'),
      supabase.from('todos').select('completed_at').eq('status', 'completed'),
      supabase.from('checkins').select('*').single(),
      supabase.from('todos').select('due_date').eq('status', 'pending').not('due_date', 'is', null)
    ])

    const activityMap: Record<string, { notes: number, journals: number, todos: number, hobbies: number, checkins: number, schedules: number, total: number }> = {}

    const addActivity = (dateStr: string, type: 'notes' | 'journals' | 'todos' | 'hobbies' | 'checkins' | 'schedules') => {
      const date = dateStr.split('T')[0]
      if (!activityMap[date]) {
        activityMap[date] = { notes: 0, journals: 0, todos: 0, hobbies: 0, checkins: 0, schedules: 0, total: 0 }
      }
      activityMap[date][type]++
      activityMap[date].total++
    }

    (notes || []).forEach(n => addActivity(n.created_at, 'notes'));
    (journals || []).forEach(j => addActivity(j.created_at, 'journals'));
    (hobbies || []).forEach(h => addActivity(h.updated_at, 'hobbies'));
    (todos || []).forEach(t => addActivity(t.completed_at!, 'todos'));
    (pendingTodos || []).forEach(t => addActivity(t.due_date!, 'schedules'));

    // Reconstruct history from current check-in streak
    if (checkin && checkin.last_date && checkin.streak > 0) {
      const last = dayjs(checkin.last_date)
      for (let i = 0; i < checkin.streak; i++) {
        const d = last.subtract(i, 'day').format('YYYY-MM-DD')
        addActivity(d, 'checkins')
      }
    }

    return activityMap
  }
}

export const supabaseTodosApi = {
  list: async () => {
    const { data, error } = await supabase.from('todos').select('*').order('created_at', { ascending: false })
    if (error) throw error
    
    // Lazy Evaluate Failures
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const failedIds: string[] = []
    
    const todos = (data || []).map((t: any) => {
      // Auto-migrate legacy boolean
      if (t.completed === true && (!t.status || t.status === 'pending')) {
        t.status = 'completed'
      } else if (t.status === 'pending' && t.due_date) {
        const dueDate = new Date(t.due_date)
        if (dueDate < now) {
          t.status = 'failed'
          failedIds.push(t.id)
        }
      }
      return t
    })

    // Fire and forget update
    if (failedIds.length > 0) {
      supabase.from('todos').update({ status: 'failed' }).in('id', failedIds).then()
    }

    return todos
  },
  create: async (text: string, payloadUpdates?: any) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    
    const payload = {
      text,
      user_id: user.id,
      priority: payloadUpdates?.priority || 'medium',
      start_date: payloadUpdates?.start_date || null,
      due_date: payloadUpdates?.due_date || null,
      recurrence: payloadUpdates?.recurrence || 'none',
      status: 'pending'
    }
    
    const { data, error } = await supabase.from('todos').insert(payload).select().single()
    if (error) throw error
    return data
  },
  updateStatus: async (id: string, status: string) => {
    const isCompleted = status === 'completed'
    const payload = {
      status,
      completed: isCompleted,
      completed_at: isCompleted ? new Date().toISOString() : null
    }
    const { data, error } = await supabase.from('todos').update(payload).eq('id', id).select().single()
    if (error) throw error
    return data
  },
  update: async (id: string, updates: any) => {
    const { data, error } = await supabase.from('todos').update(updates).eq('id', id).select().single()
    if (error) throw error
    return data
  },
  delete: async (id: string) => {
    const { error } = await supabase.from('todos').delete().eq('id', id)
    if (error) throw error
    return true
  }
}

export const supabaseCheckinApi = {
  get: async () => {
    const { data, error } = await supabase.from('checkins').select('*').single()
    if (error && error.code !== 'PGRST116') throw error // Ignore "not found"
    return data
  },
  upsert: async (update: any) => {
    // Specify user_id as the conflict target for upsert to work correctly with unique constraint
    const { data, error } = await supabase.from('checkins').upsert({
      user_id: update.user_id,
      last_date: update.last_date,
      streak: update.streak,
      total_count: update.total_count,
      last_record: update.last_record // New field
    }, { onConflict: 'user_id' }).select().single()
    if (error) throw error
    return data
  }
}

export const supabaseAnnouncementsApi = {
  list: async () => {
    const { data, error } = await supabase.from('announcements').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  },
  create: async (text: string, type: string = 'info') => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    const { data, error } = await supabase.from('announcements').insert({ text, type, user_id: user.id }).select().single()
    if (error) throw error
    return data
  },
  delete: async (id: string) => {
    const { error } = await supabase.from('announcements').delete().eq('id', id)
    if (error) throw error
    return true
  }
}

export const uploadImageLocally = (file: File) => new Promise<{ url: string; original_name: string }>((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = () => resolve({ url: String(reader.result || ''), original_name: file.name })
  reader.onerror = () => reject(new Error('读取图片失败'))
  reader.readAsDataURL(file)
})
export const supabaseFoldersApi = {
  list: async (type: 'note' | 'journal' | 'hobby'): Promise<Folder[]> => {
    const { data, error } = await supabase.from('folders').select('*').eq('type', type).order('created_at', { ascending: true })
    if (error) throw error
    return data || []
  },

  create: async (name: string, type: 'note' | 'journal' | 'hobby'): Promise<Folder> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    
    const { data, error } = await supabase.from('folders').insert({ name, type, user_id: user.id }).select().single()
    if (error) throw error
    return data
  },

  update: async (id: number, name: string): Promise<Folder> => {
    const { data, error } = await supabase.from('folders').update({ name }).eq('id', id).select().single()
    if (error) throw error
    return data
  },

  delete: async (id: number) => {
    const { error } = await supabase.from('folders').delete().eq('id', id)
    if (error) throw error
    return true
  }
}
