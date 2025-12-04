import { onMounted, onUnmounted } from 'vue'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { auth } from '@/config/firebase'
import { useUserStore } from '@/stores/user'

/**
 * Composable to handle Firebase Auth state changes
 * Automatically creates user profile on first sign-in
 */
export function useAuth() {
  const userStore = useUserStore()
  let unsubscribe: (() => void) | null = null

  function initAuth() {
    unsubscribe = onAuthStateChanged(
      auth,
      async (user: User | null) => {
        if (user) {
          // User is signed in
          await userStore.setUser(user)
        } else {
          // User is signed out
          userStore.setUser(null)
        }
      },
      (error) => {
        console.error('Auth state change error:', error)
        userStore.setUser(null)
      },
    )
  }

  onMounted(() => {
    initAuth()
  })

  onUnmounted(() => {
    if (unsubscribe) {
      unsubscribe()
    }
  })

  return {
    userStore,
  }
}

