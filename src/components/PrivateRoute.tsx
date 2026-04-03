// src/components/PrivateRoute.tsx
// Composant de protection des routes.
// Si l'utilisateur n'est pas connecté, il est automatiquement
// redirigé vers la page de connexion au lieu de voir la page demandée.

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface PrivateRouteProps {
  // Le composant enfant à afficher si l'utilisateur est connecté
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { estConnecte } = useAuth();

  // Si l'utilisateur n'est pas connecté : redirige vers /login
  // "replace" remplace l'entrée dans l'historique (le bouton retour ne revient pas ici)
  if (!estConnecte) {
    return <Navigate to="/login" replace />;
  }

  // Sinon : affiche normalement la page demandée
  return <>{children}</>;
};

export default PrivateRoute;
