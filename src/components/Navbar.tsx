// src/components/Navbar.tsx
// Barre de navigation principale de l'application CESIZen.
// Affiche les liens de navigation et le bouton de déconnexion
// uniquement quand l'utilisateur est connecté.

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const { utilisateur, estConnecte, deconnecter } = useAuth();
  const navigate = useNavigate();

  // Déconnecte l'utilisateur et redirige vers /login
  const handleDeconnexion = () => {
    deconnecter();
    navigate('/login');
  };

  // La navbar n'est pas affichée sur les pages publiques (login, register)
  if (!estConnecte) {
    return null;
  }

  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">

        {/* Logo / Nom de l'application */}
        <Link to="/" className="text-xl font-bold tracking-tight hover:text-blue-200 transition-colors">
          🧘 CESIZen
        </Link>

        {/* Liens de navigation */}
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="hover:text-blue-200 transition-colors font-medium"
          >
            Accueil
          </Link>
          <Link
            to="/articles"
            className="hover:text-blue-200 transition-colors font-medium"
          >
            Articles
          </Link>
          <Link
            to="/exercises"
            className="hover:text-blue-200 transition-colors font-medium"
          >
            Exercices
          </Link>
          <Link
            to="/sessions"
            className="hover:text-blue-200 transition-colors font-medium"
          >
            Historique
          </Link>
        </div>

        {/* Infos utilisateur + déconnexion */}
        <div className="flex items-center gap-4">
          {/* Affiche le prénom de l'utilisateur connecté */}
          <span className="text-blue-200 text-sm">
            Bonjour, <strong className="text-white">{utilisateur?.prenom}</strong>
          </span>

          <button
            onClick={handleDeconnexion}
            className="bg-blue-800 hover:bg-blue-900 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
          >
            Déconnexion
          </button>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
