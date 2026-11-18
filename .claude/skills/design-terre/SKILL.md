---
name: design-terre
description: "Naturel & terreux" visual direction for the Maison Lune storefront — warm linen backgrounds, terracotta and sage accents, a soft serif display font, organic textures. Use only when the user explicitly asks for the new / natural / earthy / "terre" direction, wants to restyle the site toward it, or invokes /design-terre. For routine design work in the current style, use the `design` skill instead.
---

# Maison Lune — direction « Naturel & terreux »

An alternative art direction for Maison Lune, the sustainable fashion shop
(French UI, `lang="fr"`). Where the current `design` skill is minimal editorial
(white, near-black, acid lime), this one tells the brand's story: **natural
materials, slow fashion, warmth**. Think linen, raw clay, dried herbs, unbleached
cotton — calm, tactile, a little handmade, never rustic or kitsch.

Same architecture as the `design` skill: plain CSS in `frontend/src/styles.css`,
React components, no framework. Read that skill's "Where things live" and
"Component vocabulary" sections — class names stay the same; only their look
changes. **Never mix the two directions on one page.**

## Personality

| Keep | Avoid |
|---|---|
| Warm off-whites, earth tones, one terracotta call-to-action | Pure white `#fff` canvases, pure black, neon/acid colors |
| Soft serif headings, generous leading | Tight, heavy, all-caps display type |
| Organic radii, hairline borders in sand | Hard shadows, glossy gradients, glassmorphism everywhere |
| Photos of fabric, hands, plants, natural light | Studio-white cut-outs, stock "lifestyle" clichés |
| Quiet copy about materials and care | Urgency ("Vite !", countdowns), heavy promo badges |

## Design tokens

Replace the `:root` block of `styles.css` with these values (same token names,
so existing classes keep working), then add the new ones.

| Token | Value | Use |
|---|---|---|
| `--bg` | `#faf6ef` | page background (linen) |
| `--surface` | `#fffdf9` | inputs, cards on `--soft`, popovers |
| `--soft` | `#f1e8da` | panels, filters, footer, hover fills (sand) |
| `--ink` | `#2b2118` | headings, primary text on light, dark buttons (espresso) |
| `--text` | `#3b3026` | body copy |
| `--muted` | `#6f5f4f` | secondary text, labels, eyebrows |
| `--line` | `#e2d6c4` | borders, dividers |
| `--accent` | `#a8492a` | **terracotta**: primary button fill, links on hover, one highlight per view |
| `--accent-hover` *(new)* | `#8f3c21` | primary button hover/active |
| `--sage` *(new)* | `#5f6f50` | secondary accent: eco labels, "en stock", icons |
| `--sage-bg` *(new)* | `#e4e8da` | background of sustainability badges / notices |
| `--success`, `--error`, `--warning` (+ `-bg`) | keep current values | status only |
| `--radius` | `12px` | images, small cards |
| `--radius-lg` | `28px` | panels, hero, tiles |
| pill radius | `999px` | buttons, chips |
| `--font-display` | `"Fraunces Variable", Georgia, serif` | headings, prices, logo |
| `--font-body` | `"Manrope Variable", system-ui, sans-serif` | everything else |
| `--ease` | `cubic-bezier(0.25, 0.8, 0.25, 1)` | all transitions (slightly softer) |

Measured contrast (WCAG AA needs 4.5:1 for body text):
text/bg 11.9 · muted/bg 5.7 · muted/soft 5.05 · white/accent 5.75 · accent/bg 5.3 ·
accent/soft 4.7 · sage/bg 5.0 · ink/sage-bg 12.6.
⚠ `--sage` on `--sage-bg` is only 4.35 → text on `--sage-bg` must be `--ink`;
use `--sage` there only for icons or ≥ 18px bold text.

### Fonts

```bash
cd frontend
npm install @fontsource-variable/fraunces @fontsource-variable/manrope
```

Import them in `main.tsx` in place of the Inter imports. Fraunces: use the
`"SOFT" 100, "WONK" 0` variation (`font-variation-settings`) for a softer serif;
weight 400–500 for headings (never 700+). Manrope 400 body, 600 for labels and buttons.

## Typography

- `h1`: Fraunces 400, `clamp(2.4rem, 5vw, 4.25rem)`, `line-height: 1.05`, `letter-spacing: -0.015em`. Italic allowed for **one** emphasised word (`<em>`), e.g. « Des pièces *faites pour durer* ».
- `h2`: Fraunces 400, `clamp(1.7rem, 3vw, 2.5rem)`, `line-height: 1.15`.
- `h3`, card titles: Manrope 600, 1rem–1.1rem, no negative tracking.
- Body: Manrope 16px / 1.65 (a bit airier than today). Paragraphs ≤ 62ch.
- `.eyebrow`: Manrope 600, 0.75rem, `letter-spacing: 0.12em`, uppercase, `--sage` color. The only uppercase text on the site.
- Prices: Fraunces 500, tabular figures (`font-variant-numeric: tabular-nums`), `--ink`.

## Components

- **Primary button** `.button`: `--accent` fill, white text, pill radius, 0.85rem × 1.6rem padding; hover `--accent-hover` + `translateY(-1px)`. One per section.
- **Secondary** `.button-secondary`: transparent, 1px `--ink` border, `--ink` text; hover `--soft` fill.
- **Cards / product cards**: no border, `--soft` image background, `--radius`; title Manrope, price Fraunces. Hover: image `scale(1.03)` over 600ms, no shadow.
- **Panels** (hero, filters, cart summary, footer): `--soft` on `--bg`, `--radius-lg`. Nested items use `--surface`.
- **Chips / filters** `.category-chip`, `.option`: 1px `--line` border on `--surface`; selected = `--ink` fill + `--bg` text.
- **Eco badge** *(new, `.badge-eco`)*: `--sage-bg` fill, `--ink` text, small leaf/thread icon in `--sage`; for "Coton bio", "Lin français", "Fabriqué au Portugal".
- **Inputs**: `--surface`, 1px `--line`, `--radius` 12px; focus ring `2px solid var(--accent)` with `outline-offset: 2px`.
- **Header**: `--bg` at 92% opacity + blur only once scrolled; logo in Fraunces italic.
- **Dividers**: hairline `--line`; between home sections you may use a subtle hand-drawn wave SVG in `--line` (inline, decorative, `aria-hidden="true"`).

## Texture & imagery

- Optional paper grain: a tiny inline SVG `feTurbulence` noise as `body::before` at 3–4% opacity, `pointer-events: none`. Disable under `prefers-reduced-transparency` / if it hurts performance.
- Photos: warm, natural light; keep `aspect-ratio: 3/4` (cards) / `4/5` (tiles), `object-fit: cover`. Unsplash queries: "linen clothing natural light", "knitwear flat lay beige", "hands fabric texture".
- Icons: thin line (1.5px stroke), rounded caps, `currentColor`. No emoji.

## Layout & spacing

Same spacing scale and breakpoints as the `design` skill (1000/900/800/700px),
but **more air**: section gaps `5rem` desktop / `3rem` mobile, card padding
`2.25rem`, grid gaps `1.25rem`. Allow asymmetric editorial layouts on the home
page (image 7 cols / text 5 cols, overlapping caption on `--surface`).

## Motion

Slow and soft: 300–600ms with `--ease`, fades and 4–8px rises only. Everything
inside the existing `prefers-reduced-motion` blocks.

## Applying the direction — workflow

1. Confirm with the user that the whole site should switch (it's a global restyle).
2. Install the fonts, swap imports in `main.tsx`.
3. Replace `:root` tokens; add `--accent-hover`, `--sage`, `--sage-bg`.
4. Search `styles.css` for every use of `--accent`: today it is a lime *background* with dark text — with terracotta it becomes a fill with **white** text. Fix each one (`grep -n "accent" frontend/src/styles.css`).
5. Update typography rules (`h1`, `h2`, `.eyebrow`, `.price`, logo), then buttons, chips, inputs, cards, panels.
6. Run the site (`npm run dev` in `backend/` and `frontend/`) and check home, catalogue, product, cart, checkout, account and admin at 1360px, ~900px and 375px.
7. `npm run build` and `npm test` in `frontend/` must pass.
8. Update the `design` skill (or tell the user) so only one direction is the reference afterwards.

## Review checklist (in addition to the `design` skill's)

- Warm throughout: no `#fff` page areas, no `#000` text left over.
- Terracotta appears at most once per screen region, sage only for eco/stock signals.
- Serif only for headings, prices and logo; never for body, labels or buttons.
- Every text color pair is in the measured contrast list above or re-checked.
- Copy stays French, calm and factual about materials (« Lin lavé, tissé en France »).
