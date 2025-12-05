<template>
  <div class="min-h-screen bg-base-100">
    <div class="container mx-auto px-4 py-8">
      <div class="flex items-center justify-between mb-8">
        <div class="flex items-center gap-4">
          <RouterLink to="/" class="btn btn-ghost btn-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Hem
          </RouterLink>
          <h1 class="text-4xl font-bold">Bokningar</h1>
        </div>
        <div class="flex items-center gap-2">
          <UserDropdown />
          <button class="btn btn-primary" @click="openModal">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Boka banan
          </button>
        </div>
      </div>

      <!-- Date selector -->
      <div class="mb-6">
        <label class="label">
          <span class="label-text font-semibold">Välj datum</span>
        </label>
        <input
          v-model="selectedDateString"
          type="date"
          class="input input-bordered w-full max-w-xs"
          @change="loadBookingsForDate"
        />
      </div>

      <!-- Loading state -->
      <div v-if="bookingsStore.isLoading" class="flex justify-center py-8">
        <span class="loading loading-spinner loading-lg"></span>
      </div>

      <!-- Error state -->
      <div v-else-if="bookingsStore.error" class="alert alert-error mb-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="stroke-current shrink-0 h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>{{ bookingsStore.error }}</span>
      </div>

      <!-- Bookings list -->
      <div v-else-if="bookedBookings.length > 0" class="space-y-3">
        <div v-for="booking in bookedBookings" :key="booking.id" class="card bg-base-200 shadow-md">
          <div class="card-body">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-lg font-semibold">
                  {{ formatBookingDateTime(booking.startTime, booking.endTime) }}
                </p>
                <p class="text-base-content/70 mt-1">{{ getUserDisplayName(booking.userId) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else class="text-center py-12">
        <p class="text-xl text-base-content/70">Inga bokningar för valt datum</p>
      </div>
    </div>

    <!-- Booking Modal -->
    <BookingModal
      :is-open="isModalOpen"
      :existing-bookings="bookedBookings"
      @close="closeModal"
      @submit="handleBookingSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Timestamp } from 'firebase/firestore'
import { RouterLink } from 'vue-router'
import { useBookings } from '@/composables/useBookings'
import { formatBookingDateTime, getDayBounds } from '@/utils/dateUtils'
import { getUserDisplayName as fetchUserDisplayName } from '@/utils/userProfile'
import BookingModal from '@/components/BookingModal.vue'
import UserDropdown from '@/components/UserDropdown.vue'

const { bookingsStore, currentUserId } = useBookings()

const selectedDate = ref(new Date())
const isModalOpen = ref(false)
const userDisplayNames = ref<Map<string, string>>(new Map())

const selectedDateString = computed({
  get: () => selectedDate.value.toISOString().split('T')[0],
  set: (value: string) => {
    selectedDate.value = new Date(value)
  },
})

const bookedBookings = computed(() => {
  const allBooked = bookingsStore.bookings.filter(b => b.status === 'booked')

  // Filter to only show bookings that overlap with the selected day
  if (!selectedDate.value) return allBooked

  const { start, end } = getDayBounds(selectedDate.value)
  const dayStart = Timestamp.fromDate(start).toMillis()
  const dayEnd = Timestamp.fromDate(end).toMillis()

  return allBooked.filter(booking => {
    const bookingStart = booking.startTime.toMillis()
    const bookingEnd = booking.endTime.toMillis()
    // Booking overlaps if: startTime <= dayEnd AND endTime >= dayStart
    return bookingStart <= dayEnd && bookingEnd >= dayStart
  })
})

async function loadBookingsForDate() {
  if (!selectedDate.value) return

  // Query for bookings starting from 1 day before to catch bookings that span into the selected day
  const queryStartDate = new Date(selectedDate.value)
  queryStartDate.setDate(queryStartDate.getDate() - 1)
  queryStartDate.setHours(0, 0, 0, 0)
  const startTimestamp = Timestamp.fromDate(queryStartDate)

  // Load bookings that start on or after the query start date
  // The computed property will filter to show only bookings that overlap with the selected day
  await bookingsStore.loadAllBookings({
    startDate: startTimestamp,
    status: 'booked',
  })

  // Load user display names for all bookings
  await loadUserDisplayNames()
}

async function loadUserDisplayNames() {
  const userIds = new Set<string>()
  bookedBookings.value.forEach(booking => {
    userIds.add(booking.userId)
  })

  const names = new Map<string, string>()
  await Promise.all(
    Array.from(userIds).map(async userId => {
      const name = await fetchUserDisplayName(userId)
      names.set(userId, name)
    })
  )

  userDisplayNames.value = names
}

function getUserDisplayName(userId: string): string {
  return userDisplayNames.value.get(userId) ?? 'Okänd användare'
}

function openModal() {
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
}

async function handleBookingSubmit(data: { startTime: Timestamp; endTime: Timestamp }) {
  if (!currentUserId.value) {
    console.error('User not authenticated')
    return
  }

  try {
    await bookingsStore.addBooking({
      userId: currentUserId.value,
      startTime: data.startTime,
      endTime: data.endTime,
      status: 'booked',
    })

    // Reload bookings to get updated list
    await loadBookingsForDate()

    closeModal()
  } catch (error) {
    console.error('Error creating booking:', error)
    // Error is handled by the store
  }
}

onMounted(async () => {
  await loadBookingsForDate()
})
</script>
