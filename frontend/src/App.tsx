import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { RequireAuth } from "./components/RequireAuth";
import { HomePage } from "./pages/HomePage";
import { CatalogPage } from "./pages/CatalogPage";
import { ProductPage } from "./pages/ProductPage";
import { CartPage } from "./pages/CartPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { OrderPage, OrdersPage } from "./pages/OrderPages";
import { LoginPage, RegisterPage } from "./pages/AuthPages";
import { AccountPage } from "./pages/AccountPage";
import { LegalNoticePage, NotFoundPage, PrivacyPage, TermsPage } from "./pages/StaticPages";
import { AdminDashboard, AdminLayout } from "./pages/admin/AdminLayout";
import { AdminProductForm, AdminProducts } from "./pages/admin/AdminProducts";
import { AdminOrders } from "./pages/admin/AdminOrders";
import { AdminCategories } from "./pages/admin/AdminCategories";

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="catalogue" element={<CatalogPage />} />
        <Route path="produit/:slug" element={<ProductPage />} />
        <Route path="connexion" element={<LoginPage />} />
        <Route path="inscription" element={<RegisterPage />} />
        <Route path="mentions-legales" element={<LegalNoticePage />} />
        <Route path="cgv" element={<TermsPage />} />
        <Route path="confidentialite" element={<PrivacyPage />} />

        <Route path="panier" element={<RequireAuth><CartPage /></RequireAuth>} />
        <Route path="commande" element={<RequireAuth><CheckoutPage /></RequireAuth>} />
        <Route path="compte" element={<RequireAuth><AccountPage /></RequireAuth>} />
        <Route path="compte/commandes" element={<RequireAuth><OrdersPage /></RequireAuth>} />
        <Route path="compte/commandes/:id" element={<RequireAuth><OrderPage /></RequireAuth>} />

        <Route path="admin" element={<RequireAuth admin><AdminLayout /></RequireAuth>}>
          <Route index element={<AdminDashboard />} />
          <Route path="produits" element={<AdminProducts />} />
          <Route path="produits/nouveau" element={<AdminProductForm />} />
          <Route path="produits/:id" element={<AdminProductForm />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="commandes" element={<AdminOrders />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
