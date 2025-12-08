<template>
  <div class="form-control relative">
    <label v-if="label" class="label py-1">
      <span class="label-text font-medium">{{ label }}</span>
    </label>
    <div class="relative">
      <!-- Native time input for mobile devices -->
      <input
        v-if="isMobile"
        :id="inputId"
        ref="inputRef"
        v-model="inputValue"
        type="time"
        class="input input-bordered w-full"
        :required="required"
        step="900"
        @change="handleNativeTimeChange"
      />
      <!-- Autocomplete input for desktop -->
      <input
        v-else
        :id="inputId"
        ref="inputRef"
        v-model="inputValue"
        type="text"
        class="input input-bordered max-w-xs"
        :placeholder="placeholder"
        :required="required"
        autocomplete="off"
        @input="handleInput"
        @focus="handleFocus"
        @click="handleClick"
        @blur="handleBlur"
        @keydown="handleKeydown"
      />
      <!-- Dropdown with suggestions (desktop only) -->
      <Teleport to="body">
        <div
          v-if="!isMobile && showDropdown && filteredOptions.length > 0"
          ref="dropdownRef"
          class="time-dropdown fixed bg-base-100 border border-base-300 rounded-box shadow-lg max-h-60 overflow-y-auto"
          :style="dropdownStyle"
        >
          <button
            v-for="(option, index) in filteredOptions"
            :key="option"
            type="button"
            class="w-full text-left px-4 py-2 hover:bg-base-200 focus:bg-base-200 focus:outline-none"
            :class="{ 'bg-base-200': index === selectedIndex }"
            @click="selectOption(option)"
            @mouseenter="selectedIndex = index"
          >
            {{ option }}
          </button>
        </div>
      </Teleport>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useMediaQuery } from '@vueuse/core'

interface Props {
  modelValue: string
  label?: string
  placeholder?: string
  required?: boolean
  inputId?: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'HH:mm',
  required: false,
  inputId: undefined,
})

const emit = defineEmits<Emits>()

// Detect mobile devices (screens smaller than 768px or touch devices)
const isMobile = useMediaQuery('(max-width: 767px), (pointer: coarse)')

const inputRef = ref<HTMLInputElement | null>(null)
const dropdownRef = ref<HTMLDivElement | null>(null)
const inputValue = ref('')
const showDropdown = ref(false)
const selectedIndex = ref(0)
const dropdownStyle = ref<{ top: string; left: string; width: string }>({
  top: '0px',
  left: '0px',
  width: '0px',
})

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

// Handle native time input change (mobile)
function handleNativeTimeChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (target && target.value) {
    // Native time input returns HH:mm format, which matches our format
    inputValue.value = target.value
    emit('update:modelValue', target.value)
  }
}

function handleInput() {
  // Show dropdown and reset selection when user types
  showDropdown.value = true
  selectedIndex.value = 0
  updateDropdownPosition()
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

function updateDropdownPosition() {
  if (!inputRef.value || !dropdownRef.value) return

  nextTick(() => {
    const rect = inputRef.value!.getBoundingClientRect()
    dropdownStyle.value = {
      top: `${rect.bottom + window.scrollY + 4}px`,
      left: `${rect.left + window.scrollX}px`,
      width: `${rect.width}px`,
    }
  })
}

function handleFocus() {
  // Show dropdown on focus, but don't auto-fill
  showDropdown.value = true
  selectedIndex.value = 0
  updateDropdownPosition()
}

function handleClick() {
  // Show dropdown on click, but don't auto-fill
  showDropdown.value = true
  selectedIndex.value = 0
  updateDropdownPosition()
}

function handleBlur() {
  // Delay to allow click events on dropdown to fire
  setTimeout(() => {
    showDropdown.value = false
  }, 200)
}

function handleKeydown(event: KeyboardEvent) {
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
  inputValue.value = option
  showDropdown.value = false
  inputRef.value?.blur()
}

onMounted(() => {
  // Generate unique ID if not provided
  if (!props.inputId && inputRef.value) {
    inputRef.value.id = `time-input-${Math.random().toString(36).substring(2, 9)}`
  }

  // Update dropdown position on scroll and resize
  window.addEventListener('scroll', updateDropdownPosition, true)
  window.addEventListener('resize', updateDropdownPosition)
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateDropdownPosition, true)
  window.removeEventListener('resize', updateDropdownPosition)
})
</script>

<style scoped>
/* Ensure dropdown appears above modal - modals typically use z-50, so we need higher */
.time-dropdown {
  z-index: 9999 !important;
}
</style>
