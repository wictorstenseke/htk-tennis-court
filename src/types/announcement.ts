/**
 * Announcement link
 */
export interface AnnouncementLink {
  label: string
  url: string
}

/**
 * Announcement stored in Firestore
 */
export interface Announcement {
  enabled: boolean
  title: string
  body: string
  links?: AnnouncementLink[]
}
