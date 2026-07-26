'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  Billboard,
  ContactShadows,
  Float,
  Html,
  OrbitControls,
  PerspectiveCamera,
  RoundedBox,
} from '@react-three/drei';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Memory } from '@/types/memory';

interface CampCanvasProps {
  memories: Memory[];
  spotlight: boolean;
  onSelect: (memory: Memory) => void;
}

const TREE_POSITIONS: Array<[number, number, number, number]> = [
  [-10.5, 0, -3, 1.35],
  [-8.7, 0, -6.3, 1],
  [-6.7, 0, -8.4, 1.2],
  [-3.8, 0, -9.4, 0.95],
  [3.8, 0, -9.4, 1.05],
  [6.6, 0, -8.5, 1.3],
  [9, 0, -6.4, 1.05],
  [10.7, 0, -3.2, 1.4],
  [-11.2, 0, 1.4, 1],
  [11.1, 0, 1.7, 1.1],
  [-9.8, 0, 5.7, 0.9],
  [9.8, 0, 5.8, 1],
];

const ROCK_POSITIONS: Array<[number, number, number, number]> = [
  [-5.7, 0.15, 2.8, 0.55],
  [5.4, 0.13, 3.6, 0.42],
  [-7.3, 0.12, -2.2, 0.38],
  [7.5, 0.1, -1.7, 0.32],
  [-2.7, 0.1, 6.4, 0.35],
  [3.1, 0.12, 6.6, 0.45],
];

const NOTE_COLORS: Record<string, string> = {
  'bg-yellow-200': '#fff0a8',
  'bg-pink-200': '#ffc8d8',
  'bg-blue-200': '#bfe5f5',
  'bg-green-200': '#cfe7bb',
  'bg-purple-200': '#dfcff5',
  'bg-orange-200': '#ffd1a8',
};

export default function CampCanvas({
  memories,
  spotlight,
  onSelect,
}: CampCanvasProps) {
  return (
    <div className="camp-canvas" aria-label="3Dキャンプ場の思い出ボード">
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{ position: [0, 7.4, 14.5], fov: 42, near: 0.1, far: 80 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
      >
        <color attach="background" args={['#081a23']} />
        <fog attach="fog" args={['#081a23', 17, 36]} />
        <ambientLight intensity={0.72} color="#9dc8c3" />
        <hemisphereLight args={['#9fc9db', '#17351f', 1.2]} />
        <directionalLight
          castShadow
          position={[-6, 12, 4]}
          intensity={2.1}
          color="#ffdca0"
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-left={-14}
          shadow-camera-right={14}
          shadow-camera-top={14}
          shadow-camera-bottom={-14}
        />

        <ResponsiveCamera />
        <CampScene memories={memories} onSelect={onSelect} />

        <OrbitControls
          makeDefault
          target={[0, 1.25, 0]}
          enablePan={false}
          enableDamping
          dampingFactor={0.055}
          minDistance={9.5}
          maxDistance={19}
          minPolarAngle={Math.PI * 0.22}
          maxPolarAngle={Math.PI * 0.48}
          autoRotate={spotlight}
          autoRotateSpeed={0.42}
        />
      </Canvas>
    </div>
  );
}

function ResponsiveCamera() {
  const compact = useThree((state) => state.size.width <= 760);
  return (
    <PerspectiveCamera
      makeDefault
      position={[0, compact ? 8.4 : 7.4, compact ? 18 : 14.5]}
      fov={compact ? 46 : 42}
      near={0.1}
      far={80}
    />
  );
}

function CampScene({
  memories,
  onSelect,
}: {
  memories: Memory[];
  onSelect: (memory: Memory) => void;
}) {
  return (
    <group>
      <Ground />
      <Moon />
      <Lodge />
      <Tent position={[-4.8, 0, -2.4]} color="#d46648" rotation={0.18} />
      <Tent position={[4.9, 0, -2.2]} color="#d9a441" rotation={-0.22} />
      <Tent position={[-6.2, 0, 2.2]} color="#3e8a79" rotation={0.45} scale={0.78} />
      <Tent position={[6.4, 0, 2.1]} color="#5b7bb5" rotation={-0.4} scale={0.76} />

      {TREE_POSITIONS.map(([x, y, z, scale], index) => (
        <PineTree
          key={`${x}-${z}`}
          position={[x, y, z]}
          scale={scale}
          tint={index % 3}
        />
      ))}

      {ROCK_POSITIONS.map(([x, y, z, scale]) => (
        <mesh key={`${x}-${z}`} position={[x, y, z]} scale={scale} castShadow>
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#748279" roughness={1} />
        </mesh>
      ))}

      <CampFire />
      <MemoryCircle memories={memories} onSelect={onSelect} />
      <Fireflies />
      <ContactShadows
        position={[0, 0.02, 0]}
        opacity={0.42}
        scale={30}
        blur={2.2}
        far={10}
        color="#06140f"
      />
    </group>
  );
}

function Ground() {
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <circleGeometry args={[14.5, 64]} />
        <meshStandardMaterial color="#28543b" roughness={1} />
      </mesh>
      <mesh position={[0, 0.025, 1.2]} rotation-x={-Math.PI / 2} receiveShadow>
        <ringGeometry args={[2.25, 3.25, 48]} />
        <meshStandardMaterial color="#9a8057" roughness={1} />
      </mesh>
      <mesh
        position={[0, 0.035, 6.8]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[1.4, 4.8, 1]}
        receiveShadow
      >
        <circleGeometry args={[1, 28]} />
        <meshStandardMaterial color="#917650" roughness={1} />
      </mesh>
    </group>
  );
}

function Moon() {
  return (
    <group position={[-8.5, 9.5, -14]}>
      <mesh>
        <sphereGeometry args={[1.45, 32, 32]} />
        <meshBasicMaterial color="#fff3c4" />
      </mesh>
      <pointLight intensity={10} distance={28} color="#b9d7d8" />
    </group>
  );
}

function Lodge() {
  return (
    <group position={[0, 0, -6.2]}>
      <RoundedBox args={[5.8, 2.4, 2.8]} radius={0.18} position={[0, 1.2, 0]} castShadow>
        <meshStandardMaterial color="#8b5a37" roughness={0.85} />
      </RoundedBox>
      <mesh position={[0, 2.8, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[3.65, 1.65, 4]} />
        <meshStandardMaterial color="#4c3025" roughness={0.92} />
      </mesh>
      {[-1.85, 0, 1.85].map((x, index) => (
        <group key={x} position={[x, 1.35, 1.43]}>
          <mesh>
            <planeGeometry args={[0.85, 0.86]} />
            <meshStandardMaterial
              color={index === 1 ? '#5e3b2a' : '#ffd889'}
              emissive={index === 1 ? '#000000' : '#f0a642'}
              emissiveIntensity={index === 1 ? 0 : 0.9}
            />
          </mesh>
          {index !== 1 && <pointLight position={[0, 0, 0.4]} intensity={2} distance={4} color="#ffc96c" />}
        </group>
      ))}
      <Html position={[0, 3.72, 0]} center distanceFactor={14}>
        <div className="camp-lodge-label">
          <span>ŌSE YOUTH HOUSE</span>
          <strong>会瀬青少年の家</strong>
        </div>
      </Html>
    </group>
  );
}

function Tent({
  position,
  color,
  rotation,
  scale = 1,
}: {
  position: [number, number, number];
  color: string;
  rotation: number;
  scale?: number;
}) {
  return (
    <group position={position} rotation-y={rotation} scale={scale}>
      <mesh position={[0, 0.92, 0]} rotation-y={Math.PI / 4} castShadow receiveShadow>
        <coneGeometry args={[1.75, 2.25, 4]} />
        <meshStandardMaterial color={color} roughness={0.92} />
      </mesh>
      <mesh position={[0, 0.78, 1.24]} rotation-x={-0.04}>
        <circleGeometry args={[0.46, 3]} />
        <meshStandardMaterial color="#26392f" roughness={1} />
      </mesh>
      <pointLight position={[0, 0.55, 0.7]} intensity={2.2} distance={4} color="#ffb458" />
    </group>
  );
}

function PineTree({
  position,
  scale,
  tint,
}: {
  position: [number, number, number];
  scale: number;
  tint: number;
}) {
  const greens = ['#214d3a', '#1d6046', '#2d6b4c'];
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 1.2, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.26, 2.4, 8]} />
        <meshStandardMaterial color="#69442d" roughness={1} />
      </mesh>
      <mesh position={[0, 2.35, 0]} castShadow>
        <coneGeometry args={[1.3, 2.8, 9]} />
        <meshStandardMaterial color={greens[tint]} roughness={1} />
      </mesh>
      <mesh position={[0, 3.55, 0]} castShadow>
        <coneGeometry args={[0.92, 2.25, 9]} />
        <meshStandardMaterial color={greens[(tint + 1) % greens.length]} roughness={1} />
      </mesh>
    </group>
  );
}

function CampFire() {
  const flame = useRef<THREE.Group>(null);
  const light = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (flame.current) {
      flame.current.scale.y = 0.92 + Math.sin(t * 8) * 0.1;
      flame.current.rotation.y = Math.sin(t * 3.2) * 0.14;
    }
    if (light.current) {
      light.current.intensity = 13 + Math.sin(t * 9) * 2.2;
    }
  });

  return (
    <group position={[0, 0, 1.2]}>
      {[0, Math.PI / 2, Math.PI / 4].map((rotation) => (
        <mesh key={rotation} position={[0, 0.23, 0]} rotation={[0, rotation, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.18, 0.22, 2.15, 10]} />
          <meshStandardMaterial color="#5b3525" roughness={1} />
        </mesh>
      ))}
      <group ref={flame} position={[0, 1.08, 0]}>
        <mesh>
          <coneGeometry args={[0.68, 1.8, 12]} />
          <meshBasicMaterial color="#ff6a2d" transparent opacity={0.9} />
        </mesh>
        <mesh position={[0, -0.12, 0.08]} scale={0.56}>
          <coneGeometry args={[0.62, 1.65, 12]} />
          <meshBasicMaterial color="#ffd45a" />
        </mesh>
      </group>
      <pointLight
        ref={light}
        position={[0, 1.8, 0]}
        intensity={14}
        distance={12}
        decay={2}
        color="#ff8a3d"
        castShadow
      />
    </group>
  );
}

function MemoryCircle({
  memories,
  onSelect,
}: {
  memories: Memory[];
  onSelect: (memory: Memory) => void;
}) {
  const newestId = memories.at(-1)?.id;
  const compact = useThree((state) => state.size.width <= 760);

  return (
    <group>
      {memories.map((memory, index) => {
        const ring = index % 2;
        const slot = Math.floor(index / 2);
        const slotsInRing = Math.ceil(memories.length / 2);
        const angle = (slot / Math.max(1, slotsInRing)) * Math.PI * 2 + ring * 0.18;
        const radius = ring === 0 ? 5.15 : 7.15;
        const x = Math.sin(angle) * radius;
        const z = Math.cos(angle) * radius + 0.4;
        const y = ring === 0 ? 2.15 : 2.7;

        return (
          <MemoryMarker
            key={memory.id}
            memory={memory}
            position={[x, y, z]}
            newest={memory.id === newestId}
            compact={compact}
            onSelect={onSelect}
          />
        );
      })}
    </group>
  );
}

function MemoryMarker({
  memory,
  position,
  newest,
  compact,
  onSelect,
}: {
  memory: Memory;
  position: [number, number, number];
  newest: boolean;
  compact: boolean;
  onSelect: (memory: Memory) => void;
}) {
  const color = NOTE_COLORS[memory.color] ?? '#fff0a8';

  return (
    <group position={position}>
      <mesh position={[0, -1.1, 0]} castShadow>
        <cylinderGeometry args={[0.055, 0.08, 1.8, 8]} />
        <meshStandardMaterial color="#6d472d" roughness={1} />
      </mesh>
      <Float speed={newest ? 2.2 : 1.15} rotationIntensity={0.08} floatIntensity={newest ? 0.2 : 0.08}>
        <Billboard>
          <mesh position={[0, 0, -0.03]} castShadow>
            <boxGeometry args={[1.55, 1.22, 0.08]} />
            <meshStandardMaterial
              color={color}
              roughness={0.9}
              emissive={newest ? color : '#000000'}
              emissiveIntensity={newest ? 0.16 : 0}
            />
          </mesh>
          <Html
            center
            distanceFactor={compact ? 4.8 : 7.6}
            position={[0, 0, 0.05]}
            zIndexRange={[8, 1]}
          >
            <button
              type="button"
              className={`camp-memory-card ${newest ? 'camp-memory-card-new' : ''}`}
              style={{ backgroundColor: color }}
              onClick={(event) => {
                event.stopPropagation();
                onSelect(memory);
              }}
              aria-label={`${memory.author}さんの思い出を開く`}
            >
              {memory.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={memory.image} alt="" />
              )}
              <span>{memory.content || '写真の思い出'}</span>
              <small>— {memory.author}</small>
            </button>
          </Html>
          {newest && (
            <pointLight position={[0, 0, 0.8]} intensity={2.2} distance={3.4} color={color} />
          )}
        </Billboard>
      </Float>
    </group>
  );
}

function Fireflies() {
  const group = useRef<THREE.Group>(null);
  const points = useMemo(
    () =>
      Array.from({ length: 26 }, (_, index) => {
        const angle = (index / 26) * Math.PI * 2;
        const radius = 2.6 + ((index * 37) % 50) / 10;
        return [
          Math.sin(angle) * radius,
          1.1 + ((index * 29) % 28) / 10,
          Math.cos(angle) * radius + 0.6,
        ] as [number, number, number];
      }),
    []
  );

  useFrame(({ clock }) => {
    if (group.current) {
      group.current.rotation.y = clock.getElapsedTime() * 0.045;
    }
  });

  return (
    <group ref={group}>
      {points.map((position, index) => (
        <Float key={index} speed={1.1 + (index % 4) * 0.2} floatIntensity={0.5}>
          <mesh position={position}>
            <sphereGeometry args={[0.035 + (index % 3) * 0.009, 8, 8]} />
            <meshBasicMaterial color={index % 4 === 0 ? '#a8f7cf' : '#ffe78c'} />
          </mesh>
        </Float>
      ))}
    </group>
  );
}
