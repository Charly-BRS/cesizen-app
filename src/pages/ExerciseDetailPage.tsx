// src/pages/ExerciseDetailPage.tsx
// Page d'animation guidée pour un exercice de respiration.
// Affiche un cercle animé qui se dilate (inspiration) et se contracte (expiration),
// un texte indiquant la phase en cours, un compte à rebours, et le cycle actuel.
// Enregistre une session en base au démarrage et la met à jour à la fin.

import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getExercice, demarrerSession, terminerSession } from '../services/exerciseService';
import type { BreathingExercise } from '../services/exerciseService';

// Les 3 phases possibles d'un cycle de respiration
type Phase = 'inspiration' | 'apnee' | 'expiration' | 'termine';

// Informations d'affichage pour chaque phase
const INFOS_PHASE: Record<Phase, { label: string; couleur: string; emoji: string }> = {
  inspiration: { label: 'Inspirez',  couleur: 'text-blue-600',  emoji: '⬆️' },
  apnee:       { label: 'Retenez',   couleur: 'text-purple-600', emoji: '⏸️' },
  expiration:  { label: 'Expirez',   couleur: 'text-teal-600',   emoji: '⬇️' },
  termine:     { label: 'Terminé !', couleur: 'text-green-600',  emoji: '✅' },
};

const ExerciseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Données de l'exercice chargé depuis l'API
  const [exercice, setExercice] = useState<BreathingExercise | null>(null);
  const [chargement, setChargement] = useState<boolean>(true);
  const [erreur, setErreur] = useState<string>('');

  // État de l'exercice en cours
  const [estDemarre, setEstDemarre]     = useState<boolean>(false);
  const [phase, setPhase]               = useState<Phase>('inspiration');
  const [compteur, setCompteur]         = useState<number>(0);
  const [cycleActuel, setCycleActuel]   = useState<number>(0);
  const [estTermine, setEstTermine]     = useState<boolean>(false);

  // Référence vers l'id de session créée en base (pour la mettre à jour à la fin)
  const sessionIdRef = useRef<number | null>(null);

  // Référence vers l'intervalle du compte à rebours (pour pouvoir l'annuler)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Charge l'exercice depuis l'API au montage du composant
  useEffect(() => {
    const charger = async () => {
      try {
        if (!id) return;
        const donnees = await getExercice(Number(id));
        setExercice(donnees);
        setCompteur(donnees.inspirationDuration);
      } catch {
        setErreur('Exercice introuvable.');
      } finally {
        setChargement(false);
      }
    };
    charger();
  }, [id]);

  // Nettoie l'intervalle quand le composant est démonté
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Logique principale du minuteur — avance d'une seconde à chaque tick
  // useCallback évite de recréer cette fonction à chaque rendu
  const tick = useCallback((
    phaseActuelle: Phase,
    compteurActuel: number,
    cycleActuelLocal: number,
    exerciceLocal: BreathingExercise,
    sessionId: number | null
  ) => {
    // Décrémente le compteur
    const prochainCompteur = compteurActuel - 1;

    if (prochainCompteur > 0) {
      // Encore du temps dans cette phase : on décrémente simplement
      setCompteur(prochainCompteur);
    } else {
      // La phase est terminée : passe à la suivante
      let prochainePhase: Phase;
      let prochaineCycle = cycleActuelLocal;

      if (phaseActuelle === 'inspiration') {
        if (exerciceLocal.apneaDuration > 0) {
          // Il y a une apnée : on y passe
          prochainePhase = 'apnee';
          setCompteur(exerciceLocal.apneaDuration);
        } else {
          // Pas d'apnée : on passe directement à l'expiration
          prochainePhase = 'expiration';
          setCompteur(exerciceLocal.expirationDuration);
        }
      } else if (phaseActuelle === 'apnee') {
        prochainePhase = 'expiration';
        setCompteur(exerciceLocal.expirationDuration);
      } else {
        // Fin de l'expiration = fin d'un cycle
        prochaineCycle = cycleActuelLocal + 1;

        if (prochaineCycle >= exerciceLocal.cycles) {
          // Tous les cycles sont terminés
          prochainePhase = 'termine';
          setEstTermine(true);
          if (intervalRef.current) clearInterval(intervalRef.current);

          // Met à jour la session en base avec le statut "completed"
          if (sessionId) {
            terminerSession(sessionId, 'completed').catch(console.error);
          }
        } else {
          // Prochain cycle : on recommence par l'inspiration
          prochainePhase = 'inspiration';
          setCompteur(exerciceLocal.inspirationDuration);
          setCycleActuel(prochaineCycle);
        }
      }

      setPhase(prochainePhase);
    }
  }, []);

  // Démarre l'exercice : crée une session en base et lance le minuteur
  const demarrer = async () => {
    if (!exercice) return;

    try {
      // Crée la session en base (F22)
      const session = await demarrerSession(exercice.id);
      sessionIdRef.current = session.id;
    } catch {
      // Si la session échoue (non connecté), on continue quand même l'animation
      console.warn('Session non enregistrée (utilisateur non connecté ?)');
    }

    setEstDemarre(true);
    setPhase('inspiration');
    setCompteur(exercice.inspirationDuration);
    setCycleActuel(0);
    setEstTermine(false);

    // Lance le minuteur : tick toutes les secondes
    intervalRef.current = setInterval(() => {
      // On lit les valeurs via des refs pour éviter les closures obsolètes
      setPhase((phaseActuelle) => {
        setCompteur((compteurActuel) => {
          setCycleActuel((cycleActuelLocal) => {
            tick(phaseActuelle, compteurActuel, cycleActuelLocal, exercice, sessionIdRef.current);
            return cycleActuelLocal;
          });
          return compteurActuel;
        });
        return phaseActuelle;
      });
    }, 1000);
  };

  // Abandonne l'exercice en cours
  const abandonner = async () => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (sessionIdRef.current) {
      await terminerSession(sessionIdRef.current, 'abandoned').catch(console.error);
    }

    navigate('/exercises');
  };

  if (chargement) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (erreur || !exercice) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-600">{erreur || 'Exercice introuvable.'}</p>
      </div>
    );
  }

  const infoPhaseActuelle = INFOS_PHASE[phase];

  // Taille du cercle : grande pendant l'inspiration/apnée, petite pendant l'expiration
  const estExpansion = phase === 'inspiration' || phase === 'apnee';
  const tailleCercle = estTermine ? 'scale-100' : estExpansion ? 'scale-150' : 'scale-75';

  // Durée de la transition CSS du cercle (correspond à la durée de la phase)
  const dureeCycleCss = phase === 'inspiration'
    ? exercice.inspirationDuration
    : phase === 'apnee'
      ? exercice.apneaDuration
      : exercice.expirationDuration;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50">
      <div className="max-w-lg mx-auto px-4 py-10 flex flex-col items-center">

        {/* Titre et description */}
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold text-gray-800">{exercice.nom}</h1>
          {!estDemarre && exercice.description && (
            <p className="text-gray-500 text-sm mt-2 max-w-sm">{exercice.description}</p>
          )}
        </div>

        {/* ── Animation cercle de respiration ── */}
        <div className="relative flex items-center justify-center mb-10" style={{ width: 220, height: 220 }}>
          {/* Cercle extérieur fixe (guide visuel) */}
          <div className="absolute inset-0 rounded-full border-2 border-blue-100" />

          {/* Cercle animé : se dilate/contracte selon la phase */}
          <div
            className={`rounded-full bg-blue-400 bg-opacity-30 border-4 border-blue-500 transition-transform ${tailleCercle}`}
            style={{
              width: 130,
              height: 130,
              transitionDuration: estDemarre ? `${dureeCycleCss}s` : '0s',
              transitionTimingFunction: 'ease-in-out',
            }}
          />

          {/* Texte au centre du cercle */}
          {estDemarre && (
            <div className="absolute flex flex-col items-center">
              <span className="text-4xl">{infoPhaseActuelle.emoji}</span>
              {!estTermine && (
                <span className="text-2xl font-bold text-blue-700 mt-1">{compteur}</span>
              )}
            </div>
          )}
        </div>

        {/* ── Phase et progression ── */}
        {estDemarre && (
          <div className="text-center mb-8">
            <p className={`text-2xl font-bold ${infoPhaseActuelle.couleur} mb-2`}>
              {infoPhaseActuelle.label}
            </p>
            {!estTermine && (
              <p className="text-gray-400 text-sm">
                Cycle {cycleActuel + 1} / {exercice.cycles}
              </p>
            )}
          </div>
        )}

        {/* ── Infos phases (avant démarrage) ── */}
        {!estDemarre && (
          <div className="flex gap-3 mb-8">
            <InfoPhase label="Inspirez" duree={exercice.inspirationDuration} couleur="blue" />
            {exercice.apneaDuration > 0 && (
              <InfoPhase label="Retenez" duree={exercice.apneaDuration} couleur="purple" />
            )}
            <InfoPhase label="Expirez" duree={exercice.expirationDuration} couleur="teal" />
            <InfoPhase label="Cycles" duree={exercice.cycles} couleur="gray" unite="" />
          </div>
        )}

        {/* ── Boutons d'action ── */}
        {!estDemarre && (
          <div className="flex flex-col items-center gap-3 w-full max-w-xs">
            <button
              onClick={demarrer}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl text-lg transition-colors"
            >
              ▶ Commencer l'exercice
            </button>
            <button
              onClick={() => navigate('/exercises')}
              className="text-gray-400 hover:text-gray-600 text-sm"
            >
              ← Retour aux exercices
            </button>
          </div>
        )}

        {estDemarre && !estTermine && (
          <button
            onClick={abandonner}
            className="mt-4 text-red-400 hover:text-red-600 text-sm underline"
          >
            Arrêter l'exercice
          </button>
        )}

        {estTermine && (
          <div className="flex flex-col items-center gap-4 mt-4">
            <p className="text-green-600 font-semibold text-lg">
              Bravo ! Tu as complété l'exercice 🎉
            </p>
            <button
              onClick={() => navigate('/exercises')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
            >
              Retour aux exercices
            </button>
            <button
              onClick={() => navigate('/sessions')}
              className="text-blue-500 hover:underline text-sm"
            >
              Voir mon historique
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

// Petit bloc d'info pour une phase (durée + label)
const InfoPhase: React.FC<{ label: string; duree: number; couleur: string; unite?: string }> = ({
  label, duree, couleur, unite = 's'
}) => {
  const bg: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-700', purple: 'bg-purple-50 text-purple-700',
    teal: 'bg-teal-50 text-teal-700', gray: 'bg-gray-50 text-gray-600',
  };
  return (
    <div className={`${bg[couleur]} rounded-xl px-4 py-3 text-center`}>
      <p className="text-2xl font-bold">{duree}{unite}</p>
      <p className="text-xs mt-1">{label}</p>
    </div>
  );
};

export default ExerciseDetailPage;
