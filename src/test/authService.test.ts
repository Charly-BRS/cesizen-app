// src/test/authService.test.ts
// Tests unitaires pour authService.ts
//
// Ce que l'on teste :
//   - login() appelle bien l'API et retourne le token JWT
//   - login() propage l'erreur si l'API répond avec une erreur
//   - register() appelle bien l'API et retourne les données utilisateur
//
// Stratégie : on mocke apiClient (Axios) pour ne JAMAIS envoyer de vraies
// requêtes HTTP. Les tests vérifient uniquement la logique du service.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { login, register } from '../services/authService';
import apiClient from '../services/api';

// ─── Mock du module api.ts ────────────────────────────────────────────────────
// On remplace l'instance Axios réelle par un objet simulé avec des fonctions vides.
// vi.mock() est automatiquement remonté au début du fichier par Vitest.
vi.mock('../services/api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    patch: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('authService', () => {

  // Réinitialise tous les mocks avant chaque test pour éviter les interférences
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── Tests de login() ─────────────────────────────────────────────────────

  it('login() retourne le token JWT quand les identifiants sont valides', async () => {
    // Configure le mock pour simuler une réponse API réussie
    const tokenFictif = 'eyJhbGciOiJSUzI1NiJ9.payload.signature';
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: { token: tokenFictif },
    });

    // Appelle la vraie fonction login() avec des données de test
    const resultat = await login({ email: 'jean@example.com', password: 'MotDePasse123!' });

    // Vérifie que le token retourné est bien celui de l'API
    expect(resultat.token).toBe(tokenFictif);

    // Vérifie que apiClient.post a été appelé avec les bons paramètres
    expect(apiClient.post).toHaveBeenCalledOnce();
    expect(apiClient.post).toHaveBeenCalledWith('/auth/login', {
      email: 'jean@example.com',
      password: 'MotDePasse123!',
    });
  });

  it('login() propage l\'erreur si l\'API retourne un code d\'erreur', async () => {
    // Simule une erreur 401 (identifiants incorrects)
    const erreur401 = new Error('Request failed with status code 401');
    vi.mocked(apiClient.post).mockRejectedValueOnce(erreur401);

    // Vérifie que la promesse est bien rejetée avec la même erreur
    await expect(
      login({ email: 'jean@example.com', password: 'mauvais-mdp' })
    ).rejects.toThrow('Request failed with status code 401');
  });

  // ─── Tests de register() ──────────────────────────────────────────────────

  it('register() retourne le message de succès et les infos utilisateur', async () => {
    // Simule une réponse API réussie pour l'inscription
    const reponseFictive = {
      message: 'Inscription réussie',
      utilisateur: {
        id: 42,
        email: 'jean@example.com',
        prenom: 'Jean',
        nom: 'Test',
      },
    };
    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: reponseFictive });

    // Appelle register() avec des données d'inscription valides
    const resultat = await register({
      email: 'jean@example.com',
      password: 'MotDePasse123!',
      prenom: 'Jean',
      nom: 'Test',
    });

    // Vérifie la structure de la réponse
    expect(resultat.message).toBe('Inscription réussie');
    expect(resultat.utilisateur.email).toBe('jean@example.com');
    expect(resultat.utilisateur.id).toBe(42);

    // Vérifie que l'appel API est correct
    expect(apiClient.post).toHaveBeenCalledWith('/auth/register', {
      email: 'jean@example.com',
      password: 'MotDePasse123!',
      prenom: 'Jean',
      nom: 'Test',
    });
  });

  it('register() propage l\'erreur si l\'email est déjà utilisé', async () => {
    // Simule une erreur 422 (email en doublon)
    const erreur422 = new Error('Request failed with status code 422');
    vi.mocked(apiClient.post).mockRejectedValueOnce(erreur422);

    await expect(
      register({ email: 'doublon@example.com', password: 'Mdp123!', prenom: 'A', nom: 'B' })
    ).rejects.toThrow('Request failed with status code 422');
  });
});
