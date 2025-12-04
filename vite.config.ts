import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  // Base path for GitHub Pages deployment
  // Can be overridden with GITHUB_REPOSITORY_NAME env var
  base: process.env.GITHUB_PAGES === 'true' 
    ? `/${process.env.GITHUB_REPOSITORY_NAME || 'htk-tennis-v2'}/` 
    : '/',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  optimizeDeps: {
    include: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'vueuse-vendor': ['@vueuse/core', '@vueuse/components'],
        },
      },
    },
  },
})
