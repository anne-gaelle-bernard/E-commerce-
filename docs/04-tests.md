# 4. Plan de tests

## 4.1 Stratégie

| Niveau | Outil | Cible | Lancement |
|---|---|---|---|
| Tests unitaires back | Vitest | Règles métier pures : transitions de statut, frais de port, validation (mot de passe, produit), slug | `cd backend && npm test` |
| Tests d'intégration API | Vitest + Supertest | Routes HTTP de bout en bout sur une vraie base PostgreSQL de test | `cd backend && npm test` |
| Tests de composants front | Vitest + Testing Library | Rendu et accessibilité des composants | `cd frontend && npm test` |
| Tests manuels / recette | Navigateur | Parcours utilisateur complets (cahier de recette ci-dessous) | : |
| Intégration continue | GitHub Actions | Tous les tests + typage + build + audit à chaque push | automatique |

Les tests d'intégration utilisent une base dédiée (`TEST_DATABASE_URL`) : les migrations y sont appliquées au
lancement, puis chaque test part de tables vides (`TRUNCATE`), ce qui les rend indépendants les uns des autres.

## 4.2 Couverture fonctionnelle des tests automatisés

| Fonctionnalité | Cas testés |
|---|---|
| Inscription | création + cookie de session, mot de passe haché, rôle imposé `CUSTOMER`, email en double (409), mot de passe faible (400) |
| Connexion | succès, message identique email inconnu / mauvais mot de passe, déconnexion, jeton falsifié |
| RGPD | export des données sans hash, suppression avec confirmation du mot de passe, commandes conservées |
| Catalogue | pagination, produits archivés masqués, filtres prix / taille, tri, paramètres invalides (400) |
| Admin produits | 401 visiteur / 403 client, création avec slug unique, synchronisation des déclinaisons, photos par couleur (création, remplacement, couleur inconnue refusée), archivage |
| Panier | ajout cumulatif, total, quantité > stock (409), modification, suppression |
| Commande | création + décrément du stock + panier vidé, panier vide (400), **rollback complet si stock insuffisant**, validation de l'adresse, protection IDOR |
| Paiement | carte acceptée (seuls marque + 4 derniers chiffres stockés), cartes refusées (402, stock et panier intacts), numéro invalide (Luhn), carte expirée, CVC American Express |
| Admin commandes | 403 client, annulation avec remise en stock, transition interdite (400) |

Résultat actuel : **59 tests back-end** et **11 tests front-end**, tous au vert.

## 4.3 Cahier de recette (tests manuels)

| # | Scénario | Étapes | Résultat attendu | OK |
|---|---|---|---|---|
| R01 | Filtrer le catalogue | Catalogue → Collection Femme → Taille M → Prix max 60 € | Seuls les produits femme/unisexe ≤ 60 € avec du M en stock s'affichent ; l'URL reflète les filtres | ☐ |
| R02 | Taille épuisée | Ouvrir une fiche produit avec une taille à 0 | Le bouton de la taille est barré et désactivé | ☐ |
| R03 | Ajout au panier non connecté | Fiche produit → choisir taille → Ajouter | Redirection vers la connexion, puis retour sur la fiche | ☐ |
| R04 | Commande complète | Se connecter → ajouter 2 articles → Panier → Passer commande → Payer | Page de confirmation, panier vide, commande visible dans « Mes commandes » | ☐ |
| R04b | Paiement refusé | Payer avec `4000 0000 0000 0002` | Message « Paiement refusé », panier conservé, aucune commande | ☐ |
| R04c | Saisie de la carte | Taper un numéro erroné ou une date passée | Erreur affichée sous le champ concerné avant l'envoi | ☐ |
| R05 | Livraison offerte | Panier ≥ 80 € | Livraison affichée « Offerte » | ☐ |
| R06 | Stock modifié pendant la commande | Admin passe le stock à 0 pendant que le client est sur la page de paiement | Message « Stock insuffisant », aucune commande créée | ☐ |
| R07 | Accès admin interdit | Client connecté → saisir `/admin` dans l'URL | Redirection vers l'accueil ; l'API renvoie 403 | ☐ |
| R08 | Gestion produit | Admin → Produits → Nouveau → ajouter 2 déclinaisons → Enregistrer | Produit visible dans le catalogue | ☐ |
| R09 | Traitement commande | Admin → Commandes → Marquer expédiée puis livrée | Le statut change côté client | ☐ |
| R10 | Annulation | Admin → Annuler une commande payée | Statut « Annulée », stock restauré | ☐ |
| R11 | Suppression de compte | Mon compte → saisir le mot de passe → Supprimer | Déconnexion ; la commande reste visible côté admin (« Compte supprimé ») | ☐ |
| R12 | Navigation clavier | Parcourir le site avec Tab uniquement | Lien d'évitement, focus visible, tous les éléments atteignables | ☐ |
| R13 | Responsive | Affichage à 375 px de large | Pas de défilement horizontal, menus utilisables | ☐ |
| R14 | Force brute | 11 tentatives de connexion erronées en moins de 15 min | 429 « Trop de tentatives » | ☐ |

## 4.4 Évolutions possibles

- Tests end-to-end navigateur avec **Playwright** (parcours R01 à R11 automatisés).
- Mesure de la couverture de code (`vitest --coverage`).
- Audit d'accessibilité automatisé (axe-core / Lighthouse) et de performance.
