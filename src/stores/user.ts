import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from 'firebase/auth'
import type { UserProfileRead } from '@/types/user'
import {
  getCurrentUserProfile,
  createUserProfileFromAuth,
  updateUserProfile,
} from '@/utils/userProfile'

export const useUserStore = defineStore('user', () => {
  // State
  const currentUser = ref<User | null>(null)
  const userProfile = ref<UserProfileRead | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => currentUser.value !== null)
  const displayName = computed(() => userProfile.value?.displayName ?? '')
  const email = computed(() => userProfile.value?.email ?? currentUser.value?.email ?? '')
  const phone = computed(() => userProfile.value?.phone ?? '')

  // Actions
  async function setUser(user: User | null) {
    currentUser.value = user

    if (user) {
      await loadUserProfile(user.uid)
    } else {
      userProfile.value = null
    }
  }

  async function loadUserProfile(uid: string) {
    try {
      isLoading.value = true
      error.value = null

      let profile = await getCurrentUserProfile(uid)

      // If profile doesn't exist and we have a current user, create it
      if (!profile && currentUser.value) {
        profile = await createUserProfileFromAuth(currentUser.value)
      }

      userProfile.value = profile
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load user profile'
      console.error('Error loading user profile:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function updateProfile(updates: { displayName?: string; phone?: string }) {
    if (!currentUser.value) {
      throw new Error('No user is currently authenticated')
    }

    try {
      isLoading.value = true
      error.value = null

      await updateUserProfile(currentUser.value.uid, updates)

      // Reload profile to get updated data
      await loadUserProfile(currentUser.value.uid)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update profile'
      console.error('Error updating profile:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    // State
    currentUser,
    userProfile,
    isLoading,
    error,
    // Getters
    isAuthenticated,
    displayName,
    email,
    phone,
    // Actions
    setUser,
    loadUserProfile,
    updateProfile,
    clearError,
  }
})
