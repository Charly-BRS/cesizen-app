// src/services/adminService.ts
// Service gérant les appels API réservés aux administrateurs.
// Toutes ces requêtes nécessitent le rôle ROLE_ADMIN côté serveur.

import apiClient from './api';

// Type utilisateur complet pour l'admin (inclut isActif et roles)
export interface UtilisateurAdmin {
  id: number;
  email: string;
  prenom: string;
  nom: string;
  roles: string[];
  isActif: boolean;
  createdAt: string;
}

// Type article pour l'admin
export interface ArticleAdmin {
  id: number;
  titre: string;
  contenu: string;
  isPublie: boolean;
  createdAt: string;
  auteur: { id: number; prenom: string; nom: string };
  categorie: { id: number; nom: string; slug: string };
}

// Type exercice pour l'admin
export interface ExerciceAdmin {
  id: number;
  nom: string;
  slug: string;
  description: string | null;
  inspirationDuration: number;
  apneaDuration: number;
  expirationDuration: number;
  cycles: number;
  isPreset: boolean;
  isActive: boolean;
}

interface ReponseCollection<T> {
  'hydra:member': T[];
  'hydra:totalItems': number;
}

// ── Gestion des utilisateurs ──────────────────────────────────

// Récupère la liste complète des utilisateurs
export const getTousUtilisateurs = async (): Promise<UtilisateurAdmin[]> => {
  const reponse = await apiClient.get<ReponseCollection<UtilisateurAdmin>>('/users');
  return reponse.data['hydra:member'];
};

// Active ou désactive un compte utilisateur
export const toggleActifUtilisateur = async (id: number, isActif: boolean): Promise<void> => {
  await apiClient.patch(
    `/users/${id}`,
    { isActif },
    { headers: { 'Content-Type': 'application/merge-patch+json' } }
  );
};

// Promeut un utilisateur en admin (ou retire le rôle admin)
export const toggleRoleAdmin = async (id: number, estAdmin: boolean): Promise<void> => {
  await apiClient.patch(
    `/users/${id}`,
    { roles: estAdmin ? ['ROLE_ADMIN'] : [] },
    { headers: { 'Content-Type': 'application/merge-patch+json' } }
  );
};

// ── Gestion des exercices ─────────────────────────────────────

// Récupère tous les exercices (actifs et inactifs)
export const getTousExercices = async (): Promise<ExerciceAdmin[]> => {
  const reponse = await apiClient.get<ReponseCollection<ExerciceAdmin>>('/breathing_exercises');
  return reponse.data['hydra:member'];
};

// Active ou désactive un exercice
export const toggleActifExercice = async (id: number, isActive: boolean): Promise<void> => {
  await apiClient.patch(
    `/breathing_exercises/${id}`,
    { isActive },
    { headers: { 'Content-Type': 'application/merge-patch+json' } }
  );
};

// Crée un nouvel exercice
// API Platform exige le Content-Type "application/ld+json" pour les POST
export const creerExercice = async (donnees: Omit<ExerciceAdmin, 'id'>): Promise<ExerciceAdmin> => {
  const reponse = await apiClient.post<ExerciceAdmin>(
    '/breathing_exercises',
    donnees,
    { headers: { 'Content-Type': 'application/ld+json' } }
  );
  return reponse.data;
};

// Supprime un exercice
export const supprimerExercice = async (id: number): Promise<void> => {
  await apiClient.delete(`/breathing_exercises/${id}`);
};

// ── Gestion des articles ──────────────────────────────────────

// Récupère tous les articles (publiés et non publiés)
export const getTousArticles = async (): Promise<ArticleAdmin[]> => {
  const reponse = await apiClient.get<ReponseCollection<ArticleAdmin>>('/articles');
  return reponse.data['hydra:member'];
};

// Publie ou dépublie un article
export const togglePublieArticle = async (id: number, isPublie: boolean): Promise<void> => {
  await apiClient.patch(
    `/articles/${id}`,
    { isPublie },
    { headers: { 'Content-Type': 'application/merge-patch+json' } }
  );
};

// Supprime un article
export const supprimerArticle = async (id: number): Promise<void> => {
  await apiClient.delete(`/articles/${id}`);
};
