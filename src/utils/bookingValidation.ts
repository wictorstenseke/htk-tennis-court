import type { Timestamp } from 'firebase/firestore'
import type { BookingRead } from '@/types/booking'

/**
 * Check if two time ranges overlap
 * @param start1 - Start time of first range
 * @param end1 - End time of first range
 * @param start2 - Start time of second range
 * @param end2 - End time of second range
 * @returns true if ranges overlap
 */
function timeRangesOverlap(
  start1: Timestamp,
  end1: Timestamp,
  start2: Timestamp,
  end2: Timestamp
): boolean {
  const start1Millis = start1.toMillis()
  const end1Millis = end1.toMillis()
  const start2Millis = start2.toMillis()
  const end2Millis = end2.toMillis()

  // Check if ranges overlap
  // Overlap occurs if:
  // - start1 is between start2 and end2, OR
  // - end1 is between start2 and end2, OR
  // - start2 is between start1 and end1, OR
  // - end2 is between start1 and end1
  return (
    (start1Millis >= start2Millis && start1Millis < end2Millis) ||
    (end1Millis > start2Millis && end1Millis <= end2Millis) ||
    (start2Millis >= start1Millis && start2Millis < end1Millis) ||
    (end2Millis > start1Millis && end2Millis <= end1Millis)
  )
}

/**
 * Check if a new booking overlaps with existing bookings
 * @param newStartTime - Start time of new booking
 * @param newEndTime - End time of new booking
 * @param existingBookings - Array of existing bookings (only "booked" status)
 * @returns true if there's an overlap
 */
export function hasBookingOverlap(
  newStartTime: Timestamp,
  newEndTime: Timestamp,
  existingBookings: BookingRead[]
): boolean {
  // Filter only booked bookings
  const bookedBookings = existingBookings.filter(b => b.status === 'booked')

  return bookedBookings.some(booking =>
    timeRangesOverlap(newStartTime, newEndTime, booking.startTime, booking.endTime)
  )
}

/**
 * Validate booking time range
 * @param startTime - Start time
 * @param endTime - End time
 * @returns Error message if invalid, null if valid
 */
export function validateBookingTimeRange(startTime: Date, endTime: Date): string | null {
  if (startTime >= endTime) {
    return 'Starttid måste vara före sluttid'
  }

  if (startTime < new Date()) {
    return 'Starttid kan inte vara i det förflutna'
  }

  return null
}
