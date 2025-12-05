<template>
  <aside
    :class="[
      'fixed left-0 top-0 h-full bg-base-200 border-r border-base-300 transition-all duration-300 z-20',
      isCollapsed && !isHovering ? 'w-16' : 'w-64',
    ]"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- Sidebar Content -->
    <div class="flex flex-col h-full">
      <!-- Toggle Button -->
      <div class="flex items-center justify-end p-4 border-b border-base-300">
        <button
          @click="toggleCollapse"
          class="btn btn-ghost btn-sm btn-circle"
          :title="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        >
          <svg
            v-if="!isCollapsed"
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
            />
          </svg>
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 5l7 7-7 7M5 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      <!-- Navigation Menu -->
      <nav class="flex-1 overflow-y-auto py-4">
        <ul class="menu py-0 px-2 flex flex-col gap-2">
          <!-- Admin Page (only for admin users) -->
          <li v-if="isAdmin">
            <RouterLink
              to="/admin"
              class="flex items-center gap-3 py-2 rounded-lg"
              :class="{
                'justify-center px-2': isCollapsed && !isHovering,
                'px-4': !isCollapsed || isHovering,
              }"
              active-class="!bg-primary !text-primary-content"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6 flex-shrink-0"
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
              <span v-if="!isCollapsed || isHovering" class="whitespace-nowrap transition-opacity">
                Admin Page
              </span>
            </RouterLink>
          </li>

          <!-- Boka banan -->
          <li>
            <RouterLink
              to="/"
              class="flex items-center gap-3 py-2 rounded-lg"
              :class="{
                'justify-center px-2': isCollapsed && !isHovering,
                'px-4': !isCollapsed || isHovering,
              }"
              active-class="!bg-primary !text-primary-content"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6 flex-shrink-0"
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
              <span v-if="!isCollapsed || isHovering" class="whitespace-nowrap transition-opacity">
                Boka banan
              </span>
            </RouterLink>
          </li>

          <!-- Tennisstege (placeholder) -->
          <li>
            <RouterLink
              to="/tennisstege"
              class="flex items-center gap-3 py-2 rounded-lg opacity-50 cursor-not-allowed"
              :class="{
                'justify-center px-2': isCollapsed && !isHovering,
                'px-4': !isCollapsed || isHovering,
              }"
              active-class="!bg-primary !text-primary-content"
              @click.prevent
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6 flex-shrink-0"
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
              <span v-if="!isCollapsed || isHovering" class="whitespace-nowrap transition-opacity">
                Tennisstege
              </span>
            </RouterLink>
          </li>

          <!-- Settings -->
          <li v-if="isAuthenticated">
            <RouterLink
              to="/profile"
              class="flex items-center gap-3 py-2 rounded-lg"
              :class="{
                'justify-center px-2': isCollapsed && !isHovering,
                'px-4': !isCollapsed || isHovering,
              }"
              active-class="!bg-primary !text-primary-content"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6 flex-shrink-0"
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
              <span v-if="!isCollapsed || isHovering" class="whitespace-nowrap transition-opacity">
                Settings
              </span>
            </RouterLink>
          </li>
        </ul>
      </nav>

      <!-- Sidebar Control Menu -->
      <div v-if="isAuthenticated" class="border-t border-base-300 py-2">
        <ul class="menu py-0 px-2">
          <li class="dropdown dropdown-top">
            <div
              tabindex="0"
              role="button"
              class="flex items-center gap-3 py-2 rounded-lg cursor-pointer w-full"
              :class="{
                'justify-center px-2': isCollapsed && !isHovering,
                'px-4': !isCollapsed || isHovering,
              }"
              title="Sidebar control"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10.5 6h9M10.5 12h9m-9 6h9M4.5 6h1.5m-1.5 6h1.5m-1.5 6h1.5"
                />
              </svg>
              <span v-if="!isCollapsed || isHovering" class="whitespace-nowrap transition-opacity">
                Sidebar
              </span>
            </div>
            <ul
              tabindex="0"
              class="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow-lg mb-2 border border-base-300"
            >
              <li>
                <label class="label cursor-pointer">
                  <span class="label-text">Expanded</span>
                  <input
                    type="radio"
                    name="sidebar-state"
                    class="radio radio-primary radio-sm"
                    :checked="sidebarState === 'expanded'"
                    @change="handleStateChange('expanded')"
                  />
                </label>
              </li>
              <li>
                <label class="label cursor-pointer">
                  <span class="label-text">Collapsed</span>
                  <input
                    type="radio"
                    name="sidebar-state"
                    class="radio radio-primary radio-sm"
                    :checked="sidebarState === 'collapsed'"
                    @change="handleStateChange('collapsed')"
                  />
                </label>
              </li>
              <li>
                <label class="label cursor-pointer">
                  <span class="label-text">Expand on hover</span>
                  <input
                    type="radio"
                    name="sidebar-state"
                    class="radio radio-primary radio-sm"
                    :checked="sidebarState === 'hover'"
                    @change="handleStateChange('hover')"
                  />
                </label>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useUserStore } from '@/stores/user'
import type { SidebarState } from '@/types/user'

const userStore = useUserStore()
const isAdmin = computed(() => userStore.isAdmin)
const isAuthenticated = computed(() => userStore.isAuthenticated)

const sidebarState = ref<SidebarState>('expanded')
const isCollapsed = ref(false)
const isHovering = ref(false)

const emit = defineEmits<{
  widthChange: [width: number]
}>()

// Load sidebar state from user profile
onMounted(() => {
  if (userStore.userProfile?.sidebarState) {
    sidebarState.value = userStore.userProfile.sidebarState
    applySidebarState()
  }
})

// Watch for user profile changes to load sidebar state
watch(
  () => userStore.userProfile?.sidebarState,
  newState => {
    if (newState) {
      sidebarState.value = newState
      applySidebarState()
    }
  }
)

// Apply sidebar state based on preference
function applySidebarState() {
  switch (sidebarState.value) {
    case 'expanded':
      isCollapsed.value = false
      break
    case 'collapsed':
      isCollapsed.value = true
      break
    case 'hover':
      isCollapsed.value = true
      break
  }
}

// Handle state change from control menu
async function handleStateChange(newState: SidebarState) {
  sidebarState.value = newState
  applySidebarState()

  // Save to user profile if authenticated
  if (isAuthenticated.value && userStore.currentUser) {
    try {
      await userStore.updateProfile({ sidebarState: newState })
    } catch (error) {
      console.error('Error saving sidebar state:', error)
    }
  }
}

// Calculate current width
const currentWidth = computed(() => {
  if (isCollapsed.value && !isHovering.value) {
    return 64 // w-16 = 4rem = 64px
  }
  return 256 // w-64 = 16rem = 256px
})

// Emit width changes
watch(
  currentWidth,
  newWidth => {
    emit('widthChange', newWidth)
  },
  { immediate: true }
)

function toggleCollapse() {
  // Toggle between expanded and collapsed states
  // If currently 'hover', switch to 'expanded'
  if (sidebarState.value === 'hover') {
    handleStateChange('expanded')
  } else {
    // Toggle between expanded and collapsed
    const newState: SidebarState = isCollapsed.value ? 'expanded' : 'collapsed'
    handleStateChange(newState)
  }
}

function handleMouseEnter() {
  if (sidebarState.value === 'hover' && isCollapsed.value) {
    isHovering.value = true
  }
}

function handleMouseLeave() {
  isHovering.value = false
}
</script>

<style scoped>
.menu li > a,
.menu li > div > div[role="button"] {
  @apply transition-colors hover:bg-base-300;
}
</style>
