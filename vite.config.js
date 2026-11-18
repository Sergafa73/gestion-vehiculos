import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// base './' permite publicar en https://usuario.github.io/nombre-repositorio/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icono.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Gestión de vehículos',
        short_name: 'Vehículos',
        description: 'Control de repostajes, gastos, mantenimientos y documentación de tus vehículos.',
        lang: 'es',
        start_url: './',
        scope: './',
        display: 'standalone',
        background_color: '#eef1f4',
        theme_color: '#0f5c63',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      }
    })
  ]
});
