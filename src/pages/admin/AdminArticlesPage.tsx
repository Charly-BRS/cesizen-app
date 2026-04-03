// src/pages/admin/AdminArticlesPage.tsx
// Page de gestion des articles bien-être pour l'administrateur.
// Permet de publier/dépublier et supprimer les articles.

import { useEffect, useState } from 'react';
import {
  getTousArticles,
  togglePublieArticle,
  supprimerArticle,
} from '../../services/adminService';
import type { ArticleAdmin } from '../../services/adminService';

const AdminArticlesPage: React.FC = () => {
  const [articles, setArticles] = useState<ArticleAdmin[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');

  useEffect(() => { charger(); }, []);

  const charger = async () => {
    try {
      setArticles(await getTousArticles());
    } catch {
      setErreur('Impossible de charger les articles.');
    } finally {
      setChargement(false);
    }
  };

  const handleTogglePublie = async (article: ArticleAdmin) => {
    try {
      await togglePublieArticle(article.id, !article.isPublie);
      setArticles((prev) =>
        prev.map((a) => a.id === article.id ? { ...a, isPublie: !a.isPublie } : a)
      );
    } catch { alert('Erreur lors de la mise à jour.'); }
  };

  const handleSupprimer = async (article: ArticleAdmin) => {
    if (!confirm(`Supprimer l'article "${article.titre}" ?`)) return;
    try {
      await supprimerArticle(article.id);
      setArticles((prev) => prev.filter((a) => a.id !== article.id));
    } catch { alert('Erreur lors de la suppression.'); }
  };

  const dateFormatee = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-10">

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">📰 Articles</h1>
            <p className="text-gray-500 mt-1">{articles.length} article(s)</p>
          </div>
        </div>

        {erreur && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4">{erreur}</div>}

        {chargement && (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!chargement && articles.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-5xl mb-4">📝</p>
            <p>Aucun article pour le moment.</p>
          </div>
        )}

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
                  <tr key={article.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-800 max-w-xs truncate">{article.titre}</td>
                    <td className="px-6 py-4 text-gray-500">{article.categorie.nom}</td>
                    <td className="px-6 py-4 text-gray-500">{article.auteur.prenom} {article.auteur.nom}</td>
                    <td className="px-6 py-4 text-gray-400">{dateFormatee(article.createdAt)}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        article.isPublie ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {article.isPublie ? 'Publié' : 'Brouillon'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => handleTogglePublie(article)}
                          className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                            article.isPublie
                              ? 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                              : 'bg-green-50 text-green-600 hover:bg-green-100'
                          }`}>
                          {article.isPublie ? 'Dépublier' : 'Publier'}
                        </button>
                        <button onClick={() => handleSupprimer(article)}
                          className="text-xs px-3 py-1.5 rounded-lg font-medium bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
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
