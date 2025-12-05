import { ref, computed } from 'vue'
import { getAppSettings, updateAppSettings } from '@/utils/appSettings'
import type { AppSettings } from '@/types/appSettings'

const settings = ref<AppSettings | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)

/**
 * Composable for app settings
 */
export function useAppSettings() {
  const bookingsEnabled = computed(() => settings.value?.bookingsEnabled ?? true)
  const bookingsDisabledMessage = computed(() => settings.value?.bookingsDisabledMessage)

  async function loadSettings() {
    try {
      isLoading.value = true
      error.value = null
      const loadedSettings = await getAppSettings()
      console.log('[useAppSettings] Settings loaded from Firestore:', loadedSettings)
      settings.value = loadedSettings
      console.log('[useAppSettings] Settings value after assignment:', settings.value)
      console.log('[useAppSettings] bookingsEnabled computed:', bookingsEnabled.value)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Kunde inte ladda inställningar'
      console.error('[useAppSettings] Error loading app settings:', err)
      // Set default settings on error
      settings.value = {
        bookingsEnabled: true,
        bookingsDisabledMessage: undefined,
      }
    } finally {
      isLoading.value = false
    }
  }

  async function saveSettings(updates: Partial<AppSettings>) {
    try {
      isLoading.value = true
      error.value = null

      await updateAppSettings(updates)

      // Reload settings to get updated data
      await loadSettings()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Kunde inte spara inställningar'
      console.error('Error saving app settings:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    settings,
    isLoading,
    error,
    bookingsEnabled,
    bookingsDisabledMessage,
    loadSettings,
    saveSettings,
  }
}
