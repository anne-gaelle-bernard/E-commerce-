import type { Rect } from "@/store/useStore";
import { maxCameraS, minCameraS } from "./corridor";

/**
 * Camera position along the corridor (arc length). Kept outside React so that
 * input handlers and the render loop share it without re-rendering, and so the
 * position survives the product page and route changes.
 */
export const nav = {
  target: 0,
  current: 0,
  move(delta: number) {
    this.target = Math.min(maxCameraS(), Math.max(minCameraS(), this.target + delta));
  },
  jump(s: number) {
    this.target = this.current = Math.min(maxCameraS(), Math.max(minCameraS(), s));
  },
};

/** Each book mesh registers a function returning the on-screen rect of its front cover. */
export const bookRects = new Map<string, () => Rect | null>();
