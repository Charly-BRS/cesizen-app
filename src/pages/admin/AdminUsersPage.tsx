// src/pages/admin/AdminUsersPage.tsx
// Page de gestion des utilisateurs pour l'administrateur.
// Permet de voir tous les comptes, les activer/désactiver et changer leur rôle.

import { useEffect, useState } from 'react';
import {
  getTousUtilisateurs,
  toggleActifUtilisateur,
  toggleRoleAdmin,
} from '../../services/adminService';
import type { UtilisateurAdmin } from '../../services/adminService';

const AdminUsersPage: React.FC = () => {
  const [utilisateurs, setUtilisateurs] = useState<UtilisateurAdmin[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    charger();
  }, []);

  const charger = async () => {
    try {
      const donnees = await getTousUtilisateurs();
      setUtilisateurs(donnees);
    } catch {
      setErreur('Impossible de charger les utilisateurs.');
    } finally {
      setChargement(false);
    }
  };

  // Active ou désactive un compte
  const handleToggleActif = async (utilisateur: UtilisateurAdmin) => {
    try {
      await toggleActifUtilisateur(utilisateur.id, !utilisateur.isActif);
      // Met à jour l'état local sans recharger toute la liste
      setUtilisateurs((prev) =>
        prev.map((u) => u.id === utilisateur.id ? { ...u, isActif: !u.isActif } : u)
      );
    } catch {
      alert('Erreur lors de la mise à jour du compte.');
    }
  };

  // Promeut ou rétrograde un utilisateur
  const handleToggleAdmin = async (utilisateur: UtilisateurAdmin) => {
    const estAdmin = utilisateur.roles.includes('ROLE_ADMIN');
    try {
      await toggleRoleAdmin(utilisateur.id, !estAdmin);
      setUtilisateurs((prev) =>
        prev.map((u) =>
          u.id === utilisateur.id
            ? { ...u, roles: estAdmin ? ['ROLE_USER'] : ['ROLE_ADMIN'] }
            : u
        )
      );
    } catch {
      alert('Erreur lors du changement de rôle.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-10">

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">👥 Utilisateurs</h1>
            <p className="text-gray-500 mt-1">{utilisateurs.length} compte(s) enregistré(s)</p>
          </div>
        </div>

        {chargement && (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {erreur && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3">{erreur}</div>
        )}

        {!chargement && !erreur && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3 text-left">Utilisateur</th>
                  <th className="px-6 py-3 text-left">Email</th>
                  <th className="px-6 py-3 text-left">Rôle</th>
                  <th className="px-6 py-3 text-left">Statut</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {utilisateurs.map((utilisateur) => {
                  const estAdmin = utilisateur.roles.includes('ROLE_ADMIN');
                  return (
                    <tr key={utilisateur.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-800">
                        {utilisateur.prenom} {utilisateur.nom}
                      </td>
                      <td className="px-6 py-4 text-gray-500">{utilisateur.email}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          estAdmin ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {estAdmin ? 'Admin' : 'Utilisateur'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          utilisateur.isActif ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                        }`}>
                          {utilisateur.isActif ? 'Actif' : 'Désactivé'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleToggleActif(utilisateur)}
                            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                              utilisateur.isActif
                                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                : 'bg-green-50 text-green-600 hover:bg-green-100'
                            }`}
                          >
                            {utilisateur.isActif ? 'Désactiver' : 'Activer'}
                          </button>
                          <button
                            onClick={() => handleToggleAdmin(utilisateur)}
                            className="text-xs px-3 py-1.5 rounded-lg font-medium bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors"
                          >
                            {estAdmin ? '→ User' : '→ Admin'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminUsersPage;
