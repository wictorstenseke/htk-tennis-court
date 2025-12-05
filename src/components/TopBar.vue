<template>
  <header
    class="fixed top-0 right-0 left-0 h-16 bg-base-100 border-b border-base-300 z-30 flex items-center justify-between px-4"
  >
    <!-- Left: Logo and Title -->
    <div class="flex items-center gap-3">
      <!-- Logo -->
      <div class="flex items-center justify-center w-8 h-8">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-8 w-8 text-primary"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      </div>
      <!-- Title -->
      <h1 class="text-xl font-bold">HTK Tennis</h1>
    </div>

    <!-- Right: User -->
    <div class="flex items-center">
      <UserDropdown v-if="isAuthenticated" />
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'
import UserDropdown from '@/components/UserDropdown.vue'

const userStore = useUserStore()
const isAuthenticated = computed(() => userStore.isAuthenticated)
</script>
