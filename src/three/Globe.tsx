/** Frameworks page: "Rules around the world". A dark globe with a marker per framework. */
import { Html, OrbitControls, QuadraticBezierLine } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { geoEquirectangular, geoGraticule10, geoPath } from 'd3-geo';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { feature } from 'topojson-client';
import type { GeometryCollection, Topology } from 'topojson-specification';
import world from 'world-atlas/countries-110m.json';
import type { SceneProps } from './SceneShell';

export interface GlobeMarker { id: string; label: string; type: string; binding: string; color: string; lat?: number; lon?: number; satellite?: number }
export interface GlobeOther { idx: number; label: string; lat: number; lon: number }
export interface GlobeProps {
  markers: GlobeMarker[];
  others: GlobeOther[];
  arcs: Record<string, string[]>;
  selected: string | null;
  onSelect: (id: string) => void;
  onOther: (idx: number) => void;
}

const R = 1.6;
const SAT_R = 2.1;
const ACCENT = '#7da0f3';

export function latLon(lat: number, lon: number, r = R) {
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const theta = THREE.MathUtils.degToRad(lon + 180);
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
}
const SAT_TILT = new THREE.Euler(THREE.MathUtils.degToRad(24), 0, THREE.MathUtils.degToRad(-12));
function satPos(k: number) {
  const a = k * Math.PI + 0.6;
  return new THREE.Vector3(Math.cos(a) * SAT_R, 0, Math.sin(a) * SAT_R).applyEuler(SAT_TILT);
}

function earthTexture() {
  const W = 2048, H = 1024;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d')!;
  g.fillStyle = '#0f1216';
  g.fillRect(0, 0, W, H);
  const proj = geoEquirectangular().scale(W / (2 * Math.PI)).translate([W / 2, H / 2]);
  const path = geoPath(proj, g);
  g.beginPath(); path(geoGraticule10()); g.strokeStyle = 'rgba(255,255,255,.04)'; g.lineWidth = 1; g.stroke();
  const topo = world as unknown as Topology<{ countries: GeometryCollection }>;
  const land = feature(topo, topo.objects.countries);
  g.beginPath(); path(land); g.fillStyle = 'rgba(255,255,255,.07)'; g.fill();
  g.strokeStyle = 'rgba(255,255,255,.12)'; g.lineWidth = 1.2; g.stroke();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

const atmosphere = () => new THREE.ShaderMaterial({
  uniforms: { color: { value: new THREE.Color(ACCENT) } },
  vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position,1.0); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
  // soft halo: strongest just outside the limb, fading outwards
  fragmentShader: 'uniform vec3 color; varying vec3 vN; varying vec3 vV; void main(){ float d = abs(dot(vN, vV)); float f = smoothstep(0.0, 0.55, d) * (1.0 - smoothstep(0.55, 1.0, d)); gl_FragColor = vec4(color, f * 0.25); }',
  side: THREE.BackSide,
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
});

function Pulse({ color, still }: { color: string; still?: boolean }) {
  const m = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!m.current || still) return;
    const t = (clock.elapsedTime % 2.4) / 2.4;
    m.current.scale.setScalar(1 + t * 0.8);
    (m.current.material as THREE.MeshBasicMaterial).opacity = 0.6 * (1 - t);
  });
  return (
    <mesh ref={m}>
      <ringGeometry args={[0.07, 0.085, 32]} />
      <meshBasicMaterial color={color} transparent opacity={0.6} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  );
}

function Marker({ m, pos, hovered, selected, setHover, onSelect }: { m: GlobeMarker; pos: THREE.Vector3; hovered: boolean; selected: boolean; setHover: (id: string | null) => void; onSelect: (id: string) => void }) {
  const q = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), pos.clone().normalize()), [pos]);
  return (
    <group position={pos} quaternion={q}>
      <mesh
        name={`marker-${m.id}`}
        scale={hovered || selected ? 1.5 : 1}
        onPointerOver={(e) => { e.stopPropagation(); setHover(m.id); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHover(null); document.body.style.cursor = ''; }}
        onClick={(e) => { e.stopPropagation(); onSelect(m.id); }}
      >
        <sphereGeometry args={[0.045, 16, 12]} />
        <meshBasicMaterial color={m.color} />
      </mesh>
      <Pulse color={m.color} />
      {selected && (
        <mesh>
          <ringGeometry args={[0.1, 0.115, 40]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.9} side={THREE.DoubleSide} />
        </mesh>
      )}
      {hovered && (
        <Html position={[0.08, 0.08, 0]} zIndexRange={[30, 0]} style={{ pointerEvents: 'none' }}>
          <div className="u-tip" style={{ width: 220 }}>
            <div className="u-tip-h"><span className="swatch" style={{ background: m.color }} /><b>{m.label}</b></div>
            <div className="u-tip-app">{m.type}</div>
            <div className="u-tip-chip">{m.binding}</div>
            <div className="u-tip-cta">Click to see details</div>
          </div>
        </Html>
      )}
    </group>
  );
}

function Arc({ from, to }: { from: THREE.Vector3; to: THREE.Vector3 }) {
  const ref = useRef<{ material: THREE.LineDashedMaterial & { dashOffset: number } } | null>(null);
  const mid = useMemo(() => from.clone().add(to).multiplyScalar(0.5).normalize().multiplyScalar(R + from.distanceTo(to) * 0.45), [from, to]);
  useFrame((_, dt) => { if (ref.current?.material) ref.current.material.dashOffset -= dt * 0.6; });
  return <QuadraticBezierLine ref={ref as never} start={from} end={to} mid={mid} color={ACCENT} lineWidth={1.4} dashed dashSize={0.06} gapSize={0.05} transparent opacity={0.85} />;
}

/** Turns the camera to face the selected marker (slerp over 900 ms). */
function Focus({ target, controls }: { target: THREE.Vector3 | null; controls: React.RefObject<OrbitControlsImpl> }) {
  const { camera } = useThree();
  const anim = useRef<{ from: THREE.Vector3; to: THREE.Vector3; t: number } | null>(null);
  useEffect(() => {
    if (!target) return;
    const dist = camera.position.length();
    anim.current = { from: camera.position.clone(), to: target.clone().normalize().multiplyScalar(dist), t: 0 };
  }, [target, camera]);
  useFrame((_, dt) => {
    const a = anim.current;
    if (!a) return;
    a.t = Math.min(1, a.t + dt / 0.9);
    const e = 1 - Math.pow(1 - a.t, 3);
    const dir = a.from.clone().normalize().lerp(a.to.clone().normalize(), e).normalize();
    camera.position.copy(dir.multiplyScalar(a.from.length()));
    camera.lookAt(0, 0, 0);
    controls.current?.update();
    if (a.t >= 1) anim.current = null;
  });
  return null;
}

export default function Globe({ markers, others, arcs, selected, onSelect, onOther, active }: GlobeProps & SceneProps) {
  const tex = useMemo(earthTexture, []);
  const atm = useMemo(atmosphere, []);
  const [hover, setHover] = useState<string | null>(null);
  const controls = useRef<OrbitControlsImpl>(null);
  const last = useRef(0);
  const pos = useMemo(() => {
    const p: Record<string, THREE.Vector3> = {};
    for (const m of markers) p[m.id] = m.satellite !== undefined ? satPos(m.satellite) : latLon(m.lat!, m.lon!, R + 0.01);
    return p;
  }, [markers]);
  const ring = useMemo(() => {
    const pts = new THREE.EllipseCurve(0, 0, SAT_R, SAT_R, 0, Math.PI * 2, false, 0).getPoints(120).map((v) => new THREE.Vector3(v.x, 0, v.y).applyEuler(SAT_TILT));
    const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineDashedMaterial({ color: '#ffffff', dashSize: 0.05, gapSize: 0.08, transparent: true, opacity: 0.25 }));
    l.computeLineDistances();
    return l;
  }, []);
  useEffect(() => () => { tex.dispose(); atm.dispose(); ring.geometry.dispose(); document.body.style.cursor = ''; }, [tex, atm, ring]);

  return (
    <Canvas
      frameloop={active ? 'always' : 'never'}
      dpr={[1, 1.75]}
      camera={{ fov: 38, position: latLon(30, 20, 6.2).toArray() as [number, number, number] }}
      gl={{ antialias: true, alpha: true }}
      onCreated={({ gl, scene, camera }) => {
        (window as unknown as { __globe?: object }).__globe = {
          frames: () => gl.info.render.frame,
          project: (id: string) => {
            const o = scene.getObjectByName(`marker-${id}`);
            if (!o) return null;
            const v = o.getWorldPosition(new THREE.Vector3()).project(camera);
            const r = gl.domElement.getBoundingClientRect();
            return { x: r.left + ((v.x + 1) / 2) * r.width, y: r.top + ((1 - v.y) / 2) * r.height };
          },
          camera: () => camera.position.toArray(),
        };
      }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <ambientLight intensity={1} />
      <mesh>
        <sphereGeometry args={[R, 96, 96]} />
        <meshBasicMaterial map={tex} />
      </mesh>
      <mesh scale={1.78 / R}>
        <sphereGeometry args={[R, 64, 64]} />
        <primitive object={atm} attach="material" />
      </mesh>
      <primitive object={ring} />
      {markers.map((m) => (
        <Marker key={m.id} m={m} pos={pos[m.id]} hovered={hover === m.id} selected={selected === m.id} setHover={setHover} onSelect={(id) => { last.current = performance.now(); onSelect(id); }} />
      ))}
      {others.map((o) => {
        const p = latLon(o.lat, o.lon, R + 0.01);
        return (
          <group key={o.idx} position={p}>
            <mesh
              onPointerOver={(e) => { e.stopPropagation(); setHover(`o${o.idx}`); document.body.style.cursor = 'pointer'; }}
              onPointerOut={() => { setHover(null); document.body.style.cursor = ''; }}
              onClick={(e) => { e.stopPropagation(); onOther(o.idx); }}
            >
              <sphereGeometry args={[0.03, 12, 8]} />
              <meshBasicMaterial color="#7c838e" />
            </mesh>
            {hover === `o${o.idx}` && (
              <Html position={[0.06, 0.06, 0]} zIndexRange={[30, 0]} style={{ pointerEvents: 'none' }}>
                <div className="u-tip" style={{ width: 200 }}><b>{o.label}</b><div className="u-tip-cta">Click to read more below</div></div>
              </Html>
            )}
          </group>
        );
      })}
      {selected && (arcs[selected] ?? []).map((to) => pos[to] && <Arc key={selected + to} from={pos[selected]} to={pos[to]} />)}
      <Focus target={selected ? pos[selected] : null} controls={controls} />
      <OrbitControls
        ref={controls}
        enableZoom={false}
        enablePan={false}
        enableDamping
        autoRotate={!selected && !hover}
        autoRotateSpeed={0.5}
        onStart={() => { last.current = performance.now(); }}
      />
    </Canvas>
  );
}
