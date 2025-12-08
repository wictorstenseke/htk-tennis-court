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
      <section class="mb-12" ref="bookingFormRef">
        <h2 class="text-3xl font-bold mb-6">När vill du spela?</h2>

        <div class="max-w-lg w-full mx-auto px-2 sm:px-0">
          <fieldset
            class="space-y-6 bg-base-200/70 border border-base-300 rounded-box p-6"
            ref="calendarWrapperRef"
          >
            <legend class="sr-only">Bokningsformulär</legend>

            <div class="form-control w-full">
              <label class="label pb-1">
                <span class="label-text text-sm font-medium">Datum</span>
              </label>
              <div class="relative w-full">
                <input
                  type="text"
                  class="input input-bordered w-full pr-10"
                  placeholder="Välj datum"
                  :value="selectedDateInput"
                  readonly
                  @click="showCalendar = true"
                />
                <div
                  class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-base-content/60"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 stroke-current"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.5"
                      d="M6.75 3v2.25M17.25 3v2.25M3.75 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h12a2.25 2.25 0 0 1 2.25 2.25v11.25m-16.5 0A2.25 2.25 0 0 0 6 21h12a2.25 2.25 0 0 0 2.25-2.25m-16.5 0v-7.5A2.25 2.25 0 0 1 6 9h12a2.25 2.25 0 0 1 2.25 2.25v7.5"
                    />
                  </svg>
                </div>
                <div
                  v-if="showCalendar"
                  class="absolute z-10 mt-2 bg-base-100 rounded-box shadow-lg border border-base-300 p-3"
                >
                  <calendar-date
                    :value="selectedDateInput"
                    class="cally"
                    :min="todayInput"
                    @change="handleDatePickerChange"
                  >
                    <calendar-month></calendar-month>
                  </calendar-date>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TimeAutocomplete
                v-model="startTimeInput"
                label="Starttid"
                placeholder="Välj starttid"
                :disabled="isSubmittingBooking"
                :disabled-options="disabledStartTimes"
                @update:model-value="handleStartTimeInputChange"
              />
              <TimeAutocomplete
                v-model="endTimeInput"
                label="Slut"
                placeholder="Välj sluttid"
                :disabled="isSubmittingBooking"
                @update:model-value="handleEndTimeInputChange"
              />
            </div>

            <div v-if="selectedDate && unavailableIntervals.length > 0" class="space-y-2">
              <div class="flex flex-wrap gap-2">
                <div
                  v-for="booking in unavailableIntervals"
                  :key="booking.id"
                  class="badge badge-ghost bg-base-300 text-base-content/70 gap-1 pr-3"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4 text-base-content/60"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M18.364 5.636a9 9 0 10-12.728 12.728A9 9 0 0018.364 5.636zM15 9l-6 6"
                    />
                  </svg>
                  <span>{{ booking.timeRange }}</span>
                </div>
              </div>
            </div>

            <div v-if="formError" class="alert alert-error">
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
              <span>{{ formError }}</span>
            </div>

            <div v-if="formSuccess" class="alert alert-success flex items-center gap-3">
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span class="flex-1">{{ formSuccess }}</span>
              <button class="btn btn-sm btn-ghost" type="button" @click="formSuccess = ''">
                OK
              </button>
            </div>

            <div class="flex items-center gap-3">
              <button
                class="btn btn-primary"
                :disabled="isSubmittingBooking || !isAuthenticated"
                @click="submitInlineBooking"
              >
                <span v-if="isSubmittingBooking" class="loading loading-spinner loading-sm"></span>
                <span v-else>{{ editingBooking ? 'Uppdatera bokning' : 'Boka' }}</span>
              </button>
              <span v-if="!isAuthenticated" class="text-sm text-base-content/70">
                Logga in för att boka.
              </span>
              <span v-else-if="editingBooking" class="badge badge-outline">
                Redigerar bokning
              </span>
            </div>
          </fieldset>
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
                        class="dropdown-content menu bg-base-100 rounded-box z-1 w-32 p-2 shadow-lg border border-base-300"
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
                          <a
                            @click.prevent="handleDeleteBooking(booking)"
                            class="text-sm text-error"
                          >
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
import {
  formatTimeRange,
  formatBookingDate,
  formatBookingTime,
  getDateKey,
} from '@/utils/dateUtils'
import { getUserDisplayName as fetchUserDisplayName } from '@/utils/userProfile'
import { hasBookingOverlap, validateBookingTimeRange } from '@/utils/bookingValidation'
import AuthModal from '@/components/AuthModal.vue'
import TimeAutocomplete from '@/components/TimeAutocomplete.vue'
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
const isAuthModalOpen = ref(false)
const editingBooking = ref<BookingRead | null>(null)
const userDisplayNames = ref<Map<string, string>>(new Map())
const bookingFormRef = ref<HTMLElement | null>(null)
const calendarWrapperRef = ref<HTMLElement | null>(null)
const clickAwayHandler = ref<((event: MouseEvent) => void) | null>(null)

// Date and time selection for "När vill du spela?"
const selectedDate = ref<Date | null>(null)
const showCalendar = ref(false)
const startTimeInput = ref('')
const endTimeInput = ref('')
const formError = ref('')
const formSuccess = ref('')
const isSubmittingBooking = ref(false)

// Get preferred booking duration (reactive)
const preferredDuration = computed(() => {
  return userStore.userProfile?.preferredBookingLengthMinutes ?? 120
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

const unavailableIntervals = computed(() => {
  if (!selectedDate.value) return []
  const dateKey = getDateKey(Timestamp.fromDate(selectedDate.value))

  return bookedBookings.value
    .filter(booking => getDateKey(booking.startTime) === dateKey)
    .map(booking => ({
      id: booking.id,
      timeRange: formatTimeRange(booking.startTime, booking.endTime),
      start: formatBookingTime(booking.startTime),
      startDate: booking.startTime.toDate(),
      endDate: booking.endTime.toDate(),
    }))
})

const disabledStartTimes = computed(() =>
  unavailableIntervals.value.flatMap(interval => {
    const slots: string[] = []
    const cursor = new Date(interval.startDate)
    const end = new Date(interval.endDate)

    while (cursor < end) {
      slots.push(formatTimeForInput(cursor))
      cursor.setMinutes(cursor.getMinutes() + 15)
    }

    return slots
  })
)

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
    // Settings updated, clear editing state if bookings are disabled
    if (settings.value && settings.value.bookingsEnabled === false) {
      editingBooking.value = null
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
  clickAwayHandler.value = event => {
    if (!showCalendar.value) return
    const target = event.target as Node
    const path = (event.composedPath && event.composedPath()) || []
    if (
      calendarWrapperRef.value &&
      !calendarWrapperRef.value.contains(target) &&
      !path.includes(calendarWrapperRef.value)
    ) {
      showCalendar.value = false
    }
  }
  document.addEventListener('mousedown', clickAwayHandler.value)
})

// Cleanup listener on unmount
onUnmounted(() => {
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  if (clickAwayHandler.value) {
    document.removeEventListener('mousedown', clickAwayHandler.value)
  }
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
  const startDate = booking.startTime.toDate()
  const endDate = booking.endTime.toDate()
  startDate.setSeconds(0, 0)
  endDate.setSeconds(0, 0)

  selectedDate.value = new Date(startDate)
  startTimeInput.value = formatTimeForInput(startDate)
  endTimeInput.value = formatTimeForInput(endDate)
  formError.value = ''
  formSuccess.value = ''
  scrollToBookingForm()
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
    formError.value = ''
    formSuccess.value = ''
    editingBooking.value = null

    if (!selectedDate.value) {
      selectDate(new Date())
    }

    if (!startTimeInput.value) {
      startTimeInput.value = getNext15MinInterval()
      autofillEndTimeFromStart()
    }

    scrollToBookingForm()
  }
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

async function submitInlineBooking() {
  formError.value = ''
  formSuccess.value = ''

  if (settings.value && settings.value.bookingsEnabled === false) {
    formError.value = disabledMessage.value
    return
  }

  if (!isAuthenticated.value || !currentUserId.value) {
    openAuthModal()
    return
  }

  if (!selectedDate.value || !startTimeInput.value || !endTimeInput.value) {
    formError.value = 'Välj datum, starttid och sluttid.'
    return
  }

  isSubmittingBooking.value = true

  try {
    const startDate = parseTimeOnDate(selectedDate.value, startTimeInput.value)
    const endDate = parseTimeOnDate(selectedDate.value, endTimeInput.value)

    if (!startDate || !endDate) {
      formError.value = 'Ogiltig tid. Använd format HH:mm.'
      return
    }

    const validationError = validateBookingTimeRange(startDate, endDate)
    if (validationError) {
      formError.value = validationError
      return
    }

    const startTimestamp = Timestamp.fromDate(startDate)
    const endTimestamp = Timestamp.fromDate(endDate)

    const excludeBookingId = editingBooking.value?.id
    const hasOverlap = hasBookingOverlap(
      startTimestamp,
      endTimestamp,
      [...bookingsStore.bookings, ...mockBookings.value],
      excludeBookingId
    )

    if (hasOverlap) {
      formError.value = 'Vald tid överlappar med en befintlig bokning. Välj en annan tid.'
      return
    }
    if (editingBooking.value && excludeBookingId) {
      await bookingsStore.editBooking(excludeBookingId, {
        startTime: startTimestamp,
        endTime: endTimestamp,
      })
      formSuccess.value = 'Bokning uppdaterad.'
    } else {
      await bookingsStore.addBooking({
        userId: currentUserId.value,
        startTime: startTimestamp,
        endTime: endTimestamp,
        status: 'booked',
      })
      formSuccess.value = 'Bokning skapad.'
    }

    await loadFutureBookings()

    // Keep date selected but reset time inputs
    startTimeInput.value = ''
    endTimeInput.value = ''
    editingBooking.value = null
  } catch (error) {
    console.error('Error saving booking:', error)
    formError.value = 'Ett fel uppstod vid bokningen.'
  } finally {
    isSubmittingBooking.value = false
  }
}

// Date and time selection functions
// Get next 15-minute interval from current time
function getNext15MinInterval(): string {
  const now = new Date()
  const currentMinutes = now.getMinutes()
  const roundedMinutes = Math.ceil(currentMinutes / 15) * 15
  const hours = now.getHours()
  const minutes = roundedMinutes >= 60 ? 0 : roundedMinutes
  const finalHours = roundedMinutes >= 60 ? (hours + 1) % 24 : hours

  return `${finalHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}

function formatTimeForInput(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

function parseTimeOnDate(date: Date, time: string): Date | null {
  const normalized = time.replace(/\./g, ':')
  const [hours, minutes] = normalized.split(':').map(Number)
  if (isNaN(hours) || isNaN(minutes)) return null

  const result = new Date(date)
  result.setHours(hours, minutes, 0, 0)

  if (isNaN(result.getTime())) return null
  return result
}

function autofillEndTimeFromStart() {
  if (!selectedDate.value || !startTimeInput.value) return
  const startDate = parseTimeOnDate(selectedDate.value, startTimeInput.value)
  if (!startDate) return
  const endDate = new Date(startDate)
  endDate.setMinutes(endDate.getMinutes() + preferredDuration.value)
  endTimeInput.value = formatTimeForInput(endDate)
}

function scrollToBookingForm() {
  bookingFormRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function selectDate(date: Date) {
  // Create a new date object to avoid reference issues
  const normalizedDate = new Date(date)
  normalizedDate.setHours(0, 0, 0, 0)
  selectedDate.value = normalizedDate
  showCalendar.value = false

  // Auto-fill time input with next 15-minute interval if empty
  if (!startTimeInput.value) {
    startTimeInput.value = getNext15MinInterval()
    autofillEndTimeFromStart()
  }
}

function handleDatePickerChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (target && target.value) {
    // Parse the date string and normalize it
    const dateString = target.value
    const newDate = new Date(dateString + 'T00:00:00') // Add time to avoid timezone issues
    newDate.setHours(0, 0, 0, 0)

    // Ensure date is valid
    if (!isNaN(newDate.getTime())) {
      selectedDate.value = newDate
      // Update the computed property by setting its value
      selectedDateInput.value = dateString
      showCalendar.value = false

      // Recalculate available times if we have a start time
      if (startTimeInput.value) {
        autofillEndTimeFromStart()
      }
    }
  }
}

function handleStartTimeInputChange(_newValue: string) {
  // Handle time input change from TimeAutocomplete component
  if (!editingBooking.value) {
    autofillEndTimeFromStart()
  }
}

function handleEndTimeInputChange(_newValue: string) {
  if (!_newValue) {
    formError.value = ''
  }
}
</script>
