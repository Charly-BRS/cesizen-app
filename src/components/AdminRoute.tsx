// src/components/AdminRoute.tsx
// Composant de protection des pages d'administration.
// Si l'utilisateur n'est pas connecté → redirige vers /login.
// Si l'utilisateur est connecté mais n'est pas admin → redirige vers /dashboard.

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { utilisateur, estConnecte } = useAuth();

  // Pas connecté → login
  if (!estConnecte) {
    return <Navigate to="/login" replace />;
  }

  // Connecté mais pas admin → dashboard (accès refusé)
  const estAdmin = utilisateur?.roles.includes('ROLE_ADMIN') ?? false;
  if (!estAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
