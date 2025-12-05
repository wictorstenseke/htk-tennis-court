<template>
  <div class="min-h-screen bg-base-100">
    <div class="container mx-auto px-4 py-8">
      <!-- User dropdown in top right -->
      <div class="flex justify-end mb-4">
        <UserDropdown v-if="isAuthenticated" />
      </div>

      <div class="text-center mb-8">
        <h1 class="text-5xl font-bold mb-4">HTK Tennis</h1>
        <p class="text-xl text-base-content/70">Välkommen till HTK Tennis v2</p>
        <div class="mt-4">
          <button v-if="!isAuthenticated" @click="openAuthModal" class="btn btn-primary">
            Logga in / Skapa konto
          </button>
        </div>
      </div>

      <!-- Announcement Section -->
      <section v-if="announcementEnabled && announcementTitle" class="mb-12">
        <div class="alert alert-info">
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
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div class="flex-1">
            <h3 class="font-bold text-lg mb-2">{{ announcementTitle }}</h3>
            <p class="whitespace-pre-line">{{ announcementBody }}</p>
            <div v-if="announcementLinks.length > 0" class="flex flex-wrap gap-2 mt-4">
              <a
                v-for="(link, index) in announcementLinks"
                :key="index"
                :href="link.url"
                target="_blank"
                rel="noopener noreferrer"
                class="btn btn-sm btn-outline"
              >
                {{ link.label }}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 ml-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- Bookings Section -->
      <section class="mb-12">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <h2 class="text-3xl font-bold">Bokningar</h2>
          <div class="flex gap-2">
            <button v-if="isAuthenticated" class="btn btn-outline" @click="createMockBookings">
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
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Skapa testbokningar
            </button>
            <button
              v-if="settings && settings.bookingsEnabled !== false"
              class="btn btn-primary"
              @click="handleBookBananClick"
            >
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

        <!-- Bookings disabled message -->
        <div v-if="settings && settings.bookingsEnabled === false" class="alert alert-info mb-6">
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
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{{ disabledMessage }}</span>
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
        <div v-else-if="bookedBookings.length > 0" class="space-y-1">
          <div
            v-for="booking in bookedBookings"
            :key="booking.id"
            class="flex items-center justify-between py-2 px-4 bg-base-200 rounded-lg"
          >
            <div class="flex-1 flex flex-wrap items-center gap-x-2">
              <span class="text-sm font-medium">
                {{ formatBookingDateTime(booking.startTime, booking.endTime) }}
              </span>
              <!-- Only show user name if authenticated -->
              <span
                v-if="isAuthenticated"
                class="text-sm font-semibold text-primary whitespace-nowrap"
              >
                {{ getUserDisplayName(booking.userId) }}
              </span>
            </div>
            <!-- More menu - only show for user's own bookings when authenticated -->
            <div
              v-if="isAuthenticated && isMyBooking(booking)"
              class="dropdown dropdown-end flex items-center"
            >
              <div tabindex="0" role="button" class="btn btn-ghost btn-xs btn-circle">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                  />
                </svg>
              </div>
              <ul
                tabindex="0"
                class="dropdown-content menu bg-base-100 rounded-box z-[1] w-32 p-2 shadow"
              >
                <li>
                  <a @click.prevent="handleEditBooking(booking)" class="text-sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Redigera
                  </a>
                </li>
                <li>
                  <a @click.prevent="handleDeleteBooking(booking)" class="text-sm text-error">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Ta bort
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div v-else class="text-center py-12">
          <p class="text-xl text-base-content/70">Inga kommande bokningar</p>
        </div>
      </section>

      <!-- Users Section -->
      <section v-if="isAuthenticated" class="mb-12">
        <h2 class="text-3xl font-bold mb-6">Användare</h2>
        <div class="overflow-x-auto">
          <table class="table table-zebra w-full">
            <thead>
              <tr>
                <th>Namn</th>
                <th>E-post</th>
                <th>Telefon</th>
                <th>Roll</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(user, index) in mockUsers" :key="index">
                <td>{{ user.displayName }}</td>
                <td>{{ user.email }}</td>
                <td>{{ user.phone || '-' }}</td>
                <td>{{ user.role || 'user' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Booking Modal -->
      <BookingModal
        v-if="isAuthenticated"
        :is-open="isModalOpen"
        :existing-bookings="bookedBookings"
        :editing-booking="editingBooking"
        @close="closeModal"
        @submit="handleBookingSubmit"
      />

      <!-- Auth Modal -->
      <AuthModal :is-open="isAuthModalOpen" @close="closeAuthModal" @success="handleAuthSuccess" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { Timestamp } from 'firebase/firestore'
import { useUserStore } from '@/stores/user'
import { useBookings } from '@/composables/useBookings'
import { useAppSettings } from '@/composables/useAppSettings'
import { useAnnouncements } from '@/composables/useAnnouncements'
import {
  getMockUsers,
  getMockBookings,
  getUserDisplayName as getMockUserDisplayName,
  mockUserIds,
} from '@/utils/mockData'
import { formatBookingDateTime } from '@/utils/dateUtils'
import { getUserDisplayName as fetchUserDisplayName } from '@/utils/userProfile'
import BookingModal from '@/components/BookingModal.vue'
import AuthModal from '@/components/AuthModal.vue'
import UserDropdown from '@/components/UserDropdown.vue'
import type { UserProfileRead } from '@/types/user'
import type { BookingRead } from '@/types/booking'

const userStore = useUserStore()
const { bookingsStore, currentUserId } = useBookings()
const { settings, bookingsDisabledMessage, loadSettings } = useAppSettings()
const {
  isEnabled: announcementEnabled,
  title: announcementTitle,
  body: announcementBody,
  links: announcementLinks,
  loadAnnouncement,
} = useAnnouncements()

const isAuthenticated = computed(() => userStore.isAuthenticated)

// Computed message to show when bookings are disabled
const disabledMessage = computed(() => {
  return (
    bookingsDisabledMessage.value ||
    'Bokningar är för närvarande stängda för säsong eller underhåll.'
  )
})

const mockUsers = ref<UserProfileRead[]>([])
const mockBookings = ref<BookingRead[]>([])
const isModalOpen = ref(false)
const isAuthModalOpen = ref(false)
const editingBooking = ref<BookingRead | null>(null)
const userDisplayNames = ref<Map<string, string>>(new Map())

const bookedBookings = computed(() => {
  const now = Timestamp.now().toMillis()

  // Combine real bookings and mock bookings
  const realBooked = bookingsStore.bookings.filter(b => b.status === 'booked')
  const mockBooked = mockBookings.value.filter(b => b.status === 'booked')
  const allBooked = [...realBooked, ...mockBooked]

  // Filter to only show future bookings (startTime > now)
  const futureBookings = allBooked
    .filter(booking => booking.startTime.toMillis() > now)
    .sort((a, b) => a.startTime.toMillis() - b.startTime.toMillis())

  return futureBookings
})

// Watch for authentication changes and reload bookings when user logs in
watch(isAuthenticated, newValue => {
  if (newValue) {
    // Reload bookings and user display names when user logs in
    loadFutureBookings()
  }
})

// Watch for settings changes to ensure reactivity
watch(
  () => settings.value,
  () => {
    // Settings updated, ensure modal is closed if bookings are disabled
    if (settings.value && settings.value.bookingsEnabled === false && isModalOpen.value) {
      closeModal()
    }
  },
  { deep: true }
)

// Reload settings when page becomes visible (in case settings changed in another tab)
function handleVisibilityChange() {
  if (!document.hidden) {
    loadSettings()
  }
}

onMounted(async () => {
  // Load app settings to check if bookings are enabled
  await loadSettings()
  // Load announcement
  await loadAnnouncement()

  mockUsers.value = getMockUsers()
  mockBookings.value = getMockBookings()
  // Ensure mock user names are loaded immediately
  loadMockUserNames()
  // Load bookings for all users (including non-authenticated)
  loadFutureBookings()

  // Listen for visibility changes to reload settings
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

// Cleanup listener on unmount
onUnmounted(() => {
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})

async function loadFutureBookings() {
  const now = Timestamp.now()

  // Try to load all future bookings from Firestore
  // If it fails (e.g., permissions not deployed), store will handle gracefully
  // and we'll still show mock bookings
  await bookingsStore.loadAllBookings({
    startDate: now,
    status: 'booked',
  })

  // Always load mock user names (they're local data, no Firestore needed)
  await loadMockUserNames()

  // Only try to fetch real user names from Firestore if authenticated
  if (isAuthenticated.value) {
    await loadRealUserNames()
  }
}

async function loadMockUserNames() {
  // Always load mock user names (they're local data, no Firestore needed)
  // Merge with existing names (don't overwrite if real names were already loaded)
  mockUserIds.forEach((userId, index) => {
    if (!userDisplayNames.value.has(userId) && mockUsers.value[index]) {
      userDisplayNames.value.set(userId, mockUsers.value[index].displayName)
    }
  })
}

async function loadRealUserNames() {
  const userIds = new Set<string>()
  bookedBookings.value.forEach(booking => {
    userIds.add(booking.userId)
  })

  // Try to fetch real user names from Firestore for any IDs not in mock users
  await Promise.all(
    Array.from(userIds)
      .filter(userId => !userDisplayNames.value.has(userId)) // Only fetch if not already in map
      .map(async userId => {
        try {
          const name = await fetchUserDisplayName(userId)
          userDisplayNames.value.set(userId, name)
        } catch {
          // If fetch fails, try mock name as fallback
          const mockName = getMockUserDisplayName(userId)
          if (mockName !== 'Okänd användare') {
            userDisplayNames.value.set(userId, mockName)
          }
        }
      })
  )
}

function getUserDisplayName(userId: string): string {
  // First try to get from loaded user display names
  const loadedName = userDisplayNames.value.get(userId)
  if (loadedName && loadedName !== 'Okänd användare') return loadedName

  // Fall back to mock user display name (for mock bookings)
  const mockName = getMockUserDisplayName(userId)
  if (mockName !== 'Okänd användare') return mockName

  return 'Okänd användare'
}

function isMyBooking(booking: BookingRead): boolean {
  return currentUserId.value !== null && booking.userId === currentUserId.value
}

function handleEditBooking(booking: BookingRead) {
  editingBooking.value = booking
  openModal()
}

async function handleDeleteBooking(booking: BookingRead) {
  if (!confirm('Är du säker på att du vill ta bort denna bokning?')) {
    return
  }

  try {
    await bookingsStore.removeBooking(booking.id)
    // Reload bookings to get updated list
    await loadFutureBookings()
  } catch (error) {
    console.error('Error deleting booking:', error)
    // Error is handled by the store
  }
}

async function createMockBookings() {
  if (!currentUserId.value) {
    console.error('User not authenticated')
    return
  }

  try {
    const now = new Date()

    // First booking: tomorrow at 10:00 - 12:00
    const booking1Date = new Date(now)
    booking1Date.setDate(booking1Date.getDate() + 1)
    booking1Date.setHours(10, 0, 0, 0)
    const booking1End = new Date(booking1Date)
    booking1End.setHours(12, 0, 0, 0)

    // Second booking: day after tomorrow at 14:00 - 16:00
    const booking2Date = new Date(now)
    booking2Date.setDate(booking2Date.getDate() + 2)
    booking2Date.setHours(14, 0, 0, 0)
    const booking2End = new Date(booking2Date)
    booking2End.setHours(16, 0, 0, 0)

    // Create both bookings
    await Promise.all([
      bookingsStore.addBooking({
        userId: currentUserId.value,
        startTime: Timestamp.fromDate(booking1Date),
        endTime: Timestamp.fromDate(booking1End),
        status: 'booked',
      }),
      bookingsStore.addBooking({
        userId: currentUserId.value,
        startTime: Timestamp.fromDate(booking2Date),
        endTime: Timestamp.fromDate(booking2End),
        status: 'booked',
      }),
    ])

    // Reload bookings to get updated list
    await loadFutureBookings()
  } catch (error) {
    console.error('Error creating mock bookings:', error)
    // Error is handled by the store
  }
}

function handleBookBananClick() {
  // Check if bookings are disabled
  if (settings.value && settings.value.bookingsEnabled === false) {
    return
  }

  if (!isAuthenticated.value) {
    // Show auth modal if not logged in
    openAuthModal()
  } else {
    // Show booking modal if logged in
    openModal()
  }
}

function openModal() {
  // Don't open modal if bookings are disabled
  if (settings.value && settings.value.bookingsEnabled === false) {
    return
  }
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
  editingBooking.value = null
}

function openAuthModal() {
  isAuthModalOpen.value = true
}

function closeAuthModal() {
  isAuthModalOpen.value = false
}

function handleAuthSuccess() {
  // Auth modal will close automatically, and auth state change will trigger booking reload
  // Optionally reload bookings here if needed
  loadFutureBookings()
}

async function handleBookingSubmit(data: {
  startTime: Timestamp
  endTime: Timestamp
  bookingId?: string
}) {
  // Double-check bookings are enabled before submitting
  if (settings.value && settings.value.bookingsEnabled === false) {
    console.error('Bookings are disabled')
    closeModal()
    return
  }

  if (!currentUserId.value) {
    console.error('User not authenticated')
    return
  }

  try {
    if (data.bookingId && editingBooking.value) {
      // Update existing booking
      await bookingsStore.editBooking(data.bookingId, {
        startTime: data.startTime,
        endTime: data.endTime,
      })
    } else {
      // Create new booking
      await bookingsStore.addBooking({
        userId: currentUserId.value,
        startTime: data.startTime,
        endTime: data.endTime,
        status: 'booked',
      })
    }

    // Reload bookings to get updated list
    await loadFutureBookings()

    closeModal()
  } catch (error) {
    console.error('Error saving booking:', error)
    // Error is handled by the store
  }
}
</script>
