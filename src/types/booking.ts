import type { FieldValue, Timestamp } from 'firebase/firestore'

/**
 * Booking status type
 */
export type BookingStatus = 'booked' | 'cancelled'

/**
 * Booking interface for writing to Firestore
 * createdAt uses FieldValue (serverTimestamp()) when creating
 * startTime and endTime use Timestamp when writing
 */
export interface Booking {
  userId: string // player who created the booking
  opponentUserId?: string // optional opponent (must have an account)
  startTime: Timestamp // Firestore Timestamp in the DB
  endTime: Timestamp // Firestore Timestamp in the DB
  status: BookingStatus // "booked" or "cancelled"
  createdAt: FieldValue // set with serverTimestamp() on creation
}

/**
 * BookingRead interface for reading from Firestore
 * createdAt, startTime, and endTime are Timestamps when reading from the database
 */
export interface BookingRead {
  id: string // document ID
  userId: string
  opponentUserId?: string
  startTime: Timestamp
  endTime: Timestamp
  status: BookingStatus
  createdAt: Timestamp
}

/**
 * BookingCreate interface for creating a new booking
 * Excludes createdAt as it's set server-side
 */
export interface BookingCreate {
  userId: string
  opponentUserId?: string
  startTime: Timestamp
  endTime: Timestamp
  status: BookingStatus
}

/**
 * BookingUpdate interface for updating a booking
 * Allows updating status, opponentUserId, startTime, and endTime
 */
export interface BookingUpdate {
  status?: BookingStatus
  opponentUserId?: string
  startTime?: Timestamp
  endTime?: Timestamp
}
