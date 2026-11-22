import * as THREE from "three";
import { collections, COVER_ASPECT, type Book } from "@/data/catalog";

/** Hall dimensions, in metres. Books are shown large (1.1 m tall) so covers read from the walkway. */
export const CORRIDOR = {
  halfWidth: 2.6,
  height: 4.2,
  eyeHeight: 1.55,
  /** Top of the plinths the books stand on. */
  plinthHeight: 0.85,
  /** Distance from the wall to the centre of a plinth. */
  plinthOffset: 0.7,
  bookHeight: 1.1,
  /** Height of the collection banners hanging over the walkway. */
  bannerHeight: 3.05,
};

/** -1: left wall, 1: right wall (as you walk in). */
export type Side = -1 | 1;

// layout along the hall (arc length, metres)
export type HallItem =
  | { kind: "book"; book: Book; s: number; side: Side; width: number; height: number; number: number }
  | { kind: "banner"; collectionId: string; name: string; index: number; s: number };

export interface Section {
  collectionId: string;
  name: string;
  start: number;
  end: number;
}

const STEP = 1.45; // distance between consecutive exhibits (they alternate sides)
const START = 4;
const TAIL = 8;

function buildLayout() {
  const items: HallItem[] = [];
  const sections: Section[] = [];
  let s = START;
  let number = 0;

  collections.forEach((col, ci) => {
    const sectionStart = s - 1.5;
    items.push({ kind: "banner", collectionId: col.id, name: col.name, index: ci, s });
    s += 2.6;
    col.books.forEach((b, i) => {
      const h = CORRIDOR.bookHeight;
      items.push({ kind: "book", book: b, s, side: i % 2 === 0 ? 1 : -1, width: h * COVER_ASPECT, height: h, number: ++number });
      s += STEP;
    });
    s += 2.4;
    sections.push({ collectionId: col.id, name: col.name, start: sectionStart, end: s - 1.5 });
  });
  return { items, sections, length: s + TAIL };
}

export const layout = buildLayout();

// the curve the hall follows
// A long, gentle bend so the far end of the hall disappears around the corner.
function buildCurve(length: number) {
  const pts: THREE.Vector3[] = [];
  const steps = 40;
  for (let i = 0; i <= steps; i++) {
    const u = i / steps;
    pts.push(new THREE.Vector3(Math.sin(u * Math.PI * 1.3) * 5.5, 0, -u * length));
  }
  const c = new THREE.CatmullRomCurve3(pts, false, "centripetal");
  c.arcLengthDivisions = 2000;
  return c;
}

export const curve = buildCurve(layout.length);
export const curveLength = curve.getLength();

const UP = new THREE.Vector3(0, 1, 0);
export type Frame = { p: THREE.Vector3; t: THREE.Vector3; r: THREE.Vector3 };

/** Point, tangent and right-hand normal at arc length s (clamped). */
export function frameAt(s: number, target: Frame = { p: new THREE.Vector3(), t: new THREE.Vector3(), r: new THREE.Vector3() }) {
  const u = THREE.MathUtils.clamp(s / curveLength, 0, 1);
  curve.getPointAt(u, target.p);
  curve.getTangentAt(u, target.t);
  target.r.crossVectors(target.t, UP).normalize();
  return target;
}

/**
 * World matrix of an exhibit against the wall on `side`, at floor level.
 * Local axes: +z points into the hall, +y up; `towardsEntrance(side)` gives the
 * local x direction that faces a visitor walking in.
 */
export function wallMatrix(s: number, side: Side, height = 0) {
  const { p, r } = frameAt(s);
  const out = r.clone().multiplyScalar(side); // from the centre line towards the wall
  const z = out.clone().negate(); // faces the walkway
  const y = UP.clone();
  const x = new THREE.Vector3().crossVectors(y, z);
  const pos = p.clone().addScaledVector(out, CORRIDOR.halfWidth - 0.02).setY(height);
  const m = new THREE.Matrix4().makeBasis(x, y, z);
  m.setPosition(pos);
  return m;
}

/** Local x sign pointing back towards the entrance (i.e. towards an approaching visitor). */
export const towardsEntrance = (side: Side) => (side === 1 ? 1 : -1);

/** World matrix of a banner hanging over the centre of the walkway, facing the entrance. */
export function bannerMatrix(s: number) {
  const { p, t } = frameAt(s);
  const z = t.clone().negate();
  const y = UP.clone();
  const x = new THREE.Vector3().crossVectors(y, z);
  const m = new THREE.Matrix4().makeBasis(x, y, z);
  m.setPosition(p.clone().setY(CORRIDOR.bannerHeight));
  return m;
}

/** Camera arc length that frames an exhibit nicely (a couple of steps before it). */
export const cameraSFor = (bookS: number) => THREE.MathUtils.clamp(bookS - 2.9, 0, maxCameraS());
export const minCameraS = () => 0;
export const maxCameraS = () => curveLength - TAIL + 2;

export function bookItem(id: string) {
  return layout.items.find((i): i is Extract<HallItem, { kind: "book" }> => i.kind === "book" && i.book.id === id);
}

export function sectionAt(cameraS: number) {
  // the label follows what is in front of the visitor, a little ahead of the camera
  const s = cameraS + 3;
  return layout.sections.find((sec) => s >= sec.start && s < sec.end) ?? null;
}

// hall shell: floor, walls and a softly vaulted ceiling
export function buildCorridorGeometry() {
  const { halfWidth: hw, height: hh } = CORRIDOR;
  const radius = 0.5;
  const profile: [number, number, "floor" | "wall" | "ceiling"][] = [];
  for (let i = 0; i <= 10; i++) profile.push([-hw + (2 * hw * i) / 10, 0, "floor"]);
  profile.push([hw, 0.01, "wall"]);
  for (let i = 0; i <= 6; i++) profile.push([hw, ((hh - radius) * i) / 6, "wall"]);
  for (let i = 1; i <= 6; i++) {
    const a = (i / 6) * (Math.PI / 2);
    profile.push([hw - radius + Math.cos(a) * radius, hh - radius + Math.sin(a) * radius, "ceiling"]);
  }
  for (let i = 1; i <= 8; i++) profile.push([hw - radius - ((2 * hw - 2 * radius) * i) / 8, hh, "ceiling"]);
  for (let i = 1; i <= 6; i++) {
    const a = Math.PI / 2 + (i / 6) * (Math.PI / 2);
    profile.push([-hw + radius + Math.cos(a) * radius, hh - radius + Math.sin(a) * radius, "ceiling"]);
  }
  for (let i = 1; i <= 6; i++) profile.push([-hw, hh - radius - ((hh - radius) * i) / 6, "wall"]);
  profile.push([-hw, 0.01, "wall"]);

  const colors = { floor: new THREE.Color("#e4e3e0"), wall: new THREE.Color("#f4f4f2"), ceiling: new THREE.Color("#fafafa") };
  return sweep(profile.map(([x, y, kind]) => ({ x, y, color: colors[kind] })));
}

function sweep(profile: { x: number; y: number; color?: THREE.Color }[], density = 3) {
  const segments = Math.ceil(curveLength * density);
  const cols = profile.length;
  const positions = new Float32Array((segments + 1) * cols * 3);
  const colors = profile[0].color ? new Float32Array((segments + 1) * cols * 3) : null;
  const f: Frame = { p: new THREE.Vector3(), t: new THREE.Vector3(), r: new THREE.Vector3() };
  let k = 0;
  for (let i = 0; i <= segments; i++) {
    frameAt((i / segments) * curveLength, f);
    for (const pt of profile) {
      positions[k] = f.p.x + f.r.x * pt.x;
      positions[k + 1] = pt.y;
      positions[k + 2] = f.p.z + f.r.z * pt.x;
      if (colors && pt.color) {
        colors[k] = pt.color.r;
        colors[k + 1] = pt.color.g;
        colors[k + 2] = pt.color.b;
      }
      k += 3;
    }
  }
  const index: number[] = [];
  for (let i = 0; i < segments; i++) {
    for (let j = 0; j < cols - 1; j++) {
      const a = i * cols + j, b = (i + 1) * cols + j;
      index.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  if (colors) geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geo.setIndex(index);
  geo.computeVertexNormals();
  return geo;
}
