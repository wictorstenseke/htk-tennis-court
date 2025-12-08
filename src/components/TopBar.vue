<template>
  <header
    class="navbar fixed top-0 left-0 right-0 h-16 bg-base-100 border-b border-base-300 z-30 px-4"
  >
    <!-- Left: Logo and Title -->
    <div class="navbar-start">
      <div class="flex items-center gap-3">
        <!-- Logo -->
        <div class="flex items-center justify-center w-10 h-10">
          <img src="/htk-logo.svg" alt="HTK Logo" class="h-10 w-10" />
        </div>
        <!-- Title -->
        <h1 class="text-xl font-bold text-base-content">Högelids Tennisklubb</h1>
      </div>
    </div>

    <!-- Right: User -->
    <div class="navbar-end h-full">
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
