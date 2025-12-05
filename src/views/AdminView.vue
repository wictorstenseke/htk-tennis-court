<template>
  <div class="min-h-screen bg-base-100">
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-4xl font-bold mb-8">Administration</h1>

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
import AdminUsersView from '@/views/AdminUsersView.vue'
import AdminBookingSettingsView from '@/views/AdminBookingSettingsView.vue'
import AdminAnnouncementView from '@/views/AdminAnnouncementView.vue'
</script>
