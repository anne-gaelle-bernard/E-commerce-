import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ApiError, api } from "../api/client";
import type { ShippingAddress } from "../api/types";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { Alert, FormField } from "../components/FormField";
import { formatPrice, shippingCost } from "../lib/format";
import {
  BRAND_LABELS,
  detectBrand,
  digitsOnly,
  formatCardNumber,
  formatExpiry,
  luhnCheck,
  parseExpiry,
} from "../lib/card";

const TEST_CARDS = [
  { number: "4242 4242 4242 4242", result: "Paiement accepté" },
  { number: "4000 0000 0000 0002", result: "Carte refusée" },
  { number: "4000 0000 0000 9995", result: "Fonds insuffisants" },
];

function validateCard(card: { holder: string; number: string; expiry: string; cvc: string }) {
  const errors: Record<string, string> = {};
  const number = digitsOnly(card.number);
  if (card.holder.trim().length < 2) errors["card.holder"] = "Nom du titulaire requis";
  if (!luhnCheck(number)) errors["card.number"] = "Numéro de carte invalide";
  if (!parseExpiry(card.expiry)) errors["card.expMonth"] = "Format attendu : MM/AA";
  const cvcLength = detectBrand(number) === "AMEX" ? 4 : 3;
  if (!new RegExp(`^[0-9]{${cvcLength}}$`).test(card.cvc)) errors["card.cvc"] = `${cvcLength} chiffres attendus`;
  return errors;
}

export function CheckoutPage() {
  const { user } = useAuth();
  const { cart, loaded, refresh, reset } = useCart();
  const navigate = useNavigate();
  const fullName = user ? `${user.firstName} ${user.lastName}` : "";
  const [address, setAddress] = useState<ShippingAddress>({
    fullName,
    street: "",
    postalCode: "",
    city: "",
    country: "France",
  });
  const [card, setCard] = useState({ holder: fullName, number: "", expiry: "", cvc: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!loaded) return <p className="muted">Chargement…</p>;
  if (cart.items.length === 0 && !submitting) return <Navigate to="/panier" replace />;

  const setField = (field: keyof ShippingAddress) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setAddress({ ...address, [field]: e.target.value });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const cardErrors = validateCard(card);
    setErrors(cardErrors);
    if (Object.keys(cardErrors).length > 0) return;

    setSubmitting(true);
    try {
      const order = await api.createOrder(address, {
        holder: card.holder,
        number: digitsOnly(card.number),
        ...parseExpiry(card.expiry)!,
        cvc: card.cvc,
      });
      reset();
      navigate(`/compte/commandes/${order.id}?confirmation=1`);
    } catch (err) {
      setSubmitting(false);
      if (err instanceof ApiError) {
        setError(err.message);
        setErrors(Object.fromEntries(err.details.map((d) => [d.field, d.message])));
        if (err.status === 409) await refresh(); // stock modifié entre-temps
      } else {
        setError("Erreur inattendue");
      }
    }
  }

  const shipping = shippingCost(cart.totalCents);
  const total = cart.totalCents + shipping;
  const brand = detectBrand(digitsOnly(card.number));

  return (
    <>
      <ol className="steps" aria-label="Étapes de la commande">
        <li className="done"><Link to="/panier">Panier</Link></li>
        <li className="current" aria-current="step">Livraison et paiement</li>
        <li>Confirmation</li>
      </ol>

      <div className="cart-layout checkout-layout">
        <form onSubmit={handleSubmit} noValidate className="checkout-form">
          {error && <Alert>{error}</Alert>}

          <section className="checkout-section" aria-labelledby="shipping-title">
            <h2 id="shipping-title"><span className="step-number">1</span> Livraison</h2>
            <FormField label="Nom complet" autoComplete="shipping name" required value={address.fullName} onChange={setField("fullName")} error={errors["shipping.fullName"]} />
            <FormField label="Adresse" autoComplete="shipping street-address" required value={address.street} onChange={setField("street")} error={errors["shipping.street"]} />
            <div className="field-row">
              <FormField label="Code postal" autoComplete="shipping postal-code" inputMode="numeric" required value={address.postalCode} onChange={setField("postalCode")} error={errors["shipping.postalCode"]} />
              <FormField label="Ville" autoComplete="shipping address-level2" required value={address.city} onChange={setField("city")} error={errors["shipping.city"]} />
            </div>
            <FormField label="Pays" autoComplete="shipping country-name" required value={address.country} onChange={setField("country")} error={errors["shipping.country"]} />
          </section>

          <section className="checkout-section" aria-labelledby="payment-title">
            <h2 id="payment-title"><span className="step-number">2</span> Paiement</h2>
            <div className="card-preview" aria-hidden="true">
              <div className="card-preview-top">
                <span className="card-chip" />
                <span>{digitsOnly(card.number).length >= 2 ? BRAND_LABELS[brand] : "Carte"}</span>
              </div>
              <p className="card-preview-number">{card.number || "•••• •••• •••• ••••"}</p>
              <div className="card-preview-bottom">
                <span>{card.holder || "NOM DU TITULAIRE"}</span>
                <span>{card.expiry || "MM/AA"}</span>
              </div>
            </div>
            <FormField label="Titulaire de la carte" autoComplete="cc-name" required value={card.holder} onChange={(e) => setCard({ ...card, holder: e.target.value })} error={errors["card.holder"]} />
            <FormField
              label="Numéro de carte"
              autoComplete="cc-number"
              inputMode="numeric"
              placeholder="1234 5678 9012 3456"
              required
              value={card.number}
              onChange={(e) => setCard({ ...card, number: formatCardNumber(e.target.value) })}
              error={errors["card.number"]}
            />
            <div className="field-row">
              <FormField label="Expiration (MM/AA)" autoComplete="cc-exp" inputMode="numeric" placeholder="MM/AA" required value={card.expiry}
                onChange={(e) => setCard({ ...card, expiry: formatExpiry(e.target.value) })} error={errors["card.expMonth"] ?? errors["card.expYear"]} />
              <FormField label="Cryptogramme (CVC)" autoComplete="cc-csc" inputMode="numeric" placeholder={brand === "AMEX" ? "1234" : "123"} required maxLength={4} value={card.cvc}
                onChange={(e) => setCard({ ...card, cvc: digitsOnly(e.target.value).slice(0, 4) })} error={errors["card.cvc"]} />
            </div>

            <details className="notice">
              <summary>Paiement simulé : utiliser une carte de test</summary>
              <p className="small">Aucun débit réel. Date d'expiration future et CVC quelconques.</p>
              <ul className="small">
                {TEST_CARDS.map((c) => (
                  <li key={c.number}>
                    <button type="button" className="link-button" onClick={() => setCard({ ...card, number: c.number })}>
                      <code>{c.number}</code>
                    </button>{" "}
                    : {c.result}
                  </li>
                ))}
              </ul>
            </details>
          </section>

          <button type="submit" className="button button-block button-large" disabled={submitting}>
            {submitting ? "Paiement en cours…" : `Payer ${formatPrice(total)}`}
          </button>
        </form>

        <aside className="summary" aria-label="Récapitulatif de la commande">
          <h2>Votre commande</h2>
          <ul className="summary-products">
            {cart.items.map((i) => (
              <li key={i.id}>
                <span className="summary-thumb">
                  <img src={i.variant.product.imageUrl} alt="" width={56} height={72} />
                  <span className="summary-qty">{i.quantity}</span>
                </span>
                <span className="summary-name">
                  {i.variant.product.name}
                  <span className="muted small">{i.variant.color} · {i.variant.size}</span>
                </span>
                <span>{formatPrice(i.variant.product.priceCents * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl>
            <dt>Sous-total</dt>
            <dd>{formatPrice(cart.totalCents)}</dd>
            <dt>Livraison</dt>
            <dd>{shipping === 0 ? "Offerte" : formatPrice(shipping)}</dd>
            <dt className="total">Total</dt>
            <dd className="total">{formatPrice(total)}</dd>
          </dl>
        </aside>
      </div>
    </>
  );
}
