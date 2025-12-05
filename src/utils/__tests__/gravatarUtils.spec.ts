import { describe, it, expect } from 'vitest'
import { getGravatarUrl } from '../gravatarUtils'

describe('gravatarUtils', () => {
  describe('getGravatarUrl', () => {
    it('should generate Gravatar URL for email', () => {
      const url = getGravatarUrl('test@example.com')
      expect(url).toContain('gravatar.com/avatar/')
      expect(url).toContain('s=80')
      expect(url).toContain('d=mp')
    })

    it('should handle different email formats', () => {
      const url1 = getGravatarUrl('test@example.com')
      const url2 = getGravatarUrl('TEST@EXAMPLE.COM')
      const url3 = getGravatarUrl('  test@example.com  ')

      // All should generate the same URL (normalized)
      expect(url1).toBe(url2)
      expect(url1).toBe(url3)
    })

    it('should use custom size', () => {
      const url = getGravatarUrl('test@example.com', 200)
      expect(url).toContain('s=200')
    })

    it('should handle empty email', () => {
      const url = getGravatarUrl('')
      expect(url).toBeTruthy()
      expect(url).toContain('gravatar.com')
    })

    it('should generate consistent URLs for same email', () => {
      const url1 = getGravatarUrl('user@example.com')
      const url2 = getGravatarUrl('user@example.com')
      expect(url1).toBe(url2)
    })

    it('should generate different URLs for different emails', () => {
      const url1 = getGravatarUrl('user1@example.com')
      const url2 = getGravatarUrl('user2@example.com')
      expect(url1).not.toBe(url2)
    })
  })
})
