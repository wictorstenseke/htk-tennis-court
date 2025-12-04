import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import HomeView from '../HomeView.vue'
import * as mockData from '@/utils/mockData'
import { createMockUserProfile, createMockBooking } from '@/test-utils/firebase-mocks'

vi.mock('@/utils/mockData', () => ({
  getMockUsers: vi.fn(),
  getMockBookings: vi.fn(),
  getUserDisplayName: vi.fn(),
  formatBookingDate: vi.fn(),
  formatBookingTime: vi.fn(),
}))

describe('HomeView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('should render correctly', () => {
    const mockUsers = [createMockUserProfile({ displayName: 'User 1' })]
    const mockBookings = [createMockBooking({ id: '1' })]

    vi.mocked(mockData.getMockUsers).mockReturnValue(mockUsers)
    vi.mocked(mockData.getMockBookings).mockReturnValue(mockBookings)
    vi.mocked(mockData.getUserDisplayName).mockReturnValue('User 1')
    vi.mocked(mockData.formatBookingDate).mockReturnValue('2024-01-01')
    vi.mocked(mockData.formatBookingTime).mockReturnValue('10:00')

    const wrapper = mount(HomeView)

    expect(wrapper.text()).toContain('HTK Tennis')
    expect(wrapper.text()).toContain('Välkommen till HTK Tennis v2')
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

    const wrapper = mount(HomeView)

    await wrapper.vm.$nextTick()

    expect(mockData.getMockUsers).toHaveBeenCalled()
    expect(wrapper.text()).toContain('Användare (Mock Data)')
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

    const wrapper = mount(HomeView)

    await wrapper.vm.$nextTick()

    expect(mockData.getMockBookings).toHaveBeenCalled()
    expect(wrapper.text()).toContain('Bokningar (Mock Data)')
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

    const wrapper = mount(HomeView)

    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('John Doe')
    expect(wrapper.text()).toContain('john@example.com')
    expect(wrapper.text()).toContain('+1234567890')
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

    const wrapper = mount(HomeView)

    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Bokad')
    expect(wrapper.text()).toContain('Avbokad')
  })
})
