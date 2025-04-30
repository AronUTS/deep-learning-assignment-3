import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// vite.config.js or vite.config.ts
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist'  // Ensure 'dist' is the output directory
  },
});