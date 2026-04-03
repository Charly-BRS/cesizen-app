// src/pages/LoginPage.tsx
// Page de connexion de CESIZen.
// Affiche un formulaire email + mot de passe, appelle l'API,
// stocke le token JWT et redirige vers le dashboard si succès.

import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login } from '../services/authService';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { connecter } = useAuth();

  // États des champs du formulaire
  const [email, setEmail] = useState<string>('');
  const [motDePasse, setMotDePasse] = useState<string>('');

  // État de chargement : désactive le bouton pendant la requête
  const [chargement, setChargement] = useState<boolean>(false);

  // Message d'erreur à afficher sous le formulaire
  const [erreur, setErreur] = useState<string>('');

  // Appelé quand l'utilisateur soumet le formulaire
  const handleSoumission = async (e: FormEvent) => {
    // Empêche le rechargement de la page (comportement natif du formulaire)
    e.preventDefault();
    setErreur('');
    setChargement(true);

    try {
      // Appel à l'API : POST /api/auth/login
      const reponse = await login({ email, password: motDePasse });

      // Décode le payload du token JWT pour récupérer les infos utilisateur
      // Le token est au format : header.payload.signature (base64)
      const payloadBase64 = reponse.token.split('.')[1];
      const payload = JSON.parse(atob(payloadBase64));

      // Sauvegarde le token et les infos utilisateur dans le contexte global
      connecter(
        {
          id: payload.id,
          email: payload.email ?? email,
          roles: payload.roles ?? ['ROLE_USER'],
          prenom: payload.prenom ?? '',
          nom: payload.nom ?? '',
        },
        reponse.token
      );

      // Redirige vers le dashboard après connexion réussie
      navigate('/');
    } catch (err: unknown) {
      // Affiche un message d'erreur lisible selon le code HTTP reçu
      if (err && typeof err === 'object' && 'response' in err) {
        const errAxios = err as { response: { status: number } };
        if (errAxios.response?.status === 401) {
          setErreur('Email ou mot de passe incorrect.');
        } else {
          setErreur('Une erreur est survenue. Réessaie plus tard.');
        }
      } else {
        setErreur('Impossible de contacter le serveur.');
      }
    } finally {
      // Réactive le bouton dans tous les cas (succès ou erreur)
      setChargement(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-md w-full max-w-md p-8">

        {/* En-tête */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600">🧘 CESIZen</h1>
          <p className="text-gray-500 mt-2">Connecte-toi à ton espace bien-être</p>
        </div>

        {/* Message d'erreur */}
        {erreur && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-6 text-sm">
            {erreur}
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSoumission} className="flex flex-col gap-5">

          {/* Champ Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ton@email.fr"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            />
          </div>

          {/* Champ Mot de passe */}
          <div>
            <label htmlFor="motDePasse" className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <input
              id="motDePasse"
              type="password"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            />
          </div>

          {/* Bouton de connexion */}
          <button
            type="submit"
            disabled={chargement}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-2.5 rounded-lg transition-colors"
          >
            {chargement ? 'Connexion en cours...' : 'Se connecter'}
          </button>

        </form>

        {/* Lien vers l'inscription */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Pas encore de compte ?{' '}
          <Link to="/register" className="text-blue-600 hover:underline font-medium">
            Créer un compte
          </Link>
        </p>

      </div>
    </div>
  );
};

export default LoginPage;
