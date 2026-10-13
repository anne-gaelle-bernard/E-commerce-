import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ApiError, api } from "../api/client";
import type { Product } from "../api/types";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { Alert } from "../components/FormField";
import { GENDER_LABELS, formatPrice } from "../lib/format";
import { swatch } from "../lib/colors";

export function ProductPage() {
  const { slug = "" } = useParams();
  const { user } = useAuth();
  const { add } = useCart();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  useEffect(() => {
    setProduct(null);
    api
      .product(slug)
      .then((p) => {
        setProduct(p);
        setColor(p.variants.find((v) => v.stock > 0)?.color ?? p.variants[0]?.color ?? "");
        setSize("");
      })
      .catch(() => setNotFound(true));
  }, [slug]);

  const colors = useMemo(() => [...new Set(product?.variants.map((v) => v.color))], [product]);
  const sizesForColor = useMemo(() => product?.variants.filter((v) => v.color === color) ?? [], [product, color]);
  const selected = sizesForColor.find((v) => v.size === size);

  if (notFound) {
    return (
      <div>
        <h1>Produit introuvable</h1>
        <Link to="/catalogue">Retour au catalogue</Link>
      </div>
    );
  }
  if (!product) return <p className="muted">Chargement…</p>;

  async function handleAdd() {
    if (!selected) return;
    if (!user) {
      navigate("/connexion", { state: { from: `/produit/${slug}` } });
      return;
    }
    try {
      await add(selected.id, quantity);
      setMessage({ type: "success", text: "Article ajouté au panier." });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof ApiError ? err.message : "Erreur inattendue" });
    }
  }

  return (
    <div className="product-detail">
      <img src={product.imageUrl} alt={product.name} width={600} height={800} />
      <div>
        <nav aria-label="Fil d'Ariane" className="breadcrumb">
          <Link to="/catalogue">Catalogue</Link> /{" "}
          <Link to={`/catalogue?category=${product.category.slug}`}>{product.category.name}</Link>
        </nav>
        <h1>{product.name}</h1>
        <p className="price price-large">{formatPrice(product.priceCents)}</p>
        <p className="muted">{GENDER_LABELS[product.gender]}</p>
        <p>{product.description}</p>

        <fieldset>
          <legend>Couleur : {color}</legend>
          <div className="options">
            {colors.map((c) => (
              <button
                key={c}
                type="button"
                className={`option ${c === color ? "option-selected" : ""}`}
                aria-pressed={c === color}
                onClick={() => {
                  setColor(c);
                  setSize("");
                }}
              >
                <span className="swatch" style={{ background: swatch(c) }} aria-hidden="true" />
                {c}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend>Taille</legend>
          <div className="options">
            {sizesForColor.map((v) => (
              <button
                key={v.id}
                type="button"
                className={`option ${v.size === size ? "option-selected" : ""}`}
                aria-pressed={v.size === size}
                disabled={v.stock === 0}
                onClick={() => setSize(v.size)}
                aria-label={v.stock === 0 ? `${v.size} (épuisé)` : v.size}
              >
                {v.size}
              </button>
            ))}
          </div>
          {selected && selected.stock <= 3 && <p className="warning small">Plus que {selected.stock} en stock</p>}
        </fieldset>

        <div className="add-to-cart">
          <label htmlFor="quantity">Quantité</label>
          <select id="quantity" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))}>
            {Array.from({ length: Math.min(10, selected?.stock ?? 10) }, (_, i) => i + 1).map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
          <button type="button" className="button" disabled={!selected} onClick={handleAdd}>
            {selected ? "Ajouter au panier" : "Choisissez une taille"}
          </button>
        </div>
        {message && (
          <Alert type={message.type}>
            {message.text} {message.type === "success" && <Link to="/panier">Voir le panier</Link>}
          </Alert>
        )}
      </div>
    </div>
  );
}
