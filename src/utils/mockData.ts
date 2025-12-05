import type { Timestamp } from 'firebase/firestore'
import { Timestamp as FirestoreTimestamp } from 'firebase/firestore'
import type { UserProfileRead } from '@/types/user'
import type { BookingRead } from '@/types/booking'

/**
 * Mock users for demonstration
 */
export const mockUsers: Omit<UserProfileRead, 'createdAt'>[] = [
  {
    displayName: 'Anna Andersson',
    email: 'anna.andersson@example.com',
    phone: '070-123 45 67',
    role: 'user',
  },
  {
    displayName: 'Björn Bergström',
    email: 'bjorn.bergstrom@example.com',
    phone: '070-234 56 78',
    role: 'admin',
  },
  {
    displayName: 'Cecilia Carlsson',
    email: 'cecilia.carlsson@example.com',
    phone: '070-345 67 89',
    role: 'user',
  },
  {
    displayName: 'David Dahl',
    email: 'david.dahl@example.com',
    phone: '070-456 78 90',
    role: 'user',
  },
  {
    displayName: 'Emma Eriksson',
    email: 'emma.eriksson@example.com',
    phone: '070-567 89 01',
    role: 'admin',
  },
]

/**
 * Generate mock user IDs (simulating Firestore document IDs)
 */
export const mockUserIds = [
  'user_anna_001',
  'user_bjorn_002',
  'user_cecilia_003',
  'user_david_004',
  'user_emma_005',
]

/**
 * Create mock users with IDs and timestamps
 */
export function getMockUsers(): UserProfileRead[] {
  const now = FirestoreTimestamp.now()
  const oneMonthAgo = FirestoreTimestamp.fromMillis(now.toMillis() - 30 * 24 * 60 * 60 * 1000)

  return mockUsers.map((user, index) => ({
    ...user,
    createdAt: FirestoreTimestamp.fromMillis(
      oneMonthAgo.toMillis() + index * 5 * 24 * 60 * 60 * 1000
    ),
  }))
}

/**
 * Create mock bookings
 */
export function getMockBookings(): BookingRead[] {
  const now = new Date()

  // Helper function to create a date with specific day offset and time
  function createDate(dayOffset: number, hours: number, minutes: number): Date {
    const date = new Date(now)
    date.setDate(date.getDate() + dayOffset)
    date.setHours(hours, minutes, 0, 0)
    return date
  }

  const bookings: BookingRead[] = [
    {
      id: 'booking_001',
      userId: mockUserIds[0], // Anna
      opponentUserId: mockUserIds[1], // Björn
      startTime: FirestoreTimestamp.fromDate(createDate(1, 10, 0)),
      endTime: FirestoreTimestamp.fromDate(createDate(1, 11, 0)),
      status: 'booked',
      createdAt: FirestoreTimestamp.fromMillis(
        FirestoreTimestamp.now().toMillis() - 2 * 24 * 60 * 60 * 1000
      ),
    },
    {
      id: 'booking_002',
      userId: mockUserIds[2], // Cecilia
      opponentUserId: mockUserIds[3], // David
      startTime: FirestoreTimestamp.fromDate(createDate(1, 14, 0)),
      endTime: FirestoreTimestamp.fromDate(createDate(1, 15, 30)),
      status: 'booked',
      createdAt: FirestoreTimestamp.fromMillis(
        FirestoreTimestamp.now().toMillis() - 1 * 24 * 60 * 60 * 1000
      ),
    },
    {
      id: 'booking_003',
      userId: mockUserIds[4], // Emma
      startTime: FirestoreTimestamp.fromDate(createDate(7, 9, 0)),
      endTime: FirestoreTimestamp.fromDate(createDate(7, 10, 0)),
      status: 'booked',
      createdAt: FirestoreTimestamp.fromMillis(
        FirestoreTimestamp.now().toMillis() - 3 * 24 * 60 * 60 * 1000
      ),
    },
    {
      id: 'booking_004',
      userId: mockUserIds[1], // Björn
      opponentUserId: mockUserIds[4], // Emma
      startTime: FirestoreTimestamp.fromDate(createDate(7, 16, 0)),
      endTime: FirestoreTimestamp.fromDate(createDate(7, 17, 0)),
      status: 'booked',
      createdAt: FirestoreTimestamp.fromMillis(
        FirestoreTimestamp.now().toMillis() - 5 * 24 * 60 * 60 * 1000
      ),
    },
    {
      id: 'booking_005',
      userId: mockUserIds[0], // Anna
      opponentUserId: mockUserIds[2], // Cecilia
      startTime: FirestoreTimestamp.fromDate(createDate(14, 11, 0)),
      endTime: FirestoreTimestamp.fromDate(createDate(14, 12, 30)),
      status: 'cancelled',
      createdAt: FirestoreTimestamp.fromMillis(
        FirestoreTimestamp.now().toMillis() - 7 * 24 * 60 * 60 * 1000
      ),
    },
  ]

  return bookings
}

/**
 * Get user display name by ID
 */
export function getUserDisplayName(userId: string): string {
  const index = mockUserIds.indexOf(userId)
  if (index !== -1) {
    return mockUsers[index].displayName
  }
  return 'Okänd användare'
}

/**
 * Format timestamp to Swedish date string
 */
export function formatBookingDate(timestamp: Timestamp): string {
  const date = timestamp.toDate()
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }
  return date.toLocaleDateString('sv-SE', options)
}

/**
 * Format timestamp to Swedish time string
 */
export function formatBookingTime(timestamp: Timestamp): string {
  const date = timestamp.toDate()
  const options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
  }
  return date.toLocaleTimeString('sv-SE', options)
}

/**
 * Format timestamp to Swedish date/time string (full format)
 */
export function formatBookingDateTime(timestamp: Timestamp): string {
  return `${formatBookingDate(timestamp)} ${formatBookingTime(timestamp)}`
}
