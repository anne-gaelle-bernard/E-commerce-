import { useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api/client";
import type { Category, ProductPage } from "../api/types";
import { ProductCard } from "../components/ProductCard";

const photo = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=1400&h=800&fit=crop&crop=faces,center&q=80&auto=format`;

const COLLECTIONS = {
  FEMME: {
    title: "Femme",
    text: "Mailles douces, lin fluide et pièces à superposer, de la marinière au trench.",
    image: photo("1564430362299-113976f94001"),
    alt: "Femme portant une marinière",
  },
  HOMME: {
    title: "Homme",
    text: "Des basiques robustes : laine, denim brut et coton épais, faits pour durer.",
    image: photo("1619603364937-8d7af41ef206"),
    alt: "Homme portant un manteau camel",
  },
  ALL: {
    title: "Tout voir",
    text: "Toute la collection femme et homme, des t-shirts aux accessoires.",
    image: photo("1577660002965-04865592fc60"),
    alt: "Femme portant une veste en jean",
  },
};

export function CatalogPage() {
  const [params, setParams] = useSearchParams();
  const [result, setResult] = useState<ProductPage | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState<{ sizes: string[]; colors: string[] }>({ sizes: [], colors: [] });
  const [search, setSearch] = useState(params.get("search") ?? "");
  const [error, setError] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    api.categories().then(setCategories);
    api.productFilters().then(setFilters);
  }, []);

  useEffect(() => {
    setError("");
    api
      .products(params)
      .then(setResult)
      .catch(() => setError("Impossible de charger les produits."));
  }, [params]);

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page");
    setParams(next);
  }

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    setParam("search", search.trim());
  }

  const gender = params.get("gender");
  const collectionKey = gender === "FEMME" || gender === "HOMME" ? gender : "ALL";
  const collection = COLLECTIONS[collectionKey];
  const activeCategory = params.get("category") ?? "";
  const page = Number(params.get("page") ?? 1);

  return (
    <>
      <section className="collection-banner" aria-labelledby="catalog-title">
        <div className="collection-banner-text">
          <p className="pill">Collection</p>
          <h1 id="catalog-title">{collection.title}</h1>
          <p>{collection.text}</p>
        </div>
        <img src={collection.image} alt={collection.alt} width={1400} height={800} />
      </section>

      <nav aria-label="Catégories" className="category-tabs">
        <button type="button" className={activeCategory === "" ? "active" : undefined} aria-pressed={activeCategory === ""}
          onClick={() => setParam("category", "")}>
          Tout
        </button>
        {categories.map((cat) => (
          <button key={cat.id} type="button" className={activeCategory === cat.slug ? "active" : undefined}
            aria-pressed={activeCategory === cat.slug} onClick={() => setParam("category", cat.slug)}>
            {cat.name}
          </button>
        ))}
      </nav>

      <div className="catalog">
        <button type="button" className="button-secondary filters-toggle" aria-expanded={filtersOpen} aria-controls="filters"
          onClick={() => setFiltersOpen(!filtersOpen)}>
          {filtersOpen ? "Masquer les filtres" : "Filtres"}
        </button>
        <aside id="filters" className={filtersOpen ? "filters filters-open" : "filters"} aria-label="Filtres">
          <form role="search" onSubmit={handleSearch} className="field">
            <label htmlFor="search">Rechercher</label>
            <div className="inline-form">
              <input id="search" type="search" value={search} onChange={(e) => setSearch(e.target.value)} />
              <button type="submit">OK</button>
            </div>
          </form>

          <div className="field">
            <label htmlFor="size">Taille disponible</label>
            <select id="size" value={params.get("size") ?? ""} onChange={(e) => setParam("size", e.target.value)}>
              <option value="">Toutes</option>
              {filters.sizes.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="color">Couleur</label>
            <select id="color" value={params.get("color") ?? ""} onChange={(e) => setParam("color", e.target.value)}>
              <option value="">Toutes</option>
              {filters.colors.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="maxPrice">Prix maximum</label>
            <select id="maxPrice" value={params.get("maxPrice") ?? ""} onChange={(e) => setParam("maxPrice", e.target.value)}>
              <option value="">Indifférent</option>
              <option value="3000">30 €</option>
              <option value="6000">60 €</option>
              <option value="10000">100 €</option>
              <option value="15000">150 €</option>
            </select>
          </div>

          <button type="button" className="button-secondary" onClick={() => { setSearch(""); setParams(gender ? { gender } : {}); }}>
            Réinitialiser
          </button>
        </aside>

        <section className="catalog-results" aria-label="Produits">
          <div className="results-head">
            <p className="muted" aria-live="polite">{result ? `${result.total} produit(s)` : ""}</p>
            <div className="field field-inline">
              <label htmlFor="sort">Trier par</label>
              <select id="sort" value={params.get("sort") ?? "newest"} onChange={(e) => setParam("sort", e.target.value)}>
                <option value="newest">Nouveautés</option>
                <option value="price_asc">Prix croissant</option>
                <option value="price_desc">Prix décroissant</option>
                <option value="name">Nom</option>
              </select>
            </div>
          </div>

          {error && <p className="field-error">{error}</p>}
          {result && (
            <>
              <div className="product-grid">
                {result.items.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
              {result.pages > 1 && (
                <nav className="pagination" aria-label="Pagination">
                  <button type="button" disabled={page <= 1} onClick={() => setParam("page", String(page - 1))}>
                    ← Précédent
                  </button>
                  <span>
                    Page {result.page} / {result.pages}
                  </span>
                  <button type="button" disabled={page >= result.pages} onClick={() => setParam("page", String(page + 1))}>
                    Suivant →
                  </button>
                </nav>
              )}
            </>
          )}
        </section>
      </div>
    </>
  );
}
