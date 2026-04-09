// src/App.tsx
// Composant racine de l'application CESIZen.
// Définit toutes les routes de l'application et protège
// les pages privées avec le composant PrivateRoute.
// Les pages admin sont protégées par AdminRoute (ROLE_ADMIN requis).

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Composants de mise en page
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';

// Pages publiques (accessibles sans connexion)
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// Pages privées (nécessitent une connexion)
import DashboardPage from './pages/DashboardPage';
import ProfilPage from './pages/ProfilPage';
import ArticlesPage from './pages/ArticlesPage';
import ArticleDetailPage from './pages/ArticleDetailPage';
import ExercisesPage from './pages/ExercisesPage';
import ExerciseDetailPage from './pages/ExerciseDetailPage';
import SessionHistoryPage from './pages/SessionHistoryPage';

// Pages admin (nécessitent ROLE_ADMIN)
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminExercisesPage from './pages/admin/AdminExercisesPage';
import AdminArticlesPage from './pages/admin/AdminArticlesPage';

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
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

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
          path="/profil"
          element={
            <PrivateRoute>
              <ProfilPage />
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
        <Route
          path="/articles/:id"
          element={
            <PrivateRoute>
              <ArticleDetailPage />
            </PrivateRoute>
          }
        />

        {/* ── Exercices de respiration ─────────────────────── */}
        <Route
          path="/exercises"
          element={<PrivateRoute><ExercisesPage /></PrivateRoute>}
        />
        <Route
          path="/exercises/:id"
          element={<PrivateRoute><ExerciseDetailPage /></PrivateRoute>}
        />
        <Route
          path="/sessions"
          element={<PrivateRoute><SessionHistoryPage /></PrivateRoute>}
        />

        {/* ── Pages admin (ROLE_ADMIN requis) ─────────────── */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboardPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <AdminUsersPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/exercises"
          element={
            <AdminRoute>
              <AdminExercisesPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/articles"
          element={
            <AdminRoute>
              <AdminArticlesPage />
            </AdminRoute>
          }
        />

        {/* Route 404 : redirige vers l'accueil si l'URL n'existe pas */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
