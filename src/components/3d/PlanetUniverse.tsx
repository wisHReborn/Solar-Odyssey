"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { PLANETS, PlanetData } from "@/data/planets";

function createPlanetTexture(planetId: string, baseColorHex: string) {
  if (typeof document === "undefined") return null;

  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = baseColorHex;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (planetId === "sun") {
    // Canvas solar flare & thermonuclear patterns
    for (let i = 0; i < 600; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const r = 4 + Math.random() * 35;
      ctx.fillStyle = Math.random() > 0.5 ? "rgba(255, 230, 100, 0.45)" : "rgba(255, 80, 0, 0.35)";
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (planetId === "mars") {
    for (let i = 0; i < 450; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const r = 2 + Math.random() * 22;
      ctx.fillStyle = Math.random() > 0.4 ? "rgba(70, 15, 5, 0.45)" : "rgba(220, 100, 60, 0.35)";
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    const gradN = ctx.createLinearGradient(0, 0, 0, 50);
    gradN.addColorStop(0, "rgba(255, 255, 255, 0.85)");
    gradN.addColorStop(1, "transparent");
    ctx.fillStyle = gradN;
    ctx.fillRect(0, 0, canvas.width, 50);

    const gradS = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - 50);
    gradS.addColorStop(0, "rgba(255, 255, 255, 0.85)");
    gradS.addColorStop(1, "transparent");
    ctx.fillStyle = gradS;
    ctx.fillRect(0, canvas.height - 50, canvas.width, 50);

  } else if (planetId === "jupiter") {
    for (let y = 0; y < canvas.height; y += 4) {
      const alpha = 0.25 + Math.sin(y * 0.08) * 0.25;
      ctx.fillStyle = y % 16 < 8 ? `rgba(90, 45, 15, ${alpha})` : `rgba(235, 190, 140, ${alpha})`;
      ctx.fillRect(0, y, canvas.width, 4);
    }
    ctx.fillStyle = "rgba(180, 40, 20, 0.85)";
    ctx.beginPath();
    ctx.ellipse(canvas.width * 0.65, canvas.height * 0.65, 75, 45, 0.1, 0, Math.PI * 2);
    ctx.fill();

  } else if (planetId === "saturn") {
    for (let y = 0; y < canvas.height; y += 3) {
      const alpha = 0.15 + Math.sin(y * 0.05) * 0.15;
      ctx.fillStyle = y % 12 < 6 ? `rgba(160, 130, 80, ${alpha})` : `rgba(240, 220, 180, ${alpha})`;
      ctx.fillRect(0, y, canvas.width, 3);
    }

  } else if (planetId === "kepler22b") {
    ctx.fillStyle = "#023e54";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < 250; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const r = 15 + Math.random() * 45;
      ctx.fillStyle = "rgba(0, 220, 170, 0.35)";
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

// โมเดลดาวแต่ละดวง มีระบบบินผ่านต่อเนื่อง (Trajectory Flyby)
function SinglePlanetItem({
  planet,
  index,
  currentIndex,
}: {
  planet: PlanetData;
  index: number;
  currentIndex: number;
}) {
  const groupRef = useRef<THREE.Group>(null!);
  const surfaceRef = useRef<THREE.Mesh>(null!);
  const cloudsRef = useRef<THREE.Mesh>(null!);
  const ringsRef = useRef<THREE.Mesh>(null!);

  const radius = planet.modelRadius || 1.8;
  const surfaceTexture = useMemo(() => createPlanetTexture(planet.id, planet.color), [planet.id, planet.color]);

  useFrame((state, delta) => {
    // หมุนตัวดาวรอบตัวเอง
    if (surfaceRef.current) surfaceRef.current.rotation.y += delta * 0.12;
    if (cloudsRef.current) cloudsRef.current.rotation.y += delta * 0.16;
    if (ringsRef.current) ringsRef.current.rotation.z += delta * 0.03;

    if (!groupRef.current) return;

    // คำนวณระยะห่างระหว่างดาวดวงนี้กับดวงปัจจุบัน
    const diff = index - currentIndex;

    // ตำแหน่งเป้าหมาย:
    // diff === 0  (ดวงปัจจุบัน): อยู่ที่พิกัด [X: 2.5 หรือ -2.5, Y: 0, Z: 0]
    // diff > 0   (ดวงถัดไป): ลอยรออยู่ด้านหลังลึกในอวกาศ [Z: -35 * diff]
    // diff < 0   (ดวงที่ผ่านมาแล้ว): บินพุ่งผ่านหน้าจอทะลุออกไปด้านหลัง [Z: +25 * Math.abs(diff)]
    const targetX = planet.position3D[0];
    const targetY = planet.position3D[1];
    let targetZ = 0;

    if (diff > 0) {
      targetZ = -32 * diff; // รออยู่ไกลๆ
    } else if (diff < 0) {
      targetZ = 20 * Math.abs(diff); // พุ่งทะลุผ่านหน้าเราไป
    }

    // ลอยตัวข้ามมิติอย่างต่อเนื่องด้วย Lerp นุ่มนวลสูงสุด
    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, 0.05);
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.05);
    groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, 0.04);

    // Parallax เมาส์เฉพาะดาวดวงปัจจุบัน
    if (diff === 0) {
      const mouseRotX = state.pointer.y * 0.15;
      const mouseRotY = state.pointer.x * 0.22;
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, mouseRotX, 0.03);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, mouseRotY, 0.03);
    }
  });

  return (
    <group ref={groupRef} position={[planet.position3D[0], planet.position3D[1], (index - currentIndex) * -32]}>
      {/* ผิวดาว */}
      <mesh ref={surfaceRef} castShadow receiveShadow>
        <sphereGeometry args={[radius, 128, 128]} />
        <meshStandardMaterial
          map={surfaceTexture || undefined}
          bumpMap={surfaceTexture || undefined}
          bumpScale={0.06}
          roughness={planet.roughness}
          metalness={0.15}
        />
      </mesh>

      {/* บรรยากาศ */}
      <mesh ref={cloudsRef} scale={[1.02, 1.02, 1.02]}>
        <sphereGeometry args={[radius, 64, 64]} />
        <meshStandardMaterial
          color={planet.atmosphereColor}
          transparent
          opacity={planet.id === "mars" ? 0.12 : 0.3}
          blending={THREE.AdditiveBlending}
          wireframe={planet.id === "kepler22b"}
        />
      </mesh>

      {/* แสงเรืองรอบขอบ */}
      <mesh scale={[1.06, 1.06, 1.06]}>
        <sphereGeometry args={[radius, 48, 48]} />
        <meshBasicMaterial
          color={planet.atmosphereColor}
          transparent
          opacity={0.18}
          side={THREE.BackSide}
        />
      </mesh>

      {/* วงแหวน (ถ้ามี) */}
      {planet.hasRings && (
        <group ref={ringsRef} rotation={[-Math.PI / 2.8, 0.2, 0]}>
          <mesh>
            <ringGeometry args={[radius * 1.35, radius * 2.1, 128]} />
            <meshStandardMaterial
              color={planet.color}
              side={THREE.DoubleSide}
              transparent
              opacity={0.88}
              roughness={0.4}
            />
          </mesh>
          <mesh>
            <ringGeometry args={[radius * 2.15, radius * 2.55, 128]} />
            <meshStandardMaterial
              color="#d4b47a"
              side={THREE.DoubleSide}
              transparent
              opacity={0.55}
              roughness={0.5}
            />
          </mesh>
        </group>
      )}
    </group>
  );
}

// Scene รวมดาวทุกดวงในห้วงอวกาศต่อเนื่อง
export function PlanetUniverse({ currentIndex }: { currentIndex: number }) {
  return (
    <group>
      {PLANETS.map((planet, index) => (
        <SinglePlanetItem
          key={planet.id}
          planet={planet}
          index={index}
          currentIndex={currentIndex}
        />
      ))}
    </group>
  );
}
