import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { onAuthStateChanged } from 'firebase/auth'
import { useAuth } from '../useAuth'
import { useUserStore } from '@/stores/user'
import { createMockUser } from '@/test-utils/firebase-mocks'

// Mock Firebase Auth
vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn(),
}))

vi.mock('@/config/firebase', () => ({
  auth: {},
}))

describe('useAuth', () => {
  let unsubscribe: () => void

  beforeEach(() => {
    setActivePinia(createPinia())
    unsubscribe = vi.fn()
    vi.mocked(onAuthStateChanged).mockReturnValue(unsubscribe)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize auth listener on mount', () => {
    const TestComponent = {
      setup() {
        return useAuth()
      },
      template: '<div>Test</div>',
    }

    mount(TestComponent)

    expect(onAuthStateChanged).toHaveBeenCalled()
  })

  it('should call setUser when user signs in', async () => {
    const mockUser = createMockUser()
    const userStore = useUserStore()
    const setUserSpy = vi.spyOn(userStore, 'setUser')

    vi.mocked(onAuthStateChanged).mockImplementation((_auth, nextOrObserver) => {
      if (typeof nextOrObserver === 'function') {
        nextOrObserver(mockUser)
      }
      return unsubscribe
    })

    const TestComponent = {
      setup() {
        return useAuth()
      },
      template: '<div>Test</div>',
    }

    mount(TestComponent)

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(setUserSpy).toHaveBeenCalledWith(mockUser)
  })

  it('should call setUser with null when user signs out', async () => {
    const userStore = useUserStore()
    const setUserSpy = vi.spyOn(userStore, 'setUser')

    vi.mocked(onAuthStateChanged).mockImplementation((_auth, nextOrObserver) => {
      if (typeof nextOrObserver === 'function') {
        nextOrObserver(null)
      }
      return unsubscribe
    })

    const TestComponent = {
      setup() {
        return useAuth()
      },
      template: '<div>Test</div>',
    }

    mount(TestComponent)

    await new Promise(resolve => setTimeout(resolve, 0))

    expect(setUserSpy).toHaveBeenCalledWith(null)
  })

  it('should unsubscribe on unmount', () => {
    const TestComponent = {
      setup() {
        return useAuth()
      },
      template: '<div>Test</div>',
    }

    const wrapper = mount(TestComponent)
    wrapper.unmount()

    expect(unsubscribe).toHaveBeenCalled()
  })

  it('should handle auth errors', async () => {
    const userStore = useUserStore()
    const setUserSpy = vi.spyOn(userStore, 'setUser')
    const error = new Error('Auth error')

    vi.mocked(onAuthStateChanged).mockImplementation((_auth, _nextOrObserver, errorCallback) => {
      if (errorCallback && typeof errorCallback === 'function') {
        errorCallback(error)
      }
      return unsubscribe
    })

    const TestComponent = {
      setup() {
        return useAuth()
      },
      template: '<div>Test</div>',
    }

    mount(TestComponent)

    await new Promise(resolve => setTimeout(resolve, 0))

    expect(setUserSpy).toHaveBeenCalledWith(null)
  })

  it('should return userStore', () => {
    const TestComponent = {
      setup() {
        const { userStore } = useAuth()
        return { userStore }
      },
      template: '<div>Test</div>',
    }

    const wrapper = mount(TestComponent)
    expect(wrapper.vm.userStore).toBeDefined()
  })
})
