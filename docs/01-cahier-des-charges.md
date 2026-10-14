# 1. Cahier des charges : Maison Lune

## 1.1 Contexte

Maison Lune est une marque fictive de prêt-à-porter durable (femme, homme, unisexe) qui souhaite vendre en ligne
ses vêtements et accessoires. Elle dispose aujourd'hui d'une boutique physique et gère son stock sur tableur.

Le projet consiste à concevoir et développer une application web e-commerce sécurisée comprenant :

- une **boutique** publique (catalogue, fiche produit, panier, commande) ;
- un **espace client** (compte, historique des commandes, données personnelles) ;
- un **back-office** pour l'équipe (produits, déclinaisons et stocks, catégories, suivi des commandes).

## 1.2 Acteurs

| Acteur | Description |
|---|---|
| Visiteur | Internaute non connecté : consulte le catalogue, crée un compte. |
| Client | Utilisateur connecté (rôle `CUSTOMER`) : panier, commande, suivi, gestion de ses données. |
| Administrateur | Membre de l'équipe (rôle `ADMIN`) : gère le catalogue, les stocks et les commandes. |

## 1.3 Besoins fonctionnels (user stories)

### Catalogue
| ID | En tant que… | je veux… | afin de… | Priorité |
|---|---|---|---|---|
| US01 | visiteur | parcourir les produits par collection (femme / homme) et catégorie | trouver rapidement ce qui m'intéresse | Must |
| US02 | visiteur | filtrer par taille disponible, couleur et prix, et trier les résultats | ne voir que les articles adaptés | Must |
| US03 | visiteur | rechercher un produit par mot-clé | accéder directement à un article | Should |
| US04 | visiteur | voir la fiche d'un produit, choisir couleur et taille et voir la photo du coloris choisi | connaître la disponibilité exacte et l'aspect du vêtement | Must |

### Compte et commande
| ID | En tant que… | je veux… | afin de… | Priorité |
|---|---|---|---|---|
| US05 | visiteur | créer un compte | pouvoir commander | Must |
| US06 | client | me connecter / me déconnecter | sécuriser mon accès | Must |
| US07 | client | ajouter, modifier, retirer des articles de mon panier | préparer ma commande | Must |
| US08 | client | valider ma commande avec une adresse de livraison et payer par carte bancaire | acheter les articles | Must |
| US09 | client | consulter l'historique et le statut de mes commandes | suivre mes achats | Must |
| US10 | client | modifier mes informations, télécharger mes données, supprimer mon compte | exercer mes droits RGPD | Must |

### Back-office
| ID | En tant que… | je veux… | afin de… | Priorité |
|---|---|---|---|---|
| US11 | admin | créer, modifier, archiver un produit et ses déclinaisons (taille / couleur / stock) | tenir le catalogue à jour | Must |
| US12 | admin | gérer les catégories | organiser le catalogue | Should |
| US13 | admin | voir toutes les commandes et faire évoluer leur statut | assurer la logistique | Must |
| US14 | admin | annuler une commande et remettre les articles en stock | gérer les annulations | Should |
| US15 | admin | consulter un tableau de bord (CA, commandes, stocks faibles) | piloter l'activité | Could |

## 1.4 Règles de gestion

- RG01. Un produit possède une ou plusieurs **déclinaisons** (taille + couleur), chacune avec son propre stock.
  Un couple taille / couleur est unique pour un produit.
- RG02. Un article ne peut être ajouté au panier que si le produit est actif et la quantité ≤ stock disponible
  (10 exemplaires maximum par article).
- RG03. À la validation de la commande, le stock est vérifié et décrémenté **de manière atomique** : si un seul
  article manque, la commande entière est refusée et rien n'est modifié.
- RG04. Frais de livraison : 5,90 €, offerts à partir de 80 € d'achat. Le montant est toujours calculé par le serveur.
- RG05. Le prix et le nom des produits sont **copiés** dans la commande : une modification ultérieure du catalogue
  ne change pas les commandes passées.
- RG06. Cycle de vie d'une commande : `PAID → SHIPPED → DELIVERED`, ou `PAID → CANCELLED`. Toute autre transition
  est refusée. L'annulation remet les articles en stock.
- RG07. Un produit n'est jamais supprimé physiquement : il est **archivé** (retiré du catalogue, conservé pour l'historique).
- RG08. Une catégorie ne peut être supprimée que si aucun produit n'y est rattaché.
- RG09. Un client ne peut consulter que ses propres commandes.
- RG10. À la suppression d'un compte, les commandes sont conservées (obligation comptable) mais détachées du client.
- RG11. Paiement par carte (passerelle simulée) : numéro vérifié par l'algorithme de Luhn, date non expirée,
  CVC de 3 chiffres (4 pour American Express). Un refus de paiement annule toute la commande (stock inchangé, panier
  conservé). Seuls la marque et les 4 derniers chiffres de la carte sont conservés.

## 1.5 Besoins non fonctionnels

| Domaine | Exigence |
|---|---|
| Sécurité | OWASP Top 10 pris en compte (voir [03-securite.md](03-securite.md)) ; mots de passe hachés ; contrôle d'accès par rôle côté serveur. |
| RGPD | Minimisation des données, droits d'accès, de rectification, de portabilité et d'effacement ; un seul cookie technique. |
| Accessibilité | Objectif RGAA / WCAG 2.1 AA : HTML sémantique, libellés de formulaires, navigation clavier, lien d'évitement, contrastes. |
| Responsive | Utilisable du mobile (360 px) au desktop. |
| Performance | Pagination du catalogue, images en chargement différé, ressources statiques mises en cache. |
| Qualité | Code typé (TypeScript), tests automatisés, intégration continue. |
| Déploiement | Conteneurisé (Docker Compose), migrations de base versionnées. |

## 1.6 Périmètre et hors périmètre

**Hors périmètre de la version 1** (pistes d'évolution) : paiement réel via un prestataire certifié (Stripe), envoi d'emails transactionnels,
réinitialisation du mot de passe, upload d'images, avis clients, codes promo, panier invité.

## 1.7 Planning prévisionnel

| Phase | Contenu | Durée |
|---|---|---|
| 1. Analyse | Cahier des charges, user stories, maquettes | 1 semaine |
| 2. Conception | MCD/MLD, diagrammes UML, architecture | 1 semaine |
| 3. Back-end | API, sécurité, tests d'intégration | 2 semaines |
| 4. Front-end | Boutique, espace client, back-office | 2 semaines |
| 5. Recette & déploiement | Tests, Docker, CI, documentation | 1 semaine |

Organisation : méthode agile (sprints d'une semaine), tâches suivies sur un tableau Kanban, versionnement Git avec
une branche par fonctionnalité et pull requests.
