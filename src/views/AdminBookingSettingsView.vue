<template>
  <div>
    <h2 class="text-2xl font-bold mb-6">Bokningsinställningar</h2>

    <!-- Loading state -->
    <div v-if="isLoading" class="flex justify-center py-8">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="alert alert-error mb-6">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="stroke-current shrink-0 h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span>{{ error }}</span>
    </div>

    <!-- Success message -->
    <div v-if="successMessage" class="alert alert-success mb-6">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="stroke-current shrink-0 h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span>{{ successMessage }}</span>
    </div>

    <!-- Settings form -->
    <div v-else class="card bg-base-200 shadow-lg">
      <div class="card-body">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Bookings Enabled Toggle -->
          <div class="form-control">
            <label class="label cursor-pointer">
              <div>
                <span class="label-text font-semibold text-lg">Bokningar aktiverade</span>
                <p class="label-text-alt text-base-content/70">
                  När detta är avstängt kan användare inte skapa nya bokningar
                </p>
              </div>
              <input
                type="checkbox"
                class="toggle toggle-primary"
                v-model="formData.bookingsEnabled"
                :disabled="isSaving"
              />
            </label>
          </div>

          <!-- Disabled Message (only shown when bookings are disabled) -->
          <div v-if="!formData.bookingsEnabled" class="form-control">
            <label class="label">
              <span class="label-text font-semibold">Meddelande när bokningar är avstängda</span>
            </label>
            <textarea
              v-model="formData.bookingsDisabledMessage"
              class="textarea textarea-bordered h-24"
              placeholder="Bokningar är för närvarande stängda för säsong eller underhåll."
              :disabled="isSaving"
            ></textarea>
            <label class="label">
              <span class="label-text-alt text-base-content/70">
                Detta meddelande visas för användare när bokningar är avstängda. Lämna tomt för
                standardmeddelande.
              </span>
            </label>
          </div>

          <!-- Form actions -->
          <div class="form-control mt-6">
            <button type="submit" class="btn btn-primary" :disabled="isSaving || !hasChanges">
              <span v-if="isSaving" class="loading loading-spinner loading-sm"></span>
              <span v-else>Spara inställningar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useAppSettings } from '@/composables/useAppSettings'
import type { AppSettings } from '@/types/appSettings'

const { settings, isLoading, error, loadSettings, saveSettings } = useAppSettings()

const formData = ref<AppSettings>({
  bookingsEnabled: true,
  bookingsDisabledMessage: undefined,
})

const isSaving = ref(false)
const successMessage = ref<string | null>(null)

// Check if form has changes
const hasChanges = computed(() => {
  if (!settings.value) return false
  return (
    formData.value.bookingsEnabled !== settings.value.bookingsEnabled ||
    formData.value.bookingsDisabledMessage !== settings.value.bookingsDisabledMessage
  )
})

// Watch for settings changes and update form
function updateFormFromSettings() {
  if (settings.value) {
    formData.value = {
      bookingsEnabled: settings.value.bookingsEnabled,
      bookingsDisabledMessage: settings.value.bookingsDisabledMessage,
    }
  }
}

async function handleSubmit() {
  try {
    isSaving.value = true
    successMessage.value = null

    await saveSettings({
      bookingsEnabled: formData.value.bookingsEnabled,
      bookingsDisabledMessage: formData.value.bookingsDisabledMessage?.trim() || '',
    })

    successMessage.value = 'Inställningar sparade'
    setTimeout(() => {
      successMessage.value = null
    }, 3000)
  } catch (err) {
    // Error is handled by the composable
    console.error('Error saving settings:', err)
  } finally {
    isSaving.value = false
  }
}

onMounted(async () => {
  await loadSettings()
  updateFormFromSettings()
})

// Watch for settings changes
watch(settings, () => {
  updateFormFromSettings()
})
</script>
