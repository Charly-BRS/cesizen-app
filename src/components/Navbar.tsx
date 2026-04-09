// src/components/Navbar.tsx
// Barre de navigation principale — sticky, fond blanc, accents verts.
// Indicateur de page active, avatar initiales, bouton déconnexion discret.

import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const { utilisateur, estConnecte, deconnecter } = useAuth();
  const estAdmin = utilisateur?.roles.includes('ROLE_ADMIN') ?? false;
  const navigate  = useNavigate();
  const location  = useLocation();

  const handleDeconnexion = () => {
    deconnecter();
    navigate('/login');
  };

  // Classes d'un lien de navigation selon qu'il est actif ou non
  const lienClasses = (chemin: string) => {
    const actif =
      chemin === '/'
        ? location.pathname === '/' || location.pathname === '/dashboard'
        : location.pathname.startsWith(chemin);

    return actif
      ? 'relative text-emerald-700 font-semibold text-sm transition-colors after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-emerald-500 after:rounded-full'
      : 'relative text-slate-500 hover:text-slate-900 font-medium text-sm transition-colors';
  };

  // Initiales de l'utilisateur pour l'avatar
  const initiales = [utilisateur?.prenom?.[0], utilisateur?.nom?.[0]]
    .filter(Boolean).join('').toUpperCase();

  // Pas de navbar sur les pages publiques
  if (!estConnecte) return null;

  return (
    <nav className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50 animate-fade-in">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

        {/* ── Logo ──────────────────────────────────── */}
        <Link
          to="/"
          className="flex items-center gap-2 text-emerald-700 font-bold text-lg hover:text-emerald-800 transition-colors shrink-0"
        >
          <span className="text-xl">🧘</span>
          <span className="tracking-tight">CESIZen</span>
        </Link>

        {/* ── Navigation centrale ─────────────────────── */}
        <div className="flex items-stretch h-full gap-1">
          {[
            { to: '/',          label: 'Accueil'    },
            { to: '/articles',  label: 'Articles'   },
            { to: '/exercises', label: 'Exercices'  },
            { to: '/sessions',  label: 'Historique' },
          ].map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`px-3 flex items-center ${lienClasses(to)}`}
            >
              {label}
            </Link>
          ))}

          {/* Bouton Admin */}
          {estAdmin && (
            <Link
              to="/admin"
              className={`ml-1 flex items-center px-3 py-1.5 my-auto rounded-lg text-sm font-semibold transition-colors ${
                location.pathname.startsWith('/admin')
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
              }`}
            >
              ⚙️ Admin
            </Link>
          )}
        </div>

        {/* ── Profil + déconnexion ────────────────────── */}
        <div className="flex items-center gap-2 shrink-0">

          {/* Lien profil avec avatar */}
          <Link
            to="/profil"
            className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-slate-50 transition-colors group"
            title="Mon profil"
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              location.pathname === '/profil'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-100 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white'
            }`}>
              {initiales}
            </div>
            <div className="hidden md:block text-left">
              <p className={`text-xs font-semibold leading-tight transition-colors ${
                location.pathname === '/profil' ? 'text-emerald-700' : 'text-slate-700 group-hover:text-slate-900'
              }`}>
                {utilisateur?.prenom} {utilisateur?.nom}
              </p>
              <p className="text-xs text-slate-400 leading-tight truncate max-w-28">
                {utilisateur?.email}
              </p>
            </div>
          </Link>

          {/* Séparateur */}
          <div className="w-px h-6 bg-slate-200" />

          {/* Déconnexion */}
          <button
            onClick={handleDeconnexion}
            title="Déconnexion"
            className="flex items-center gap-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors px-2.5 py-1.5 rounded-xl text-sm font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="hidden sm:inline">Déconnexion</span>
          </button>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
