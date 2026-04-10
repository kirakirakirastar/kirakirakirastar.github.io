const STORAGE_KEY = 'myapp-local-data'

type NoteTag = {
  id: number
  name: string
}

type Note = {
  id: number
  title: string
  summary: string
  content_md: string
  tags: NoteTag[]
  created_at: string
  updated_at: string
}

type Journal = {
  id: number
  title: string
  excerpt: string
  content_html: string
  content_json: string
  created_at: string
  updated_at: string
}

type Hobby = {
  id: number
  title: string
  type: string
  status: string
  rating: number | null
  review: string
  cover_url: string
  created_at: string
  updated_at: string
}

type LocalDb = {
  notes: Note[]
  journals: Journal[]
  hobbies: Hobby[]
  nextIds: {
    note: number
    journal: number
    hobby: number
    tag: number
  }
}

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value))

const now = () => new Date().toISOString()

const createEmptyDb = (): LocalDb => ({
  notes: [],
  journals: [],
  hobbies: [],
  nextIds: {
    note: 1,
    journal: 1,
    hobby: 1,
    tag: 1,
  },
})

const getNextId = (items: Array<{ id: number }>) => items.reduce((max, item) => Math.max(max, item.id || 0), 0) + 1

const getNextTagId = (notes: Note[]) => {
  let maxId = 0
  for (const note of notes) {
    for (const tag of note.tags || []) {
      maxId = Math.max(maxId, tag.id || 0)
    }
  }
  return maxId + 1
}

const normalizeDb = (raw: any): LocalDb => {
  const db = createEmptyDb()
  db.notes = Array.isArray(raw?.notes) ? raw.notes : []
  db.journals = Array.isArray(raw?.journals) ? raw.journals : []
  db.hobbies = Array.isArray(raw?.hobbies) ? raw.hobbies : []
  db.nextIds = {
    note: Number(raw?.nextIds?.note) || getNextId(db.notes),
    journal: Number(raw?.nextIds?.journal) || getNextId(db.journals),
    hobby: Number(raw?.nextIds?.hobby) || getNextId(db.hobbies),
    tag: Number(raw?.nextIds?.tag) || getNextTagId(db.notes),
  }
  return db
}

const loadDb = (): LocalDb => {
  if (typeof localStorage === 'undefined') return createEmptyDb()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createEmptyDb()
    return normalizeDb(JSON.parse(raw))
  } catch {
    return createEmptyDb()
  }
}

const saveDb = (db: LocalDb) => {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
}

const sortByCreatedDesc = <T extends { created_at: string }>(items: T[]) => [...items].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))

const sortByUpdatedDesc = <T extends { updated_at: string }>(items: T[]) => [...items].sort((a, b) => +new Date(b.updated_at) - +new Date(a.updated_at))

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

const getNoteTags = (db: LocalDb, tagNames: string[]) => {
  const existingTags = new Map<string, NoteTag>()
  for (const note of db.notes) {
    for (const tag of note.tags || []) {
      existingTags.set(tag.name, tag)
    }
  }

  return tagNames
    .map((tagName) => tagName.trim())
    .filter(Boolean)
    .map((tagName) => {
      const existing = existingTags.get(tagName)
      if (existing) return existing
      const tag = { id: db.nextIds.tag++, name: tagName }
      existingTags.set(tagName, tag)
      return tag
    })
}

export const localNotesApi = {
  list: (params?: any) => {
    const db = loadDb()
    const notes = sortByCreatedDesc(db.notes).filter((note) => {
      const keywordMatch = includesKeyword([note.title, note.summary, note.content_md], params?.keyword)
      const tagMatch = !params?.tag || note.tags.some((tag) => tag.name === params.tag)
      const archiveMatch = matchesArchive(note.created_at, params?.year, params?.month)
      return keywordMatch && tagMatch && archiveMatch
    })
    return clone(notes)
  },

  create: (data: any) => {
    const db = loadDb()
    const timestamp = now()
    const note: Note = {
      id: db.nextIds.note++,
      title: data.title,
      summary: data.summary || '',
      content_md: data.content_md || '',
      tags: getNoteTags(db, data.tags || []),
      created_at: timestamp,
      updated_at: timestamp,
    }
    db.notes.push(note)
    saveDb(db)
    return clone(note)
  },

  get: (id: number) => {
    const db = loadDb()
    const note = db.notes.find((item) => item.id === id)
    if (!note) throw new Error('笔记不存在')
    return clone(note)
  },

  update: (id: number, data: any) => {
    const db = loadDb()
    const note = db.notes.find((item) => item.id === id)
    if (!note) throw new Error('笔记不存在')
    note.title = data.title
    note.summary = data.summary || ''
    note.content_md = data.content_md || ''
    note.tags = getNoteTags(db, data.tags || [])
    note.updated_at = now()
    saveDb(db)
    return clone(note)
  },

  delete: (id: number) => {
    const db = loadDb()
    db.notes = db.notes.filter((item) => item.id !== id)
    saveDb(db)
    return true
  },

  archives: () => buildArchives(loadDb().notes),

  tags: () => {
    const db = loadDb()
    const tagMap = new Map<string, NoteTag>()
    for (const note of db.notes) {
      for (const tag of note.tags || []) {
        if (!tagMap.has(tag.name)) tagMap.set(tag.name, tag)
      }
    }
    return [...tagMap.values()].sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'))
  },
}

export const localJournalsApi = {
  list: (params?: any) => {
    const db = loadDb()
    const journals = sortByCreatedDesc(db.journals).filter((journal) => {
      const keywordMatch = includesKeyword([journal.title, journal.excerpt, journal.content_html], params?.keyword)
      const archiveMatch = matchesArchive(journal.created_at, params?.year, params?.month)
      return keywordMatch && archiveMatch
    })
    return clone(journals)
  },

  create: (data: any) => {
    const db = loadDb()
    const timestamp = now()
    const journal: Journal = {
      id: db.nextIds.journal++,
      title: data.title,
      excerpt: data.excerpt || '',
      content_html: data.content_html || '',
      content_json: data.content_json || '{}',
      created_at: timestamp,
      updated_at: timestamp,
    }
    db.journals.push(journal)
    saveDb(db)
    return clone(journal)
  },

  get: (id: number) => {
    const db = loadDb()
    const journal = db.journals.find((item) => item.id === id)
    if (!journal) throw new Error('日志不存在')
    return clone(journal)
  },

  update: (id: number, data: any) => {
    const db = loadDb()
    const journal = db.journals.find((item) => item.id === id)
    if (!journal) throw new Error('日志不存在')
    journal.title = data.title
    journal.excerpt = data.excerpt || ''
    journal.content_html = data.content_html || ''
    journal.content_json = data.content_json || '{}'
    journal.updated_at = now()
    saveDb(db)
    return clone(journal)
  },

  delete: (id: number) => {
    const db = loadDb()
    db.journals = db.journals.filter((item) => item.id !== id)
    saveDb(db)
    return true
  },

  archives: () => buildArchives(loadDb().journals),
}

export const localHobbiesApi = {
  list: (params?: any) => {
    const db = loadDb()
    const hobbies = sortByUpdatedDesc(db.hobbies).filter((hobby) => {
      const typeMatch = !params?.type || hobby.type === params.type
      const statusMatch = !params?.status || hobby.status === params.status
      return typeMatch && statusMatch
    })
    return clone(hobbies)
  },

  create: (data: any) => {
    const db = loadDb()
    const timestamp = now()
    const hobby: Hobby = {
      id: db.nextIds.hobby++,
      title: data.title,
      type: data.type || 'anime',
      status: data.status || 'want',
      rating: typeof data.rating === 'number' ? data.rating : null,
      review: data.review || '',
      cover_url: data.cover_url || '',
      created_at: timestamp,
      updated_at: timestamp,
    }
    db.hobbies.push(hobby)
    saveDb(db)
    return clone(hobby)
  },

  get: (id: number) => {
    const db = loadDb()
    const hobby = db.hobbies.find((item) => item.id === id)
    if (!hobby) throw new Error('条目不存在')
    return clone(hobby)
  },

  update: (id: number, data: any) => {
    const db = loadDb()
    const hobby = db.hobbies.find((item) => item.id === id)
    if (!hobby) throw new Error('条目不存在')
    hobby.title = data.title
    hobby.type = data.type || 'anime'
    hobby.status = data.status || 'want'
    hobby.rating = typeof data.rating === 'number' ? data.rating : null
    hobby.review = data.review || ''
    hobby.cover_url = data.cover_url || ''
    hobby.updated_at = now()
    saveDb(db)
    return clone(hobby)
  },

  delete: (id: number) => {
    const db = loadDb()
    db.hobbies = db.hobbies.filter((item) => item.id !== id)
    saveDb(db)
    return true
  },

  stats: () => {
    const hobbies = loadDb().hobbies
    const rated = hobbies.filter((item) => typeof item.rating === 'number')
    const avgRating = rated.length
      ? rated.reduce((sum, item) => sum + Number(item.rating), 0) / rated.length
      : null

    return {
      total: hobbies.length,
      completed: hobbies.filter((item) => item.status === 'completed').length,
      in_progress: hobbies.filter((item) => item.status === 'in_progress').length,
      avg_rating: avgRating,
    }
  },
}

export const localDashboardApi = {
  get: () => {
    const db = loadDb()
    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)

    const monthUpdates = [...db.notes, ...db.journals, ...db.hobbies].filter((item) => new Date(item.updated_at) >= monthStart).length

    return {
      stats: {
        notes_count: db.notes.length,
        journals_count: db.journals.length,
        hobbies_count: db.hobbies.length,
        completed_hobbies: db.hobbies.filter((item) => item.status === 'completed').length,
        month_updates: monthUpdates,
      },
      latest_notes: sortByCreatedDesc(db.notes).slice(0, 5),
      latest_journals: sortByCreatedDesc(db.journals).slice(0, 5),
      latest_hobbies: sortByUpdatedDesc(db.hobbies).slice(0, 5),
    }
  },
}

export const uploadImageLocally = (file: File) => new Promise<{ url: string; original_name: string }>((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = () => resolve({ url: String(reader.result || ''), original_name: file.name })
  reader.onerror = () => reject(new Error('读取图片失败'))
  reader.readAsDataURL(file)
})
