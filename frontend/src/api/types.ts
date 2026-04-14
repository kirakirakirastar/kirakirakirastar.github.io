export interface Tag {
  id: number
  name: string
}

export interface Folder {
  id: number
  name: string
  type: 'note' | 'journal' | 'hobby'
  user_id: string
  created_at: string
}

export interface Note {
  id: number
  title: string
  summary: string
  content_md: string
  tags: Tag[]
  folder_id: number | null
  created_at: string
  updated_at: string
  is_private: boolean
  deleted_at?: string
}

export interface Journal {
  id: number
  title: string
  excerpt: string
  content_html: string
  content_json: string
  tags: Tag[]
  folder_id: number | null
  created_at: string
  updated_at: string
  is_private: boolean
  deleted_at?: string
}

export interface Hobby {
  id: number
  title: string
  type: 'anime' | 'game' | 'book' | 'other'
  status: 'want' | 'in_progress' | 'completed' | 'dropped'
  rating: number | null
  review: string
  cover_url: string
  tags: Tag[]
  folder_id: number | null
  created_at: string
  updated_at: string
  is_private: boolean
  deleted_at?: string
}

export interface Todo {
  id: string
  text: string
  completed: boolean
  status: 'pending' | 'completed' | 'failed'
  priority: 'low' | 'medium' | 'high'
  due_date: string | null
  start_date: string | null
  recurrence: string
  completed_at: string | null
  user_id: string
  created_at: string
  updated_at?: string
  is_private: boolean
}

export interface DashboardStats {
  notes_count: number
  journals_count: number
  hobbies_count: number
  completed_todos_today: number
  completed_todos_week: number
  completed_todos_month: number
  month_updates: number
}

export interface DashboardData {
  stats: DashboardStats
  latest_notes: Note[]
  latest_journals: Journal[]
  latest_hobbies: Hobby[]
}

export interface ActivityDay {
  notes: number
  journals: number
  todos: number
  hobbies: number
  checkins: number
  schedules: number
  total: number
  notes_list?: string[]
  journals_list?: string[]
  hobbies_list?: string[]
  todos_list?: string[]
  schedules_list?: string[]
}

export interface Announcement {
  id: string
  text: string
  type: 'info' | 'success' | 'warning'
  created_at: string
}

export type ActivityMap = Record<string, ActivityDay>
