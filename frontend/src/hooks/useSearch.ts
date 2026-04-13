import { ref, watch } from 'vue'
import { supabaseNotesApi, supabaseJournalsApi, supabaseHobbiesApi } from '@/api/supabaseData'

export interface SearchResult {
  id: string | number
  title: string
  type: 'note' | 'journal' | 'hobby'
  url: string
  date?: string
}

export function useSearch() {
  const query = ref('')
  const results = ref<SearchResult[]>([])
  const searching = ref(false)
  let timer: ReturnType<typeof setTimeout> | null = null

  const performSearch = async (val: string) => {
    if (!val.trim()) {
      results.value = []
      return
    }

    searching.value = true
    try {
      const [notes, journals, hobbies] = await Promise.all([
        supabaseNotesApi.list({ keyword: val }),
        supabaseJournalsApi.list({ keyword: val }),
        supabaseHobbiesApi.list() // Hobbies list doesn't have a keyword param, we filter locally
      ])

      const mappedNotes: SearchResult[] = notes.map(n => ({
        id: n.id,
        title: n.title,
        type: 'note',
        url: `/notes/${n.id}`,
        date: n.created_at
      }))

      const mappedJournals: SearchResult[] = journals.map(j => ({
        id: j.id,
        title: j.title,
        type: 'journal',
        url: `/journals/${j.id}`,
        date: j.created_at
      }))

      const mappedHobbies: SearchResult[] = hobbies
        .filter(h => h.title.toLowerCase().includes(val.toLowerCase()))
        .map(h => ({
          id: h.id,
          title: h.title,
          type: 'hobby',
          url: '/hobbies', // Hobby doesn't have a detail page yet, just the list
          date: h.updated_at
        }))

      results.value = [...mappedNotes, ...mappedJournals, ...mappedHobbies]
        .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
        .slice(0, 10) // Limit to top 10

    } catch (e) {
      console.error('Search failed:', e)
    } finally {
      searching.value = false
    }
  }

  watch(query, (val) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => performSearch(val), 300)
  })

  return {
    query,
    results,
    searching
  }
}
