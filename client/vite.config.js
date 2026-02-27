import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  envDir: '../', // Load .env from parent directory
  server: {
    port: 6996,
    proxy: {
      '/api': {
        target: 'http://localhost:6997',
        changeOrigin: true
      },
      '/v1': {
        target: 'http://localhost:6997',
        changeOrigin: true
      }
    }
  }
})
