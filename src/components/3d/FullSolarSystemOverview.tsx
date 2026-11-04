"use client";

import { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { PLANETS } from "@/data/planets";

interface SolarSystemOverviewProps {
  onSelectPlanet: (index: number) => void;
}

// แผนผังระยะห่างและขนาดสัมพัทธ์ในมุมมอง Top-Down ทั้งระบบสุริยะ
const SYSTEM_BODIES = [
  { id: "sun", name: "THE SUN", radius: 2.8, orbitDist: 0, color: "#ffaa00", emissive: "#ff5500", speed: 0.005 },
  { id: "mercury", name: "MERCURY", radius: 0.55, orbitDist: 6.0, color: "#8c8680", emissive: "#1f1d1a", speed: 0.035 },
  { id: "venus", name: "VENUS", radius: 0.85, orbitDist: 9.5, color: "#e3bb76", emissive: "#382305", speed: 0.025 },
  { id: "earth", name: "EARTH", radius: 0.95, orbitDist: 13.5, color: "#1e70d4", emissive: "#0d2b5c", speed: 0.019 },
  { id: "mars", name: "MARS", radius: 0.7, orbitDist: 17.5, color: "#e0533c", emissive: "#3d1109", speed: 0.015 },
  { id: "jupiter", name: "JUPITER", radius: 1.85, orbitDist: 23.5, color: "#c99052", emissive: "#3d2208", speed: 0.011 },
  { id: "saturn", name: "SATURN", radius: 1.5, orbitDist: 30.5, color: "#e8c987", emissive: "#3b2e15", speed: 0.008, hasRings: true },
  { id: "uranus", name: "URANUS", radius: 1.1, orbitDist: 37.0, color: "#46dbe0", emissive: "#0f3e40", speed: 0.006 },
  { id: "neptune", name: "NEPTUNE", radius: 1.05, orbitDist: 43.5, color: "#275cd4", emissive: "#0b1c42", speed: 0.004 },
];

export function FullSolarSystemOverview({ onSelectPlanet }: SolarSystemOverviewProps) {
  const rootGroupRef = useRef<THREE.Group>(null!);

  return (
    <group ref={rootGroupRef}>
      {/* ดวงอาทิตย์ที่จุดกึ่งกลาง (Center Sun) */}
      <mesh
        position={[0, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectPlanet(0);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "default";
        }}
      >
        <sphereGeometry args={[2.8, 48, 48]} />
        <meshStandardMaterial
          color="#ffaa00"
          emissive="#ff5500"
          emissiveIntensity={3.5}
          roughness={0.1}
          metalness={0.0}
        />
      </mesh>

      {/* บรรยากาศเปลวสุริยะ Corona ของดวงอาทิตย์ */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[3.8, 32, 32]} />
        <meshBasicMaterial
          color="#ff6600"
          transparent
          opacity={0.35}
          side={THREE.BackSide}
        />
      </mesh>

      {/* ดาวเคราะห์ทุกดวงที่โคจรรอบพร้อมวงแหวนวงโคจรเรืองแสง */}
      {SYSTEM_BODIES.slice(1).map((item, idx) => {
        const originalIndex = PLANETS.findIndex((p) => p.id === item.id);
        return (
          <OrbitingPlanet
            key={item.id}
            item={item}
            planetIndex={originalIndex >= 0 ? originalIndex : idx + 1}
            onSelect={onSelectPlanet}
          />
        );
      })}
    </group>
  );
}

function OrbitingPlanet({
  item,
  planetIndex,
  onSelect,
}: {
  item: typeof SYSTEM_BODIES[0];
  planetIndex: number;
  onSelect: (index: number) => void;
}) {
  const bodyRef = useRef<THREE.Group>(null!);
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    const angle = elapsed * item.speed + planetIndex * 0.65;

    if (bodyRef.current) {
      bodyRef.current.position.x = Math.cos(angle) * item.orbitDist;
      bodyRef.current.position.z = Math.sin(angle) * item.orbitDist;
      bodyRef.current.rotation.y += 0.02;
    }
  });

  return (
    <>
      {/* วงโคจรเรืองแสงบนระนาบ XZ ด้วย Ring Geometry เพื่อความเข้ากันได้ 100% กับ Three.js fiber */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[item.orbitDist - 0.04, item.orbitDist + 0.04, 128]} />
        <meshBasicMaterial
          color={hovered ? "#00f0ff" : item.color}
          transparent
          opacity={hovered ? 0.8 : 0.35}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ดวงดาวที่กำลังโคจรจริง */}
      <group
        ref={bodyRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(planetIndex);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "default";
        }}
      >
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[item.radius, 32, 32]} />
          <meshStandardMaterial
            color={item.color}
            emissive={item.emissive}
            emissiveIntensity={hovered ? 0.6 : 0.25}
            roughness={0.4}
            metalness={0.2}
          />
        </mesh>

        {/* แสงเรืองรอบตัวดาว */}
        <mesh scale={[1.2, 1.2, 1.2]}>
          <sphereGeometry args={[item.radius, 24, 24]} />
          <meshBasicMaterial
            color={item.color}
            transparent
            opacity={hovered ? 0.45 : 0.2}
            side={THREE.BackSide}
          />
        </mesh>

        {/* วงแหวนดาวเสาร์ */}
        {item.hasRings && (
          <mesh rotation={[Math.PI / 2.3, 0.1, 0]}>
            <ringGeometry args={[item.radius * 1.35, item.radius * 2.35, 64]} />
            <meshStandardMaterial
              color="#e8c987"
              side={THREE.DoubleSide}
              transparent
              opacity={0.85}
            />
          </mesh>
        )}
      </group>
    </>
  );
}
