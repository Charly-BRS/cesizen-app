// src/pages/SessionHistoryPage.tsx
// Page affichant l'historique des sessions d'exercices de respiration de l'utilisateur.
// Liste toutes les sessions avec leur statut, durée et exercice associé (F23).

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMesSessions } from '../services/exerciseService';
import type { UserSession } from '../services/exerciseService';

// Libellés et couleurs pour chaque statut de session
const STATUT_AFFICHAGE: Record<string, { label: string; classes: string }> = {
  completed: { label: '✅ Complétée',   classes: 'bg-green-50 text-green-700' },
  abandoned: { label: '⛔ Abandonnée', classes: 'bg-red-50 text-red-600'   },
  started:   { label: '🔄 En cours',   classes: 'bg-blue-50 text-blue-600'  },
};

const SessionHistoryPage: React.FC = () => {
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [chargement, setChargement] = useState<boolean>(true);
  const [erreur, setErreur] = useState<string>('');

  useEffect(() => {
    const chargerSessions = async () => {
      try {
        const donnees = await getMesSessions();
        setSessions(donnees);
      } catch {
        setErreur('Impossible de charger l\'historique. Réessaie plus tard.');
      } finally {
        setChargement(false);
      }
    };
    chargerSessions();
  }, []);

  // Calcule le nombre de sessions complétées
  const sessionsCompletees = sessions.filter((s) => s.status === 'completed').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-10">

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">📊 Mon historique</h1>
            <p className="text-gray-500 mt-1">Tes sessions d'exercices de respiration</p>
          </div>
          <Link
            to="/exercises"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
          >
            + Nouvel exercice
          </Link>
        </div>

        {/* Stat rapide */}
        {!chargement && sessions.length > 0 && (
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-8 flex gap-8">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-700">{sessions.length}</p>
              <p className="text-sm text-blue-500 mt-1">Sessions totales</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{sessionsCompletees}</p>
              <p className="text-sm text-gray-500 mt-1">Complétées</p>
            </div>
          </div>
        )}

        {/* Chargement */}
        {chargement && (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Erreur */}
        {!chargement && erreur && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3">
            {erreur}
          </div>
        )}

        {/* Aucune session */}
        {!chargement && !erreur && sessions.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-5xl mb-4">🌬️</p>
            <p className="text-lg font-medium">Aucune session pour le moment</p>
            <p className="text-sm mt-1">Lance ton premier exercice de respiration !</p>
            <Link
              to="/exercises"
              className="mt-6 inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              Voir les exercices
            </Link>
          </div>
        )}

        {/* Liste des sessions */}
        {!chargement && !erreur && sessions.length > 0 && (
          <div className="flex flex-col gap-4">
            {sessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

// Carte d'une session individuelle
const SessionCard: React.FC<{ session: UserSession }> = ({ session }) => {
  const statut = STATUT_AFFICHAGE[session.status] ?? STATUT_AFFICHAGE.started;

  // Formate la date au format français
  const date = new Date(session.startedAt).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  const heure = new Date(session.startedAt).toLocaleTimeString('fr-FR', {
    hour: '2-digit', minute: '2-digit',
  });

  // Calcule la durée si la session est terminée
  let dureeLabel = '';
  if (session.endedAt) {
    const dureeSecondes = Math.round(
      (new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime()) / 1000
    );
    const min = Math.floor(dureeSecondes / 60);
    const sec = dureeSecondes % 60;
    dureeLabel = min > 0 ? `${min}min ${sec}s` : `${sec}s`;
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-4 flex items-center justify-between">
      <div>
        <p className="font-semibold text-gray-800">{session.breathingExercise.nom}</p>
        <p className="text-sm text-gray-400 mt-0.5">
          {date} à {heure} {dureeLabel && `· ${dureeLabel}`}
        </p>
      </div>
      <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${statut.classes}`}>
        {statut.label}
      </span>
    </div>
  );
};

export default SessionHistoryPage;
