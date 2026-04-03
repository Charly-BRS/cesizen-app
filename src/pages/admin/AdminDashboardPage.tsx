// src/pages/admin/AdminDashboardPage.tsx
// Tableau de bord de l'espace d'administration.
// Affiche des statistiques globales : nombre d'utilisateurs, exercices et sessions.

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTousUtilisateurs, getTousExercices, getTousArticles } from '../../services/adminService';
import { getMesSessions } from '../../services/exerciseService';

const AdminDashboardPage: React.FC = () => {
  // Statistiques chargées depuis l'API
  const [stats, setStats] = useState({
    utilisateurs: 0,
    exercices: 0,
    articles: 0,
    sessions: 0,
  });
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    const chargerStats = async () => {
      try {
        // Charge toutes les stats en parallèle pour aller plus vite
        const [utilisateurs, exercices, articles, sessions] = await Promise.all([
          getTousUtilisateurs(),
          getTousExercices(),
          getTousArticles(),
          getMesSessions(),
        ]);
        setStats({
          utilisateurs: utilisateurs.length,
          exercices: exercices.length,
          articles: articles.length,
          sessions: sessions.length,
        });
      } catch (err) {
        console.error('Erreur chargement stats admin :', err);
      } finally {
        setChargement(false);
      }
    };
    chargerStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-10">

        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-800">⚙️ Administration</h1>
          <p className="text-gray-500 mt-1">Tableau de bord — CESIZen</p>
        </div>

        {/* Cartes de statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatCard label="Utilisateurs" valeur={stats.utilisateurs} emoji="👥" couleur="blue" chargement={chargement} />
          <StatCard label="Exercices" valeur={stats.exercices} emoji="🌬️" couleur="teal" chargement={chargement} />
          <StatCard label="Articles" valeur={stats.articles} emoji="📰" couleur="purple" chargement={chargement} />
          <StatCard label="Sessions" valeur={stats.sessions} emoji="📊" couleur="orange" chargement={chargement} />
        </div>

        {/* Raccourcis vers les sections */}
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Gestion du contenu</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <AdminLien
            to="/admin/users"
            emoji="👥"
            titre="Utilisateurs"
            description="Gérer les comptes, rôles et accès"
          />
          <AdminLien
            to="/admin/exercises"
            emoji="🌬️"
            titre="Exercices"
            description="Créer et configurer les exercices de respiration"
          />
          <AdminLien
            to="/admin/articles"
            emoji="📰"
            titre="Articles"
            description="Publier et gérer les articles bien-être"
          />

        </div>
      </div>
    </div>
  );
};

// Carte de statistique
interface StatCardProps {
  label: string;
  valeur: number;
  emoji: string;
  couleur: 'blue' | 'teal' | 'purple' | 'orange';
  chargement: boolean;
}

const COULEURS: Record<string, string> = {
  blue:   'bg-blue-50 text-blue-700',
  teal:   'bg-teal-50 text-teal-700',
  purple: 'bg-purple-50 text-purple-700',
  orange: 'bg-orange-50 text-orange-700',
};

const StatCard: React.FC<StatCardProps> = ({ label, valeur, emoji, couleur, chargement }) => (
  <div className={`${COULEURS[couleur]} rounded-2xl p-5 text-center`}>
    <p className="text-3xl mb-1">{emoji}</p>
    <p className="text-3xl font-bold">{chargement ? '—' : valeur}</p>
    <p className="text-sm mt-1 opacity-80">{label}</p>
  </div>
);

// Raccourci vers une section admin
const AdminLien: React.FC<{ to: string; emoji: string; titre: string; description: string }> = ({
  to, emoji, titre, description,
}) => (
  <Link
    to={to}
    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow group"
  >
    <p className="text-3xl mb-3">{emoji}</p>
    <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">{titre}</h3>
    <p className="text-sm text-gray-500 mt-1">{description}</p>
  </Link>
);

export default AdminDashboardPage;
