# Maison Lune : boutique de mode en ligne

Application e-commerce full-stack réalisée pour le titre professionnel **Concepteur Développeur d'Applications (CDA)**.
Boutique de vêtements avec déclinaisons taille / couleur et stock, panier, commande, espace client RGPD et back-office.

| | |
|---|---|
| Front-end | React 19 · TypeScript · Vite · React Router |
| Back-end | Node.js · Express 5 · TypeScript · Zod |
| Données | PostgreSQL 17 · Prisma ORM (migrations versionnées) |
| Sécurité | JWT en cookie httpOnly · bcrypt · Helmet · rate limiting |
| Qualité | Vitest · Supertest · Testing Library · GitHub Actions |
| Déploiement | Docker Compose · Nginx · Railway (API + PostgreSQL) · Vercel (front) |

## Fonctionnalités

- **Boutique** : catalogue paginé, filtres (collection, catégorie, taille disponible, couleur, prix), recherche, tri,
  fiche produit avec choix couleur / taille, photo propre à chaque coloris et stock en temps réel. 27 articles en 8 catégories illustrées.
- **Client** : inscription / connexion, panier serveur, commande avec adresse de livraison et paiement par carte
  (passerelle simulée, cartes de test),
  historique et suivi des commandes, modification du profil, export et suppression des données (RGPD).
- **Administration** : tableau de bord (CA, commandes, stocks faibles), gestion des produits et de leurs déclinaisons,
  catégories, traitement des commandes (expédition, livraison, annulation avec remise en stock).

## Démarrage rapide (développement)

Prérequis : Node.js ≥ 20, Docker.

```bash
# 1. Base de données PostgreSQL (port 55432)
cp .env.example .env            # puis renseigner JWT_SECRET
docker compose up -d db

# 2. API (http://localhost:3000)
cd backend
cp .env.example .env            # puis renseigner JWT_SECRET
npm install
npx prisma migrate dev          # crée les tables
npm run db:seed                 # données de démonstration
npm run dev

# 3. Front (http://localhost:5180) : dans un autre terminal
cd frontend
npm install
npm run dev
```

Cartes de test (paiement simulé, aucun débit) : `4242 4242 4242 4242` acceptée · `4000 0000 0000 0002` refusée ·
`4000 0000 0000 9995` fonds insuffisants (date future et CVC quelconques).

Comptes de démonstration (créés par le seed) :

| Rôle | Email | Mot de passe |
|---|---|---|
| Administrateur | admin@maisonlune.fr | Admin12345! |
| Client | client@maisonlune.fr | Client12345! |

### Tout en Docker (production simulée)

```bash
cp .env.example .env   # définir JWT_SECRET
docker compose up -d --build
docker compose exec api npx prisma db seed
# → http://localhost:8080
```

## Tests

```bash
cd backend && npm test    # 59 tests unitaires + intégration (base boutique_test)
cd frontend && npm test   # 11 tests (composants, saisie de la carte)
```

## Structure du projet

```
├── backend/
│   ├── prisma/              schéma, migrations SQL, seed
│   ├── src/
│   │   ├── config/          variables d'environnement
│   │   ├── lib/             Prisma, JWT, erreurs HTTP
│   │   ├── middlewares/     authentification, rôles, gestion d'erreurs
│   │   └── modules/         auth · categories · products · cart · orders · admin
│   │                        (routes = contrôleur, schemas = validation, service = métier)
│   └── tests/               unitaires et intégration API
├── frontend/
│   └── src/
│       ├── api/             client HTTP typé
│       ├── context/         session et panier
│       ├── components/      composants réutilisables
│       └── pages/           boutique, compte, admin
├── docs/                    dossier de conception
├── docker-compose.yml
└── .github/workflows/ci.yml
```

## Documentation

1. [Cahier des charges](docs/01-cahier-des-charges.md) : contexte, acteurs, user stories, règles de gestion
2. [Conception](docs/02-conception.md) : cas d'utilisation, MCD, MLD, architecture, séquence, états
3. [Sécurité et RGPD](docs/03-securite.md) : OWASP Top 10, session, droits des personnes
4. [Plan de tests](docs/04-tests.md) : stratégie, couverture, cahier de recette
5. [Déploiement](docs/05-deploiement.md) : Docker, CI/CD, hébergement Railway + Vercel
6. [Référence API](docs/06-api.md)

## Couverture du référentiel CDA

| Activité type | Compétence | Éléments du projet |
|---|---|---|
| **1. Développer une application sécurisée** | Installer et configurer son environnement de travail | Docker Compose, variables d'environnement, TypeScript strict, Git |
| | Développer des interfaces utilisateur | SPA React accessible et responsive (`frontend/src/pages`) |
| | Développer des composants métier | Services : panier, commande transactionnelle, stocks, statuts (`backend/src/modules`) |
| | Contribuer à la gestion d'un projet informatique | User stories priorisées, planning, Kanban, Git ([cahier des charges](docs/01-cahier-des-charges.md)) |
| **2. Concevoir et développer une application sécurisée organisée en couches** | Analyser les besoins et maquetter une application | Cahier des charges, cas d'utilisation, maquettes |
| | Définir l'architecture logicielle d'une application | Architecture en couches, SPA + API REST ([conception](docs/02-conception.md)) |
| | Concevoir et mettre en place une base de données relationnelle | MCD / MLD, contraintes, migrations Prisma |
| | Développer des composants d'accès aux données SQL et NoSQL | Prisma ORM, transactions, requêtes filtrées et paginées |
| **3. Préparer le déploiement d'une application sécurisée** | Préparer et exécuter les plans de tests | Tests unitaires, intégration, composants, recette ([tests](docs/04-tests.md)) |
| | Préparer et documenter le déploiement | Dockerfiles, Nginx, procédure ([déploiement](docs/05-deploiement.md)) |
| | Contribuer à la mise en production dans une démarche DevOps | Pipeline GitHub Actions (tests, audit, build des images) |

> Projet pédagogique : aucune vente réelle, paiement simulé. Photos produits : [Unsplash](https://unsplash.com) (licence Unsplash).
