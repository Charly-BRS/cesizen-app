// src/context/AuthContext.tsx
// Contexte React pour la gestion globale de l'authentification.
// Partage l'état de l'utilisateur connecté et le token JWT
// à tous les composants enfants de l'application.

import React, { createContext, useState, type ReactNode } from 'react';

// Type représentant un utilisateur authentifié
interface Utilisateur {
  id: number;
  email: string;
  roles: string[];
  prenom: string;
  nom: string;
}

// Type du contexte d'authentification
export interface AuthContextType {
  utilisateur: Utilisateur | null;
  token: string | null;
  connecter: (utilisateur: Utilisateur, token: string) => void;
  deconnecter: () => void;
  // Met à jour les infos de l'utilisateur en mémoire et dans localStorage
  // (utilisé après une modification de profil)
  mettreAJourUtilisateur: (donnees: Partial<Utilisateur>) => void;
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
  // Initialise l'utilisateur depuis localStorage (survit aux rechargements)
  const [utilisateur, setUtilisateur] = useState<Utilisateur | null>(() => {
    const donneesSauvegardees = localStorage.getItem('utilisateur');
    return donneesSauvegardees ? JSON.parse(donneesSauvegardees) : null;
  });

  // Initialise le token depuis localStorage (survit aux rechargements)
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('jwt_token')
  );

  // Connexion : sauvegarde utilisateur + token en mémoire et dans localStorage
  const connecter = (nouvelUtilisateur: Utilisateur, nouveauToken: string) => {
    setUtilisateur(nouvelUtilisateur);
    setToken(nouveauToken);
    localStorage.setItem('jwt_token', nouveauToken);
    localStorage.setItem('utilisateur', JSON.stringify(nouvelUtilisateur));
  };

  // Déconnexion : efface tout l'état et le localStorage
  const deconnecter = () => {
    setUtilisateur(null);
    setToken(null);
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('utilisateur');
  };

  // Mise à jour partielle des infos utilisateur (après modification de profil)
  // Met à jour l'état React ET le localStorage pour persister après rechargement
  const mettreAJourUtilisateur = (donnees: Partial<Utilisateur>) => {
    setUtilisateur((prev) => {
      if (!prev) return prev;
      const mis_a_jour = { ...prev, ...donnees };
      localStorage.setItem('utilisateur', JSON.stringify(mis_a_jour));
      return mis_a_jour;
    });
  };

  const valeurContexte: AuthContextType = {
    utilisateur,
    token,
    connecter,
    deconnecter,
    mettreAJourUtilisateur,
    estConnecte: token !== null,
  };

  return (
    <AuthContext.Provider value={valeurContexte}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

// Re-export du hook depuis son propre fichier (Fast Refresh exige que les fichiers
// de composants n'exportent que des composants — le hook est donc isolé dans useAuth.ts)
// eslint-disable-next-line react-refresh/only-export-components
export { useAuth } from './useAuth';
