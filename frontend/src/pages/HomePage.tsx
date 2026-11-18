import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import type { Category, Product } from "../api/types";
import { ProductCard, ProductGridSkeleton } from "../components/ProductCard";

const photo = (id: string, w: number, h: number) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&q=80&auto=format`;

const COLLECTIONS = [
  { label: "Femme", to: "/catalogue?gender=FEMME", image: photo("1568125789396-c17c53160be5", 900, 1100), alt: "Femme en cardigan camel" },
  { label: "Homme", to: "/catalogue?gender=HOMME", image: photo("1787435906030-f52e34c2b440", 900, 1100), alt: "Homme en veste beige et chino olive" },
  { label: "Accessoires", to: "/catalogue?category=accessoires", image: photo("1787045098569-2e17ae871df4", 900, 1100), alt: "Homme portant une écharpe grise" },
];

const COMMITMENTS = [
  { title: "Matières naturelles", text: "Coton biologique, laine mérinos, lin lavé.", image: "1760013531865-89ff324f83a6" },
  { title: "Livraison offerte", text: "Dès 80 € d'achat, en 2 à 4 jours ouvrés.", image: "1517677208171-0bc6725a3e60" },
  { title: "Retours 14 jours", text: "Un article ne convient pas ? Il nous revient gratuitement.", image: "1641642231157-0849081598a2" },
];

const LOOKBOOK = [
  { id: "1516762689617-e1cffcef479d", caption: "Le cardigan du dimanche", alt: "Cardigan gris, jean et bottines beiges posés à plat", to: "/catalogue?gender=FEMME" },
  { id: "1551232864-3f0890e580d9", caption: "Vestes de mi-saison", alt: "Portant de vestes en jean, laine et coton", to: "/catalogue" },
  { id: "1605389170783-bcb01d8a57dc", caption: "Tons kaki et sable", alt: "Femme en chemise kaki assise près d'une chaise en bois", to: "/catalogue?gender=FEMME" },
  { id: "1558769132-cb1aea458c5e", caption: "Mailles naturelles", alt: "Pulls et gilets écrus suspendus à côté d'herbes de la pampa", to: "/catalogue" },
  { id: "1713881587420-113c1c43e28a", caption: "Le lin, tout l'été", alt: "Chemise en lin blanche suspendue à une branche", to: "/catalogue?gender=HOMME" },
  { id: "1602706294170-1fed8eecd9f9", caption: "Pulls à superposer", alt: "Pulls en maille écrue, beige et moutarde empilés", to: "/catalogue" },
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
        {total === null ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <div className="product-grid">
            {latest.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
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

      <section aria-labelledby="lookbook-title" className="home-section">
        <div className="section-head">
          <h2 id="lookbook-title">Le vestiaire</h2>
          <p className="muted section-lead">Des pièces simples qui se combinent entre elles, saison après saison.</p>
        </div>
        <ul className="lookbook">
          {LOOKBOOK.map((l) => (
            <li key={l.id}>
              <Link to={l.to} className="lookbook-item">
                <img src={photo(l.id, 800, 1000)} alt={l.alt} loading="lazy" width={800} height={1000} />
                <span className="lookbook-caption">{l.caption}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="story" aria-labelledby="story-title">
        <div className="story-media">
          <img src={photo("1760013529817-f50db943ffe2", 1100, 1300)} alt="Pile de pulls en laine posée sur un tabouret en bois" loading="lazy" width={1100} height={1300} />
        </div>
        <div className="story-text">
          <p className="eyebrow">Notre démarche</p>
          <h2 id="story-title">Moins de pièces, mais des pièces qui durent.</h2>
          <p className="story-lead">
            Nous choisissons des fibres naturelles et des ateliers européens, puis nous dessinons des coupes simples qui
            traversent les saisons. Chaque vêtement est pensé pour être porté longtemps, réparé et transmis.
          </p>
          <ul className="story-list">
            <li>
              <strong>Laine mérinos</strong>
              <span>Chaude, respirante, sans traitement irritant</span>
            </li>
            <li>
              <strong>Lin lavé</strong>
              <span>Frais et léger, plus doux à chaque lavage</span>
            </li>
            <li>
              <strong>Coton biologique</strong>
              <span>Cultivé sans pesticides de synthèse, doux pour la peau</span>
            </li>
          </ul>
          <Link to="/catalogue" className="button">
            Découvrir la collection
          </Link>
        </div>
      </section>

      <section className="commitments" aria-label="Nos engagements">
        {COMMITMENTS.map((c, i) => (
          <div key={c.title} className="commitment">
            <div className="commitment-media">
              <img src={photo(c.image, 800, 600)} alt="" loading="lazy" width={800} height={600} />
              <span className="commitment-number">{String(i + 1).padStart(2, "0")}</span>
            </div>
            <div className="commitment-body">
              <h3>{c.title}</h3>
              <p>{c.text}</p>
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
