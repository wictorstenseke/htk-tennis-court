import { vi } from 'vitest'
import type { User } from 'firebase/auth'
import type { Timestamp } from 'firebase/firestore'
import { Timestamp as FirestoreTimestamp } from 'firebase/firestore'
import type { BookingRead } from '@/types/booking'
import type { UserProfileRead } from '@/types/user'

/**
 * Create a mock Firebase Auth User
 */
export function createMockUser(overrides?: Partial<User>): User {
  return {
    uid: 'test-user-id',
    email: 'test@example.com',
    displayName: 'Test User',
    emailVerified: true,
    isAnonymous: false,
    metadata: {
      creationTime: '2024-01-01T00:00:00Z',
      lastSignInTime: '2024-01-01T00:00:00Z',
    },
    providerData: [],
    refreshToken: 'mock-refresh-token',
    tenantId: null,
    delete: vi.fn(),
    getIdToken: vi.fn().mockResolvedValue('mock-id-token'),
    getIdTokenResult: vi.fn(),
    reload: vi.fn(),
    toJSON: vi.fn(),
    ...overrides,
  } as User
}

/**
 * Create a mock Timestamp
 */
export function createMockTimestamp(seconds = Date.now() / 1000): Timestamp {
  return FirestoreTimestamp.fromMillis(seconds * 1000)
}

/**
 * Create a mock BookingRead
 */
export function createMockBooking(overrides?: Partial<BookingRead>): BookingRead {
  const now = Date.now()
  const startTime = createMockTimestamp(now / 1000)
  const endTime = createMockTimestamp((now + 3600000) / 1000) // 1 hour later

  return {
    id: 'booking-1',
    userId: 'user-1',
    opponentUserId: undefined,
    startTime,
    endTime,
    status: 'booked',
    createdAt: startTime,
    ...overrides,
  }
}

/**
 * Create a mock UserProfileRead
 */
export function createMockUserProfile(overrides?: Partial<UserProfileRead>): UserProfileRead {
  return {
    displayName: 'Test User',
    email: 'test@example.com',
    phone: '+1234567890',
    createdAt: createMockTimestamp(),
    ...overrides,
  }
}

