import { computed } from 'vue'
import { useBookingsStore } from '@/stores/bookings'
import { useUserStore } from '@/stores/user'

/**
 * Composable to handle bookings operations
 * Provides convenient access to bookings store and user context
 */
export function useBookings() {
  const bookingsStore = useBookingsStore()
  const userStore = useUserStore()

  /**
   * Check if current user can edit/cancel a booking
   */
  function canEditBooking(booking: { userId: string; opponentUserId?: string }): boolean {
    if (!userStore.currentUser) {
      return false
    }
    return (
      booking.userId === userStore.currentUser.uid ||
      booking.opponentUserId === userStore.currentUser.uid
    )
  }

  /**
   * Check if current user is authenticated
   */
  const isAuthenticated = computed(() => userStore.isAuthenticated)

  /**
   * Get current user ID
   */
  const currentUserId = computed(() => userStore.currentUser?.uid ?? null)

  return {
    // Store access
    bookingsStore,
    userStore,
    // Helpers
    canEditBooking,
    // Computed
    isAuthenticated,
    currentUserId,
  }
}
