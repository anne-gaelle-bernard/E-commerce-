import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M5 8h14l-1 13H6L5 8z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  );
}

export function Layout() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  // NavLink ne compare que le chemin : on tient compte du filtre ?gender= pour le lien actif
  const gender = location.pathname === "/catalogue" ? new URLSearchParams(location.search).get("gender") ?? "ALL" : null;
  const navClass = (key: string) => (gender === key ? "active" : undefined);

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  return (
    <>
      <a href="#main" className="skip-link">
        Aller au contenu
      </a>
      <header className="site-header">
        <div className="container header-inner">
          <Link to="/" className="logo" aria-label="Maison Lune, accueil">
            maison lune<span className="logo-dot">.</span>
          </Link>
          <nav aria-label="Navigation principale" className="main-nav">
            <Link to="/catalogue?gender=FEMME" className={navClass("FEMME")}>Femme</Link>
            <Link to="/catalogue?gender=HOMME" className={navClass("HOMME")}>Homme</Link>
            <Link to="/catalogue" className={navClass("ALL")}>Tout voir</Link>
          </nav>
          <nav aria-label="Compte" className="account-nav">
            {user?.role === "ADMIN" && <NavLink to="/admin" className="pill-link">Admin</NavLink>}
            {user ? (
              <>
                <NavLink to="/compte" className="icon-link">
                  <UserIcon />
                  <span className="icon-label">Compte</span>
                </NavLink>
                <button type="button" className="link-button logout" onClick={handleLogout}>
                  Déconnexion
                </button>
              </>
            ) : (
              <NavLink to="/connexion" className="icon-link">
                <UserIcon />
                <span className="icon-label">Connexion</span>
              </NavLink>
            )}
            <NavLink to="/panier" className="cart-link" aria-label={`Panier, ${cart.count} article(s)`}>
              <BagIcon />
              <span className="badge">{cart.count}</span>
            </NavLink>
          </nav>
        </div>
      </header>

      <main id="main" className="container main">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="container footer-grid">
          <div>
            <p className="footer-tagline">Des vêtements en matières naturelles, pensés pour durer.</p>
            <p className="small muted">Livraison offerte dès 80 € · Retours gratuits sous 14 jours</p>
          </div>
          <nav aria-label="Boutique">
            <h2>Boutique</h2>
            <Link to="/catalogue?gender=FEMME">Femme</Link>
            <Link to="/catalogue?gender=HOMME">Homme</Link>
            <Link to="/catalogue?sort=newest">Nouveautés</Link>
          </nav>
          <nav aria-label="Informations légales">
            <h2>Informations</h2>
            <Link to="/mentions-legales">Mentions légales</Link>
            <Link to="/cgv">CGV</Link>
            <Link to="/confidentialite">Confidentialité</Link>
          </nav>
        </div>
        <div className="container">
          <p className="footer-wordmark" aria-hidden="true">maison lune</p>
          <p className="footer-bottom">© {new Date().getFullYear()} Maison Lune. Projet de formation, aucune vente réelle.</p>
        </div>
      </footer>
    </>
  );
}
