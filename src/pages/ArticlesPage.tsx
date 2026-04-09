// src/pages/ArticlesPage.tsx
// Page listant tous les articles de bien-être.
// Les utilisateurs ROLE_REDACTEUR et ROLE_ADMIN peuvent créer des articles
// via un bouton "+ Nouvel article" qui ouvre un formulaire modal.

import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getArticles, getCategories, creerArticle, modifierArticle } from '../services/articleService';
import type { Article, Categorie, DonneesArticle } from '../services/articleService';

// ── Couleurs par catégorie ────────────────────────────────────────────────────
const COULEURS_CATEGORIE: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  default:    { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',   dot: 'bg-blue-400' },
  stress:     { bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200',    dot: 'bg-red-400' },
  sommeil:    { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', dot: 'bg-indigo-400' },
  respiration:{ bg: 'bg-teal-50',   text: 'text-teal-700',   border: 'border-teal-200',   dot: 'bg-teal-400' },
  nutrition:  { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-400' },
  sport:      { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200',  dot: 'bg-green-400' },
};

const getCouleurCategorie = (nom: string) => {
  const cle = nom.toLowerCase().split(/[\s-]/)[0];
  return COULEURS_CATEGORIE[cle] ?? COULEURS_CATEGORIE.default;
};

const FORM_VIDE: DonneesArticle = { titre: '', contenu: '', categorie: '', isPublie: false };

// ── Composant principal ───────────────────────────────────────────────────────
const ArticlesPage: React.FC = () => {
  const { utilisateur }  = useAuth();
  const [articles, setArticles]     = useState<Article[]>([]);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [chargement, setChargement] = useState<boolean>(true);
  const [erreur, setErreur]         = useState<string>('');

  // Formulaire modal (null = fermé, 'create' = création, number = id édition)
  const [modeForm, setModeForm]           = useState<null | 'create' | number>(null);
  const [form, setForm]                   = useState<DonneesArticle>(FORM_VIDE);
  const [enregistrement, setEnregistrement] = useState(false);
  const [erreurForm, setErreurForm]       = useState('');
  const [succes, setSucces]               = useState('');

  // L'utilisateur peut créer des articles s'il est admin ou rédacteur
  const peutCreer = utilisateur?.roles.includes('ROLE_ADMIN')
                 || utilisateur?.roles.includes('ROLE_REDACTEUR');

  const charger = useCallback(async () => {
    try {
      const [articlesData, categoriesData] = await Promise.all([
        getArticles(),
        peutCreer ? getCategories() : Promise.resolve([]),
      ]);
      setArticles(articlesData);
      setCategories(categoriesData);
    } catch (err) {
      setErreur('Impossible de charger les articles. Réessaie plus tard.');
      console.error('Erreur chargement articles :', err);
    } finally {
      setChargement(false);
    }
  // peutCreer détermine si on appelle getCategories, donc c'est une dépendance
  }, [peutCreer]);

  useEffect(() => { charger(); }, [charger]);

  // Ouvre le modal en mode création
  const ouvrirCreation = () => {
    setForm(FORM_VIDE);
    setErreurForm('');
    setSucces('');
    setModeForm('create');
  };

  // Ouvre le modal en mode édition (pré-rempli)
  const ouvrirEdition = (article: Article) => {
    setForm({
      titre:     article.titre,
      contenu:   article.contenu,
      categorie: `/api/categories/${article.categorie.id}`,
      isPublie:  article.isPublie,
    });
    setErreurForm('');
    setSucces('');
    setModeForm(article.id);
  };

  const fermerModal = () => { setModeForm(null); setErreurForm(''); };

  // Validation du formulaire
  const validerForm = (): boolean => {
    if (!form.titre.trim())    { setErreurForm('Le titre est obligatoire.');     return false; }
    if (!form.contenu.trim())  { setErreurForm('Le contenu est obligatoire.');   return false; }
    if (!form.categorie)       { setErreurForm('Sélectionne une catégorie.');    return false; }
    return true;
  };

  // Soumission du formulaire
  const handleSoumettre = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validerForm()) return;
    setEnregistrement(true);
    setErreurForm('');
    try {
      if (modeForm === 'create') {
        const nouvelArticle = await creerArticle(form);
        setArticles((prev) => [nouvelArticle, ...prev]);
        setSucces('Article créé avec succès !');
      } else if (typeof modeForm === 'number') {
        const articleModifie = await modifierArticle(modeForm, form);
        setArticles((prev) => prev.map((a) => a.id === modeForm ? articleModifie : a));
        setSucces('Article modifié avec succès !');
      }
      setTimeout(fermerModal, 800);
    } catch {
      setErreurForm('Une erreur est survenue. Réessaie.');
    } finally {
      setEnregistrement(false);
    }
  };

  const articlesPublies = articles.filter((a) => a.isPublie || peutCreer);

  return (
    <div className="flex-1 bg-slate-50">

      {/* ── Bannière hero ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-600">
        <div className="absolute -top-12 -right-12 w-60 h-60 bg-white/5 rounded-full animate-breathe" />
        <div className="absolute bottom-0 right-1/3 w-28 h-28 bg-white/5 rounded-full" />

        <div className="relative max-w-6xl mx-auto px-6 py-12 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-2">
                Bien-être · Lecture
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">Articles bien-être 📰</h1>
              <p className="text-blue-100 text-base mt-2 max-w-lg">
                Conseils d'experts, guides pratiques et décryptages pour prendre soin de toi au quotidien.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Compteur */}
              {!chargement && articlesPublies.length > 0 && (
                <div className="bg-white/15 border border-white/20 rounded-2xl p-4 text-center shrink-0">
                  <p className="text-3xl font-bold text-white">{articlesPublies.length}</p>
                  <p className="text-blue-200 text-sm">article{articlesPublies.length > 1 ? 's' : ''}</p>
                </div>
              )}

              {/* Bouton créer (rédacteur / admin) */}
              {peutCreer && (
                <button
                  onClick={ouvrirCreation}
                  className="shrink-0 inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-5 py-3 rounded-xl hover:bg-blue-50 transition-all duration-200 shadow-lg hover:-translate-y-0.5 text-sm"
                >
                  ✏️ Nouvel article
                </button>
              )}
            </div>
          </div>

          {/* Badge rôle rédacteur */}
          {utilisateur?.roles.includes('ROLE_REDACTEUR') && !utilisateur.roles.includes('ROLE_ADMIN') && (
            <div className="mt-4 inline-flex items-center gap-2 bg-white/15 border border-white/20 text-white text-xs font-medium px-3 py-1.5 rounded-full">
              ✍️ Mode rédacteur · Vous pouvez créer et modifier vos articles
            </div>
          )}
        </div>
      </div>

      {/* ── Contenu ── */}
      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Chargement */}
        {chargement && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex gap-2 mb-4"><div className="skeleton h-6 w-20 rounded-full" /><div className="skeleton h-6 w-24" /></div>
                <div className="skeleton h-7 w-4/5 mb-2" />
                <div className="skeleton h-4 w-full mb-1" /><div className="skeleton h-4 w-3/4 mb-6" />
                <div className="skeleton h-10 w-full rounded-xl" />
              </div>
            ))}
          </div>
        )}

        {/* Erreur */}
        {!chargement && erreur && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-4 flex items-center gap-3">
            <span className="text-2xl">⚠️</span><p className="text-sm">{erreur}</p>
          </div>
        )}

        {/* Aucun article */}
        {!chargement && !erreur && articlesPublies.length === 0 && (
          <div className="text-center py-24 text-slate-400">
            <p className="text-6xl mb-5">🗒️</p>
            <p className="text-xl font-semibold text-slate-600">Aucun article publié</p>
            <p className="text-sm mt-2 mb-6">De nouveaux articles seront publiés prochainement.</p>
            {peutCreer && (
              <button onClick={ouvrirCreation} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition-colors">
                ✏️ Créer le premier article
              </button>
            )}
          </div>
        )}

        {/* Grille des articles */}
        {!chargement && !erreur && articlesPublies.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 stagger">
            {articlesPublies.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                peutEditer={!!(peutCreer && (
                  utilisateur?.roles.includes('ROLE_ADMIN') ||
                  article.auteur.id === utilisateur?.id
                ))}
                onEditer={() => ouvrirEdition(article)}
              />
            ))}
          </div>
        )}

      </div>

      {/* ══════════════════════════════════════════════════════════
          MODAL — Création / Édition d'article
          ══════════════════════════════════════════════════════════ */}
      {modeForm !== null && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-50 px-4 py-8 overflow-y-auto animate-fade-in"
          onClick={(e) => { if (e.target === e.currentTarget) fermerModal(); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-auto animate-fade-in-up">

            {/* En-tête modal */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  {modeForm === 'create' ? '✏️ Nouvel article' : '✏️ Modifier l\'article'}
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  {modeForm === 'create'
                    ? 'L\'article sera enregistré comme brouillon par défaut.'
                    : 'Modifie les champs puis enregistre.'}
                </p>
              </div>
              <button onClick={fermerModal} className="text-slate-400 hover:text-slate-600 text-2xl font-bold leading-none">×</button>
            </div>

            {/* Formulaire */}
            <form onSubmit={handleSoumettre} className="px-6 py-5 space-y-5">

              {/* Titre */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Titre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.titre}
                  onChange={(e) => setForm({ ...form, titre: e.target.value })}
                  placeholder="Titre de l'article…"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                />
              </div>

              {/* Catégorie */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Catégorie <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.categorie}
                  onChange={(e) => setForm({ ...form, categorie: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white transition"
                >
                  <option value="">— Sélectionner une catégorie —</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={`/api/categories/${cat.id}`}>{cat.nom}</option>
                  ))}
                </select>
              </div>

              {/* Contenu */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Contenu <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={form.contenu}
                  onChange={(e) => setForm({ ...form, contenu: e.target.value })}
                  placeholder="Contenu de l'article…"
                  rows={10}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-y transition"
                />
                <p className="text-xs text-slate-400 mt-1">
                  {form.contenu.length} caractères · ~{Math.max(1, Math.round(form.contenu.split(/\s+/).filter(Boolean).length / 200))} min de lecture
                </p>
              </div>

              {/* Publier immédiatement */}
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={form.isPublie}
                    onChange={(e) => setForm({ ...form, isPublie: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-checked:bg-blue-600 rounded-full transition-colors peer-focus:ring-2 peer-focus:ring-blue-400" />
                  <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">Publier immédiatement</p>
                  <p className="text-xs text-slate-400">{form.isPublie ? 'Visible par tous les utilisateurs' : 'Enregistré comme brouillon'}</p>
                </div>
              </label>

              {/* Erreur */}
              {erreurForm && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
                  ⚠️ {erreurForm}
                </div>
              )}

              {/* Succès */}
              {succes && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
                  ✅ {succes}
                </div>
              )}

              {/* Boutons */}
              <div className="flex gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={fermerModal}
                  className="flex-1 border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold py-2.5 rounded-xl transition-colors text-sm"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={enregistrement}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-2.5 rounded-xl transition-colors text-sm"
                >
                  {enregistrement
                    ? 'Enregistrement…'
                    : modeForm === 'create' ? '✏️ Créer l\'article' : '💾 Enregistrer'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

// ── Carte d'un article ────────────────────────────────────────────────────────
interface ArticleCardProps {
  article: Article;
  peutEditer: boolean;
  onEditer: () => void;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, peutEditer, onEditer }) => {
  const navigate = useNavigate();

  const dateFormatee = new Date(article.createdAt).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  const mots = article.contenu.split(/\s+/).length;
  const tempsLecture = Math.max(1, Math.round(mots / 200));
  const apercu = article.contenu.length > 180 ? article.contenu.substring(0, 180) + '…' : article.contenu;
  const couleurs = getCouleurCategorie(article.categorie.nom);
  const auteurNom = typeof article.auteur === 'object'
    ? `${article.auteur.prenom} ${article.auteur.nom}` : 'Auteur inconnu';

  return (
    <div className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden flex flex-col animate-fade-in-up">
      <div className={`h-1.5 w-full ${couleurs.dot}`} />

      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-3">
          <span className={`inline-flex items-center gap-1.5 ${couleurs.bg} ${couleurs.text} ${couleurs.border} border text-xs font-semibold px-3 py-1 rounded-full`}>
            <span className={`w-1.5 h-1.5 rounded-full ${couleurs.dot}`} />{article.categorie.nom}
          </span>
          <div className="flex items-center gap-2">
            {!article.isPublie && (
              <span className="text-xs bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
                Brouillon
              </span>
            )}
            <span className="text-slate-400 text-xs">📖 {tempsLecture} min</span>
          </div>
        </div>

        <h2 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-blue-700 transition-colors leading-snug">
          {article.titre}
        </h2>
        <p className="text-slate-500 text-sm leading-relaxed flex-1 mb-4">{apercu}</p>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
              {auteurNom.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-700 truncate">{auteurNom}</p>
              <p className="text-xs text-slate-400">{dateFormatee}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Bouton modifier (rédacteur / admin sur son propre article) */}
            {peutEditer && (
              <button
                onClick={onEditer}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium px-3 py-1.5 rounded-lg transition-colors"
              >
                ✏️ Éditer
              </button>
            )}
            <button
              onClick={() => navigate(`/articles/${article.id}`)}
              className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5"
            >
              Lire <span className="group-hover:translate-x-0.5 transition-transform inline-block">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticlesPage;
