<template>
  <div>
    <h2 class="text-2xl font-bold mb-6">Meddelande</h2>

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

    <!-- Announcement form -->
    <div v-else class="card bg-base-200 shadow-lg">
      <div class="card-body">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Enabled Toggle -->
          <div class="form-control">
            <label class="label cursor-pointer">
              <div>
                <span class="label-text font-semibold text-lg">Meddelande aktiverat</span>
                <p class="label-text-alt text-base-content/70">
                  När detta är aktiverat visas meddelandet för alla användare på startsidan
                </p>
              </div>
              <input
                type="checkbox"
                class="toggle toggle-primary"
                v-model="formData.enabled"
                :disabled="isSaving"
              />
            </label>
          </div>

          <!-- Title -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-semibold">Rubrik</span>
            </label>
            <input
              type="text"
              v-model="formData.title"
              class="input input-bordered"
              placeholder="T.ex. Viktigt meddelande"
              :disabled="isSaving"
            />
            <label class="label">
              <span class="label-text-alt text-base-content/70">
                Kort rubrik som visas överst i meddelandet
              </span>
            </label>
          </div>

          <!-- Body text -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-semibold">Meddelandetext</span>
            </label>
            <textarea
              v-model="formData.body"
              class="textarea textarea-bordered h-32"
              placeholder="Skriv ditt meddelande här..."
              :disabled="isSaving"
            ></textarea>
            <label class="label">
              <span class="label-text-alt text-base-content/70">
                Huvudtexten i meddelandet. Flera rader tillåts.
              </span>
            </label>
          </div>

          <!-- Links -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-semibold">Länkar</span>
            </label>
            <div class="space-y-3">
              <div
                v-for="(link, index) in formData.links"
                :key="index"
                class="flex gap-2 items-start"
              >
                <div class="flex-1">
                  <input
                    type="text"
                    v-model="link.label"
                    class="input input-bordered input-sm mb-2"
                    placeholder="Länktext"
                    :disabled="isSaving"
                  />
                  <input
                    type="url"
                    v-model="link.url"
                    class="input input-bordered input-sm"
                    placeholder="https://example.com"
                    :disabled="isSaving"
                  />
                </div>
                <button
                  type="button"
                  class="btn btn-ghost btn-sm btn-circle"
                  @click="removeLink(index)"
                  :disabled="isSaving"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <button
                type="button"
                class="btn btn-outline btn-sm"
                @click="addLink"
                :disabled="isSaving"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Lägg till länk
              </button>
            </div>
            <label class="label">
              <span class="label-text-alt text-base-content/70">
                Lägg till länkar som ska visas i meddelandet (valfritt)
              </span>
            </label>
          </div>

          <!-- Form actions -->
          <div class="form-control mt-6">
            <button type="submit" class="btn btn-primary" :disabled="isSaving || !hasChanges">
              <span v-if="isSaving" class="loading loading-spinner loading-sm"></span>
              <span v-else>Spara meddelande</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useAnnouncements } from '@/composables/useAnnouncements'
import type { Announcement } from '@/types/announcement'

const { announcement, isLoading, error, loadAnnouncement, saveAnnouncement } = useAnnouncements()

const formData = ref<Announcement>({
  enabled: false,
  title: '',
  body: '',
  links: [],
})

const isSaving = ref(false)
const successMessage = ref<string | null>(null)

// Check if form has changes
const hasChanges = computed(() => {
  if (!announcement.value) return false

  // Compare enabled
  if (formData.value.enabled !== announcement.value.enabled) return true

  // Compare title
  if (formData.value.title.trim() !== (announcement.value.title || '')) return true

  // Compare body
  if (formData.value.body.trim() !== (announcement.value.body || '')) return true

  // Compare links
  const formLinks = formData.value.links || []
  const announcementLinks = announcement.value.links || []

  if (formLinks.length !== announcementLinks.length) return true

  for (let i = 0; i < formLinks.length; i++) {
    if (
      formLinks[i].label.trim() !== announcementLinks[i]?.label ||
      formLinks[i].url.trim() !== announcementLinks[i]?.url
    ) {
      return true
    }
  }

  return false
})

// Watch for announcement changes and update form
function updateFormFromAnnouncement() {
  if (announcement.value) {
    formData.value = {
      enabled: announcement.value.enabled,
      title: announcement.value.title || '',
      body: announcement.value.body || '',
      links: announcement.value.links ? [...announcement.value.links] : [],
    }
  }
}

function addLink() {
  if (!formData.value.links) {
    formData.value.links = []
  }
  formData.value.links.push({ label: '', url: '' })
}

function removeLink(index: number) {
  if (formData.value.links) {
    formData.value.links.splice(index, 1)
  }
}

async function handleSubmit() {
  try {
    isSaving.value = true
    successMessage.value = null

    await saveAnnouncement({
      enabled: formData.value.enabled,
      title: formData.value.title.trim(),
      body: formData.value.body.trim(),
      links: formData.value.links?.filter(link => link.label.trim() && link.url.trim()) || [],
    })

    successMessage.value = 'Meddelande sparat'
    setTimeout(() => {
      successMessage.value = null
    }, 3000)
  } catch (err) {
    // Error is handled by the composable
    console.error('Error saving announcement:', err)
  } finally {
    isSaving.value = false
  }
}

onMounted(async () => {
  await loadAnnouncement()
  updateFormFromAnnouncement()
})

// Watch for announcement changes
watch(announcement, () => {
  updateFormFromAnnouncement()
})
</script>
