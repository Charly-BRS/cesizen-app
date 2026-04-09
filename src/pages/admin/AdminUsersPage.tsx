// src/pages/admin/AdminUsersPage.tsx
// Page d'administration des utilisateurs.
//
// Fonctionnalités :
//   - Voir tous les comptes (nom, email, rôle, statut, date)
//   - Activer / désactiver un compte
//   - Changer le rôle : Utilisateur ↔ Rédacteur ↔ Administrateur
//   - Réinitialiser le mot de passe d'un utilisateur (modal)
//
// Rôles disponibles :
//   ROLE_USER      → utilisateur standard (lecture seule)
//   ROLE_REDACTEUR → peut créer et modifier des articles
//   ROLE_ADMIN     → accès complet + gestion des utilisateurs

import { useEffect, useState } from 'react';
import {
  getTousUtilisateurs,
  toggleActifUtilisateur,
  definirRolesUtilisateur,
  resetMotDePasseAdmin,
} from '../../services/adminService';
import type { UtilisateurAdmin } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';

// ── Helpers ───────────────────────────────────────────────────────────────────

// Détermine le rôle "principal" d'un utilisateur (le plus élevé)
const rolePrincipal = (roles: string[]): 'ROLE_ADMIN' | 'ROLE_REDACTEUR' | 'ROLE_USER' => {
  if (roles.includes('ROLE_ADMIN'))     return 'ROLE_ADMIN';
  if (roles.includes('ROLE_REDACTEUR')) return 'ROLE_REDACTEUR';
  return 'ROLE_USER';
};

// Config visuelle des rôles
const ROLES_CONFIG = {
  ROLE_ADMIN:     { label: 'Admin',      classes: 'bg-purple-100 text-purple-700 border-purple-200',   emoji: '👑' },
  ROLE_REDACTEUR: { label: 'Rédacteur',  classes: 'bg-blue-100   text-blue-700   border-blue-200',     emoji: '✍️' },
  ROLE_USER:      { label: 'Utilisateur',classes: 'bg-slate-100  text-slate-600  border-slate-200',    emoji: '👤' },
};

// Génère un mot de passe aléatoire sécurisé (12 caractères)
const genererMotDePasse = (): string => {
  const chars = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%&';
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

// ── Composant principal ───────────────────────────────────────────────────────
const AdminUsersPage: React.FC = () => {
  const { utilisateur: moi } = useAuth();

  const [utilisateurs, setUtilisateurs] = useState<UtilisateurAdmin[]>([]);
  const [chargement, setChargement]     = useState(true);
  const [erreur, setErreur]             = useState('');
  const [recherche, setRecherche]       = useState('');

  // Modal reset mot de passe
  const [modalReset, setModalReset] = useState<UtilisateurAdmin | null>(null);
  const [nouveauMdp, setNouveauMdp] = useState('');
  const [mdpVisible, setMdpVisible] = useState(false);
  const [resetEnCours, setResetEnCours] = useState(false);
  const [resetSucces, setResetSucces]   = useState('');

  useEffect(() => { charger(); }, []);

  const charger = async () => {
    setChargement(true);
    try {
      const donnees = await getTousUtilisateurs();
      // Tri : admins d'abord, puis rédacteurs, puis utilisateurs, puis par nom
      setUtilisateurs(donnees.sort((a, b) => {
        const ordre = { ROLE_ADMIN: 0, ROLE_REDACTEUR: 1, ROLE_USER: 2 };
        const diff = ordre[rolePrincipal(a.roles)] - ordre[rolePrincipal(b.roles)];
        if (diff !== 0) return diff;
        return `${a.prenom} ${a.nom}`.localeCompare(`${b.prenom} ${b.nom}`);
      }));
    } catch {
      setErreur('Impossible de charger les utilisateurs.');
    } finally {
      setChargement(false);
    }
  };

  // Active / désactive un compte
  const handleToggleActif = async (u: UtilisateurAdmin) => {
    try {
      await toggleActifUtilisateur(u.id, !u.isActif);
      setUtilisateurs((prev) =>
        prev.map((x) => x.id === u.id ? { ...x, isActif: !u.isActif } : x)
      );
    } catch {
      alert('Erreur lors de la mise à jour du compte.');
    }
  };

  // Change le rôle principal d'un utilisateur
  const handleChangerRole = async (u: UtilisateurAdmin, nouveauRole: string) => {
    // L'admin ne peut pas changer son propre rôle (risque de se rétrograder)
    if (u.id === moi?.id) {
      alert('Vous ne pouvez pas modifier votre propre rôle.');
      return;
    }
    try {
      // Si le rôle cliqué est déjà le rôle actuel → repasse en utilisateur standard
      const roleCourant = rolePrincipal(u.roles);
      const roles = roleCourant === nouveauRole ? [] : [nouveauRole];

      await definirRolesUtilisateur(u.id, roles);
      setUtilisateurs((prev) =>
        prev.map((x) => x.id === u.id ? { ...x, roles: roles.length ? roles : ['ROLE_USER'] } : x)
      );
    } catch {
      alert('Erreur lors du changement de rôle.');
    }
  };

  // Ouvre la modal de reset mot de passe
  const ouvrirModalReset = (u: UtilisateurAdmin) => {
    setModalReset(u);
    setNouveauMdp(genererMotDePasse()); // pré-remplit avec un mot de passe généré
    setMdpVisible(false);
    setResetSucces('');
    setResetEnCours(false);
  };

  // Confirme le reset du mot de passe
  const handleReset = async () => {
    if (!modalReset) return;
    if (nouveauMdp.length < 8) {
      alert('Le mot de passe doit faire au moins 8 caractères.');
      return;
    }
    setResetEnCours(true);
    try {
      await resetMotDePasseAdmin(modalReset.id, nouveauMdp);
      setResetSucces(`Mot de passe de ${modalReset.prenom} réinitialisé avec succès.`);
    } catch {
      alert('Erreur lors de la réinitialisation.');
    } finally {
      setResetEnCours(false);
    }
  };

  // Filtre selon la recherche (nom, email)
  const utilisateursFiltres = utilisateurs.filter((u) => {
    if (!recherche) return true;
    const q = recherche.toLowerCase();
    return (
      u.prenom.toLowerCase().includes(q) ||
      u.nom.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  });

  // Stats rapides
  const nbAdmins     = utilisateurs.filter((u) => u.roles.includes('ROLE_ADMIN')).length;
  const nbRedacteurs = utilisateurs.filter((u) => u.roles.includes('ROLE_REDACTEUR')).length;
  const nbActifs     = utilisateurs.filter((u) => u.isActif).length;

  return (
    <div className="flex-1 bg-slate-50">

      {/* ── Bannière ── */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-700 text-white">
        <div className="max-w-6xl mx-auto px-6 py-10 animate-fade-in">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">
            Administration
          </p>
          <h1 className="text-3xl font-bold">Gestion des utilisateurs 👥</h1>
          <p className="text-slate-400 mt-2">
            Gérez les comptes, les rôles et les accès de vos utilisateurs.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* ── Stats rapides ── */}
        {!chargement && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 stagger">
            {[
              { val: utilisateurs.length, label: 'Comptes total',   emoji: '👥', c: 'bg-white border-slate-100' },
              { val: nbActifs,            label: 'Comptes actifs',  emoji: '✅', c: 'bg-emerald-50 border-emerald-100' },
              { val: nbRedacteurs,        label: 'Rédacteurs',      emoji: '✍️', c: 'bg-blue-50 border-blue-100'    },
              { val: nbAdmins,            label: 'Administrateurs', emoji: '👑', c: 'bg-purple-50 border-purple-100' },
            ].map(({ val, label, emoji, c }) => (
              <div key={label} className={`rounded-2xl border p-4 shadow-sm animate-fade-in-up ${c}`}>
                <p className="text-xl">{emoji}</p>
                <p className="text-2xl font-bold text-slate-700 mt-1">{val}</p>
                <p className="text-xs text-slate-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Barre de recherche ── */}
        <div className="mb-4 flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Rechercher par nom ou email…"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
            />
          </div>
          {recherche && (
            <p className="text-sm text-slate-500">
              {utilisateursFiltres.length} résultat{utilisateursFiltres.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* ── Chargement ── */}
        {chargement && (
          <div className="bg-white rounded-2xl border border-slate-100 p-8">
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-4 items-center">
                  <div className="skeleton w-9 h-9 rounded-full" />
                  <div className="flex-1"><div className="skeleton h-4 w-1/3 mb-1.5" /><div className="skeleton h-3 w-1/4" /></div>
                  <div className="skeleton h-6 w-20 rounded-full" />
                  <div className="skeleton h-6 w-16 rounded-full" />
                  <div className="skeleton h-8 w-32 rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Erreur ── */}
        {erreur && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-4">
            ⚠️ {erreur}
          </div>
        )}

        {/* ── Tableau ── */}
        {!chargement && !erreur && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">
                    Inscription
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Rôle
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {utilisateursFiltres.map((u) => {
                  const role   = rolePrincipal(u.roles);
                  const cfg    = ROLES_CONFIG[role];
                  const estMoi = u.id === moi?.id;

                  return (
                    <tr key={u.id} className={`hover:bg-slate-50 transition-colors ${!u.isActif ? 'opacity-60' : ''}`}>

                      {/* Nom + email */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {/* Avatar initiales */}
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                            role === 'ROLE_ADMIN'     ? 'bg-purple-100 text-purple-700' :
                            role === 'ROLE_REDACTEUR' ? 'bg-blue-100   text-blue-700'   :
                                                        'bg-slate-100  text-slate-600'
                          }`}>
                            {u.prenom[0]}{u.nom[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">
                              {u.prenom} {u.nom}
                              {estMoi && <span className="ml-1.5 text-xs text-emerald-600 font-normal">(vous)</span>}
                            </p>
                            <p className="text-slate-400 text-xs">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Date d'inscription */}
                      <td className="px-5 py-4 text-slate-400 text-xs hidden md:table-cell">
                        {new Date(u.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })}
                      </td>

                      {/* Badge rôle */}
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.classes}`}>
                          <span>{cfg.emoji}</span>
                          {cfg.label}
                        </span>
                      </td>

                      {/* Statut */}
                      <td className="px-5 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                          u.isActif
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-red-50 text-red-600 border-red-200'
                        }`}>
                          {u.isActif ? '● Actif' : '● Désactivé'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1.5">

                          {/* Toggle actif/inactif */}
                          <button
                            onClick={() => handleToggleActif(u)}
                            disabled={estMoi}
                            title={estMoi ? 'Impossible de désactiver votre propre compte' : ''}
                            className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                              u.isActif
                                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                            }`}
                          >
                            {u.isActif ? 'Désactiver' : 'Activer'}
                          </button>

                          {/* Bouton → Rédacteur */}
                          <button
                            onClick={() => handleChangerRole(u, 'ROLE_REDACTEUR')}
                            disabled={estMoi}
                            title="Donner/retirer le rôle Rédacteur"
                            className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                              role === 'ROLE_REDACTEUR'
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                            }`}
                          >
                            ✍️ Rédacteur
                          </button>

                          {/* Bouton → Admin */}
                          <button
                            onClick={() => handleChangerRole(u, 'ROLE_ADMIN')}
                            disabled={estMoi}
                            title="Donner/retirer le rôle Admin"
                            className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                              role === 'ROLE_ADMIN'
                                ? 'bg-purple-600 text-white hover:bg-purple-700'
                                : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                            }`}
                          >
                            👑 Admin
                          </button>

                          {/* Reset MDP */}
                          <button
                            onClick={() => ouvrirModalReset(u)}
                            title="Réinitialiser le mot de passe"
                            className="text-xs px-2.5 py-1.5 rounded-lg font-medium bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors"
                          >
                            🔑 MDP
                          </button>

                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {utilisateursFiltres.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <p className="text-4xl mb-3">🔍</p>
                <p className="text-sm">Aucun utilisateur ne correspond à "{recherche}"</p>
              </div>
            )}
          </div>
        )}

        {/* ── Légende des rôles ── */}
        {!chargement && (
          <div className="mt-6 bg-white rounded-2xl border border-slate-100 p-5">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Explication des rôles
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex gap-3 items-start">
                <span className="text-xl">👤</span>
                <div>
                  <p className="text-sm font-semibold text-slate-700">Utilisateur</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Accès en lecture : articles, exercices, historique personnel.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <span className="text-xl">✍️</span>
                <div>
                  <p className="text-sm font-semibold text-slate-700">Rédacteur</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Peut créer et modifier des articles. Ne peut pas gérer les utilisateurs.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <span className="text-xl">👑</span>
                <div>
                  <p className="text-sm font-semibold text-slate-700">Administrateur</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Accès complet : gestion des utilisateurs, exercices et articles.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ══════════════════════════════════════════════════════════
          MODAL — Réinitialisation du mot de passe
          ══════════════════════════════════════════════════════════ */}
      {modalReset && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4 animate-fade-in"
          onClick={(e) => { if (e.target === e.currentTarget) setModalReset(null); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in-up">

            {/* En-tête */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  🔑 Réinitialiser le mot de passe
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Pour <span className="font-semibold text-slate-700">
                    {modalReset.prenom} {modalReset.nom}
                  </span>
                  <span className="text-slate-400"> · {modalReset.email}</span>
                </p>
              </div>
              <button
                onClick={() => setModalReset(null)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold leading-none"
              >
                ×
              </button>
            </div>

            {/* Succès */}
            {resetSucces ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                <p className="text-2xl mb-2">✅</p>
                <p className="text-sm font-semibold text-emerald-700">{resetSucces}</p>
                <p className="text-xs text-emerald-600 mt-1">
                  Communique ce mot de passe à l'utilisateur de façon sécurisée.
                </p>
                <div className="mt-3 bg-emerald-100 border border-emerald-300 rounded-lg px-4 py-2 font-mono text-sm font-bold text-emerald-800 select-all">
                  {nouveauMdp}
                </div>
                <button
                  onClick={() => setModalReset(null)}
                  className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2 rounded-xl transition-colors text-sm"
                >
                  Fermer
                </button>
              </div>
            ) : (
              <>
                {/* Avertissement */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4 text-xs text-amber-700">
                  ⚠️ L'utilisateur devra utiliser ce nouveau mot de passe pour se connecter.
                  Son ancien mot de passe sera définitivement remplacé.
                </div>

                {/* Champ mot de passe */}
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Nouveau mot de passe <span className="text-slate-400">(8 caractères min.)</span>
                </label>
                <div className="relative mb-4">
                  <input
                    type={mdpVisible ? 'text' : 'password'}
                    value={nouveauMdp}
                    onChange={(e) => setNouveauMdp(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 pr-24 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
                    placeholder="Nouveau mot de passe…"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                    {/* Bouton afficher/masquer */}
                    <button
                      type="button"
                      onClick={() => setMdpVisible((v) => !v)}
                      className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1 rounded transition-colors"
                      title={mdpVisible ? 'Masquer' : 'Afficher'}
                    >
                      {mdpVisible ? '🙈' : '👁️'}
                    </button>
                    {/* Bouton générer */}
                    <button
                      type="button"
                      onClick={() => setNouveauMdp(genererMotDePasse())}
                      className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded transition-colors"
                      title="Générer un mot de passe aléatoire"
                    >
                      🎲
                    </button>
                  </div>
                </div>

                {/* Force du mot de passe */}
                {nouveauMdp.length > 0 && (
                  <div className="mb-4">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4].map((n) => (
                        <div
                          key={n}
                          className={`h-1.5 flex-1 rounded-full transition-colors ${
                            nouveauMdp.length >= n * 3
                              ? n <= 2 ? 'bg-red-400' : n === 3 ? 'bg-amber-400' : 'bg-emerald-500'
                              : 'bg-slate-100'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-slate-400">
                      {nouveauMdp.length < 8 ? '❌ Trop court' :
                       nouveauMdp.length < 10 ? '⚠️ Acceptable' :
                       nouveauMdp.length < 12 ? '✅ Bon' : '💪 Excellent'}
                    </p>
                  </div>
                )}

                {/* Boutons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setModalReset(null)}
                    className="flex-1 border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold py-2.5 rounded-xl transition-colors text-sm"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleReset}
                    disabled={resetEnCours || nouveauMdp.length < 8}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-200 text-white font-bold py-2.5 rounded-xl transition-colors text-sm"
                  >
                    {resetEnCours ? 'Réinitialisation…' : 'Confirmer le reset'}
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

export default AdminUsersPage;
