import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    // Add your global state here
  }),
  getters: {
    // Add your getters here
  },
  actions: {
    // Add your actions here
  },
})

export { useUserStore } from './user'

