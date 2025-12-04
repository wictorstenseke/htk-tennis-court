<template>
  <div class="min-h-screen bg-base-100">
    <div class="container mx-auto px-4 py-8">
      <div class="text-center mb-8">
        <h1 class="text-5xl font-bold mb-4">HTK Tennis</h1>
        <p class="text-xl text-base-content/70">Välkommen till HTK Tennis v2</p>
      </div>

      <!-- Mock Users Section -->
      <section class="mb-12">
        <h2 class="text-3xl font-bold mb-6">Användare (Mock Data)</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="(user, index) in mockUsers" :key="index" class="card bg-base-200 shadow-lg">
            <div class="card-body">
              <h3 class="card-title text-lg">{{ user.displayName }}</h3>
              <div class="space-y-1 text-sm">
                <p class="flex items-center gap-2">
                  <span class="badge badge-outline">Email</span>
                  {{ user.email }}
                </p>
                <p v-if="user.phone" class="flex items-center gap-2">
                  <span class="badge badge-outline">Telefon</span>
                  {{ user.phone }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Mock Bookings Section -->
      <section>
        <h2 class="text-3xl font-bold mb-6">Bokningar (Mock Data)</h2>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div v-for="booking in mockBookings" :key="booking.id" class="card bg-base-200 shadow-lg">
            <div class="card-body">
              <div class="flex items-start justify-between mb-3">
                <div>
                  <h3 class="card-title text-lg mb-1">
                    {{ formatBookingDate(booking.startTime) }}
                  </h3>
                  <p class="text-sm text-base-content/70">
                    {{ formatBookingTime(booking.startTime) }} -
                    {{ formatBookingTime(booking.endTime) }}
                  </p>
                </div>
                <span
                  :class="{
                    'badge-success': booking.status === 'booked',
                    'badge-error': booking.status === 'cancelled',
                  }"
                  class="badge"
                >
                  {{ booking.status === 'booked' ? 'Bokad' : 'Avbokad' }}
                </span>
              </div>

              <div class="divider my-2"></div>

              <div class="space-y-2 text-sm">
                <p>
                  <span class="font-semibold">Spelare:</span>
                  {{ getUserDisplayName(booking.userId) }}
                </p>
                <p v-if="booking.opponentUserId">
                  <span class="font-semibold">Motståndare:</span>
                  {{ getUserDisplayName(booking.opponentUserId) }}
                </p>
                <p v-else class="text-base-content/60 italic">Ingen motståndare vald</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  getMockUsers,
  getMockBookings,
  getUserDisplayName,
  formatBookingDate,
  formatBookingTime,
} from '@/utils/mockData'
import type { UserProfileRead } from '@/types/user'
import type { BookingRead } from '@/types/booking'

const mockUsers = ref<UserProfileRead[]>([])
const mockBookings = ref<BookingRead[]>([])

onMounted(() => {
  mockUsers.value = getMockUsers()
  mockBookings.value = getMockBookings()
})
</script>
