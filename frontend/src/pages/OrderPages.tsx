import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { api } from "../api/client";
import type { Order } from "../api/types";
import { STATUS_LABELS, formatDate, formatPrice } from "../lib/format";
import { BRAND_LABELS, type CardBrand } from "../lib/card";

export function StatusTag({ status }: { status: Order["status"] }) {
  return <span className={`tag tag-${status.toLowerCase()}`}>{STATUS_LABELS[status]}</span>;
}

const TIMELINE = ["PAID", "SHIPPED", "DELIVERED"] as const;

function StatusTimeline({ status }: { status: Order["status"] }) {
  if (status === "CANCELLED") {
    return <p className="alert alert-error">Cette commande a été annulée.</p>;
  }
  const current = TIMELINE.indexOf(status);
  return (
    <ol className="timeline" aria-label="Suivi de la commande">
      {TIMELINE.map((s, i) => (
        <li key={s} className={i <= current ? "done" : undefined} aria-current={i === current ? "step" : undefined}>
          <span className="timeline-dot" aria-hidden="true" />
          {STATUS_LABELS[s]}
        </li>
      ))}
    </ol>
  );
}

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    api.orders().then(setOrders);
  }, []);

  if (!orders) return <p className="muted">Chargement…</p>;

  return (
    <section>
      <div className="page-head">
        <h1>Mes commandes</h1>
        <Link to="/compte" className="pill-link">← Mon compte</Link>
      </div>
      {orders.length === 0 ? (
        <div className="empty-state">
          <h2>Aucune commande pour l'instant</h2>
          <Link to="/catalogue" className="button">Découvrir la collection</Link>
        </div>
      ) : (
        <ul className="order-list">
          {orders.map((o) => {
            const count = o.items.reduce((sum, i) => sum + i.quantity, 0);
            return (
              <li key={o.id}>
                <Link to={`/compte/commandes/${o.id}`} className="order-card">
                  <div>
                    <strong>Commande #{o.id}</strong>
                    <span className="muted small">{formatDate(o.createdAt)} · {count} article(s)</span>
                  </div>
                  <StatusTag status={o.status} />
                  <span className="price">{formatPrice(o.totalCents)}</span>
                  <span className="order-card-arrow" aria-hidden="true">→</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export function OrderDetail({ order }: { order: Order }) {
  const subtotal = order.totalCents - order.shippingCents;
  return (
    <div className="order-detail">
      <StatusTimeline status={order.status} />
      <div className="order-grid">
        <section className="order-box order-items" aria-label="Articles">
          <h2>Articles</h2>
          <ul>
            {order.items.map((i) => (
              <li key={i.id}>
                <span>
                  {i.productName}
                  <span className="muted small">{i.color} · {i.size} · × {i.quantity}</span>
                </span>
                <span>{formatPrice(i.unitPriceCents * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="order-totals">
            <dt>Sous-total</dt>
            <dd>{formatPrice(subtotal)}</dd>
            <dt>Livraison</dt>
            <dd>{order.shippingCents === 0 ? "Offerte" : formatPrice(order.shippingCents)}</dd>
            <dt className="total">Total</dt>
            <dd className="total">{formatPrice(order.totalCents)}</dd>
          </dl>
        </section>
        <div className="order-side">
          <section className="order-box" aria-label="Livraison">
            <h2>Livraison</h2>
            <address>
              {order.shippingFullName}<br />
              {order.shippingStreet}<br />
              {order.shippingPostal} {order.shippingCity}<br />
              {order.shippingCountry}
            </address>
          </section>
          {order.paymentLast4 && (
            <section className="order-box" aria-label="Paiement">
              <h2>Paiement</h2>
              <p>
                {BRAND_LABELS[order.paymentBrand as CardBrand] ?? order.paymentBrand} •••• {order.paymentLast4}
              </p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

export function OrderPage() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api.order(Number(id)).then(setOrder).catch(() => setNotFound(true));
  }, [id]);

  if (notFound) {
    return (
      <div className="empty-state">
        <h1>Commande introuvable</h1>
        <Link to="/compte/commandes" className="button">Mes commandes</Link>
      </div>
    );
  }
  if (!order) return <p className="muted">Chargement…</p>;

  return (
    <section>
      {params.get("confirmation") ? (
        <div className="confirmation">
          <span className="confirmation-icon" aria-hidden="true">✓</span>
          <h1>Merci pour votre commande</h1>
          <p>
            Commande #{order.id} confirmée le {formatDate(order.createdAt)}. Vous pouvez suivre son statut depuis
            votre compte.
          </p>
        </div>
      ) : (
        <div className="page-head">
          <div>
            <h1>Commande #{order.id}</h1>
            <p className="muted">Passée le {formatDate(order.createdAt)}</p>
          </div>
          <StatusTag status={order.status} />
        </div>
      )}
      <OrderDetail order={order} />
      <p>
        <Link to="/compte/commandes" className="pill-link">← Toutes mes commandes</Link>
      </p>
    </section>
  );
}
