# cesizen-app/Dockerfile
# Build multi-stage pour le frontend React en production.
#
# ┌─ Stage 1 "builder" ────────────────────────────────────────────────────────┐
# │  Node 22 Alpine → installe les dépendances → compile le projet Vite        │
# │  Résultat : dossier dist/ contenant les fichiers HTML/CSS/JS optimisés     │
# └────────────────────────────────────────────────────────────────────────────┘
# ┌─ Stage 2 "serve" ──────────────────────────────────────────────────────────┐
# │  Nginx Alpine → copie uniquement dist/ → sert les fichiers statiques        │
# │  Image finale très légère (~25 Mo) sans Node.js                            │
# └────────────────────────────────────────────────────────────────────────────┘
#
# Utilisation :
#   docker build --build-arg VITE_API_URL=https://api.mondomaine.fr -t cesizen-app .
#   docker run -p 3000:80 cesizen-app

# ── Stage 1 : Build ──────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Copie les fichiers de dépendances en premier pour profiter du cache Docker :
# Si package.json n'a pas changé, npm ci ne sera pas relancé
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# Variable injectée depuis docker-compose.prod.yml (ou la ligne de commande)
# Vite l'utilise pendant le build pour remplacer import.meta.env.VITE_API_URL
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

# Copie le reste du code source et compile
COPY . .
RUN npm run build

# ── Stage 2 : Serve ───────────────────────────────────────────────────────────
FROM nginx:alpine AS serve

# Copie uniquement les fichiers compilés depuis le stage builder
# (Node.js et node_modules NE sont PAS inclus → image finale légère)
COPY --from=builder /app/dist /usr/share/nginx/html

# Copie la configuration Nginx (SPA fallback, cache assets)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
