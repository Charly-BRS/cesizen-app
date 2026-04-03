// src/App.tsx
// Composant racine de l'application CESIZen.
// Définit toutes les routes de l'application et protège
// les pages privées avec le composant PrivateRoute.

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Composants de mise en page
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';

// Pages publiques (accessibles sans connexion)
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Pages privées (nécessitent une connexion)
import DashboardPage from './pages/DashboardPage';
import ArticlesPage from './pages/ArticlesPage';

// Redirige vers /dashboard si connecté, sinon vers /login
const RootRedirect: React.FC = () => {
  const { estConnecte } = useAuth();
  return estConnecte ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      {/* La Navbar se masque automatiquement sur les pages non connectées */}
      <Navbar />

      <Routes>
        {/* Redirection intelligente sur la racine */}
        <Route path="/" element={<RootRedirect />} />

        {/* ── Pages publiques ─────────────────────────────── */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* ── Pages privées (connexion requise) ───────────── */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/articles"
          element={
            <PrivateRoute>
              <ArticlesPage />
            </PrivateRoute>
          }
        />

        {/* Route 404 : redirige vers l'accueil si l'URL n'existe pas */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
