import React, { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';

type Official = {
  id: string | number;
  name: string;
  role?: string;
  photo_url?: string;
};

const Node: React.FC<{ pos: [number, number, number]; off: Official }> = ({ pos, off }) => {
  const mesh = useRef<any>(null);
  useFrame((state, delta) => {
    if (mesh.current) {
      mesh.current.rotation.y += delta * 0.15;
      mesh.current.position.y = pos[1] + Math.sin(state.clock.elapsedTime + (Number(off.id) % 10)) * 0.08;
    }
  });

  return (
    <group position={pos}>
      <mesh ref={mesh} castShadow>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial color="#6b21a8" metalness={0.3} roughness={0.4} />
      </mesh>

      <Html distanceFactor={8} position={[0, -1.25, 0]} center>
        <div className="bg-white/95 px-3 py-2 rounded-xl shadow-lg text-center max-w-xs">
          <div className="font-bold text-sm text-slate-900 truncate">{off.name}</div>
          <div className="text-xs text-slate-500 truncate">{off.role}</div>
        </div>
      </Html>
    </group>
  );
};

const computePositions = (count: number) => {
  const positions: [number, number, number][] = [];
  const radius = Math.max(4, Math.sqrt(count) * 2.2);
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const layer = Math.floor(i / Math.ceil(Math.sqrt(count)));
    const r = radius - layer * 1.8;
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;
    const y = (layer - 1) * -1.6;
    positions.push([x, y, z]);
  }
  return positions;
};

export default function OrgChart3D({ officials }: { officials: Official[] }) {
  const list = officials || [];
  const positions = useMemo(() => computePositions(list.length), [list.length]);

  // WebGL availability fallback
  if (typeof window !== 'undefined' && !('WebGLRenderingContext' in window)) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
        <p className="text-sm text-gray-600">3D view not supported in this browser. Showing a simplified list below.</p>
        <ul className="mt-4 space-y-2">
          {list.map(off => (
            <li key={off.id} className="text-sm font-semibold">{off.name} — <span className="font-normal text-gray-500">{off.role}</span></li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div style={{ height: 520 }} className="rounded-2xl overflow-hidden shadow-lg border border-gray-100 bg-white">
      <Canvas camera={{ position: [0, 2, 12], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 10, 7]} intensity={0.8} />
        <Suspense fallback={null}>
          {list.map((off, i) => (
            <Node key={off.id as any} pos={positions[i] || [i * 1.5, 0, 0]} off={off} />
          ))}
        </Suspense>
        <OrbitControls enablePan enableZoom enableRotate />
      </Canvas>
    </div>
  );
}
