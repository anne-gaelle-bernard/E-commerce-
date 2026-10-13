# 6. Référence de l'API REST

Base : `/api`. Format JSON. Authentification par cookie `token` (httpOnly) posé à la connexion.

Accès : Public, Client (connecté) ou Admin.

## Authentification et compte `/api/auth`

| Méthode | Route | Accès | Corps | Réponse |
|---|---|---|---|---|
| POST | `/register` | Public | `{ email, password, firstName, lastName }` | 201 utilisateur + cookie |
| POST | `/login` | Public | `{ email, password }` | 200 utilisateur + cookie |
| POST | `/logout` | Public | : | 204, cookie supprimé |
| GET | `/me` | Client | : | utilisateur courant |
| PATCH | `/me` | Client | `{ firstName, lastName }` | utilisateur mis à jour |
| GET | `/me/export` | Client | : | fichier JSON des données personnelles |
| DELETE | `/me` | Client | `{ password }` | 204 |

## Catalogue

| Méthode | Route | Accès | Détail |
|---|---|---|---|
| GET | `/categories` | Public | Liste avec nombre de produits |
| POST | `/categories` | Admin | `{ name }` |
| PUT | `/categories/:id` | Admin | `{ name }` |
| DELETE | `/categories/:id` | Admin | 409 si des produits y sont rattachés |
| GET | `/products` | Public | Paramètres : `search`, `category` (slug), `gender`, `size`, `color`, `minPrice`, `maxPrice` (centimes), `sort` (`newest`, `price_asc`, `price_desc`, `name`), `page`, `limit` (≤ 50), `includeInactive` (admin) → `{ items, total, page, pages }` |
| GET | `/products/filters` | Public | `{ sizes, colors }` disponibles |
| GET | `/products/:slug` | Public | Produit + catégorie + déclinaisons |
| GET | `/products/id/:id` | Admin | Produit (même archivé) |
| POST | `/products` | Admin | `{ name, description, priceCents, imageUrl, gender, categoryId, isActive, variants: [{ size, color, stock }] }` |
| PUT | `/products/:id` | Admin | Même corps ; synchronise les déclinaisons |
| DELETE | `/products/:id` | Admin | Archivage (`isActive = false`) |

## Panier `/api/cart` (Client)

| Méthode | Route | Corps | Détail |
|---|---|---|---|
| GET | `/` | : | `{ items, totalCents, count }` |
| POST | `/items` | `{ variantId, quantity }` | Ajoute (cumule si déjà présent) ; 409 si stock insuffisant |
| PATCH | `/items/:variantId` | `{ quantity }` | Modifie la quantité |
| DELETE | `/items/:variantId` | : | Retire l'article |
| DELETE | `/` | : | Vide le panier |

## Commandes `/api/orders` (Client)

| Méthode | Route | Corps | Détail |
|---|---|---|---|
| POST | `/` | `{ shipping: { fullName, street, postalCode, city, country }, card: { holder, number, expMonth, expYear, cvc } }` | Transforme le panier en commande et débite la carte (passerelle simulée), le tout dans une transaction ; 400 panier vide ou carte invalide, 402 paiement refusé, 409 stock insuffisant. Limité à 10 tentatives / 15 min |
| GET | `/` | : | Commandes du client |
| GET | `/:id` | : | Détail (404 si la commande appartient à un autre client) |

## Administration `/api/admin` (Admin)

| Méthode | Route | Détail |
|---|---|---|
| GET | `/stats` | CA, commandes par statut, nombre de clients, stocks faibles (≤ 3) |
| GET | `/orders?status=` | Toutes les commandes avec le client |
| PATCH | `/orders/:id/status` | `{ status }` ; transitions contrôlées, annulation = remise en stock |

## Codes d'erreur

| Code | Signification | Corps |
|---|---|---|
| 400 | Données invalides | `{ error, details: [{ field, message }] }` |
| 401 | Non authentifié | `{ error }` |
| 402 | Paiement refusé | `{ error }` |
| 403 | Rôle insuffisant | `{ error }` |
| 404 | Ressource introuvable | `{ error }` |
| 409 | Conflit (doublon, stock, ressource utilisée) | `{ error }` |
| 429 | Trop de tentatives | `{ error }` |
| 500 | Erreur interne (détail uniquement dans les logs serveur) | `{ error }` |
