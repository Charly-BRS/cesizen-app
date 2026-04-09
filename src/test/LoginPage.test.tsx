// src/test/LoginPage.test.tsx
// Tests unitaires pour LoginPage.tsx
//
// Ce que l'on teste :
//   - Le formulaire de connexion s'affiche bien (champs email, mot de passe, bouton)
//   - Le titre "CESIZen" est présent
//   - Le lien vers l'inscription est présent
//   - Un message d'erreur apparaît quand le login retourne 401
//   - Le bouton est désactivé pendant le chargement
//
// Stratégie :
//   - On mocke authService.login pour ne pas faire de vraies requêtes HTTP
//   - On mocke le module api.ts (importé indirectement par authService)
//   - On enveloppe LoginPage dans MemoryRouter + AuthProvider pour lui fournir
//     les contextes dont il a besoin (useNavigate, useAuth)

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import { AuthProvider } from '../context/AuthContext';
import LoginPage from '../pages/LoginPage';
import * as authService from '../services/authService';

// ─── Mocks ───────────────────────────────────────────────────────────────────

// Mock du service d'authentification : évite les vraies requêtes HTTP
vi.mock('../services/authService', () => ({
  login: vi.fn(),
  register: vi.fn(),
  modifierProfil: vi.fn(),
  changerMotDePasse: vi.fn(),
}));

// Mock du module api.ts (nécessaire car importé lors du chargement du module)
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

// ─── Utilitaires ─────────────────────────────────────────────────────────────

// Enveloppe LoginPage dans les contextes nécessaires à son fonctionnement
const renderLoginPage = () =>
  render(
    <MemoryRouter>
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    </MemoryRouter>
  );

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('LoginPage', () => {

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  // ─── Affichage du formulaire ───────────────────────────────────────────────

  it('affiche le champ email', () => {
    renderLoginPage();
    // Cherche le champ par son label (accessibilité)
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('affiche le champ mot de passe', () => {
    renderLoginPage();
    expect(screen.getByLabelText('Mot de passe')).toBeInTheDocument();
  });

  it('affiche le bouton "Se connecter"', () => {
    renderLoginPage();
    expect(screen.getByRole('button', { name: 'Se connecter' })).toBeInTheDocument();
  });

  it('affiche le titre CESIZen', () => {
    renderLoginPage();
    expect(screen.getByText(/CESIZen/)).toBeInTheDocument();
  });

  it('affiche un lien vers la page d\'inscription', () => {
    renderLoginPage();
    // Le texte du lien contient "Créer un compte"
    expect(screen.getByText(/Créer un compte/i)).toBeInTheDocument();
  });

  // ─── Gestion des erreurs ──────────────────────────────────────────────────

  it('affiche "Email ou mot de passe incorrect." si le login retourne 401', async () => {
    // Simule une erreur 401 côté API
    vi.mocked(authService.login).mockRejectedValueOnce({
      response: { status: 401 },
    });

    renderLoginPage();

    // Remplit les champs
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'mauvais@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Mot de passe'), {
      target: { value: 'mauvais-mdp' },
    });

    // Soumet le formulaire
    fireEvent.click(screen.getByRole('button', { name: 'Se connecter' }));

    // Attend que le message d'erreur s'affiche (la requête est async)
    await waitFor(() => {
      expect(screen.getByText('Email ou mot de passe incorrect.')).toBeInTheDocument();
    });
  });

  it('affiche un message d\'erreur générique pour les autres erreurs serveur', async () => {
    // Simule une erreur 500
    vi.mocked(authService.login).mockRejectedValueOnce({
      response: { status: 500 },
    });

    renderLoginPage();

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Mot de passe'), {
      target: { value: 'mdp' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Se connecter' }));

    await waitFor(() => {
      expect(screen.getByText('Une erreur est survenue. Réessaie plus tard.')).toBeInTheDocument();
    });
  });

  // ─── Chargement ───────────────────────────────────────────────────────────

  it('le bouton est désactivé pendant la soumission du formulaire', async () => {
    // Simule un appel API qui ne se résout jamais (reste en "pending")
    vi.mocked(authService.login).mockImplementationOnce(
      () => new Promise(() => {}) // promesse qui ne se résout pas
    );

    renderLoginPage();

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Mot de passe'), {
      target: { value: 'mdp' },
    });

    // Soumet le formulaire
    fireEvent.click(screen.getByRole('button', { name: 'Se connecter' }));

    // Le bouton doit maintenant afficher "Connexion en cours..." et être désactivé
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Connexion en cours...' })).toBeDisabled();
    });
  });
});
