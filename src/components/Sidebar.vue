<template>
  <div class="drawer-side z-20">
    <label for="sidebar-drawer" aria-label="close sidebar" class="drawer-overlay"></label>
    <aside class="w-64 min-h-full bg-base-200 border-r border-base-300 pt-16">
      <!-- Sidebar Content -->
      <div class="flex flex-col h-full">
        <!-- Navigation Menu -->
        <nav class="flex-1 overflow-y-auto py-4 px-2">
          <ul class="menu menu-vertical w-full p-0 gap-1">
            <!-- Admin Page (only for admin users) -->
            <li v-if="isAdmin">
              <RouterLink
                to="/admin"
                class="flex items-center gap-3"
                active-class="active"
                @click="closeDrawerOnMobile"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                <span class="whitespace-nowrap">Admin Page</span>
              </RouterLink>
            </li>

            <!-- Boka banan -->
            <li>
              <RouterLink
                to="/"
                class="flex items-center gap-3"
                active-class="active"
                @click="closeDrawerOnMobile"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span class="whitespace-nowrap">Boka banan</span>
              </RouterLink>
            </li>

            <!-- Tennisstege (placeholder) -->
            <li>
              <RouterLink
                to="/tennisstege"
                class="flex items-center gap-3 opacity-50 cursor-not-allowed"
                active-class="active"
                @click.prevent
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <span class="whitespace-nowrap">Tennisstege</span>
              </RouterLink>
            </li>

            <!-- Settings -->
            <li v-if="isAuthenticated">
              <RouterLink
                to="/profile"
                class="flex items-center gap-3"
                active-class="active"
                @click="closeDrawerOnMobile"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span class="whitespace-nowrap">Settings</span>
              </RouterLink>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const isAdmin = computed(() => userStore.isAdmin)
const isAuthenticated = computed(() => userStore.isAuthenticated)

// Close drawer on mobile when menu item is clicked
function closeDrawerOnMobile() {
  // Only close on mobile (below lg breakpoint)
  if (window.innerWidth < 1024) {
    const drawerToggle = document.getElementById('sidebar-drawer') as HTMLInputElement
    if (drawerToggle) {
      drawerToggle.checked = false
    }
  }
}
</script>

<style scoped lang="postcss">
@reference "../styles/main.css";

.menu li > a.active {
  @apply bg-primary text-primary-content;
}
</style>
