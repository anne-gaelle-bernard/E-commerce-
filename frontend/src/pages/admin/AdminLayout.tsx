import { useEffect, useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { api } from "../../api/client";
import type { AdminStats } from "../../api/types";
import { STATUS_LABELS, formatPrice } from "../../lib/format";

export function AdminLayout() {
  return (
    <div className="admin">
      <nav aria-label="Administration" className="admin-nav">
        <NavLink to="/admin" end>Tableau de bord</NavLink>
        <NavLink to="/admin/produits">Produits</NavLink>
        <NavLink to="/admin/categories">Catégories</NavLink>
        <NavLink to="/admin/commandes">Commandes</NavLink>
      </nav>
      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
}

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    api.admin.stats().then(setStats);
  }, []);

  if (!stats) return <p className="muted">Chargement…</p>;

  return (
    <section>
      <h1>Tableau de bord</h1>
      <div className="stats">
        <div className="stat">
          <span className="stat-value">{formatPrice(stats.revenueCents)}</span>
          <span className="stat-label">Chiffre d'affaires (hors annulations)</span>
        </div>
        <div className="stat">
          <span className="stat-value">{stats.customers}</span>
          <span className="stat-label">Clients inscrits</span>
        </div>
        {(Object.keys(STATUS_LABELS) as (keyof typeof STATUS_LABELS)[]).map((s) => (
          <div className="stat" key={s}>
            <span className="stat-value">{stats.ordersByStatus[s] ?? 0}</span>
            <span className="stat-label">Commandes {STATUS_LABELS[s].toLowerCase()}s</span>
          </div>
        ))}
      </div>

      <h2>Stocks faibles</h2>
      {stats.lowStock.length === 0 ? (
        <p>Aucune déclinaison en stock faible.</p>
      ) : (
        <table className="table">
          <thead>
            <tr><th scope="col">Produit</th><th scope="col">Déclinaison</th><th scope="col">Stock</th></tr>
          </thead>
          <tbody>
            {stats.lowStock.map((v) => (
              <tr key={v.id}>
                <td><Link to={`/admin/produits/${v.product.id}`}>{v.product.name}</Link></td>
                <td>{v.color} · {v.size}</td>
                <td className={v.stock === 0 ? "field-error" : "warning"}>{v.stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
