<template>
  <div class="min-h-screen bg-base-100">
    <div class="container mx-auto px-4 py-8">
      <div class="flex items-center justify-between mb-8">
        <div class="flex items-center gap-4">
          <RouterLink to="/" class="btn btn-ghost btn-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Hem
          </RouterLink>
          <h1 class="text-4xl font-bold">Min profil</h1>
        </div>

        <!-- User dropdown -->
        <UserDropdown />
      </div>

      <!-- Loading state -->
      <div v-if="userStore.isLoading" class="flex justify-center py-8">
        <span class="loading loading-spinner loading-lg"></span>
      </div>

      <!-- Error state -->
      <div v-else-if="userStore.error" class="alert alert-error mb-6">
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
        <span>{{ userStore.error }}</span>
      </div>

      <!-- Profile form -->
      <div v-else class="max-w-2xl">
        <div class="card bg-base-200 shadow-lg">
          <div class="card-body">
            <!-- Success message -->
            <div v-if="showSuccess" class="alert alert-success mb-4">
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
              <span>Profil uppdaterad!</span>
            </div>

            <!-- Form -->
            <form @submit.prevent="handleSubmit" class="space-y-4">
              <!-- Display Name (Spelarnamn) -->
              <div class="form-control">
                <label class="label">
                  <span class="label-text font-semibold">Spelarnamn</span>
                  <span class="label-text-alt text-error">*</span>
                </label>
                <input
                  v-model="formData.displayName"
                  type="text"
                  placeholder="Ditt spelarnamn"
                  class="input input-bordered w-full"
                  required
                  :disabled="isSaving"
                />
              </div>

              <!-- Email (read-only) -->
              <div class="form-control">
                <label class="label">
                  <span class="label-text font-semibold">E-postadress</span>
                </label>
                <input
                  :value="userStore.email"
                  type="email"
                  class="input input-bordered w-full !bg-base-100 cursor-not-allowed"
                  readonly
                  disabled
                />
              </div>

              <!-- Phone -->
              <div class="form-control">
                <label class="label">
                  <span class="label-text font-semibold">Telefonnummer</span>
                </label>
                <input
                  v-model="formData.phone"
                  type="tel"
                  inputmode="tel"
                  placeholder="+46 70 123 45 67 eller 070-123 45 67"
                  class="input input-bordered w-full"
                  :class="{ 'input-error': phoneError }"
                  :disabled="isSaving"
                  @blur="validatePhoneOnBlur"
                />
                <label v-if="phoneError" class="label">
                  <span class="label-text-alt text-error">{{ phoneError }}</span>
                </label>
              </div>

              <!-- Form actions -->
              <div class="form-control mt-6">
                <button type="submit" class="btn btn-primary" :disabled="isSaving || !hasChanges">
                  <span v-if="isSaving" class="loading loading-spinner loading-sm"></span>
                  <span v-else>Spara</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { validatePhoneNumber } from '@/utils/phoneUtils'
import UserDropdown from '@/components/UserDropdown.vue'

const userStore = useUserStore()

const formData = ref({
  displayName: '',
  phone: '',
})

const isSaving = ref(false)
const showSuccess = ref(false)
const phoneError = ref('')

const displayName = computed(() => userStore.displayName)

// Check if form has changes
const hasChanges = computed(() => {
  return (
    formData.value.displayName !== displayName.value ||
    formData.value.phone !== (userStore.phone || '')
  )
})

// Ensure profile is loaded on mount
onMounted(async () => {
  if (userStore.currentUser && !userStore.userProfile) {
    await userStore.loadUserProfile(userStore.currentUser.uid)
  }
})

// Watch for profile changes and update form
// This handles both initial load and subsequent updates
watch(
  () => userStore.userProfile,
  profile => {
    if (profile) {
      formData.value.displayName = profile.displayName
      formData.value.phone = profile.phone || ''
    } else {
      // Reset form if profile is cleared
      formData.value.displayName = ''
      formData.value.phone = ''
    }
  },
  { immediate: true }
)

// Validate phone number on blur
function validatePhoneOnBlur() {
  phoneError.value = ''
  if (formData.value.phone.trim() && !validatePhoneNumber(formData.value.phone)) {
    phoneError.value =
      'Ogiltigt telefonnummer. Använd formatet +46 70 123 45 67 eller 070-123 45 67'
  }
}

async function handleSubmit() {
  // Clear previous errors
  phoneError.value = ''
  userStore.clearError()
  showSuccess.value = false

  // Validate display name
  if (!formData.value.displayName.trim()) {
    return
  }

  // Validate phone if provided
  if (formData.value.phone.trim() && !validatePhoneNumber(formData.value.phone)) {
    phoneError.value =
      'Ogiltigt telefonnummer. Använd formatet +46 70 123 45 67 eller 070-123 45 67'
    return
  }

  isSaving.value = true

  try {
    await userStore.updateProfile({
      displayName: formData.value.displayName.trim(),
      phone: formData.value.phone.trim(),
    })

    // Show success message
    showSuccess.value = true
    setTimeout(() => {
      showSuccess.value = false
    }, 3000)
  } catch (err) {
    // Error is handled by the store
    console.error('Error updating profile:', err)
  } finally {
    isSaving.value = false
  }
}
</script>
