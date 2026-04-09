# CESIZen — Application Web

Interface web de l'application de bien-être mental **CESIZen**, construite avec **React 19**, **Vite** et **Tailwind CSS 4**.

## Stack technique

| Composant | Version |
|---|---|
| React | 19.x |
| TypeScript | 5.9 |
| Vite | 8.x |
| Tailwind CSS | 4.x |
| React Router | 7.x |
| Axios | 1.x |
| Vitest | 3.x |

---

## Démarrage rapide

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer l'URL de l'API (créer un fichier .env.local)
echo "VITE_API_URL=http://localhost:8080/api" > .env.local

# 3. Lancer le serveur de développement
npm run dev
```

L'application est accessible sur `http://localhost:5173`

---

## Scripts disponibles

| Commande | Description |
|---|---|
| `npm run dev` | Serveur de développement avec hot-reload |
| `npm run build` | Build de production (sortie dans `dist/`) |
| `npm run lint` | Vérification ESLint |
| `npm test` | Lancer les tests unitaires (Vitest) |
| `npm run test:watch` | Tests en mode watch |

---

## Pages et routes

| Route | Page | Auth requise |
|---|---|---|
| `/` | Dashboard | Oui |
| `/login` | Connexion | Non |
| `/register` | Inscription | Non |
| `/articles` | Liste des articles | Oui |
| `/articles/:id` | Détail d'un article | Oui |
| `/exercises` | Liste des exercices | Oui |
| `/exercises/:id` | Détail d'un exercice | Oui |
| `/profil` | Mon profil | Oui |
| `/admin` | Dashboard admin | Admin |
| `/admin/users` | Gestion utilisateurs | Admin |
| `/admin/articles` | Gestion articles | Admin |
| `/admin/exercises` | Gestion exercices | Admin |

---

## Architecture `src/`

```
src/
├── components/        # Composants réutilisables (Navbar, PrivateRoute, AdminRoute)
├── context/           # Contexte global (AuthContext — état d'authentification)
├── pages/             # Pages de l'application (une par route)
│   └── admin/         # Pages réservées aux administrateurs
├── services/          # Appels API (authService, articleService, exerciseService…)
│   └── api.ts         # Instance Axios centralisée (intercepteur JWT)
├── test/              # Tests unitaires Vitest
└── main.tsx           # Point d'entrée
```

---

## Tests unitaires

```bash
npm test
# 18 tests dans 3 fichiers — tous verts ✅
```

| Fichier | Ce qui est testé |
|---|---|
| `authService.test.ts` | login(), register() — appels API et gestion d'erreurs |
| `AuthContext.test.tsx` | estConnecte, connecter(), deconnecter(), mettreAJourUtilisateur() |
| `LoginPage.test.tsx` | Rendu du formulaire, message d'erreur 401, état de chargement |

---

## Variables d'environnement

| Variable | Description | Exemple |
|---|---|---|
| `VITE_API_URL` | URL de base de l'API Symfony | `http://localhost:8080/api` |
