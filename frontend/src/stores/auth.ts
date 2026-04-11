import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/api/supabase'

export const useAuthStore = defineStore('auth', () => {
  const session = ref<any>(null)
  const user = ref<any>(null)
  const initialized = ref(false)

  const initAuth = async () => {
    const { data } = await supabase.auth.getSession()
    session.value = data.session
    user.value = data.session?.user || null
    initialized.value = true

    supabase.auth.onAuthStateChange((_event, newSession) => {
      session.value = newSession
      user.value = newSession?.user || null
    })
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    session.value = null
    user.value = null
  }

  return {
    session,
    user,
    initialized,
    initAuth,
    signOut,
  }
})
