import { db } from '@/config/firebase'
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import type { User } from 'firebase/auth'
import type { UserProfile, UserProfileRead, UserProfileUpdate } from '@/types/user'

const USERS_COLLECTION = 'users'

/**
 * Get the current user profile from Firestore
 * @param uid - Firebase Auth UID
 * @returns UserProfileRead or null if not found
 */
export async function getCurrentUserProfile(uid: string): Promise<UserProfileRead | null> {
  try {
    const userDocRef = doc(db, USERS_COLLECTION, uid)
    const userDocSnap = await getDoc(userDocRef)

    if (!userDocSnap.exists()) {
      return null
    }

    return userDocSnap.data() as UserProfileRead
  } catch (error) {
    console.error('Error getting user profile:', error)
    throw error
  }
}

/**
 * Create a user profile from Firebase Auth user on first sign-in
 * Only creates if the profile doesn't already exist
 * @param user - Firebase Auth User object
 * @returns Created UserProfileRead
 */
export async function createUserProfileFromAuth(user: User): Promise<UserProfileRead> {
  try {
    const uid = user.uid
    const userDocRef = doc(db, USERS_COLLECTION, uid)

    // Check if profile already exists
    const existingProfile = await getCurrentUserProfile(uid)
    if (existingProfile) {
      return existingProfile
    }

    // Create new profile with required fields
    const newProfile: UserProfile = {
      displayName: user.displayName || user.email?.split('@')[0] || 'User',
      email: user.email || '',
      phone: '',
      createdAt: serverTimestamp(),
    }

    // Validate required fields
    if (!newProfile.displayName.trim()) {
      throw new Error('Display name cannot be empty')
    }
    if (!newProfile.email.trim()) {
      throw new Error('Email cannot be empty')
    }

    await setDoc(userDocRef, newProfile)

    // Refetch to get the profile with server timestamp resolved
    const createdProfile = await getCurrentUserProfile(uid)
    if (!createdProfile) {
      throw new Error('Failed to retrieve created user profile')
    }

    return createdProfile
  } catch (error) {
    console.error('Error creating user profile:', error)
    throw error
  }
}

/**
 * Update user profile (only displayName and phone)
 * Never overwrites uid or createdAt
 * @param uid - Firebase Auth UID
 * @param partialProfile - Partial profile with only updatable fields
 */
export async function updateUserProfile(
  uid: string,
  partialProfile: UserProfileUpdate
): Promise<void> {
  try {
    // Validate that only allowed fields are being updated
    const updateData: Partial<UserProfile> = {}

    if (partialProfile.displayName !== undefined) {
      if (!partialProfile.displayName.trim()) {
        throw new Error('Display name cannot be empty')
      }
      updateData.displayName = partialProfile.displayName
    }

    if (partialProfile.phone !== undefined) {
      updateData.phone = partialProfile.phone
    }

    // Ensure we have at least one field to update
    if (Object.keys(updateData).length === 0) {
      throw new Error('No valid fields to update')
    }

    const userDocRef = doc(db, USERS_COLLECTION, uid)

    // Check if profile exists before updating
    const existingProfile = await getCurrentUserProfile(uid)
    if (!existingProfile) {
      throw new Error('User profile does not exist. Create it first.')
    }

    await updateDoc(userDocRef, updateData)
  } catch (error) {
    console.error('Error updating user profile:', error)
    throw error
  }
}
