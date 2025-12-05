<template>
  <AppLayout />
</template>

<script setup lang="ts">
import { useAuth } from '@/composables/useAuth'
import AppLayout from '@/components/AppLayout.vue'

// Initialize auth state listener
useAuth()
</script>
