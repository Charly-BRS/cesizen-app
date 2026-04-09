// vitest.config.ts
// Configuration Vitest (tests unitaires).
//
// Séparé de vite.config.ts pour éviter le conflit de types entre :
//   - Vite 8.x (qui utilise rolldown comme bundler)
//   - Vitest 3.x (qui embarque sa propre copie de Vite 7.x / rollup)
// Ces deux versions ne sont pas compatibles au niveau TypeScript.

import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Simule un navigateur pour les composants React (accès à window, document…)
    environment: 'jsdom',
    // Rend describe/it/expect disponibles sans import explicite dans chaque test
    globals: true,
    // Fichier exécuté avant chaque suite de tests (ajoute les matchers jest-dom)
    setupFiles: ['./src/test/setup.ts'],
  },
})
