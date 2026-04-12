<template>
  <div class="min-h-screen flex flex-col font-sans transition-colors duration-500 relative overflow-hidden text-slate-900 dark:text-slate-100" :class="settingsStore.bgUrl ? 'bg-transparent' : 'bg-theme-bg dark:bg-theme-bg-dark'">
    
    <!-- Dynamic Custom Background -->
    <div 
      v-if="settingsStore.bgUrl"
      class="fixed inset-0 pointer-events-none -z-20"
      :style="{
        backgroundImage: `url('${settingsStore.bgUrl}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: settingsStore.bgOpacity / 100,
        filter: `blur(${settingsStore.bgBlur}px)`,
        transform: `scale(${settingsStore.bgScale / 100})`,
        transition: 'opacity 0.3s ease, filter 0.3s ease, transform 0.3s ease',
        willChange: 'opacity, filter',
      }"
    ></div>
    <!-- Theme Tint Overlay — inline style to bypass Tailwind's rgb() issue with hex CSS vars -->
    <div 
      class="fixed inset-0 pointer-events-none z-[9998]"
      :style="{ 
        backgroundColor: 'var(--color-primary)',
        opacity: settingsStore.bgTintOpacity / 100,
        willChange: 'opacity',
      }"
    ></div>
    <!-- Floating Navbar -->
    <div class="sticky top-6 z-50 px-4 sm:px-6 w-full max-w-5xl mx-auto pointer-events-none mb-10 transition-all duration-500">
      <header class="relative backdrop-blur-xl bg-white/40 dark:bg-theme-card-dark/60 border border-white/50 dark:border-white/10 shadow-2xl shadow-primary/5 dark:shadow-none rounded-[2.5rem] pointer-events-auto overflow-hidden will-change-[backdrop-filter]">
        <!-- Visual Accent: Bottom Gradient Line -->
        <div class="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-primary/40 to-transparent"></div>
        
        <div class="px-6 sm:px-10">
          <div class="flex justify-between items-center h-16 sm:h-18">
            <!-- Logo -->
            <router-link to="/" class="flex-shrink-0 flex items-center group">
              <span class="text-2xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent tracking-tighter group-hover:scale-105 transition-transform duration-300">
                Kirakirastar
              </span>
            </router-link>

          <!-- Desktop Nav -->
          <nav class="hidden md:flex items-center bg-gray-100/60 dark:bg-white/10 rounded-full px-1.5 py-1 backdrop-blur-md border border-black/5 dark:border-white/15">
            <router-link
              v-for="item in navItems"
              :key="item.path"
              :to="item.path"
              class="relative px-4 py-2 text-sm font-bold transition-all duration-300 rounded-full"
              :class="[
                $route.path === item.path || (item.path !== '/' && $route.path.startsWith(item.path))
                  ? 'bg-white dark:bg-white/15 text-primary shadow-sm'
                  : 'text-gray-500 dark:text-slate-200 hover:text-gray-900 dark:hover:text-white'
              ]"
            >
              {{ item.name }}
            </router-link>
          </nav>

          <!-- Auth Button -->
          <div class="hidden md:flex items-center space-x-4 ml-4">
            <template v-if="authStore.user">
              <span class="text-sm text-gray-500 dark:text-slate-300">{{ authStore.user.email }}</span>
              <button
                @click="onSignOut"
                class="text-sm font-medium text-gray-600 dark:text-slate-200 hover:text-red-500 dark:hover:text-red-400 transition-colors"
              >
                退出
              </button>
            </template>
            <router-link
              v-else
              to="/login"
              class="text-sm font-medium px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              登录
            </router-link>
          </div>

          <!-- Theme Toggle -->
          <div class="flex items-center">
            <button
              @click="themeStore.toggleTheme()"
              class="p-2 rounded-full text-gray-500 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            >
              <svg v-if="themeStore.theme === 'light'" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
              </svg>
              <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"/>
              </svg>
            </button>
            <button
              @click="isSettingsOpen = true"
              class="p-2 ml-1 rounded-full text-gray-500 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            </button>
          </div>

          <!-- Mobile Menu Button -->
          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path v-if="!mobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile Nav -->
      <div v-if="mobileMenuOpen" class="md:hidden border-t dark:border-gray-700">
        <div class="px-4 py-3 space-y-1">
          <router-link
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            @click="mobileMenuOpen = false"
            class="block px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            :class="$route.path === item.path || $route.path.startsWith(item.path + '/')
              ? 'bg-primary/10 text-primary dark:text-primary-light'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'"
          >
            {{ item.name }}
          </router-link>
          
          <template v-if="authStore.user">
            <div class="px-3 py-2 text-sm text-gray-500 border-t dark:border-gray-700 mt-2 pt-2">{{ authStore.user.email }}</div>
            <button
              @click="onSignOut"
              class="w-full text-left block px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              退出
            </button>
          </template>
          <router-link
            v-else
            to="/login"
            @click="mobileMenuOpen = false"
            class="block px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border-t dark:border-gray-700 mt-2 pt-2"
          >
            登录
          </router-link>
        </div>
      </div>
    </header>
  </div>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col items-center">
      <div class="w-full max-w-[1600px] 2xl:max-w-[1920px]">
        <router-view />
      </div>
    </main>

    <!-- Settings Modal -->
    <SettingsModal :isOpen="isSettingsOpen" @close="isSettingsOpen = false" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import { useAuthStore } from '@/stores/auth'
import { useSettingsStore } from '@/stores/settings'
import SettingsModal from '@/components/SettingsModal.vue'

const themeStore = useThemeStore()
const authStore = useAuthStore()
const settingsStore = useSettingsStore()
const router = useRouter()

themeStore.initTheme()
settingsStore.initSettings()

// Initial loading of auth
if (!authStore.initialized) {
  authStore.initAuth()
}

const onSignOut = async () => {
  await authStore.signOut()
  mobileMenuOpen.value = false
  router.push('/login')
}

const mobileMenuOpen = ref(false)
const isSettingsOpen = ref(false)

const navItems = [
  { name: 'Dashboard', path: '/' },
  { name: '代码笔记', path: '/notes' },
  { name: '个人日志', path: '/journals' },
  { name: '爱好追踪', path: '/hobbies' },
]
</script>
