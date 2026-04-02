// src/main.tsx
// Point d'entrée de l'application React.
// Monte le composant racine dans le DOM et configure les fournisseurs globaux.

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* AuthProvider rend le contexte d'authentification disponible partout */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
