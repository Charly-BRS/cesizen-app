// src/services/exerciseService.ts
// Service gérant les appels API pour les exercices de respiration et les sessions.
// Regroupe toutes les opérations : lecture des exercices, création et mise à jour des sessions.

import apiClient from './api';

// Type représentant un exercice de respiration
export interface BreathingExercise {
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

// Type représentant une session d'exercice
export interface UserSession {
  id: number;
  status: 'started' | 'completed' | 'abandoned';
  startedAt: string;
  endedAt: string | null;
  breathingExercise: BreathingExercise;
}

// Type de réponse de collection API Platform (JSON-LD)
interface ReponseCollection<T> {
  'hydra:member': T[];
  'hydra:totalItems': number;
}

// Récupère tous les exercices de respiration actifs
export const getExercices = async (): Promise<BreathingExercise[]> => {
  const reponse = await apiClient.get<ReponseCollection<BreathingExercise>>('/breathing_exercises');
  return reponse.data['hydra:member'];
};

// Récupère un exercice par son identifiant
export const getExercice = async (id: number): Promise<BreathingExercise> => {
  const reponse = await apiClient.get<BreathingExercise>(`/breathing_exercises/${id}`);
  return reponse.data;
};

// Démarre une nouvelle session d'exercice
// Retourne la session créée avec son id (nécessaire pour la mettre à jour ensuite)
// API Platform exige le Content-Type "application/ld+json" pour les POST
export const demarrerSession = async (exerciceId: number): Promise<UserSession> => {
  const reponse = await apiClient.post<UserSession>(
    '/user_sessions',
    { breathingExercise: `/api/breathing_exercises/${exerciceId}` },
    { headers: { 'Content-Type': 'application/ld+json' } }
  );
  return reponse.data;
};

// Met à jour le statut d'une session (terminer ou abandonner)
export const terminerSession = async (
  sessionId: number,
  status: 'completed' | 'abandoned'
): Promise<UserSession> => {
  const reponse = await apiClient.patch<UserSession>(
    `/user_sessions/${sessionId}`,
    {
      status,
      endedAt: new Date().toISOString(),
    },
    // PATCH avec API Platform nécessite le Content-Type merge-patch+json
    { headers: { 'Content-Type': 'application/merge-patch+json' } }
  );
  return reponse.data;
};

// Récupère l'historique des sessions de l'utilisateur connecté
export const getMesSessions = async (): Promise<UserSession[]> => {
  const reponse = await apiClient.get<ReponseCollection<UserSession>>('/user_sessions');
  return reponse.data['hydra:member'];
};
