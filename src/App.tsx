// src/App.tsx
// Composant racine de l'application CESIZen.
// Configure le routeur React Router DOM et définit les routes principales.

import { BrowserRouter, Routes, Route } from 'react-router-dom'

// Page d'accueil temporaire (sera remplacée en Phase 2)
const PageAccueil = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-blue-600 mb-4">CESIZen</h1>
      <p className="text-gray-600">Application de gestion du bien-être</p>
      <p className="text-sm text-gray-400 mt-2">Phase 1 : Infrastructure initialisée ✓</p>
    </div>
  </div>
)

function App() {
  return (
    // BrowserRouter : active la navigation par URL (history API)
    <BrowserRouter>
      <Routes>
        {/* Route principale — les écrans métier seront ajoutés en Phase 2 */}
        <Route path="/" element={<PageAccueil />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
