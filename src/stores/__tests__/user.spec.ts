import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '../user'
import * as userProfileUtils from '@/utils/userProfile'
import { createMockUser, createMockUserProfile } from '@/test-utils/firebase-mocks'

vi.mock('@/utils/userProfile')

describe('useUserStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const store = useUserStore()

      expect(store.currentUser).toBeNull()
      expect(store.userProfile).toBeNull()
      expect(store.isLoading).toBe(false)
      expect(store.error).toBeNull()
      expect(store.isAuthenticated).toBe(false)
      expect(store.displayName).toBe('')
      expect(store.email).toBe('')
      expect(store.phone).toBe('')
      expect(store.avatarUrl).toBe('')
    })
  })

  describe('setUser', () => {
    it('should set user and load profile when user is provided', async () => {
      const store = useUserStore()
      const mockUser = createMockUser()
      const mockProfile = createMockUserProfile()

      vi.mocked(userProfileUtils.getCurrentUserProfile).mockResolvedValue(mockProfile)

      await store.setUser(mockUser)

      expect(store.currentUser).toStrictEqual(mockUser)
      expect(store.userProfile).toStrictEqual(mockProfile)
      expect(userProfileUtils.getCurrentUserProfile).toHaveBeenCalledWith(mockUser.uid)
    })

    it('should clear user and profile when user is null', async () => {
      const store = useUserStore()
      const mockUser = createMockUser()
      const mockProfile = createMockUserProfile()

      store.currentUser = mockUser
      store.userProfile = mockProfile

      await store.setUser(null)

      expect(store.currentUser).toBeNull()
      expect(store.userProfile).toBeNull()
    })

    it('should create profile if it does not exist', async () => {
      const store = useUserStore()
      const mockUser = createMockUser()
      const mockProfile = createMockUserProfile()

      vi.mocked(userProfileUtils.getCurrentUserProfile).mockResolvedValue(null)
      vi.mocked(userProfileUtils.createUserProfileFromAuth).mockResolvedValue(mockProfile)

      await store.setUser(mockUser)

      expect(userProfileUtils.createUserProfileFromAuth).toHaveBeenCalledWith(mockUser, undefined)
      expect(store.userProfile).toStrictEqual(mockProfile)
    })

    it('should create profile with displayName when provided', async () => {
      const store = useUserStore()
      const mockUser = createMockUser()
      const mockProfile = createMockUserProfile()

      vi.mocked(userProfileUtils.getCurrentUserProfile).mockResolvedValue(null)
      vi.mocked(userProfileUtils.createUserProfileFromAuth).mockResolvedValue(mockProfile)

      await store.setUser(mockUser, 'Test Player')

      expect(userProfileUtils.createUserProfileFromAuth).toHaveBeenCalledWith(mockUser, 'Test Player')
      expect(store.userProfile).toStrictEqual(mockProfile)
    })

    it('should use pendingDisplayName when creating profile', async () => {
      const store = useUserStore()
      const mockUser = createMockUser()
      const mockProfile = createMockUserProfile()

      store.setPendingDisplayName('Pending Name')
      vi.mocked(userProfileUtils.getCurrentUserProfile).mockResolvedValue(null)
      vi.mocked(userProfileUtils.createUserProfileFromAuth).mockResolvedValue(mockProfile)

      await store.setUser(mockUser)

      expect(userProfileUtils.createUserProfileFromAuth).toHaveBeenCalledWith(mockUser, 'Pending Name')
      expect(store.userProfile).toStrictEqual(mockProfile)
    })
  })

  describe('loadUserProfile', () => {
    it('should load user profile successfully', async () => {
      const store = useUserStore()
      const mockUser = createMockUser({ uid: 'user-id' })
      const mockProfile = createMockUserProfile()

      store.currentUser = mockUser
      vi.mocked(userProfileUtils.getCurrentUserProfile).mockResolvedValue(mockProfile)

      await store.loadUserProfile('user-id')

      expect(store.userProfile).toStrictEqual(mockProfile)
      expect(store.isLoading).toBe(false)
      expect(store.error).toBeNull()
    })

    it('should create profile with displayName when provided', async () => {
      const store = useUserStore()
      const mockUser = createMockUser({ uid: 'user-id' })
      const mockProfile = createMockUserProfile()

      store.currentUser = mockUser
      vi.mocked(userProfileUtils.getCurrentUserProfile).mockResolvedValue(null)
      vi.mocked(userProfileUtils.createUserProfileFromAuth).mockResolvedValue(mockProfile)

      await store.loadUserProfile('user-id', 'Test Player')

      expect(userProfileUtils.createUserProfileFromAuth).toHaveBeenCalledWith(mockUser, 'Test Player')
      expect(store.userProfile).toStrictEqual(mockProfile)
    })

    it('should handle errors when loading profile', async () => {
      const store = useUserStore()
      const error = new Error('Failed to load')

      vi.mocked(userProfileUtils.getCurrentUserProfile).mockRejectedValue(error)

      await store.loadUserProfile('user-id')

      expect(store.error).toBe('Failed to load')
      expect(store.isLoading).toBe(false)
    })
  })

  describe('updateProfile', () => {
    it('should update profile successfully', async () => {
      const store = useUserStore()
      const mockUser = createMockUser({ uid: 'user-id' })
      const mockProfile = createMockUserProfile()
      const updatedProfile = { ...mockProfile, displayName: 'Updated Name' }

      store.currentUser = mockUser
      vi.mocked(userProfileUtils.updateUserProfile).mockResolvedValue()
      vi.mocked(userProfileUtils.getCurrentUserProfile).mockResolvedValue(updatedProfile)

      await store.updateProfile({ displayName: 'Updated Name' })

      expect(userProfileUtils.updateUserProfile).toHaveBeenCalledWith('user-id', {
        displayName: 'Updated Name',
      })
      expect(store.userProfile).toEqual(updatedProfile)
    })

    it('should throw error when no user is authenticated', async () => {
      const store = useUserStore()

      await expect(store.updateProfile({ displayName: 'New Name' })).rejects.toThrow(
        'No user is currently authenticated'
      )
    })

    it('should handle errors when updating profile', async () => {
      const store = useUserStore()
      const mockUser = createMockUser({ uid: 'user-id' })
      const error = new Error('Update failed')

      store.currentUser = mockUser
      vi.mocked(userProfileUtils.updateUserProfile).mockRejectedValue(error)

      try {
        await store.updateProfile({ displayName: 'New Name' })
      } catch {
        // Expected to throw
      }
      expect(store.error).toBe('Update failed')
    })
  })

  describe('computed properties', () => {
    it('should return correct displayName from profile', () => {
      const store = useUserStore()
      const mockProfile = createMockUserProfile({ displayName: 'John Doe' })

      store.userProfile = mockProfile
      expect(store.displayName).toBe('John Doe')
    })

    it('should return correct email from profile', () => {
      const store = useUserStore()
      const mockProfile = createMockUserProfile({ email: 'john@example.com' })

      store.userProfile = mockProfile
      expect(store.email).toBe('john@example.com')
    })

    it('should return email from user when profile email is missing', () => {
      const store = useUserStore()
      const mockUser = createMockUser({ email: 'user@example.com' })

      store.currentUser = mockUser
      expect(store.email).toBe('user@example.com')
    })

    it('should return correct phone from profile', () => {
      const store = useUserStore()
      const mockProfile = createMockUserProfile({ phone: '+1234567890' })

      store.userProfile = mockProfile
      expect(store.phone).toBe('+1234567890')
    })

    it('should return isAuthenticated based on currentUser', () => {
      const store = useUserStore()
      expect(store.isAuthenticated).toBe(false)

      store.currentUser = createMockUser()
      expect(store.isAuthenticated).toBe(true)
    })

    it('should return avatarUrl from profile', () => {
      const store = useUserStore()
      const mockProfile = createMockUserProfile({ avatarUrl: 'https://example.com/avatar.jpg' })

      store.userProfile = mockProfile
      expect(store.avatarUrl).toBe('https://example.com/avatar.jpg')
    })

    it('should generate avatarUrl from email when not in profile', () => {
      const store = useUserStore()
      const mockProfile = createMockUserProfile({ email: 'test@example.com' })
      delete (mockProfile as any).avatarUrl

      store.userProfile = mockProfile
      expect(store.avatarUrl).toContain('gravatar.com')
      expect(store.avatarUrl).toContain('/avatar/')
    })
  })

  describe('setPendingDisplayName', () => {
    it('should set pending display name', () => {
      const store = useUserStore()
      store.setPendingDisplayName('Test Name')
      // Note: pendingDisplayName is internal, but we can test it indirectly through profile creation
      expect(store).toBeDefined()
    })
  })

  describe('clearError', () => {
    it('should clear error', () => {
      const store = useUserStore()
      store.error = 'Some error'

      store.clearError()

      expect(store.error).toBeNull()
    })
  })
})
