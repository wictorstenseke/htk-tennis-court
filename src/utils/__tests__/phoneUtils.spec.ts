import { describe, it, expect } from 'vitest'
import { formatPhoneNumber, validatePhoneNumber } from '../phoneUtils'

describe('phoneUtils', () => {
  describe('formatPhoneNumber', () => {
    it('should format Swedish number with +46 prefix', () => {
      expect(formatPhoneNumber('+46 70 123 45 67')).toBe('+46701234567')
    })

    it('should format Swedish number starting with 0', () => {
      expect(formatPhoneNumber('070-123 45 67')).toBe('+46701234567')
    })

    it('should format Swedish number without spaces', () => {
      expect(formatPhoneNumber('0701234567')).toBe('+46701234567')
    })

    it('should handle number starting with 46', () => {
      expect(formatPhoneNumber('46701234567')).toBe('+46701234567')
    })

    it('should return empty string for empty input', () => {
      expect(formatPhoneNumber('')).toBe('')
      expect(formatPhoneNumber('   ')).toBe('')
    })

    it('should handle numbers with dashes', () => {
      expect(formatPhoneNumber('070-123-45-67')).toBe('+46701234567')
    })

    it('should preserve international format', () => {
      expect(formatPhoneNumber('+46701234567')).toBe('+46701234567')
    })
  })

  describe('validatePhoneNumber', () => {
    it('should validate Swedish mobile numbers', () => {
      expect(validatePhoneNumber('+46701234567')).toBe(true)
      expect(validatePhoneNumber('070-123 45 67')).toBe(true)
      expect(validatePhoneNumber('0701234567')).toBe(true)
    })

    it('should accept empty string (optional field)', () => {
      expect(validatePhoneNumber('')).toBe(true)
      expect(validatePhoneNumber('   ')).toBe(true)
    })

    it('should reject invalid formats', () => {
      expect(validatePhoneNumber('abc')).toBe(false)
      expect(validatePhoneNumber('123')).toBe(false)
      expect(validatePhoneNumber('+')).toBe(false)
    })

    it('should validate formatted numbers', () => {
      const formatted = formatPhoneNumber('070-123 45 67')
      expect(validatePhoneNumber(formatted)).toBe(true)
    })
  })
})
