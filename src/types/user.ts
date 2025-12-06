import type { FieldValue, Timestamp } from 'firebase/firestore'

/**
 * User role type
 */
export type UserRole = 'superuser' | 'admin' | 'user'

/**
 * Sidebar state type
 */
export type SidebarState = 'expanded' | 'collapsed' | 'hover'

/**
 * UserProfile interface for writing to Firestore
 * createdAt uses FieldValue (serverTimestamp()) when creating
 */
export interface UserProfile {
  displayName: string // required, non-empty string used in the UI
  email: string // required, same as Firebase Auth email
  phone?: string // optional phone number for contacting players
  avatarUrl?: string // optional Gravatar URL for convenience
  role: UserRole // user role: 'superuser' | 'admin' | 'user'
  sidebarState?: SidebarState // user preference for sidebar state
  preferredBookingLengthMinutes?: number // preferred booking duration (60, 90, or 120 minutes)
  createdAt: FieldValue // set with serverTimestamp() on creation
}

/**
 * UserProfileRead interface for reading from Firestore
 * createdAt is a Timestamp when reading from the database
 * role is optional to handle existing users without role field (defaults to 'user')
 */
export interface UserProfileRead {
  displayName: string
  email: string
  phone?: string
  avatarUrl?: string
  role?: UserRole // optional for backward compatibility with existing users
  sidebarState?: SidebarState // user preference for sidebar state
  preferredBookingLengthMinutes?: number // preferred booking duration (60, 90, or 120 minutes)
  createdAt: Timestamp
}

export interface UserProfileUpdate {
  displayName?: string
  phone?: string
  sidebarState?: SidebarState
  preferredBookingLengthMinutes?: number
}

/**
 * Admin-only update interface for role changes
 */
export interface UserProfileAdminUpdate {
  role?: UserRole
}
