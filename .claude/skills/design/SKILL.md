---
name: design
description: Improve or review the visual design of the Maison Lune storefront (React + plain CSS in frontend/src/styles.css). Use whenever the user asks to make a page, component or the site look better, more modern, more premium, more consistent, or to fix spacing, typography, colors, layout, responsive or accessibility issues in the frontend; also before adding any new page or component UI.
---

# Maison Lune design skill

Maison Lune is a sustainable fashion shop (French UI, `lang="fr"`). The look is
**"sky poster" e-commerce**: full-bleed sky-blue sections with CSS clouds, an
acid citron-yellow accent, huge condensed all-caps display type (Anton), white
content sections with near-black ink, glassy cards on blue, outline buttons with
a ↗ arrow, 10px button corners. Improve the design *within* this language —
never bolt on a second style.

## Where things live

- All styling: `frontend/src/styles.css` (single file, sectioned with `/* ... */` comments in French). No Tailwind, no CSS-in-JS, no UI library. Keep it that way.
- Pages: `frontend/src/pages/*.tsx`, admin in `pages/admin/`. Shared UI: `frontend/src/components/` (`Layout`, `ProductCard`, `FormField`).
- Fonts: `@fontsource/anton` (poster titles), `@fontsource-variable/inter` (body) and `inter-tight` (prices, small display), imported in `main.tsx`. Don't add font families.
- Product colors/swatches: `frontend/src/lib/colors.ts`; images: `frontend/src/lib/images.ts`.

Read the relevant part of `styles.css` before editing — reuse existing classes first.

## Design tokens (source of truth: `:root` in styles.css)

| Token | Value | Use |
|---|---|---|
| `--bg` / `--surface` | `#fff` | page, inputs, inner chips |
| `--soft` | `#f3f3f1` | cards, hero panels, filters, footer, hover fills |
| `--ink` | `#0d0d0d` | headings, primary buttons, selected states |
| `--text` | `#1c1c1c` | body copy |
| `--muted` | `#6e6e6a` | secondary text, eyebrows, labels |
| `--line` | `#e7e7e3` | borders, dividers |
| `--accent` / `--accent-hover` | `#e9f53b` / `#dbe829` | citron: `.button-accent`, `.pill`, the numbered `.curate` panel, hero title on deep sky. Ink text on it (16:1). Never text color on white (1.2:1). |
| `--sky-deep` | `#0a6fae` | top of sky gradients, header `.on-sky`; the only blue that white text (≈5:1) or citron text (4.5:1) may sit on |
| `--sky` / `--sky-light` | `#29b3e6` / `#bfe8f8` | middle / bottom of sky gradients; **ink text only** (white 2.4:1, citron 2:1 fail) |
| `--glass` / `--glass-line` | white 20% / 75% | glass cards and side buttons over the sky |
| `--success/-bg`, `--error/-bg`, `--warning` | | status only |
| `--radius` 14px / `--radius-lg` 24px / 10px / `999px` | | images & small cards / panels & tiles / buttons & `.pill-link` / nav, chips, round buttons |
| `--font-poster` | Anton | `h1`, `h2`, logo, footer wordmark, ticker, card captions — always uppercase |
| `--font-display` / `--font-body` | Inter Tight / Inter | prices, `h3`, small display / everything else |
| `--ease` | `cubic-bezier(0.2,0.7,0.2,1)` | all transforms |

Rules:
- Never hard-code a color that a token already covers. If a new value is truly needed, add a token to `:root` first.
- `h1`/`h2` are global Anton, weight 400, uppercase, `letter-spacing: 0.005em`, `line-height` ~0.9–1. Never give them negative tracking (Anton collapses). Use `clamp()` for fluid sizes.
- Sky sections are `full-bleed` with a vertical gradient `--sky-deep → --sky → --sky-light`, `overflow: hidden; isolation: isolate`, and a `.clouds` layer (CSS radial gradients — CSP forbids external images other than Unsplash). Put light-colored text only in the deep top band.
- Body is 15px / 1.55. Small text ≥ 0.8rem. Keep line length ≤ ~70ch for paragraphs (`max-width: 36ch`–`65ch`).
- Spacing: rem steps of roughly 0.25 / 0.5 / 0.75 / 1 / 1.5 / 2 / 3 / 5. Section gaps `3rem`, grid gaps `1rem`, card padding `2rem`.
- Depth comes from `--soft` fills and radius, not shadows. At most a hairline shadow (`0 1px 3px rgba(0,0,0,.08)`) for a selected pill.
- Glass (`rgba(255,255,255,.85)` + `backdrop-filter: blur`) only for elements floating over images or the sticky header.

## Component vocabulary — reuse before inventing

Buttons `.button` (ink, primary on white), `.button-accent` (citron, primary on sky), `.button-secondary`, `.pill-link` (ink outline + ↗ `Arrow` icon, "Tout voir"), `.round-button` (carousel ← →), `.button-block`, `.button-danger`, `.link-button` ·
chips `.pill`, `.option` / `.option-selected`, `.badge` ·
containers `.container` (1360px, 24px gutter), `.card`, `.notice`, `.alert-error|success`, `.auth-form`, `.full-bleed` ·
text `.eyebrow`, `.muted`, `.small`, `.price`, `.price-large` ·
home `.sky-hero` (+ `.clouds`), `.ticker`, `.sky-panel` + `.style-card` (glass), `.curate` (citron numbered panel), `.drops-list` + `.drop-card` (carousel), `.commitments` ·
layout `.section-head`, `.product-grid`, `.catalog`, `.collection-banner`, `.product-detail`, `.cart-layout`.

Only one primary (`.button`) action per view section; others are secondary.

## Making a page look better — workflow

1. **Look first.** Read the page component and its CSS. If possible, run `npm run dev` in `frontend/` and check it at 1360px, ~900px and 375px.
2. **Diagnose** against the checklist below and list the 3–6 issues that matter most (hierarchy and spacing usually beat decoration).
3. **Fix with the system**: existing classes → new class in the right section of `styles.css` using tokens → never inline `style={{}}` except for truly dynamic values (e.g. swatch color).
4. **Responsive**: add rules to the existing breakpoints (`1000px`, `900px`, `800px`, `700px`) — don't create new ones without reason. Mobile: single column, 16–24px gutters, tap targets ≥ 44px, no horizontal scroll.
5. **Verify**: `npm run build` and `npm test` in `frontend/` must still pass (component tests in `components.test.tsx` query by role/text — don't break labels).
6. Summarize what changed and why, in terms of the user experience.

## Review checklist

**Hierarchy** — one clear H1 per page; eyebrow → title → lead → action order; price and CTA are the most visible things on product views.
**Spacing & alignment** — consistent rhythm from the scale; elements align to the container edge; no cramped groups or orphan gaps.
**Typography** — max two weights per block; no all-caps paragraphs; numbers in prices use the display font.
**Color** — white sections for shopping content, sky for brand moments (hero, category panel, banners); citron ≤ once per screen region; status colors only for status.
**Imagery** — product images keep `aspect-ratio: 3/4` (cards) or `4/5` (tiles), `object-fit: cover`, `--soft` background while loading, meaningful `alt` in French.
**States** — every interactive element has hover, `:focus-visible` (global ink outline exists — don't remove it), active, disabled; empty states, loading and errors are designed, not blank.
**Accessibility** — text contrast ≥ 4.5:1 (careful with `--muted` on `--soft` and anything on `--accent`); labels on all inputs (use `FormField`); `aria-invalid` for errors; motion wrapped by the existing `prefers-reduced-motion` blocks.
**E-commerce specifics** — clear add-to-cart, visible stock/size/color selection, reassurance near the CTA (delivery, returns, durability), cart total and checkout button always obvious, breadcrumb on product pages.

## Don'ts

- No new colors, fonts, shadow-heavy cards or emoji icons unless the user asks for a new direction. The only gradients are the sky ones and image caption scrims.
- Headless screenshots: Edge's headless window is at least ~496px wide — to check 375–390px, load the page in an iframe of that width.
- No CSS frameworks or component libraries.
- Don't translate UI copy to English; keep French and its typography (non-breaking space before `: ; ! ?`, `€` after the amount).
- Don't rename existing classes used across pages without updating every usage (`grep` first).
