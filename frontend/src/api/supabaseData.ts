import { supabase } from './supabase'

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
  list: async (params?: any) => {
    const { data, error } = await supabase.from('notes').select('*').order('created_at', { ascending: false })
    if (error) throw error
    
    let notes = (data || []).map((n: any) => ({ ...n, tags: normalizeTags(n.tags) }))

    notes = notes.filter((note: any) => {
      const keywordMatch = includesKeyword([note.title, note.summary, note.content_md], params?.keyword)
      const tagMatch = !params?.tag || note.tags.some((tag: any) => tag.name === params.tag)
      const archiveMatch = matchesArchive(note.created_at, params?.year, params?.month)
      return keywordMatch && tagMatch && archiveMatch
    })
    return notes
  },

  create: async (data: any) => {
    const payload = {
      title: data.title,
      summary: data.summary || '',
      content_md: data.content_md || '',
      tags: data.tags || [], // pass string array directly to JSONB
    }
    const { data: created, error } = await supabase.from('notes').insert(payload).select().single()
    if (error) throw error
    return { ...created, tags: normalizeTags(created.tags) }
  },

  get: async (id: number) => {
    const { data, error } = await supabase.from('notes').select('*').eq('id', id).single()
    if (error) throw error
    return { ...data, tags: normalizeTags(data.tags) }
  },

  update: async (id: number, data: any) => {
    const payload = {
      title: data.title,
      summary: data.summary || '',
      content_md: data.content_md || '',
      tags: data.tags || [],
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
  list: async (params?: any) => {
    const { data, error } = await supabase.from('journals').select('*').order('created_at', { ascending: false })
    if (error) throw error
    
    let journals = data || []
    journals = journals.filter((journal: any) => {
      const keywordMatch = includesKeyword([journal.title, journal.excerpt, journal.content_html], params?.keyword)
      const archiveMatch = matchesArchive(journal.created_at, params?.year, params?.month)
      return keywordMatch && archiveMatch
    })
    return journals
  },

  create: async (data: any) => {
    const payload = {
      title: data.title,
      excerpt: data.excerpt || '',
      content_html: data.content_html || '',
      content_json: data.content_json || '{}',
    }
    const { data: created, error } = await supabase.from('journals').insert(payload).select().single()
    if (error) throw error
    return created
  },

  get: async (id: number) => {
    const { data, error } = await supabase.from('journals').select('*').eq('id', id).single()
    if (error) throw error
    return data
  },

  update: async (id: number, data: any) => {
    const payload = {
      title: data.title,
      excerpt: data.excerpt || '',
      content_html: data.content_html || '',
      content_json: data.content_json || '{}',
      updated_at: new Date().toISOString(),
    }
    const { data: updated, error } = await supabase.from('journals').update(payload).eq('id', id).select().single()
    if (error) throw error
    return updated
  },

  delete: async (id: number) => {
    const { error } = await supabase.from('journals').delete().eq('id', id)
    if (error) throw error
    return true
  },

  archives: async () => {
    const { data, error } = await supabase.from('journals').select('created_at')
    if (error) throw error
    return buildArchives(data || [])
  },
}

export const supabaseHobbiesApi = {
  list: async (params?: any) => {
    let query = supabase.from('hobbies').select('*').order('updated_at', { ascending: false })
    if (params?.type) query = query.eq('type', params.type)
    if (params?.status) query = query.eq('status', params.status)
    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  create: async (data: any) => {
    const payload = {
      title: data.title,
      type: data.type || 'anime',
      status: data.status || 'want',
      rating: typeof data.rating === 'number' ? data.rating : null,
      review: data.review || '',
      cover_url: data.cover_url || '',
    }
    const { data: created, error } = await supabase.from('hobbies').insert(payload).select().single()
    if (error) throw error
    return created
  },

  get: async (id: number) => {
    const { data, error } = await supabase.from('hobbies').select('*').eq('id', id).single()
    if (error) throw error
    return data
  },

  update: async (id: number, data: any) => {
    const payload = {
      title: data.title,
      type: data.type || 'anime',
      status: data.status || 'want',
      rating: typeof data.rating === 'number' ? data.rating : null,
      review: data.review || '',
      cover_url: data.cover_url || '',
      updated_at: new Date().toISOString(),
    }
    const { data: updated, error } = await supabase.from('hobbies').update(payload).eq('id', id).select().single()
    if (error) throw error
    return updated
  },

  delete: async (id: number) => {
    const { error } = await supabase.from('hobbies').delete().eq('id', id)
    if (error) throw error
    return true
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
    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)
    const monthStartStr = monthStart.toISOString()

    const [
      { data: notes, count: notesCount },
      { data: journals, count: journalsCount },
      { data: hobbies, count: hobbiesCount },
      { count: completedTodosCount },
      { count: monthNotesCount },
      { count: monthJournalsCount },
      { count: monthHobbiesCount },
    ] = await Promise.all([
      supabase.from('notes').select('*', { count: 'exact' }).order('created_at', { ascending: false }).limit(5),
      supabase.from('journals').select('*', { count: 'exact' }).order('created_at', { ascending: false }).limit(5),
      supabase.from('hobbies').select('*', { count: 'exact' }).order('updated_at', { ascending: false }).limit(5),
      supabase.from('todos').select('*', { count: 'exact', head: true }).eq('completed', true),
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
        completed_todos: completedTodosCount || 0,
        month_updates: monthUpdates,
      },
      latest_notes: (notes || []).map((n: any) => ({ ...n, tags: normalizeTags(n.tags) })),
      latest_journals: journals || [],
      latest_hobbies: hobbies || [],
    }
  },
}

export const supabaseTodosApi = {
  list: async () => {
    const { data, error } = await supabase.from('todos').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  },
  create: async (text: string, dueDate?: string | null) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    const payload = dueDate ? { text, user_id: user.id, due_date: dueDate } : { text, user_id: user.id }
    const { data, error } = await supabase.from('todos').insert(payload).select().single()
    if (error) throw error
    return data
  },
  toggle: async (id: string, completed: boolean) => {
    const { data, error } = await supabase.from('todos').update({ completed }).eq('id', id).select().single()
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
