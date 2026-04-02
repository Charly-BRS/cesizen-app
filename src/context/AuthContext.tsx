// src/context/AuthContext.tsx
// Contexte React pour la gestion globale de l'authentification.
// Partage l'état de l'utilisateur connecté et le token JWT
// à tous les composants enfants de l'application.

import React, { createContext, useState, useContext, ReactNode } from 'react';

// Type représentant un utilisateur authentifié
interface Utilisateur {
  id: number;
  email: string;
  roles: string[];
}

// Type du contexte d'authentification
interface AuthContextType {
  utilisateur: Utilisateur | null;
  token: string | null;
  connecter: (utilisateur: Utilisateur, token: string) => void;
  deconnecter: () => void;
  estConnecte: boolean;
}

// Création du contexte avec une valeur par défaut null
const AuthContext = createContext<AuthContextType | null>(null);

// Props du fournisseur de contexte
interface AuthProviderProps {
  children: ReactNode;
}

// Fournisseur du contexte d'authentification
// Enveloppe l'application entière pour partager l'état d'auth
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // État de l'utilisateur connecté (null si non connecté)
  const [utilisateur, setUtilisateur] = useState<Utilisateur | null>(null);

  // État du token JWT (null si non connecté)
  const [token, setToken] = useState<string | null>(
    // Initialise depuis localStorage si un token existe déjà
    localStorage.getItem('jwt_token')
  );

  // Fonction de connexion : sauvegarde l'utilisateur et le token
  const connecter = (nouvelUtilisateur: Utilisateur, nouveauToken: string) => {
    setUtilisateur(nouvelUtilisateur);
    setToken(nouveauToken);
    // Persiste le token pour survivre aux rechargements de page
    localStorage.setItem('jwt_token', nouveauToken);
  };

  // Fonction de déconnexion : efface l'état et le localStorage
  const deconnecter = () => {
    setUtilisateur(null);
    setToken(null);
    localStorage.removeItem('jwt_token');
  };

  const valeurContexte: AuthContextType = {
    utilisateur,
    token,
    connecter,
    deconnecter,
    estConnecte: token !== null,
  };

  return (
    <AuthContext.Provider value={valeurContexte}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte d'auth facilement
// Exemple d'utilisation : const { utilisateur, estConnecte } = useAuth();
export const useAuth = (): AuthContextType => {
  const contexte = useContext(AuthContext);

  if (!contexte) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }

  return contexte;
};

export default AuthContext;
