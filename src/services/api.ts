// src/services/api.ts
// Instance Axios centralisée pour toutes les requêtes vers l'API Symfony.
// Configure l'URL de base et gère automatiquement le token JWT
// dans les en-têtes de chaque requête (intercepteur).

import axios from 'axios';

// Création de l'instance Axios avec l'URL de base définie dans .env
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
    // API Platform attend du JSON-LD par défaut
    'Accept': 'application/ld+json',
  },
});

// Intercepteur de requête : ajoute automatiquement le token JWT si présent
apiClient.interceptors.request.use(
  (config) => {
    // Récupère le token stocké dans localStorage
    const token = localStorage.getItem('jwt_token');

    if (token) {
      // Ajoute l'en-tête Authorization avec le format Bearer
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    // Propage l'erreur si la configuration de la requête échoue
    return Promise.reject(error);
  }
);

// Intercepteur de réponse : gère les erreurs globales (ex: token expiré)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Ne pas rediriger si c'est un appel d'authentification (login, forgot-password,
      // reset-with-token) : dans ce cas le 401 est une erreur d'identifiants normale
      // que le composant doit gérer lui-même (afficher un message d'erreur).
      const urlAppel = error.config?.url ?? '';
      const estUnAppelAuth = urlAppel.includes('/auth/login')
        || urlAppel.includes('/auth/register')
        || urlAppel.includes('/auth/forgot-password')
        || urlAppel.includes('/auth/reset-with-token')
        || urlAppel.includes('/auth/desactiver-compte');

      if (!estUnAppelAuth) {
        // Token expiré ou invalide sur une route protégée : déconnexion forcée
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('utilisateur');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
