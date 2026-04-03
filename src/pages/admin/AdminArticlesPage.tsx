// src/pages/admin/AdminArticlesPage.tsx
// Page de gestion des articles pour l'administrateur.
// Permet de : créer, modifier, publier/dépublier et supprimer des articles.

import { useEffect, useState } from 'react';
import {
  getArticles,
  getCategories,
  creerArticle,
  modifierArticle,
  togglePublieArticle,
  supprimerArticle,
} from '../../services/articleService';
import type { Article, Categorie, DonneesArticle } from '../../services/articleService';

// Valeurs vides du formulaire pour la création
const FORM_VIDE: DonneesArticle = {
  titre: '',
  contenu: '',
  categorie: '',
  isPublie: false,
};

const AdminArticlesPage: React.FC = () => {
  const [articles, setArticles]       = useState<Article[]>([]);
  const [categories, setCategories]   = useState<Categorie[]>([]);
  const [chargement, setChargement]   = useState(true);
  const [erreur, setErreur]           = useState('');

  // Formulaire : null = caché, 'create' = création, nombre = id de l'article à éditer
  const [modeForm, setModeForm]       = useState<null | 'create' | number>(null);
  const [form, setForm]               = useState<DonneesArticle>(FORM_VIDE);
  const [enregistrement, setEnregistrement] = useState(false);
  const [erreurForm, setErreurForm]   = useState('');

  useEffect(() => {
    charger();
  }, []);

  // Charge les articles et les catégories en parallèle
  const charger = async () => {
    try {
      const [articlesData, categoriesData] = await Promise.all([
        getArticles(),
        getCategories(),
      ]);
      setArticles(articlesData);
      setCategories(categoriesData);
    } catch {
      setErreur('Impossible de charger les données.');
    } finally {
      setChargement(false);
    }
  };

  // Ouvre le formulaire de création (vide)
  const ouvrirCreation = () => {
    setForm(FORM_VIDE);
    setErreurForm('');
    setModeForm('create');
  };

  // Ouvre le formulaire d'édition pré-rempli avec les données de l'article
  const ouvrirEdition = (article: Article) => {
    setForm({
      titre:     article.titre,
      contenu:   article.contenu,
      // L'IRI de la catégorie au format attendu par API Platform
      categorie: `/api/categories/${article.categorie.id}`,
      isPublie:  article.isPublie,
    });
    setErreurForm('');
    setModeForm(article.id);
  };

  const fermerForm = () => {
    setModeForm(null);
    setErreurForm('');
  };

  // Validation simple du formulaire avant envoi
  const validerForm = (): boolean => {
    if (!form.titre.trim()) { setErreurForm('Le titre est obligatoire.'); return false; }
    if (!form.contenu.trim()) { setErreurForm('Le contenu est obligatoire.'); return false; }
    if (!form.categorie) { setErreurForm('Sélectionne une catégorie.'); return false; }
    return true;
  };

  // Soumet le formulaire : création OU modification selon le mode
  const handleSoumettre = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validerForm()) return;

    setEnregistrement(true);
    setErreurForm('');

    try {
      if (modeForm === 'create') {
        // Création d'un nouvel article
        const nouvelArticle = await creerArticle(form);
        setArticles((prev) => [nouvelArticle, ...prev]);
      } else if (typeof modeForm === 'number') {
        // Modification d'un article existant
        const articleModifie = await modifierArticle(modeForm, form);
        setArticles((prev) =>
          prev.map((a) => a.id === modeForm ? articleModifie : a)
        );
      }
      fermerForm();
    } catch {
      setErreurForm('Une erreur est survenue. Réessaie.');
    } finally {
      setEnregistrement(false);
    }
  };

  // Bascule l'état publié/brouillon
  const handleTogglePublie = async (article: Article) => {
    try {
      await togglePublieArticle(article.id, !article.isPublie);
      setArticles((prev) =>
        prev.map((a) => a.id === article.id ? { ...a, isPublie: !a.isPublie } : a)
      );
    } catch {
      alert('Erreur lors de la mise à jour.');
    }
  };

  // Supprime un article après confirmation
  const handleSupprimer = async (article: Article) => {
    if (!confirm(`Supprimer l'article "${article.titre}" ?`)) return;
    try {
      await supprimerArticle(article.id);
      setArticles((prev) => prev.filter((a) => a.id !== article.id));
    } catch {
      alert('Erreur lors de la suppression.');
    }
  };

  const dateFormatee = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'short', year: 'numeric',
    });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* En-tête */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">📰 Articles</h1>
            <p className="text-gray-500 mt-1">{articles.length} article(s)</p>
          </div>
          <button
            onClick={ouvrirCreation}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2"
          >
            + Nouvel article
          </button>
        </div>

        {/* Erreur globale */}
        {erreur && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4">
            {erreur}
          </div>
        )}

        {/* ── Formulaire création / édition ─────────────────── */}
        {modeForm !== null && (
          <div className="bg-white rounded-2xl border border-blue-100 shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              {modeForm === 'create' ? '✏️ Nouvel article' : '✏️ Modifier l\'article'}
            </h2>

            <form onSubmit={handleSoumettre} className="space-y-5">

              {/* Titre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.titre}
                  onChange={(e) => setForm({ ...form, titre: e.target.value })}
                  placeholder="Titre de l'article"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              {/* Catégorie */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catégorie <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.categorie}
                  onChange={(e) => setForm({ ...form, categorie: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                >
                  <option value="">— Sélectionner une catégorie —</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={`/api/categories/${cat.id}`}>
                      {cat.nom}
                    </option>
                  ))}
                </select>
              </div>

              {/* Contenu */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contenu <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={form.contenu}
                  onChange={(e) => setForm({ ...form, contenu: e.target.value })}
                  placeholder="Contenu de l'article..."
                  rows={10}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-y"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Chaque saut de ligne crée un nouveau paragraphe.
                </p>
              </div>

              {/* Publier immédiatement */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isPublie"
                  checked={form.isPublie}
                  onChange={(e) => setForm({ ...form, isPublie: e.target.checked })}
                  className="w-4 h-4 rounded accent-blue-600"
                />
                <label htmlFor="isPublie" className="text-sm text-gray-700">
                  Publier immédiatement (visible par les utilisateurs)
                </label>
              </div>

              {/* Message d'erreur du formulaire */}
              {erreurForm && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                  {erreurForm}
                </div>
              )}

              {/* Boutons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={enregistrement}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
                >
                  {enregistrement
                    ? 'Enregistrement...'
                    : modeForm === 'create' ? 'Créer l\'article' : 'Enregistrer les modifications'
                  }
                </button>
                <button
                  type="button"
                  onClick={fermerForm}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-5 py-2.5 rounded-xl transition-colors"
                >
                  Annuler
                </button>
              </div>

            </form>
          </div>
        )}

        {/* ── Chargement ─────────────────────────────────────── */}
        {chargement && (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* ── Liste vide ──────────────────────────────────────── */}
        {!chargement && articles.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-5xl mb-4">📝</p>
            <p>Aucun article pour le moment.</p>
            <p className="text-sm mt-1">Crée le premier article avec le bouton ci-dessus.</p>
          </div>
        )}

        {/* ── Tableau des articles ────────────────────────────── */}
        {!chargement && articles.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3 text-left">Titre</th>
                  <th className="px-6 py-3 text-left">Catégorie</th>
                  <th className="px-6 py-3 text-left">Auteur</th>
                  <th className="px-6 py-3 text-left">Date</th>
                  <th className="px-6 py-3 text-left">Statut</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {articles.map((article) => (
                  <tr
                    key={article.id}
                    className={`hover:bg-gray-50 ${modeForm === article.id ? 'bg-blue-50' : ''}`}
                  >
                    <td className="px-6 py-4 font-medium text-gray-800 max-w-xs">
                      <span className="truncate block">{article.titre}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{article.categorie.nom}</td>
                    <td className="px-6 py-4 text-gray-500">
                      {article.auteur.prenom} {article.auteur.nom}
                    </td>
                    <td className="px-6 py-4 text-gray-400">{dateFormatee(article.createdAt)}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        article.isPublie
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {article.isPublie ? 'Publié' : 'Brouillon'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 flex-wrap">
                        {/* Éditer */}
                        <button
                          onClick={() => ouvrirEdition(article)}
                          className="text-xs px-3 py-1.5 rounded-lg font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                        >
                          Éditer
                        </button>
                        {/* Publier / Dépublier */}
                        <button
                          onClick={() => handleTogglePublie(article)}
                          className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                            article.isPublie
                              ? 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                              : 'bg-green-50 text-green-600 hover:bg-green-100'
                          }`}
                        >
                          {article.isPublie ? 'Dépublier' : 'Publier'}
                        </button>
                        {/* Supprimer */}
                        <button
                          onClick={() => handleSupprimer(article)}
                          className="text-xs px-3 py-1.5 rounded-lg font-medium bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminArticlesPage;
