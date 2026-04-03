// src/services/authService.ts
// Service gérant les appels API liés à l'authentification.
// Regroupe les fonctions login et register pour éviter de
// répéter la logique d'appel Axios dans chaque composant.

import apiClient from './api';

// Type des données envoyées lors de la connexion
interface DonneesConnexion {
  email: string;
  password: string;
}

// Type des données envoyées lors de l'inscription
interface DonneesInscription {
  email: string;
  password: string;
  prenom: string;
  nom: string;
}

// Type de la réponse renvoyée par /api/auth/login
interface ReponseLogin {
  token: string;
}

// Type de la réponse renvoyée par /api/auth/register
interface ReponseRegister {
  message: string;
  utilisateur: {
    id: number;
    email: string;
    prenom: string;
    nom: string;
  };
}

// Envoie les identifiants au serveur et récupère le token JWT
export const login = async (donnees: DonneesConnexion): Promise<ReponseLogin> => {
  const reponse = await apiClient.post<ReponseLogin>('/auth/login', donnees);
  return reponse.data;
};

// Crée un nouveau compte utilisateur
export const register = async (donnees: DonneesInscription): Promise<ReponseRegister> => {
  const reponse = await apiClient.post<ReponseRegister>('/auth/register', donnees);
  return reponse.data;
};

// Récupère le profil de l'utilisateur connecté depuis /api/users/{id}
export const getMonProfil = async (id: number) => {
  const reponse = await apiClient.get(`/users/${id}`);
  return reponse.data;
};

// Met à jour le prénom et le nom de l'utilisateur connecté
export const modifierProfil = async (
  id: number,
  donnees: { prenom: string; nom: string }
) => {
  const reponse = await apiClient.patch(
    `/users/${id}`,
    donnees,
    { headers: { 'Content-Type': 'application/merge-patch+json' } }
  );
  return reponse.data;
};

// Change le mot de passe de l'utilisateur connecté
// Vérifie l'ancien mot de passe côté serveur avant de le modifier
export const changerMotDePasse = async (
  ancienMotDePasse: string,
  nouveauMotDePasse: string
): Promise<{ message: string }> => {
  const reponse = await apiClient.post<{ message: string }>(
    '/auth/change-password',
    { ancienMotDePasse, nouveauMotDePasse }
  );
  return reponse.data;
};
