/**
 * Format and normalize Swedish phone numbers to international format
 */

/**
 * Format a phone number to international format (+46701234567)
 * Handles various Swedish phone formats:
 * - +46 70 123 45 67 → +46701234567
 * - 070-123 45 67 → +46701234567
 * - 0701234567 → +46701234567
 * @param phone - Phone number string (can be in various formats)
 * @returns Normalized phone number in international format, or empty string if invalid/empty
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone || typeof phone !== 'string') {
    return ''
  }

  // Remove all whitespace and dashes
  let cleaned = phone.trim().replace(/\s+/g, '').replace(/-/g, '')

  // If empty after cleaning, return empty string
  if (!cleaned) {
    return ''
  }

  // Handle Swedish numbers starting with 0 (e.g., 0701234567)
  if (cleaned.startsWith('0')) {
    // Replace leading 0 with +46
    cleaned = '+46' + cleaned.substring(1)
  }
  // If it doesn't start with +, add +46 (assuming Swedish number)
  else if (!cleaned.startsWith('+')) {
    // Check if it looks like a Swedish number (starts with 46 or 7-9 digits)
    if (cleaned.startsWith('46')) {
      cleaned = '+' + cleaned
    } else if (/^[7-9]\d{8}$/.test(cleaned)) {
      // 9 digits starting with 7-9, assume Swedish mobile
      cleaned = '+46' + cleaned
    } else {
      // Don't auto-add +46 for other formats, just return as-is with +
      cleaned = '+' + cleaned
    }
  }

  // Remove any non-digit characters except +
  cleaned = cleaned.replace(/[^\d+]/g, '')

  // Ensure it starts with +
  if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned
  }

  // Basic validation: should have + followed by digits
  if (!/^\+\d+$/.test(cleaned)) {
    return ''
  }

  return cleaned
}

/**
 * Validate phone number format
 * @param phone - Phone number string
 * @returns true if phone number is valid (or empty), false otherwise
 */
export function validatePhoneNumber(phone: string): boolean {
  if (!phone || phone.trim() === '') {
    return true // Empty is valid (optional field)
  }

  // Format the phone number
  const formatted = formatPhoneNumber(phone)

  // If formatting results in empty string, it's invalid
  if (!formatted) {
    return false
  }

  // Basic validation: should start with + and have reasonable length
  // Swedish numbers: +46XXXXXXXXX (typically 10-12 digits after +46)
  if (formatted.startsWith('+46')) {
    const digitsAfterCountryCode = formatted.substring(3)
    // Swedish mobile numbers are typically 9 digits after country code
    return digitsAfterCountryCode.length >= 7 && digitsAfterCountryCode.length <= 12
  }

  // For other international formats, just check it has reasonable length
  return formatted.length >= 8 && formatted.length <= 15
}

