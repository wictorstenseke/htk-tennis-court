import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { BookingRead } from '@/types/booking'
import {
  getAllBookings,
  getUserBookings,
  getInvolvedBookings,
  getBookingById,
  createBooking,
  updateBooking,
  cancelBooking,
  deleteBooking,
} from '@/utils/bookingUtils'
import type { BookingCreate, BookingUpdate } from '@/types/booking'
import { orderBy, where, type Timestamp } from 'firebase/firestore'

export const useBookingsStore = defineStore('bookings', () => {
  // State
  const bookings = ref<BookingRead[]>([])
  const currentBooking = ref<BookingRead | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const activeBookings = computed(() => bookings.value.filter(b => b.status === 'booked'))
  const cancelledBookings = computed(() => bookings.value.filter(b => b.status === 'cancelled'))

  /**
   * Check if a user can edit/cancel a booking
   * @param booking - Booking to check
   * @param userId - Current user ID
   * @returns true if user can edit/cancel
   */
  function canUserEditBooking(booking: BookingRead, userId: string): boolean {
    return booking.userId === userId || booking.opponentUserId === userId
  }

  // Actions
  async function loadAllBookings(filters?: {
    startDate?: Timestamp
    endDate?: Timestamp
    status?: 'booked' | 'cancelled'
  }) {
    try {
      isLoading.value = true
      error.value = null

      const constraints = []

      if (filters?.startDate) {
        constraints.push(where('startTime', '>=', filters.startDate))
      }

      if (filters?.endDate) {
        constraints.push(where('endTime', '<=', filters.endDate))
      }

      if (filters?.status) {
        constraints.push(where('status', '==', filters.status))
      }

      // Always order by startTime
      constraints.push(orderBy('startTime', 'asc'))

      bookings.value = await getAllBookings(constraints)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load bookings'
      error.value = errorMessage
      console.error('Error loading bookings:', err)
      // Don't throw - allow component to handle gracefully
      // This way mock bookings can still be shown even if Firestore fails
      bookings.value = []
    } finally {
      isLoading.value = false
    }
  }

  async function loadUserBookings(
    userId: string,
    filters?: {
      startDate?: Timestamp
      endDate?: Timestamp
      status?: 'booked' | 'cancelled'
    }
  ) {
    try {
      isLoading.value = true
      error.value = null

      const constraints = []

      if (filters?.startDate) {
        constraints.push(where('startTime', '>=', filters.startDate))
      }

      if (filters?.endDate) {
        constraints.push(where('endTime', '<=', filters.endDate))
      }

      if (filters?.status) {
        constraints.push(where('status', '==', filters.status))
      }

      constraints.push(orderBy('startTime', 'asc'))

      bookings.value = await getUserBookings(userId, constraints)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load user bookings'
      console.error('Error loading user bookings:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function loadInvolvedBookings(
    userId: string,
    filters?: {
      startDate?: Timestamp
      endDate?: Timestamp
      status?: 'booked' | 'cancelled'
    }
  ) {
    try {
      isLoading.value = true
      error.value = null

      const constraints = []

      if (filters?.startDate) {
        constraints.push(where('startTime', '>=', filters.startDate))
      }

      if (filters?.endDate) {
        constraints.push(where('endTime', '<=', filters.endDate))
      }

      if (filters?.status) {
        constraints.push(where('status', '==', filters.status))
      }

      constraints.push(orderBy('startTime', 'asc'))

      bookings.value = await getInvolvedBookings(userId, constraints)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load involved bookings'
      console.error('Error loading involved bookings:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function loadBookingById(bookingId: string) {
    try {
      isLoading.value = true
      error.value = null

      const booking = await getBookingById(bookingId)
      currentBooking.value = booking

      if (!booking) {
        throw new Error('Booking not found')
      }

      return booking
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load booking'
      console.error('Error loading booking:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function addBooking(bookingData: BookingCreate) {
    try {
      isLoading.value = true
      error.value = null

      const newBooking = await createBooking(bookingData)

      // Add to local state
      bookings.value.push(newBooking)
      bookings.value.sort((a, b) => a.startTime.toMillis() - b.startTime.toMillis())

      return newBooking
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create booking'
      console.error('Error creating booking:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function editBooking(bookingId: string, updates: BookingUpdate) {
    try {
      isLoading.value = true
      error.value = null

      await updateBooking(bookingId, updates)

      // Update local state
      const index = bookings.value.findIndex(b => b.id === bookingId)
      if (index !== -1) {
        bookings.value[index] = {
          ...bookings.value[index],
          ...updates,
        } as BookingRead
      }

      if (currentBooking.value?.id === bookingId) {
        currentBooking.value = {
          ...currentBooking.value,
          ...updates,
        } as BookingRead
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update booking'
      console.error('Error updating booking:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function cancelBookingById(bookingId: string) {
    try {
      isLoading.value = true
      error.value = null

      await cancelBooking(bookingId)

      // Update local state
      const index = bookings.value.findIndex(b => b.id === bookingId)
      if (index !== -1) {
        bookings.value[index] = {
          ...bookings.value[index],
          status: 'cancelled',
        }
      }

      if (currentBooking.value?.id === bookingId) {
        currentBooking.value = {
          ...currentBooking.value,
          status: 'cancelled',
        }
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to cancel booking'
      console.error('Error cancelling booking:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function removeBooking(bookingId: string) {
    try {
      isLoading.value = true
      error.value = null

      await deleteBooking(bookingId)

      // Remove from local state
      bookings.value = bookings.value.filter(b => b.id !== bookingId)

      if (currentBooking.value?.id === bookingId) {
        currentBooking.value = null
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete booking'
      console.error('Error deleting booking:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  function clearCurrentBooking() {
    currentBooking.value = null
  }

  return {
    // State
    bookings,
    currentBooking,
    isLoading,
    error,
    // Getters
    activeBookings,
    cancelledBookings,
    canUserEditBooking,
    // Actions
    loadAllBookings,
    loadUserBookings,
    loadInvolvedBookings,
    loadBookingById,
    addBooking,
    editBooking,
    cancelBookingById,
    removeBooking,
    clearError,
    clearCurrentBooking,
  }
})
