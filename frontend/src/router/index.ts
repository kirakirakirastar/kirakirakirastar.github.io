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
const TrashPage = () => import('@/pages/TrashPage.vue')
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      { path: '', component: DashboardPage, meta: { title: '仪表盘' } },
      { path: 'login', component: LoginPage, meta: { title: '登录' } },
      { path: 'announcements', component: AnnouncementsPage, meta: { requiresAuth: true, title: '站点公告' } },
      { path: 'notes', component: NotesPage, meta: { title: '学习笔记' } },
      { path: 'notes/new', component: NoteEditorPage, meta: { requiresAuth: true, title: '新建笔记' } },
      { path: 'notes/:id', component: NoteDetailPage, meta: { title: '笔记详情' } },
      { path: 'notes/:id/edit', component: NoteEditorPage, meta: { requiresAuth: true, title: '编辑笔记' } },
      { path: 'journals', component: JournalsPage, meta: { title: '个人日志' } },
      { path: 'journals/new', component: JournalEditorPage, meta: { requiresAuth: true, title: '新建日志' } },
      { path: 'journals/:id', component: JournalDetailPage, meta: { title: '日志详情' } },
      { path: 'journals/:id/edit', component: JournalEditorPage, meta: { requiresAuth: true, title: '编辑日志' } },
      { path: 'hobbies', component: HobbiesPage, meta: { title: '爱好追踪' } },
      { path: 'hobbies/new', component: HobbyEditorPage, meta: { requiresAuth: true, title: '新建爱好' } },
      { path: 'hobbies/:id/edit', component: HobbyEditorPage, meta: { requiresAuth: true, title: '编辑爱好' } },
      { path: 'trash', component: TrashPage, meta: { requiresAuth: true, title: '回收站' } },
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

const DEFAULT_TITLE = "Kirakirastar's Blog"

router.beforeEach(async (to, from, next) => {
  // 1. Auth check
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

  // 2. Dynamic SEO Title
  const pageTitle = to.meta.title ? `${to.meta.title} | ${DEFAULT_TITLE}` : DEFAULT_TITLE
  document.title = pageTitle

  next()
})

export default router
