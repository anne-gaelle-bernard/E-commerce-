import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import type { Category, Product } from "../api/types";
import { ProductCard, ProductGridSkeleton } from "../components/ProductCard";

const photo = (id: string, w: number, h: number) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&q=80&auto=format`;

const STEPS = [
  { title: "Laine mérinos", text: "Chaude, respirante, sans traitement irritant." },
  { title: "Lin lavé", text: "Frais et léger, plus doux à chaque lavage." },
  { title: "Coton biologique", text: "Cultivé sans pesticides de synthèse." },
];

const LOOKBOOK = [
  { id: "1516762689617-e1cffcef479d", caption: "Le cardigan du dimanche", alt: "Cardigan gris, jean et bottines beiges posés à plat", to: "/catalogue?gender=FEMME" },
  { id: "1551232864-3f0890e580d9", caption: "Vestes de mi-saison", alt: "Portant de vestes en jean, laine et coton", to: "/catalogue" },
  { id: "1605389170783-bcb01d8a57dc", caption: "Tons kaki et sable", alt: "Femme en chemise kaki assise près d'une chaise en bois", to: "/catalogue?gender=FEMME" },
  { id: "1558769132-cb1aea458c5e", caption: "Mailles naturelles", alt: "Pulls et gilets écrus suspendus à côté d'herbes de la pampa", to: "/catalogue" },
  { id: "1713881587420-113c1c43e28a", caption: "Le lin, tout l'été", alt: "Chemise en lin blanche suspendue à une branche", to: "/catalogue?gender=HOMME" },
  { id: "1602706294170-1fed8eecd9f9", caption: "Pulls à superposer", alt: "Pulls en maille écrue, beige et moutarde empilés", to: "/catalogue" },
];

const COMMITMENTS = [
  { title: "Livraison offerte", text: "Dès 80 € d'achat, en 2 à 4 jours ouvrés." },
  { title: "Retours 14 jours", text: "Un article ne convient pas ? Il nous revient gratuitement." },
  { title: "Fabriqué en Europe", text: "Des ateliers au Portugal, en Italie et en France." },
];

const TICKER_TOP = ["Maison Lune habille un quotidien simple et assuré", "Des matières naturelles qui durent"];
const TICKER_BOTTOM = ["Coton biologique", "Laine mérinos", "Lin lavé", "Livraison offerte dès 80 €", "Retours 14 jours"];

function Arrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M7 17 17 7M8 7h9v9" />
    </svg>
  );
}

export function HomePage() {
  const [latest, setLatest] = useState<Product[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const drops = useRef<HTMLUListElement>(null);

  useEffect(() => {
    api.products(new URLSearchParams({ sort: "newest", limit: "4" })).then((p) => {
      setLatest(p.items);
      setTotal(p.total);
    });
    api.categories().then(setCategories);
  }, []);

  const scrollDrops = (direction: 1 | -1) => {
    const list = drops.current;
    if (list) list.scrollBy({ left: direction * list.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <>
      <section className="sky-hero full-bleed">
        <div className="clouds" aria-hidden="true" />
        <div className="container sky-hero-inner">
          <h1 className="sky-hero-title">
            Hiver <span aria-hidden="true">×</span>
            <span className="visually-hidden">et</span> laine
          </h1>
          <div className="sky-hero-stage">
            <Link to="/catalogue?gender=FEMME" className="sky-hero-side">
              Femme <Arrow />
            </Link>
            <figure className="sky-hero-figure">
              <img src={photo("1633821879282-0c4e91f96232", 900, 1100)} alt="Mannequin portant un trench beige" width={900} height={1100} />
            </figure>
            <Link to="/catalogue?gender=HOMME" className="sky-hero-side sky-hero-side-right">
              Homme <Arrow />
            </Link>
            <Link to="/catalogue" className="button button-accent sky-hero-cta">
              Explorer la collection <Arrow />
            </Link>
          </div>
          <p className="sky-hero-lead">Laine, lin et coton biologique. Des coupes simples, fabriquées en Europe. Collection hiver 2026.</p>
        </div>
      </section>

      <div className="ticker full-bleed" aria-hidden="true">
        <div className="ticker-track ticker-top">
          {[...TICKER_TOP, ...TICKER_TOP, ...TICKER_TOP, ...TICKER_TOP].map((item, i) => (
            <span key={i}>{item}</span>
          ))}
        </div>
        <div className="ticker-track ticker-bottom">
          {[...TICKER_BOTTOM, ...TICKER_BOTTOM, ...TICKER_BOTTOM].map((item, i) => (
            <span key={i}>{item}</span>
          ))}
        </div>
      </div>

      <section className="sky-panel full-bleed" aria-labelledby="styles-title">
        <div className="clouds clouds-soft" aria-hidden="true" />
        <div className="container sky-panel-inner">
          <div className="sky-panel-head">
            <h2 id="styles-title">Trouvez<br />votre style</h2>
            <div className="sky-panel-aside">
              <p>Des catégories pensées pour chaque moment, chaque humeur et chaque saison.</p>
              <Link to="/catalogue" className="button button-accent">
                Tout le catalogue <Arrow />
              </Link>
            </div>
          </div>
          <ul className="style-grid">
            {categories.map((c) => (
              <li key={c.id}>
                <Link to={`/catalogue?category=${c.slug}`} className="style-card">
                  <span className="style-card-image">
                    {c.imageUrl && <img src={c.imageUrl} alt="" loading="lazy" width={600} height={600} />}
                  </span>
                  <span className="style-card-body">
                    <span className="style-card-name">{c.name}</span>
                    <span className="style-card-count">{c._count?.products ?? 0} pièces</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="latest-title" className="home-section">
        <div className="section-head">
          <h2 id="latest-title">Les nouveautés de la saison</h2>
          <Link to="/catalogue?sort=newest" className="pill-link">
            Tout voir <Arrow />
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

      <section className="curate" aria-labelledby="curate-title">
        <div className="curate-media">
          <img src={photo("1760013529817-f50db943ffe2", 900, 1100)} alt="Pile de pulls en laine posée sur un tabouret en bois" loading="lazy" width={900} height={1100} />
        </div>
        <div className="curate-body">
          <p className="curate-eyebrow">Notre démarche</p>
          <h2 id="curate-title">Comment nous choisissons vos pièces</h2>
          <p className="curate-lead">
            Des fibres naturelles, des ateliers européens et des coupes qui traversent les saisons. Chaque vêtement est
            pensé pour être porté longtemps, réparé et transmis.
          </p>
          <ol className="curate-steps">
            {STEPS.map((s, i) => (
              <li key={s.title}>
                <span className="curate-number">{String(i + 1).padStart(2, "0")}.</span>
                <strong>{s.title}</strong>
                <span>{s.text}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="drops-title" className="home-section drops">
        <div className="section-head">
          <h2 id="drops-title">Le vestiaire de la saison</h2>
          <div className="drops-controls">
            <button type="button" className="round-button" onClick={() => scrollDrops(-1)} aria-label="Images précédentes">
              ←
            </button>
            <button type="button" className="round-button" onClick={() => scrollDrops(1)} aria-label="Images suivantes">
              →
            </button>
          </div>
        </div>
        <ul className="drops-list" ref={drops}>
          {LOOKBOOK.map((l) => (
            <li key={l.id}>
              <Link to={l.to} className="drop-card">
                <img src={photo(l.id, 700, 900)} alt={l.alt} loading="lazy" width={700} height={900} />
                <span className="drop-caption">
                  <strong>{l.caption}</strong>
                  <span>Voir la sélection</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="drops-more">
          <Link to="/catalogue" className="pill-link">
            Découvrir toute la collection <Arrow />
          </Link>
        </div>
      </section>

      <section className="commitments" aria-label="Nos engagements">
        {COMMITMENTS.map((c, i) => (
          <div key={c.title} className="commitment">
            <span className="commitment-number">{String(i + 1).padStart(2, "0")}</span>
            <h3>{c.title}</h3>
            <p>{c.text}</p>
          </div>
        ))}
      </section>
    </>
  );
}
