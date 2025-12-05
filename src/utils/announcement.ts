import { db } from '@/config/firebase'
import { doc, getDoc, setDoc, deleteField } from 'firebase/firestore'
import type { Announcement } from '@/types/announcement'

const ANNOUNCEMENT_COLLECTION = 'announcements'
const MAIN_ANNOUNCEMENT_DOC_ID = 'main'

/**
 * Get announcement from Firestore
 * @returns Announcement or null if not found
 */
export async function getAnnouncement(): Promise<Announcement | null> {
  try {
    const announcementDocRef = doc(db, ANNOUNCEMENT_COLLECTION, MAIN_ANNOUNCEMENT_DOC_ID)
    const announcementDocSnap = await getDoc(announcementDocRef)

    if (!announcementDocSnap.exists()) {
      // Return default announcement if document doesn't exist
      return {
        enabled: false,
        title: '',
        body: '',
        links: [],
      }
    }

    const data = announcementDocSnap.data() as Announcement
    return data
  } catch (error) {
    console.error('[getAnnouncement] Error getting announcement:', error)
    throw error
  }
}

/**
 * Update announcement in Firestore (admin/superuser only)
 * @param announcement - Partial Announcement to update
 */
export async function updateAnnouncement(announcement: Partial<Announcement>): Promise<void> {
  try {
    const announcementDocRef = doc(db, ANNOUNCEMENT_COLLECTION, MAIN_ANNOUNCEMENT_DOC_ID)

    // Check if document exists
    const existingDoc = await getDoc(announcementDocRef)

    // Prepare update data, filtering out undefined values
    const updateData: Record<string, unknown> = {}

    if (announcement.enabled !== undefined) {
      updateData.enabled = announcement.enabled
    }

    if (announcement.title !== undefined) {
      updateData.title = announcement.title.trim()
    }

    if (announcement.body !== undefined) {
      updateData.body = announcement.body.trim()
    }

    // Handle links
    if (announcement.links !== undefined) {
      // Filter out empty links and validate URLs
      const validLinks = announcement.links
        .filter(link => link.label.trim() && link.url.trim())
        .map(link => ({
          label: link.label.trim(),
          url: link.url.trim(),
        }))

      if (validLinks.length === 0) {
        // If no valid links, delete the field if it exists
        if (existingDoc.exists() && 'links' in existingDoc.data()) {
          updateData.links = deleteField()
        }
      } else {
        updateData.links = validLinks
      }
    }

    if (existingDoc.exists()) {
      // Update existing document
      await setDoc(announcementDocRef, updateData, { merge: true })
    } else {
      // Create new document with defaults
      const createData: Record<string, unknown> = {
        enabled: announcement.enabled ?? false,
        title: announcement.title?.trim() ?? '',
        body: announcement.body?.trim() ?? '',
      }

      // Only include links if they exist and are valid
      if (announcement.links && announcement.links.length > 0) {
        const validLinks = announcement.links
          .filter(link => link.label.trim() && link.url.trim())
          .map(link => ({
            label: link.label.trim(),
            url: link.url.trim(),
          }))
        if (validLinks.length > 0) {
          createData.links = validLinks
        }
      }

      await setDoc(announcementDocRef, createData)
    }
  } catch (error) {
    console.error('Error updating announcement:', error)
    throw error
  }
}
