// src/pages/ExercisesPage.tsx
// Page listant tous les exercices de respiration disponibles.
// Design moderne : bannière hero, grille 2 colonnes, cartes animées.

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getExercices } from '../services/exerciseService';
import type { BreathingExercise } from '../services/exerciseService';

// ── Composant principal ───────────────────────────────────────────────────────
const ExercisesPage: React.FC = () => {
  const navigate = useNavigate();
  const [exercices, setExercices] = useState<BreathingExercise[]>([]);
  const [chargement, setChargement] = useState<boolean>(true);
  const [erreur, setErreur] = useState<string>('');

  useEffect(() => {
    const chargerExercices = async () => {
      try {
        const donnees = await getExercices();
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
    <div className="flex-1 bg-slate-50">

      {/* ── Bannière hero ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-teal-700 via-emerald-600 to-green-600">
        <div className="absolute -top-10 -right-10 w-56 h-56 bg-white/5 rounded-full animate-breathe" />
        <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-white/5 rounded-full animate-breathe" style={{ animationDelay: '2s' }} />

        <div className="relative max-w-6xl mx-auto px-6 py-12 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-teal-200 text-xs font-bold uppercase tracking-widest mb-2">
                Bien-être · Respiration
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">
                Exercices de respiration 🌬️
              </h1>
              <p className="text-teal-100 text-base mt-2 max-w-lg">
                Choisis un exercice, suis l'animation guidée et retrouve ton calme en quelques minutes.
              </p>
            </div>

            {/* Stats inline */}
            {!chargement && exercices.length > 0 && (
              <div className="flex gap-4 sm:flex-col sm:items-end">
                <div className="bg-white/15 border border-white/20 rounded-xl px-4 py-2 text-center">
                  <p className="text-2xl font-bold text-white">{exercices.length}</p>
                  <p className="text-teal-200 text-xs">exercices disponibles</p>
                </div>
                <div className="bg-white/15 border border-white/20 rounded-xl px-4 py-2 text-center">
                  <p className="text-2xl font-bold text-white">
                    {exercices.filter((e) => e.isPreset).length}
                  </p>
                  <p className="text-teal-200 text-xs">recommandés</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Contenu ── */}
      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Chargement — skeleton */}
        {chargement && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="skeleton h-6 w-2/3 mb-3" />
                <div className="skeleton h-4 w-full mb-2" />
                <div className="skeleton h-4 w-3/4 mb-5" />
                <div className="flex gap-2 mb-4">
                  <div className="skeleton h-7 w-20 rounded-full" />
                  <div className="skeleton h-7 w-20 rounded-full" />
                  <div className="skeleton h-7 w-20 rounded-full" />
                </div>
                <div className="skeleton h-10 w-32 rounded-xl" />
              </div>
            ))}
          </div>
        )}

        {/* Erreur */}
        {!chargement && erreur && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-4 flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <p className="text-sm">{erreur}</p>
          </div>
        )}

        {/* Aucun exercice */}
        {!chargement && !erreur && exercices.length === 0 && (
          <div className="text-center py-24 text-slate-400">
            <p className="text-6xl mb-5">🌬️</p>
            <p className="text-xl font-semibold text-slate-600">Aucun exercice disponible</p>
            <p className="text-sm mt-2">Reviens bientôt, de nouveaux exercices seront ajoutés !</p>
          </div>
        )}

        {/* Grille des exercices */}
        {!chargement && !erreur && exercices.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 stagger">
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

// ── Carte d'un exercice ───────────────────────────────────────────────────────
interface ExerciceCardProps {
  exercice: BreathingExercise;
  onCommencer: () => void;
}

const ExerciceCard: React.FC<ExerciceCardProps> = ({ exercice, onCommencer }) => {
  // Durée totale de l'exercice
  const dureeTotale = (exercice.inspirationDuration + exercice.apneaDuration + exercice.expirationDuration) * exercice.cycles;
  const minutes = Math.floor(dureeTotale / 60);
  const secondes = dureeTotale % 60;
  const dureeLabel = minutes > 0 ? `${minutes} min${secondes > 0 ? ' ' + secondes + 's' : ''}` : `${secondes}s`;

  // Calcule le ratio visuel de chaque phase pour la barre de progression
  const totalPhase = exercice.inspirationDuration + exercice.apneaDuration + exercice.expirationDuration;
  const pctInspire  = Math.round((exercice.inspirationDuration / totalPhase) * 100);
  const pctPause    = Math.round((exercice.apneaDuration       / totalPhase) * 100);
  // pctExpire = 100 - pctInspire - pctPause (la barre teal prend le reste avec flex-1)

  return (
    <div className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden animate-fade-in-up">

      {/* Barre de phases colorée en haut */}
      <div className="h-2 w-full flex">
        <div className="bg-blue-400 transition-all" style={{ width: `${pctInspire}%` }} title={`Inspiration : ${exercice.inspirationDuration}s`} />
        {exercice.apneaDuration > 0 && (
          <div className="bg-violet-400" style={{ width: `${pctPause}%` }} title={`Apnée : ${exercice.apneaDuration}s`} />
        )}
        <div className="bg-teal-400 flex-1" title={`Expiration : ${exercice.expirationDuration}s`} />
      </div>

      <div className="p-6">

        {/* En-tête : titre + badge preset */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1">
            <h2 className="text-lg font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">
              {exercice.nom}
            </h2>
            {exercice.isPreset && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full mt-1">
                ⭐ Recommandé
              </span>
            )}
          </div>
          {/* Durée totale */}
          <div className="shrink-0 text-right">
            <p className="text-lg font-bold text-emerald-600">~{dureeLabel}</p>
            <p className="text-xs text-slate-400">{exercice.cycles} cycles</p>
          </div>
        </div>

        {/* Description */}
        {exercice.description && (
          <p className="text-slate-500 text-sm leading-relaxed mb-4">{exercice.description}</p>
        )}

        {/* Badges des phases */}
        <div className="flex flex-wrap gap-2 mb-5">
          <PhaseBadge label="🫁 Inspire" duree={exercice.inspirationDuration} couleur="blue" />
          {exercice.apneaDuration > 0 && (
            <PhaseBadge label="⏸️ Pause" duree={exercice.apneaDuration} couleur="purple" />
          )}
          <PhaseBadge label="💨 Expire" duree={exercice.expirationDuration} couleur="teal" />
        </div>

        {/* Légende de la barre + bouton */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" /> Inspire
            </span>
            {exercice.apneaDuration > 0 && (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-violet-400 inline-block" /> Pause
              </span>
            )}
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-teal-400 inline-block" /> Expire
            </span>
          </div>

          <button
            onClick={onCommencer}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2 rounded-xl transition-colors text-sm flex items-center gap-2 group-hover:shadow-md"
          >
            Commencer <span className="group-hover:translate-x-0.5 transition-transform inline-block">→</span>
          </button>
        </div>

      </div>
    </div>
  );
};

// ── Badge de phase ────────────────────────────────────────────────────────────
interface PhaseBadgeProps {
  label: string;
  duree: number;
  couleur: 'blue' | 'purple' | 'teal';
}

const PhaseBadge: React.FC<PhaseBadgeProps> = ({ label, duree, couleur }) => {
  const classes = {
    blue:   'bg-blue-50 text-blue-700 border-blue-200',
    purple: 'bg-violet-50 text-violet-700 border-violet-200',
    teal:   'bg-teal-50 text-teal-700 border-teal-200',
  };
  return (
    <span className={`${classes[couleur]} border text-xs font-semibold px-3 py-1 rounded-full`}>
      {label} · {duree}s
    </span>
  );
};

export default ExercisesPage;
