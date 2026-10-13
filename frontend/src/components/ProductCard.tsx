import { Link } from "react-router-dom";
import type { Product } from "../api/types";
import { formatPrice } from "../lib/format";
import { swatch } from "../lib/colors";

export function ProductCard({ product }: { product: Product }) {
  const inStock = product.variants.some((v) => v.stock > 0);
  const colors = [...new Set(product.variants.map((v) => v.color))];

  return (
    <article className="product-card">
      <Link to={`/produit/${product.slug}`}>
        <div className="product-card-image">
          <img src={product.imageUrl} alt="" loading="lazy" width={600} height={800} />
          {!inStock && <span className="tag tag-muted">Épuisé</span>}
          <span className="product-card-cta" aria-hidden="true">Voir le produit</span>
        </div>
        <div className="product-card-body">
          <h3>{product.name}</h3>
          <span className="price">{formatPrice(product.priceCents)}</span>
        </div>
      </Link>
      <p className="product-card-meta">
        <span className="swatches" aria-label={`${colors.length} coloris : ${colors.join(", ")}`}>
          {colors.map((c) => (
            <span key={c} className="swatch" style={{ background: swatch(c) }} title={c} />
          ))}
        </span>
        <span className="muted small">{product.category.name}</span>
      </p>
    </article>
  );
}
