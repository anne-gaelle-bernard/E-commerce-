import { Fragment, useEffect, useState } from "react";
import { ApiError, api } from "../../api/client";
import type { Order, OrderStatus } from "../../api/types";
import { Alert } from "../../components/FormField";
import { STATUS_LABELS, formatDate, formatPrice } from "../../lib/format";
import { OrderDetail, StatusTag } from "../OrderPages";

const NEXT_STATUSES: Record<OrderStatus, OrderStatus[]> = {
  PAID: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<OrderStatus | "">("");
  const [openId, setOpenId] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.admin.orders(filter || undefined).then(setOrders);
  }, [filter]);

  async function changeStatus(order: Order, status: OrderStatus) {
    if (status === "CANCELLED" && !window.confirm(`Annuler la commande #${order.id} ? Le stock sera restauré.`)) return;
    setError("");
    try {
      const updated = await api.admin.setOrderStatus(order.id, status);
      setOrders(orders.map((o) => (o.id === order.id ? { ...o, status: updated.status } : o)));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur inattendue");
    }
  }

  return (
    <section>
      <div className="section-head">
        <h1>Commandes</h1>
        <div className="field field-inline">
          <label htmlFor="status-filter">Statut</label>
          <select id="status-filter" value={filter} onChange={(e) => setFilter(e.target.value as OrderStatus | "")}>
            <option value="">Tous</option>
            {(Object.keys(STATUS_LABELS) as OrderStatus[]).map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select>
        </div>
      </div>
      {error && <Alert>{error}</Alert>}
      <table className="table table-responsive">
        <thead>
          <tr>
            <th scope="col">N°</th>
            <th scope="col">Date</th>
            <th scope="col">Client</th>
            <th scope="col">Total</th>
            <th scope="col">Statut</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <Fragment key={o.id}>
              <tr>
                <td data-label="N°">
                  <button type="button" className="link-button" aria-expanded={openId === o.id}
                    onClick={() => setOpenId(openId === o.id ? null : o.id)}>
                    #{o.id}
                  </button>
                </td>
                <td data-label="Date">{formatDate(o.createdAt)}</td>
                <td data-label="Client">{o.user ? `${o.user.firstName} ${o.user.lastName}` : <em className="muted">Compte supprimé</em>}</td>
                <td data-label="Total">{formatPrice(o.totalCents)}</td>
                <td data-label="Statut"><StatusTag status={o.status} /></td>
                <td data-label="Actions" className="actions">
                  {NEXT_STATUSES[o.status].map((s) => (
                    <button key={s} type="button" className={s === "CANCELLED" ? "link-button danger" : "link-button"}
                      onClick={() => changeStatus(o, s)}>
                      {s === "CANCELLED" ? "Annuler" : `Marquer ${STATUS_LABELS[s].toLowerCase()}`}
                    </button>
                  ))}
                </td>
              </tr>
              {openId === o.id && (
                <tr>
                  <td className="row-detail" colSpan={6}><OrderDetail order={o} /></td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </section>
  );
}
