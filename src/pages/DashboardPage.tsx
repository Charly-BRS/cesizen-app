// src/pages/DashboardPage.tsx
// Page d'accueil principale — tableau de bord de l'utilisateur connecté.
// Design moderne : bannière hero pleine largeur, cartes animées, infos utiles.

import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Clé de la fonctionnalité qui nécessite une connexion
const ROUTE_HISTORIQUE = '/sessions';

// ── Définition des cartes fonctionnalités ─────────────────────────────────────
const FONCTIONNALITES = [
  {
    vers: '/articles',
    emoji: '📰',
    titre: 'Articles bien-être',
    description: 'Découvre des conseils d\'experts pour mieux gérer ton stress, ton sommeil et ton énergie au quotidien.',
    gradient: 'from-blue-500 to-indigo-500',
    gradientLight: 'from-blue-50 to-indigo-50',
    bordure: 'border-blue-200',
    tag: 'Lecture · Conseils',
    tagClasses: 'bg-blue-100 text-blue-700',
    btnClasses: 'bg-blue-600 hover:bg-blue-700',
    stat: '📚 Nouveaux articles chaque semaine',
  },
  {
    vers: '/exercises',
    emoji: '🌬️',
    titre: 'Exercices de respiration',
    description: 'Cohérence cardiaque, respiration 4-7-8, box breathing… Exercices guidés avec animation et suivi de cycles.',
    gradient: 'from-emerald-500 to-teal-500',
    gradientLight: 'from-emerald-50 to-teal-50',
    bordure: 'border-emerald-200',
    tag: 'Pratique · Guidé',
    tagClasses: 'bg-emerald-100 text-emerald-700',
    btnClasses: 'bg-emerald-600 hover:bg-emerald-700',
    stat: '⏱️ 5 minutes suffisent pour se détendre',
  },
  {
    vers: '/sessions',
    emoji: '📈',
    titre: 'Mon historique',
    description: 'Consulte toutes tes sessions passées, suis ta progression et visualise le temps consacré à ton bien-être.',
    gradient: 'from-violet-500 to-purple-500',
    gradientLight: 'from-violet-50 to-purple-50',
    bordure: 'border-violet-200',
    tag: 'Suivi · Progression',
    tagClasses: 'bg-violet-100 text-violet-700',
    btnClasses: 'bg-violet-600 hover:bg-violet-700',
    stat: '🎯 Chaque session compte pour ton équilibre',
  },
];

// ── Conseil du jour (liste tournante selon le jour de la semaine) ─────────────
const CONSEILS_DU_JOUR = [
  { icone: '💧', titre: 'Hydratation', texte: 'Boire 1,5 à 2 litres d\'eau par jour aide à réduire la fatigue mentale de 20%.' },
  { icone: '🚶', titre: 'Marche active', texte: '10 minutes de marche après un repas stabilise la glycémie et améliore la concentration.' },
  { icone: '🌅', titre: 'Lumière naturelle', texte: 'S\'exposer à la lumière du matin pendant 10 minutes régule l\'horloge biologique.' },
  { icone: '🧘', titre: 'Cohérence cardiaque', texte: 'Pratiquer 3 fois par jour pendant 5 minutes réduit le cortisol (hormone du stress).' },
  { icone: '📵', titre: 'Déconnexion digitale', texte: 'Éteindre les écrans 30 minutes avant de dormir améliore la qualité du sommeil.' },
  { icone: '🌿', titre: 'Pleine conscience', texte: 'Prendre 3 grandes respirations avant une situation stressante active le système parasympathique.' },
  { icone: '😴', titre: 'Sommeil réparateur', texte: 'Maintenir des horaires de coucher réguliers améliore la mémoire et la gestion émotionnelle.' },
];

const DashboardPage: React.FC = () => {
  const { utilisateur, estConnecte } = useAuth();

  // Salutation selon l'heure
  const heure = new Date().getHours();
  const salutation = heure < 5 ? 'Bonne nuit' : heure < 12 ? 'Bonjour' : heure < 18 ? 'Bon après-midi' : 'Bonsoir';

  // Conseil du jour basé sur le jour de la semaine (0–6)
  const conseil = CONSEILS_DU_JOUR[new Date().getDay()];

  return (
    <div className="flex-1 bg-slate-50">

      {/* ══════════════════════════════════════════════════════════
          HERO — Bannière pleine largeur avec décoration
          ══════════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600">

        {/* Cercles décoratifs en arrière-plan */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/5 rounded-full animate-breathe" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-white/5 rounded-full animate-breathe" style={{ animationDelay: '2s' }} />
        <div className="absolute top-8 right-1/3 w-20 h-20 bg-white/5 rounded-full" />

        <div className="relative max-w-6xl mx-auto px-6 py-14 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">

            {/* Message de bienvenue */}
            <div>
              <p className="text-emerald-200 text-sm font-semibold uppercase tracking-widest mb-2">
                🌿 Espace bien-être CESIZen
              </p>
              <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
                {estConnecte ? `${salutation}, ${utilisateur?.prenom} 👋` : 'Bienvenue sur CESIZen 🌿'}
              </h1>
              <p className="text-emerald-100 text-lg mt-3 max-w-md">
                {estConnecte
                  ? "Comment vas-tu aujourd'hui ? Commence par une respiration pour te recentrer."
                  : 'Explore les exercices de respiration et les ressources bien-être. Connecte-toi pour accéder à tout.'}
              </p>

              {/* CTA principal */}
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/exercises"
                  className="inline-flex items-center gap-2 bg-white text-emerald-700 font-bold px-6 py-3 rounded-xl hover:bg-emerald-50 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  🌬️ Lancer un exercice
                  <span className="text-emerald-400">→</span>
                </Link>
                {!estConnecte && (
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200"
                  >
                    Se connecter
                  </Link>
                )}
              </div>
            </div>

            {/* Conseil du jour — visible sur desktop */}
            <div className="hidden sm:block bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5 min-w-64 max-w-xs">
              <p className="text-emerald-200 text-xs font-semibold uppercase tracking-wider mb-2">
                Conseil du jour
              </p>
              <p className="text-2xl mb-1">{conseil.icone}</p>
              <p className="text-white font-semibold text-sm">{conseil.titre}</p>
              <p className="text-emerald-100 text-xs mt-1 leading-relaxed">{conseil.texte}</p>
            </div>

          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          CONSEIL DU JOUR — mobile uniquement
          ══════════════════════════════════════════════════════════ */}
      <div className="sm:hidden mx-4 -mt-4 relative z-10">
        <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-4 flex gap-3 animate-fade-in-up">
          <span className="text-2xl">{conseil.icone}</span>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Conseil du jour</p>
            <p className="text-sm font-semibold text-slate-700">{conseil.titre}</p>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{conseil.texte}</p>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          FONCTIONNALITÉS — Cartes principales
          ══════════════════════════════════════════════════════════ */}
      <div className="max-w-6xl mx-auto px-6 py-10">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Accès rapide</h2>
            <p className="text-slate-400 text-sm mt-0.5">Tout ce dont tu as besoin, en un clic</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 stagger">
          {FONCTIONNALITES.map((f) => {
            // La carte historique est verrouillée pour les visiteurs non connectés
            const estVerrouille = !estConnecte && f.vers === ROUTE_HISTORIQUE;
            // Les visiteurs sont redirigés vers /login pour les cartes verrouillées
            const destination = estVerrouille ? '/login' : f.vers;

            return (
              <Link
                key={f.vers}
                to={destination}
                className={`group bg-white rounded-2xl border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col animate-fade-in-up ${
                  estVerrouille ? 'border-slate-200 opacity-80' : 'border-slate-100'
                }`}
              >
                {/* Barre de couleur en haut */}
                <div className={`h-1.5 w-full bg-gradient-to-r ${f.gradient}`} />

                <div className="p-6 flex flex-col gap-4 flex-1">

                  {/* En-tête : emoji + tag (ou badge "Connexion requise") */}
                  <div className="flex items-start justify-between">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.gradient} flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform duration-300 ${estVerrouille ? 'grayscale' : ''}`}>
                      {estVerrouille ? '🔒' : f.emoji}
                    </div>
                    {estVerrouille ? (
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-500">
                        Connexion requise
                      </span>
                    ) : (
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${f.tagClasses}`}>
                        {f.tag}
                      </span>
                    )}
                  </div>

                  {/* Texte */}
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-slate-800 mb-2 group-hover:text-slate-900">
                      {f.titre}
                    </h3>
                    <p className="text-slate-500 text-sm leading-relaxed">
                      {estVerrouille
                        ? 'Connecte-toi pour consulter ton historique de sessions et suivre ta progression.'
                        : f.description}
                    </p>
                  </div>

                  {/* Stat + CTA */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-xs text-slate-400">{estVerrouille ? '🔑 Accès réservé aux membres' : f.stat}</p>
                    <span className={`text-xs font-bold text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${estVerrouille ? 'bg-slate-400 hover:bg-slate-500' : f.btnClasses}`}>
                      {estVerrouille ? 'Se connecter' : 'Accéder'}{' '}
                      <span className="group-hover:translate-x-0.5 transition-transform inline-block">→</span>
                    </span>
                  </div>

                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          BIENFAITS — Section informative
          ══════════════════════════════════════════════════════════ */}
      <div className="max-w-6xl mx-auto px-6 pb-12">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 text-white overflow-hidden relative">

          {/* Déco */}
          <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/5 rounded-full" />
          <div className="absolute -bottom-4 left-1/3 w-24 h-24 bg-emerald-500/10 rounded-full" />

          <div className="relative">
            <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-2">
              Pourquoi CESIZen ?
            </p>
            <h2 className="text-2xl font-bold mb-6">La science derrière le bien-être 🧠</h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 stagger">
              {[
                { chiffre: '-32%', label: 'de cortisol', detail: 'après 5 min de cohérence cardiaque', icon: '📉' },
                { chiffre: '3×/jour', label: 'recommandé', detail: 'la pratique idéale pour des résultats durables', icon: '🔄' },
                { chiffre: '8 sem.', label: 'pour des habitudes', detail: 'pour ancrer une routine de respiration dans ta vie', icon: '📅' },
              ].map((stat) => (
                <div key={stat.chiffre} className="bg-white/10 rounded-2xl p-5 animate-fade-in-up">
                  <p className="text-3xl mb-1">{stat.icon}</p>
                  <p className="text-2xl font-bold text-emerald-400">{stat.chiffre}</p>
                  <p className="text-white font-semibold text-sm">{stat.label}</p>
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed">{stat.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default DashboardPage;
