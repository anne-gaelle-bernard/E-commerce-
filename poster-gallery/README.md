# Lamplight bookshop

An online bookshop where you browse the books in a 3D gallery. Each room is a
collection, and each book stands on a plinth with a label next to it. Click a
book to see its page and add it to your bag.

Built with Next.js, React Three Fiber, drei, GSAP, Zustand and Tailwind CSS.

## Run it

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## How visitors navigate

On the first visit a short guide explains the controls. It can be opened again
with the ? button at the bottom of the screen.

1. Walk through the gallery with the arrow buttons at the bottom of the screen,
   the mouse wheel, a swipe on a phone, or the arrow keys.
2. Click a room name in the bottom bar to go straight to that collection.
3. Point at a book to lift it, then click it to open its page.
4. Choose a format, set the quantity and click Add to bag.
5. Click Back to the gallery (or press Esc) to return to the same spot.
6. Open Shop in the menu to see every book in a simple list.

## Project structure

| What | Where |
|---|---|
| Hall shape and book positions | `src/lib/corridor.ts` |
| 3D scene, camera and controls | `src/components/gallery/Gallery3D.tsx` |
| A book on its plinth with its label | `src/components/gallery/BookMesh.tsx` |
| Room signs | `src/components/gallery/TitleCard.tsx` |
| Bottom bar (arrows, rooms, help) | `src/components/CollectionLabel.tsx` |
| Visitor guide | `src/components/Guide.tsx` |
| Move between gallery and book page | `src/components/Experience.tsx` |
| Book page | `src/components/ProductPanel.tsx` |
| Top menu and search | `src/components/Navbar.tsx` |
| Bag | `src/components/CartDrawer.tsx` and `src/store/useStore.ts` |
| Books and prices | `src/data/catalog.ts` and `src/data/collections.json` |

## Books and covers

The covers are simple SVG illustrations made by `scripts/generate-books.mjs`,
which also writes `src/data/collections.json`. Edit the list of books in that
script and run it again:

```bash
node scripts/generate-books.mjs
```

To use real covers, put the images in `public/books/` and change the `cover`
and `spine` paths of each book. Covers use a 2:3 ratio.
