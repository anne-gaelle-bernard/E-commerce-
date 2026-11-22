"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { collections } from "@/data/catalog";
import { buildCorridorGeometry, CORRIDOR, frameAt, layout, sectionAt, type Frame } from "@/lib/corridor";
import { nav } from "@/lib/nav";
import { useStore } from "@/store/useStore";
import { BookMesh } from "./BookMesh";
import { TitleCard } from "./TitleCard";

const WALL = "#f2f2f2";
const noRaycast = () => null;

function Hall() {
  const shell = useMemo(() => buildCorridorGeometry(), []);
  useEffect(() => () => shell.dispose(), [shell]);
  return (
    <mesh geometry={shell} raycast={noRaycast}>
      <meshLambertMaterial vertexColors side={THREE.DoubleSide} />
    </mesh>
  );
}

/** Walks the camera down the middle of the hall: damped scroll and a slight mouse look. */
function CameraRig() {
  const look = useMemo(() => new THREE.Vector3(), []);
  const f = useMemo<Frame>(() => ({ p: new THREE.Vector3(), t: new THREE.Vector3(), r: new THREE.Vector3() }), []);
  const parallax = useRef({ x: 0, y: 0 });
  const lastSection = useRef<string | null>(null);

  useFrame(({ camera, pointer }, dt) => {
    const k = Math.min(dt, 0.05);
    nav.current = THREE.MathUtils.damp(nav.current, nav.target, 2.8, k);
    if (useStore.getState().phase === "gallery") {
      parallax.current.x = THREE.MathUtils.damp(parallax.current.x, pointer.x, 2.5, k);
      parallax.current.y = THREE.MathUtils.damp(parallax.current.y, pointer.y, 2.5, k);
    }

    const s = nav.current;
    frameAt(s, f);
    camera.position.copy(f.p).setY(CORRIDOR.eyeHeight);
    frameAt(s + 6, f);
    look.copy(f.p).setY(1.35);
    camera.lookAt(look);
    camera.rotateY(-parallax.current.x * 0.2);
    camera.rotateX(parallax.current.y * 0.06);

    const section = sectionAt(s)?.collectionId ?? null;
    if (section !== lastSection.current) {
      lastSection.current = section;
      useStore.getState().setCurrentCollection(section);
    }
  });
  return null;
}

function Scene() {
  return (
    <>
      <color attach="background" args={[WALL]} />
      <fog attach="fog" args={[WALL, 12, 38]} />
      <ambientLight intensity={1.8} />
      <hemisphereLight args={["#ffffff", "#d9d9d6", 0.8]} />
      <directionalLight position={[3, 8, 2]} intensity={0.6} />
      <CameraRig />
      <Hall />
      {layout.items.map((item) =>
        item.kind === "book" ? (
          <BookMesh key={item.book.id} book={item.book} s={item.s} side={item.side} width={item.width} height={item.height} number={item.number} />
        ) : (
          <TitleCard key={item.collectionId} name={item.name} index={item.index} count={collections.length} s={item.s} />
        ),
      )}
    </>
  );
}

/** Wheel, trackpad, touch and keyboard all feed the same damped target. */
function useCorridorInput(el: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const node = el.current;
    if (!node) return;
    const active = () => useStore.getState().phase === "gallery" && !useStore.getState().cartOpen;

    const onWheel = (e: WheelEvent) => {
      if (!active()) return;
      e.preventDefault();
      const unit = e.deltaMode === 1 ? 32 : e.deltaMode === 2 ? window.innerHeight : 1;
      const d = (Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX) * unit;
      nav.move(d * 0.0055);
    };

    let lastY = 0, lastX = 0;
    const onTouchStart = (e: TouchEvent) => {
      lastY = e.touches[0].clientY;
      lastX = e.touches[0].clientX;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!active()) return;
      const t = e.touches[0];
      const dy = lastY - t.clientY;
      const dx = lastX - t.clientX;
      lastY = t.clientY;
      lastX = t.clientX;
      nav.move((Math.abs(dy) > Math.abs(dx) ? dy : dx) * 0.022);
      e.preventDefault();
    };

    const onKey = (e: KeyboardEvent) => {
      if (!active() || (e.target as HTMLElement)?.closest("input, textarea")) return;
      const step = { ArrowDown: 2, ArrowRight: 2, PageDown: 6, " ": 4, ArrowUp: -2, ArrowLeft: -2, PageUp: -6 }[e.key];
      if (step) {
        e.preventDefault();
        nav.move(step);
      }
    };

    node.addEventListener("wheel", onWheel, { passive: false });
    node.addEventListener("touchstart", onTouchStart, { passive: true });
    node.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("keydown", onKey);
    return () => {
      node.removeEventListener("wheel", onWheel);
      node.removeEventListener("touchstart", onTouchStart);
      node.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKey);
    };
  }, [el]);
}

export default function Gallery3D() {
  const wrapper = useRef<HTMLDivElement>(null);
  useCorridorInput(wrapper);
  return (
    <div ref={wrapper} className="absolute inset-0 touch-none" aria-label="3D museum of books. Scroll or swipe to walk down the hall, click an exhibit to open it.">
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        camera={{ fov: 55, near: 0.05, far: 40, position: [0, CORRIDOR.eyeHeight, 0] }}
        onPointerMissed={() => (document.body.style.cursor = "")}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
