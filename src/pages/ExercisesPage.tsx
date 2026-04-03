// src/pages/ExercisesPage.tsx
// Page listant tous les exercices de respiration disponibles.
// Affiche pour chaque exercice ses durées de phases et un bouton
// pour accéder à l'animation guidée.

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getExercices } from '../services/exerciseService';
import type { BreathingExercise } from '../services/exerciseService';

const ExercisesPage: React.FC = () => {
  const navigate = useNavigate();
  const [exercices, setExercices] = useState<BreathingExercise[]>([]);
  const [chargement, setChargement] = useState<boolean>(true);
  const [erreur, setErreur] = useState<string>('');

  useEffect(() => {
    const chargerExercices = async () => {
      try {
        const donnees = await getExercices();
        // Filtre uniquement les exercices actifs
        setExercices(donnees.filter((e) => e.isActive));
      } catch (err) {
        setErreur('Impossible de charger les exercices. Réessaie plus tard.');
        console.error('Erreur chargement exercices :', err);
      } finally {
        setChargement(false);
      }
    };
    chargerExercices();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-10">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">🌬️ Exercices de respiration</h1>
          <p className="text-gray-500 mt-2">
            Choisis un exercice et suis le guide animé pour te détendre.
          </p>
        </div>

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

        {/* Liste des exercices */}
        {!chargement && !erreur && (
          <div className="grid grid-cols-1 gap-6">
            {exercices.map((exercice) => (
              <ExerciceCard
                key={exercice.id}
                exercice={exercice}
                onCommencer={() => navigate(`/exercises/${exercice.id}`)}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

// Carte d'un exercice individuel
interface ExerciceCardProps {
  exercice: BreathingExercise;
  onCommencer: () => void;
}

const ExerciceCard: React.FC<ExerciceCardProps> = ({ exercice, onCommencer }) => {
  // Calcule la durée totale de l'exercice en minutes et secondes
  const dureeTotale = (exercice.inspirationDuration + exercice.apneaDuration + exercice.expirationDuration) * exercice.cycles;
  const minutes = Math.floor(dureeTotale / 60);
  const secondes = dureeTotale % 60;
  const dureeLabel = minutes > 0 ? `${minutes} min ${secondes > 0 ? secondes + 's' : ''}` : `${secondes}s`;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">

        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-800 mb-1">{exercice.nom}</h2>
          {exercice.description && (
            <p className="text-gray-500 text-sm leading-relaxed mb-4">{exercice.description}</p>
          )}

          {/* Phases de l'exercice sous forme de badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            <PhaseBadge label="Inspire" duree={exercice.inspirationDuration} couleur="blue" />
            {exercice.apneaDuration > 0 && (
              <PhaseBadge label="Pause" duree={exercice.apneaDuration} couleur="purple" />
            )}
            <PhaseBadge label="Expire" duree={exercice.expirationDuration} couleur="teal" />
          </div>

          {/* Infos supplémentaires */}
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span>🔄 {exercice.cycles} cycles</span>
            <span>⏱️ ~{dureeLabel}</span>
            {exercice.isPreset && <span className="text-blue-400">⭐ Exercice recommandé</span>}
          </div>
        </div>

        {/* Bouton commencer */}
        <button
          onClick={onCommencer}
          className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
        >
          Commencer
        </button>

      </div>
    </div>
  );
};

// Badge affichant une phase (inspire / pause / expire) avec sa durée
interface PhaseBadgeProps {
  label: string;
  duree: number;
  couleur: 'blue' | 'purple' | 'teal';
}

const PhaseBadge: React.FC<PhaseBadgeProps> = ({ label, duree, couleur }) => {
  const classes = {
    blue:   'bg-blue-50 text-blue-700',
    purple: 'bg-purple-50 text-purple-700',
    teal:   'bg-teal-50 text-teal-700',
  };

  return (
    <span className={`${classes[couleur]} text-xs font-semibold px-3 py-1 rounded-full`}>
      {label} {duree}s
    </span>
  );
};

export default ExercisesPage;
