import type { Rect } from "@/store/useStore";
import { COVER_ASPECT } from "@/data/catalog";

export const NAV_HEIGHT = 44;
export const MOBILE_BREAKPOINT = 900;

/** Where the cover sits in the product view: left half on desktop, top on mobile. */
export function stageRect(aspect = COVER_ASPECT): Rect {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const mobile = vw < MOBILE_BREAKPOINT;
  const box = mobile
    ? { x: 0, y: NAV_HEIGHT, width: vw, height: vh * 0.52 }
    : { x: 0, y: NAV_HEIGHT, width: vw / 2, height: vh - NAV_HEIGHT };
  const pad = mobile ? 24 : Math.min(box.width, box.height) * 0.14;
  const maxW = box.width - pad * 2;
  const maxH = box.height - pad * 2;
  let width = maxW;
  let height = width / aspect;
  if (height > maxH) {
    height = maxH;
    width = height * aspect;
  }
  return { x: box.x + (box.width - width) / 2, y: box.y + (box.height - height) / 2, width, height };
}
