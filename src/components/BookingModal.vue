<template>
  <dialog class="modal" :class="{ 'modal-open': isOpen }">
    <div class="modal-box max-w-md">
      <!-- Header -->
      <h3 class="font-bold text-lg mb-4">{{ isEditMode ? 'Redigera bokning' : 'Boka banan' }}</h3>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Date picker -->
        <div class="form-control w-full">
          <label class="label py-1">
            <span class="label-text font-medium">Datum</span>
          </label>
          <calendar-date
            :value="selectedDate"
            class="cally w-full booking-calendar no-today-highlight"
            :min="minDate"
            :today="pastDate"
            required
            @change="handleDateChange"
          >
            <calendar-month></calendar-month>
          </calendar-date>
        </div>

        <!-- Time pickers in a grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <!-- Start time picker -->
          <TimeAutocomplete
            v-model="startTime"
            label="Starttid"
            placeholder="Välj starttid"
            required
            @update:model-value="handleStartTimeChange"
          />

          <!-- End time picker -->
          <TimeAutocomplete v-model="endTime" label="Sluttid" placeholder="Välj sluttid" required />
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
        <div class="modal-action mt-4">
          <button type="button" class="btn btn-ghost" @click="handleClose">Avbryt</button>
          <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
            <span v-if="isSubmitting" class="loading loading-spinner loading-sm"></span>
            <span v-else>{{ isEditMode ? 'Uppdatera' : 'Boka' }}</span>
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
import { useAppSettings } from '@/composables/useAppSettings'
import type { BookingRead } from '@/types/booking'
import TimeAutocomplete from './TimeAutocomplete.vue'

interface Props {
  isOpen: boolean
  existingBookings: BookingRead[]
  editingBooking?: BookingRead | null
  initialDate?: Date | null
  initialStartTime?: Date | null
  initialEndTime?: Date | null
}

interface Emits {
  (e: 'close'): void
  (e: 'submit', data: { startTime: Timestamp; endTime: Timestamp; bookingId?: string }): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { settings } = useAppSettings()

const selectedDate = ref<string>('')
const startTime = ref<string>('')
const endTime = ref<string>('')
const errorMessage = ref('')
const isSubmitting = ref(false)

const isEditMode = computed(() => !!props.editingBooking)

const minDate = computed(() => {
  const today = new Date()
  return today.toISOString().split('T')[0]
})

// Set today to a past date to prevent highlighting current date
const pastDate = '2000-01-01'

// Format time for input (HH:mm)
function formatTimeForInput(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

// Reset form when modal opens
watch(
  () => props.isOpen,
  isOpen => {
    if (isOpen) {
      if (props.editingBooking) {
        // Prefill form with editing booking data
        const startDate = props.editingBooking.startTime.toDate()
        const endDate = props.editingBooking.endTime.toDate()

        selectedDate.value = startDate.toISOString().split('T')[0]
        startTime.value = formatTimeForInput(startDate)
        endTime.value = formatTimeForInput(endDate)
      } else if (props.initialDate && props.initialStartTime) {
        // Prefill form with initial values (from time slot selection)
        // Format date as YYYY-MM-DD without timezone issues
        const year = props.initialDate.getFullYear()
        const month = String(props.initialDate.getMonth() + 1).padStart(2, '0')
        const day = String(props.initialDate.getDate()).padStart(2, '0')
        selectedDate.value = `${year}-${month}-${day}`
        startTime.value = formatTimeForInput(props.initialStartTime)
        if (props.initialEndTime) {
          endTime.value = formatTimeForInput(props.initialEndTime)
        } else {
          // Auto-calculate end time by adding 2 hours
          const endDate = new Date(props.initialStartTime)
          endDate.setHours(endDate.getHours() + 2)
          endTime.value = formatTimeForInput(endDate)
        }
      } else {
        // Reset form for new booking
        const today = new Date()
        selectedDate.value = today.toISOString().split('T')[0]
        startTime.value = ''
        endTime.value = ''
      }
      errorMessage.value = ''
      isSubmitting.value = false
    }
  }
)

function handleClose() {
  emit('close')
}

function handleDateChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (target && target.value) {
    selectedDate.value = target.value
  }
}

function handleStartTimeChange(newStartTime: string) {
  // Auto-fill end time when start time changes (only for new bookings, not editing)
  if (!props.editingBooking && newStartTime && selectedDate.value) {
    try {
      const [hours, minutes] = newStartTime.split(':').map(Number)
      const startDate = new Date(selectedDate.value)
      startDate.setHours(hours, minutes, 0, 0)

      // Calculate end time by adding 2 hours (120 minutes)
      const endDate = new Date(startDate)
      endDate.setHours(endDate.getHours() + 2)

      endTime.value = formatTimeForInput(endDate)
    } catch (error) {
      // Silently fail if date parsing fails
      console.error('Error auto-filling end time:', error)
    }
  }
}

async function handleSubmit() {
  errorMessage.value = ''
  isSubmitting.value = true

  try {
    // Check if bookings are enabled
    if (!settings.value || settings.value.bookingsEnabled === false) {
      errorMessage.value = 'Bokningar är för närvarande avstängda.'
      isSubmitting.value = false
      return
    }

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

    // Check for overlaps (exclude current booking if editing)
    const excludeBookingId = props.editingBooking?.id
    if (hasBookingOverlap(startTimestamp, endTimestamp, props.existingBookings, excludeBookingId)) {
      errorMessage.value =
        'Vald tid överlappar med en befintlig bokning. Vänligen välj en annan tid.'
      isSubmitting.value = false
      return
    }

    // Submit booking
    emit('submit', {
      startTime: startTimestamp,
      endTime: endTimestamp,
      bookingId: props.editingBooking?.id,
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

<style scoped>
/* Remove today's date highlight in calendar using CSS custom properties */
:deep(.booking-calendar),
:deep(.booking-calendar calendar-month) {
  --color-accent: transparent;
}

/* Remove today's date highlight using part selectors */
:deep(.booking-calendar::part(today)),
:deep(.booking-calendar calendar-month::part(today)) {
  background-color: transparent !important;
  background: transparent !important;
  color: inherit !important;
  font-weight: normal !important;
  border: none !important;
  box-shadow: none !important;
  outline: none !important;
}

/* Remove today's date highlight in calendar - attribute selectors */
:deep(.booking-calendar [today]),
:deep(.booking-calendar [today]:hover),
:deep(.booking-calendar calendar-month [today]),
:deep(.booking-calendar calendar-month [today]:hover),
:deep(.booking-calendar calendar-month button[today]),
:deep(.booking-calendar calendar-month button[today]:hover),
:deep(.booking-calendar button[today]),
:deep(.booking-calendar button[today]:hover) {
  background-color: transparent !important;
  background: transparent !important;
  color: inherit !important;
  font-weight: normal !important;
  border: none !important;
  box-shadow: none !important;
  outline: none !important;
}

/* Target any element with today attribute in the calendar */
:deep(.booking-calendar *[today]) {
  background-color: transparent !important;
  background: transparent !important;
  color: inherit !important;
  font-weight: normal !important;
  border: none !important;
  box-shadow: none !important;
}

/* Allow dropdown to overflow modal */
.modal-box,
.modal-box form {
  overflow: visible !important;
}
</style>
