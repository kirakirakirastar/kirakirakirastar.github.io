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
import LoginPage from '@/pages/LoginPage.vue'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      { path: '', component: DashboardPage },
      { path: 'login', component: LoginPage },
      { path: 'notes', component: NotesPage },
      { path: 'notes/new', component: NoteEditorPage, meta: { requiresAuth: true } },
      { path: 'notes/:id', component: NoteDetailPage },
      { path: 'notes/:id/edit', component: NoteEditorPage, meta: { requiresAuth: true } },
      { path: 'journals', component: JournalsPage },
      { path: 'journals/new', component: JournalEditorPage, meta: { requiresAuth: true } },
      { path: 'journals/:id', component: JournalDetailPage },
      { path: 'journals/:id/edit', component: JournalEditorPage, meta: { requiresAuth: true } },
      { path: 'hobbies', component: HobbiesPage },
      { path: 'hobbies/new', component: HobbyEditorPage, meta: { requiresAuth: true } },
      { path: 'hobbies/:id/edit', component: HobbyEditorPage, meta: { requiresAuth: true } },
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.beforeEach(async (to, from, next) => {
  if (to.meta.requiresAuth) {
    const authStore = useAuthStore()
    if (!authStore.initialized) {
      await authStore.initAuth()
    }
    if (!authStore.user) {
      next('/login')
      return
    }
  }
  next()
})

export default router
