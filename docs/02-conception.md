# 2. Conception

Les diagrammes sont écrits en [Mermaid](https://mermaid.js.org/) : ils s'affichent directement sur GitHub
et dans VS Code (extension *Markdown Preview Mermaid Support*).

## 2.1 Diagramme de cas d'utilisation

```mermaid
flowchart LR
    V((Visiteur))
    C((Client))
    A((Administrateur))

    subgraph Boutique
        UC1[Consulter / filtrer le catalogue]
        UC2[Consulter une fiche produit]
        UC3[Créer un compte]
        UC4[Se connecter]
        UC5[Gérer son panier]
        UC6[Passer commande]
        UC7[Suivre ses commandes]
        UC8[Gérer ses données personnelles]
    end

    subgraph Back-office
        UC9[Gérer les produits et les stocks]
        UC10[Gérer les catégories]
        UC11[Traiter les commandes]
        UC12[Consulter le tableau de bord]
    end

    V --> UC1 & UC2 & UC3 & UC4
    C --> UC1 & UC2 & UC5 & UC6 & UC7 & UC8
    A --> UC9 & UC10 & UC11 & UC12
    UC6 -. include .-> UC5
```

Le client hérite des cas d'utilisation du visiteur (catalogue) ; l'administrateur est un utilisateur authentifié
avec le rôle `ADMIN`.

## 2.2 Modèle conceptuel de données (MCD : Merise)

```
UTILISATEUR (id, email, mot_de_passe_hash, prénom, nom, rôle, date_création)
CATÉGORIE (id, nom, slug)
PRODUIT (id, nom, slug, description, prix, image, genre, actif, date_création)
DÉCLINAISON (id, taille, couleur, stock)
PHOTO (id, couleur, url)
COMMANDE (id, statut, frais_livraison, total, adresse_livraison…, date)
LIGNE_COMMANDE (id, nom_produit, taille, couleur, prix_unitaire, quantité)

APPARTENIR       : PRODUIT (1,1) --- (0,n) CATÉGORIE
DÉCLINER         : DÉCLINAISON (1,1) --- (1,n) PRODUIT
ILLUSTRER        : PHOTO (1,1) --- (0,n) PRODUIT   [une photo par couleur]
METTRE_AU_PANIER : UTILISATEUR (0,n) --- (0,n) DÉCLINAISON   [quantité]
PASSER           : COMMANDE (0,1) --- (0,n) UTILISATEUR
CONTENIR         : LIGNE_COMMANDE (1,1) --- (1,n) COMMANDE
CONCERNER        : LIGNE_COMMANDE (0,1) --- (0,n) DÉCLINAISON
```

Remarques sur le MCD :

- **METTRE_AU_PANIER** est une association porteuse (quantité) entre UTILISATEUR et DÉCLINAISON : elle devient la
  table `cart_items` avec une contrainte d'unicité (user_id, variant_id).
- **PASSER** est en (0,1) côté commande : une commande survit à la suppression du compte (RGPD + comptabilité).
- **LIGNE_COMMANDE** recopie nom, taille, couleur et prix (dénormalisation volontaire, RG05) ; le lien vers la
  déclinaison est facultatif (0,1) pour la même raison.

## 2.3 Modèle logique / physique (MLD)

```mermaid
erDiagram
    users ||--o{ cart_items : "possède"
    users |o--o{ orders : "passe"
    categories ||--o{ products : "regroupe"
    products ||--|{ product_variants : "se décline en"
    products ||--o{ product_images : "est illustré par"
    product_variants ||--o{ cart_items : "est ajoutée"
    product_variants |o--o{ order_items : "est commandée"
    orders ||--|{ order_items : "contient"

    users {
        int id PK
        varchar email UK
        varchar password_hash
        varchar first_name
        varchar last_name
        enum role "CUSTOMER | ADMIN"
        timestamp created_at
    }
    categories {
        int id PK
        varchar name UK
        varchar slug UK
        varchar image_url "nullable"
    }
    product_images {
        int id PK
        varchar color
        varchar url
        int product_id FK "UK(product_id, color)"
    }
    products {
        int id PK
        varchar name
        varchar slug UK
        text description
        int price_cents
        varchar image_url
        enum gender "FEMME | HOMME | UNISEXE"
        boolean is_active
        timestamp created_at
        int category_id FK
    }
    product_variants {
        int id PK
        varchar size
        varchar color
        int stock
        int product_id FK "UK(product_id, size, color)"
    }
    cart_items {
        int id PK
        int quantity
        int user_id FK "UK(user_id, variant_id)"
        int variant_id FK
    }
    orders {
        int id PK
        enum status "PAID | SHIPPED | DELIVERED | CANCELLED"
        int shipping_cents
        varchar payment_ref "nullable"
        varchar payment_brand "nullable"
        varchar payment_last4 "nullable"
        int total_cents
        varchar shipping_full_name
        varchar shipping_street
        varchar shipping_postal_code
        varchar shipping_city
        varchar shipping_country
        timestamp created_at
        int user_id FK "nullable"
    }
    order_items {
        int id PK
        varchar product_name
        varchar size
        varchar color
        int unit_price_cents
        int quantity
        int order_id FK
        int variant_id FK "nullable"
    }
```

Choix techniques :

- **Montants en centimes (entiers)** : aucun arrondi flottant (0,1 + 0,2 ≠ 0,3).
- **Règles de suppression** (`ON DELETE`) : `CASCADE` pour les déclinaisons d'un produit et le panier d'un client,
  `SET NULL` pour les commandes d'un compte supprimé, `RESTRICT` pour une catégorie encore utilisée.
- **Index** sur les clés étrangères les plus filtrées (`products.category_id`, `orders.user_id`).

Le script SQL généré est versionné dans
[backend/prisma/migrations](../backend/prisma/migrations) et appliqué par `prisma migrate deploy`.

## 2.4 Architecture logicielle

```mermaid
flowchart LR
    subgraph Navigateur
        SPA[React SPA<br/>React Router · Context API]
    end
    subgraph Serveur
        NGINX[Nginx<br/>fichiers statiques + reverse proxy]
        subgraph API[API REST Express]
            R[Routes / contrôleurs<br/>validation Zod]
            M[Middlewares<br/>auth JWT · rôles · erreurs]
            S[Services métier]
            P[Prisma ORM]
        end
        DB[(PostgreSQL)]
    end
    SPA -- HTTPS /api + cookie httpOnly --> NGINX
    NGINX -- /api --> R
    R --> M --> S --> P --> DB
```

**Architecture en couches** côté API, chaque module (`auth`, `products`, `cart`, `orders`…) étant découpé en :

| Couche | Fichier | Responsabilité |
|---|---|---|
| Présentation (contrôleur) | `*.routes.ts` | Routes HTTP, lecture de la requête, code de réponse |
| Validation | `*.schemas.ts` | Schémas Zod : types, formats, bornes |
| Métier | `*.service.ts` | Règles de gestion, transactions |
| Accès aux données | Prisma (`lib/prisma.ts`) | Requêtes SQL paramétrées, mapping objet-relationnel |

Le front-end est une **SPA** : les pages appellent un client d'API unique (`src/api/client.ts`) ; l'état global
(utilisateur connecté, panier) est partagé via deux contextes React.

## 2.5 Diagramme de séquence : passer commande

```mermaid
sequenceDiagram
    actor C as Client
    participant F as Front React
    participant A as API Express
    participant DB as PostgreSQL

    C->>F: Remplit l'adresse et la carte, clique « Payer »
    F->>A: POST /api/orders (cookie de session)
    A->>A: requireAuth : vérifie le JWT
    A->>A: Valide l'adresse (Zod)
    A->>DB: BEGIN
    A->>DB: SELECT panier + déclinaisons + produits
    loop pour chaque article
        A->>DB: UPDATE stock = stock - qté WHERE id = ? AND stock >= qté
        alt 0 ligne modifiée
            A->>DB: ROLLBACK
            A-->>F: 409 Stock insuffisant
            F-->>C: Message d'erreur + panier rafraîchi
        end
    end
    A->>A: Passerelle de paiement : débit de la carte
    alt paiement refusé
        A->>DB: ROLLBACK (stock restauré)
        A-->>F: 402 Paiement refusé
    end
    A->>DB: INSERT commande + lignes (prix recopiés, marque + 4 derniers chiffres)
    A->>DB: DELETE panier
    A->>DB: COMMIT
    A-->>F: 201 Commande créée
    F-->>C: Page de confirmation
```

Le décrément conditionnel (`WHERE stock >= qté`) empêche la **survente** même si deux clients valident en même temps
le dernier exemplaire : la base garantit qu'un seul des deux `UPDATE` réussit.

## 2.6 Diagramme d'états : commande

```mermaid
stateDiagram-v2
    [*] --> PAID : paiement validé
    PAID --> SHIPPED : expédition
    PAID --> CANCELLED : annulation (remise en stock)
    SHIPPED --> DELIVERED : livraison
    DELIVERED --> [*]
    CANCELLED --> [*]
```

## 2.7 Maquettes

Les maquettes (zoning puis maquettes haute fidélité, version mobile et desktop) sont à réaliser sur Figma pour les
écrans : accueil, catalogue, fiche produit, panier, tunnel de commande, espace client, back-office produits.
Ajouter les exports dans `docs/maquettes/`.

**Charte graphique** : fond crème `#f6f3ee`, texte et accent bleu nuit `#1f2a37` (contraste 13,1:1, conforme AAA ; texte secondaire `#5d6673` à 5,2:1, conforme AA),
titres en serif (Georgia), texte en police système sans-serif.
