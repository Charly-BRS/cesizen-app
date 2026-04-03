// src/pages/ArticleDetailPage.tsx
// Page d'affichage complet d'un article de bien-être.
// Accessible via /articles/:id — récupère l'article par son identifiant.

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getArticle } from '../services/articleService';
import type { Article } from '../services/articleService';

const ArticleDetailPage: React.FC = () => {
  // Récupère l'id depuis l'URL (/articles/:id)
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [article, setArticle] = useState<Article | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    const charger = async () => {
      if (!id) return;
      try {
        const donnees = await getArticle(Number(id));
        setArticle(donnees);
      } catch {
        setErreur('Article introuvable ou indisponible.');
      } finally {
        setChargement(false);
      }
    };
    charger();
  }, [id]);

  // Formate la date en français
  const dateFormatee = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-10">

        {/* Bouton retour */}
        <button
          onClick={() => navigate('/articles')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors mb-8 text-sm"
        >
          ← Retour aux articles
        </button>

        {/* Chargement */}
        {chargement && (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Erreur */}
        {!chargement && erreur && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3">
            {erreur}
          </div>
        )}

        {/* Contenu de l'article */}
        {!chargement && article && (
          <article className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

            {/* Catégorie + date */}
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
                {article.categorie.nom}
              </span>
              <span className="text-gray-400 text-xs">
                {dateFormatee(article.createdAt)}
              </span>
              {/* Badge brouillon si non publié */}
              {!article.isPublie && (
                <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-3 py-1 rounded-full">
                  Brouillon
                </span>
              )}
            </div>

            {/* Titre */}
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
              {article.titre}
            </h1>

            {/* Auteur — typeof vérifie que auteur est bien un objet (pas une IRI string) */}
            {typeof article.auteur === 'object' && article.auteur !== null && (
              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100">
                <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm">
                  {article.auteur.prenom?.[0] ?? '?'}{article.auteur.nom?.[0] ?? ''}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    {article.auteur.prenom} {article.auteur.nom}
                  </p>
                  <p className="text-xs text-gray-400">Auteur</p>
                </div>
              </div>
            )}

            {/* Contenu — chaque saut de ligne crée un paragraphe */}
            <div className="prose prose-gray max-w-none">
              {article.contenu.split('\n').map((paragraphe, index) =>
                paragraphe.trim() ? (
                  <p key={index} className="text-gray-700 leading-relaxed mb-4">
                    {paragraphe}
                  </p>
                ) : (
                  <br key={index} />
                )
              )}
            </div>

            {/* Pied de page */}
            {article.updatedAt && (
              <p className="mt-8 pt-6 border-t border-gray-100 text-xs text-gray-400">
                Dernière modification : {dateFormatee(article.updatedAt)}
              </p>
            )}

          </article>
        )}

      </div>
    </div>
  );
};

export default ArticleDetailPage;
