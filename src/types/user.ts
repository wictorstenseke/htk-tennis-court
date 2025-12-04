import type { FieldValue, Timestamp } from 'firebase/firestore'

/**
 * UserProfile interface for writing to Firestore
 * createdAt uses FieldValue (serverTimestamp()) when creating
 */
export interface UserProfile {
  displayName: string // required, non-empty string used in the UI
  email: string // required, same as Firebase Auth email
  phone?: string // optional phone number for contacting players
  createdAt: FieldValue // set with serverTimestamp() on creation
}

/**
 * UserProfileRead interface for reading from Firestore
 * createdAt is a Timestamp when reading from the database
 */
export interface UserProfileRead {
  displayName: string
  email: string
  phone?: string
  createdAt: Timestamp
}

export interface UserProfileUpdate {
  displayName?: string
  phone?: string
}

