import { ref, computed } from 'vue'
import { getAnnouncement, updateAnnouncement } from '@/utils/announcement'
import type { Announcement } from '@/types/announcement'

const announcement = ref<Announcement | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)

/**
 * Composable for announcements
 */
export function useAnnouncements() {
  const isEnabled = computed(() => announcement.value?.enabled ?? false)
  const title = computed(() => announcement.value?.title ?? '')
  const body = computed(() => announcement.value?.body ?? '')
  const links = computed(() => announcement.value?.links ?? [])

  async function loadAnnouncement() {
    try {
      isLoading.value = true
      error.value = null
      const loadedAnnouncement = await getAnnouncement()
      announcement.value = loadedAnnouncement
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Kunde inte ladda meddelande'
      console.error('[useAnnouncements] Error loading announcement:', err)
      // Set default announcement on error
      announcement.value = {
        enabled: false,
        title: '',
        body: '',
        links: [],
      }
    } finally {
      isLoading.value = false
    }
  }

  async function saveAnnouncement(updates: Partial<Announcement>) {
    try {
      isLoading.value = true
      error.value = null

      await updateAnnouncement(updates)

      // Reload announcement to get updated data
      await loadAnnouncement()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Kunde inte spara meddelande'
      console.error('Error saving announcement:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    announcement,
    isLoading,
    error,
    isEnabled,
    title,
    body,
    links,
    loadAnnouncement,
    saveAnnouncement,
  }
}
