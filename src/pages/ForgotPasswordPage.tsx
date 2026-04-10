// src/pages/ForgotPasswordPage.tsx
// Page "Mot de passe oublié".
//
// L'utilisateur saisit son email. L'API génère un token et envoie un email
// via Symfony Mailer. En développement, l'email est intercepté par Mailpit :
//   http://localhost:8025

import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../services/api';

const ForgotPasswordPage: React.FC = () => {

  // Étapes : 'saisie' → 'succes'
  const [etape, setEtape]           = useState<'saisie' | 'succes'>('saisie');
  const [email, setEmail]           = useState('');
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur]         = useState('');

  const handleSoumission = async (e: FormEvent) => {
    e.preventDefault();
    setErreur('');
    setChargement(true);

    try {
      // POST /api/auth/forgot-password
      // L'API génère un token et logue le lien de réinitialisation dans stdout.
      // La réponse ne contient pas le token (sécurité).
      await apiClient.post('/auth/forgot-password', { email });
      setEtape('succes');
    } catch {
      // On passe quand même à l'étape succès pour ne pas révéler si l'email existe
      setEtape('succes');
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
              Saisis ton adresse email pour recevoir un lien de réinitialisation.
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
                {chargement ? 'Envoi en cours…' : 'Envoyer le lien de réinitialisation'}
              </button>
            </form>
          </>
        )}

        {/* ── Étape 2 : succès ── */}
        {etape === 'succes' && (
          <div className="flex flex-col gap-5">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                ✅
              </div>
              <p className="text-lg font-bold text-slate-800">Email envoyé !</p>
              <p className="text-sm text-slate-500 mt-1">
                Si <strong>{email}</strong> est associé à un compte, un email vient d'être envoyé.
              </p>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
              <p className="text-sm font-semibold text-blue-800 mb-2">
                📬 Consulte ta boîte mail
              </p>
              <p className="text-xs text-blue-700">
                Clique sur le lien dans l'email pour définir un nouveau mot de passe.
                Le lien est valable <strong>1 heure</strong>.
              </p>
              <p className="text-xs text-blue-500 mt-3">
                Tu ne vois rien ? Vérifie tes spams ou refais une demande.
              </p>
            </div>
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
