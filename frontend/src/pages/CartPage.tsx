import { useState } from "react";
import { Link } from "react-router-dom";
import { ApiError } from "../api/client";
import { useCart } from "../context/CartContext";
import { Alert } from "../components/FormField";
import { FREE_SHIPPING_THRESHOLD_CENTS, formatPrice, shippingCost } from "../lib/format";
import { swatch } from "../lib/colors";
import { imageFor } from "../lib/images";

export function CartPage() {
  const { cart, update, remove } = useCart();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function run(action: () => Promise<void>) {
    setError("");
    setBusy(true);
    try {
      await action();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur inattendue");
    } finally {
      setBusy(false);
    }
  }

  if (cart.items.length === 0) {
    return (
      <div className="empty-state">
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
          <path d="M5 8h14l-1 13H6L5 8z" />
          <path d="M9 8V6a3 3 0 0 1 6 0v2" />
        </svg>
        <h1>Votre panier est vide</h1>
        <p>Nos nouveautés n'attendent que vous.</p>
        <Link to="/catalogue" className="button">
          Découvrir la collection
        </Link>
      </div>
    );
  }

  const shipping = shippingCost(cart.totalCents);
  const remaining = FREE_SHIPPING_THRESHOLD_CENTS - cart.totalCents;
  const progress = Math.min(100, Math.round((cart.totalCents / FREE_SHIPPING_THRESHOLD_CENTS) * 100));

  return (
    <>
      <div className="page-head">
        <h1>Panier</h1>
        <span className="pill">{cart.count} article(s)</span>
      </div>

      <div className="cart-layout">
        <section aria-label="Articles">
          {error && <Alert>{error}</Alert>}
          <ul className="cart-list">
            {cart.items.map((item) => {
              const { product } = item.variant;
              const max = Math.min(10, item.variant.stock);
              return (
                <li key={item.id} className="cart-item">
                  <Link to={`/produit/${product.slug}?couleur=${encodeURIComponent(item.variant.color)}`} className="cart-item-image">
                    <img src={imageFor(product, item.variant.color)} alt="" width={120} height={160} />
                  </Link>
                  <div className="cart-item-info">
                    <Link to={`/produit/${product.slug}`} className="cart-item-name">
                      {product.name}
                    </Link>
                    <div className="cart-item-variant">
                      <span className="chip">
                        <span className="swatch" style={{ background: swatch(item.variant.color) }} aria-hidden="true" />
                        {item.variant.color}
                      </span>
                      <span className="chip">Taille {item.variant.size}</span>
                    </div>
                    <div className="stepper" role="group" aria-label={`Quantité pour ${product.name}`}>
                      <button type="button" aria-label="Diminuer la quantité" disabled={busy || item.quantity <= 1}
                        onClick={() => run(() => update(item.variantId, item.quantity - 1))}>
                        −
                      </button>
                      <span aria-live="polite">{item.quantity}</span>
                      <button type="button" aria-label="Augmenter la quantité" disabled={busy || item.quantity >= max}
                        onClick={() => run(() => update(item.variantId, item.quantity + 1))}>
                        +
                      </button>
                    </div>
                  </div>
                  <div className="cart-item-side">
                    <span className="price">{formatPrice(product.priceCents * item.quantity)}</span>
                    <button type="button" className="remove-button" disabled={busy}
                      onClick={() => run(() => remove(item.variantId))}>
                      Retirer
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <aside className="summary" aria-label="Récapitulatif">
          <h2>Récapitulatif</h2>
          <div className="shipping-progress">
            <p className="small">
              {shipping === 0 ? "Livraison offerte" : `Plus que ${formatPrice(remaining)} pour la livraison offerte`}
            </p>
            <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}
              aria-label="Progression vers la livraison offerte">
              <span style={{ width: `${progress}%` }} />
            </div>
          </div>
          <dl>
            <dt>Sous-total</dt>
            <dd>{formatPrice(cart.totalCents)}</dd>
            <dt>Livraison</dt>
            <dd>{shipping === 0 ? "Offerte" : formatPrice(shipping)}</dd>
            <dt className="total">Total</dt>
            <dd className="total">{formatPrice(cart.totalCents + shipping)}</dd>
          </dl>
          <Link to="/commande" className="button button-block">
            Passer commande
          </Link>
          <ul className="reassurance">
            <li>Paiement sécurisé</li>
            <li>Retours gratuits sous 14 jours</li>
            <li>Expédition en 2 à 4 jours ouvrés</li>
          </ul>
        </aside>
      </div>
    </>
  );
}
