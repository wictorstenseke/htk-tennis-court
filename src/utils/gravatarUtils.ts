/**
 * Gravatar utility functions for generating avatar URLs from email addresses
 */
import CryptoJS from 'crypto-js'

/**
 * Get Gravatar URL for an email address
 * Uses crypto-js for MD5 hashing
 * @param email - Email address
 * @param size - Optional size in pixels (default: 80)
 * @returns Gravatar URL
 */
export function getGravatarUrl(email: string, size: number = 80): string {
  if (!email || typeof email !== 'string') {
    return getDefaultGravatarUrl(size)
  }

  // Trim and lowercase email as per Gravatar spec
  const normalizedEmail = email.trim().toLowerCase()

  // Generate MD5 hash using crypto-js
  const hash = CryptoJS.MD5(normalizedEmail).toString()

  // Return Gravatar URL with default parameter (mp = mystery person)
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=mp`
}

/**
 * Get default Gravatar URL (fallback)
 * @param size - Size in pixels
 * @returns Default Gravatar URL
 */
function getDefaultGravatarUrl(size: number = 80): string {
  return `https://www.gravatar.com/avatar/00000000000000000000000000000000?s=${size}&d=mp`
}
