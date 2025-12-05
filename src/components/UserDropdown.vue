<template>
  <div class="dropdown dropdown-end" v-if="displayName">
    <div
      tabindex="0"
      role="button"
      class="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-base-200 transition-colors cursor-pointer"
    >
      <span class="font-medium">{{ displayName }}</span>
      <div class="avatar">
        <div class="w-10 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
          <img :src="avatarUrl" :alt="displayName" />
        </div>
      </div>
    </div>
    <ul
      tabindex="0"
      class="dropdown-content menu bg-base-200 rounded-box z-[1] w-52 p-2 shadow-lg mt-2"
    >
      <li>
        <RouterLink to="/profile" class="flex items-center gap-2">
          <svg
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
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          Profilinställningar
        </RouterLink>
      </li>
      <li v-if="isAdmin">
        <RouterLink to="/admin" class="flex items-center gap-2">
          <svg
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
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          Admin
        </RouterLink>
      </li>
      <li>
        <button @click="handleSignOut" class="flex items-center gap-2 text-error">
          <svg
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
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Logga ut
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useFirebaseAuth } from '@/composables/useFirebaseAuth'

const userStore = useUserStore()
const router = useRouter()
const { signOut } = useFirebaseAuth()

const displayName = computed(() => userStore.displayName)
const avatarUrl = computed(() => userStore.avatarUrl)
const isAdmin = computed(() => userStore.isAdmin)

async function handleSignOut() {
  try {
    await signOut()
    router.push('/')
  } catch (error) {
    console.error('Sign out error:', error)
  }
}
</script>
