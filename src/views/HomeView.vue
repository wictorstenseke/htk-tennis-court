<template>
  <div class="min-h-screen bg-base-100">
    <div class="container mx-auto px-4 py-8">
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

      <!-- När vill du spela? Section -->
      <section class="mb-12">
        <h2 class="text-3xl font-bold mb-6">När vill du spela?</h2>

        <!-- Date Selection -->
        <div class="mb-6">
          <label class="label">
            <span class="label-text font-semibold">Datum</span>
          </label>
          <div class="flex flex-wrap items-center gap-2">
            <button
              v-for="dateOption in dateOptions"
              :key="dateOption.key"
              @click="selectDate(dateOption.date)"
              class="badge badge-lg"
              :class="
                selectedDate && isSameDay(selectedDate, dateOption.date)
                  ? 'badge-primary'
                  : 'badge-outline'
              "
            >
              {{ dateOption.label }}
            </button>
            <button @click="showDatePicker = true" class="btn btn-sm btn-ghost text-sm">
              Välj dag
            </button>
          </div>
          <!-- Date picker input (hidden, shown when button clicked) -->
          <input
            v-if="showDatePicker"
            v-model="selectedDateInput"
            type="date"
            class="input input-bordered mt-2"
            :min="todayInput"
            @change="handleDatePickerChange"
            @blur="showDatePicker = false"
          />
        </div>

        <!-- Start Time Input -->
        <div class="mb-6">
          <label class="label">
            <span class="label-text font-semibold">Starttid</span>
          </label>
          <input
            v-model="startTimeInput"
            type="time"
            class="input input-bordered w-full max-w-xs"
            placeholder="16:00"
            @input="handleStartTimeInput"
            @blur="handleStartTimeBlur"
          />
        </div>

        <!-- Available Time Slots -->
        <div v-if="availableTimeSlots.length > 0" class="mb-6">
          <label class="label">
            <span class="label-text font-semibold">Tillgängliga tider</span>
          </label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="slot in availableTimeSlots"
              :key="slot.startTime"
              @click="selectTimeSlot(slot)"
              class="badge badge-lg transition-all"
              :class="
                slot.available
                  ? 'badge-primary cursor-pointer hover:badge-primary-focus'
                  : 'badge-ghost opacity-50 cursor-not-allowed'
              "
              :disabled="!slot.available"
            >
              {{ slot.displayTime }}
            </button>
          </div>
        </div>
      </section>

      <!-- Bookings Section -->
      <section class="mb-12">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <h2 class="text-3xl font-bold">Bokningar</h2>
          <div class="flex flex-col sm:flex-row gap-2">
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

        <!-- Bookings list grouped by day -->
        <div v-else-if="bookedBookings.length > 0" class="space-y-6">
          <div v-for="group in groupedBookings" :key="group.dateKey" class="space-y-2">
            <!-- Day header -->
            <h3 class="text-sm font-semibold text-base-content/80">
              {{ formatBookingDate(group.date) }}
            </h3>

            <!-- Bookings for this day -->
            <div class="space-y-2">
              <div
                v-for="booking in group.bookings"
                :key="booking.id"
                class="card card-bordered bg-base-200"
              >
                <div class="card-body p-4">
                  <div class="flex items-center justify-between gap-4">
                    <div class="flex-1 flex flex-wrap items-center gap-x-3">
                      <span class="text-sm font-medium text-base-content">
                        {{ formatTimeRange(booking.startTime, booking.endTime) }}
                      </span>
                      <!-- Only show user name if authenticated -->
                      <span
                        v-if="isAuthenticated"
                        class="badge badge-primary badge-sm whitespace-nowrap"
                      >
                        {{ getUserDisplayName(booking.userId) }}
                      </span>
                    </div>
                    <!-- More menu - only show for bookings user can edit when authenticated -->
                    <div
                      v-if="isAuthenticated && canEditBooking(booking)"
                      class="dropdown dropdown-end"
                    >
                      <div tabindex="0" role="button" class="btn btn-ghost btn-sm btn-circle">
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
                        class="dropdown-content menu bg-base-100 rounded-box z-[1] w-32 p-2 shadow-lg border border-base-300"
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
              </div>
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
        :initial-date="initialBookingDate"
        :initial-start-time="initialBookingStartTime"
        :initial-end-time="initialBookingEndTime"
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
import { formatTimeRange, formatBookingDate, getDateKey } from '@/utils/dateUtils'
import { getUserDisplayName as fetchUserDisplayName } from '@/utils/userProfile'
import { hasBookingOverlap } from '@/utils/bookingValidation'
import BookingModal from '@/components/BookingModal.vue'
import AuthModal from '@/components/AuthModal.vue'
import type { UserProfileRead } from '@/types/user'
import type { BookingRead } from '@/types/booking'

const userStore = useUserStore()
const { bookingsStore, currentUserId, canEditBooking } = useBookings()
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
const initialBookingDate = ref<Date | null>(null)
const initialBookingStartTime = ref<Date | null>(null)
const initialBookingEndTime = ref<Date | null>(null)

// Date and time selection for "När vill du spela?"
const selectedDate = ref<Date | null>(null)
const showDatePicker = ref(false)
const startTimeInput = ref('')
const availableTimeSlots = ref<
  Array<{ startTime: string; displayTime: string; available: boolean }>
>([])

// Get preferred booking duration (reactive)
const preferredDuration = computed(() => {
  return userStore.userProfile?.preferredBookingLengthMinutes ?? 120
})

// Date options for quick selection
const dateOptions = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const dayAfterTomorrow = new Date(today)
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2)

  const dayNames = ['Sön', 'Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör']
  const monthNames = [
    'jan',
    'feb',
    'mar',
    'apr',
    'maj',
    'jun',
    'jul',
    'aug',
    'sep',
    'okt',
    'nov',
    'dec',
  ]

  return [
    {
      key: 'today',
      label: `Idag, ${today.getDate()} ${monthNames[today.getMonth()]}`,
      date: today,
    },
    {
      key: 'tomorrow',
      label: `Imorgon, ${tomorrow.getDate()} ${monthNames[tomorrow.getMonth()]}`,
      date: tomorrow,
    },
    {
      key: 'dayAfterTomorrow',
      label: `${dayNames[dayAfterTomorrow.getDay()]} ${dayAfterTomorrow.getDate()} ${monthNames[dayAfterTomorrow.getMonth()]}`,
      date: dayAfterTomorrow,
    },
  ]
})

const todayInput = computed(() => {
  const today = new Date()
  return today.toISOString().split('T')[0]
})

const selectedDateInput = computed({
  get: () => {
    if (!selectedDate.value) return ''
    // Format date as YYYY-MM-DD without timezone issues
    const year = selectedDate.value.getFullYear()
    const month = String(selectedDate.value.getMonth() + 1).padStart(2, '0')
    const day = String(selectedDate.value.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  },
  set: (value: string) => {
    if (value) {
      // Parse date string and normalize to avoid timezone issues
      const newDate = new Date(value + 'T00:00:00')
      newDate.setHours(0, 0, 0, 0)

      // Ensure date is valid
      if (!isNaN(newDate.getTime())) {
        selectedDate.value = newDate
        calculateAvailableTimes()
      }
    }
  },
})

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

// Group bookings by day
const groupedBookings = computed(() => {
  const groups = new Map<string, BookingRead[]>()

  bookedBookings.value.forEach(booking => {
    const dateKey = getDateKey(booking.startTime)
    if (!groups.has(dateKey)) {
      groups.set(dateKey, [])
    }
    groups.get(dateKey)!.push(booking)
  })

  // Convert to array and sort by date key (which is sortable as YYYY-MM-DD)
  return Array.from(groups.entries())
    .map(([dateKey, bookings]) => ({
      dateKey,
      date: bookings[0].startTime, // Use first booking's timestamp for date formatting
      bookings: bookings.sort((a, b) => a.startTime.toMillis() - b.startTime.toMillis()),
    }))
    .sort((a, b) => a.dateKey.localeCompare(b.dateKey))
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

// Watch for bookings changes to recalculate available times
watch(
  () => bookedBookings.value,
  () => {
    if (selectedDate.value && startTimeInput.value) {
      calculateAvailableTimes()
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
    // Clear initial values when opening from button (not from time slot)
    initialBookingDate.value = null
    initialBookingStartTime.value = null
    initialBookingEndTime.value = null
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
  // Clear initial values when modal closes
  initialBookingDate.value = null
  initialBookingStartTime.value = null
  initialBookingEndTime.value = null
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

// Date and time selection functions
function isSameDay(date1: Date | null, date2: Date | null): boolean {
  if (!date1 || !date2) return false
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

function selectDate(date: Date) {
  // Create a new date object to avoid reference issues
  const normalizedDate = new Date(date)
  normalizedDate.setHours(0, 0, 0, 0)
  selectedDate.value = normalizedDate
  showDatePicker.value = false

  // Recalculate available times if we have a start time
  if (startTimeInput.value) {
    calculateAvailableTimes()
  }
}

function handleDatePickerChange() {
  if (selectedDateInput.value) {
    // Parse the date string and normalize it
    const dateString = selectedDateInput.value
    const newDate = new Date(dateString + 'T00:00:00') // Add time to avoid timezone issues
    newDate.setHours(0, 0, 0, 0)

    // Ensure date is valid
    if (!isNaN(newDate.getTime())) {
      selectedDate.value = newDate
      showDatePicker.value = false

      // Recalculate available times if we have a start time
      if (startTimeInput.value) {
        calculateAvailableTimes()
      }
    }
  }
}

function handleStartTimeInput(event: Event) {
  const target = event.target as HTMLInputElement
  let value = target.value.trim()

  // If using type="time", the value is already in HH:mm format
  // But we also support manual input with dots or other formats
  if (!value) {
    availableTimeSlots.value = []
    return
  }

  // Replace dots with colons for time format
  value = value.replace(/\./g, ':')

  // Validate and format time input (HH:mm or HH.mm or just HH)
  const timeMatch = value.match(/^(\d{1,2})[:.]?(\d{0,2})?$/)
  if (timeMatch) {
    let hours = parseInt(timeMatch[1]) || 0
    let minutes = parseInt(timeMatch[2] || '0') || 0

    // Validate hours and minutes
    if (hours > 23) hours = 23
    if (hours < 0) hours = 0
    if (minutes > 59) minutes = 59
    if (minutes < 0) minutes = 0

    // Format as HH:mm
    const formatted = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`

    // Only update if different to avoid infinite loops
    if (startTimeInput.value !== formatted) {
      startTimeInput.value = formatted
      // Update the input element value if it's a time input
      if (target.type === 'time') {
        target.value = formatted
      }
    }
  } else {
    // Invalid format, try to extract valid parts
    const numbers = value.match(/\d+/g)
    if (numbers && numbers.length > 0) {
      let hours = parseInt(numbers[0]) || 0
      if (hours > 23) hours = 23
      if (hours < 0) hours = 0

      let minutes = numbers.length > 1 ? parseInt(numbers[1]) || 0 : 0
      if (minutes > 59) minutes = 59
      if (minutes < 0) minutes = 0

      const formatted = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
      startTimeInput.value = formatted
      if (target.type === 'time') {
        target.value = formatted
      }
    }
  }

  calculateAvailableTimes()
}

function handleStartTimeBlur(event: Event) {
  const target = event.target as HTMLInputElement
  let value = target.value.trim()

  if (!value) {
    return
  }

  // Ensure proper formatting on blur
  const timeMatch = value.match(/^(\d{1,2})[:.]?(\d{0,2})?$/)
  if (timeMatch) {
    let hours = parseInt(timeMatch[1]) || 0
    let minutes = parseInt(timeMatch[2] || '0') || 0

    // Validate hours and minutes
    if (hours > 23) hours = 23
    if (hours < 0) hours = 0
    if (minutes > 59) minutes = 59
    if (minutes < 0) minutes = 0

    // Format as HH:mm
    const formatted = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
    startTimeInput.value = formatted
    if (target.type === 'time') {
      target.value = formatted
    }
  }
}

function calculateAvailableTimes() {
  if (!selectedDate.value || !startTimeInput.value) {
    availableTimeSlots.value = []
    return
  }

  // Use computed preferred duration (default 120 minutes / 2 hours)
  const duration = preferredDuration.value

  // Parse start time input (format: HH:mm or HH.mm)
  const timeStr = startTimeInput.value.replace(/\./g, ':')
  const [hours, minutes] = timeStr.split(':').map(Number)
  if (isNaN(hours) || isNaN(minutes)) {
    availableTimeSlots.value = []
    return
  }

  // Create base date/time - ensure we use the selected date properly
  const baseDate = new Date(selectedDate.value)
  baseDate.setHours(hours, minutes, 0, 0)

  // Ensure we're working with the correct date (handle timezone issues)
  if (baseDate.getDate() !== selectedDate.value.getDate()) {
    // Date shifted due to timezone, reset it
    baseDate.setFullYear(
      selectedDate.value.getFullYear(),
      selectedDate.value.getMonth(),
      selectedDate.value.getDate()
    )
    baseDate.setHours(hours, minutes, 0, 0)
  }

  // If the selected time is in the past, start from now
  const now = new Date()
  if (baseDate < now) {
    baseDate.setTime(now.getTime())
    // Round up to next 30-minute interval
    const currentMinutes = baseDate.getMinutes()
    const roundedMinutes = currentMinutes <= 30 ? 30 : 60
    baseDate.setMinutes(roundedMinutes)
    if (roundedMinutes === 60) {
      baseDate.setHours(baseDate.getHours() + 1)
      baseDate.setMinutes(0)
    }
  }

  // Get all existing bookings for overlap checking
  const allBookings = [...bookingsStore.bookings, ...mockBookings.value].filter(
    b => b.status === 'booked'
  )

  // Generate 6 time slots starting from the base time
  const slots: Array<{ startTime: string; displayTime: string; available: boolean }> = []
  let currentTime = new Date(baseDate)
  const maxSlots = 6
  const timeIncrement = 30 // 30 minutes between slots

  for (let i = 0; i < maxSlots * 2; i++) {
    // Check if we've found enough slots
    if (slots.length >= maxSlots) break

    // Create start and end timestamps for this slot
    const slotStart = new Date(currentTime)
    const slotEnd = new Date(slotStart)
    slotEnd.setMinutes(slotEnd.getMinutes() + duration)

    // Format display time with full range (e.g., "16.00-18.00")
    const startHoursStr = slotStart.getHours().toString().padStart(2, '0')
    const startMinutesStr = slotStart.getMinutes().toString().padStart(2, '0')
    const endHoursStr = slotEnd.getHours().toString().padStart(2, '0')
    const endMinutesStr = slotEnd.getMinutes().toString().padStart(2, '0')
    const displayTime = `${startHoursStr}.${startMinutesStr}-${endHoursStr}.${endMinutesStr}`

    // Check if this slot overlaps with any existing booking
    const slotStartTimestamp = Timestamp.fromDate(slotStart)
    const slotEndTimestamp = Timestamp.fromDate(slotEnd)
    const hasOverlap = hasBookingOverlap(slotStartTimestamp, slotEndTimestamp, allBookings)

    slots.push({
      startTime: slotStart.toISOString(),
      displayTime,
      available: !hasOverlap,
    })

    // Move to next time slot (30 minutes later)
    currentTime.setMinutes(currentTime.getMinutes() + timeIncrement)
  }

  availableTimeSlots.value = slots
}

function selectTimeSlot(slot: { startTime: string; displayTime: string; available: boolean }) {
  if (!slot.available || !isAuthenticated.value) return

  // Check if bookings are enabled
  if (settings.value && settings.value.bookingsEnabled === false) {
    return
  }

  // Parse the selected time slot
  const slotDate = new Date(slot.startTime)
  const duration = preferredDuration.value

  // Use the already selected date instead of parsing from slot to avoid timezone issues
  // The selectedDate is already correctly set when the user picks a date
  const baseDate = selectedDate.value ? new Date(selectedDate.value) : new Date(slotDate)
  baseDate.setHours(0, 0, 0, 0)

  // Extract time from the slot
  const slotHours = slotDate.getHours()
  const slotMinutes = slotDate.getMinutes()

  // Create start time using the selected date with the slot's time
  const startDateTime = new Date(baseDate)
  startDateTime.setHours(slotHours, slotMinutes, 0, 0)

  // Create end time
  const endDateTime = new Date(startDateTime)
  endDateTime.setMinutes(endDateTime.getMinutes() + duration)

  // Update selected date (should already be set, but ensure it's correct)
  selectedDate.value = baseDate

  // Format time for input (HH:mm)
  const hours = slotHours.toString().padStart(2, '0')
  const minutes = slotMinutes.toString().padStart(2, '0')
  startTimeInput.value = `${hours}:${minutes}`

  // Set initial values for the booking modal using the correct date
  initialBookingDate.value = new Date(baseDate)
  initialBookingStartTime.value = new Date(startDateTime)
  initialBookingEndTime.value = new Date(endDateTime)

  // Open booking modal with prefilled values
  editingBooking.value = null
  openModal()
}
</script>
