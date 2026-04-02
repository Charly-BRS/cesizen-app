// vite.config.ts
// Configuration Vite : bundler ultra-rapide pour React en développement
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    // Plugin Tailwind CSS pour Vite (v4+ : pas de fichier tailwind.config.js nécessaire)
    tailwindcss(),
  ],
  server: {
    // Expose le serveur sur tous les réseaux (nécessaire pour Docker)
    host: '0.0.0.0',
    port: 5173,
  },
})
