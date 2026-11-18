import { useState } from "react";
import { Link } from "react-router-dom";
import type { Product } from "../api/types";
import { formatPrice } from "../lib/format";
import { swatch } from "../lib/colors";
import { imageFor, productColors } from "../lib/images";

export function ProductCard({ product }: { product: Product }) {
  const colors = productColors(product);
  const [color, setColor] = useState(colors[0]);
  const inStock = product.variants.some((v) => v.stock > 0);
  const href = `/produit/${product.slug}${color && colors.length > 1 ? `?couleur=${encodeURIComponent(color)}` : ""}`;

  return (
    <article className="product-card">
      <Link to={href}>
        <div className="product-card-image">
          <img key={color} src={imageFor(product, color)} alt="" loading="lazy" width={600} height={800} />
          {!inStock && <span className="tag tag-muted">Épuisé</span>}
          <span className="product-card-cta" aria-hidden="true">Voir le produit</span>
        </div>
        <div className="product-card-body">
          <h3>{product.name}</h3>
          <span className="price">{formatPrice(product.priceCents)}</span>
        </div>
      </Link>
      <div className="product-card-meta">
        <div className="swatches" role="group" aria-label={`${colors.length} coloris`}>
          {colors.map((c) => (
            <button
              key={c}
              type="button"
              className={c === color ? "swatch swatch-button active" : "swatch swatch-button"}
              style={{ background: swatch(c) }}
              aria-label={`Voir en ${c}`}
              aria-pressed={c === color}
              title={c}
              onClick={() => setColor(c)}
            />
          ))}
        </div>
        <span className="muted small">{product.category.name}</span>
      </div>
    </article>
  );
}

/** Carte fantôme affichée pendant le chargement des produits. */
export function ProductCardSkeleton() {
  return (
    <div className="skeleton-card" aria-hidden="true">
      <div className="skeleton skeleton-image" />
      <div className="skeleton skeleton-line" />
      <div className="skeleton skeleton-line short" />
    </div>
  );
}

export function ProductGridSkeleton({ count }: { count: number }) {
  return (
    <div className="product-grid" role="status" aria-label="Chargement des produits">
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
