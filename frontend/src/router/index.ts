import { createRouter, createWebHashHistory } from 'vue-router'

const MainLayout = () => import('@/layouts/MainLayout.vue')
const DashboardPage = () => import('@/pages/DashboardPage.vue')
const NotesPage = () => import('@/pages/NotesPage.vue')
const NoteDetailPage = () => import('@/pages/NoteDetailPage.vue')
const NoteEditorPage = () => import('@/pages/NoteEditorPage.vue')
const JournalsPage = () => import('@/pages/JournalsPage.vue')
const JournalDetailPage = () => import('@/pages/JournalDetailPage.vue')
const JournalEditorPage = () => import('@/pages/JournalEditorPage.vue')
const HobbiesPage = () => import('@/pages/HobbiesPage.vue')
const HobbyEditorPage = () => import('@/pages/HobbyEditorPage.vue')
const LoginPage = () => import('@/pages/LoginPage.vue')
const AnnouncementsPage = () => import('@/pages/AnnouncementsPage.vue')
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      { path: '', component: DashboardPage },
      { path: 'login', component: LoginPage },
      { path: 'announcements', component: AnnouncementsPage, meta: { requiresAuth: true } },
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
