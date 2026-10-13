import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ApiError, api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { Alert, FormField } from "../components/FormField";
import { formatDate } from "../lib/format";

export function AccountPage() {
  const { user, setUser, logout } = useAuth();
  const { reset } = useCart();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ firstName: user!.firstName, lastName: user!.lastName });
  const [profileMessage, setProfileMessage] = useState("");
  const [password, setPassword] = useState("");
  const [deleteError, setDeleteError] = useState("");

  async function handleProfile(e: FormEvent) {
    e.preventDefault();
    setUser(await api.updateProfile(profile));
    setProfileMessage("Profil mis à jour.");
  }

  async function handleDelete(e: FormEvent) {
    e.preventDefault();
    if (!window.confirm("Supprimer définitivement votre compte ?")) return;
    try {
      await api.deleteAccount(password);
      reset();
      setUser(null);
      navigate("/");
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : "Erreur inattendue");
    }
  }

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  return (
    <div className="account">
      <div className="account-hero">
        <div>
          <p className="pill">Mon compte</p>
          <h1>Bonjour {user!.firstName}</h1>
          <p className="muted">
            {user!.email} · client depuis le {formatDate(user!.createdAt)}
          </p>
        </div>
        <button type="button" className="button-secondary" onClick={handleLogout}>
          Se déconnecter
        </button>
      </div>

      <div className="account-tiles">
        <Link to="/compte/commandes" className="account-tile">
          <h2>Mes commandes</h2>
          <p className="muted">Suivre une commande, voir le détail et le paiement.</p>
          <span aria-hidden="true">→</span>
        </Link>
        <Link to="/catalogue" className="account-tile account-tile-accent">
          <h2>Continuer mes achats</h2>
          <p>Découvrir les nouveautés de la collection.</p>
          <span aria-hidden="true">→</span>
        </Link>
      </div>

      <div className="account-grid">
        <form onSubmit={handleProfile} className="card">
          <h2>Informations personnelles</h2>
          {profileMessage && <Alert type="success">{profileMessage}</Alert>}
          <div className="field-row">
            <FormField label="Prénom" required value={profile.firstName} onChange={(e) => setProfile({ ...profile, firstName: e.target.value })} />
            <FormField label="Nom" required value={profile.lastName} onChange={(e) => setProfile({ ...profile, lastName: e.target.value })} />
          </div>
          <button type="submit" className="button">
            Enregistrer
          </button>
        </form>

        <section className="card" aria-labelledby="rgpd-title">
          <h2 id="rgpd-title">Mes données</h2>
          <p className="muted">Téléchargez l'ensemble des données liées à votre compte (RGPD).</p>
          <a href="/api/auth/me/export" className="button button-secondary" download>
            Télécharger mes données
          </a>

          <form onSubmit={handleDelete} className="danger-zone">
            <h3>Supprimer mon compte</h3>
            <p className="small muted">
              Votre compte et votre panier seront supprimés. Vos commandes sont conservées de façon anonymisée pour
              nos obligations comptables.
            </p>
            {deleteError && <Alert>{deleteError}</Alert>}
            <FormField label="Mot de passe" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="submit" className="button button-danger">
              Supprimer définitivement
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
