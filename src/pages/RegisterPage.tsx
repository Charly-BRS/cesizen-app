// src/pages/RegisterPage.tsx
// Page d'inscription de CESIZen.
// Affiche un formulaire de création de compte, appelle l'API,
// puis redirige vers la page de connexion si l'inscription réussit.

import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/authService';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  // États des champs du formulaire
  const [prenom, setPrenom] = useState<string>('');
  const [nom, setNom] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [motDePasse, setMotDePasse] = useState<string>('');
  const [confirmation, setConfirmation] = useState<string>('');

  // États de l'interface
  const [chargement, setChargement] = useState<boolean>(false);
  const [erreur, setErreur] = useState<string>('');
  const [succes, setSucces] = useState<string>('');

  const handleSoumission = async (e: FormEvent) => {
    e.preventDefault();
    setErreur('');
    setSucces('');

    // Vérification côté client : les deux mots de passe doivent correspondre
    if (motDePasse !== confirmation) {
      setErreur('Les mots de passe ne correspondent pas.');
      return;
    }

    // Vérification : longueur minimale du mot de passe
    if (motDePasse.length < 8) {
      setErreur('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    setChargement(true);

    try {
      // Appel à l'API : POST /api/auth/register
      const reponse = await register({ email, password: motDePasse, prenom, nom });

      // Affiche le message de succès
      setSucces(reponse.message);

      // Redirige vers le login après 2 secondes
      setTimeout(() => navigate('/login'), 2000);

    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const errAxios = err as { response: { status: number; data: { message?: string } } };

        if (errAxios.response?.status === 409) {
          setErreur('Cet email est déjà utilisé.');
        } else if (errAxios.response?.data?.message) {
          setErreur(errAxios.response.data.message);
        } else {
          setErreur('Une erreur est survenue. Réessaie plus tard.');
        }
      } else {
        setErreur('Impossible de contacter le serveur.');
      }
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-md w-full max-w-md p-8">

        {/* En-tête */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-700">🧘 CESIZen</h1>
          <p className="text-gray-500 mt-2">Crée ton espace bien-être</p>
        </div>

        {/* Message d'erreur */}
        {erreur && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-6 text-sm">
            {erreur}
          </div>
        )}

        {/* Message de succès */}
        {succes && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 mb-6 text-sm">
            ✅ {succes} Redirection vers la connexion...
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSoumission} className="flex flex-col gap-4">

          {/* Prénom + Nom sur la même ligne */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label htmlFor="prenom" className="block text-sm font-medium text-gray-700 mb-1">
                Prénom
              </label>
              <input
                id="prenom"
                type="text"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                placeholder="Jean"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 transition"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">
                Nom
              </label>
              <input
                id="nom"
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Dupont"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 transition"
              />
            </div>
          </div>

          {/* Email */}
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
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 transition"
            />
          </div>

          {/* Mot de passe */}
          <div>
            <label htmlFor="motDePasse" className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe <span className="text-gray-400">(8 caractères min.)</span>
            </label>
            <input
              id="motDePasse"
              type="password"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 transition"
            />
          </div>

          {/* Confirmation mot de passe */}
          <div>
            <label htmlFor="confirmation" className="block text-sm font-medium text-gray-700 mb-1">
              Confirmer le mot de passe
            </label>
            <input
              id="confirmation"
              type="password"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 transition"
            />
          </div>

          {/* Bouton d'inscription */}
          <button
            type="submit"
            disabled={chargement}
            className="bg-green-700 hover:bg-green-800 disabled:bg-green-300 text-white font-semibold py-2.5 rounded-lg transition-colors mt-1"
          >
            {chargement ? 'Création en cours...' : 'Créer mon compte'}
          </button>

        </form>

        {/* Lien vers la connexion */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-green-700 hover:underline font-medium">
            Se connecter
          </Link>
        </p>

      </div>
    </div>
  );
};

export default RegisterPage;
