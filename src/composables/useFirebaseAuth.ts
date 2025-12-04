import { ref } from 'vue'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  type User,
} from 'firebase/auth'
import { auth } from '@/config/firebase'

/**
 * Composable for Firebase authentication operations
 */
export function useFirebaseAuth() {
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Create a new account with email and password
   */
  async function signUp(email: string, password: string): Promise<User> {
    try {
      isLoading.value = true
      error.value = null

      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      return userCredential.user
    } catch (err: unknown) {
      let errorMessage = 'Failed to create account'
      if (err && typeof err === 'object' && 'code' in err) {
        const firebaseError = err as { code: string; message: string }
        if (firebaseError.code === 'auth/configuration-not-found') {
          errorMessage =
            'Firebase Authentication is not enabled. Please enable Email/Password authentication in Firebase Console.'
        } else if (firebaseError.code === 'auth/email-already-in-use') {
          errorMessage = 'Detta e-postkonto används redan. Logga in istället.'
        } else if (firebaseError.code === 'auth/invalid-email') {
          errorMessage = 'Ogiltig e-postadress.'
        } else if (firebaseError.code === 'auth/weak-password') {
          errorMessage = 'Lösenordet är för svagt. Använd minst 6 tecken.'
        } else {
          errorMessage = firebaseError.message || errorMessage
        }
      } else if (err instanceof Error) {
        errorMessage = err.message
      }
      error.value = errorMessage
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Sign in with email and password
   */
  async function signIn(email: string, password: string): Promise<User> {
    try {
      isLoading.value = true
      error.value = null

      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      return userCredential.user
    } catch (err: unknown) {
      let errorMessage = 'Failed to sign in'
      if (err && typeof err === 'object' && 'code' in err) {
        const firebaseError = err as { code: string; message: string }
        if (firebaseError.code === 'auth/configuration-not-found') {
          errorMessage =
            'Firebase Authentication is not enabled. Please enable Email/Password authentication in Firebase Console.'
        } else if (firebaseError.code === 'auth/user-not-found') {
          errorMessage = 'Ingen användare hittades med denna e-postadress.'
        } else if (firebaseError.code === 'auth/wrong-password') {
          errorMessage = 'Felaktigt lösenord.'
        } else if (firebaseError.code === 'auth/invalid-email') {
          errorMessage = 'Ogiltig e-postadress.'
        } else if (firebaseError.code === 'auth/invalid-credential') {
          errorMessage = 'Felaktig e-postadress eller lösenord.'
        } else {
          errorMessage = firebaseError.message || errorMessage
        }
      } else if (err instanceof Error) {
        errorMessage = err.message
      }
      error.value = errorMessage
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Sign out the current user
   */
  async function signOutUser(): Promise<void> {
    try {
      isLoading.value = true
      error.value = null

      await signOut(auth)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign out'
      error.value = errorMessage
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Send password reset email
   */
  async function resetPassword(email: string): Promise<void> {
    try {
      isLoading.value = true
      error.value = null

      await sendPasswordResetEmail(auth, email)
    } catch (err: unknown) {
      let errorMessage = 'Failed to send password reset email'
      if (err && typeof err === 'object' && 'code' in err) {
        const firebaseError = err as { code: string; message: string }
        if (firebaseError.code === 'auth/configuration-not-found') {
          errorMessage =
            'Firebase Authentication is not enabled. Please enable Email/Password authentication in Firebase Console.'
        } else if (firebaseError.code === 'auth/user-not-found') {
          errorMessage = 'Ingen användare hittades med denna e-postadress.'
        } else if (firebaseError.code === 'auth/invalid-email') {
          errorMessage = 'Ogiltig e-postadress.'
        } else {
          errorMessage = firebaseError.message || errorMessage
        }
      } else if (err instanceof Error) {
        errorMessage = err.message
      }
      error.value = errorMessage
      throw err
    } finally {
      isLoading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    isLoading,
    error,
    signUp,
    signIn,
    signOut: signOutUser,
    resetPassword,
    clearError,
  }
}
