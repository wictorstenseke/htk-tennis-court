import { describe, it, expect, beforeEach, vi } from 'vitest'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import type { DocumentReference, DocumentSnapshot } from 'firebase/firestore'
import * as userProfile from '../userProfile'
import { createMockUser, createMockUserProfile } from '@/test-utils/firebase-mocks'

// Helper types for Firebase mocks
type MockDocumentRef = DocumentReference
type MockDocumentSnapshot = DocumentSnapshot

// Mock Firebase Firestore
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  serverTimestamp: vi.fn(() => ({ _methodName: 'serverTimestamp' })),
}))

vi.mock('@/config/firebase', () => ({
  db: {},
}))

describe('userProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getCurrentUserProfile', () => {
    it('should return user profile when it exists', async () => {
      const uid = 'user-123'
      const mockProfile = createMockUserProfile()
      const mockDocRef = {}
      const mockDocSnap = {
        exists: () => true,
        data: () => mockProfile,
      }

      vi.mocked(doc).mockReturnValue(mockDocRef as unknown as MockDocumentRef)
      vi.mocked(getDoc).mockResolvedValue(mockDocSnap as unknown as MockDocumentSnapshot)

      const result = await userProfile.getCurrentUserProfile(uid)

      expect(result).toEqual(mockProfile)
      expect(doc).toHaveBeenCalledWith({}, 'users', uid)
      expect(getDoc).toHaveBeenCalledWith(mockDocRef)
    })

    it('should return null when profile does not exist', async () => {
      const uid = 'user-123'
      const mockDocRef = {}
      const mockDocSnap = {
        exists: () => false,
      }

      vi.mocked(doc).mockReturnValue(mockDocRef as unknown as MockDocumentRef)
      vi.mocked(getDoc).mockResolvedValue(mockDocSnap as unknown as MockDocumentSnapshot)

      const result = await userProfile.getCurrentUserProfile(uid)

      expect(result).toBeNull()
    })

    it('should throw error on failure', async () => {
      const uid = 'user-123'
      const error = new Error('Firestore error')

      vi.mocked(doc).mockReturnValue({} as unknown as MockDocumentRef)
      vi.mocked(getDoc).mockRejectedValue(error)

      await expect(userProfile.getCurrentUserProfile(uid)).rejects.toThrow(error)
    })
  })

  describe('createUserProfileFromAuth', () => {
    it('should create new profile when it does not exist', async () => {
      const mockUser = createMockUser({
        uid: 'user-123',
        email: 'test@example.com',
        displayName: 'Test User',
      })
      const mockProfile = createMockUserProfile()
      const mockDocRef = {}

      vi.mocked(doc).mockReturnValue(mockDocRef as unknown as MockDocumentRef)
      vi.mocked(getDoc)
        .mockResolvedValueOnce({ exists: () => false } as unknown as MockDocumentSnapshot) // First call - check if exists
        .mockResolvedValueOnce({
          exists: () => true,
          data: () => mockProfile,
        } as unknown as MockDocumentSnapshot) // Second call - refetch

      vi.mocked(setDoc).mockResolvedValue(undefined)

      const result = await userProfile.createUserProfileFromAuth(mockUser)

      expect(setDoc).toHaveBeenCalled()
      expect(result).toEqual(mockProfile)
    })

    it('should return existing profile if it already exists', async () => {
      const mockUser = createMockUser({ uid: 'user-123' })
      const mockProfile = createMockUserProfile()
      const mockDocRef = {}

      vi.mocked(doc).mockReturnValue(mockDocRef as unknown as MockDocumentRef)
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        data: () => mockProfile,
      } as unknown as MockDocumentSnapshot)

      const result = await userProfile.createUserProfileFromAuth(mockUser)

      expect(setDoc).not.toHaveBeenCalled()
      expect(result).toEqual(mockProfile)
    })

    it('should use email prefix as displayName when displayName is missing', async () => {
      const mockUser = createMockUser({
        uid: 'user-123',
        email: 'testuser@example.com',
        displayName: null,
      })
      const mockDocRef = {}
      const mockProfile = createMockUserProfile({ displayName: 'testuser' })

      vi.mocked(doc).mockReturnValue(mockDocRef as unknown as MockDocumentRef)
      vi.mocked(getDoc)
        .mockResolvedValueOnce({ exists: () => false } as unknown as MockDocumentSnapshot)
        .mockResolvedValueOnce({
          exists: () => true,
          data: () => mockProfile,
        } as unknown as MockDocumentSnapshot)

      vi.mocked(setDoc).mockResolvedValue(undefined)

      await userProfile.createUserProfileFromAuth(mockUser)

      expect(setDoc).toHaveBeenCalled()
      const callArgs = vi.mocked(setDoc).mock.calls[0]
      expect(callArgs[1]).toMatchObject({
        displayName: 'testuser',
        email: 'testuser@example.com',
      })
    })
  })

  describe('updateUserProfile', () => {
    it('should update profile successfully', async () => {
      const uid = 'user-123'
      const existingProfile = createMockUserProfile()
      const updates = { displayName: 'Updated Name' }
      const mockDocRef = {}

      vi.mocked(doc).mockReturnValue(mockDocRef as unknown as MockDocumentRef)
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        data: () => existingProfile,
      } as unknown as MockDocumentSnapshot)
      vi.mocked(updateDoc).mockResolvedValue(undefined)

      await userProfile.updateUserProfile(uid, updates)

      expect(updateDoc).toHaveBeenCalledWith(mockDocRef, { displayName: 'Updated Name' })
    })

    it('should throw error when profile does not exist', async () => {
      const uid = 'user-123'
      const updates = { displayName: 'Updated Name' }
      const mockDocRef = {}

      vi.mocked(doc).mockReturnValue(mockDocRef as unknown as MockDocumentRef)
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false,
      } as unknown as MockDocumentSnapshot)

      await expect(userProfile.updateUserProfile(uid, updates)).rejects.toThrow(
        'User profile does not exist'
      )
    })

    it('should throw error when displayName is empty', async () => {
      const uid = 'user-123'
      const updates = { displayName: '   ' }
      const existingProfile = createMockUserProfile()
      const mockDocRef = {}

      vi.mocked(doc).mockReturnValue(mockDocRef as unknown as MockDocumentRef)
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        data: () => existingProfile,
      } as unknown as MockDocumentSnapshot)

      await expect(userProfile.updateUserProfile(uid, updates)).rejects.toThrow(
        'Display name cannot be empty'
      )
    })

    it('should throw error when no valid fields to update', async () => {
      const uid = 'user-123'
      const updates = {}
      const existingProfile = createMockUserProfile()
      const mockDocRef = {}

      vi.mocked(doc).mockReturnValue(mockDocRef as unknown as MockDocumentRef)
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        data: () => existingProfile,
      } as unknown as MockDocumentSnapshot)

      await expect(userProfile.updateUserProfile(uid, updates)).rejects.toThrow(
        'No valid fields to update'
      )
    })
  })
})
