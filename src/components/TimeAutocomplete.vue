<template>
  <div class="form-control relative">
    <label v-if="label" class="label py-1">
      <span class="label-text text-sm font-medium">{{ label }}</span>
    </label>
    <div class="relative">
      <input
        :id="inputId"
        ref="inputRef"
        v-model="inputValue"
        :type="inputType"
        :class="['input input-bordered w-full', isMobile ? '' : 'pr-10']"
        :placeholder="placeholder"
        :required="required"
        autocomplete="off"
        :step="isMobile ? 900 : undefined"
        @input="handleInput"
        @focus="handleFocus"
        @click="handleClick"
        @blur="handleBlur"
        @keydown="handleKeydown"
        @change="handleChange"
      />
      <!-- Dropdown with suggestions (desktop only) -->
      <div
        v-if="!isMobile && showDropdown && filteredOptions.length > 0"
        ref="dropdownRef"
        class="time-dropdown absolute left-0 right-0 mt-1 bg-base-100 border border-base-300 rounded-box shadow-lg max-h-60 overflow-y-auto"
      >
        <button
          v-for="(option, index) in filteredOptions"
          :key="option"
          type="button"
          class="w-full text-left px-4 py-2 hover:bg-base-200 focus:bg-base-200 focus:outline-none"
          :class="{
            'bg-base-200': index === selectedIndex,
            'text-base-content/50 cursor-not-allowed': props.disabledOptions.includes(option),
          }"
          :aria-disabled="props.disabledOptions.includes(option)"
          @mousedown="handleMouseDown(option, $event)"
          @click="selectOption(option)"
          @mouseenter="selectedIndex = index"
        >
          {{ option }}
        </button>
      </div>
      <div
        v-if="!isMobile"
        class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-base-content/60"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4 stroke-current"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useMediaQuery } from '@vueuse/core'

interface Props {
  modelValue: string
  label?: string
  placeholder?: string
  required?: boolean
  inputId?: string
  disabledOptions?: string[]
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'HH:mm',
  required: false,
  inputId: undefined,
  disabledOptions: () => [],
})

const emit = defineEmits<Emits>()

// Detect mobile devices (screens smaller than 768px or touch devices)
const isMobile = useMediaQuery('(max-width: 767px), (pointer: coarse)')
const inputType = computed(() => (isMobile.value ? 'time' : 'text'))

const inputRef = ref<HTMLInputElement | null>(null)
const dropdownRef = ref<HTMLDivElement | null>(null)
const inputValue = ref('')
const showDropdown = ref(false)
const selectedIndex = ref(0)

// Generate all time slots in 15-minute increments (00:00 to 23:45)
const allTimeSlots = computed(() => {
  const slots: string[] = []
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const hourStr = hour.toString().padStart(2, '0')
      const minuteStr = minute.toString().padStart(2, '0')
      slots.push(`${hourStr}:${minuteStr}`)
    }
  }
  return slots
})

// Filter options based on input
const filteredOptions = computed(() => {
  // If input is empty, show next 15 min interval and 3 hours from there
  if (!inputValue.value.trim()) {
    const nextTime = getNext15MinInterval()
    const [baseHour, baseMinute] = nextTime.split(':').map(Number)

    // Generate 3 hours of slots starting from next interval
    const threeHourSlots: string[] = []
    for (let i = 0; i < 12; i++) {
      const totalMinutes = baseHour * 60 + baseMinute + i * 15
      const hour = Math.floor(totalMinutes / 60)
      const minute = totalMinutes % 60

      // Stop if we exceed 23:59
      if (hour >= 24) {
        break
      }

      const hourStr = hour.toString().padStart(2, '0')
      const minuteStr = minute.toString().padStart(2, '0')
      threeHourSlots.push(`${hourStr}:${minuteStr}`)
    }

    return threeHourSlots
  }

  const input = inputValue.value.trim().replace(/[^\d:]/g, '')

  // If input is empty or just whitespace, return empty
  if (!input) {
    return []
  }

  // Find the first matching time slot
  let firstMatch: string | null = null

  // First, check if input is already a valid complete time in our slots
  if (allTimeSlots.value.includes(inputValue.value.trim())) {
    firstMatch = inputValue.value.trim()
  } else if (!input.includes(':')) {
    // Input is just numbers (e.g., "1", "11", "111")
    if (input.length === 1) {
      // Single digit: find first time starting with that digit
      // "1" -> should match 10:00 (prefer 10:00 over 01:00 for better UX)
      const matches = allTimeSlots.value.filter(time => {
        const timeWithoutColon = time.replace(':', '')
        return timeWithoutColon.startsWith(input)
      })

      if (matches.length > 0) {
        // For single digit, prefer times starting with "1" (10:00, 11:00, etc.)
        // over "0" (01:00, 02:00) as they're more commonly used
        const preferredMatch = matches.find(time => time.startsWith('1'))
        firstMatch = preferredMatch || matches[0]
      }
    } else if (input.length === 2) {
      // Two digits: treat as hour (e.g., "11" -> 11:00)
      const hour = parseInt(input)
      if (hour >= 0 && hour < 24) {
        firstMatch = `${input.padStart(2, '0')}:00`
      }
    } else {
      // More than 2 digits without colon, treat first 2 as hour, rest as minute
      const hour = input.substring(0, 2)
      const minute = input.substring(2).padEnd(2, '0').substring(0, 2)
      const hourNum = parseInt(hour)
      const minuteNum = parseInt(minute)

      if (hourNum >= 0 && hourNum < 24 && minuteNum >= 0 && minuteNum < 60) {
        // Round minute to nearest 15-minute increment
        const roundedMinute = Math.round(minuteNum / 15) * 15
        firstMatch = `${hour.padStart(2, '0')}:${roundedMinute.toString().padStart(2, '0')}`
      }
    }
  } else {
    // Input contains colon (e.g., "11:", "11:1", "11:15")
    const parts = input.split(':')
    const hourStr = parts[0].padStart(2, '0')
    const hour = parseInt(hourStr)

    if (hour >= 0 && hour < 24) {
      if (parts[1]) {
        // Has minute part
        const minuteStr = parts[1].padEnd(2, '0').substring(0, 2)
        const minute = parseInt(minuteStr)

        if (minute >= 0 && minute < 60) {
          // Round minute to nearest 15-minute increment
          const roundedMinute = Math.round(minute / 15) * 15
          firstMatch = `${hourStr}:${roundedMinute.toString().padStart(2, '0')}`
        }
      } else {
        // No minute part, default to :00
        firstMatch = `${hourStr}:00`
      }
    }
  }

  // If we found a match, show 3 hours worth (12 slots = 3 hours * 4 slots per hour)
  if (firstMatch) {
    const [baseHour, baseMinute] = firstMatch.split(':').map(Number)

    // Generate 3 hours of slots starting from the first match
    const threeHourSlots: string[] = []
    for (let i = 0; i < 12; i++) {
      const totalMinutes = baseHour * 60 + baseMinute + i * 15
      const hour = Math.floor(totalMinutes / 60)
      const minute = totalMinutes % 60

      // Stop if we exceed 23:59
      if (hour >= 24) {
        break
      }

      const hourStr = hour.toString().padStart(2, '0')
      const minuteStr = minute.toString().padStart(2, '0')
      threeHourSlots.push(`${hourStr}:${minuteStr}`)
    }

    return threeHourSlots
  }

  return []
})

// Sync inputValue with modelValue
watch(
  () => props.modelValue,
  newValue => {
    if (newValue !== inputValue.value) {
      inputValue.value = newValue || ''
    }
  },
  { immediate: true }
)

// Emit changes
watch(inputValue, newValue => {
  emit('update:modelValue', newValue)
})

function handleInput() {
  if (isMobile.value) return
  // Show dropdown and reset selection when user types
  showDropdown.value = true
  selectedIndex.value = 0
  // The filteredOptions computed will automatically update based on inputValue
}

// Get next 15-minute interval from current time
function getNext15MinInterval(): string {
  const now = new Date()
  const currentMinutes = now.getMinutes()
  const roundedMinutes = Math.ceil(currentMinutes / 15) * 15
  const hours = now.getHours()
  const minutes = roundedMinutes >= 60 ? 0 : roundedMinutes
  const finalHours = roundedMinutes >= 60 ? (hours + 1) % 24 : hours

  return `${finalHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}

function handleFocus() {
  if (isMobile.value) return
  // Show dropdown on focus, but don't auto-fill
  showDropdown.value = true
  selectedIndex.value = 0
}

function handleClick() {
  if (isMobile.value) return
  // Show dropdown on click, but don't auto-fill
  showDropdown.value = true
  selectedIndex.value = 0
}

function handleBlur() {
  if (isMobile.value) return
  // Delay to allow click events on dropdown to fire
  setTimeout(() => {
    showDropdown.value = false
  }, 200)
}

function handleKeydown(event: KeyboardEvent) {
  if (isMobile.value) return
  if (!showDropdown.value || filteredOptions.value.length === 0) {
    return
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    selectedIndex.value = (selectedIndex.value + 1) % filteredOptions.value.length
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    selectedIndex.value =
      selectedIndex.value > 0 ? selectedIndex.value - 1 : filteredOptions.value.length - 1
  } else if (event.key === 'Enter') {
    event.preventDefault()
    if (filteredOptions.value[selectedIndex.value]) {
      selectOption(filteredOptions.value[selectedIndex.value])
    }
  } else if (event.key === 'Escape') {
    showDropdown.value = false
  }
}

function selectOption(option: string) {
  if (props.disabledOptions.includes(option)) {
    showDropdown.value = true
    return
  }
  inputValue.value = option
  showDropdown.value = false
  inputRef.value?.blur()
}

function handleMouseDown(option: string, event: MouseEvent) {
  if (props.disabledOptions.includes(option)) {
    event.preventDefault()
    event.stopPropagation()
    showDropdown.value = true
  }
}

function handleChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (!target) return
  // Native time input returns HH:mm
  inputValue.value = target.value
  emit('update:modelValue', target.value)
}

onMounted(() => {
  // Generate unique ID if not provided
  if (!props.inputId && inputRef.value) {
    inputRef.value.id = `time-input-${Math.random().toString(36).substring(2, 9)}`
  }
})

onUnmounted(() => {})
</script>

<style scoped>
/* Ensure dropdown appears above modal - modals typically use z-50, so we need higher */
.time-dropdown {
  z-index: 9999 !important;
}
</style>
