"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { PlanetData } from "@/data/planets";

interface PlanetModelProps {
  planet: PlanetData;
}

function createPlanetTexture(planetId: string, baseColorHex: string) {
  if (typeof document === "undefined") return null;

  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = baseColorHex;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (planetId === "mars") {
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

export function PlanetModel({ planet }: PlanetModelProps) {
  const mainGroup = useRef<THREE.Group>(null!);
  const surfaceRef = useRef<THREE.Mesh>(null!);
  const cloudsRef = useRef<THREE.Mesh>(null!);
  const ringsRef = useRef<THREE.Mesh>(null!);
  const targetColor = useMemo(() => new THREE.Color(planet.color), [planet.color]);
  const targetAtmoColor = useMemo(() => new THREE.Color(planet.atmosphereColor), [planet.atmosphereColor]);

  const radius = planet.modelRadius || 1.95;

  const surfaceTexture = useMemo(() => {
    return createPlanetTexture(planet.id, planet.color);
  }, [planet.id, planet.color]);

  useFrame((state, delta) => {
    if (surfaceRef.current) {
      surfaceRef.current.rotation.y += delta * 0.12;
      // Fade เปลี่ยนสีผิวแบบสมูท ไม่กระตุก
      const mat = surfaceRef.current.material as THREE.MeshStandardMaterial;
      if (mat) {
        mat.color.lerp(targetColor, 0.08);
      }
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.16;
      cloudsRef.current.rotation.x += delta * 0.01;
      const cloudMat = cloudsRef.current.material as THREE.MeshStandardMaterial;
      if (cloudMat) {
        cloudMat.color.lerp(targetAtmoColor, 0.08);
      }
    }
    if (ringsRef.current) {
      ringsRef.current.rotation.z += delta * 0.03;
    }

    // เลื่อนพิกัดดาวข้ามฝั่งแบบต่อเนื่อง นุ่มนวลสูงสุด (Lerp Factor 0.06)
    if (mainGroup.current) {
      const [tx, ty, tz] = planet.position3D;
      mainGroup.current.position.x = THREE.MathUtils.lerp(mainGroup.current.position.x, tx, 0.06);
      mainGroup.current.position.y = THREE.MathUtils.lerp(mainGroup.current.position.y, ty, 0.06);
      mainGroup.current.position.z = THREE.MathUtils.lerp(mainGroup.current.position.z, tz, 0.06);

      // Parallax ตามเมาส์
      const mouseRotX = state.pointer.y * 0.15;
      const mouseRotY = state.pointer.x * 0.22;
      mainGroup.current.rotation.x = THREE.MathUtils.lerp(mainGroup.current.rotation.x, mouseRotX, 0.04);
      mainGroup.current.rotation.y = THREE.MathUtils.lerp(mainGroup.current.rotation.y, mouseRotY, 0.04);
    }
  });

  return (
    <group ref={mainGroup} position={planet.position3D}>
      {/* 1. ผิวดาวหลัก */}
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

      {/* 2. เมฆและชั้นบรรยากาศ */}
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

      {/* 3. แสงขอบเรืองรอง */}
      <mesh scale={[1.06, 1.06, 1.06]}>
        <sphereGeometry args={[radius, 48, 48]} />
        <meshBasicMaterial
          color={planet.atmosphereColor}
          transparent
          opacity={0.18}
          side={THREE.BackSide}
        />
      </mesh>

      {/* 4. วงแหวนดาวเสาร์ */}
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
