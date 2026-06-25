import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { catalogImagesPlugin } from './vite-plugins/catalog-images'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), catalogImagesPlugin()],
  base: '/MebelLanding/',
})
