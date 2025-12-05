<template>
  <div class="min-h-screen bg-base-100">
    <!-- Sidebar -->
    <Sidebar ref="sidebarRef" @width-change="handleSidebarWidthChange" />

    <!-- Top Bar -->
    <TopBar />

    <!-- Main Content -->
    <main
      class="transition-all duration-300 pt-16 min-h-screen"
      :style="{ paddingLeft: sidebarWidth + 'px' }"
    >
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Sidebar from '@/components/Sidebar.vue'
import TopBar from '@/components/TopBar.vue'
import { RouterView } from 'vue-router'

const sidebarRef = ref<InstanceType<typeof Sidebar> | null>(null)
const sidebarWidth = ref(256) // Default expanded width (w-64 = 16rem = 256px)

function handleSidebarWidthChange(width: number) {
  sidebarWidth.value = width
}
</script>
