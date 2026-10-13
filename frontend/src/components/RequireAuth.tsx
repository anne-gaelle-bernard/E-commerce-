import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// confort d'affichage seulement, les droits sont vérifiés par l'API
export function RequireAuth({ children, admin = false }: { children: ReactNode; admin?: boolean }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <p className="muted">Chargement…</p>;
  if (!user) return <Navigate to="/connexion" replace state={{ from: location.pathname + location.search }} />;
  if (admin && user.role !== "ADMIN") return <Navigate to="/" replace />;
  return <>{children}</>;
}
