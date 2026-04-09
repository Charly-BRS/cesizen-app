// src/pages/ForgotPasswordPage.tsx
// Page "Mot de passe oublié" — accessible depuis la page de connexion.
//
// Étape 1 : l'utilisateur saisit son email.
// Étape 2 : un code de réinitialisation est affiché (en production, il serait envoyé par email).
// Étape 3 : l'utilisateur clique sur "J'ai mon code" pour aller saisir le nouveau mot de passe.

import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../services/api';

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();

  // Étapes : 'saisie' → 'succes'
  const [etape, setEtape]       = useState<'saisie' | 'succes'>('saisie');
  const [email, setEmail]       = useState('');
  const [code, setCode]         = useState('');    // code retourné par l'API (mode démo)
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur]     = useState('');

  const handleSoumission = async (e: FormEvent) => {
    e.preventDefault();
    setErreur('');
    setChargement(true);

    try {
      // POST /api/auth/forgot-password
      // En mode démo, l'API retourne le code directement (pas d'envoi email)
      const reponse = await apiClient.post<{ message: string; token?: string }>(
        '/auth/forgot-password',
        { email }
      );
      // Sauvegarde le code pour l'afficher à l'étape 2
      setCode(reponse.data.token ?? '');
      setEtape('succes');
    } catch {
      // On affiche toujours le même message pour ne pas révéler si l'email existe
      setEtape('succes');
      setCode('');
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-md w-full max-w-md p-8">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/login" className="inline-block">
            <h1 className="text-3xl font-bold text-green-700">🧘 CESIZen</h1>
          </Link>
          <p className="text-slate-500 mt-2">Réinitialisation du mot de passe</p>
        </div>

        {/* ── Étape 1 : saisie de l'email ── */}
        {etape === 'saisie' && (
          <>
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-6 text-sm text-blue-700">
              🔑 Saisis ton adresse email. Un code de réinitialisation te sera fourni.
            </div>

            {erreur && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4 text-sm">
                {erreur}
              </div>
            )}

            <form onSubmit={handleSoumission} className="flex flex-col gap-5">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Adresse email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ton@email.fr"
                  required
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 transition"
                />
              </div>

              <button
                type="submit"
                disabled={chargement}
                className="bg-green-700 hover:bg-green-800 disabled:bg-green-300 text-white font-bold py-2.5 rounded-xl transition-colors"
              >
                {chargement ? 'Envoi en cours…' : 'Obtenir un code de réinitialisation'}
              </button>
            </form>
          </>
        )}

        {/* ── Étape 2 : succès + affichage du code ── */}
        {etape === 'succes' && (
          <div className="flex flex-col gap-5">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                ✅
              </div>
              <p className="text-lg font-bold text-slate-800">Demande envoyée !</p>
              <p className="text-sm text-slate-500 mt-1">
                Si l'adresse <strong>{email}</strong> est associée à un compte, un code a été généré.
              </p>
            </div>

            {/* Affichage du code (mode démo uniquement) */}
            {code && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">🔑</span>
                  <p className="text-sm font-bold text-amber-800">Ton code de réinitialisation</p>
                </div>
                {/* Code affiché en grand pour faciliter la copie */}
                <div
                  className="bg-white border-2 border-amber-300 rounded-xl px-4 py-3 text-center font-mono text-2xl font-bold text-amber-700 tracking-[0.3em] select-all cursor-pointer hover:bg-amber-50 transition-colors"
                  title="Clique pour sélectionner"
                  onClick={(e) => {
                    const sel = window.getSelection();
                    const range = document.createRange();
                    range.selectNodeContents(e.currentTarget);
                    sel?.removeAllRanges();
                    sel?.addRange(range);
                  }}
                >
                  {code}
                </div>
                <p className="text-xs text-amber-600 mt-2 text-center">
                  ⏱️ Ce code expire dans 1 heure · Clique pour copier
                </p>
                <div className="mt-3 bg-amber-100 rounded-lg px-3 py-2 text-xs text-amber-700">
                  <strong>Mode démo :</strong> En production, ce code serait envoyé par email.
                </div>
              </div>
            )}

            {/* Bouton vers la page de reset */}
            <button
              onClick={() => navigate(`/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(code)}`)}
              className="bg-green-700 hover:bg-green-800 text-white font-bold py-2.5 rounded-xl transition-colors text-sm"
            >
              J'ai mon code → Définir un nouveau mot de passe
            </button>
          </div>
        )}

        {/* Retour au login */}
        <p className="text-center text-sm text-slate-500 mt-6">
          <Link to="/login" className="text-green-700 hover:underline font-medium">
            ← Retour à la connexion
          </Link>
        </p>

      </div>
    </div>
  );
};

export default ForgotPasswordPage;
