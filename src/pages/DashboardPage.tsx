// src/pages/DashboardPage.tsx
// Page d'accueil de l'utilisateur connecté.
// Affiche un message de bienvenue personnalisé et des raccourcis
// vers les fonctionnalités principales de l'application.

import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DashboardPage: React.FC = () => {
  const { utilisateur } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-10">

        {/* Message de bienvenue personnalisé */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-800">
            Bonjour, {utilisateur?.prenom} 👋
          </h1>
          <p className="text-gray-500 mt-2">
            Bienvenue sur ton espace bien-être CESIZen.
          </p>
        </div>

        {/* Cartes de navigation rapide */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

          {/* Carte Articles */}
          <Link
            to="/articles"
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow group"
          >
            <div className="text-4xl mb-4">📰</div>
            <h2 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
              Articles bien-être
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Découvre nos conseils et guides pour mieux gérer ton stress et ton quotidien.
            </p>
          </Link>

          {/* Carte Exercices de respiration */}
          <Link
            to="/exercises"
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow group"
          >
            <div className="text-4xl mb-4">🌬️</div>
            <h2 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
              Exercices de respiration
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Cohérence cardiaque, respiration 4-7-8, box breathing... Guidé et animé.
            </p>
          </Link>

          {/* Carte Diagnostic stress — à venir en Phase 4 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 opacity-60 cursor-not-allowed">
            <div className="text-4xl mb-4">📊</div>
            <h2 className="text-lg font-semibold text-gray-800">
              Diagnostic stress
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Évalue ton niveau de stress et suis ton évolution. <em>(Disponible prochainement)</em>
            </p>
          </div>

          {/* Carte Historique sessions */}
          <Link
            to="/sessions"
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow group"
          >
            <div className="text-4xl mb-4">📊</div>
            <h2 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
              Mon historique
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Consulte tes sessions passées et suis ta progression.
            </p>
          </Link>

        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
