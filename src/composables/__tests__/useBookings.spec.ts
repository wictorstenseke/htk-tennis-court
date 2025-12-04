import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useBookings } from '../useBookings'
import { useBookingsStore } from '@/stores/bookings'
import { useUserStore } from '@/stores/user'
import { createMockUser, createMockBooking } from '@/test-utils/firebase-mocks'

describe('useBookings', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should initialize with stores', () => {
    const { bookingsStore, userStore } = useBookings()

    expect(bookingsStore).toBeDefined()
    expect(userStore).toBeDefined()
  })

  it('should return isAuthenticated computed', () => {
    const { isAuthenticated } = useBookings()
    expect(isAuthenticated.value).toBe(false)

    const userStore = useUserStore()
    userStore.currentUser = createMockUser()
    expect(isAuthenticated.value).toBe(true)
  })

  it('should return currentUserId computed', () => {
    const { currentUserId } = useBookings()
    expect(currentUserId.value).toBeNull()

    const userStore = useUserStore()
    const mockUser = createMockUser({ uid: 'test-uid' })
    userStore.currentUser = mockUser
    expect(currentUserId.value).toBe('test-uid')
  })

  describe('canEditBooking', () => {
    it('should return false when user is not authenticated', () => {
      const { canEditBooking } = useBookings()
      const booking = createMockBooking({ userId: 'user-1' })

      expect(canEditBooking(booking)).toBe(false)
    })

    it('should return true when user is the booking creator', () => {
      const { canEditBooking } = useBookings()
      const userStore = useUserStore()
      userStore.currentUser = createMockUser({ uid: 'user-1' })

      const booking = createMockBooking({ userId: 'user-1' })
      expect(canEditBooking(booking)).toBe(true)
    })

    it('should return true when user is the opponent', () => {
      const { canEditBooking } = useBookings()
      const userStore = useUserStore()
      userStore.currentUser = createMockUser({ uid: 'opponent-1' })

      const booking = createMockBooking({
        userId: 'user-1',
        opponentUserId: 'opponent-1',
      })
      expect(canEditBooking(booking)).toBe(true)
    })

    it('should return false when user is neither creator nor opponent', () => {
      const { canEditBooking } = useBookings()
      const userStore = useUserStore()
      userStore.currentUser = createMockUser({ uid: 'other-user' })

      const booking = createMockBooking({
        userId: 'user-1',
        opponentUserId: 'opponent-1',
      })
      expect(canEditBooking(booking)).toBe(false)
    })
  })
})

