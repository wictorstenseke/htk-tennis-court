import type { Timestamp } from 'firebase/firestore'

/**
 * Format timestamp to Swedish date string
 * Format: "Mån 15 aug"
 */
export function formatBookingDate(timestamp: Timestamp): string {
  const date = timestamp.toDate()
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

  const dayName = dayNames[date.getDay()]
  const day = date.getDate()
  const month = monthNames[date.getMonth()]

  return `${dayName} ${day} ${month}`
}

/**
 * Format timestamp to Swedish time string
 * Format: "14.00"
 */
export function formatBookingTime(timestamp: Timestamp): string {
  const date = timestamp.toDate()
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}.${minutes}`
}

/**
 * Format booking for display
 * Format: "Mån 15 aug 14.00 – 16.00"
 */
export function formatBookingDateTime(startTime: Timestamp, endTime: Timestamp): string {
  const dateStr = formatBookingDate(startTime)
  const startTimeStr = formatBookingTime(startTime)
  const endTimeStr = formatBookingTime(endTime)
  return `${dateStr} ${startTimeStr} – ${endTimeStr}`
}

/**
 * Format time range for display (without date)
 * Format: "10.00-11.00"
 */
export function formatTimeRange(startTime: Timestamp, endTime: Timestamp): string {
  const startTimeStr = formatBookingTime(startTime)
  const endTimeStr = formatBookingTime(endTime)
  return `${startTimeStr}-${endTimeStr}`
}

/**
 * Get a date key for grouping bookings by day
 * Format: "YYYY-MM-DD"
 */
export function getDateKey(timestamp: Timestamp): string {
  const date = timestamp.toDate()
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Get start and end of day as Timestamps
 */
export function getDayBounds(date: Date): { start: Date; end: Date } {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)

  const end = new Date(date)
  end.setHours(23, 59, 59, 999)

  return { start, end }
}
