import { db } from '@/config/firebase'
import { doc, getDoc, setDoc, deleteField } from 'firebase/firestore'
import type { AppSettings } from '@/types/appSettings'

const APP_SETTINGS_COLLECTION = 'appSettings'
const DEFAULT_SETTINGS_DOC_ID = 'default'

/**
 * Get app settings from Firestore
 * @returns AppSettings or null if not found
 */
export async function getAppSettings(): Promise<AppSettings | null> {
  try {
    const settingsDocRef = doc(db, APP_SETTINGS_COLLECTION, DEFAULT_SETTINGS_DOC_ID)
    console.log(
      '[getAppSettings] Fetching settings from:',
      `${APP_SETTINGS_COLLECTION}/${DEFAULT_SETTINGS_DOC_ID}`
    )
    const settingsDocSnap = await getDoc(settingsDocRef)

    if (!settingsDocSnap.exists()) {
      console.log('[getAppSettings] Document does not exist, returning defaults')
      // Return default settings if document doesn't exist
      return {
        bookingsEnabled: true,
        bookingsDisabledMessage: undefined,
      }
    }

    const data = settingsDocSnap.data() as AppSettings
    console.log('[getAppSettings] Document exists, data:', data)
    return data
  } catch (error) {
    console.error('[getAppSettings] Error getting app settings:', error)
    throw error
  }
}

/**
 * Update app settings in Firestore (admin/superuser only)
 * @param settings - Partial AppSettings to update
 */
export async function updateAppSettings(settings: Partial<AppSettings>): Promise<void> {
  try {
    const settingsDocRef = doc(db, APP_SETTINGS_COLLECTION, DEFAULT_SETTINGS_DOC_ID)

    // Check if document exists
    const existingDoc = await getDoc(settingsDocRef)

    // Prepare update data, filtering out undefined values
    const updateData: Record<string, unknown> = {}

    if (settings.bookingsEnabled !== undefined) {
      updateData.bookingsEnabled = settings.bookingsEnabled
    }

    // Handle bookingsDisabledMessage
    if (settings.bookingsDisabledMessage !== undefined) {
      if (
        settings.bookingsDisabledMessage === '' ||
        settings.bookingsDisabledMessage.trim() === ''
      ) {
        // Empty string means delete the field if it exists
        if (existingDoc.exists() && 'bookingsDisabledMessage' in existingDoc.data()) {
          updateData.bookingsDisabledMessage = deleteField()
        }
      } else {
        // Set the message
        updateData.bookingsDisabledMessage = settings.bookingsDisabledMessage.trim()
      }
    }

    if (existingDoc.exists()) {
      // Update existing document
      await setDoc(settingsDocRef, updateData, { merge: true })
    } else {
      // Create new document - only include bookingsEnabled if provided, otherwise default to true
      const createData: Record<string, unknown> = {
        bookingsEnabled: settings.bookingsEnabled ?? true,
      }
      // Only include bookingsDisabledMessage if it's not empty
      if (settings.bookingsDisabledMessage && settings.bookingsDisabledMessage.trim() !== '') {
        createData.bookingsDisabledMessage = settings.bookingsDisabledMessage.trim()
      }
      await setDoc(settingsDocRef, createData)
    }
  } catch (error) {
    console.error('Error updating app settings:', error)
    throw error
  }
}
