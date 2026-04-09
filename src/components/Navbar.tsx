// src/components/Navbar.tsx
// Barre de navigation principale de l'application CESIZen.
// Affiche les liens de navigation et le bouton de déconnexion.
// Un indicateur visuel met en évidence la page active (useLocation).

import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const { utilisateur, estConnecte, deconnecter } = useAuth();
  const estAdmin = utilisateur?.roles.includes('ROLE_ADMIN') ?? false;
  const navigate = useNavigate();

  // useLocation permet de savoir sur quelle page on se trouve
  const location = useLocation();

  // Déconnecte l'utilisateur et redirige vers /login
  const handleDeconnexion = () => {
    deconnecter();
    navigate('/login');
  };

  // Retourne les classes CSS d'un lien selon qu'il correspond à la page active
  // Page active : texte blanc + barre blanche en bas + fond légèrement plus clair
  // Page inactive : texte bleu-200 + hover blanc
  const classesDuLien = (chemin: string): string => {
    const estActif = location.pathname === chemin ||
      (chemin !== '/' && location.pathname.startsWith(chemin));

    return estActif
      ? 'text-white font-semibold border-b-2 border-white pb-0.5 transition-colors'
      : 'text-blue-200 hover:text-white transition-colors font-medium';
  };

  // La navbar n'est pas affichée sur les pages publiques (login, register)
  if (!estConnecte) {
    return null;
  }

  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">

        {/* Logo / Nom de l'application */}
        <Link to="/" className="text-xl font-bold tracking-tight hover:text-blue-100 transition-colors">
          🧘 CESIZen
        </Link>

        {/* Liens de navigation avec indicateur de page active */}
        <div className="flex items-center gap-6">
          <Link to="/" className={classesDuLien('/')}>
            Accueil
          </Link>
          <Link to="/articles" className={classesDuLien('/articles')}>
            Articles
          </Link>
          <Link to="/exercises" className={classesDuLien('/exercises')}>
            Exercices
          </Link>
          <Link to="/sessions" className={classesDuLien('/sessions')}>
            Historique
          </Link>
          {/* Lien Admin visible uniquement pour les administrateurs */}
          {estAdmin && (
            <Link
              to="/admin"
              className={
                location.pathname.startsWith('/admin')
                  ? 'bg-yellow-300 text-yellow-900 px-3 py-1 rounded-lg text-sm font-semibold transition-colors'
                  : 'bg-yellow-400 text-yellow-900 hover:bg-yellow-300 px-3 py-1 rounded-lg text-sm font-semibold transition-colors'
              }
            >
              ⚙️ Admin
            </Link>
          )}
        </div>

        {/* Infos utilisateur + profil + déconnexion */}
        <div className="flex items-center gap-3">
          {/* Lien vers le profil avec le prénom de l'utilisateur */}
          <Link
            to="/profil"
            className={`text-sm transition-colors ${
              location.pathname === '/profil'
                ? 'text-white font-semibold border-b border-white'
                : 'text-blue-200 hover:text-white'
            }`}
          >
            Bonjour, <strong className="text-white">{utilisateur?.prenom}</strong>
          </Link>

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
