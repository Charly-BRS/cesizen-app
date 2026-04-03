// src/services/articleService.ts
// Service gérant les appels API liés aux articles de bien-être.
// Regroupe toutes les opérations : lecture publique, CRUD admin, catégories.

import apiClient from './api';

// Type d'une catégorie d'article
export interface Categorie {
  id: number;
  nom: string;
  slug: string;
}

// Type représentant un article retourné par l'API
export interface Article {
  id: number;
  titre: string;
  contenu: string;
  isPublie: boolean;
  createdAt: string;
  updatedAt: string | null;
  auteur: {
    id: number;
    email: string;
    prenom: string;
    nom: string;
  };
  categorie: Categorie;
}

// Type de la réponse de collection API Platform (JSON-LD)
interface ReponseCollection<T> {
  'hydra:member': T[];
  'hydra:totalItems': number;
}

// ── Lecture ────────────────────────────────────────────────────

// Récupère la liste de tous les articles (publiés et brouillons pour les admins)
export const getArticles = async (): Promise<Article[]> => {
  const reponse = await apiClient.get<ReponseCollection<Article>>('/articles');
  return reponse.data['hydra:member'];
};

// Récupère un article par son identifiant
export const getArticle = async (id: number): Promise<Article> => {
  const reponse = await apiClient.get<Article>(`/articles/${id}`);
  return reponse.data;
};

// Récupère toutes les catégories disponibles (pour le formulaire de création)
export const getCategories = async (): Promise<Categorie[]> => {
  const reponse = await apiClient.get<ReponseCollection<Categorie>>('/categories');
  return reponse.data['hydra:member'];
};

// ── CRUD Admin ─────────────────────────────────────────────────

// Données nécessaires pour créer ou modifier un article
export interface DonneesArticle {
  titre: string;
  contenu: string;
  // L'IRI de la catégorie (ex: "/api/categories/1") attendue par API Platform
  categorie: string;
  isPublie: boolean;
}

// Crée un nouvel article (l'auteur est injecté automatiquement côté serveur)
// API Platform exige le Content-Type "application/ld+json" pour les POST
export const creerArticle = async (donnees: DonneesArticle): Promise<Article> => {
  const reponse = await apiClient.post<Article>(
    '/articles',
    donnees,
    { headers: { 'Content-Type': 'application/ld+json' } }
  );
  return reponse.data;
};

// Modifie un article existant (PATCH = mise à jour partielle)
export const modifierArticle = async (id: number, donnees: Partial<DonneesArticle>): Promise<Article> => {
  const reponse = await apiClient.patch<Article>(
    `/articles/${id}`,
    donnees,
    { headers: { 'Content-Type': 'application/merge-patch+json' } }
  );
  return reponse.data;
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
