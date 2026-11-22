"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { FORMATS, formatPrice, thicknessRatio, unitPrice, type Book } from "@/data/catalog";
import { CORRIDOR, towardsEntrance, wallMatrix, type Side } from "@/lib/corridor";
import { bookRects, nav } from "@/lib/nav";
import { useStore } from "@/store/useStore";
import { pagesTexture, shadowTexture } from "./fx";

const LOAD_DISTANCE = 22; // metres from the camera before covers are requested
const INTER_600 = "/fonts/inter-latin-600-normal.woff";
const INTER_400 = "/fonts/inter-latin-400-normal.woff";
const BOARD = 0.02;
const TILT = 0.3; // exhibits turn slightly towards visitors walking in
const loader = new THREE.TextureLoader();
const noRaycast = () => null;

const plinthMaterial = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.9 });
const labelMaterial = new THREE.MeshBasicMaterial({ color: "#ffffff", toneMapped: false });

interface Props {
  book: Book;
  s: number;
  side: Side;
  width: number;
  height: number;
  number: number;
}

/** One exhibit: a book standing on a white plinth, with a small label on the wall. */
export function BookMesh({ book, s, side, width: W, height: H, number }: Props) {
  const D = W * thicknessRatio(book);
  const e = towardsEntrance(side);
  const lift = useRef<THREE.Group>(null);
  const coverMesh = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [cover, setCover] = useState<THREE.Texture | null>(null);
  const [spine, setSpine] = useState<THREE.Texture | null>(null);
  const requested = useRef(false);
  const { gl, camera } = useThree();
  const currency = useStore((st) => st.currency);
  const matrix = useMemo(() => wallMatrix(s, side), [s, side]);
  const { plinthHeight: PH, plinthOffset: PZ } = CORRIDOR;

  // materials (box faces: +x, -x, +y, -y, +z, -z)
  const cloth = useMemo(() => new THREE.MeshStandardMaterial({ color: book.color, roughness: 0.8 }), [book.color]);
  const pages = useMemo(() => {
    const sideMat = new THREE.MeshStandardMaterial({ map: pagesTexture(), roughness: 0.95 });
    const top = new THREE.MeshStandardMaterial({ map: pagesTexture(true), roughness: 0.95 });
    const face = new THREE.MeshStandardMaterial({ color: "#efe6d2", roughness: 0.95 });
    return [sideMat, face, top, top, face, face];
  }, []);
  const frontMaterials = useMemo(() => {
    const face = cover ? new THREE.MeshBasicMaterial({ map: cover, toneMapped: false }) : cloth;
    return [cloth, cloth, cloth, cloth, face, cloth];
  }, [cover, cloth]);
  const spineMaterials = useMemo(() => {
    const face = spine ? new THREE.MeshBasicMaterial({ map: spine, toneMapped: false }) : cloth;
    return [cloth, face, cloth, cloth, cloth, cloth];
  }, [spine, cloth]);

  // covers load when the visitor gets close
  useFrame(() => {
    if (requested.current || Math.abs(nav.current - s) > LOAD_DISTANCE) return;
    requested.current = true;
    for (const [url, set] of [[book.cover, setCover], [book.spine, setSpine]] as const) {
      loader.load(url, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
        set(tex);
      });
    }
  });
  useEffect(() => () => cover?.dispose(), [cover]);
  useEffect(() => () => spine?.dispose(), [spine]);

  // hover: the book rises a little
  useFrame((_, dt) => {
    if (!lift.current) return;
    lift.current.position.y = THREE.MathUtils.damp(lift.current.position.y, hovered ? 0.08 : 0, 8, Math.min(dt, 0.05));
  });

  // screen rect of the front cover, for the move to the product page
  useEffect(() => {
    const corners = [
      new THREE.Vector3(-W / 2, -H / 2, BOARD / 2),
      new THREE.Vector3(W / 2, -H / 2, BOARD / 2),
      new THREE.Vector3(W / 2, H / 2, BOARD / 2),
      new THREE.Vector3(-W / 2, H / 2, BOARD / 2),
    ];
    const v = new THREE.Vector3();
    const getRect = () => {
      const mesh = coverMesh.current;
      if (!mesh) return null;
      mesh.updateWorldMatrix(true, false);
      const box = gl.domElement.getBoundingClientRect();
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const c of corners) {
        v.copy(c).applyMatrix4(mesh.matrixWorld).project(camera);
        if (v.z > 1) return null;
        const x = box.left + ((v.x + 1) / 2) * box.width;
        const y = box.top + ((1 - v.y) / 2) * box.height;
        minX = Math.min(minX, x); maxX = Math.max(maxX, x);
        minY = Math.min(minY, y); maxY = Math.max(maxY, y);
      }
      if (maxX < 0 || minX > box.right || maxY < 0 || minY > box.bottom) return null;
      return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
    };
    bookRects.set(book.id, getRect);
    return () => {
      bookRects.delete(book.id);
    };
  }, [book.id, W, H, gl, camera]);

  const onOver = (ev: ThreeEvent<PointerEvent>) => {
    if (useStore.getState().phase !== "gallery") return;
    ev.stopPropagation();
    setHovered(true);
    document.body.style.cursor = "pointer";
  };
  const onOut = () => {
    setHovered(false);
    document.body.style.cursor = "";
  };
  const onClick = (ev: ThreeEvent<MouseEvent>) => {
    const { phase, openBook } = useStore.getState();
    if (phase !== "gallery" || ev.delta > 8) return;
    ev.stopPropagation();
    onOut();
    openBook(book.id, bookRects.get(book.id)?.() ?? null);
  };

  return (
    <group matrix={matrix} matrixAutoUpdate={false}>
      {/* soft shadow on the floor */}
      <mesh position={[0, 0.003, PZ]} rotation={[-Math.PI / 2, 0, 0]} raycast={noRaycast}>
        <planeGeometry args={[1.3, 1.1]} />
        <meshBasicMaterial map={shadowTexture()} transparent opacity={0.25} depthWrite={false} />
      </mesh>

      <group onPointerOver={onOver} onPointerOut={onOut} onClick={onClick}>
        <mesh position={[0, PH / 2, PZ]} material={plinthMaterial}>
          <boxGeometry args={[0.8, PH, 0.6]} />
        </mesh>

        <group position={[0, PH + H / 2, PZ]} rotation={[0, e * TILT, 0]}>
          <group ref={lift}>
            <mesh position={[0, 0, -D / 2 + BOARD / 2]} material={cloth}>
              <boxGeometry args={[W, H, BOARD]} />
            </mesh>
            <mesh position={[0.01, 0, 0]} material={pages}>
              <boxGeometry args={[W - 0.026, H - 0.035, D - BOARD * 2]} />
            </mesh>
            <mesh position={[-W / 2 + BOARD / 2, 0, 0]} material={spineMaterials}>
              <boxGeometry args={[BOARD, H, D]} />
            </mesh>
            <mesh ref={coverMesh} position={[0, 0, D / 2 - BOARD / 2]} material={frontMaterials}>
              <boxGeometry args={[W, H, BOARD]} />
            </mesh>
          </group>
        </group>

        {/* wall label */}
        <group position={[e * 0.75, 1.4, 0.01]}>
          <mesh material={labelMaterial}>
            <planeGeometry args={[0.4, 0.24]} />
          </mesh>
          <Text font={INTER_400} fontSize={0.022} color="#8a8a8a" anchorX="left" anchorY="top" position={[-0.17, 0.095, 0.002]}>
            {String(number).padStart(2, "0")}
          </Text>
          <Text font={INTER_600} fontSize={0.03} color="#141414" anchorX="left" anchorY="top" maxWidth={0.34} lineHeight={1.1} position={[-0.17, 0.06, 0.002]}>
            {book.title.toUpperCase()}
          </Text>
          <Text font={INTER_400} fontSize={0.024} color="#555555" anchorX="left" anchorY="bottom" maxWidth={0.34} position={[-0.17, -0.06, 0.002]}>
            {book.author}
          </Text>
          <Text font={INTER_600} fontSize={0.024} color="#141414" anchorX="left" anchorY="bottom" position={[-0.17, -0.1, 0.002]}>
            {formatPrice(unitPrice(book, FORMATS[0].id, "plain"), currency)}
          </Text>
        </group>
      </group>
    </group>
  );
}
