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
          <h1 class="text-4xl font-bold">Administration</h1>
        </div>

        <!-- User dropdown -->
        <UserDropdown />
      </div>

      <!-- Users section -->
      <div class="mb-12">
        <AdminUsersView />
      </div>

      <!-- Announcement section -->
      <div class="mb-12">
        <AdminAnnouncementView />
      </div>

      <!-- Booking settings section -->
      <div>
        <AdminBookingSettingsView />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import UserDropdown from '@/components/UserDropdown.vue'
import AdminUsersView from '@/views/AdminUsersView.vue'
import AdminBookingSettingsView from '@/views/AdminBookingSettingsView.vue'
import AdminAnnouncementView from '@/views/AdminAnnouncementView.vue'
</script>
