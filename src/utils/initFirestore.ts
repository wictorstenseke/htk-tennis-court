import { db } from '@/config/firebase'
import { collection, doc, setDoc } from 'firebase/firestore'

/**
 * Initialize Firestore database by creating a test document
 * This will trigger the database creation if it doesn't exist
 */
export async function initFirestore(): Promise<void> {
  try {
    // Create a test document to trigger database creation
    const testRef = doc(collection(db, '_init'))
    await setDoc(testRef, {
      timestamp: new Date(),
      message: 'Database initialized',
    })
    console.log('Firestore database initialized successfully')
  } catch (error) {
    console.error('Error initializing Firestore:', error)
    throw error
  }
}

