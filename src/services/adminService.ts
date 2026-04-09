// src/services/adminService.ts
// Service gérant les appels API réservés aux administrateurs.
// Toutes ces requêtes nécessitent le rôle ROLE_ADMIN côté serveur.

import apiClient from './api';

// ── Types ────────────────────────────────────────────────────────────────────

// Utilisateur complet pour l'administration
export interface UtilisateurAdmin {
  id: number;
  email: string;
  prenom: string;
  nom: string;
  roles: string[];
  isActif: boolean;
  createdAt: string;
}

// Exercice complet pour l'administration
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

// Format de réponse paginée d'API Platform
interface ReponseCollection<T> {
  'hydra:member': T[];
  'hydra:totalItems': number;
}

// ── Gestion des utilisateurs ─────────────────────────────────────────────────

// Récupère tous les utilisateurs (ROLE_ADMIN requis)
export const getTousUtilisateurs = async (): Promise<UtilisateurAdmin[]> => {
  const reponse = await apiClient.get<ReponseCollection<UtilisateurAdmin>>('/users');
  return reponse.data['hydra:member'];
};

// Active ou désactive un compte utilisateur
// Utilise PATCH /api/users/{id} avec isActif (champ dans user:write)
export const toggleActifUtilisateur = async (id: number, isActif: boolean): Promise<void> => {
  await apiClient.patch(
    `/users/${id}`,
    { isActif },
    { headers: { 'Content-Type': 'application/merge-patch+json' } }
  );
};

// Définit les rôles d'un utilisateur via l'endpoint dédié /api/auth/set-role
// Pourquoi pas PATCH /users/{id} ? Les rôles ne sont PAS dans le groupe user:write
// (pour empêcher l'auto-promotion). Seul cet endpoint admin peut changer les rôles.
//
// roles : tableau des rôles à attribuer, ex: [] | ['ROLE_REDACTEUR'] | ['ROLE_ADMIN']
export const definirRolesUtilisateur = async (id: number, roles: string[]): Promise<void> => {
  await apiClient.post('/auth/set-role', { userId: id, roles });
};

// Réinitialise le mot de passe d'un utilisateur (admin uniquement)
// Cas d'usage : utilisateur bloqué, compte compromis, etc.
export const resetMotDePasseAdmin = async (
  userId: number,
  nouveauMotDePasse: string
): Promise<void> => {
  await apiClient.post('/auth/reset-password', { userId, nouveauMotDePasse });
};

// ── Gestion des exercices ─────────────────────────────────────────────────────

// Récupère tous les exercices y compris les inactifs (admin voit tout)
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

// Crée un nouvel exercice (API Platform exige application/ld+json pour POST)
export const creerExercice = async (donnees: Omit<ExerciceAdmin, 'id'>): Promise<ExerciceAdmin> => {
  const reponse = await apiClient.post<ExerciceAdmin>(
    '/breathing_exercises',
    donnees,
    { headers: { 'Content-Type': 'application/ld+json' } }
  );
  return reponse.data;
};

// Supprime définitivement un exercice
export const supprimerExercice = async (id: number): Promise<void> => {
  await apiClient.delete(`/breathing_exercises/${id}`);
};
