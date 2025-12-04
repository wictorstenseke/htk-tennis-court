<template>
  <dialog ref="modalRef" class="modal" :class="{ 'modal-open': isOpen }">
    <div class="modal-box">
      <h3 class="font-bold text-lg mb-4">Boka banan</h3>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Date picker -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">Datum</span>
          </label>
          <input
            v-model="selectedDate"
            type="date"
            class="input input-bordered w-full"
            :min="minDate"
            required
          />
        </div>

        <!-- Start time picker -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">Starttid</span>
          </label>
          <input v-model="startTime" type="time" class="input input-bordered w-full" required />
        </div>

        <!-- End time picker -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">Sluttid</span>
          </label>
          <input v-model="endTime" type="time" class="input input-bordered w-full" required />
        </div>

        <!-- Error message -->
        <div v-if="errorMessage" class="alert alert-error">
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
          <span>{{ errorMessage }}</span>
        </div>

        <!-- Actions -->
        <div class="modal-action">
          <button type="button" class="btn" @click="handleClose">Avbryt</button>
          <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
            <span v-if="isSubmitting" class="loading loading-spinner loading-sm"></span>
            <span v-else>Boka</span>
          </button>
        </div>
      </form>
    </div>
    <form method="dialog" class="modal-backdrop" @click="handleClose">
      <button>close</button>
    </form>
  </dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Timestamp } from 'firebase/firestore'
import { hasBookingOverlap, validateBookingTimeRange } from '@/utils/bookingValidation'
import type { BookingRead } from '@/types/booking'

interface Props {
  isOpen: boolean
  existingBookings: BookingRead[]
}

interface Emits {
  (e: 'close'): void
  (e: 'submit', data: { startTime: Timestamp; endTime: Timestamp }): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const modalRef = ref<HTMLDialogElement | null>(null)
const selectedDate = ref('')
const startTime = ref('')
const endTime = ref('')
const errorMessage = ref('')
const isSubmitting = ref(false)

const minDate = computed(() => {
  const today = new Date()
  return today.toISOString().split('T')[0]
})

// Reset form when modal opens
watch(
  () => props.isOpen,
  isOpen => {
    if (isOpen) {
      const today = new Date()
      selectedDate.value = today.toISOString().split('T')[0]
      startTime.value = ''
      endTime.value = ''
      errorMessage.value = ''
      isSubmitting.value = false
    }
  }
)

function handleClose() {
  emit('close')
}

async function handleSubmit() {
  errorMessage.value = ''
  isSubmitting.value = true

  try {
    // Validate inputs
    if (!selectedDate.value || !startTime.value || !endTime.value) {
      errorMessage.value = 'Vänligen fyll i alla fält'
      isSubmitting.value = false
      return
    }

    // Create Date objects
    const [startHours, startMinutes] = startTime.value.split(':').map(Number)
    const [endHours, endMinutes] = endTime.value.split(':').map(Number)

    const startDate = new Date(selectedDate.value)
    startDate.setHours(startHours, startMinutes, 0, 0)

    const endDate = new Date(selectedDate.value)
    endDate.setHours(endHours, endMinutes, 0, 0)

    // Validate time range
    const validationError = validateBookingTimeRange(startDate, endDate)
    if (validationError) {
      errorMessage.value = validationError
      isSubmitting.value = false
      return
    }

    // Convert to Firestore Timestamps
    const startTimestamp = Timestamp.fromDate(startDate)
    const endTimestamp = Timestamp.fromDate(endDate)

    // Check for overlaps
    if (hasBookingOverlap(startTimestamp, endTimestamp, props.existingBookings)) {
      errorMessage.value =
        'Vald tid överlappar med en befintlig bokning. Vänligen välj en annan tid.'
      isSubmitting.value = false
      return
    }

    // Submit booking
    emit('submit', {
      startTime: startTimestamp,
      endTime: endTimestamp,
    })

    // Reset form
    selectedDate.value = ''
    startTime.value = ''
    endTime.value = ''
    errorMessage.value = ''
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Ett fel uppstod vid bokningen'
  } finally {
    isSubmitting.value = false
  }
}
</script>
