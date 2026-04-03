// src/pages/ArticlesPage.tsx
// Page listant tous les articles de bien-être disponibles.
// Récupère les articles depuis l'API au chargement de la page
// et gère les états : chargement, erreur, liste vide, et succès.

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getArticles } from '../services/articleService';
// "import type" indique à Vite que Article est un type TypeScript pur,
// pas une valeur JavaScript — évite l'erreur "does not provide an export named"
import type { Article } from '../services/articleService';

const ArticlesPage: React.FC = () => {
  // Liste des articles récupérés depuis l'API
  const [articles, setArticles] = useState<Article[]>([]);

  // État de chargement : true pendant la requête API
  const [chargement, setChargement] = useState<boolean>(true);

  // Message d'erreur si la requête échoue
  const [erreur, setErreur] = useState<string>('');

  // useEffect : exécuté une seule fois au montage du composant
  // Le tableau vide [] signifie "ne s'exécute qu'au premier affichage"
  useEffect(() => {
    const chargerArticles = async () => {
      try {
        const donnees = await getArticles();
        setArticles(donnees);
      } catch (err) {
        setErreur('Impossible de charger les articles. Réessaie plus tard.');
        console.error('Erreur lors du chargement des articles :', err);
      } finally {
        setChargement(false);
      }
    };

    chargerArticles();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-10">

        {/* En-tête de la page */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">📰 Articles bien-être</h1>
          <p className="text-gray-500 mt-2">
            Conseils et guides pour prendre soin de toi au quotidien.
          </p>
        </div>

        {/* État : chargement en cours */}
        {chargement && (
          <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* État : erreur */}
        {!chargement && erreur && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3">
            {erreur}
          </div>
        )}

        {/* État : aucun article */}
        {!chargement && !erreur && articles.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-5xl mb-4">🗒️</p>
            <p className="text-lg">Aucun article publié pour le moment.</p>
            <p className="text-sm mt-1">Reviens bientôt !</p>
          </div>
        )}

        {/* État : liste des articles */}
        {!chargement && !erreur && articles.length > 0 && (
          <div className="grid grid-cols-1 gap-6">
            {/* Filtre uniquement les articles publiés pour les utilisateurs */}
            {articles.filter((a) => a.isPublie).map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

// Sous-composant : carte d'un article individuel
interface ArticleCardProps {
  article: Article;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
  const navigate = useNavigate();
  // Formate la date au format français : "3 avril 2026"
  const dateFormatee = new Date(article.createdAt).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Tronque le contenu à 200 caractères pour l'aperçu
  const apercu = article.contenu.length > 200
    ? article.contenu.substring(0, 200) + '...'
    : article.contenu;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">

      {/* Catégorie + date */}
      <div className="flex items-center gap-3 mb-3">
        <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
          {article.categorie.nom}
        </span>
        <span className="text-gray-400 text-xs">{dateFormatee}</span>
      </div>

      {/* Titre */}
      <h2 className="text-xl font-bold text-gray-800 mb-2">{article.titre}</h2>

      {/* Aperçu du contenu */}
      <p className="text-gray-600 text-sm leading-relaxed">{apercu}</p>

      {/* Auteur — typeof vérifie que auteur est bien un objet (pas une IRI string) */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
        <span className="text-sm text-gray-500">
          ✍️ {typeof article.auteur === 'object'
            ? `${article.auteur.prenom} ${article.auteur.nom}`
            : 'Auteur inconnu'}
        </span>
        <button
          onClick={() => navigate(`/articles/${article.id}`)}
          className="text-blue-600 text-sm font-medium hover:underline"
        >
          Lire la suite →
        </button>
      </div>

    </div>
  );
};

export default ArticlesPage;
