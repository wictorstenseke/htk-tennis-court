import { db } from '@/config/firebase'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  type DocumentSnapshot,
  type QueryConstraint,
} from 'firebase/firestore'
import type { Booking, BookingRead, BookingCreate, BookingUpdate } from '@/types/booking'

const BOOKINGS_COLLECTION = 'bookings'

/**
 * Convert a Firestore document snapshot to BookingRead
 */
function snapshotToBookingRead(docSnap: DocumentSnapshot): BookingRead | null {
  if (!docSnap.exists()) {
    return null
  }

  const data = docSnap.data()
  return {
    id: docSnap.id,
    userId: data.userId,
    opponentUserId: data.opponentUserId,
    startTime: data.startTime,
    endTime: data.endTime,
    status: data.status,
    createdAt: data.createdAt,
  }
}

/**
 * Get a single booking by ID
 * @param bookingId - Booking document ID
 * @returns BookingRead or null if not found
 */
export async function getBookingById(bookingId: string): Promise<BookingRead | null> {
  try {
    const bookingDocRef = doc(db, BOOKINGS_COLLECTION, bookingId)
    const bookingDocSnap = await getDoc(bookingDocRef)
    return snapshotToBookingRead(bookingDocSnap)
  } catch (error) {
    console.error('Error getting booking:', error)
    throw error
  }
}

/**
 * Get all bookings (for public schedule)
 * @param constraints - Optional query constraints (e.g., date range, status)
 * @returns Array of BookingRead
 */
export async function getAllBookings(constraints: QueryConstraint[] = []): Promise<BookingRead[]> {
  try {
    const bookingsRef = collection(db, BOOKINGS_COLLECTION)
    const q = query(bookingsRef, ...constraints)
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs
      .map(docSnap => snapshotToBookingRead(docSnap))
      .filter((booking): booking is BookingRead => booking !== null)
  } catch (error) {
    console.error('Error getting all bookings:', error)
    throw error
  }
}

/**
 * Get bookings for a specific user
 * @param userId - User ID
 * @param constraints - Optional query constraints
 * @returns Array of BookingRead
 */
export async function getUserBookings(
  userId: string,
  constraints: QueryConstraint[] = []
): Promise<BookingRead[]> {
  try {
    const bookingsRef = collection(db, BOOKINGS_COLLECTION)
    const q = query(bookingsRef, where('userId', '==', userId), ...constraints)
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs
      .map(docSnap => snapshotToBookingRead(docSnap))
      .filter((booking): booking is BookingRead => booking !== null)
  } catch (error) {
    console.error('Error getting user bookings:', error)
    throw error
  }
}

/**
 * Get bookings where user is involved (as creator or opponent)
 * @param userId - User ID
 * @param constraints - Optional query constraints
 * @returns Array of BookingRead
 */
export async function getInvolvedBookings(
  userId: string,
  constraints: QueryConstraint[] = []
): Promise<BookingRead[]> {
  try {
    const bookingsRef = collection(db, BOOKINGS_COLLECTION)

    // Query for bookings where user is the creator
    const creatorQuery = query(bookingsRef, where('userId', '==', userId), ...constraints)

    // Query for bookings where user is the opponent
    const opponentQuery = query(bookingsRef, where('opponentUserId', '==', userId), ...constraints)

    const [creatorSnapshot, opponentSnapshot] = await Promise.all([
      getDocs(creatorQuery),
      getDocs(opponentQuery),
    ])

    // Combine and deduplicate results
    const allBookings = new Map<string, BookingRead>()

    creatorSnapshot.docs.forEach(docSnap => {
      const booking = snapshotToBookingRead(docSnap)
      if (booking) {
        allBookings.set(booking.id, booking)
      }
    })

    opponentSnapshot.docs.forEach(docSnap => {
      const booking = snapshotToBookingRead(docSnap)
      if (booking) {
        allBookings.set(booking.id, booking)
      }
    })

    return Array.from(allBookings.values())
  } catch (error) {
    console.error('Error getting involved bookings:', error)
    throw error
  }
}

/**
 * Create a new booking
 * @param bookingData - BookingCreate data
 * @returns Created BookingRead
 */
export async function createBooking(bookingData: BookingCreate): Promise<BookingRead> {
  try {
    // Validate required fields
    if (!bookingData.userId.trim()) {
      throw new Error('User ID cannot be empty')
    }
    if (!bookingData.startTime || !bookingData.endTime) {
      throw new Error('Start time and end time are required')
    }
    if (bookingData.startTime >= bookingData.endTime) {
      throw new Error('Start time must be before end time')
    }
    if (!bookingData.status) {
      throw new Error('Status is required')
    }

    const bookingsRef = collection(db, BOOKINGS_COLLECTION)

    // Build booking object without undefined fields
    // Use object spread to conditionally include opponentUserId only if it exists
    const newBooking = {
      userId: bookingData.userId,
      startTime: bookingData.startTime,
      endTime: bookingData.endTime,
      status: bookingData.status,
      createdAt: serverTimestamp(),
      ...(bookingData.opponentUserId && bookingData.opponentUserId.trim()
        ? { opponentUserId: bookingData.opponentUserId }
        : {}),
    }

    const docRef = await addDoc(bookingsRef, newBooking)

    // Refetch to get the booking with server timestamp resolved
    const createdBooking = await getBookingById(docRef.id)
    if (!createdBooking) {
      throw new Error('Failed to retrieve created booking')
    }

    return createdBooking
  } catch (error) {
    console.error('Error creating booking:', error)
    throw error
  }
}

/**
 * Update a booking (only status and opponentUserId)
 * @param bookingId - Booking document ID
 * @param updates - BookingUpdate data
 */
export async function updateBooking(bookingId: string, updates: BookingUpdate): Promise<void> {
  try {
    // Validate that only allowed fields are being updated
    const updateData: Partial<Booking> = {}

    if (updates.status !== undefined) {
      if (updates.status !== 'booked' && updates.status !== 'cancelled') {
        throw new Error('Invalid status value')
      }
      updateData.status = updates.status
    }

    if (updates.opponentUserId !== undefined) {
      updateData.opponentUserId = updates.opponentUserId || undefined
    }

    // Ensure we have at least one field to update
    if (Object.keys(updateData).length === 0) {
      throw new Error('No valid fields to update')
    }

    const bookingDocRef = doc(db, BOOKINGS_COLLECTION, bookingId)

    // Check if booking exists before updating
    const existingBooking = await getBookingById(bookingId)
    if (!existingBooking) {
      throw new Error('Booking does not exist')
    }

    await updateDoc(bookingDocRef, updateData)
  } catch (error) {
    console.error('Error updating booking:', error)
    throw error
  }
}

/**
 * Cancel a booking (sets status to 'cancelled')
 * @param bookingId - Booking document ID
 */
export async function cancelBooking(bookingId: string): Promise<void> {
  await updateBooking(bookingId, { status: 'cancelled' })
}

/**
 * Delete a booking
 * @param bookingId - Booking document ID
 */
export async function deleteBooking(bookingId: string): Promise<void> {
  try {
    const bookingDocRef = doc(db, BOOKINGS_COLLECTION, bookingId)

    // Check if booking exists before deleting
    const existingBooking = await getBookingById(bookingId)
    if (!existingBooking) {
      throw new Error('Booking does not exist')
    }

    await deleteDoc(bookingDocRef)
  } catch (error) {
    console.error('Error deleting booking:', error)
    throw error
  }
}
