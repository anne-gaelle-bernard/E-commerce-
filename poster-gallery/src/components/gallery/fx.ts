import * as THREE from "three";

/** Small procedural textures shared by every book (created once, on the client). */
const cache = new Map<string, THREE.Texture>();

function canvasTexture(key: string, w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void) {
  const hit = cache.get(key);
  if (hit) return hit;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  draw(canvas.getContext("2d")!);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  cache.set(key, tex);
  return tex;
}

/** Fine lines that read as stacked paper on the page block edges. */
export const pagesTexture = (vertical = false) =>
  canvasTexture(vertical ? "pages-v" : "pages-h", 256, 256, (ctx) => {
    ctx.fillStyle = "#efe6d2";
    ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 256; i += 3) {
      ctx.fillStyle = `rgba(120,100,70,${0.08 + ((i * 7) % 5) * 0.025})`;
      if (vertical) ctx.fillRect(i, 0, 1, 256);
      else ctx.fillRect(0, i, 256, 1);
    }
  });

/** Blurred rectangle used as a cheap contact shadow. */
export const shadowTexture = () =>
  canvasTexture("shadow", 256, 256, (ctx) => {
    ctx.filter = "blur(18px)";
    ctx.fillStyle = "rgba(0,0,0,0.8)";
    ctx.fillRect(40, 40, 176, 176);
  });
