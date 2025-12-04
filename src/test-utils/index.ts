import { beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { vi } from 'vitest'

// Set up Pinia for all tests
beforeEach(() => {
  setActivePinia(createPinia())
})

// Mock Firebase modules
vi.mock('@/config/firebase', () => ({
  auth: {},
  db: {},
}))

// Export test utilities
export * from './firebase-mocks'
