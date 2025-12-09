<template>
  <div class="drawer lg:drawer-open min-h-screen bg-base-100">
    <input id="sidebar-drawer" type="checkbox" class="drawer-toggle" />
    
    <!-- Drawer Content (Main Content Area) -->
    <div class="drawer-content flex flex-col min-h-screen overflow-x-hidden ml-0 lg:ml-0">
      <!-- Top Bar -->
      <TopBar />

      <!-- Main Content -->
      <main class="flex-1 pt-16">
        <RouterView />
      </main>
    </div>

    <!-- Drawer Side (Sidebar) -->
    <Sidebar />
  </div>
</template>

<script setup lang="ts">
import Sidebar from '@/components/Sidebar.vue'
import TopBar from '@/components/TopBar.vue'
import { RouterView } from 'vue-router'
</script>
