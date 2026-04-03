// src/pages/admin/AdminExercisesPage.tsx
// Page de gestion des exercices de respiration pour l'administrateur.
// Permet de créer, activer/désactiver et supprimer les exercices.

import { useEffect, useState } from 'react';
import {
  getTousExercices,
  toggleActifExercice,
  creerExercice,
  supprimerExercice,
} from '../../services/adminService';
import type { ExerciceAdmin } from '../../services/adminService';

// Valeurs par défaut pour le formulaire de création
const FORM_VIDE = {
  nom: '', slug: '', description: '',
  inspirationDuration: 4, apneaDuration: 0, expirationDuration: 4,
  cycles: 5, isPreset: false, isActive: true,
};

const AdminExercisesPage: React.FC = () => {
  const [exercices, setExercices] = useState<ExerciceAdmin[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  // Contrôle l'affichage du formulaire de création
  const [afficherFormulaire, setAfficherFormulaire] = useState(false);
  const [formulaire, setFormulaire] = useState(FORM_VIDE);
  const [enregistrement, setEnregistrement] = useState(false);

  useEffect(() => { charger(); }, []);

  const charger = async () => {
    try {
      setExercices(await getTousExercices());
    } catch {
      setErreur('Impossible de charger les exercices.');
    } finally {
      setChargement(false);
    }
  };

  const handleToggleActif = async (exercice: ExerciceAdmin) => {
    try {
      await toggleActifExercice(exercice.id, !exercice.isActive);
      setExercices((prev) =>
        prev.map((e) => e.id === exercice.id ? { ...e, isActive: !e.isActive } : e)
      );
    } catch { alert('Erreur lors de la mise à jour.'); }
  };

  const handleSupprimer = async (exercice: ExerciceAdmin) => {
    if (!confirm(`Supprimer "${exercice.nom}" ?`)) return;
    try {
      await supprimerExercice(exercice.id);
      setExercices((prev) => prev.filter((e) => e.id !== exercice.id));
    } catch { alert('Erreur lors de la suppression.'); }
  };

  const handleCreer = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnregistrement(true);
    try {
      const nouvelExercice = await creerExercice(formulaire);
      setExercices((prev) => [...prev, nouvelExercice]);
      setFormulaire(FORM_VIDE);
      setAfficherFormulaire(false);
    } catch { alert('Erreur lors de la création.'); }
    finally { setEnregistrement(false); }
  };

  // Génère automatiquement le slug depuis le nom
  const handleNomChange = (nom: string) => {
    const slug = nom.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    setFormulaire((prev) => ({ ...prev, nom, slug }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-10">

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">🌬️ Exercices de respiration</h1>
            <p className="text-gray-500 mt-1">{exercices.length} exercice(s)</p>
          </div>
          <button
            onClick={() => setAfficherFormulaire(!afficherFormulaire)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
          >
            {afficherFormulaire ? '✕ Annuler' : '+ Nouvel exercice'}
          </button>
        </div>

        {/* Formulaire de création */}
        {afficherFormulaire && (
          <form onSubmit={handleCreer} className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6 mb-6">
            <h2 className="font-semibold text-gray-700 mb-4">Créer un exercice</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input type="text" required value={formulaire.nom}
                  onChange={(e) => handleNomChange(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input type="text" required value={formulaire.slug}
                  onChange={(e) => setFormulaire((p) => ({ ...p, slug: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea rows={2} value={formulaire.description}
                  onChange={(e) => setFormulaire((p) => ({ ...p, description: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none" />
              </div>
              {/* Durées */}
              {[
                { key: 'inspirationDuration', label: 'Inspiration (s)' },
                { key: 'apneaDuration', label: 'Apnée (s)' },
                { key: 'expirationDuration', label: 'Expiration (s)' },
                { key: 'cycles', label: 'Cycles' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input type="number" min={0} required
                    value={formulaire[key as keyof typeof formulaire] as number}
                    onChange={(e) => setFormulaire((p) => ({ ...p, [key]: Number(e.target.value) }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none" />
                </div>
              ))}
            </div>
            <button type="submit" disabled={enregistrement}
              className="mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors">
              {enregistrement ? 'Création...' : 'Créer l\'exercice'}
            </button>
          </form>
        )}

        {/* Erreur */}
        {erreur && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4">{erreur}</div>}

        {/* Chargement */}
        {chargement && <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>}

        {/* Liste */}
        {!chargement && (
          <div className="flex flex-col gap-3">
            {exercices.map((exercice) => (
              <div key={exercice.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-4 flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-800">{exercice.nom}</span>
                    {exercice.isPreset && <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">Preset</span>}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${exercice.isActive ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                      {exercice.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Inspire {exercice.inspirationDuration}s
                    {exercice.apneaDuration > 0 && ` · Pause ${exercice.apneaDuration}s`}
                    · Expire {exercice.expirationDuration}s
                    · {exercice.cycles} cycles
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => handleToggleActif(exercice)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                      exercice.isActive ? 'bg-gray-50 text-gray-500 hover:bg-gray-100' : 'bg-green-50 text-green-600 hover:bg-green-100'
                    }`}>
                    {exercice.isActive ? 'Désactiver' : 'Activer'}
                  </button>
                  {!exercice.isPreset && (
                    <button onClick={() => handleSupprimer(exercice)}
                      className="text-xs px-3 py-1.5 rounded-lg font-medium bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                      Supprimer
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminExercisesPage;
