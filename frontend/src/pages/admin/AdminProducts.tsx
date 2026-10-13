import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ApiError, api } from "../../api/client";
import type { Category, Gender, Product, ProductInput } from "../../api/types";
import { Alert, FormField } from "../../components/FormField";
import { GENDER_LABELS, formatPrice } from "../../lib/format";

export function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);

  async function load() {
    const params = new URLSearchParams({ includeInactive: "true", limit: "50", sort: "name" });
    setProducts((await api.products(params)).items);
  }

  useEffect(() => {
    load();
  }, []);

  async function archive(product: Product) {
    if (!window.confirm(`Retirer « ${product.name} » du catalogue ?`)) return;
    await api.admin.archiveProduct(product.id);
    await load();
  }

  return (
    <section>
      <div className="section-head">
        <h1>Produits</h1>
        <Link to="/admin/produits/nouveau" className="button">+ Nouveau produit</Link>
      </div>
      <table className="table table-responsive">
        <thead>
          <tr>
            <th scope="col">Nom</th>
            <th scope="col">Catégorie</th>
            <th scope="col">Prix</th>
            <th scope="col">Stock total</th>
            <th scope="col">Statut</th>
            <th scope="col"><span className="visually-hidden">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className={p.isActive ? "" : "row-muted"}>
              <td data-label="Produit">
                <span className="admin-product">
                  <img src={p.imageUrl} alt="" width={40} height={52} className="admin-thumb" />
                  {p.name}
                </span>
              </td>
              <td data-label="Catégorie">{p.category.name}</td>
              <td data-label="Prix">{formatPrice(p.priceCents)}</td>
              <td data-label="Stock total">{p.variants.reduce((s, v) => s + v.stock, 0)}</td>
              <td data-label="Statut"><span className={p.isActive ? "tag tag-delivered" : "tag"}>{p.isActive ? "En ligne" : "Archivé"}</span></td>
              <td data-label="Actions" className="actions">
                <Link to={`/admin/produits/${p.id}`}>Modifier</Link>
                {p.isActive && (
                  <button type="button" className="link-button" onClick={() => archive(p)}>Archiver</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

const EMPTY_PRODUCT: ProductInput = {
  name: "",
  description: "",
  priceCents: 0,
  imageUrl: "",
  gender: "UNISEXE",
  categoryId: 0,
  isActive: true,
  variants: [{ size: "M", color: "", stock: 0 }],
};

export function AdminProductForm() {
  const { id } = useParams();
  const isNew = id === undefined;
  const navigate = useNavigate();
  const [form, setForm] = useState<ProductInput>(EMPTY_PRODUCT);
  const [price, setPrice] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");

  useEffect(() => {
    api.categories().then((cats) => {
      setCategories(cats);
      if (isNew && cats[0]) setForm((f) => ({ ...f, categoryId: cats[0].id }));
    });
    if (!isNew) {
      api.admin
        .product(Number(id))
        .catch(() => {
          setError("Produit introuvable");
          return null;
        })
        .then((p) => {
        if (!p) return;
        setForm({
          name: p.name,
          description: p.description,
          priceCents: p.priceCents,
          imageUrl: p.imageUrl,
          gender: p.gender,
          categoryId: p.categoryId,
          isActive: p.isActive,
          variants: p.variants.map(({ size, color, stock }) => ({ size, color, stock })),
        });
        setPrice((p.priceCents / 100).toFixed(2));
      });
    }
  }, [id, isNew]);

  function setVariant(index: number, field: "size" | "color" | "stock", value: string) {
    const variants = form.variants.map((v, i) =>
      i === index ? { ...v, [field]: field === "stock" ? Number(value) : value } : v,
    );
    setForm({ ...form, variants });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setErrors({});
    const data = { ...form, priceCents: Math.round(Number(price.replace(",", ".")) * 100) };
    try {
      if (isNew) await api.admin.createProduct(data);
      else await api.admin.updateProduct(Number(id), data);
      navigate("/admin/produits");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        setErrors(Object.fromEntries(err.details.map((d) => [d.field, d.message])));
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="admin-form" noValidate>
      <h1>{isNew ? "Nouveau produit" : `Modifier « ${form.name} »`}</h1>
      {error && <Alert>{error}</Alert>}
      <FormField label="Nom" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={errors.name} />
      <div className="field">
        <label htmlFor="description">Description</label>
        <textarea id="description" rows={4} required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        {errors.description && <small className="field-error">{errors.description}</small>}
      </div>
      <div className="field-row">
        <FormField label="Prix (€)" inputMode="decimal" required value={price} onChange={(e) => setPrice(e.target.value)} error={errors.priceCents} />
        <div className="field">
          <label htmlFor="category">Catégorie</label>
          <select id="category" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: Number(e.target.value) })}>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="gender">Collection</label>
          <select id="gender" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value as Gender })}>
            {(Object.keys(GENDER_LABELS) as Gender[]).map((g) => <option key={g} value={g}>{GENDER_LABELS[g]}</option>)}
          </select>
        </div>
      </div>
      <FormField label="URL de l'image" type="url" required value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} error={errors.imageUrl} />
      <div className="checkbox">
        <input id="isActive" type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
        <label htmlFor="isActive">Visible dans le catalogue</label>
      </div>

      <fieldset>
        <legend>Déclinaisons (taille / couleur / stock)</legend>
        {errors.variants && <p className="field-error">{errors.variants}</p>}
        {form.variants.map((v, i) => (
          <div key={i} className="variant-row">
            <input aria-label={`Taille déclinaison ${i + 1}`} placeholder="Taille" value={v.size} onChange={(e) => setVariant(i, "size", e.target.value)} />
            <input aria-label={`Couleur déclinaison ${i + 1}`} placeholder="Couleur" value={v.color} onChange={(e) => setVariant(i, "color", e.target.value)} />
            <input aria-label={`Stock déclinaison ${i + 1}`} type="number" min={0} value={v.stock} onChange={(e) => setVariant(i, "stock", e.target.value)} />
            <button type="button" className="link-button" disabled={form.variants.length === 1}
              onClick={() => setForm({ ...form, variants: form.variants.filter((_, j) => j !== i) })}>
              Retirer
            </button>
          </div>
        ))}
        <button type="button" className="button-secondary"
          onClick={() => setForm({ ...form, variants: [...form.variants, { size: "", color: "", stock: 0 }] })}>
          + Ajouter une déclinaison
        </button>
      </fieldset>

      <div className="form-actions">
        <button type="submit" className="button">Enregistrer</button>
        <Link to="/admin/produits">Annuler</Link>
      </div>
    </form>
  );
}
