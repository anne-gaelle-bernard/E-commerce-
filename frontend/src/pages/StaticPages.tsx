import type { ReactNode } from "react";
import { Link } from "react-router-dom";

function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <article className="legal">
      <header className="legal-head">
        <p className="pill">Informations</p>
        <h1>{title}</h1>
        <nav aria-label="Pages légales" className="legal-nav">
          <Link to="/mentions-legales">Mentions légales</Link>
          <Link to="/cgv">CGV</Link>
          <Link to="/confidentialite">Confidentialité</Link>
        </nav>
      </header>
      <div className="prose">{children}</div>
    </article>
  );
}

export function NotFoundPage() {
  return (
    <div className="not-found">
      <p className="not-found-code">404</p>
      <h1>Page introuvable</h1>
      <p className="muted">La page que vous cherchez n'existe pas ou a été déplacée.</p>
      <div className="hero-actions">
        <Link to="/" className="button">
          Retour à l'accueil
        </Link>
        <Link to="/catalogue" className="button button-secondary">
          Voir la collection
        </Link>
      </div>
    </div>
  );
}

export function LegalNoticePage() {
  return (
    <LegalPage title="Mentions légales">
      <p>
        Maison Lune est un site réalisé dans le cadre du titre professionnel Concepteur Développeur d'Applications.
        Aucune vente réelle n'est effectuée.
      </p>
      <h2>Éditeur</h2>
      <p>Anne-Gaëlle Bernard</p>
      <h2>Hébergement</h2>
      <p>
        Site (interface) : Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis.{" "}
        <a href="https://vercel.com">vercel.com</a>
      </p>
      <p>
        API et base de données : Railway Corporation, 548 Market St PMB 68956, San Francisco, CA 94104, États-Unis.{" "}
        <a href="https://railway.com">railway.com</a>
      </p>
      <h2>Crédits photos</h2>
      <p>
        Photographies issues de <a href="https://unsplash.com">Unsplash</a>, utilisées selon la licence Unsplash.
      </p>
    </LegalPage>
  );
}

export function TermsPage() {
  return (
    <LegalPage title="Conditions générales de vente">
      <h2>Prix</h2>
      <p>Les prix sont indiqués en euros TTC. Les frais de livraison (5,90 €) sont offerts dès 80 € d'achat.</p>
      <h2>Commande et paiement</h2>
      <p>
        La commande est validée après acceptation du paiement par carte bancaire. Sur ce site de démonstration, le
        paiement est simulé : aucune somme n'est débitée.
      </p>
      <h2>Droit de rétractation</h2>
      <p>Vous disposez de 14 jours à compter de la réception pour retourner un article (art. L221-18 du Code de la consommation).</p>
    </LegalPage>
  );
}

export function PrivacyPage() {
  return (
    <LegalPage title="Politique de confidentialité">
      <h2>Données collectées</h2>
      <p>
        Nom, prénom, email (création du compte), adresse de livraison et contenu des commandes (exécution du contrat).
        Les mots de passe sont stockés sous forme hachée (bcrypt) et ne sont jamais lisibles. Pour le paiement, seuls
        le type de carte et ses 4 derniers chiffres sont conservés ; le numéro complet et le cryptogramme ne sont
        jamais enregistrés.
      </p>
      <h2>Cookies</h2>
      <p>
        Un seul cookie technique, strictement nécessaire, est déposé pour maintenir votre session. Il n'y a ni cookie
        publicitaire ni traceur tiers : aucun consentement n'est donc requis.
      </p>
      <h2>Hébergement et transferts hors UE</h2>
      <p>
        Les données sont hébergées par Vercel et Railway, sociétés établies aux États-Unis. Ces transferts sont encadrés
        par le Data Privacy Framework UE–États-Unis ou par les clauses contractuelles types de la Commission européenne.
      </p>
      <h2>Durée de conservation</h2>
      <p>
        Les données de compte sont conservées jusqu'à la suppression du compte. Les commandes sont conservées 10 ans
        (obligation comptable), détachées de votre compte en cas de suppression.
      </p>
      <h2>Vos droits</h2>
      <p>
        Depuis <Link to="/compte">votre compte</Link>, vous pouvez modifier vos informations (rectification),
        télécharger vos données (accès et portabilité) et supprimer votre compte (effacement).
      </p>
    </LegalPage>
  );
}
