# 3. Sécurité et RGPD

## 3.1 Correspondance avec l'OWASP Top 10 (2021)

| Risque | Mesures mises en place | Où dans le code |
|---|---|---|
| **A01 : Contrôle d'accès défaillant** | Middlewares `requireAuth` / `requireAdmin` sur chaque route protégée ; le rôle est lu dans le jeton signé, jamais dans la requête. Un client ne lit que ses commandes (404 sinon, pour ne pas révéler l'existence d'une ressource : protection IDOR). Le rôle envoyé à l'inscription est ignoré. | `middlewares/auth.ts`, `orders.service.ts#getOrder`, tests `cart-orders.test.ts`, `auth.test.ts` |
| **A02 : Défaillances cryptographiques** | Mots de passe hachés avec **bcrypt** (12 tours, sel intégré). JWT signé HS256 avec un secret ≥ 32 caractères vérifié au démarrage. Cookie `Secure` en production, HTTPS + HSTS. | `auth.service.ts`, `config/env.ts`, `lib/jwt.ts` |
| **A03 : Injection** | Requêtes SQL paramétrées via l'ORM Prisma (aucune concaténation SQL). Toutes les entrées (body, query, params) validées par des schémas **Zod** (types, longueurs, formats, listes blanches). React échappe le contenu affiché (pas de `dangerouslySetInnerHTML`). | `*.schemas.ts`, `products.service.ts` |
| **A04 : Conception non sécurisée** | Montants recalculés côté serveur (le client n'envoie jamais de prix). Transaction + décrément conditionnel contre la survente. Machine à états pour les statuts de commande. | `orders.service.ts`, `order-status.ts` |
| **A05 : Mauvaise configuration** | En-têtes de sécurité avec **Helmet** (CSP, HSTS, X-Frame-Options, nosniff…) et dans Nginx. `x-powered-by` désactivé. Messages d'erreur génériques (pas de stack trace renvoyée). CORS limité à l'origine du front. Secrets dans des variables d'environnement, `.env` exclu de Git. | `app.ts`, `middlewares/error.ts`, `frontend/nginx.conf` |
| **A06 : Composants vulnérables** | `npm audit` exécuté en intégration continue ; versions verrouillées par `package-lock.json`. | `.github/workflows/ci.yml` |
| **A07 : Identification et authentification** | Politique de mot de passe (10 caractères, majuscule, minuscule, chiffre). **Limitation de débit** : 10 tentatives / 15 min sur connexion et inscription. Message identique que l'email existe ou non (pas d'énumération des comptes). Jeton à durée de vie limitée (24 h). Mot de passe redemandé pour supprimer le compte. | `auth.schemas.ts`, `auth.routes.ts` |
| **A08 : Intégrité des données** | Signature du JWT vérifiée avec algorithme imposé (`algorithms: ["HS256"]`, pas de `none`). Migrations de base versionnées. | `lib/jwt.ts` |
| **A09 : Journalisation** | Erreurs inattendues journalisées côté serveur (sans données sensibles). Évolution : logs structurés (pino) et alertes. | `middlewares/error.ts` |
| **A10 : SSRF** | L'API ne télécharge aucune ressource à partir d'une URL fournie par l'utilisateur (les URLs d'images sont seulement stockées et affichées). | : |

## 3.2 Session : pourquoi un cookie httpOnly plutôt que le localStorage

Le JWT est stocké dans un cookie :

- `HttpOnly` : inaccessible au JavaScript, donc **non volable par une faille XSS** (contrairement au `localStorage`) ;
- `SameSite=Strict` : le navigateur ne l'envoie pas sur une requête provenant d'un autre site, ce qui protège
  contre le **CSRF** ;
- `Secure` en production : transmis uniquement en HTTPS.

Le front et l'API sont servis depuis la **même origine** (proxy Vite en développement, Nginx en production),
ce qui rend ce cookie strict utilisable sans configuration CORS complexe.

Limite connue : un JWT ne peut pas être révoqué avant son expiration. Évolution possible : jeton d'accès court
(15 min) + jeton de rafraîchissement stocké en base et révocable.

## 3.3 RGPD

| Principe / droit | Mise en œuvre |
|---|---|
| Minimisation | Seules les données nécessaires sont collectées : nom, prénom, email, adresse de livraison. Carte bancaire : seuls la marque et les 4 derniers chiffres sont conservés. |
| Information | Page *Politique de confidentialité*, case d'acceptation à l'inscription. |
| Cookies | Un seul cookie, strictement nécessaire (session) : pas de bandeau de consentement requis (recommandations CNIL). |
| Droit d'accès / portabilité | `GET /api/auth/me/export` : export JSON du compte et des commandes. |
| Droit de rectification | Modification du profil depuis l'espace client. |
| Droit à l'effacement | `DELETE /api/auth/me` : suppression du compte et du panier ; les commandes sont conservées sans lien avec la personne (obligation comptable de 10 ans). |
| Sécurité | Hachage des mots de passe, contrôle d'accès, HTTPS. |

## 3.4 Paiement par carte (passerelle simulée)

Le module [fake-gateway.ts](../backend/src/modules/payments/fake-gateway.ts) reproduit le comportement d'un
prestataire de paiement sans contacter de banque. Règles PCI DSS appliquées :

- le **numéro complet (PAN) et le CVC ne sont jamais stockés** ni journalisés : seuls la marque, les 4 derniers
  chiffres et une référence de transaction sont enregistrés avec la commande (vérifié par un test automatisé) ;
- les erreurs de validation renvoient le nom du champ, jamais la valeur saisie ;
- **limitation de débit** sur `POST /api/orders` (10 tentatives / 15 min) contre le *card testing* (test de cartes volées) ;
- le montant débité est calculé par le serveur ;
- un refus de paiement annule la transaction : stock restauré, aucune commande créée.

Cartes de test : `4242 4242 4242 4242` (acceptée), `4000 0000 0000 0002` (refusée),
`4000 0000 0000 9995` (fonds insuffisants).

**En production**, ce formulaire serait remplacé par celui d'un prestataire certifié PCI DSS (par exemple Stripe
Elements) : le numéro de carte ne passerait plus du tout par notre serveur, ce qui réduit fortement le périmètre
de conformité.

## 3.5 Tests de sécurité automatisés

Les tests d'intégration vérifient notamment :

- refus d'accès sans session (401) et avec un rôle insuffisant (403) ;
- refus d'un jeton falsifié ;
- impossibilité pour un client de lire la commande d'un autre ;
- impossibilité de s'attribuer le rôle `ADMIN` à l'inscription ;
- le mot de passe n'est jamais renvoyé par l'API et il est stocké haché ;
- attributs du cookie (`HttpOnly`, `SameSite=Strict`) ;
- validation des entrées (400 avec le détail des champs) ;
- le numéro complet de la carte et le CVC ne sont jamais enregistrés ;
- un paiement refusé ne crée pas de commande et ne modifie pas le stock.
