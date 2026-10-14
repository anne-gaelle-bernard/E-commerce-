import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import type { Category, Product } from "../api/types";
import { ProductCard } from "../components/ProductCard";

const photo = (id: string, w: number, h: number) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&q=80&auto=format`;

const COLLECTIONS = [
  { label: "Femme", to: "/catalogue?gender=FEMME", image: photo("1568125789396-c17c53160be5", 900, 1100), alt: "Femme en cardigan camel" },
  { label: "Homme", to: "/catalogue?gender=HOMME", image: photo("1787435906030-f52e34c2b440", 900, 1100), alt: "Homme en veste beige et chino olive" },
  { label: "Accessoires", to: "/catalogue?category=accessoires", image: photo("1787045098569-2e17ae871df4", 900, 1100), alt: "Homme portant une écharpe grise" },
];

const MARQUEE = ["Coton biologique", "Laine mérinos", "Lin lavé", "Fabriqué en Europe", "Livraison offerte dès 80 €", "Retours 14 jours"];

export function HomePage() {
  const [latest, setLatest] = useState<Product[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    api.products(new URLSearchParams({ sort: "newest", limit: "4" })).then((p) => {
      setLatest(p.items);
      setTotal(p.total);
    });
    api.categories().then(setCategories);
  }, []);

  return (
    <>
      <section className="hero">
        <div className="hero-text">
          <p className="pill">Nouvelle collection</p>
          <h1>Des basiques faits pour durer.</h1>
          <p className="hero-lead">Laine, lin et coton biologique. Des coupes simples, fabriquées en Europe.</p>
          <div className="hero-actions">
            <Link to="/catalogue?gender=FEMME" className="button">
              Shop femme
            </Link>
            <Link to="/catalogue?gender=HOMME" className="button button-secondary">
              Shop homme
            </Link>
          </div>
          <dl className="hero-stats">
            <div>
              <dt>Pièces</dt>
              <dd>{total ?? "–"}</dd>
            </div>
            <div>
              <dt>Matières naturelles</dt>
              <dd>100 %</dd>
            </div>
            <div>
              <dt>Retours</dt>
              <dd>14 j</dd>
            </div>
          </dl>
        </div>
        <div className="hero-media">
          <img src={photo("1633821879282-0c4e91f96232", 1000, 1250)} alt="Mannequin portant un trench beige" width={1000} height={1250} />
          <Link to="/produit/trench-impermeable" className="hero-tag">
            <span>Trench imperméable</span>
            <strong>189 €</strong>
          </Link>
        </div>
      </section>

      <div className="marquee full-bleed" aria-hidden="true">
        <div className="marquee-track">
          {[...MARQUEE, ...MARQUEE].map((item, i) => (
            <span key={i}>{item}</span>
          ))}
        </div>
      </div>

      <section aria-label="Collections" className="collections">
        {COLLECTIONS.map((c) => (
          <Link key={c.label} to={c.to} className="collection-tile">
            <img src={c.image} alt={c.alt} loading="lazy" width={900} height={1100} />
            <span className="collection-label">
              {c.label} <span aria-hidden="true">→</span>
            </span>
          </Link>
        ))}
      </section>

      <section aria-labelledby="latest-title" className="home-section">
        <div className="section-head">
          <h2 id="latest-title">Nouveautés</h2>
          <Link to="/catalogue" className="pill-link">
            Tout voir →
          </Link>
        </div>
        <div className="product-grid">
          {latest.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section aria-labelledby="categories-title" className="home-section">
        <div className="section-head">
          <h2 id="categories-title">Par catégorie</h2>
          <Link to="/catalogue" className="pill-link">
            Tout voir →
          </Link>
        </div>
        <ul className="category-grid">
          {categories.map((c) => (
            <li key={c.id}>
              <Link to={`/catalogue?category=${c.slug}`} className="category-tile">
                {c.imageUrl && <img src={c.imageUrl} alt="" loading="lazy" width={600} height={800} />}
                <span className="category-tile-label">
                  {c.name}
                  <span className="chip-count">{c._count?.products ?? 0}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="commitments" aria-label="Nos engagements">
        <div>
          <span className="commitment-number">01</span>
          <h3>Matières naturelles</h3>
          <p>Coton biologique, laine mérinos, lin lavé.</p>
        </div>
        <div>
          <span className="commitment-number">02</span>
          <h3>Livraison offerte</h3>
          <p>Dès 80 € d'achat, en 2 à 4 jours ouvrés.</p>
        </div>
        <div>
          <span className="commitment-number">03</span>
          <h3>Retours 14 jours</h3>
          <p>Un article ne convient pas ? Il nous revient gratuitement.</p>
        </div>
      </section>
    </>
  );
}
