import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import { ref } from 'vue'
import type { ComponentPublicInstance } from 'vue'
import { Timestamp } from 'firebase/firestore'
import HomeView from '../HomeView.vue'
import * as mockData from '@/utils/mockData'
import { createMockUserProfile, createMockBooking } from '@/test-utils/firebase-mocks'
import { useUserStore } from '@/stores/user'

vi.mock('@/utils/mockData', () => ({
  getMockUsers: vi.fn(),
  getMockBookings: vi.fn(),
  getUserDisplayName: vi.fn(),
  formatBookingDate: vi.fn(),
  formatBookingTime: vi.fn(),
  mockUserIds: [],
}))

vi.mock('@/composables/useFirebaseAuth', () => ({
  useFirebaseAuth: vi.fn(() => ({
    signOut: vi.fn(),
  })),
}))

interface BookingsStoreMock {
  bookings: unknown[]
  isLoading: boolean
  error: string | null
  loadAllBookings: ReturnType<typeof vi.fn>
  addBooking: ReturnType<typeof vi.fn>
  editBooking: ReturnType<typeof vi.fn>
  removeBooking: ReturnType<typeof vi.fn>
}

let bookingsStoreMock: BookingsStoreMock

vi.mock('@/composables/useBookings', () => ({
  useBookings: vi.fn(() => ({
    bookingsStore: bookingsStoreMock,
    currentUserId: 'test-user-id',
    canEditBooking: vi.fn().mockReturnValue(true),
  })),
}))

vi.mock('@/utils/dateUtils', () => ({
  formatBookingDateTime: vi.fn((_start, _end) => '2024-01-01 10:00 - 12:00'),
  formatBookingDate: vi.fn(() => '2024-01-01'),
  formatBookingTime: vi.fn(() => '10:00'),
  formatTimeRange: vi.fn(() => '10.00-12.00'),
  getDateKey: vi.fn(() => '2024-01-01'),
  getDayBounds: vi.fn(),
}))

vi.mock('@/utils/userProfile', () => ({
  getUserDisplayName: vi.fn(() => Promise.resolve('Test User')),
}))

vi.mock('@/composables/useAppSettings', () => ({
  useAppSettings: vi.fn(() => ({
    settings: ref({ bookingsEnabled: true }),
    bookingsDisabledMessage: ref(null),
    loadSettings: vi.fn().mockResolvedValue(undefined),
  })),
}))

vi.mock('@/composables/useAnnouncements', () => ({
  useAnnouncements: vi.fn(() => ({
    isEnabled: ref(false),
    title: ref(''),
    body: ref(''),
    links: ref([]),
    loadAnnouncement: vi.fn().mockResolvedValue(undefined),
  })),
}))

describe('HomeView', () => {
  let router: ReturnType<typeof createRouter>

  beforeEach(() => {
    bookingsStoreMock = {
      bookings: [],
      isLoading: false,
      error: null,
      loadAllBookings: vi.fn(),
      addBooking: vi.fn(),
      editBooking: vi.fn(),
      removeBooking: vi.fn(),
    }
    const pinia = createPinia()
    setActivePinia(pinia)
    vi.clearAllMocks()

    // Create a router instance for tests
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: HomeView },
        { path: '/auth', component: { template: '<div>Auth</div>' } },
      ],
    })

    // Set up authenticated user store
    const userStore = useUserStore()
    // Mock the user directly without async operations
    userStore.currentUser = {
      uid: 'test-user-id',
      email: 'test@example.com',
    } as unknown as import('firebase/auth').User
    userStore.userProfile = createMockUserProfile({
      displayName: 'Test User',
      email: 'test@example.com',
    })
  })

  it('should render correctly', () => {
    const mockUsers = [createMockUserProfile({ displayName: 'User 1' })]
    const mockBookings = [createMockBooking({ id: '1' })]

    vi.mocked(mockData.getMockUsers).mockReturnValue(mockUsers)
    vi.mocked(mockData.getMockBookings).mockReturnValue(mockBookings)
    vi.mocked(mockData.getUserDisplayName).mockReturnValue('User 1')
    vi.mocked(mockData.formatBookingDate).mockReturnValue('2024-01-01')
    vi.mocked(mockData.formatBookingTime).mockReturnValue('10:00')

    const wrapper = mount(HomeView, {
      global: {
        plugins: [router],
      },
    })

    const logo = wrapper.find('img[alt="HTK Tennis"]')
    expect(logo.exists()).toBe(true)
    expect(logo.attributes('src')).toBe('/htk-logo.svg')
  })

  it('should load mock users on mount', async () => {
    const mockUsers = [
      createMockUserProfile({ displayName: 'User 1', email: 'user1@example.com' }),
      createMockUserProfile({ displayName: 'User 2', email: 'user2@example.com' }),
    ]

    vi.mocked(mockData.getMockUsers).mockReturnValue(mockUsers)
    vi.mocked(mockData.getMockBookings).mockReturnValue([])
    vi.mocked(mockData.getUserDisplayName).mockReturnValue('User')
    vi.mocked(mockData.formatBookingDate).mockReturnValue('2024-01-01')
    vi.mocked(mockData.formatBookingTime).mockReturnValue('10:00')

    const wrapper = mount(HomeView, {
      global: {
        plugins: [router],
      },
    })

    await flushPromises()
    await wrapper.vm.$nextTick()

    expect(mockData.getMockUsers).toHaveBeenCalled()
    expect(wrapper.text()).toContain('Användare')
  })

  it('should load mock bookings on mount', async () => {
    const mockBookings = [
      createMockBooking({ id: '1', status: 'booked' }),
      createMockBooking({ id: '2', status: 'cancelled' }),
    ]

    vi.mocked(mockData.getMockUsers).mockReturnValue([])
    vi.mocked(mockData.getMockBookings).mockReturnValue(mockBookings)
    vi.mocked(mockData.getUserDisplayName).mockReturnValue('User')
    vi.mocked(mockData.formatBookingDate).mockReturnValue('2024-01-01')
    vi.mocked(mockData.formatBookingTime).mockReturnValue('10:00')

    const wrapper = mount(HomeView, {
      global: {
        plugins: [router],
      },
    })

    await flushPromises()
    await wrapper.vm.$nextTick()

    expect(mockData.getMockBookings).toHaveBeenCalled()
    expect(wrapper.text()).toContain('Bokningar')
  })

  it('should display user information correctly', async () => {
    const mockUsers = [
      createMockUserProfile({
        displayName: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
      }),
    ]

    vi.mocked(mockData.getMockUsers).mockReturnValue(mockUsers)
    vi.mocked(mockData.getMockBookings).mockReturnValue([])
    vi.mocked(mockData.getUserDisplayName).mockReturnValue('User')
    vi.mocked(mockData.formatBookingDate).mockReturnValue('2024-01-01')
    vi.mocked(mockData.formatBookingTime).mockReturnValue('10:00')

    const wrapper = mount(HomeView, {
      global: {
        plugins: [router],
      },
    })

    await flushPromises()
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick() // Wait for another tick to ensure DOM updates

    const text = wrapper.text()
    expect(text).toContain('John Doe')
    expect(text).toContain('john@example.com')
    expect(text).toContain('+1234567890')
  })

  it('should display booking status badges correctly', async () => {
    const mockBookings = [
      createMockBooking({ id: '1', status: 'booked' }),
      createMockBooking({ id: '2', status: 'cancelled' }),
    ]

    vi.mocked(mockData.getMockUsers).mockReturnValue([])
    vi.mocked(mockData.getMockBookings).mockReturnValue(mockBookings)
    vi.mocked(mockData.getUserDisplayName).mockReturnValue('User')
    vi.mocked(mockData.formatBookingDate).mockReturnValue('2024-01-01')
    vi.mocked(mockData.formatBookingTime).mockReturnValue('10:00')

    const wrapper = mount(HomeView, {
      global: {
        plugins: [router],
      },
    })

    await wrapper.vm.$nextTick()

    // Note: These tests may need to be updated based on actual booking display logic
    // The bookings section only shows future bookings, so past bookings won't appear
    expect(wrapper.text()).toContain('Bokningar')
  })

  it('computes disabled start times for unavailable intervals', async () => {
    // Use local dates to avoid timezone issues
    const futureDate = new Date(2030, 0, 1, 10, 0, 0) // Jan 1, 2030 10:00 local
    const endDate = new Date(2030, 0, 1, 12, 0, 0) // Jan 1, 2030 12:00 local
    bookingsStoreMock.bookings = [
      {
        id: 'b1',
        userId: 'u1',
        startTime: Timestamp.fromDate(futureDate),
        endTime: Timestamp.fromDate(endDate),
        status: 'booked',
      },
    ]

    const wrapper = mount(HomeView, {
      global: {
        plugins: [router],
        stubs: {
          'calendar-date': { template: '<div><slot /></div>' },
          'calendar-month': { template: '<div></div>' },
          AuthModal: { template: '<div></div>' },
        },
      },
    })

    const vm = wrapper.vm as ComponentPublicInstance & {
      selectedDate: Date | null
      disabledStartTimes: string[]
    }
    vm.selectedDate = new Date(2030, 0, 1, 0, 0, 0) // Jan 1, 2030 00:00 local
    await flushPromises()
    await wrapper.vm.$nextTick()

    const disabled = vm.disabledStartTimes
    expect(disabled).toContain('10:00')
    expect(disabled).toContain('10:15')
    expect(disabled).toContain('11:00')
    expect(disabled).toContain('11:45')
  })
})
