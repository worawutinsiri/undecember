import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Relative asset paths so the static build works from any sub-path (e.g. GitHub Pages).
  base: './',
  build: {
    // Game data and Thai translations are bundled on purpose (~1.5 MB, ~280 kB gzipped).
    chunkSizeWarningLimit: 2000,
  },
})
