// src/services/articleService.ts
// Service gérant les appels API liés aux articles de bien-être.
// Regroupe toutes les opérations CRUD sur les articles.

import apiClient from './api';

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
  categorie: {
    id: number;
    nom: string;
    slug: string;
  };
}

// Type de la réponse de collection API Platform (JSON-LD)
interface ReponseCollection<T> {
  'hydra:member': T[];
  'hydra:totalItems': number;
}

// Récupère la liste de tous les articles publiés
export const getArticles = async (): Promise<Article[]> => {
  const reponse = await apiClient.get<ReponseCollection<Article>>('/articles');
  // API Platform retourne les données dans "hydra:member"
  return reponse.data['hydra:member'];
};

// Récupère un article par son identifiant
export const getArticle = async (id: number): Promise<Article> => {
  const reponse = await apiClient.get<Article>(`/articles/${id}`);
  return reponse.data;
};
