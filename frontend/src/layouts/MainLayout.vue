<template>
  <div class="min-h-screen flex flex-col font-sans transition-colors duration-500 bg-slate-50 dark:bg-slate-900">
    <!-- Floating Navbar -->
    <div class="sticky top-6 z-50 px-4 sm:px-6 w-full max-w-5xl mx-auto pointer-events-none mb-8 transition-all duration-300">
      <header class="backdrop-blur-2xl bg-white/70 dark:bg-slate-800/80 border border-white/50 dark:border-white/10 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/80 rounded-3xl pointer-events-auto">
        <div class="px-5 sm:px-8">
          <div class="flex justify-between items-center h-16 sm:h-18">
            <!-- Logo -->
            <router-link to="/" class="flex-shrink-0 flex items-center">
              <span class="text-xl font-extrabold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent tracking-tight hover:opacity-80 transition-opacity">
                Kirakirastar's Blog
              </span>
            </router-link>

          <!-- Desktop Nav -->
          <nav class="hidden md:flex space-x-1">
            <router-link
              v-for="item in navItems"
              :key="item.path"
              :to="item.path"
              class="inline-flex items-center px-3 py-2 border-b-2 text-sm font-medium transition-all duration-300"
              :class="[
                $route.path === item.path || (item.path !== '/' && $route.path.startsWith(item.path))
                  ? 'border-indigo-500 text-gray-900 dark:text-white'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              ]"
            >
              {{ item.name }}
            </router-link>
          </nav>

          <!-- Auth Button -->
          <div class="hidden md:flex items-center space-x-4 ml-4">
            <template v-if="authStore.user">
              <span class="text-sm text-gray-500">{{ authStore.user.email }}</span>
              <button
                @click="onSignOut"
                class="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-red-500 transition-colors"
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
          <button
            @click="themeStore.toggleTheme()"
            class="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            <svg v-if="themeStore.theme === 'light'" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
            </svg>
            <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"/>
            </svg>
          </button>

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
            class="block px-3 py-2 rounded-lg text-sm font-medium"
            :class="$route.path === item.path || $route.path.startsWith(item.path + '/')
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
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
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import { useAuthStore } from '@/stores/auth'

const themeStore = useThemeStore()
const authStore = useAuthStore()
const router = useRouter()

themeStore.initTheme()
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

const navItems = [
  { name: 'Dashboard', path: '/' },
  { name: '代码笔记', path: '/notes' },
  { name: '个人日志', path: '/journals' },
  { name: '爱好追踪', path: '/hobbies' },
]
</script>
