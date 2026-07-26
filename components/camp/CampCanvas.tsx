'use client';

import { Canvas, ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import {
  Float,
  Html,
  OrbitControls,
  PerspectiveCamera,
  RoundedBox,
} from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';
import { Memory } from '@/types/memory';

interface CampCanvasProps {
  memories: Memory[];
  spotlight: boolean;
  shifting?: boolean;
  onSelect: (memory: Memory) => void;
}

const COLORS = {
  cream: '#f8f0dd',
  island: '#cfdbab',
  islandSide: '#b59a77',
  lavender: '#a58abb',
  lavenderDark: '#745d8e',
  sage: '#879b68',
  sageDark: '#65784d',
  peach: '#dca37f',
  wood: '#a77a58',
  darkWood: '#76523f',
  water: '#8fc3c4',
  path: '#efe3cf',
  window: '#f8d48a',
};

const TREE_POSITIONS: Array<[number, number, number, number, number]> = [
  [-7.1, 0.6, -4.5, 0.95, 0],
  [-6.25, 0.6, -5.1, 0.72, 1],
  [-4.9, 0.6, -5.35, 0.82, 2],
  [5.3, 0.6, -5.1, 0.8, 1],
  [6.5, 0.6, -4.55, 1, 0],
  [7.25, 0.6, -3.6, 0.72, 2],
  [-7.7, 0.6, 0.8, 0.82, 1],
  [-7.35, 0.6, 2.2, 0.66, 2],
  [7.35, 0.6, 1.15, 0.84, 0],
  [6.75, 0.6, 2.7, 0.7, 1],
  [-5.8, 0.6, 5.1, 0.76, 0],
  [4.7, 0.6, 5.15, 0.82, 2],
];

const SHRUB_POSITIONS: Array<[number, number, number, number]> = [
  [-7.3, 4.35, 0.65, 0],
  [-5.8, 4.7, 0.55, 1],
  [-2.7, 5.55, 0.45, 2],
  [0.7, 5.7, 0.55, 1],
  [3.4, 5.25, 0.5, 0],
  [6.1, 4.6, 0.52, 2],
  [7.45, 0.25, 0.56, 1],
  [7.1, -2.4, 0.48, 0],
  [-7.45, -1.75, 0.52, 2],
  [-3.1, -5.45, 0.44, 1],
  [2.7, -5.5, 0.46, 0],
];

const MEMORY_POSITIONS: Array<[number, number]> = [
  [-5.15, -1.35],
  [-4.25, 1.65],
  [-1.6, 3.25],
  [1.65, 3.25],
  [4.3, 1.55],
  [5.15, -1.25],
];

const NOTE_COLORS: Record<string, string> = {
  'bg-yellow-200': '#f5d995',
  'bg-pink-200': '#e8b7b7',
  'bg-blue-200': '#a9ced0',
  'bg-green-200': '#b9d2a2',
  'bg-purple-200': '#c9b4d6',
  'bg-orange-200': '#e8bd92',
};

const HEART_SHAPE = (() => {
  const heart = new THREE.Shape();
  heart.moveTo(0, 0.12);
  heart.bezierCurveTo(0, 0.12, -0.28, -0.08, -0.28, 0.14);
  heart.bezierCurveTo(-0.28, 0.36, -0.04, 0.4, 0, 0.24);
  heart.bezierCurveTo(0.04, 0.4, 0.28, 0.36, 0.28, 0.14);
  heart.bezierCurveTo(0.28, -0.08, 0, 0.12, 0, 0.12);
  return heart;
})();

export default function CampCanvas({
  memories,
  spotlight,
  shifting = false,
  onSelect,
}: CampCanvasProps) {
  return (
    <div
      className="camp-canvas"
      data-shifting={shifting}
      aria-label="3Dキャンプ場の思い出ボード"
    >
      <Canvas
        dpr={[0.9, 1.35]}
        camera={{ position: [12, 12, 16], fov: 35, near: 0.1, far: 100 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={[COLORS.cream]} />
        <ambientLight intensity={1.5} color="#fff8e9" />
        <hemisphereLight args={['#fff8e8', '#9baa78', 2.2]} />
        <directionalLight
          position={[-8, 14, 10]}
          intensity={3.2}
          color="#fff1d5"
        />

        <ResponsiveCamera />
        <CampDiorama memories={memories} onSelect={onSelect} />

        <OrbitControls
          makeDefault
          target={[0, 0.8, 0]}
          enablePan={false}
          enableDamping
          dampingFactor={0.06}
          minDistance={15}
          maxDistance={42}
          minPolarAngle={Math.PI * 0.24}
          maxPolarAngle={Math.PI * 0.34}
          minAzimuthAngle={-Math.PI * 0.38}
          maxAzimuthAngle={Math.PI * 0.38}
          autoRotate={spotlight}
          autoRotateSpeed={0.35}
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
      position={compact ? [20, 19, 28] : [12, 12, 16]}
      fov={compact ? 42 : 35}
      near={0.1}
      far={100}
    />
  );
}

function CampDiorama({
  memories,
  onSelect,
}: {
  memories: Memory[];
  onSelect: (memory: Memory) => void;
}) {
  return (
    <group rotation-y={-0.08}>
      <Island />
      <PondAndBridge />
      <MainLodge />
      <CafeCabin />
      <Tent position={[-4.8, 0.65, -1.7]} color="#c695b5" rotation={0.2} />
      <Tent position={[4.9, 0.65, -1.9]} color="#e2a17f" rotation={-0.35} />
      <Tent position={[-3.55, 0.65, 3.1]} color="#9ab48a" rotation={0.55} scale={0.78} />
      <Tent position={[3.95, 0.65, 3.4]} color="#99b9c2" rotation={-0.55} scale={0.8} />
      <CampFire />
      <PicnicArea />
      <WelcomeSign />
      {TREE_POSITIONS.map(([x, y, z, scale, tint]) => (
        <ToyTree key={`${x}-${z}`} position={[x, y, z]} scale={scale} tint={tint} />
      ))}
      {SHRUB_POSITIONS.map(([x, z, scale, tint]) => (
        <Shrub key={`${x}-${z}`} position={[x, 0.8, z]} scale={scale} tint={tint} />
      ))}
      <MemoryVillage memories={memories} onSelect={onSelect} />
      <CampWalkers />
    </group>
  );
}

function Island() {
  return (
    <group>
      <mesh position={[0, -0.15, 0]} scale={[1.28, 1, 0.96]} castShadow receiveShadow>
        <cylinderGeometry args={[7, 7.35, 1.25, 48, 1]} />
        <meshStandardMaterial color={COLORS.islandSide} roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.5, 0]} scale={[1.28, 1, 0.96]} castShadow receiveShadow>
        <cylinderGeometry args={[6.84, 6.95, 0.34, 48, 1]} />
        <meshStandardMaterial color={COLORS.island} roughness={0.92} />
      </mesh>
      {[-7.1, -4.8, -2.1, 1.2, 4.35, 7].map((x, index) => (
        <mesh key={x} position={[x, -0.83, index % 2 ? 6.1 : -6.1]} scale={[1.2, 0.68, 0.8]} castShadow>
          <dodecahedronGeometry args={[0.72, 1]} />
          <meshStandardMaterial color={index % 2 ? '#ae8c70' : '#c09d7b'} roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

function MainLodge() {
  return (
    <group position={[-2.1, 0.8, -4.15]}>
      <RoundedBox args={[4.6, 2.5, 2.7]} radius={0.32} smoothness={6} position={[0, 1.25, 0]} castShadow>
        <meshStandardMaterial color="#f2dfbd" roughness={0.88} />
      </RoundedBox>
      <mesh position={[0, 2.95, 0]} rotation-y={Math.PI / 4} castShadow>
        <coneGeometry args={[3.15, 1.3, 4]} />
        <meshStandardMaterial color="#b28cac" roughness={0.86} />
      </mesh>
      <mesh position={[0, 1.0, 1.42]} castShadow>
        <boxGeometry args={[1.15, 1.75, 0.22]} />
        <meshStandardMaterial color={COLORS.lavenderDark} roughness={0.86} />
      </mesh>
      {[-1.45, 1.45].map((x) => (
        <group key={x} position={[x, 1.45, 1.43]}>
          <RoundedBox args={[0.88, 0.95, 0.18]} radius={0.03}>
            <meshStandardMaterial color={COLORS.window} emissive="#f6bd67" emissiveIntensity={0.16} />
          </RoundedBox>
          <mesh position={[0, 0, 0.12]}>
            <boxGeometry args={[0.08, 0.92, 0.08]} />
            <meshStandardMaterial color="#fff3dc" />
          </mesh>
        </group>
      ))}
      <RoundedBox args={[4.25, 0.3, 0.65]} radius={0.07} position={[0, 2.28, 1.68]} castShadow>
        <meshStandardMaterial color="#9b7aae" roughness={0.84} />
      </RoundedBox>
      <Html position={[0, 3.82, 0]} center distanceFactor={15}>
        <div className="camp-lodge-label">
          <span>OISE YOUTH HOUSE</span>
          <strong>会瀬青少年の家</strong>
        </div>
      </Html>
    </group>
  );
}

function CafeCabin() {
  return (
    <group position={[4.6, 0.8, -4.05]}>
      <RoundedBox args={[2.7, 2, 2.25]} radius={0.3} smoothness={6} position={[0, 1, 0]} castShadow>
        <meshStandardMaterial color="#e9c9a9" roughness={0.9} />
      </RoundedBox>
      <RoundedBox args={[3.05, 0.38, 2.55]} radius={0.08} position={[0, 2.15, 0]} castShadow>
        <meshStandardMaterial color="#d89e80" roughness={0.88} />
      </RoundedBox>
      <RoundedBox args={[1.15, 1.1, 0.18]} radius={0.03} position={[0, 1.1, 1.18]}>
        <meshStandardMaterial color="#8a6a78" />
      </RoundedBox>
      <StripedAwning position={[0, 1.62, 1.42]} />
      <FlowerBox position={[-0.95, 2.48, 0]} />
      <FlowerBox position={[0.95, 2.48, 0]} />
    </group>
  );
}

function StripedAwning({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} rotation-x={-0.24}>
      {[-0.9, -0.54, -0.18, 0.18, 0.54, 0.9].map((x, index) => (
        <RoundedBox key={x} args={[0.36, 0.16, 0.8]} radius={0.03} position={[x, 0, 0]} castShadow>
          <meshStandardMaterial color={index % 2 ? '#f9eedc' : '#a98ab8'} />
        </RoundedBox>
      ))}
    </group>
  );
}

function FlowerBox({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <RoundedBox args={[0.9, 0.28, 0.42]} radius={0.05} castShadow>
        <meshStandardMaterial color={COLORS.wood} />
      </RoundedBox>
      {[-0.28, 0, 0.28].map((x, index) => (
        <mesh key={x} position={[x, 0.26, 0]}>
          <sphereGeometry args={[0.16, 12, 10]} />
          <meshStandardMaterial color={index % 2 ? '#e3a6ad' : '#f4d78f'} />
        </mesh>
      ))}
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
      <mesh position={[0, 1, 0]} rotation-y={Math.PI / 4} castShadow>
        <coneGeometry args={[1.55, 2.2, 4]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.92, 1.12]} rotation-x={-0.03}>
        <circleGeometry args={[0.47, 3]} />
        <meshStandardMaterial color="#6e5d65" />
      </mesh>
      <mesh position={[0, 1.0, 1.14]} rotation-x={-0.03} scale={[0.12, 1, 1]}>
        <circleGeometry args={[0.47, 3]} />
        <meshStandardMaterial color="#ead9c4" />
      </mesh>
      <RoundedBox args={[2.55, 0.12, 2.55]} radius={0.02} position={[0, 0.02, 0]} receiveShadow>
        <meshStandardMaterial color="#efe1c8" />
      </RoundedBox>
    </group>
  );
}

function ToyTree({
  position,
  scale,
  tint,
}: {
  position: [number, number, number];
  scale: number;
  tint: number;
}) {
  const greens = ['#879b68', '#9baa78', '#758b5e'];
  const puffs: Array<[number, number, number, number]> = [
    [0, 2.15, 0, 0.92],
    [-0.55, 1.8, 0.12, 0.7],
    [0.55, 1.75, 0, 0.76],
    [-0.25, 2.65, 0, 0.68],
    [0.35, 2.55, -0.15, 0.62],
  ];
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.9, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.3, 1.8, 10]} />
        <meshStandardMaterial color="#9d7456" roughness={1} />
      </mesh>
      {puffs.map(([x, y, z, puffScale], index) => (
        <mesh key={index} position={[x, y, z]} scale={puffScale} castShadow>
          <sphereGeometry args={[1, 16, 14]} />
          <meshStandardMaterial color={greens[(tint + index) % greens.length]} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function Shrub({
  position,
  scale,
  tint,
}: {
  position: [number, number, number];
  scale: number;
  tint: number;
}) {
  const greens = ['#849a6b', '#a0ad79', '#71865f'];
  return (
    <group position={position} scale={scale}>
      {[-0.5, 0, 0.5].map((x, index) => (
        <mesh key={x} position={[x, index % 2 ? 0.26 : 0, 0]} castShadow>
          <sphereGeometry args={[0.72, 14, 12]} />
          <meshStandardMaterial color={greens[(tint + index) % greens.length]} roughness={1} />
        </mesh>
      ))}
      {[-0.36, 0.34].map((x, index) => (
        <mesh key={x} position={[x, 0.55, 0.45]}>
          <sphereGeometry args={[0.12, 10, 8]} />
          <meshStandardMaterial color={index ? '#f2d58b' : '#e7b4b5'} />
        </mesh>
      ))}
    </group>
  );
}

function PondAndBridge() {
  return (
    <group position={[5.35, 0.84, 4.4]}>
      <mesh rotation-x={-Math.PI / 2} scale={[1.55, 0.85, 1]} receiveShadow>
        <circleGeometry args={[1.35, 48]} />
        <meshStandardMaterial color="#f4ead5" roughness={1} />
      </mesh>
      <mesh position={[0, 0.04, 0]} rotation-x={-Math.PI / 2} scale={[1.42, 0.72, 1]}>
        <circleGeometry args={[1.28, 48]} />
        <meshStandardMaterial color={COLORS.water} roughness={0.42} metalness={0.05} />
      </mesh>
      <Bridge />
      {[[-1.8, 0.4], [1.65, -0.55], [1.45, 0.6]].map(([x, z], index) => (
        <mesh key={index} position={[x, 0.08, z]} scale={[0.55, 0.28, 0.42]}>
          <dodecahedronGeometry args={[0.7, 1]} />
          <meshStandardMaterial color="#a9947d" roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

function Bridge() {
  return (
    <group position={[0, 0.42, 0]} rotation-y={0.12}>
      {Array.from({ length: 9 }, (_, index) => (
        <RoundedBox
          key={index}
          args={[0.36, 0.12, 1.9]}
          radius={0.02}
          position={[(index - 4) * 0.34, Math.cos((index - 4) * 0.36) * 0.22, 0]}
          castShadow
        >
          <meshStandardMaterial color={index % 2 ? '#a97758' : '#b88763'} />
        </RoundedBox>
      ))}
      {[-1.05, 1.05].map((z) => (
        <group key={z} position={[0, 0.36, z]}>
          <mesh rotation-z={Math.PI / 2}>
            <cylinderGeometry args={[0.055, 0.055, 3.2, 8]} />
            <meshStandardMaterial color={COLORS.darkWood} />
          </mesh>
          {[-1.35, 0, 1.35].map((x) => (
            <mesh key={x} position={[x, -0.12, 0]}>
              <cylinderGeometry args={[0.07, 0.09, 0.85, 8]} />
              <meshStandardMaterial color={COLORS.darkWood} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

function CampFire() {
  const flame = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (flame.current) {
      flame.current.scale.y = 0.96 + Math.sin(clock.elapsedTime * 7) * 0.08;
      flame.current.rotation.y = clock.elapsedTime * 0.35;
    }
  });

  return (
    <group position={[0.25, 0.78, -0.8]}>
      {[0, Math.PI / 2, Math.PI / 4].map((rotation) => (
        <mesh key={rotation} position={[0, 0.18, 0]} rotation={[0, rotation, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.12, 0.14, 1.25, 10]} />
          <meshStandardMaterial color={COLORS.darkWood} />
        </mesh>
      ))}
      <group ref={flame} position={[0, 0.74, 0]}>
        <mesh>
          <coneGeometry args={[0.42, 1.1, 14]} />
          <meshStandardMaterial color="#e58b62" emissive="#d66d42" emissiveIntensity={0.4} />
        </mesh>
        <mesh position={[0, -0.18, 0.08]} scale={0.55}>
          <coneGeometry args={[0.42, 1, 14]} />
          <meshBasicMaterial color="#f8d177" />
        </mesh>
      </group>
      <pointLight position={[0, 1.1, 0]} intensity={3.5} distance={5} color="#f3b469" />
    </group>
  );
}

function PicnicArea() {
  return (
    <group position={[-0.25, 0.75, 2.6]} rotation-y={-0.15}>
      <RoundedBox args={[2.15, 0.18, 1.05]} radius={0.03} position={[0, 0.78, 0]} castShadow>
        <meshStandardMaterial color="#b58260" />
      </RoundedBox>
      {[-0.72, 0.72].map((x) => (
        <mesh key={x} position={[x, 0.4, 0]}>
          <cylinderGeometry args={[0.09, 0.11, 0.82, 8]} />
          <meshStandardMaterial color={COLORS.darkWood} />
        </mesh>
      ))}
      {[-0.85, 0.85].map((z) => (
        <RoundedBox key={z} args={[2, 0.14, 0.35]} radius={0.02} position={[0, 0.42, z]} castShadow>
          <meshStandardMaterial color="#aa7758" />
        </RoundedBox>
      ))}
      <mesh position={[-0.35, 1.05, 0]}>
        <cylinderGeometry args={[0.17, 0.13, 0.38, 16]} />
        <meshStandardMaterial color="#f1d9bc" />
      </mesh>
      <mesh position={[-0.35, 1.28, 0]}>
        <torusGeometry args={[0.12, 0.035, 8, 16]} />
        <meshStandardMaterial color="#9e7cb1" />
      </mesh>
    </group>
  );
}

function WelcomeSign() {
  return (
    <group position={[-7.05, 0.8, 4.15]} rotation-y={0.48}>
      {[-0.75, 0.75].map((x) => (
        <mesh key={x} position={[x, 0.65, 0]}>
          <cylinderGeometry args={[0.09, 0.12, 1.3, 8]} />
          <meshStandardMaterial color={COLORS.darkWood} />
        </mesh>
      ))}
      <RoundedBox args={[2.25, 0.9, 0.18]} radius={0.03} position={[0, 1.15, 0]} castShadow>
        <meshStandardMaterial color="#f2dfbd" />
      </RoundedBox>
      <Html position={[0, 1.15, 0.13]} center distanceFactor={16}>
        <div className="camp-welcome-sign">
          <span>WELCOME TO</span>
          <strong>CROSS MISSION CAMP</strong>
        </div>
      </Html>
    </group>
  );
}

function MemoryVillage({
  memories,
  onSelect,
}: {
  memories: Memory[];
  onSelect: (memory: Memory) => void;
}) {
  const newestId = memories.at(-1)?.id;
  const compact = useThree((state) => state.size.width <= 760);
  const sceneMemories = memories.slice(-6);
  return (
    <group>
      {sceneMemories.map((memory, index) => {
        const [baseX, baseZ] = MEMORY_POSITIONS[index % MEMORY_POSITIONS.length];
        return (
          <MemoryPin
            key={memory.id}
            memory={memory}
            position={[baseX, 0.82, baseZ]}
            newest={memory.id === newestId}
            slot={index}
            compact={compact}
            onSelect={onSelect}
          />
        );
      })}
    </group>
  );
}

function MemoryPin({
  memory,
  position,
  newest,
  slot,
  compact,
  onSelect,
}: {
  memory: Memory;
  position: [number, number, number];
  newest: boolean;
  slot: number;
  compact: boolean;
  onSelect: (memory: Memory) => void;
}) {
  const color = NOTE_COLORS[memory.color] ?? '#f5d995';
  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onSelect(memory);
  };

  return (
    <Float speed={newest ? 2 : 1} floatIntensity={newest ? 0.12 : 0.035} rotationIntensity={0.025}>
      <group position={position} onClick={handleClick}>
        <mesh position={[0, 0.38, 0]} castShadow>
          <cylinderGeometry args={[0.055, 0.07, 0.76, 8]} />
          <meshStandardMaterial color={COLORS.darkWood} />
        </mesh>
        <RoundedBox args={[1.08, 0.82, 0.2]} radius={0.03} position={[0, 1.02, 0]} castShadow>
          <meshStandardMaterial
            color={color}
            emissive={newest ? color : '#000000'}
            emissiveIntensity={newest ? 0.18 : 0}
            roughness={0.86}
          />
        </RoundedBox>
        <mesh position={[0.42, 1.26, 0.12]} scale={0.48}>
          <shapeGeometry args={[HEART_SHAPE]} />
          <meshStandardMaterial color="#fff8e8" />
        </mesh>
        <Html
          center
          position={[0, 1.3, 0.13]}
          distanceFactor={compact ? 8.5 : 11.5}
          zIndexRange={[8, 1]}
        >
          <button
            type="button"
            className={`camp-memory-note camp-memory-slot-${slot} ${newest ? 'camp-memory-note-new' : ''}`}
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
      </group>
    </Float>
  );
}

type WalkerKind = 'jesus' | 'child-a' | 'child-b' | 'sheep' | 'dog';

const WALK_ROUTE: Array<[number, number, number]> = [
  [-5.7, 0.85, 1.5],
  [-4.1, 0.85, -0.6],
  [-2.2, 0.85, 1.3],
  [-0.2, 0.85, -0.2],
  [1.7, 0.85, 1.8],
  [3.7, 0.85, 0.2],
  [5.2, 0.85, -1.25],
  [3.8, 0.85, -2.6],
  [1.4, 0.85, -2.3],
  [-1.1, 0.85, -2.4],
  [-3.6, 0.85, -2.0],
];

function CampWalkers() {
  return (
    <group>
      <Walker kind="jesus" offset={3.1} speed={0.19} scale={0.82} />
      <Walker kind="child-a" offset={2.5} speed={0.24} scale={0.72} />
      <Walker kind="child-b" offset={5.1} speed={0.22} scale={0.68} />
      <Walker kind="sheep" offset={7.25} speed={0.17} scale={0.78} />
      <Walker kind="dog" offset={8.8} speed={0.3} scale={0.7} />
    </group>
  );
}

function Walker({
  kind,
  offset,
  speed,
  scale,
}: {
  kind: WalkerKind;
  offset: number;
  speed: number;
  scale: number;
}) {
  const root = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!root.current || !body.current) return;
    const routeProgress = clock.elapsedTime * speed + offset;
    const segment = Math.floor(routeProgress) % WALK_ROUTE.length;
    const local = routeProgress - Math.floor(routeProgress);
    const start = WALK_ROUTE[segment];
    const end = WALK_ROUTE[(segment + 1) % WALK_ROUTE.length];
    const travel = Math.min(local / 0.72, 1);
    const eased = travel * travel * (3 - 2 * travel);
    const x = THREE.MathUtils.lerp(start[0], end[0], eased);
    const y = THREE.MathUtils.lerp(start[1], end[1], eased);
    const z = THREE.MathUtils.lerp(start[2], end[2], eased);

    root.current.position.set(x, y, z);
    const isWalking = local < 0.72;
    if (isWalking) {
      root.current.rotation.y = Math.atan2(end[0] - start[0], end[2] - start[2]);
      body.current.position.y = Math.abs(Math.sin(clock.elapsedTime * 8 + offset)) * 0.08;
      body.current.rotation.z = Math.sin(clock.elapsedTime * 8 + offset) * 0.035;
    } else {
      root.current.rotation.y = Math.atan2(-x, -z);
      body.current.position.y = 0;
      body.current.rotation.z = Math.sin(clock.elapsedTime * 1.8 + offset) * 0.015;
    }
  });

  return (
    <group ref={root} scale={scale}>
      <group ref={body}>
        {kind === 'jesus' && <JesusFigure />}
        {(kind === 'child-a' || kind === 'child-b') && (
          <ChildFigure variant={kind === 'child-a' ? 0 : 1} />
        )}
        {kind === 'sheep' && <SheepFigure />}
        {kind === 'dog' && <DogFigure />}
      </group>
    </group>
  );
}

function JesusFigure() {
  return (
    <group>
      <mesh position={[0, 1.05, 0]} castShadow>
        <coneGeometry args={[0.48, 1.7, 16]} />
        <meshStandardMaterial color="#f6edda" roughness={0.9} />
      </mesh>
      <mesh position={[0.11, 1.18, 0.43]} rotation-z={-0.16}>
        <boxGeometry args={[0.16, 1.45, 0.06]} />
        <meshStandardMaterial color="#b98b72" />
      </mesh>
      <mesh position={[0, 2.03, 0]}>
        <sphereGeometry args={[0.34, 18, 16]} />
        <meshStandardMaterial color="#d9a37f" roughness={0.88} />
      </mesh>
      <mesh position={[0, 2.18, -0.05]} scale={[1.08, 0.78, 1.02]}>
        <sphereGeometry args={[0.36, 16, 14]} />
        <meshStandardMaterial color="#6f4d3d" roughness={0.96} />
      </mesh>
      <mesh position={[0, 1.87, 0.29]} scale={[0.72, 0.56, 0.35]}>
        <sphereGeometry args={[0.29, 14, 12]} />
        <meshStandardMaterial color="#76503f" />
      </mesh>
      <mesh position={[0, 2.12, -0.14]} rotation-x={Math.PI / 2}>
        <torusGeometry args={[0.48, 0.035, 8, 32]} />
        <meshStandardMaterial color="#e8c86e" emissive="#e8c86e" emissiveIntensity={0.28} />
      </mesh>
      <Html center position={[0, 2.72, 0]} distanceFactor={16}>
        <span className="camp-character-label">イエスさま</span>
      </Html>
    </group>
  );
}

function ChildFigure({ variant }: { variant: 0 | 1 }) {
  const shirt = variant === 0 ? '#e39b86' : '#86a9b2';
  const shorts = variant === 0 ? '#8b789a' : '#bd8b69';
  return (
    <group>
      {[-0.17, 0.17].map((x) => (
        <group key={x} position={[x, 0.42, 0]}>
          <mesh>
            <cylinderGeometry args={[0.075, 0.085, 0.62, 10]} />
            <meshStandardMaterial color="#d4a079" />
          </mesh>
          <mesh position={[0, -0.32, 0.08]}>
            <boxGeometry args={[0.18, 0.12, 0.38]} />
            <meshStandardMaterial color="#6d5c59" />
          </mesh>
        </group>
      ))}
      <RoundedBox args={[0.72, 0.72, 0.48]} radius={0.08} position={[0, 1.08, 0]} castShadow>
        <meshStandardMaterial color={shirt} />
      </RoundedBox>
      <mesh position={[0, 0.72, 0]}>
        <boxGeometry args={[0.7, 0.32, 0.46]} />
        <meshStandardMaterial color={shorts} />
      </mesh>
      <mesh position={[0, 1.72, 0]}>
        <sphereGeometry args={[0.38, 18, 16]} />
        <meshStandardMaterial color={variant === 0 ? '#dba67d' : '#b8795e'} />
      </mesh>
      <mesh position={[0, 1.91, -0.06]} scale={[1.05, 0.6, 1]}>
        <sphereGeometry args={[0.4, 16, 14]} />
        <meshStandardMaterial color={variant === 0 ? '#594238' : '#3e3936'} />
      </mesh>
      <Html center position={[0, 2.34, 0]} distanceFactor={16}>
        <span className="camp-character-label">{variant === 0 ? 'こども' : 'おともだち'}</span>
      </Html>
    </group>
  );
}

function SheepFigure() {
  return (
    <group>
      <mesh position={[0, 0.72, 0]} scale={[0.78, 0.58, 1.05]} castShadow>
        <sphereGeometry args={[0.65, 16, 14]} />
        <meshStandardMaterial color="#f4eee0" roughness={1} />
      </mesh>
      {[-0.35, 0, 0.35].map((x, index) => (
        <mesh key={x} position={[x, 1.05 + (index % 2) * 0.13, -0.02]} scale={0.45}>
          <sphereGeometry args={[0.72, 14, 12]} />
          <meshStandardMaterial color={index % 2 ? '#fffaf0' : '#eee7d6'} />
        </mesh>
      ))}
      <mesh position={[0, 0.83, 0.72]} scale={[0.58, 0.72, 0.5]}>
        <sphereGeometry args={[0.46, 14, 12]} />
        <meshStandardMaterial color="#745c4e" />
      </mesh>
      {[-0.32, 0.32].map((x) => (
        <mesh key={x} position={[x, 0.82, 0.78]} rotation-z={x < 0 ? 0.5 : -0.5} scale={[0.5, 0.18, 0.25]}>
          <sphereGeometry args={[0.34, 10, 8]} />
          <meshStandardMaterial color="#80675a" />
        </mesh>
      ))}
      {[-0.35, 0.35].flatMap((x) =>
        [-0.42, 0.35].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, 0.2, z]}>
            <cylinderGeometry args={[0.06, 0.07, 0.45, 8]} />
            <meshStandardMaterial color="#6e594d" />
          </mesh>
        ))
      )}
      <Html center position={[0, 1.72, 0]} distanceFactor={16}>
        <span className="camp-character-label">ひつじ</span>
      </Html>
    </group>
  );
}

function DogFigure() {
  return (
    <group>
      <mesh position={[0, 0.56, 0]} scale={[0.58, 0.5, 0.9]} castShadow>
        <sphereGeometry args={[0.58, 16, 14]} />
        <meshStandardMaterial color="#c98f61" />
      </mesh>
      <mesh position={[0, 0.78, 0.62]} scale={[0.68, 0.72, 0.64]}>
        <sphereGeometry args={[0.46, 16, 14]} />
        <meshStandardMaterial color="#d59a69" />
      </mesh>
      {[-0.3, 0.3].map((x) => (
        <mesh key={x} position={[x, 0.96, 0.57]} rotation-z={x < 0 ? 0.45 : -0.45} scale={[0.34, 0.76, 0.22]}>
          <sphereGeometry args={[0.35, 12, 10]} />
          <meshStandardMaterial color="#80553f" />
        </mesh>
      ))}
      <mesh position={[0, 0.72, 1.02]} scale={[0.48, 0.38, 0.48]}>
        <sphereGeometry args={[0.32, 12, 10]} />
        <meshStandardMaterial color="#e6b681" />
      </mesh>
      {[-0.3, 0.3].flatMap((x) =>
        [-0.35, 0.35].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, 0.18, z]}>
            <cylinderGeometry args={[0.06, 0.075, 0.42, 8]} />
            <meshStandardMaterial color="#9a6647" />
          </mesh>
        ))
      )}
      <mesh position={[0, 0.72, -0.78]} rotation-z={-0.6}>
        <cylinderGeometry args={[0.05, 0.09, 0.82, 8]} />
        <meshStandardMaterial color="#c98f61" />
      </mesh>
      <Html center position={[0, 1.52, 0]} distanceFactor={16}>
        <span className="camp-character-label">わんちゃん</span>
      </Html>
    </group>
  );
}
