/** Home hero: "AI system universe". Four tilted, dashed rings of example systems around a glowing core. */
import { Html, OrbitControls } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import type { SceneProps } from './SceneShell';

export interface UniverseNode {
  id: string;
  ring: number; // 0..3
  glyph: string;
  title: string;
  app: string;
  short: string;
  color: string; // current lens colour
  status: string; // classification label for the current lens
  tierColor: string;
  explored: boolean;
}
export interface UniverseProps { nodes: UniverseNode[]; rings: string[]; onPick: (id: string) => void }

const RADII = [1.6, 2.8, 3.9, 5.0];
const SPEED = [0.12, 0.085, 0.06, 0.045];
const ACCENT = '#6cc5b0';

function glowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d')!;
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, 'rgba(255,255,255,1)');
  grd.addColorStop(0.25, 'rgba(255,255,255,.45)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** stable small angle offset per id */
const jitter = (id: string) => (([...id].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) % 997, 7) / 997) - 0.5) * 0.5;

function Ring({ r, color }: { r: number; color: string }) {
  const line = useMemo(() => {
    const pts = new THREE.EllipseCurve(0, 0, r, r, 0, Math.PI * 2, false, 0).getPoints(160);
    const geo = new THREE.BufferGeometry().setFromPoints(pts.map((p) => new THREE.Vector3(p.x, 0, p.y)));
    const mat = new THREE.LineDashedMaterial({ color, dashSize: 0.08, gapSize: 0.12, transparent: true, opacity: 0.45 });
    const l = new THREE.Line(geo, mat);
    l.computeLineDistances();
    return l;
  }, [r, color]);
  useEffect(() => () => { line.geometry.dispose(); (line.material as THREE.Material).dispose(); }, [line]);
  return <primitive object={line} />;
}

function Node({ n, angle, glow, hovered, setHover, onPick }: { n: UniverseNode; angle: number; glow: THREE.Texture; hovered: boolean; setHover: (id: string | null) => void; onPick: (id: string) => void }) {
  const g = useRef<THREE.Group>(null);
  const rim = useRef<THREE.MeshBasicMaterial>(null);
  const halo = useRef<THREE.SpriteMaterial>(null);
  const target = useMemo(() => new THREE.Color(n.color), [n.color]);
  const r = RADII[n.ring];
  useFrame((_, dt) => {
    const k = 1 - Math.exp(-dt * 7.5); // ~400 ms to settle
    rim.current?.color.lerp(target, k);
    halo.current?.color.lerp(target, k);
    if (g.current) {
      const s = THREE.MathUtils.lerp(g.current.scale.x, hovered ? 1.35 : 1, 1 - Math.exp(-dt * 14));
      g.current.scale.setScalar(s);
    }
  });
  return (
    <group position={[Math.cos(angle) * r, 0, Math.sin(angle) * r]}>
      <group
        ref={g}
        name={`node-${n.id}`}
        onPointerOver={(e) => { e.stopPropagation(); setHover(n.id); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHover(null); document.body.style.cursor = ''; }}
        onClick={(e) => { e.stopPropagation(); document.body.style.cursor = ''; onPick(n.id); }}
      >
        <mesh>
          <sphereGeometry args={[0.16, 24, 16]} />
          <meshStandardMaterial color="#14171c" roughness={0.6} metalness={0.1} />
        </mesh>
        <mesh scale={1.14}>
          <sphereGeometry args={[0.16, 24, 16]} />
          <meshBasicMaterial ref={rim} color={n.color} side={THREE.BackSide} />
        </mesh>
        <sprite scale={0.8}>
          <spriteMaterial ref={halo} map={glow} color={n.color} transparent opacity={hovered ? 0.55 : 0.28} depthWrite={false} blending={THREE.AdditiveBlending} />
        </sprite>
        {n.explored && (
          <mesh position={[0.15, 0.15, 0]}>
            <sphereGeometry args={[0.05, 12, 8]} />
            <meshBasicMaterial color={ACCENT} />
          </mesh>
        )}
      </group>
      <Html center position={[0, -0.34, 0]} zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
        <span className={`u-label ${hovered ? 'on' : ''}`}>{n.short}</span>
      </Html>
      {hovered && (
        <Html position={[0.28, 0.2, 0]} zIndexRange={[30, 0]} style={{ pointerEvents: 'none' }}>
          <div className="u-tip">
            <div className="u-tip-h"><span className="u-glyph" style={{ borderColor: n.color, color: n.color }}>{n.glyph}</span><b>{n.title}</b></div>
            <div className="u-tip-app">{n.app}</div>
            <div className="u-tip-chip"><span className="swatch" style={{ background: n.color }} />{n.status}</div>
            <div className="u-tip-cta">Click to open the simulation{n.explored ? ' · explored' : ''}</div>
          </div>
        </Html>
      )}
    </group>
  );
}

function RingGroup({ i, nodes, color, glow, hover, setHover, onPick }: { i: number; nodes: UniverseNode[]; color: string; glow: THREE.Texture; hover: string | null; setHover: (id: string | null) => void; onPick: (id: string) => void }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => { if (ref.current && !hover) ref.current.rotation.y += SPEED[i] * dt; });
  return (
    <group ref={ref} rotation={[0, i * 0.7, 0]}>
      <Ring r={RADII[i]} color={color} />
      {nodes.map((n, k) => (
        <Node key={n.id} n={n} angle={(k / nodes.length) * Math.PI * 2 + jitter(n.id)} glow={glow} hovered={hover === n.id} setHover={setHover} onPick={onPick} />
      ))}
    </group>
  );
}

function Core({ glow }: { glow: THREE.Texture }) {
  const s = useRef<THREE.Sprite>(null);
  useFrame(({ clock }) => { if (s.current) s.current.scale.setScalar(2.4 + Math.sin(clock.elapsedTime * 1.4) * 0.12); });
  return (
    <group>
      <mesh>
        <sphereGeometry args={[0.35, 32, 24]} />
        <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={0.6} roughness={0.4} />
      </mesh>
      <sprite ref={s}>
        <spriteMaterial map={glow} color={ACCENT} transparent opacity={0.55} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
    </group>
  );
}

function Rig({ hover }: { hover: string | null }) {
  const controls = useRef<OrbitControlsImpl>(null);
  const last = useRef(0);
  const { gl } = useThree();
  const coarse = typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches;
  useEffect(() => {
    // touch screens: keep page scrolling; the scene still turns on its own
    if (coarse) gl.domElement.style.touchAction = 'pan-y';
  }, [coarse, gl]);
  useFrame(() => {
    const c = controls.current;
    if (c) c.autoRotate = !hover && performance.now() - last.current > 4000;
  });
  return (
    <OrbitControls
      ref={controls}
      enableZoom={false}
      enablePan={false}
      enableRotate={!coarse}
      enableDamping
      autoRotate
      autoRotateSpeed={0.35}
      minPolarAngle={THREE.MathUtils.degToRad(55)}
      maxPolarAngle={THREE.MathUtils.degToRad(80)}
      onStart={() => { last.current = performance.now(); }}
      onEnd={() => { last.current = performance.now(); }}
      target={[0, 0, 0]}
    />
  );
}

/** moves the whole system up a little as the page scrolls (reads like the camera dropping) */
function Parallax({ children }: { children: React.ReactNode }) {
  const g = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!g.current) return;
    const p = Math.min(1, Math.max(0, window.scrollY / 700));
    g.current.position.y = THREE.MathUtils.lerp(g.current.position.y, p * 0.6, 0.12);
  });
  return <group ref={g}>{children}</group>;
}

export default function Universe({ nodes, rings, onPick, active }: UniverseProps & SceneProps) {
  const glow = useMemo(glowTexture, []);
  const [hover, setHover] = useState<string | null>(null);
  const byRing = useMemo(() => [0, 1, 2, 3].map((i) => nodes.filter((n) => n.ring === i)), [nodes]);
  useEffect(() => () => { glow.dispose(); document.body.style.cursor = ''; }, [glow]);
  return (
    <Canvas
      frameloop={active ? 'always' : 'never'}
      dpr={[1, 1.75]}
      camera={{ fov: 40, position: [0, 3.2, 9], near: 0.1, far: 60 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      onCreated={({ gl, scene, camera }) => {
        // test hook: renderer info and the on-screen position of a node
        (window as unknown as { __universe?: object }).__universe = {
          frames: () => gl.info.render.frame,
          project: (id: string) => {
            const o = scene.getObjectByName(`node-${id}`);
            if (!o) return null;
            const v = o.getWorldPosition(new THREE.Vector3()).project(camera);
            const r = gl.domElement.getBoundingClientRect();
            return { x: r.left + ((v.x + 1) / 2) * r.width, y: r.top + ((1 - v.y) / 2) * r.height };
          },
        };
      }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <fog attach="fog" args={['#0c0e11', 10, 22]} />
      <ambientLight intensity={0.55} />
      <pointLight position={[0, 0, 0]} intensity={18} color={ACCENT} distance={9} />
      <directionalLight position={[4, 6, 5]} intensity={0.9} />
      <Parallax>
        <group rotation={[THREE.MathUtils.degToRad(18), 0, 0]}>
          <Core glow={glow} />
          {byRing.map((ns, i) => (
            <RingGroup key={i} i={i} nodes={ns} color={rings[i]} glow={glow} hover={hover} setHover={setHover} onPick={onPick} />
          ))}
        </group>
      </Parallax>
      <Rig hover={hover} />
    </Canvas>
  );
}
