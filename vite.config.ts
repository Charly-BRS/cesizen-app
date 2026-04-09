// vite.config.ts
// Configuration Vite : bundler ultra-rapide pour React en développement
// Le bloc "test" configure Vitest (framework de tests unitaires)

/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    // Plugin Tailwind CSS pour Vite (v4+ : pas de fichier tailwind.config.js nécessaire)
    tailwindcss(),
  ],
  // Configuration de Vitest (tests unitaires)
  test: {
    // Simule un navigateur pour les composants React (accès à window, document…)
    environment: 'jsdom',
    // Rend describe/it/expect disponibles sans import explicite
    globals: true,
    // Fichier exécuté avant chaque suite de tests (ajoute les matchers jest-dom)
    setupFiles: ['./src/test/setup.ts'],
  },
  server: {
    // Expose le serveur sur tous les réseaux (nécessaire pour Docker)
    host: '0.0.0.0',
    port: 5173,
    watch: {
      // Polling obligatoire sur Windows + Docker :
      // les événements de fichiers natifs ne traversent pas la couche WSL/volume
      usePolling: true,
      interval: 500,
    },
  },
})
