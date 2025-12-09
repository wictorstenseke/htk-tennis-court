<template>
  <header
    class="navbar fixed top-0 left-0 right-0 h-16 bg-base-100 border-b border-base-300 z-30 px-4"
  >
    <!-- Left: Meny Button -->
    <div class="navbar-start">
      <label for="sidebar-drawer" class="btn btn-outline btn-sm drawer-button"> Meny </label>
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
