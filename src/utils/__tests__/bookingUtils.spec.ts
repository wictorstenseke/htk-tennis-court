import { describe, it, expect, beforeEach, vi } from 'vitest'
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
} from 'firebase/firestore'
import * as bookingUtils from '../bookingUtils'
import { createMockBooking, createMockTimestamp } from '@/test-utils/firebase-mocks'

// Mock Firebase Firestore
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  serverTimestamp: vi.fn(() => ({ _methodName: 'serverTimestamp' })),
}))

vi.mock('@/config/firebase', () => ({
  db: {},
}))

describe('bookingUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getBookingById', () => {
    it('should return booking when it exists', async () => {
      const bookingId = 'booking-123'
      const mockBooking = createMockBooking({ id: bookingId })
      const mockDocRef = {}
      const mockDocSnap = {
        id: bookingId,
        exists: () => true,
        data: () => ({
          userId: mockBooking.userId,
          opponentUserId: mockBooking.opponentUserId,
          startTime: mockBooking.startTime,
          endTime: mockBooking.endTime,
          status: mockBooking.status,
          createdAt: mockBooking.createdAt,
        }),
      }

      vi.mocked(doc).mockReturnValue(mockDocRef as any)
      vi.mocked(getDoc).mockResolvedValue(mockDocSnap as any)

      const result = await bookingUtils.getBookingById(bookingId)

      expect(result).toMatchObject({
        id: bookingId,
        userId: mockBooking.userId,
        status: mockBooking.status,
      })
    })

    it('should return null when booking does not exist', async () => {
      const bookingId = 'non-existent'
      const mockDocRef = {}
      const mockDocSnap = {
        exists: () => false,
      }

      vi.mocked(doc).mockReturnValue(mockDocRef as any)
      vi.mocked(getDoc).mockResolvedValue(mockDocSnap as any)

      const result = await bookingUtils.getBookingById(bookingId)

      expect(result).toBeNull()
    })
  })

  describe('getAllBookings', () => {
    it('should return all bookings', async () => {
      const mockBookings = [
        createMockBooking({ id: '1' }),
        createMockBooking({ id: '2' }),
      ]
      const mockCollectionRef = {}
      const mockQuery = {}
      const mockQuerySnapshot = {
        docs: mockBookings.map(booking => ({
          id: booking.id,
          exists: () => true,
          data: () => ({
            userId: booking.userId,
            opponentUserId: booking.opponentUserId,
            startTime: booking.startTime,
            endTime: booking.endTime,
            status: booking.status,
            createdAt: booking.createdAt,
          }),
        })),
      }

      vi.mocked(collection).mockReturnValue(mockCollectionRef as any)
      vi.mocked(query).mockReturnValue(mockQuery as any)
      vi.mocked(getDocs).mockResolvedValue(mockQuerySnapshot as any)

      const result = await bookingUtils.getAllBookings()

      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('1')
      expect(result[1].id).toBe('2')
    })
  })

  describe('createBooking', () => {
    it('should create booking successfully', async () => {
      const bookingData = {
        userId: 'user-1',
        startTime: createMockTimestamp(),
        endTime: createMockTimestamp(Date.now() / 1000 + 3600),
        status: 'booked' as const,
      }
      const createdBooking = createMockBooking({ id: 'new-id', ...bookingData })
      const mockCollectionRef = {}
      const mockDocRef = { id: 'new-id' }
      const mockDocSnap = {
        id: 'new-id',
        exists: () => true,
        data: () => ({
          userId: bookingData.userId,
          startTime: bookingData.startTime,
          endTime: bookingData.endTime,
          status: bookingData.status,
          createdAt: bookingData.startTime,
        }),
      }

      vi.mocked(collection).mockReturnValue(mockCollectionRef as any)
      vi.mocked(addDoc).mockResolvedValue(mockDocRef as any)
      vi.mocked(doc).mockReturnValue(mockDocRef as any)
      vi.mocked(getDoc).mockResolvedValue(mockDocSnap as any)

      const result = await bookingUtils.createBooking(bookingData)

      expect(result).toMatchObject({
        id: 'new-id',
        userId: bookingData.userId,
        status: bookingData.status,
      })
    })

    it('should throw error when userId is empty', async () => {
      const bookingData = {
        userId: '   ',
        startTime: createMockTimestamp(),
        endTime: createMockTimestamp(Date.now() / 1000 + 3600),
        status: 'booked' as const,
      }

      await expect(bookingUtils.createBooking(bookingData)).rejects.toThrow(
        'User ID cannot be empty'
      )
    })

    it('should throw error when startTime is after endTime', async () => {
      const bookingData = {
        userId: 'user-1',
        startTime: createMockTimestamp(Date.now() / 1000 + 3600),
        endTime: createMockTimestamp(),
        status: 'booked' as const,
      }

      await expect(bookingUtils.createBooking(bookingData)).rejects.toThrow(
        'Start time must be before end time'
      )
    })
  })

  describe('updateBooking', () => {
    it('should update booking successfully', async () => {
      const bookingId = 'booking-123'
      const existingBooking = createMockBooking({ id: bookingId })
      const updates = { status: 'cancelled' as const }
      const mockDocRef = {}
      const mockDocSnap = {
        id: bookingId,
        exists: () => true,
        data: () => ({
          userId: existingBooking.userId,
          startTime: existingBooking.startTime,
          endTime: existingBooking.endTime,
          status: existingBooking.status,
          createdAt: existingBooking.createdAt,
        }),
      }

      vi.mocked(doc).mockReturnValue(mockDocRef as any)
      vi.mocked(getDoc).mockResolvedValue(mockDocSnap as any)
      vi.mocked(updateDoc).mockResolvedValue(undefined)

      await bookingUtils.updateBooking(bookingId, updates)

      expect(updateDoc).toHaveBeenCalledWith(mockDocRef, { status: 'cancelled' })
    })

    it('should throw error when booking does not exist', async () => {
      const bookingId = 'non-existent'
      const updates = { status: 'cancelled' as const }
      const mockDocRef = {}
      const mockDocSnap = {
        exists: () => false,
      }

      vi.mocked(doc).mockReturnValue(mockDocRef as any)
      vi.mocked(getDoc).mockResolvedValue(mockDocSnap as any)

      await expect(bookingUtils.updateBooking(bookingId, updates)).rejects.toThrow(
        'Booking does not exist'
      )
    })

    it('should throw error when no valid fields to update', async () => {
      const bookingId = 'booking-123'
      const updates = {}
      const existingBooking = createMockBooking({ id: bookingId })
      const mockDocRef = {}
      const mockDocSnap = {
        id: bookingId,
        exists: () => true,
        data: () => ({
          userId: existingBooking.userId,
          startTime: existingBooking.startTime,
          endTime: existingBooking.endTime,
          status: existingBooking.status,
          createdAt: existingBooking.createdAt,
        }),
      }

      vi.mocked(doc).mockReturnValue(mockDocRef as any)
      vi.mocked(getDoc).mockResolvedValue(mockDocSnap as any)

      await expect(bookingUtils.updateBooking(bookingId, updates)).rejects.toThrow(
        'No valid fields to update'
      )
    })
  })

  describe('cancelBooking', () => {
    it('should cancel booking by calling updateBooking', async () => {
      const bookingId = 'booking-123'
      const existingBooking = createMockBooking({ id: bookingId })
      const mockDocRef = {}
      const mockDocSnap = {
        id: bookingId,
        exists: () => true,
        data: () => ({
          userId: existingBooking.userId,
          startTime: existingBooking.startTime,
          endTime: existingBooking.endTime,
          status: existingBooking.status,
          createdAt: existingBooking.createdAt,
        }),
      }

      vi.mocked(doc).mockReturnValue(mockDocRef as any)
      vi.mocked(getDoc).mockResolvedValue(mockDocSnap as any)
      vi.mocked(updateDoc).mockResolvedValue(undefined)

      await bookingUtils.cancelBooking(bookingId)

      expect(updateDoc).toHaveBeenCalledWith(mockDocRef, { status: 'cancelled' })
    })
  })

  describe('deleteBooking', () => {
    it('should delete booking successfully', async () => {
      const bookingId = 'booking-123'
      const existingBooking = createMockBooking({ id: bookingId })
      const mockDocRef = {}
      const mockDocSnap = {
        id: bookingId,
        exists: () => true,
        data: () => ({
          userId: existingBooking.userId,
          startTime: existingBooking.startTime,
          endTime: existingBooking.endTime,
          status: existingBooking.status,
          createdAt: existingBooking.createdAt,
        }),
      }

      vi.mocked(doc).mockReturnValue(mockDocRef as any)
      vi.mocked(getDoc).mockResolvedValue(mockDocSnap as any)
      vi.mocked(deleteDoc).mockResolvedValue(undefined)

      await bookingUtils.deleteBooking(bookingId)

      expect(deleteDoc).toHaveBeenCalledWith(mockDocRef)
    })

    it('should throw error when booking does not exist', async () => {
      const bookingId = 'non-existent'
      const mockDocRef = {}
      const mockDocSnap = {
        exists: () => false,
      }

      vi.mocked(doc).mockReturnValue(mockDocRef as any)
      vi.mocked(getDoc).mockResolvedValue(mockDocSnap as any)

      await expect(bookingUtils.deleteBooking(bookingId)).rejects.toThrow(
        'Booking does not exist'
      )
    })
  })
})

