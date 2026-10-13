# --- Étape 1 : compilation TypeScript ---
FROM node:22-alpine AS build
RUN apk add --no-cache openssl
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY prisma ./prisma
RUN npx prisma generate
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# --- Étape 2 : image d'exécution ---
FROM node:22-alpine
RUN apk add --no-cache openssl
WORKDIR /app
ENV NODE_ENV=production
# Les dépendances de dev sont conservées : la CLI Prisma (migrations) et tsx (seed) en ont besoin.
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package*.json ./
COPY prisma ./prisma
# L'application ne tourne pas en root.
USER node
EXPOSE 3000
# Applique les migrations en attente puis démarre l'API.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
