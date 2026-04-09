// src/context/useAuth.ts
// Hook personnalisé pour utiliser le contexte d'authentification facilement.
// Séparé dans son propre fichier pour respecter la règle ESLint react-refresh/only-export-components :
// un fichier contenant des composants React ne doit pas exporter autre chose.
//
// Exemple d'utilisation :
//   import { useAuth } from '../context/AuthContext';
//   const { utilisateur, estConnecte } = useAuth();

import { useContext } from 'react';
import AuthContext from './AuthContext';
import type { AuthContextType } from './AuthContext';

export const useAuth = (): AuthContextType => {
  const contexte = useContext(AuthContext);

  if (!contexte) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }

  return contexte;
};
