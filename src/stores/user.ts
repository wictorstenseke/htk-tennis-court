import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from 'firebase/auth'
import type { UserProfileRead, UserRole } from '@/types/user'
import {
  getCurrentUserProfile,
  createUserProfileFromAuth,
  updateUserProfile,
} from '@/utils/userProfile'
import { getGravatarUrl } from '@/utils/gravatarUtils'

export const useUserStore = defineStore('user', () => {
  // State
  const currentUser = ref<User | null>(null)
  const userProfile = ref<UserProfileRead | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const pendingDisplayName = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => currentUser.value !== null)
  const displayName = computed(() => userProfile.value?.displayName ?? '')
  const email = computed(() => userProfile.value?.email ?? currentUser.value?.email ?? '')
  const phone = computed(() => userProfile.value?.phone ?? '')
  const role = computed<UserRole>(() => userProfile.value?.role ?? 'user')
  const isAdmin = computed(() => {
    const userRole = role.value
    return userRole === 'admin' || userRole === 'superuser'
  })
  const isSuperuser = computed(() => role.value === 'superuser')
  const avatarUrl = computed(() => {
    if (userProfile.value?.avatarUrl) {
      return userProfile.value.avatarUrl
    }
    // Generate from email if not stored
    if (email.value) {
      return getGravatarUrl(email.value)
    }
    return ''
  })

  // Actions
  async function setUser(user: User | null, displayName?: string) {
    currentUser.value = user

    if (user) {
      await loadUserProfile(user.uid, displayName)
    } else {
      userProfile.value = null
    }
  }

  async function loadUserProfile(uid: string, displayName?: string) {
    try {
      isLoading.value = true
      error.value = null

      let profile = await getCurrentUserProfile(uid)

      // If profile doesn't exist and we have a current user, create it
      if (!profile && currentUser.value) {
        // Use provided displayName, or pendingDisplayName, or undefined
        const nameToUse = displayName || pendingDisplayName.value || undefined
        profile = await createUserProfileFromAuth(currentUser.value, nameToUse)
        // Clear pending displayName after use
        pendingDisplayName.value = null
      }

      userProfile.value = profile
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load user profile'
      console.error('Error loading user profile:', err)
    } finally {
      isLoading.value = false
    }
  }

  function setPendingDisplayName(displayName: string) {
    pendingDisplayName.value = displayName
  }

  async function updateProfile(updates: {
    displayName?: string
    phone?: string
    sidebarState?: import('@/types/user').SidebarState
  }) {
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
    role,
    isAdmin,
    isSuperuser,
    avatarUrl,
    // Actions
    setUser,
    loadUserProfile,
    updateProfile,
    clearError,
    setPendingDisplayName,
  }
})
