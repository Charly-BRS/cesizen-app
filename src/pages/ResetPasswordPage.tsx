// src/pages/ResetPasswordPage.tsx
// Page de définition d'un nouveau mot de passe.
//
// Flux :
//   1. L'utilisateur arrive ici depuis le lien reçu par email
//      → /reset-password?token=abc123...
//   2. Le token est lu depuis l'URL (query param "token")
//   3. Si aucun token n'est présent, on affiche un message d'aide
//   4. Sinon, on affiche le formulaire pour choisir un nouveau mot de passe
//   5. On envoie POST /api/auth/reset-with-token { token, nouveauMotDePasse }
//   6. En cas de succès, on redirige vers /login

import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import apiClient from '../services/api';

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Récupère le token depuis l'URL (?token=...)
  // Si absent, tokenUrl sera null → on affiche le message d'aide
  const tokenUrl = searchParams.get('token');

  const [nouveauMdp, setNouveauMdp] = useState('');
  const [confirmMdp, setConfirmMdp] = useState('');
  const [mdpVisible, setMdpVisible] = useState(false);

  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur]         = useState('');
  const [succes, setSucces]         = useState('');

  // ── Indicateur de force du mot de passe ────────────────────────────────────
  const forceMotDePasse = (): { niveau: number; label: string; couleur: string } => {
    const mdp = nouveauMdp;
    if (mdp.length === 0) return { niveau: 0, label: '', couleur: '' };
    if (mdp.length < 8)   return { niveau: 1, label: 'Trop court',  couleur: 'bg-red-400'     };
    let score = 0;
    if (mdp.length >= 10)          score++;
    if (/[A-Z]/.test(mdp))         score++;
    if (/[0-9]/.test(mdp))         score++;
    if (/[^A-Za-z0-9]/.test(mdp))  score++;
    if (score <= 1) return { niveau: 2, label: 'Faible',    couleur: 'bg-orange-400'  };
    if (score === 2) return { niveau: 3, label: 'Correct',  couleur: 'bg-amber-400'   };
    if (score === 3) return { niveau: 4, label: 'Fort',     couleur: 'bg-emerald-400' };
    return               { niveau: 4, label: 'Excellent', couleur: 'bg-emerald-500' };
  };

  const force = forceMotDePasse();

  // ── Soumission du formulaire ───────────────────────────────────────────────
  const handleSoumission = async (e: FormEvent) => {
    e.preventDefault();
    setErreur('');

    // Vérifications côté client avant d'appeler l'API
    if (nouveauMdp.length < 8) {
      setErreur('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (nouveauMdp !== confirmMdp) {
      setErreur('Les deux mots de passe ne correspondent pas.');
      return;
    }

    setChargement(true);
    try {
      // POST /api/auth/reset-with-token
      // Le token identifie l'utilisateur — pas besoin de l'email
      await apiClient.post('/auth/reset-with-token', {
        token:             tokenUrl,
        nouveauMotDePasse: nouveauMdp,
      });

      setSucces('Mot de passe réinitialisé avec succès !');

      // Redirige automatiquement vers la page de connexion après 2 secondes
      setTimeout(() => navigate('/login'), 2000);

    } catch (err: unknown) {
      // Affiche le message d'erreur renvoyé par l'API si disponible
      if (err && typeof err === 'object' && 'response' in err) {
        const errAxios = err as { response: { data: { message?: string } } };
        setErreur(errAxios.response.data.message ?? 'Lien invalide ou expiré.');
      } else {
        setErreur('Impossible de contacter le serveur.');
      }
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
          <p className="text-slate-500 mt-2">Définir un nouveau mot de passe</p>
        </div>

        {/* ── Cas 1 : aucun token dans l'URL ── */}
        {!tokenUrl && (
          <div className="flex flex-col gap-5">
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-4 text-sm text-amber-800">
              <p className="font-semibold mb-2">⚠️ Aucun lien de réinitialisation détecté</p>
              <p>
                Utilise le lien reçu par email pour accéder à cette page.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
              <p className="text-sm font-semibold text-blue-800 mb-2">
                📬 Comment faire ?
              </p>
              <p className="text-xs text-blue-700">
                Fais une demande de réinitialisation, puis clique sur le lien reçu dans ta boîte mail.
                Le lien est valable <strong>1 heure</strong>.
              </p>
            </div>

            <Link
              to="/forgot-password"
              className="text-center bg-green-700 hover:bg-green-800 text-white font-bold py-2.5 rounded-xl transition-colors text-sm"
            >
              Recevoir un email de réinitialisation
            </Link>
          </div>
        )}

        {/* ── Cas 2 : succès après soumission ── */}
        {tokenUrl && succes && (
          <div className="text-center flex flex-col gap-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-3xl mx-auto">
              ✅
            </div>
            <p className="text-lg font-bold text-emerald-700">{succes}</p>
            <p className="text-sm text-slate-500">Redirection vers la connexion…</p>
          </div>
        )}

        {/* ── Cas 3 : formulaire de choix du nouveau mot de passe ── */}
        {tokenUrl && !succes && (
          <>
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-6 text-sm text-blue-700">
              🔑 Choisis un nouveau mot de passe pour ton compte.
            </div>

            {erreur && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4 text-sm flex items-center gap-2">
                ⚠️ {erreur}
              </div>
            )}

            <form onSubmit={handleSoumission} className="flex flex-col gap-4">

              {/* Nouveau mot de passe */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Nouveau mot de passe <span className="text-slate-400">(8 caractères min.)</span>
                </label>
                <div className="relative">
                  <input
                    type={mdpVisible ? 'text' : 'password'}
                    value={nouveauMdp}
                    onChange={(e) => setNouveauMdp(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setMdpVisible((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {mdpVisible ? '🙈' : '👁️'}
                  </button>
                </div>

                {/* Barre de force du mot de passe */}
                {nouveauMdp.length > 0 && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4].map((n) => (
                        <div
                          key={n}
                          className={`h-1.5 flex-1 rounded-full transition-colors ${
                            force.niveau >= n ? force.couleur : 'bg-slate-100'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-slate-400">{force.label}</p>
                  </div>
                )}
              </div>

              {/* Confirmation du mot de passe */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Confirmer le mot de passe
                </label>
                <input
                  type={mdpVisible ? 'text' : 'password'}
                  value={confirmMdp}
                  onChange={(e) => setConfirmMdp(e.target.value)}
                  placeholder="••••••••"
                  required
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 transition ${
                    confirmMdp && confirmMdp !== nouveauMdp
                      ? 'border-red-300 bg-red-50'
                      : confirmMdp && confirmMdp === nouveauMdp
                      ? 'border-emerald-300 bg-emerald-50'
                      : 'border-slate-300'
                  }`}
                />
                {confirmMdp && confirmMdp !== nouveauMdp && (
                  <p className="text-xs text-red-500 mt-1">❌ Les mots de passe ne correspondent pas</p>
                )}
                {confirmMdp && confirmMdp === nouveauMdp && (
                  <p className="text-xs text-emerald-600 mt-1">✅ Les mots de passe correspondent</p>
                )}
              </div>

              {/* Bouton de soumission */}
              <button
                type="submit"
                disabled={chargement || nouveauMdp !== confirmMdp || nouveauMdp.length < 8}
                className="bg-green-700 hover:bg-green-800 disabled:bg-green-300 text-white font-bold py-2.5 rounded-xl transition-colors mt-1"
              >
                {chargement ? 'Réinitialisation…' : '🔓 Réinitialiser mon mot de passe'}
              </button>
            </form>
          </>
        )}

        {/* Liens bas de page */}
        <div className="flex justify-between mt-6">
          <Link to="/forgot-password" className="text-sm text-slate-400 hover:text-slate-600 transition-colors">
            ← Nouvelle demande
          </Link>
          <Link to="/login" className="text-sm text-green-700 hover:underline font-medium">
            Retour à la connexion
          </Link>
        </div>

      </div>
    </div>
  );
};

export default ResetPasswordPage;
