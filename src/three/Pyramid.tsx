/** EU AI Act guide: the four risk levels as a stepped 3D pyramid. Hover or click a level to read about it. */
import { Edges, Html, OrbitControls } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import type { EuTier, TierKey } from '../data/euTiers';
import { solid } from '../data/palette';
import type { SceneProps } from './SceneShell';

export interface PyramidProps { tiers: EuTier[]; selected: TierKey; onSelect: (k: TierKey) => void; counts: Record<TierKey, number> }

const H = 0.6; // slab height
const GAP = 0.1;
const BASE = 1.9; // half-width of the bottom slab

const yOf = (i: number, n: number) => (n - 1 - i) * (H + GAP) - ((n - 1) * (H + GAP)) / 2;
const widths = (i: number, n: number) => ({ top: (BASE * (i + 0.2)) / n, bottom: (BASE * (i + 1)) / n });

/** one level: a square frustum (4 radial segments) that lifts and glows when hovered or selected */
function Slab({ i, n, tier, active, hover, onHover, onPick }: {
  i: number; n: number; tier: EuTier; active: boolean; hover: boolean;
  onHover: (k: TierKey | null) => void; onPick: (k: TierKey) => void;
}) {
  const { top, bottom } = widths(i, n);
  const y = yOf(i, n);
  // a cylinder's radius reaches the corners; scale by √2 so the half-width matches
  const geo = useMemo(() => new THREE.CylinderGeometry(top * Math.SQRT2, bottom * Math.SQRT2, H, 4, 1), [top, bottom]);
  const color = useMemo(() => new THREE.Color(solid(tier.color)), [tier.color]);
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  const mesh = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    const lift = active ? 0.14 : hover ? 0.07 : 0;
    if (mesh.current) mesh.current.position.y = THREE.MathUtils.damp(mesh.current.position.y, y + lift, 8, dt);
    if (mat.current) mat.current.emissiveIntensity = THREE.MathUtils.damp(mat.current.emissiveIntensity, active ? 0.42 : hover ? 0.26 : 0.07, 8, dt);
  });
  return (
    <mesh
      ref={mesh}
      geometry={geo}
      position={[0, y, 0]}
      rotation={[0, Math.PI / 4, 0]}
      onPointerOver={(e) => { e.stopPropagation(); onHover(tier.key); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { onHover(null); document.body.style.cursor = ''; }}
      onClick={(e) => { e.stopPropagation(); onPick(tier.key); }}
    >
      <meshStandardMaterial ref={mat} color={color} emissive={color} emissiveIntensity={0.07} roughness={0.45} metalness={0.1} />
      <Edges threshold={20} color={active ? '#ffffff' : '#0c0e11'} />
    </mesh>
  );
}

function Scene({ tiers, selected, onSelect, counts, active }: PyramidProps & { active: boolean }) {
  const [hover, setHover] = useState<TierKey | null>(null);
  const spin = useRef<THREE.Group>(null);
  // turn slowly while nobody is pointing at it
  useFrame((_, dt) => { if (spin.current && active && hover === null) spin.current.rotation.y += dt * 0.15; });
  const n = tiers.length;
  return (
    <group position={[-1.0, -0.05, 0]}>
      <group ref={spin} rotation={[0, -0.35, 0]}>
        {tiers.map((t, i) => (
          <Slab key={t.key} i={i} n={n} tier={t} active={selected === t.key} hover={hover === t.key} onHover={setHover} onPick={onSelect} />
        ))}
      </group>
      {/* labels stay still while the pyramid turns */}
      {tiers.map((t, i) => (
        <Html key={t.key} position={[BASE * 1.5, yOf(i, n), 0]} style={{ pointerEvents: 'none' }} zIndexRange={[10, 0]}>
          <div className={`pyr-tag ${selected === t.key ? 'on' : ''}`} style={{ borderColor: solid(t.color) }}>
            <b>{t.label.replace(' duties', '')}</b>
            <span>{counts[t.key]} example{counts[t.key] === 1 ? '' : 's'}</span>
          </div>
        </Html>
      ))}
    </group>
  );
}

export default function Pyramid(props: PyramidProps & SceneProps) {
  return (
    <Canvas
      frameloop={props.active ? 'always' : 'never'}
      dpr={[1, 1.75]}
      camera={{ fov: 32, position: [0, 1.5, 9.0], near: 0.1, far: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 6, 5]} intensity={1.15} />
      <directionalLight position={[-4, 2, -3]} intensity={0.35} color="#86a7d6" />
      <pointLight position={[0, -2.2, 2.5]} intensity={6} color="#6cc5b0" distance={7} />
      <Scene {...props} />
      <OrbitControls enableZoom={false} enablePan={false} minPolarAngle={Math.PI / 2.9} maxPolarAngle={Math.PI / 1.9} rotateSpeed={0.6} />
    </Canvas>
  );
}
