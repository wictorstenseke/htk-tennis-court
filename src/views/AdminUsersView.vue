<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold">Användarhantering</h2>
      <label class="label cursor-pointer gap-2">
        <span class="label-text">Visa mock-användare</span>
        <input type="checkbox" class="toggle toggle-primary" v-model="showMockUsers" />
      </label>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="flex justify-center py-8">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="alert alert-error mb-6">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="stroke-current shrink-0 h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span>{{ error }}</span>
    </div>

    <!-- Success message -->
    <div v-if="successMessage" class="alert alert-success mb-6">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="stroke-current shrink-0 h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span>{{ successMessage }}</span>
    </div>

    <!-- Users table -->
    <div v-else>
      <table class="table table-zebra w-full">
        <thead>
          <tr>
            <th>Namn</th>
            <th>E-post</th>
            <th>Telefon</th>
            <th>Skapad</th>
            <th>Typ</th>
            <th>Roll</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in allUsers" :key="user.uid">
            <td>{{ user.displayName }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.phone || '-' }}</td>
            <td>{{ formatDate(user.createdAt) }}</td>
            <td>
              <span v-if="user.isMock" class="badge badge-info">Mock</span>
              <span v-else class="badge badge-success">Riktig</span>
            </td>
            <td>
              <!-- Read-only for admin, editable for superuser -->
              <select
                v-if="canEditRoles && user.uid !== currentUserId"
                :value="user.role || 'user'"
                class="select select-bordered select-sm"
                :class="{ 'opacity-75': user.isMock }"
                :disabled="isUpdatingRole === user.uid"
                @change="
                  handleRoleChange(
                    user.uid,
                    ($event.target as HTMLSelectElement).value,
                    user.isMock
                  )
                "
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <span v-else class="badge badge-outline">
                {{ getRoleLabel(user.role || 'user') }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { getAllUsers, updateUserRole } from '@/utils/userProfile'
import { getMockUsers, mockUserIds } from '@/utils/mockData'
import type { UserProfileRead, UserRole } from '@/types/user'
import type { Timestamp } from 'firebase/firestore'

interface UserWithUid extends UserProfileRead {
  uid: string
  isMock?: boolean
}

const userStore = useUserStore()

const users = ref<UserWithUid[]>([])
const mockUsers = ref<UserWithUid[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)
const successMessage = ref<string | null>(null)
const isUpdatingRole = ref<string | null>(null)
const showMockUsers = ref(false)

const currentUserId = computed(() => userStore.currentUser?.uid ?? '')
const canEditRoles = computed(() => userStore.isSuperuser)

// Combine real and mock users based on toggle
const allUsers = computed(() => {
  const realUsers = users.value.map(u => ({ ...u, isMock: false }))
  const mockUsersList = showMockUsers.value
    ? mockUsers.value.map(u => ({ ...u, isMock: true }))
    : []

  // Combine and sort by createdAt descending
  const combined = [...realUsers, ...mockUsersList]
  combined.sort((a, b) => {
    const aTime = a.createdAt?.toMillis() ?? 0
    const bTime = b.createdAt?.toMillis() ?? 0
    return bTime - aTime
  })
  return combined
})

function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    user: 'User',
    admin: 'Admin',
    superuser: 'SuperUser',
  }
  return labels[role]
}

function formatDate(timestamp: Timestamp): string {
  if (!timestamp) return 'Okänt datum'
  const date = timestamp.toDate()
  return new Intl.DateTimeFormat('sv-SE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

async function loadUsers() {
  try {
    isLoading.value = true
    error.value = null

    // Verify user has admin/superuser role before attempting to load
    if (!userStore.isAdmin) {
      error.value =
        'Du har inte behörighet att visa användare. Endast admin och superuser kan komma åt denna sida.'
      return
    }

    users.value = await getAllUsers()
    // Sort by createdAt descending (newest first)
    users.value.sort((a, b) => {
      const aTime = a.createdAt?.toMillis() ?? 0
      const bTime = b.createdAt?.toMillis() ?? 0
      return bTime - aTime
    })
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Okänt fel'
    if (errorMessage.includes('permission') || errorMessage.includes('Permission')) {
      error.value =
        'Behörighetsfel: Kontrollera att Firestore-reglerna är uppdaterade och att din användarroll är korrekt satt i databasen.'
    } else {
      error.value = `Kunde inte ladda användare: ${errorMessage}`
    }
    console.error('Error loading users:', err)
  } finally {
    isLoading.value = false
  }
}

async function handleRoleChange(uid: string, newRole: string, isMock = false) {
  // For mock users, just update locally without saving to Firestore
  if (isMock) {
    const mockUser = mockUsers.value.find(u => u.uid === uid)
    if (mockUser) {
      mockUser.role = newRole as UserRole
      successMessage.value = 'Mock-användares roll uppdaterad (endast lokalt)'
      setTimeout(() => {
        successMessage.value = null
      }, 3000)
    }
    return
  }

  // For real users, update in Firestore
  const previousRole = users.value.find(u => u.uid === uid)?.role || 'user'

  // Optimistically update UI
  const user = users.value.find(u => u.uid === uid)
  if (user) {
    user.role = newRole as UserRole
  }

  try {
    isUpdatingRole.value = uid
    error.value = null
    successMessage.value = null

    await updateUserRole(uid, { role: newRole as UserRole })

    successMessage.value = 'Roll uppdaterad'
    setTimeout(() => {
      successMessage.value = null
    }, 3000)
  } catch (err) {
    // Revert UI change on error
    if (user) {
      user.role = previousRole as UserRole
    }
    error.value = err instanceof Error ? err.message : 'Kunde inte uppdatera roll'
    console.error('Error updating role:', err)
  } finally {
    isUpdatingRole.value = null
  }
}

function loadMockUsers() {
  const mockUsersData = getMockUsers()
  mockUsers.value = mockUsersData.map((user, index) => ({
    ...user,
    uid: mockUserIds[index],
    isMock: true,
  }))
}

onMounted(() => {
  loadUsers()
  loadMockUsers()
})
</script>
