// src/pages/ProfilPage.tsx
// Page de profil de l'utilisateur connecté.
// Permet de modifier son prénom/nom et de changer son mot de passe.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { modifierProfil, changerMotDePasse, desactiverCompte } from '../services/authService';

const ProfilPage: React.FC = () => {
  const navigate = useNavigate();
  const { utilisateur, mettreAJourUtilisateur, deconnecter } = useAuth();

  // ── Section infos personnelles ─────────────────────────────
  const [prenom, setPrenom]           = useState(utilisateur?.prenom ?? '');
  const [nom, setNom]                 = useState(utilisateur?.nom ?? '');
  const [enregistrementProfil, setEnregistrementProfil] = useState(false);
  const [succesProfil, setSuccesProfil]   = useState('');
  const [erreurProfil, setErreurProfil]   = useState('');

  const handleSauvegarderProfil = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!utilisateur) return;

    setEnregistrementProfil(true);
    setSuccesProfil('');
    setErreurProfil('');

    try {
      await modifierProfil(utilisateur.id, { prenom, nom });
      // Met à jour le prénom/nom dans le contexte React (et localStorage)
      mettreAJourUtilisateur({ prenom, nom });
      setSuccesProfil('Profil mis à jour avec succès !');
    } catch {
      setErreurProfil('Impossible de mettre à jour le profil. Réessaie.');
    } finally {
      setEnregistrementProfil(false);
    }
  };

  // ── Section changement de mot de passe ─────────────────────
  const [ancienMdp, setAncienMdp]         = useState('');
  const [nouveauMdp, setNouveauMdp]       = useState('');
  const [confirmMdp, setConfirmMdp]       = useState('');
  const [enregistrementMdp, setEnregistrementMdp] = useState(false);
  const [succesMdp, setSuccesMdp]         = useState('');
  const [erreurMdp, setErreurMdp]         = useState('');

  // ── Section désactivation du compte (RGPD) ─────────────────
  // Affiche une modale de confirmation avant d'envoyer la demande
  const [afficherConfirmation, setAfficherConfirmation] = useState(false);
  const [desactivationEnCours, setDesactivationEnCours]   = useState(false);
  const [erreurDesactivation, setErreurDesactivation]     = useState('');

  const handleDesactiverCompte = async () => {
    setDesactivationEnCours(true);
    setErreurDesactivation('');

    try {
      await desactiverCompte();
      // Désactivation réussie : déconnecte l'utilisateur et le renvoie à l'accueil
      deconnecter();
      navigate('/');
    } catch {
      setErreurDesactivation('Impossible de désactiver le compte. Réessaie plus tard.');
      setDesactivationEnCours(false);
    }
  };

  const handleChangerMotDePasse = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccesMdp('');
    setErreurMdp('');

    // Vérification locale : les deux nouveaux mots de passe doivent correspondre
    if (nouveauMdp !== confirmMdp) {
      setErreurMdp('Les deux nouveaux mots de passe ne correspondent pas.');
      return;
    }

    if (nouveauMdp.length < 8) {
      setErreurMdp('Le nouveau mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    setEnregistrementMdp(true);

    try {
      const reponse = await changerMotDePasse(ancienMdp, nouveauMdp);
      setSuccesMdp(reponse.message);
      // Vide les champs après succès
      setAncienMdp('');
      setNouveauMdp('');
      setConfirmMdp('');
    } catch (err: unknown) {
      // Récupère le message d'erreur renvoyé par l'API (ex: "Ancien mot de passe incorrect")
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setErreurMdp(
        axiosErr?.response?.data?.message ?? 'Une erreur est survenue. Réessaie.'
      );
    } finally {
      setEnregistrementMdp(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">

        {/* En-tête */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800">👤 Mon profil</h1>
          <p className="text-gray-500 mt-1">{utilisateur?.email}</p>
        </div>

        {/* ── Carte : Informations personnelles ─────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-5">
            Informations personnelles
          </h2>

          <form onSubmit={handleSauvegarderProfil} className="space-y-4">

            <div className="grid grid-cols-2 gap-4">
              {/* Prénom */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prénom
                </label>
                <input
                  type="text"
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  required
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              {/* Nom */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom
                </label>
                <input
                  type="text"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  required
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>

            {/* Email (lecture seule) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-gray-400 font-normal">(non modifiable)</span>
              </label>
              <input
                type="email"
                value={utilisateur?.email ?? ''}
                readOnly
                className="w-full border border-gray-100 rounded-lg px-4 py-2.5 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
              />
            </div>

            {/* Messages de succès / erreur */}
            {succesProfil && (
              <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm">
                ✅ {succesProfil}
              </div>
            )}
            {erreurProfil && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                {erreurProfil}
              </div>
            )}

            <button
              type="submit"
              disabled={enregistrementProfil}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm"
            >
              {enregistrementProfil ? 'Enregistrement...' : 'Sauvegarder'}
            </button>

          </form>
        </div>

        {/* ── Carte : Changer le mot de passe ───────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-5">
            Changer le mot de passe
          </h2>

          <form onSubmit={handleChangerMotDePasse} className="space-y-4">

            {/* Ancien mot de passe */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe actuel
              </label>
              <input
                type="password"
                value={ancienMdp}
                onChange={(e) => setAncienMdp(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* Nouveau mot de passe */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nouveau mot de passe
              </label>
              <input
                type="password"
                value={nouveauMdp}
                onChange={(e) => setNouveauMdp(e.target.value)}
                required
                placeholder="8 caractères minimum"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* Confirmation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmer le nouveau mot de passe
              </label>
              <input
                type="password"
                value={confirmMdp}
                onChange={(e) => setConfirmMdp(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* Messages de succès / erreur */}
            {succesMdp && (
              <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm">
                ✅ {succesMdp}
              </div>
            )}
            {erreurMdp && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                {erreurMdp}
              </div>
            )}

            <button
              type="submit"
              disabled={enregistrementMdp}
              className="bg-gray-800 hover:bg-gray-900 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm"
            >
              {enregistrementMdp ? 'Modification...' : 'Changer le mot de passe'}
            </button>

          </form>
        </div>

        {/* ── Carte : Zone sensible — désactivation du compte ───── */}
        <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-6">
          <h2 className="text-lg font-semibold text-red-700 mb-1">
            Désactiver mon compte
          </h2>
          <p className="text-sm text-gray-500 mb-5">
            Ton compte sera désactivé immédiatement. Tes données seront conservées
            30 jours puis supprimées définitivement, conformément au RGPD.
          </p>

          {erreurDesactivation && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">
              {erreurDesactivation}
            </div>
          )}

          {/* Bouton d'ouverture de la modale de confirmation */}
          {!afficherConfirmation ? (
            <button
              type="button"
              onClick={() => setAfficherConfirmation(true)}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm"
            >
              Désactiver mon compte
            </button>
          ) : (
            /* Modale de confirmation inline */
            <div className="bg-red-50 border border-red-200 rounded-xl p-5 space-y-4">
              <p className="text-sm font-semibold text-red-800">
                Confirmes-tu la désactivation de ton compte ?
              </p>
              <p className="text-xs text-red-600">
                Cette action est irréversible. Tu seras déconnecté(e) immédiatement
                et ton compte sera supprimé dans 30 jours.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleDesactiverCompte}
                  disabled={desactivationEnCours}
                  className="bg-red-700 hover:bg-red-800 disabled:opacity-50 text-white font-semibold px-5 py-2 rounded-lg transition-colors text-sm"
                >
                  {desactivationEnCours ? 'Désactivation...' : 'Oui, désactiver'}
                </button>
                <button
                  type="button"
                  onClick={() => setAfficherConfirmation(false)}
                  className="bg-white hover:bg-gray-50 text-gray-700 font-semibold px-5 py-2 rounded-lg border border-gray-200 transition-colors text-sm"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ProfilPage;
