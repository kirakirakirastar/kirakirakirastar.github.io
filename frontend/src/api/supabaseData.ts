import { supabase } from './supabase'
import type { Note, Journal, Hobby, Todo, Folder, DashboardData, ActivityMap, ActivityDay, Tag, Announcement } from './types'
import dayjs from 'dayjs'
import { compressImage, fileToBase64 } from '@/utils/image'
import { extractStoragePaths, deleteStorageFiles, deleteFileByUrl } from './cleanup'

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

    // 回收站过滤：默认只显示未删除项
    query = query.is('deleted_at', null)

    // Privacy filter
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      query = query.eq('is_private', false)
    } else {
      // In a multi-user scenario, we'd also want to ensure they only see their own private notes.
      // But for this single-user blog style, owner sees everything.
      // If we want a strict mode: query = query.or(`is_private.eq.false,user_id.eq.${user.id}`)
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

    // Pagination
    if (params?.page && params?.pageSize) {
      const from = (params.page - 1) * params.pageSize
      const to = from + params.pageSize - 1
      query = query.range(from, to)
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
      is_private: data.is_private || false,
    }
    const { data: created, error } = await supabase.from('notes').insert(payload).select().single()
    if (error) throw error
    return { ...created, tags: normalizeTags(created.tags) }
  },

  get: async (id: number): Promise<Note> => {
    let query = supabase.from('notes').select('*').eq('id', id).is('deleted_at', null)
    
    // Privacy protection: Ensure guests can't see private notes even if they have the ID
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      query = query.eq('is_private', false)
    }

    const { data, error } = await query.single()
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
      is_private: data.is_private !== undefined ? data.is_private : undefined,
      updated_at: new Date().toISOString(),
    }
    const { data: updated, error } = await supabase.from('notes').update(payload).eq('id', id).select().single()
    if (error) throw error
    return { ...updated, tags: normalizeTags(updated.tags) }
  },

  delete: async (id: number) => {
    // 逻辑删除
    const { error } = await supabase.from('notes').update({ deleted_at: new Date().toISOString() }).eq('id', id)
    if (error) throw error
    return true
  },

  batchDelete: async (ids: number[]) => {
    // 逻辑批量删除
    const { error } = await supabase.from('notes').update({ deleted_at: new Date().toISOString() }).in('id', ids)
    if (error) throw error
    return true
  },

  // --- 回收站专有接口 ---
  listTrash: async (): Promise<Note[]> => {
    const { data, error } = await supabase.from('notes').select('*').not('deleted_at', 'is', null).order('deleted_at', { ascending: false })
    if (error) throw error
    return (data || []).map((n: any) => ({ ...n, tags: normalizeTags(n.tags) }))
  },

  restore: async (id: number) => {
    const { error } = await supabase.from('notes').update({ deleted_at: null }).eq('id', id)
    if (error) throw error
    return true
  },

  permanentlyDelete: async (id: number) => {
    // 1. 获取内容以便提取图片
    const { data: note } = await supabase.from('notes').select('content_md').eq('id', id).single()
    
    // 2. 执行数据库物理删除
    const { error } = await supabase.from('notes').delete().eq('id', id)
    if (error) throw error
    
    // 3. 异步清理云端图片
    if (note?.content_md) {
      const paths = extractStoragePaths(note.content_md)
      deleteStorageFiles(paths)
    }
    return true
  },

  batchPermanentlyDelete: async (ids: number[]) => {
    const { data: notes } = await supabase.from('notes').select('content_md').in('id', ids)
    const { error } = await supabase.from('notes').delete().in('id', ids)
    if (error) throw error
    if (notes) {
      const allPaths = notes.flatMap(n => extractStoragePaths(n.content_md || ''))
      deleteStorageFiles(allPaths)
    }
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

  tags: async (): Promise<Tag[]> => {
    // Check auth for privacy filtering
    const { data: { user } } = await supabase.auth.getUser()
    const isOwner = !!user

    // Optimized: Attempt to use RPC first
    try {
      const { data, error } = await supabase.rpc('get_tag_cloud', { 
        table_name: 'notes',
        public_only: !isOwner // Assuming RPC might support this, or it will be filtered at DB level by RLS
      })
      if (!error && data) {
        return data.map((d: any, index: number) => ({ id: index + 1, name: d.tag_name }))
      }
    } catch (e) {
      console.warn('RPC get_tag_cloud failed, falling back to legacy fetch', e)
    }

    let query = supabase.from('notes').select('tags, is_private')
    if (!isOwner) {
      query = query.eq('is_private', false)
    }

    const { data, error } = await query
    if (error) throw error
    const tagMap = new Map<string, Tag>()
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
      query = query.or(`title.ilike.${kw},excerpt.ilike.${kw},content_html.ilike.${kw}`)
    }

    query = query.is('deleted_at', null)

    // Privacy filter
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      query = query.eq('is_private', false)
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

    // Pagination
    if (params?.page && params?.pageSize) {
      const from = (params.page - 1) * params.pageSize
      const to = from + params.pageSize - 1
      query = query.range(from, to)
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
      is_private: data.is_private || false,
    }
    const { data: created, error } = await supabase.from('journals').insert(payload).select().single()
    if (error) throw error
    return { ...created, tags: normalizeTags(created.tags) }
  },

  get: async (id: number): Promise<Journal> => {
    let query = supabase.from('journals').select('*').eq('id', id).is('deleted_at', null)
    
    // Privacy protection
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      query = query.eq('is_private', false)
    }

    const { data, error } = await query.single()
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
      is_private: data.is_private !== undefined ? data.is_private : undefined,
      updated_at: new Date().toISOString(),
    }
    const { data: updated, error } = await supabase.from('journals').update(payload).eq('id', id).select().single()
    if (error) throw error
    return { ...updated, tags: normalizeTags(updated.tags) }
  },

  delete: async (id: number) => {
    const { error } = await supabase.from('journals').update({ deleted_at: new Date().toISOString() }).eq('id', id)
    if (error) throw error
    return true
  },

  batchDelete: async (ids: number[]) => {
    const { error } = await supabase.from('journals').update({ deleted_at: new Date().toISOString() }).in('id', ids)
    if (error) throw error
    return true
  },

  listTrash: async (): Promise<Journal[]> => {
    const { data, error } = await supabase.from('journals').select('*').not('deleted_at', 'is', null).order('deleted_at', { ascending: false })
    if (error) throw error
    return (data || []).map((j: any) => ({ ...j, tags: normalizeTags(j.tags) }))
  },

  restore: async (id: number) => {
    const { error } = await supabase.from('journals').update({ deleted_at: null }).eq('id', id)
    if (error) throw error
    return true
  },

  permanentlyDelete: async (id: number) => {
    const { data: journal } = await supabase.from('journals').select('content_html').eq('id', id).single()
    const { error } = await supabase.from('journals').delete().eq('id', id)
    if (error) throw error
    if (journal?.content_html) {
      const paths = extractStoragePaths(journal.content_html)
      deleteStorageFiles(paths)
    }
    return true
  },

  batchPermanentlyDelete: async (ids: number[]) => {
    const { data: journals } = await supabase.from('journals').select('content_html').in('id', ids)
    const { error } = await supabase.from('journals').delete().in('id', ids)
    if (error) throw error
    if (journals) {
      const allPaths = journals.flatMap(j => extractStoragePaths(j.content_html || ''))
      deleteStorageFiles(allPaths)
    }
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
    const { data: { user } } = await supabase.auth.getUser()
    const isOwner = !!user

    let query = supabase.from('journals').select('tags, is_private')
    if (!isOwner) {
      query = query.eq('is_private', false)
    }

    const { data, error } = await query
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

    // Privacy filter
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      query = query.eq('is_private', false)
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

    // Pagination
    if (params?.page && params?.pageSize) {
      const from = (params.page - 1) * params.pageSize
      const to = from + params.pageSize - 1
      query = query.range(from, to)
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
      is_private: data.is_private || false,
    }
    const { data: created, error } = await supabase.from('hobbies').insert(payload).select().single()
    if (error) throw error
    return { ...created, tags: normalizeTags(created.tags) }
  },

  get: async (id: number): Promise<Hobby> => {
    let query = supabase.from('hobbies').select('*').eq('id', id)
    
    // Privacy protection
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      query = query.eq('is_private', false)
    }

    const { data, error } = await query.single()
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
      is_private: data.is_private !== undefined ? data.is_private : undefined,
      updated_at: new Date().toISOString(),
    }
    const { data: updated, error } = await supabase.from('hobbies').update(payload).eq('id', id).select().single()
    if (error) throw error
    return { ...updated, tags: normalizeTags(updated.tags) }
  },

  delete: async (id: number) => {
    const { data: hobby } = await supabase.from('hobbies').select('cover_url').eq('id', id).single()
    
    const { error } = await supabase.from('hobbies').delete().eq('id', id)
    if (error) throw error
    
    if (hobby?.cover_url) {
      deleteFileByUrl(hobby.cover_url)
    }
    return true
  },

  batchDelete: async (ids: number[]) => {
    const { data: hobbies } = await supabase.from('hobbies').select('cover_url').in('id', ids)
    
    const { error } = await supabase.from('hobbies').delete().in('id', ids)
    if (error) throw error
    
    if (hobbies) {
      const urls = hobbies.map(h => h.cover_url).filter(Boolean)
      urls.forEach(url => deleteFileByUrl(url))
    }
    return true
  },

  batchMove: async (ids: number[], folderId: number | null) => {
    const { error } = await supabase.from('hobbies').update({ folder_id: folderId }).in('id', ids)
    if (error) throw error
    return true
  },

  tags: async (): Promise<Tag[]> => {
    const { data: { user } } = await supabase.auth.getUser()
    const isOwner = !!user

    try {
      const { data, error } = await supabase.rpc('get_tag_cloud', { 
        table_name: 'hobbies',
        public_only: !isOwner
      })
      if (!error && data) {
        return data.map((d: any, index: number) => ({ id: index + 1, name: d.tag_name }))
      }
    } catch (e) {
      console.warn('RPC get_tag_cloud failed, falling back to legacy fetch', e)
    }

    let query = supabase.from('hobbies').select('tags, is_private')
    if (!isOwner) {
      query = query.eq('is_private', false)
    }

    const { data, error } = await query
    if (error) throw error
    const tagMap = new Map<string, Tag>()
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


// ... (other helper functions)

export const supabaseDashboardApi = {
  get: async (): Promise<DashboardData> => {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthStartStr = monthStart.toISOString()

    // 1. 核心统计：利用 RPC 一次性获取所有维度数据（由于是单用户，is_owner 传 true 以包含私有项计数）
    const { data: { user } } = await supabase.auth.getUser()
    const isOwner = !!user

    let stats: any = null
    try {
      const { data, error } = await supabase.rpc('get_combined_stats', { 
        start_date: monthStartStr,
        is_owner: isOwner
      })
      if (!error && data) {
        stats = data
      } else {
        console.warn('RPC统计失败，采用局部兜底策略', error)
      }
    } catch (e) {
      console.error('统计计算异常', e)
    }

    // 2. 获取最新动态（依然保留实时性，但限制数量）
    const fetchPromises = [
      supabase.from('notes').select('*').order('created_at', { ascending: false }).limit(5),
      supabase.from('journals').select('*').order('created_at', { ascending: false }).limit(5),
      supabase.from('hobbies').select('*').order('updated_at', { ascending: false }).limit(5),
    ]

    if (!isOwner) {
      fetchPromises[0] = fetchPromises[0].eq('is_private', false)
      fetchPromises[1] = fetchPromises[1].eq('is_private', false)
      fetchPromises[2] = fetchPromises[2].eq('is_private', false)
    }

    const results = await Promise.allSettled(fetchPromises)
    const [notesRes, journalsRes, hobbiesRes] = results as any[]

    return {
      stats: stats || {
        notes_count: 0, journals_count: 0, hobbies_count: 0,
        completed_todos_today: 0, completed_todos_week: 0, completed_todos_month: 0,
        month_updates: 0
      },
      latest_notes: (notesRes.value?.data || []).map((n: any) => ({ ...n, tags: normalizeTags(n.tags) })),
      latest_journals: (journalsRes.value?.data || []),
      latest_hobbies: (hobbiesRes.value?.data || []),
    }
  },

  activities: async (): Promise<ActivityMap> => {
    const { data: { user } } = await supabase.auth.getUser()
    const isOwner = !!user

    // 1. 高性能聚合：利用 RPC 在服务端完成跨表日期统计
    try {
      const { data, error } = await supabase.rpc('get_daily_activities', { 
        is_owner: isOwner 
      })
      if (!error && data) {
        const activityMap: ActivityMap = {}
        data.forEach((row: any) => {
          activityMap[row.activity_date] = {
            notes: Number(row.note_count),
            journals: Number(row.journal_count),
            hobbies: Number(row.hobby_count),
            todos: Number(row.todo_count),
            checkins: 0, 
            schedules: Number(row.schedule_count),
            total: Number(row.note_count) + Number(row.journal_count) + Number(row.hobby_count) + Number(row.todo_count) + Number(row.schedule_count),
            notes_list: row.note_titles || [],
            journals_list: row.journal_titles || [],
            hobbies_list: row.hobby_titles || [],
            todos_list: row.todo_titles || [],
            schedules_list: row.schedule_titles || []
          }
        })

        // 注入连续打卡数据（由于 checkins 表只存当前状态，仍需前端配合 heatmap 组件逻辑显示）
        const { data: checkin } = await supabase.from('checkins').select('*').maybeSingle()
        if (checkin && checkin.last_date && checkin.streak > 0) {
          const last = dayjs(checkin.last_date)
          for (let i = 0; i < checkin.streak; i++) {
            const d = last.subtract(i, 'day').format('YYYY-MM-DD')
            if (!activityMap[d]) {
              activityMap[d] = { notes: 0, journals: 0, todos: 0, hobbies: 0, checkins: 0, schedules: 0, total: 0 }
            }
            activityMap[d].checkins++
            activityMap[d].total++
          }
        }
        return activityMap
      } else {
        console.warn('RPC热力图数据加载失败', error)
        return {}
      }
    } catch (e) {
      console.error('热力图逻辑异常', e)
      return {}
    }
  }
}

export const supabaseTodosApi = {
  list: async (): Promise<Todo[]> => {
    const { data, error } = await supabase.from('todos').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return data || []
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
      status: 'pending',
      is_private: payloadUpdates?.is_private || false
    }
    
    const { data, error } = await supabase.from('todos').insert(payload).select().single()
    if (error) throw error
    return data
  },
  updateStatus: async (id: string, status: Todo['status']): Promise<Todo> => {
    const isCompleted = status === 'completed'
    const payload = {
      status,
      completed: isCompleted,
      completed_at: isCompleted ? new Date().toISOString() : null,
      updated_at: new Date().toISOString()
    }
    const { data, error } = await supabase.from('todos').update(payload).eq('id', id).select().single()
    if (error) throw error
    return data
  },
  update: async (id: string, updates: any) => {
    const payload = {
      ...updates,
      updated_at: new Date().toISOString()
    }
    const { data, error } = await supabase.from('todos').update(payload).eq('id', id).select().single()
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
    const { data, error } = await supabase.from('checkins').select('*').maybeSingle()
    if (error && error.code !== 'PGRST116') throw error // Ignore "not found"
    return data
  },
  upsert: async (update: any) => {
    // 1. Update main checkin state
    const { data, error } = await supabase.from('checkins').upsert({
      user_id: update.user_id,
      last_date: update.last_date,
      streak: update.streak,
      total_count: update.total_count,
      last_record: update.last_record
    }, { onConflict: 'user_id' }).select().single()
    if (error) throw error

    // 2. Log history (Upsert by date to allow updates same-day)
    if (update.last_date) {
      const { error: logError } = await supabase.from('checkin_logs').upsert({
        user_id: update.user_id,
        checkin_date: update.last_date,
        message: update.last_record
      }, { onConflict: 'user_id,checkin_date' })
      if (logError) console.error('Failed to log checkin history:', logError)
    }

    return data
  },
  getHistory: async () => {
    const { data, error } = await supabase
      .from('checkin_logs')
      .select('*')
      .order('checkin_date', { ascending: false })
      .limit(100)
    if (error) throw error
    return data || []
  }
}

export const supabaseAnnouncementsApi = {
  list: async () => {
    const { data, error } = await supabase.from('announcements').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  },
  create: async (text: string, type: Announcement['type'] = 'info'): Promise<Announcement> => {
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

export const uploadImageToSupabase = async (file: File, isPrivate: boolean = false, bucket: string = 'images') => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('只有登录用户可以上传图片')

  try {
    // 1. 智能压缩：平衡画质与带宽
    const optimizedBlob = await compressImage(file)
    const uploadFile = optimizedBlob instanceof Blob 
      ? new File([optimizedBlob], file.name, { type: optimizedBlob.type }) 
      : optimizedBlob

    // 2. 准备上传
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
    const folder = isPrivate ? 'private' : 'public'
    const filePath = `${folder}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, uploadFile)

    if (uploadError) throw uploadError

    // 3. 获取访问地址
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)

    return { url: publicUrl, original_name: file.name }
  } catch (error: any) {
    console.warn('云端上传失败，正在降级为数据库存储 (Base64):', error.message || error)
    
    // 4. 降级方案：转化为 Base64 直接存入数据库字段
    // 这保证了即使存储桶满了，用户依然可以正常保存笔记
    const base64 = await fileToBase64(file)
    return { url: base64, original_name: file.name, is_fallback: true }
  }
}

export const uploadImageLocally = uploadImageToSupabase
export const supabaseFoldersApi = {
  list: async (type: 'note' | 'journal' | 'hobby'): Promise<Folder[]> => {
    try {
      const { data, error } = await supabase
        .from('folders')
        .select('*')
        .eq('type', type)
        .order('created_at', { ascending: true })
      
      if (error) throw error
      return data || []
    } catch (err: any) {
      console.error('List folders error:', err)
      throw new Error(err.message || '获取文件夹列表失败')
    }
  },

  create: async (name: string, type: 'note' | 'journal' | 'hobby'): Promise<Folder> => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('请先登录后再创建文件夹')
      
      const { data, error } = await supabase
        .from('folders')
        .insert({ name, type, user_id: user.id })
        .select()
        .single()
      
      if (error) throw error
      if (!data) throw new Error('创建失败：未返回数据')
      return data
    } catch (err: any) {
      console.error('Create folder error:', err)
      throw new Error(err.message || '创建文件夹失败')
    }
  },

  update: async (id: number, name: string): Promise<Folder> => {
    try {
      const { data, error } = await supabase
        .from('folders')
        .update({ name })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      if (!data) throw new Error('更新失败：找不到该文件夹')
      return data
    } catch (err: any) {
      console.error('Update folder error:', err)
      throw new Error(err.message || '更新文件夹失败')
    }
  },

  delete: async (id: number) => {
    try {
      // 1. Data Integrity: Set folder_id to null for all orphaned items
      await Promise.all([
        supabase.from('notes').update({ folder_id: null }).eq('folder_id', id),
        supabase.from('journals').update({ folder_id: null }).eq('folder_id', id),
        supabase.from('hobbies').update({ folder_id: null }).eq('folder_id', id),
      ])

      // 2. Delete the folder
      const { error } = await supabase
        .from('folders')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return true
    } catch (err: any) {
      console.error('Delete folder error:', err)
      throw new Error(err.message || '删除文件夹失败')
    }
  }
}
