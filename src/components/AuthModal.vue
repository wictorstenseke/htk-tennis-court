<template>
  <dialog ref="modalRef" class="modal" :class="{ 'modal-open': isOpen }">
    <div class="modal-box">
      <!-- Header -->
      <h2 class="card-title justify-center text-3xl mb-4">
        {{ isSignUp ? 'Skapa konto' : 'Logga in' }}
      </h2>

      <!-- Error Message -->
      <div v-if="error" class="alert alert-error mb-4">
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

      <!-- Success Message (for password reset) -->
      <div v-if="resetEmailSent" class="alert alert-success mb-4">
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
        <span>Återställningslänk skickad till {{ email }}</span>
      </div>

      <!-- Forgot Password Form -->
      <form v-if="showForgotPassword" @submit.prevent="handleForgotPassword" class="space-y-4">
        <div class="form-control">
          <label class="label">
            <span class="label-text">E-postadress</span>
          </label>
          <input
            v-model="email"
            type="email"
            placeholder="din@epost.se"
            class="input input-bordered w-full"
            required
          />
        </div>

        <div class="form-control mt-6">
          <button type="submit" class="btn btn-primary" :disabled="isLoading">
            <span v-if="isLoading" class="loading loading-spinner loading-sm"></span>
            Skicka återställningslänk
          </button>
        </div>

        <div class="text-center mt-4">
          <button type="button" class="link link-primary" @click="showForgotPassword = false">
            Tillbaka till inloggning
          </button>
        </div>
      </form>

      <!-- Sign In / Sign Up Form -->
      <form v-else @submit.prevent="handleSubmit" class="space-y-4">
        <div class="form-control">
          <label class="label">
            <span class="label-text">E-postadress</span>
          </label>
          <input
            v-model="email"
            type="email"
            placeholder="din@epost.se"
            class="input input-bordered w-full"
            required
          />
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text">Lösenord</span>
          </label>
          <div class="relative">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              class="input input-bordered w-full pr-10"
              required
              :minlength="isSignUp ? 6 : undefined"
            />
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 btn btn-ghost btn-sm btn-circle"
              @click="showPassword = !showPassword"
            >
              <svg
                v-if="showPassword"
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
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
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
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </button>
          </div>
          <label v-if="isSignUp" class="label">
            <span class="label-text-alt">Minst 6 tecken</span>
          </label>
        </div>

        <div class="form-control mt-6">
          <button type="submit" class="btn btn-primary" :disabled="isLoading">
            <span v-if="isLoading" class="loading loading-spinner loading-sm"></span>
            {{ isSignUp ? 'Skapa konto' : 'Logga in' }}
          </button>
        </div>

        <div class="divider">ELLER</div>

        <div class="text-center space-y-2">
          <button type="button" class="link link-primary" @click="isSignUp = !isSignUp">
            {{ isSignUp ? 'Har du redan ett konto? Logga in' : 'Inget konto? Skapa ett här' }}
          </button>

          <div v-if="!isSignUp">
            <button
              type="button"
              class="link link-secondary text-sm"
              @click="showForgotPassword = true"
            >
              Glömt lösenord?
            </button>
          </div>
        </div>
      </form>

      <!-- Modal Actions -->
      <div class="modal-action">
        <button type="button" class="btn" @click="handleClose">Stäng</button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop" @click="handleClose">
      <button>close</button>
    </form>
  </dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useFirebaseAuth } from '@/composables/useFirebaseAuth'

interface Props {
  isOpen: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { signUp, signIn, resetPassword, isLoading, error, clearError } = useFirebaseAuth()

const modalRef = ref<HTMLDialogElement | null>(null)
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const isSignUp = ref(false)
const showForgotPassword = ref(false)
const resetEmailSent = ref(false)

// Reset form when modal opens
watch(
  () => props.isOpen,
  isOpen => {
    if (isOpen) {
      resetForm()
    }
  }
)

function resetForm() {
  email.value = ''
  password.value = ''
  showPassword.value = false
  isSignUp.value = false
  showForgotPassword.value = false
  resetEmailSent.value = false
  clearError()
}

function handleClose() {
  resetForm()
  emit('close')
}

async function handleSubmit() {
  clearError()
  resetEmailSent.value = false

  try {
    if (isSignUp.value) {
      await signUp(email.value, password.value)
    } else {
      await signIn(email.value, password.value)
    }

    // Clear form fields after successful submission
    resetForm()
    
    // Emit success event and close modal
    emit('success')
    handleClose()
  } catch (err) {
    // Error is handled by the composable
    // Don't clear fields on error so user can retry
    console.error('Auth error:', err)
  }
}

async function handleForgotPassword() {
  clearError()
  resetEmailSent.value = false

  try {
    await resetPassword(email.value)
    resetEmailSent.value = true
  } catch (err) {
    // Error is handled by the composable
    console.error('Password reset error:', err)
  }
}
</script>
