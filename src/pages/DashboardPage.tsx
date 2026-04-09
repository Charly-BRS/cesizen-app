// src/pages/DashboardPage.tsx
// Page d'accueil de l'utilisateur connecté.
// Affiche une bannière de bienvenue avec un dégradé vert
// et des cartes colorées vers les fonctionnalités principales.

import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Définition des cartes de raccourcis
// Chaque carte a ses propres couleurs pour faciliter la reconnaissance visuelle
const CARTES = [
  {
    vers: '/articles',
    emoji: '📰',
    titre: 'Articles bien-être',
    description: 'Découvre nos conseils et guides pour mieux gérer ton stress et ton quotidien.',
    // Teintes bleues
    fond: 'bg-blue-50',
    bordure: 'border-blue-200',
    hoverTitre: 'group-hover:text-blue-700',
    accent: 'bg-blue-100',
  },
  {
    vers: '/exercises',
    emoji: '🌬️',
    titre: 'Exercices de respiration',
    description: 'Cohérence cardiaque, respiration 4-7-8, box breathing... Guidé et animé.',
    // Teintes vertes (couleur principale de l'app)
    fond: 'bg-green-50',
    bordure: 'border-green-200',
    hoverTitre: 'group-hover:text-green-700',
    accent: 'bg-green-100',
  },
  {
    vers: '/sessions',
    emoji: '📈',
    titre: 'Mon historique',
    description: 'Consulte tes sessions passées et suis ta progression dans le temps.',
    // Teintes violettes
    fond: 'bg-purple-50',
    bordure: 'border-purple-200',
    hoverTitre: 'group-hover:text-purple-700',
    accent: 'bg-purple-100',
  },
];

const DashboardPage: React.FC = () => {
  const { utilisateur } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Bannière de bienvenue (dégradé vert) ── */}
      <div className="bg-gradient-to-br from-green-600 to-green-500 text-white">
        <div className="max-w-4xl mx-auto px-4 py-10 flex flex-col items-start gap-2">
          <div className="text-5xl mb-1">🌿</div>
          <h1 className="text-3xl font-bold">
            Bonjour, {utilisateur?.prenom} 👋
          </h1>
          <p className="text-green-100 text-base">
            Bienvenue sur ton espace bien-être CESIZen.
            Que souhaites-tu faire aujourd'hui ?
          </p>
        </div>
      </div>

      {/* ── Cartes de navigation rapide ── */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-5">Accès rapide</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

          {/* Cartes actives */}
          {CARTES.map((carte) => (
            <Link
              key={carte.vers}
              to={carte.vers}
              className={`${carte.fond} border ${carte.bordure} rounded-2xl p-6 hover:shadow-md transition-shadow group`}
            >
              {/* Icône dans un cercle de couleur */}
              <div className={`${carte.accent} w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4`}>
                {carte.emoji}
              </div>
              <h3 className={`text-base font-semibold text-gray-800 mb-1 transition-colors ${carte.hoverTitre}`}>
                {carte.titre}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                {carte.description}
              </p>
            </Link>
          ))}

          {/* Carte "Diagnostic stress" — à venir */}
          <div className="bg-gray-100 border border-gray-200 rounded-2xl p-6 opacity-50 cursor-not-allowed">
            <div className="bg-gray-200 w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4">
              📊
            </div>
            <h3 className="text-base font-semibold text-gray-600 mb-1">
              Diagnostic stress
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Évalue ton niveau de stress et suis ton évolution.{' '}
              <em>Disponible prochainement.</em>
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};

export default DashboardPage;
