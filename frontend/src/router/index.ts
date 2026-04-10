import { createRouter, createWebHashHistory } from 'vue-router'

import MainLayout from '@/layouts/MainLayout.vue'
import DashboardPage from '@/pages/DashboardPage.vue'
import NotesPage from '@/pages/NotesPage.vue'
import NoteDetailPage from '@/pages/NoteDetailPage.vue'
import NoteEditorPage from '@/pages/NoteEditorPage.vue'
import JournalsPage from '@/pages/JournalsPage.vue'
import JournalDetailPage from '@/pages/JournalDetailPage.vue'
import JournalEditorPage from '@/pages/JournalEditorPage.vue'
import HobbiesPage from '@/pages/HobbiesPage.vue'
import HobbyEditorPage from '@/pages/HobbyEditorPage.vue'

const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      { path: '', component: DashboardPage },
      { path: 'notes', component: NotesPage },
      { path: 'notes/new', component: NoteEditorPage },
      { path: 'notes/:id', component: NoteDetailPage },
      { path: 'notes/:id/edit', component: NoteEditorPage },
      { path: 'journals', component: JournalsPage },
      { path: 'journals/new', component: JournalEditorPage },
      { path: 'journals/:id', component: JournalDetailPage },
      { path: 'journals/:id/edit', component: JournalEditorPage },
      { path: 'hobbies', component: HobbiesPage },
      { path: 'hobbies/new', component: HobbyEditorPage },
      { path: 'hobbies/:id/edit', component: HobbyEditorPage },
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
