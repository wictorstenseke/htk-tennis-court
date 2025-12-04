import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useBookingsStore } from '../bookings'
import * as bookingUtils from '@/utils/bookingUtils'
import { createMockBooking } from '@/test-utils/firebase-mocks'

vi.mock('@/utils/bookingUtils')

describe('useBookingsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const store = useBookingsStore()

      expect(store.bookings).toEqual([])
      expect(store.currentBooking).toBeNull()
      expect(store.isLoading).toBe(false)
      expect(store.error).toBeNull()
      expect(store.activeBookings).toEqual([])
      expect(store.cancelledBookings).toEqual([])
    })
  })

  describe('computed properties', () => {
    it('should filter active bookings', () => {
      const store = useBookingsStore()
      const activeBooking = createMockBooking({ id: '1', status: 'booked' })
      const cancelledBooking = createMockBooking({ id: '2', status: 'cancelled' })

      store.bookings = [activeBooking, cancelledBooking]

      expect(store.activeBookings).toEqual([activeBooking])
    })

    it('should filter cancelled bookings', () => {
      const store = useBookingsStore()
      const activeBooking = createMockBooking({ id: '1', status: 'booked' })
      const cancelledBooking = createMockBooking({ id: '2', status: 'cancelled' })

      store.bookings = [activeBooking, cancelledBooking]

      expect(store.cancelledBookings).toEqual([cancelledBooking])
    })
  })

  describe('canUserEditBooking', () => {
    it('should return true when user is the creator', () => {
      const store = useBookingsStore()
      const booking = createMockBooking({ userId: 'user-1' })

      expect(store.canUserEditBooking(booking, 'user-1')).toBe(true)
    })

    it('should return true when user is the opponent', () => {
      const store = useBookingsStore()
      const booking = createMockBooking({
        userId: 'user-1',
        opponentUserId: 'opponent-1',
      })

      expect(store.canUserEditBooking(booking, 'opponent-1')).toBe(true)
    })

    it('should return false when user is neither creator nor opponent', () => {
      const store = useBookingsStore()
      const booking = createMockBooking({
        userId: 'user-1',
        opponentUserId: 'opponent-1',
      })

      expect(store.canUserEditBooking(booking, 'other-user')).toBe(false)
    })
  })

  describe('loadAllBookings', () => {
    it('should load all bookings successfully', async () => {
      const store = useBookingsStore()
      const mockBookings = [createMockBooking({ id: '1' }), createMockBooking({ id: '2' })]

      vi.mocked(bookingUtils.getAllBookings).mockResolvedValue(mockBookings)

      await store.loadAllBookings()

      expect(store.bookings).toEqual(mockBookings)
      expect(store.isLoading).toBe(false)
      expect(store.error).toBeNull()
    })

    it('should handle errors', async () => {
      const store = useBookingsStore()
      const error = new Error('Failed to load')

      vi.mocked(bookingUtils.getAllBookings).mockRejectedValue(error)

      try {
        await store.loadAllBookings()
      } catch {
        // Expected to throw
      }
      expect(store.error).toBe('Failed to load')
      expect(store.isLoading).toBe(false)
    })
  })

  describe('loadUserBookings', () => {
    it('should load user bookings successfully', async () => {
      const store = useBookingsStore()
      const mockBookings = [createMockBooking({ id: '1', userId: 'user-1' })]

      vi.mocked(bookingUtils.getUserBookings).mockResolvedValue(mockBookings)

      await store.loadUserBookings('user-1')

      expect(store.bookings).toEqual(mockBookings)
      expect(store.isLoading).toBe(false)
    })
  })

  describe('loadInvolvedBookings', () => {
    it('should load involved bookings successfully', async () => {
      const store = useBookingsStore()
      const mockBookings = [createMockBooking({ id: '1', userId: 'user-1' })]

      vi.mocked(bookingUtils.getInvolvedBookings).mockResolvedValue(mockBookings)

      await store.loadInvolvedBookings('user-1')

      expect(store.bookings).toEqual(mockBookings)
      expect(store.isLoading).toBe(false)
    })
  })

  describe('loadBookingById', () => {
    it('should load booking by id successfully', async () => {
      const store = useBookingsStore()
      const mockBooking = createMockBooking({ id: 'booking-1' })

      vi.mocked(bookingUtils.getBookingById).mockResolvedValue(mockBooking)

      const result = await store.loadBookingById('booking-1')

      expect(result).toStrictEqual(mockBooking)
      expect(store.currentBooking).toStrictEqual(mockBooking)
      expect(store.isLoading).toBe(false)
    })

    it('should throw error when booking not found', async () => {
      const store = useBookingsStore()

      vi.mocked(bookingUtils.getBookingById).mockResolvedValue(null)

      await expect(store.loadBookingById('non-existent')).rejects.toThrow('Booking not found')
    })
  })

  describe('addBooking', () => {
    it('should add booking successfully', async () => {
      const store = useBookingsStore()
      const newBooking = createMockBooking({ id: 'new-booking' })
      const bookingData = {
        userId: 'user-1',
        startTime: newBooking.startTime,
        endTime: newBooking.endTime,
        status: 'booked' as const,
      }

      vi.mocked(bookingUtils.createBooking).mockResolvedValue(newBooking)

      const result = await store.addBooking(bookingData)

      expect(result).toStrictEqual(newBooking)
      expect(store.bookings.length).toBe(1)
      expect(store.bookings[0]).toStrictEqual(newBooking)
      expect(store.isLoading).toBe(false)
    })
  })

  describe('editBooking', () => {
    it('should update booking successfully', async () => {
      const store = useBookingsStore()
      const existingBooking = createMockBooking({ id: 'booking-1', status: 'booked' })
      store.bookings = [existingBooking]

      vi.mocked(bookingUtils.updateBooking).mockResolvedValue()

      await store.editBooking('booking-1', { status: 'cancelled' })

      expect(store.bookings[0].status).toBe('cancelled')
      expect(store.isLoading).toBe(false)
    })

    it('should update currentBooking if it matches', async () => {
      const store = useBookingsStore()
      const existingBooking = createMockBooking({ id: 'booking-1', status: 'booked' })
      store.currentBooking = existingBooking

      vi.mocked(bookingUtils.updateBooking).mockResolvedValue()

      await store.editBooking('booking-1', { status: 'cancelled' })

      expect(store.currentBooking?.status).toBe('cancelled')
    })
  })

  describe('cancelBookingById', () => {
    it('should cancel booking successfully', async () => {
      const store = useBookingsStore()
      const existingBooking = createMockBooking({ id: 'booking-1', status: 'booked' })
      store.bookings = [existingBooking]

      vi.mocked(bookingUtils.cancelBooking).mockResolvedValue()

      await store.cancelBookingById('booking-1')

      expect(store.bookings[0].status).toBe('cancelled')
      expect(store.isLoading).toBe(false)
    })
  })

  describe('removeBooking', () => {
    it('should remove booking successfully', async () => {
      const store = useBookingsStore()
      const booking1 = createMockBooking({ id: 'booking-1' })
      const booking2 = createMockBooking({ id: 'booking-2' })
      store.bookings = [booking1, booking2]

      vi.mocked(bookingUtils.deleteBooking).mockResolvedValue()

      await store.removeBooking('booking-1')

      expect(store.bookings).toEqual([booking2])
      expect(store.isLoading).toBe(false)
    })

    it('should clear currentBooking if it matches', async () => {
      const store = useBookingsStore()
      const existingBooking = createMockBooking({ id: 'booking-1' })
      store.currentBooking = existingBooking

      vi.mocked(bookingUtils.deleteBooking).mockResolvedValue()

      await store.removeBooking('booking-1')

      expect(store.currentBooking).toBeNull()
    })
  })

  describe('clearError', () => {
    it('should clear error', () => {
      const store = useBookingsStore()
      store.error = 'Some error'

      store.clearError()

      expect(store.error).toBeNull()
    })
  })

  describe('clearCurrentBooking', () => {
    it('should clear current booking', () => {
      const store = useBookingsStore()
      store.currentBooking = createMockBooking()

      store.clearCurrentBooking()

      expect(store.currentBooking).toBeNull()
    })
  })
})
