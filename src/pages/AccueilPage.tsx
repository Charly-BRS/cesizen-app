// src/pages/AccueilPage.tsx
// Page d'accueil publique de CESIZen.
// Présente l'application aux visiteurs non connectés avec des liens
// vers la connexion et l'inscription.

import { Link } from 'react-router-dom';

const AccueilPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex flex-col">

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">

        <div className="mb-6 text-6xl">🧘</div>

        <h1 className="text-5xl font-bold text-green-700 mb-4">
          CESIZen
        </h1>

        <p className="text-xl text-gray-600 max-w-xl mb-2">
          Ton espace bien-être mental
        </p>

        <p className="text-gray-400 max-w-md mb-12 text-sm leading-relaxed">
          Pratique des exercices de respiration guidés, suis ton évolution
          et prends soin de toi au quotidien.
        </p>

        {/* ── Boutons d'action ───────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/login"
            className="bg-green-700 hover:bg-green-800 text-white font-semibold px-8 py-3 rounded-xl transition-colors text-sm shadow-sm"
          >
            Se connecter
          </Link>
          <Link
            to="/register"
            className="bg-white hover:bg-gray-50 text-green-700 font-semibold px-8 py-3 rounded-xl border border-green-200 transition-colors text-sm shadow-sm"
          >
            Créer un compte
          </Link>
        </div>

        {/* ── Fonctionnalités ────────────────────────────────────────── */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl w-full">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="text-3xl mb-3">🌬️</div>
            <h3 className="font-semibold text-gray-800 mb-1">Respiration</h3>
            <p className="text-xs text-gray-500">
              Exercices guidés pour calmer ton esprit en quelques minutes.
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="font-semibold text-gray-800 mb-1">Suivi</h3>
            <p className="text-xs text-gray-500">
              Historique de tes sessions pour visualiser ta progression.
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="text-3xl mb-3">📰</div>
            <h3 className="font-semibold text-gray-800 mb-1">Ressources</h3>
            <p className="text-xs text-gray-500">
              Articles de bien-être sélectionnés pour toi.
            </p>
          </div>
        </div>

      </main>

      {/* ── Pied de page ──────────────────────────────────────────────── */}
      <footer className="py-6 text-center text-xs text-gray-400">
        CESIZen — Projet de fin de cursus CESI
      </footer>

    </div>
  );
};

export default AccueilPage;
