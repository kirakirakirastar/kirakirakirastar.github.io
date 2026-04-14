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
}

export interface Todo {
  id: string
  text: string
  status: 'pending' | 'completed' | 'failed'
  priority: 'low' | 'medium' | 'high'
  due_date: string | null
  start_date: string | null
  completed_at: string | null
  user_id: string
  created_at: string
}
