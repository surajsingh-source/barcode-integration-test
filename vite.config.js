import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/barcode-integration-test/',
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    exclude: ['@zxing/library', 'zxing-wasm'],
  },
})