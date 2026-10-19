import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// The frontend calls relative URLs like `/api/contacts`. Vite's dev server runs
// on port 5173 and the Express API runs on port 5000, so every /api request has
// to be forwarded. Without this proxy the browser receives Vite's index.html
// for API paths, which the fetch client cannot parse — the pages render but no
// data ever loads.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
