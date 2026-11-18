---
name: design
description: Improve or review the visual design of the Maison Lune storefront (React + plain CSS in frontend/src/styles.css). Use whenever the user asks to make a page, component or the site look better, more modern, more premium, more consistent, or to fix spacing, typography, colors, layout, responsive or accessibility issues in the frontend; also before adding any new page or component UI.
---

# Maison Lune design skill

Maison Lune is a sustainable fashion shop (French UI, `lang="fr"`). The look is
**minimal editorial e-commerce**: white canvas, warm off-white surfaces, near-black
ink, one acid-lime accent, big tight display type, generous rounded corners, pill
shapes everywhere. Improve the design *within* this language — never bolt on a
second style.

## Where things live

- All styling: `frontend/src/styles.css` (single file, sectioned with `/* ... */` comments in French). No Tailwind, no CSS-in-JS, no UI library. Keep it that way.
- Pages: `frontend/src/pages/*.tsx`, admin in `pages/admin/`. Shared UI: `frontend/src/components/` (`Layout`, `ProductCard`, `FormField`).
- Fonts: `@fontsource-variable/inter` and `inter-tight` (imported in `main.tsx`). Don't add font families.
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
| `--accent` | `#dcfc5c` | **sparingly**: `.pill`, number tags, one highlight per view. Never text color on white (fails contrast). |
| `--success/-bg`, `--error/-bg`, `--warning` | | status only |
| `--radius` 14px / `--radius-lg` 24px / `999px` | | images & small cards / panels & tiles / buttons, chips, nav |
| `--font-display` / `--font-body` | Inter Tight / Inter | headings, prices, logo / everything else |
| `--ease` | `cubic-bezier(0.2,0.7,0.2,1)` | all transforms |

Rules:
- Never hard-code a color that a token already covers. If a new value is truly needed, add a token to `:root` first.
- Headings: display font, weight 600, `letter-spacing` negative (−0.02 to −0.05em), `line-height` ~1.0–1.15. Use `clamp()` for fluid sizes like the existing `h1`/`h2`.
- Body is 15px / 1.55. Small text ≥ 0.8rem. Keep line length ≤ ~70ch for paragraphs (`max-width: 36ch`–`65ch`).
- Spacing: rem steps of roughly 0.25 / 0.5 / 0.75 / 1 / 1.5 / 2 / 3 / 5. Section gaps `3rem`, grid gaps `1rem`, card padding `2rem`.
- Depth comes from `--soft` fills and radius, not shadows. At most a hairline shadow (`0 1px 3px rgba(0,0,0,.08)`) for a selected pill.
- Glass (`rgba(255,255,255,.85)` + `backdrop-filter: blur`) only for elements floating over images or the sticky header.

## Component vocabulary — reuse before inventing

Buttons `.button` (ink, primary), `.button-secondary` (outline), `.button-block`, `.button-danger`, `.link-button` ·
chips `.pill`, `.pill-link`, `.category-chip`, `.option` / `.option-selected`, `.badge` ·
containers `.container` (1360px, 24px gutter), `.card`, `.notice`, `.alert-error|success`, `.auth-form`, `.full-bleed` ·
text `.eyebrow`, `.muted`, `.small`, `.price`, `.price-large` ·
layout `.section-head`, `.product-grid`, `.catalog`, `.product-detail`, `.cart-layout`, `.hero`, `.collections`.

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
**Color** — mostly neutrals; accent used ≤ once per screen region; status colors only for status.
**Imagery** — product images keep `aspect-ratio: 3/4` (cards) or `4/5` (tiles), `object-fit: cover`, `--soft` background while loading, meaningful `alt` in French.
**States** — every interactive element has hover, `:focus-visible` (global ink outline exists — don't remove it), active, disabled; empty states, loading and errors are designed, not blank.
**Accessibility** — text contrast ≥ 4.5:1 (careful with `--muted` on `--soft` and anything on `--accent`); labels on all inputs (use `FormField`); `aria-invalid` for errors; motion wrapped by the existing `prefers-reduced-motion` blocks.
**E-commerce specifics** — clear add-to-cart, visible stock/size/color selection, reassurance near the CTA (delivery, returns, durability), cart total and checkout button always obvious, breadcrumb on product pages.

## Don'ts

- No new colors, fonts, shadows-heavy cards, gradients or emoji icons unless the user asks for a new direction.
- No CSS frameworks or component libraries.
- Don't translate UI copy to English; keep French and its typography (non-breaking space before `: ; ! ?`, `€` after the amount).
- Don't rename existing classes used across pages without updating every usage (`grep` first).
