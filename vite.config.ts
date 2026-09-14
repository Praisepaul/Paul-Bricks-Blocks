import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Paul Bricks & Blocks',
        short_name: 'Paul Bricks',
        description: 'Simple business management for Paul Bricks & Blocks',
        theme_color: '#111827',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [],
      },
    }),
  ],
})
