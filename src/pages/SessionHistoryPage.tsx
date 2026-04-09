// src/pages/SessionHistoryPage.tsx
// Historique des sessions d'exercices de respiration.
// Design moderne : stats détaillées, timeline animée.

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMesSessions } from '../services/exerciseService';
import type { UserSession } from '../services/exerciseService';

// ── Config des statuts ────────────────────────────────────────────────────────
const STATUTS: Record<string, {
  label: string;
  emoji: string;
  classes: string;
  dot: string;
}> = {
  completed: { label: 'Complétée',   emoji: '✅', classes: 'bg-emerald-50 text-emerald-700 border border-emerald-200', dot: 'bg-emerald-500' },
  abandoned: { label: 'Abandonnée',  emoji: '⛔', classes: 'bg-red-50 text-red-600 border border-red-200',             dot: 'bg-red-400'    },
  started:   { label: 'En cours',    emoji: '🔄', classes: 'bg-blue-50 text-blue-600 border border-blue-200',          dot: 'bg-blue-400'   },
};

// ── Composant principal ───────────────────────────────────────────────────────
const SessionHistoryPage: React.FC = () => {
  const [sessions, setSessions]     = useState<UserSession[]>([]);
  const [chargement, setChargement] = useState<boolean>(true);
  const [erreur, setErreur]         = useState<string>('');

  useEffect(() => {
    const chargerSessions = async () => {
      try {
        const donnees = await getMesSessions();
        // Tri anti-chronologique : sessions les plus récentes en premier
        setSessions(donnees.sort((a, b) =>
          new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
        ));
      } catch {
        setErreur("Impossible de charger l'historique. Réessaie plus tard.");
      } finally {
        setChargement(false);
      }
    };
    chargerSessions();
  }, []);

  // Statistiques calculées
  const total       = sessions.length;
  const completees  = sessions.filter((s) => s.status === 'completed').length;
  const abandonnees = sessions.filter((s) => s.status === 'abandoned').length;
  const tauxReussite = total > 0 ? Math.round((completees / total) * 100) : 0;

  // Durée totale des sessions complétées (en secondes)
  const dureeTotaleSecondes = sessions
    .filter((s) => s.status === 'completed' && s.endedAt)
    .reduce((acc, s) => {
      const duree = (new Date(s.endedAt!).getTime() - new Date(s.startedAt).getTime()) / 1000;
      return acc + duree;
    }, 0);
  const minutesTotales = Math.round(dureeTotaleSecondes / 60);

  return (
    <div className="flex-1 bg-slate-50">

      {/* ── Bannière hero ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-violet-700 via-purple-600 to-fuchsia-600">
        <div className="absolute -top-10 -right-10 w-56 h-56 bg-white/5 rounded-full animate-breathe" />
        <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-white/5 rounded-full" />

        <div className="relative max-w-6xl mx-auto px-6 py-12 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-violet-200 text-xs font-bold uppercase tracking-widest mb-2">
                Bien-être · Progression
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">
                Mon historique 📊
              </h1>
              <p className="text-violet-100 text-base mt-2">
                Suis ta progression et visualise le temps consacré à ton bien-être.
              </p>
            </div>

            <Link
              to="/exercises"
              className="shrink-0 inline-flex items-center gap-2 bg-white text-violet-700 font-bold px-5 py-3 rounded-xl hover:bg-violet-50 transition-all duration-200 shadow-lg hover:-translate-y-0.5 text-sm"
            >
              🌬️ Nouvel exercice <span>→</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* ── Chargement ── */}
        {chargement && (
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100">
                  <div className="skeleton h-8 w-12 mb-2" />
                  <div className="skeleton h-4 w-3/4" />
                </div>
              ))}
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100">
                  <div className="skeleton h-5 w-2/5 mb-2" />
                  <div className="skeleton h-4 w-1/3" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Erreur ── */}
        {!chargement && erreur && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-4 flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <p className="text-sm">{erreur}</p>
          </div>
        )}

        {/* ── État vide ── */}
        {!chargement && !erreur && sessions.length === 0 && (
          <div className="text-center py-24 text-slate-400">
            <p className="text-6xl mb-5">🌬️</p>
            <p className="text-xl font-semibold text-slate-600">Aucune session pour le moment</p>
            <p className="text-sm mt-2 mb-8">Lance ton premier exercice de respiration et il apparaîtra ici.</p>
            <Link
              to="/exercises"
              className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-bold px-6 py-3 rounded-xl transition-colors"
            >
              🌬️ Voir les exercices <span>→</span>
            </Link>
          </div>
        )}

        {/* ── Statistiques ── */}
        {!chargement && !erreur && sessions.length > 0 && (
          <>
            {/* Grille de stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 stagger">

              <StatCard
                valeur={total}
                label="Sessions totales"
                emoji="📋"
                classes="bg-white border-slate-100"
                valeurClasses="text-slate-700"
              />

              <StatCard
                valeur={completees}
                label="Complétées"
                emoji="✅"
                classes="bg-emerald-50 border-emerald-100"
                valeurClasses="text-emerald-600"
              />

              <StatCard
                valeur={`${tauxReussite}%`}
                label="Taux de réussite"
                emoji="🎯"
                classes="bg-violet-50 border-violet-100"
                valeurClasses="text-violet-600"
                extra={
                  <div className="mt-2 h-1.5 w-full bg-violet-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-violet-500 rounded-full transition-all duration-700"
                      style={{ width: `${tauxReussite}%` }}
                    />
                  </div>
                }
              />

              <StatCard
                valeur={`${minutesTotales} min`}
                label="Temps total pratiqué"
                emoji="⏱️"
                classes="bg-amber-50 border-amber-100"
                valeurClasses="text-amber-600"
              />

            </div>

            {/* ── Timeline des sessions ── */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800">
                Historique détaillé
                <span className="ml-2 text-sm font-normal text-slate-400">({total} session{total > 1 ? 's' : ''})</span>
              </h2>
              {abandonnees > 0 && (
                <span className="text-xs text-slate-400">
                  {abandonnees} abandonnée{abandonnees > 1 ? 's' : ''}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-3 stagger">
              {sessions.map((session, index) => (
                <SessionCard key={session.id} session={session} index={index} />
              ))}
            </div>
          </>
        )}

      </div>
    </div>
  );
};

// ── Carte statistique ─────────────────────────────────────────────────────────
interface StatCardProps {
  valeur: string | number;
  label: string;
  emoji: string;
  classes: string;
  valeurClasses: string;
  extra?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ valeur, label, emoji, classes, valeurClasses, extra }) => (
  <div className={`rounded-2xl border p-5 shadow-sm animate-fade-in-up ${classes}`}>
    <p className="text-xl mb-1">{emoji}</p>
    <p className={`text-2xl font-bold ${valeurClasses}`}>{valeur}</p>
    <p className="text-slate-500 text-xs mt-0.5">{label}</p>
    {extra}
  </div>
);

// ── Carte d'une session ───────────────────────────────────────────────────────
const SessionCard: React.FC<{ session: UserSession; index: number }> = ({ session, index }) => {
  const statut = STATUTS[session.status] ?? STATUTS.started;

  const date = new Date(session.startedAt).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  const heure = new Date(session.startedAt).toLocaleTimeString('fr-FR', {
    hour: '2-digit', minute: '2-digit',
  });

  // Durée de la session
  let dureeLabel = '';
  if (session.endedAt) {
    const dureeSecondes = Math.round(
      (new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime()) / 1000
    );
    const min = Math.floor(dureeSecondes / 60);
    const sec = dureeSecondes % 60;
    dureeLabel = min > 0 ? `${min} min ${sec > 0 ? sec + 's' : ''}` : `${sec}s`;
  }

  return (
    <div
      className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4 flex items-center gap-4 hover:shadow-md transition-all duration-200 animate-fade-in-up"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Point de couleur (indicateur statut) */}
      <div className={`w-3 h-3 rounded-full shrink-0 ${statut.dot}`} />

      {/* Infos principales */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-800 truncate">{session.breathingExercise.nom}</p>
        <p className="text-sm text-slate-400 mt-0.5">
          {date} à {heure}
          {dureeLabel && <span className="text-slate-300 mx-1.5">·</span>}
          {dureeLabel && <span className="text-slate-500">{dureeLabel}</span>}
        </p>
      </div>

      {/* Badge statut */}
      <span className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full ${statut.classes}`}>
        {statut.emoji} {statut.label}
      </span>
    </div>
  );
};

export default SessionHistoryPage;
