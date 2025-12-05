import { db } from '@/config/firebase'
import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  serverTimestamp,
  collection,
} from 'firebase/firestore'
import type { User } from 'firebase/auth'
import type {
  UserProfile,
  UserProfileRead,
  UserProfileUpdate,
  UserProfileAdminUpdate,
} from '@/types/user'
import { getGravatarUrl } from './gravatarUtils'
import { formatPhoneNumber, validatePhoneNumber } from './phoneUtils'

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
 * @param displayName - Optional display name (Spelarnamn) to use instead of deriving from user
 * @returns Created UserProfileRead
 */
export async function createUserProfileFromAuth(
  user: User,
  displayName?: string
): Promise<UserProfileRead> {
  try {
    const uid = user.uid
    const userDocRef = doc(db, USERS_COLLECTION, uid)

    // Check if profile already exists
    const existingProfile = await getCurrentUserProfile(uid)
    if (existingProfile) {
      return existingProfile
    }

    // Use provided displayName, or fall back to user.displayName, or email prefix, or 'User'
    const finalDisplayName =
      displayName?.trim() || user.displayName || user.email?.split('@')[0] || 'User'

    // Validate required fields
    if (!finalDisplayName.trim()) {
      throw new Error('Display name cannot be empty')
    }
    const email = user.email || ''
    if (!email.trim()) {
      throw new Error('Email cannot be empty')
    }

    // Generate Gravatar URL
    const avatarUrl = getGravatarUrl(email)

    // Create new profile with required fields
    // Default role is 'user' for new users
    const newProfile: UserProfile = {
      displayName: finalDisplayName,
      email,
      phone: '',
      avatarUrl,
      role: 'user',
      createdAt: serverTimestamp(),
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
      updateData.displayName = partialProfile.displayName.trim()
    }

    if (partialProfile.phone !== undefined) {
      // Format phone number if provided
      if (partialProfile.phone.trim()) {
        // Validate phone number format
        if (!validatePhoneNumber(partialProfile.phone)) {
          throw new Error(
            'Ogiltigt telefonnummer. Använd formatet +46 70 123 45 67 eller 070-123 45 67'
          )
        }
        // Format to normalized international format
        updateData.phone = formatPhoneNumber(partialProfile.phone)
      } else {
        // Empty string means clear the phone number
        updateData.phone = ''
      }
    }

    if (partialProfile.sidebarState !== undefined) {
      // Validate sidebarState value
      const validStates = ['expanded', 'collapsed', 'hover']
      if (!validStates.includes(partialProfile.sidebarState)) {
        throw new Error(`Invalid sidebarState. Must be one of: ${validStates.join(', ')}`)
      }
      updateData.sidebarState = partialProfile.sidebarState
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

/**
 * Get user display name by userId
 * @param userId - User ID
 * @returns Display name or 'Okänd användare' if not found
 */
export async function getUserDisplayName(userId: string): Promise<string> {
  try {
    const profile = await getCurrentUserProfile(userId)
    return profile?.displayName ?? 'Okänd användare'
  } catch (error) {
    console.error('Error getting user display name:', error)
    return 'Okänd användare'
  }
}

/**
 * Generate or update avatar URL based on email
 * @param email - Email address
 * @returns Gravatar URL
 */
export function generateAvatarUrl(email: string): string {
  return getGravatarUrl(email)
}

/**
 * Get all users from Firestore (admin only)
 * @returns Array of UserProfileRead with uid
 */
export async function getAllUsers(): Promise<Array<UserProfileRead & { uid: string }>> {
  try {
    const usersCollection = collection(db, USERS_COLLECTION)
    const usersSnapshot = await getDocs(usersCollection)

    const users: Array<UserProfileRead & { uid: string }> = []
    usersSnapshot.forEach(doc => {
      users.push({
        uid: doc.id,
        ...(doc.data() as UserProfileRead),
      })
    })

    return users
  } catch (error) {
    console.error('Error getting all users:', error)
    throw error
  }
}

/**
 * Update user role (admin/superuser only)
 * @param uid - Firebase Auth UID
 * @param updates - Admin update with role field
 */
export async function updateUserRole(uid: string, updates: UserProfileAdminUpdate): Promise<void> {
  try {
    if (updates.role === undefined) {
      throw new Error('Role must be provided')
    }

    // Validate role value
    const validRoles = ['user', 'admin', 'superuser']
    if (!validRoles.includes(updates.role)) {
      throw new Error(`Invalid role. Must be one of: ${validRoles.join(', ')}`)
    }

    const userDocRef = doc(db, USERS_COLLECTION, uid)

    // Check if profile exists before updating
    const existingProfile = await getCurrentUserProfile(uid)
    if (!existingProfile) {
      throw new Error('User profile does not exist.')
    }

    await updateDoc(userDocRef, { role: updates.role })
  } catch (error) {
    console.error('Error updating user role:', error)
    throw error
  }
}
