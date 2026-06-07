import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles } from '@react-three/drei';
import { BufferAttribute, DoubleSide, PlaneGeometry } from 'three';

const PALM_COLORS = ['#fde68a', '#38bdf8', '#22d3ee', '#f9a8d4'];

function makeFrondGeometry() {
  const geometry = new PlaneGeometry(0.18, 3.0, 6, 24);
  const position = geometry.attributes.position as BufferAttribute;
  const count = position.count;

  for (let i = 0; i < count; i += 1) {
    const y = position.getY(i);
    const x = position.getX(i);
    const bend = Math.sin(((y + 1.5) / 3.0) * Math.PI) * 0.28;
    position.setZ(i, bend * (1 - Math.abs(x) * 0.35));
  }

  geometry.computeVertexNormals();
  return geometry;
}

function PalmFrond({ angle, offset, color }: { angle: number; offset: [number, number, number]; color: string }) {
  const mesh = useRef<any>(null);
  const geometry = useMemo(() => makeFrondGeometry(), []);

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.z = angle + Math.sin(state.clock.elapsedTime * 0.7 + angle * 2.4) * 0.08;
    }
  });

  return (
    <mesh ref={mesh} geometry={geometry} position={offset} rotation={[Math.PI / 2.05, 0, angle]}>
      <meshStandardMaterial color={color} side={DoubleSide} roughness={0.16} metalness={0.38} transparent opacity={0.92} />
    </mesh>
  );
}

function PalmTree({ position, scale }: { position: [number, number, number]; scale: number }) {
  const angles = [-1.05, -0.55, -0.25, 0.1, 0.45, 0.8];

  return (
    <Float speed={1.05} rotationIntensity={0.3} floatIntensity={0.28} floatRange={[0.08, 0.2]}>
      <group position={position} scale={[scale, scale, scale]}>
        <mesh position={[0, -0.8, 0]} rotation={[0, 0, 0]}>
          <cylinderGeometry args={[0.14, 0.18, 1.45, 18]} />
          <meshStandardMaterial color="#d8a34f" roughness={0.18} metalness={0.22} />
        </mesh>

        <group position={[0, 0.1, 0]}>
          {angles.map((angle, index) => (
            <PalmFrond
              key={index}
              angle={angle}
              offset={[0, 0.25, 0]}
              color={PALM_COLORS[index % PALM_COLORS.length]}
            />
          ))}
        </group>
      </group>
    </Float>
  );
}

export default function OfficialsBodyBackground() {
  const trees: { position: [number, number, number]; scale: number }[] = useMemo(
    () => [
      { position: [-3.4, -1.0, -2.6], scale: 1.1 },
      { position: [1.6, -0.5, -2.0], scale: 0.95 },
      { position: [3.2, -0.9, -2.8], scale: 0.88 },
    ],
    []
  );

  return (
    <div className="pointer-events-none absolute inset-0 opacity-100">
      <Canvas camera={{ position: [0, 0.8, 8], fov: 38 }}>
        <ambientLight intensity={0.55} />
        <directionalLight position={[5, 5, 3]} intensity={0.75} />
        <directionalLight position={[-4, -2, -1]} intensity={0.2} />

        <group rotation={[-0.12, 0.2, 0]}>
          {trees.map((item, index) => (
            <PalmTree key={index} position={item.position} scale={item.scale} />
          ))}

          <Float speed={1.2} rotationIntensity={0.18} floatIntensity={0.2} floatRange={[0.08, 0.14]}>
            <mesh position={[-0.8, 0.35, -2.2]}>
              <torusGeometry args={[1.5, 0.05, 24, 120]} />
              <meshStandardMaterial color="#fbbf24" roughness={0.2} metalness={0.55} emissive="#fbbf24" emissiveIntensity={0.06} />
            </mesh>
          </Float>

          <Float speed={0.9} rotationIntensity={0.35} floatIntensity={0.25} floatRange={[0.1, 0.18]}>
            <mesh position={[2.2, 0.4, -2.35]}> 
              <icosahedronGeometry args={[0.9, 2]} />
              <meshStandardMaterial color="#38bdf8" roughness={0.18} metalness={0.35} emissive="#38bdf8" emissiveIntensity={0.08} />
            </mesh>
          </Float>
        </group>

        <Sparkles count={32} scale={[16, 10, 16]} size={3.2} speed={0.9} color="#fde68a" />
      </Canvas>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.24),transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(251,191,36,0.22),transparent_30%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/10 via-transparent to-slate-950/25" />
    </div>
  );
}
