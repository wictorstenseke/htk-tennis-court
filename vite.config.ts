import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vitejs.dev/config/
export default defineConfig({
  // Base path for GitHub Pages deployment
  // Can be overridden with GITHUB_REPOSITORY_NAME env var
  base:
    process.env.GITHUB_PAGES === 'true'
      ? `/${process.env.GITHUB_REPOSITORY_NAME || 'htk-tennis-v2'}/`
      : '/',
  plugins: [
    vue(),
    visualizer({
      filename: './dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  optimizeDeps: {
    include: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
  },
  build: {
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Vue core libraries
          if (
            id.includes('node_modules/vue') ||
            id.includes('node_modules/vue-router') ||
            id.includes('node_modules/pinia')
          ) {
            return 'vue-vendor'
          }
          // Firebase Auth
          if (id.includes('node_modules/firebase/auth')) {
            return 'firebase-auth'
          }
          // Firebase Firestore
          if (id.includes('node_modules/firebase/firestore')) {
            return 'firebase-firestore'
          }
          // Firebase App (core)
          if (id.includes('node_modules/firebase/app')) {
            return 'firebase-app'
          }
        },
      },
    },
    minify: 'esbuild',
    sourcemap: false,
    cssCodeSplit: true,
  },
})
