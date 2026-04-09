// src/test/AuthContext.test.tsx
// Tests unitaires pour AuthContext.tsx
//
// Ce que l'on teste :
//   - estConnecte vaut false quand il n'y a pas de token
//   - connecter() met estConnecte à true et sauvegarde dans localStorage
//   - deconnecter() remet l'état à zéro et vide localStorage
//   - mettreAJourUtilisateur() met à jour partiellement les données sans tout effacer
//
// Stratégie : on utilise renderHook() de @testing-library/react pour appeler
// le hook useAuth() dans un contexte AuthProvider contrôlé.

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { AuthProvider, useAuth } from '../context/AuthContext';

// ─── Wrapper ──────────────────────────────────────────────────────────────────
// Enveloppe les tests avec AuthProvider pour que useAuth() fonctionne
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

// ─── Données de test ──────────────────────────────────────────────────────────
const utilisateurTest = {
  id: 1,
  email: 'test@example.com',
  roles: ['ROLE_USER'],
  prenom: 'Jean',
  nom: 'Dupont',
};

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('AuthContext', () => {

  // Nettoie localStorage avant chaque test pour partir d'un état propre
  beforeEach(() => {
    localStorage.clear();
  });

  // ─── État initial ─────────────────────────────────────────────────────────

  it('estConnecte vaut false quand aucun token n\'est présent dans localStorage', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.estConnecte).toBe(false);
    expect(result.current.token).toBeNull();
    expect(result.current.utilisateur).toBeNull();
  });

  // ─── connecter() ──────────────────────────────────────────────────────────

  it('connecter() met estConnecte à true et sauvegarde le token dans localStorage', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    // Appelle connecter() dans un act() pour que React traite les mises à jour d'état
    act(() => {
      result.current.connecter(utilisateurTest, 'mon-token-jwt');
    });

    // Vérifie l'état React
    expect(result.current.estConnecte).toBe(true);
    expect(result.current.token).toBe('mon-token-jwt');
    expect(result.current.utilisateur?.email).toBe('test@example.com');

    // Vérifie la persistance dans localStorage
    expect(localStorage.getItem('jwt_token')).toBe('mon-token-jwt');
    expect(localStorage.getItem('utilisateur')).toContain('test@example.com');
  });

  it('connecter() sauvegarde les rôles de l\'utilisateur', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.connecter({ ...utilisateurTest, roles: ['ROLE_ADMIN'] }, 'token-admin');
    });

    expect(result.current.utilisateur?.roles).toContain('ROLE_ADMIN');
  });

  // ─── deconnecter() ────────────────────────────────────────────────────────

  it('deconnecter() remet estConnecte à false et vide localStorage', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    // Connexion préalable
    act(() => {
      result.current.connecter(utilisateurTest, 'mon-token-jwt');
    });

    // Déconnexion
    act(() => {
      result.current.deconnecter();
    });

    // Vérifie que tout est effacé
    expect(result.current.estConnecte).toBe(false);
    expect(result.current.token).toBeNull();
    expect(result.current.utilisateur).toBeNull();
    expect(localStorage.getItem('jwt_token')).toBeNull();
    expect(localStorage.getItem('utilisateur')).toBeNull();
  });

  // ─── mettreAJourUtilisateur() ─────────────────────────────────────────────

  it('mettreAJourUtilisateur() modifie uniquement les champs fournis', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    // Connexion préalable
    act(() => {
      result.current.connecter(utilisateurTest, 'mon-token-jwt');
    });

    // Mise à jour du nom seulement
    act(() => {
      result.current.mettreAJourUtilisateur({ nom: 'Martin' });
    });

    // Le nom a changé
    expect(result.current.utilisateur?.nom).toBe('Martin');
    // Le prénom est intact
    expect(result.current.utilisateur?.prenom).toBe('Jean');
    // L'email est intact
    expect(result.current.utilisateur?.email).toBe('test@example.com');
  });

  it('mettreAJourUtilisateur() persiste les changements dans localStorage', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.connecter(utilisateurTest, 'mon-token-jwt');
    });

    act(() => {
      result.current.mettreAJourUtilisateur({ prenom: 'Pierre' });
    });

    // Vérifie que localStorage est mis à jour
    const utilisateurSauvegarde = JSON.parse(localStorage.getItem('utilisateur') ?? '{}');
    expect(utilisateurSauvegarde.prenom).toBe('Pierre');
  });
});
