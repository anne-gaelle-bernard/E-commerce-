"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import { bannerMatrix, CORRIDOR } from "@/lib/corridor";

const ANTON = "/fonts/anton-latin-400-normal.woff";
const INTER = "/fonts/inter-latin-400-normal.woff";
const noRaycast = () => null;
const panelMaterial = new THREE.MeshBasicMaterial({ color: "#ffffff", toneMapped: false });
const cableMaterial = new THREE.MeshBasicMaterial({ color: "#bdbdbd" });

const WIDTH = 2.6;
const HEIGHT = 0.8;

/** Plain white sign hanging over the walkway, naming the room. */
export function TitleCard({ name, index, count, s }: { name: string; index: number; count: number; s: number }) {
  const matrix = useMemo(() => bannerMatrix(s), [s]);
  const cableLength = CORRIDOR.height - CORRIDOR.bannerHeight - HEIGHT / 2;
  return (
    <group matrix={matrix} matrixAutoUpdate={false}>
      {[-1, 1].map((x) => (
        <mesh key={x} position={[x * (WIDTH / 2 - 0.15), HEIGHT / 2 + cableLength / 2, 0]} material={cableMaterial} raycast={noRaycast}>
          <cylinderGeometry args={[0.005, 0.005, cableLength, 6]} />
        </mesh>
      ))}
      <mesh material={panelMaterial} raycast={noRaycast}>
        <boxGeometry args={[WIDTH, HEIGHT, 0.03]} />
      </mesh>
      <Text font={INTER} fontSize={0.05} letterSpacing={0.2} color="#8a8a8a" anchorX="center" anchorY="top" position={[0, HEIGHT / 2 - 0.08, 0.02]}>
        {`ROOM ${String(index + 1).padStart(2, "0")} / ${String(count).padStart(2, "0")}`}
      </Text>
      <Text font={ANTON} fontSize={0.3} color="#111111" anchorX="center" anchorY="middle" maxWidth={WIDTH - 0.3} textAlign="center" position={[0, -0.05, 0.02]}>
        {name.toUpperCase()}
      </Text>
    </group>
  );
}
