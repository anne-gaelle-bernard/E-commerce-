import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ApiError } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Alert, FormField } from "../components/FormField";

const photo = (id: string) => `https://images.unsplash.com/photo-${id}?w=900&h=1200&fit=crop&crop=faces,center&q=80&auto=format`;

function AuthLayout({ image, children }: { image: string; children: React.ReactNode }) {
  return (
    <div className="auth-layout">
      <div className="auth-visual">
        <img src={image} alt="" width={900} height={1200} />
        <p className="auth-quote">Des basiques faits pour durer.</p>
      </div>
      {children}
    </div>
  );
}

function useRedirectAfterAuth() {
  const location = useLocation();
  const navigate = useNavigate();
  const from = (location.state as { from?: string } | null)?.from ?? "/";
  return () => navigate(from, { replace: true });
}

export function LoginPage() {
  const { login } = useAuth();
  const location = useLocation();
  const redirect = useRedirectAfterAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await login(email, password);
      redirect();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur inattendue");
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout image={photo("1564430362299-113976f94001")}>
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1>Bon retour</h1>
        <p className="muted">Connectez-vous pour retrouver votre panier et vos commandes.</p>
        {error && <Alert>{error}</Alert>}
        <FormField label="Email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <FormField label="Mot de passe" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit" className="button button-block" disabled={submitting}>
          Se connecter
        </button>
        <p>
          Pas encore de compte ? <Link to="/inscription" state={location.state}>Créer un compte</Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export function RegisterPage() {
  const { register } = useAuth();
  const redirect = useRedirectAfterAuth();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [field]: e.target.value });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setErrors({});
    try {
      await register(form);
      redirect();
    } catch (err) {
      setSubmitting(false);
      if (err instanceof ApiError) {
        setError(err.message);
        setErrors(Object.fromEntries(err.details.map((d) => [d.field, d.message])));
      } else {
        setError("Erreur inattendue");
      }
    }
  }

  return (
    <AuthLayout image={photo("1787435917441-b81ea7c49390")}>
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <h1>Créer un compte</h1>
        <p className="muted">Suivez vos commandes et passez commande plus vite.</p>
        {error && <Alert>{error}</Alert>}
        <div className="field-row">
          <FormField label="Prénom" autoComplete="given-name" required value={form.firstName} onChange={set("firstName")} error={errors.firstName} />
          <FormField label="Nom" autoComplete="family-name" required value={form.lastName} onChange={set("lastName")} error={errors.lastName} />
        </div>
        <FormField label="Email" type="email" autoComplete="email" required value={form.email} onChange={set("email")} error={errors.email} />
        <FormField
          label="Mot de passe"
          type="password"
          autoComplete="new-password"
          required
          value={form.password}
          onChange={set("password")}
          error={errors.password}
          hint="10 caractères minimum, avec une majuscule, une minuscule et un chiffre."
        />
        <div className="checkbox">
          <input id="consent" type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} required />
          <label htmlFor="consent">
            J'accepte les <Link to="/cgv">conditions générales de vente</Link> et la{" "}
            <Link to="/confidentialite">politique de confidentialité</Link>.
          </label>
        </div>
        <button type="submit" className="button button-block" disabled={submitting || !consent}>
          Créer mon compte
        </button>
        <p>
          Déjà inscrit·e ? <Link to="/connexion">Se connecter</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
