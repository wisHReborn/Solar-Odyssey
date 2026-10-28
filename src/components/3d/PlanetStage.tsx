"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { PlanetData, HotspotData, TransitionVector } from "@/data/planets";
import { sounds } from "@/utils/sounds";

interface PlanetStageProps {
  allPlanets?: PlanetData[];
  currentIndex?: number;
  currentPlanet: PlanetData;
  prevPlanet: PlanetData | null;
  transitionProgress: number;
  direction: number;
  rotationSpeed: number;
  isScanMode: boolean;
  isCoreMode: boolean;
  selectedHotspot: HotspotData | null;
  onSelectHotspot: (h: HotspotData | null) => void;
}

const textureCache = new Map<string, THREE.CanvasTexture>();

function getOptimizedStylizedTexture(planetId: string, baseColorHex: string) {
  if (typeof document === "undefined") return null;
  if (textureCache.has(planetId)) return textureCache.get(planetId)!;

  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = baseColorHex;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (planetId === "sun") {
    ctx.fillStyle = "#ff8800";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < 120; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const r = 12 + Math.random() * 45;
      ctx.fillStyle = Math.random() > 0.5 ? "rgba(255, 230, 80, 0.6)" : "rgba(255, 60, 0, 0.4)";
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (planetId === "mercury") {
    for (let i = 0; i < 70; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const r = 6 + Math.random() * 26;
      ctx.fillStyle = "#262320";
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "#bdb7ad";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, y, r - 2, 0, Math.PI);
      ctx.stroke();
    }
  } else if (planetId === "venus") {
    for (let y = 30; y < canvas.height - 30; y += 45) {
      ctx.fillStyle = "#ffe49e";
      ctx.beginPath();
      ctx.ellipse(canvas.width * 0.5, y, canvas.width * 0.45, 16, 0.05, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (planetId === "earth") {
    ctx.fillStyle = "#1e70d4";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const continents = [
      { x: 300, y: 220, rx: 110, ry: 75, r: 0.1 },
      { x: 420, y: 340, rx: 80, ry: 100, r: -0.1 },
      { x: 680, y: 200, rx: 160, ry: 90, r: 0 },
      { x: 820, y: 350, rx: 70, ry: 50, r: 0.15 },
    ];
    ctx.fillStyle = "#2ec458";
    continents.forEach((c) => {
      ctx.beginPath();
      ctx.ellipse(c.x, c.y, c.rx, c.ry, c.r, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    for (let i = 0; i < 20; i++) {
      const cx = (i * 120) % canvas.width;
      const cy = 100 + (i * 35) % (canvas.height - 200);
      ctx.beginPath();
      ctx.ellipse(cx, cy, 55, 14, 0.05, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, 45);
    ctx.fillRect(0, canvas.height - 55, canvas.width, 55);
  } else if (planetId === "mars") {
    ctx.fillStyle = "#3d0e05";
    ctx.beginPath();
    ctx.ellipse(canvas.width * 0.5, canvas.height * 0.54, 180, 22, 0.06, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, 45);
  } else if (planetId === "jupiter") {
    const bands = ["#f7d7aa", "#8f4c1c", "#fcdbb1", "#693310", "#fad5a2"];
    bands.forEach((col, idx) => {
      ctx.fillStyle = col;
      ctx.fillRect(0, 60 + idx * 80, canvas.width, 50);
    });
    ctx.fillStyle = "#e63919";
    ctx.beginPath();
    ctx.ellipse(canvas.width * 0.65, canvas.height * 0.65, 95, 52, 0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ff774d";
    ctx.beginPath();
    ctx.ellipse(canvas.width * 0.65, canvas.height * 0.65, 50, 25, 0.08, 0, Math.PI * 2);
    ctx.fill();
  } else if (planetId === "saturn") {
    const bands = ["#eed7a1", "#cfb274", "#f7e3b5", "#b89758"];
    bands.forEach((col, idx) => {
      ctx.fillStyle = col;
      ctx.fillRect(0, 70 + idx * 95, canvas.width, 55);
    });
  } else if (planetId === "uranus") {
    ctx.fillStyle = "#46dbe0";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#a1f4f7";
    ctx.fillRect(0, 150, canvas.width, 60);
  } else if (planetId === "neptune") {
    ctx.fillStyle = "#1e4db8";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#091f54";
    ctx.beginPath();
    ctx.ellipse(canvas.width * 0.45, canvas.height * 0.52, 85, 42, -0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#8fb3ff";
    ctx.fillRect(0, 320, canvas.width, 24);
  }

  const texture = new THREE.CanvasTexture(canvas);
  textureCache.set(planetId, texture);
  return texture;
}

// ละอองอนุภาคโคจรเรืองแสงรอบดวงดาว (Orbiting Plasma Micro-Particles)
function OrbitingDustCloud({ radius, color }: { radius: number; color: string }) {
  const pointsRef = useRef<THREE.Points>(null!);
  const count = 160;

  const [positions, speeds] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI * 0.7;
      const dist = radius * (1.35 + Math.random() * 0.9);
      pos[i * 3] = dist * Math.cos(theta) * Math.cos(phi);
      pos[i * 3 + 1] = dist * Math.sin(phi);
      pos[i * 3 + 2] = dist * Math.sin(theta) * Math.cos(phi);
      spd[i] = 0.2 + Math.random() * 0.5;
    }
    return [pos, spd];
  }, [radius]);

  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.12;
      pointsRef.current.rotation.x += delta * 0.04;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color={color}
        transparent
        opacity={0.65}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// ดวงจันทร์บริวาร 3D โคจรรอบดวงดาวจริง (Orbital Moons System)
function OrbitalMoon({
  orbitRadius,
  moonRadius,
  speed,
  inclination,
  color,
  label,
}: {
  orbitRadius: number;
  moonRadius: number;
  speed: number;
  inclination: number;
  color: string;
  label?: string;
}) {
  const moonRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (moonRef.current) {
      const angle = state.clock.getElapsedTime() * speed;
      moonRef.current.position.x = Math.cos(angle) * orbitRadius;
      moonRef.current.position.z = Math.sin(angle) * orbitRadius;
      moonRef.current.position.y = Math.sin(angle * 1.5) * (orbitRadius * 0.25);
    }
  });

  return (
    <group rotation={[inclination, 0, 0]}>
      {/* เส้นวงโคจรเรืองแสงจางๆ (Subtle Orbit Track) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[orbitRadius - 0.012, orbitRadius + 0.012, 64]} />
        <meshBasicMaterial
          color={color}
          side={THREE.DoubleSide}
          transparent
          opacity={0.18}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* ตัวดวงจันทร์ 3D */}
      <group ref={moonRef}>
        <mesh>
          <sphereGeometry args={[moonRadius, 24, 24]} />
          <meshStandardMaterial color={color} roughness={0.7} />
        </mesh>
        {/* แสงเรืองรอบดวงจันทร์ */}
        <mesh scale={[1.3, 1.3, 1.3]}>
          <sphereGeometry args={[moonRadius, 16, 16]} />
          <meshBasicMaterial color={color} transparent opacity={0.3} side={THREE.BackSide} />
        </mesh>
        {label && (
          <Html distanceFactor={9} center>
            <div className="pointer-events-none select-none px-1.5 py-0.5 rounded bg-black/80 border border-white/20 text-[8px] font-mono tracking-widest text-neutral-300 uppercase whitespace-nowrap shadow-md">
              {label}
            </div>
          </Html>
        )}
      </group>
    </group>
  );
}

function StylizedPlanetMesh({
  planet,
  opacity,
  position,
  scale,
  rotationSpeed,
  isScanMode,
  isCoreMode,
  selectedHotspot,
  onSelectHotspot,
  isInteractive,
}: {
  planet: PlanetData;
  opacity: number;
  position: [number, number, number];
  scale: number;
  rotationSpeed: number;
  isScanMode: boolean;
  isCoreMode: boolean;
  selectedHotspot: HotspotData | null;
  onSelectHotspot: (h: HotspotData | null) => void;
  isInteractive: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null!);
  const meshRef = useRef<THREE.Mesh>(null!);
  const scanRingRef = useRef<THREE.Mesh>(null!);
  const coreGroupRef = useRef<THREE.Group>(null!);

  const texture = useMemo(() => getOptimizedStylizedTexture(planet.id, planet.color), [planet.id, planet.color]);
  const radius = (planet.modelRadius || 1.8) * scale;

  const isDragging = useRef(false);
  const prevPointer = useRef({ x: 0, y: 0 });
  const userRotation = useRef({ x: 0, y: 0 });
  const rotationVelocity = useRef({ x: 0, y: 0 });

  // ค่าการระเบิดแยกชั้นเปลือกดาว (Exploded View Interpolation)
  const coreProgress = useRef(0);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Smooth transition สำหรับโหมดผ่าแกนกลาง
    const targetProgress = isCoreMode ? 1 : 0;
    coreProgress.current = THREE.MathUtils.lerp(coreProgress.current, targetProgress, delta * 4.5);

    // 1. การหมุนรอบตัวเองของลูกบอลดาว
    const spinSpeed = delta * 0.14 * rotationSpeed;
    if (planet.id === "uranus") {
      meshRef.current.rotation.z += spinSpeed;
    } else {
      meshRef.current.rotation.y += spinSpeed;
    }

    // 2. ตอบสนองต่อการขยับเมาส์ (Hover Tilt & Orbit Follower)
    const targetTiltX = -state.pointer.y * 0.45;
    const targetTiltY = state.pointer.x * 0.55;

    if (!isDragging.current) {
      userRotation.current.x += rotationVelocity.current.x;
      userRotation.current.y += rotationVelocity.current.y;
      rotationVelocity.current.x *= 0.92;
      rotationVelocity.current.y *= 0.92;
    }

    if (groupRef.current) {
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        userRotation.current.x + targetTiltX,
        0.08
      );
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        userRotation.current.y + targetTiltY,
        0.08
      );
    }

    if (scanRingRef.current) {
      scanRingRef.current.rotation.z += delta * 0.8;
    }

    if (coreGroupRef.current) {
      coreGroupRef.current.rotation.y -= delta * 0.2;
    }
  });

  const crustDisplace = coreProgress.current * 1.4; // ระยะที่เปลือกโลกแยกตัวออก

  return (
    <group position={position}>
      <group
        ref={groupRef}
        onPointerDown={(e) => {
          if (!isInteractive) return;
          e.stopPropagation();
          isDragging.current = true;
          prevPointer.current = { x: e.clientX, y: e.clientY };
        }}
        onPointerUp={() => {
          isDragging.current = false;
        }}
        onPointerMove={(e) => {
          if (!isDragging.current || !isInteractive) return;
          const dx = e.clientX - prevPointer.current.x;
          const dy = e.clientY - prevPointer.current.y;
          prevPointer.current = { x: e.clientX, y: e.clientY };

          userRotation.current.y += dx * 0.007;
          userRotation.current.x += dy * 0.007;
          rotationVelocity.current = { x: dy * 0.002, y: dx * 0.002 };
        }}
      >
        {/* 1. แกนกลางดวงดาวหลอมเหลว (Planetary Core Inner Spheres) แสดงเฉพาะตอนกด Inspect Core */}
        {planet.coreData && coreProgress.current > 0.01 && (
          <group ref={coreGroupRef}>
            {/* แกนเหล็กแข็งในสุด (Inner Solid Core) */}
            <mesh scale={[0.35, 0.35, 0.35]}>
              <sphereGeometry args={[radius, 32, 32]} />
              <meshStandardMaterial
                color="#ffffff"
                emissive="#ffaa00"
                emissiveIntensity={1.8}
                roughness={0.1}
              />
            </mesh>

            {/* แกนชั้นกลาง (Mantle / Molten Layer) */}
            <mesh scale={[0.62, 0.62, 0.62]}>
              <sphereGeometry args={[radius, 32, 32]} />
              <meshStandardMaterial
                color="#ff5500"
                emissive="#ff2200"
                emissiveIntensity={0.8}
                wireframe={coreProgress.current > 0.3}
                transparent
                opacity={opacity * 0.9}
              />
            </mesh>

            {/* สนามแม่เหล็กหมุนวน (Magnetic Field Lines Ring) */}
            {coreProgress.current > 0.1 && (
              <mesh rotation={[Math.PI / 3, 0, 0]}>
                <torusGeometry args={[radius * 0.9, 0.02, 16, 64]} />
                <meshBasicMaterial color="#00f0ff" transparent opacity={coreProgress.current * 0.8} />
              </mesh>
            )}
          </group>
        )}

        {/* 2. ผิวดาวหลัก: ในสภาวะปกติ (isCoreMode ปิด) เป็นลูกแก้วกลมไร้รอยต่อ 100% ไร้เส้นผ่ากลาง */}
        {coreProgress.current < 0.01 ? (
          <group>
            {/* ขอบการ์ตูน Cel-Shaded ไร้รอยต่อ */}
            <mesh scale={[1.04, 1.04, 1.04]}>
              <sphereGeometry args={[radius, 64, 64]} />
              <meshBasicMaterial
                color="#05070a"
                side={THREE.BackSide}
                transparent
                opacity={opacity * 0.95}
              />
            </mesh>
            {/* ผิวดาวทรงกลมสมบูรณ์แบบ */}
            <mesh ref={meshRef}>
              <sphereGeometry args={[radius, 64, 64]} />
              <meshStandardMaterial
                map={texture || undefined}
                roughness={0.4}
                metalness={0.1}
                transparent
                opacity={opacity}
              />
            </mesh>
          </group>
        ) : (
          /* สภาวะผ่าแกนดาว: แยกซีกบน-ล่าง */
          <group>
            <group position={[0, crustDisplace, 0]}>
              <mesh scale={[1.04, 1.04, 1.04]}>
                <sphereGeometry args={[radius, 48, 24, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
                <meshBasicMaterial
                  color="#05070a"
                  side={THREE.BackSide}
                  transparent
                  opacity={opacity * 0.95}
                />
              </mesh>
              <mesh ref={meshRef}>
                <sphereGeometry args={[radius, 64, 32, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
                <meshStandardMaterial
                  map={texture || undefined}
                  roughness={0.4}
                  metalness={0.1}
                  transparent
                  opacity={opacity}
                  wireframe={coreProgress.current > 0.85}
                />
              </mesh>
            </group>

            <group position={[0, -crustDisplace, 0]}>
              <mesh scale={[1.04, 1.04, 1.04]}>
                <sphereGeometry args={[radius, 48, 24, 0, Math.PI * 2, Math.PI * 0.5, Math.PI * 0.5]} />
                <meshBasicMaterial
                  color="#05070a"
                  side={THREE.BackSide}
                  transparent
                  opacity={opacity * 0.95}
                />
              </mesh>
              <mesh>
                <sphereGeometry args={[radius, 64, 32, 0, Math.PI * 2, Math.PI * 0.5, Math.PI * 0.5]} />
                <meshStandardMaterial
                  map={texture || undefined}
                  roughness={0.4}
                  metalness={0.1}
                  transparent
                  opacity={opacity}
                  wireframe={coreProgress.current > 0.85}
                />
              </mesh>
            </group>
          </group>
        )}

        {/* 4. แสงเรืองบรรยากาศ (Atmosphere Glow) */}
        <mesh scale={[1.08, 1.08, 1.08]}>
          <sphereGeometry args={[radius, 32, 32]} />
          <meshBasicMaterial
            color={planet.atmosphereColor}
            transparent
            opacity={opacity * 0.3 * (1 - coreProgress.current * 0.5)}
            side={THREE.BackSide}
          />
        </mesh>

        {/* 4. วงแหวนดาวเสาร์: คงมุมเอียงระนาบคงที่ (ไม่หมุนคว้าง) ให้ความรู้สึกสงบ นิ่ง สง่างาม */}
        {planet.hasRings && (
          <group rotation={[-Math.PI / 2.7, 0.22, 0]}>
            <mesh>
              <ringGeometry args={[radius * 1.32, radius * 2.22, 64]} />
              <meshBasicMaterial color="#05070a" side={THREE.DoubleSide} transparent opacity={opacity * 0.7} />
            </mesh>
            <mesh>
              <ringGeometry args={[radius * 1.36, radius * 2.18, 64]} />
              <meshStandardMaterial
                color="#fadc8c"
                side={THREE.DoubleSide}
                transparent
                opacity={opacity * 0.95}
                roughness={0.2}
              />
            </mesh>
          </group>
        )}

        {/* 5. GARGANTUA ACCRETION DISK & GRAVITATIONAL LENSING (สำหรับหลุมดำ) */}
        {planet.id === "blackhole" && (
          <group>
            {/* หลุมดำใจกลางกลืนกินแสงสมบูรณ์แบบ (Event Horizon Core) */}
            <mesh scale={[1.02, 1.02, 1.02]}>
              <sphereGeometry args={[radius * 0.95, 48, 48]} />
              <meshBasicMaterial color="#000000" />
            </mesh>

            {/* จานมวลสารหมุนวนแนวนอน (Horizontal Relativistic Accretion Disk) */}
            <mesh rotation={[-Math.PI / 2.5, 0.1, 0]}>
              <ringGeometry args={[radius * 1.25, radius * 3.4, 80]} />
              <meshBasicMaterial
                color="#ff6600"
                side={THREE.DoubleSide}
                transparent
                opacity={0.88}
                blending={THREE.AdditiveBlending}
              />
            </mesh>

            {/* วงแหวนหักเหแสงตามทฤษฎีไอน์สไตน์ (Vertical Einstein Ring / Lensing) */}
            <mesh rotation={[0, 0, 0]}>
              <ringGeometry args={[radius * 1.15, radius * 2.8, 80]} />
              <meshBasicMaterial
                color="#ffaa00"
                side={THREE.DoubleSide}
                transparent
                opacity={0.5}
                blending={THREE.AdditiveBlending}
              />
            </mesh>

            {/* ลำแสง Photon Ring สว่างจ้าขอบฟ้าเหตุการณ์ */}
            <mesh scale={[1.16, 1.16, 1.16]}>
              <sphereGeometry args={[radius, 32, 32]} />
              <meshBasicMaterial
                color="#00f0ff"
                wireframe
                transparent
                opacity={0.4}
              />
            </mesh>
          </group>
        )}

        {/* 6. SIGNATURE VISUAL PHENOMENA สำหร้บแต่ละดวงดาว (Sci-Fi AAA VFX) */}
        
        {/* ละอองไมโครพลาสมาหมุนวนรอบดวงดาว (Orbiting Atmospheric Plasma Cloud) */}
        <OrbitingDustCloud radius={radius} color={planet.atmosphereColor} />

        {/* EARTH: ออโรร่าแสงเหนือ-แสงใต้ + ดวงจันทร์ Luna โคจรรอบโลกจริง */}
        {planet.id === "earth" && (
          <group>
            {/* วงแหวนแสงเหนือที่ขั้วโลกเหนือ */}
            <mesh position={[0, radius * 0.88, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[radius * 0.25, radius * 0.48, 32]} />
              <meshBasicMaterial
                color="#00ffaa"
                side={THREE.DoubleSide}
                transparent
                opacity={0.7}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
            {/* วงแหวนแสงใต้ที่ขั้วโลกใต้ */}
            <mesh position={[0, -radius * 0.88, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[radius * 0.25, radius * 0.48, 32]} />
              <meshBasicMaterial
                color="#00aaff"
                side={THREE.DoubleSide}
                transparent
                opacity={0.65}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
            {/* ชั้นโอโซนเรืองแสงสีฟ้าสดใส (Atmospheric Rayleigh Rim) */}
            <mesh scale={[1.12, 1.12, 1.12]}>
              <sphereGeometry args={[radius, 32, 32]} />
              <meshBasicMaterial
                color="#38bdf8"
                transparent
                opacity={0.22}
                side={THREE.BackSide}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
            {/* ดวงจันทร์ LUNA 3D โคจรรอบโลก */}
            <OrbitalMoon
              orbitRadius={radius * 2.1}
              moonRadius={0.16}
              speed={0.35}
              inclination={0.25}
              color="#d4d4d8"
              label="LUNA // 384,400 KM"
            />
          </group>
        )}

        {/* JUPITER: ระบบ 2 ดวงจันทร์บริวารหลัก (EUROPA & IO) + สนามแม่เหล็กขั้วเหนือ */}
        {planet.id === "jupiter" && (
          <group>
            {/* ดวงจันทร์น้ำแข็ง EUROPA */}
            <OrbitalMoon
              orbitRadius={radius * 1.85}
              moonRadius={0.14}
              speed={0.48}
              inclination={0.15}
              color="#e0e7ff"
              label="EUROPA // OCEAN MOON"
            />
            {/* ดวงจันทร์ภูเขาไฟ IO */}
            <OrbitalMoon
              orbitRadius={radius * 2.35}
              moonRadius={0.15}
              speed={0.32}
              inclination={-0.2}
              color="#fde047"
              label="IO // VOLCANIC MOON"
            />
          </group>
        )}

        {/* SATURN: ดวงจันทร์ TITAN ทะยานรอบวงแหวนยักษ์ */}
        {planet.id === "saturn" && (
          <group>
            <OrbitalMoon
              orbitRadius={radius * 2.75}
              moonRadius={0.18}
              speed={0.26}
              inclination={-0.35}
              color="#f59e0b"
              label="TITAN // METHANE LAKES"
            />
          </group>
        )}

        {/* MARS: ดวงจันทร์ PHOBOS โคจรระยะประชิด */}
        {planet.id === "mars" && (
          <group>
            <OrbitalMoon
              orbitRadius={radius * 1.65}
              moonRadius={0.09}
              speed={0.65}
              inclination={0.1}
              color="#a1a1aa"
              label="PHOBOS // 6,000 KM"
            />
          </group>
        )}

        {/* SATURN: วงแหวนฝุ่นน้ำแข็งเรืองแสงสะท้อนระดับ Multi-Ring Density */}
        {planet.id === "saturn" && (
          <group rotation={[-Math.PI / 2.7, 0.22, 0]}>
            {/* วงแหวนชั้นนอก F Ring เรืองแสงเรขาคณิตบางเฉียบ */}
            <mesh>
              <ringGeometry args={[radius * 2.25, radius * 2.32, 64]} />
              <meshBasicMaterial color="#a7f3d0" side={THREE.DoubleSide} transparent opacity={0.6} blending={THREE.AdditiveBlending} />
            </mesh>
            {/* อนุภาคน้ำแข็งสะท้อนแสงรอบวงแหวน (Subtle Halo) */}
            <mesh>
              <ringGeometry args={[radius * 1.34, radius * 2.24, 64]} />
              <meshBasicMaterial color="#fed7aa" side={THREE.DoubleSide} transparent opacity={0.25} blending={THREE.AdditiveBlending} />
            </mesh>
          </group>
        )}

        {/* JUPITER: มหาพายุหมุนและสนามแม่เหล็กขนาดมหึมา (Jovian Magnetosphere Aurora) */}
        {planet.id === "jupiter" && (
          <group>
            {/* รังสีสนามแม่เหล็ก Jovian Flux Tube */}
            <mesh scale={[1.15, 1.15, 1.15]}>
              <sphereGeometry args={[radius, 24, 24]} />
              <meshBasicMaterial
                color="#f97316"
                wireframe
                transparent
                opacity={0.16}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
            {/* ออโรร่าพายุแม่เหล็กขั้วเหนือ */}
            <mesh position={[0, radius * 0.94, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[radius * 0.2, radius * 0.42, 32]} />
              <meshBasicMaterial
                color="#38bdf8"
                side={THREE.DoubleSide}
                transparent
                opacity={0.8}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
          </group>
        )}

        {/* MARS: ม่านพายุฝุ่นทรายสีส้มอิฐครอบคลุมดาว (Global Dust Storm Haze) */}
        {planet.id === "mars" && (
          <group>
            <mesh scale={[1.11, 1.11, 1.11]}>
              <sphereGeometry args={[radius, 32, 32]} />
              <meshBasicMaterial
                color="#ea580c"
                transparent
                opacity={0.28}
                side={THREE.BackSide}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
          </group>
        )}

        {/* VENUS: ชั้นบรรยากาศกรดซัลฟิวริกสะท้อนแสงสีทองเข้มข้น (Super-Reflective Albedo) */}
        {planet.id === "venus" && (
          <group>
            <mesh scale={[1.12, 1.12, 1.12]}>
              <sphereGeometry args={[radius, 32, 32]} />
              <meshBasicMaterial
                color="#facc15"
                transparent
                opacity={0.35}
                side={THREE.BackSide}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
          </group>
        )}

        {/* MERCURY: คลื่นรังสีความร้อนจากดวงอาทิตย์ (Solar Heat Flare Shimmer) */}
        {planet.id === "mercury" && (
          <group>
            <mesh scale={[1.12, 1.12, 1.12]}>
              <sphereGeometry args={[radius, 24, 24]} />
              <meshBasicMaterial
                color="#ffffff"
                wireframe
                transparent
                opacity={0.12}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
          </group>
        )}

        {/* NEPTUNE: วงแหวนอนุภาคก๊าซมีเทนสีน้ำเงินมรกตเรืองแสง (Ethereal Methane Ring) */}
        {planet.id === "neptune" && (
          <group rotation={[-Math.PI / 3, 0.3, 0]}>
            <mesh>
              <ringGeometry args={[radius * 1.35, radius * 1.55, 64]} />
              <meshBasicMaterial
                color="#38bdf8"
                side={THREE.DoubleSide}
                transparent
                opacity={0.55}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
          </group>
        )}

        {/* ยูเรนัส */}
        {planet.id === "uranus" && (
          <mesh rotation={[Math.PI / 2.1, 0.1, 0]}>
            <ringGeometry args={[radius * 1.38, radius * 1.48, 48]} />
            <meshBasicMaterial
              color="#54f3f7"
              side={THREE.DoubleSide}
              transparent
              opacity={opacity * 0.65}
            />
          </mesh>
        )}

        {/* เรดาร์สแกน */}
        {isScanMode && isInteractive && (
          <mesh ref={scanRingRef}>
            <ringGeometry args={[radius * 1.15, radius * 1.18, 48]} />
            <meshBasicMaterial
              color="#00f0ff"
              side={THREE.DoubleSide}
              transparent
              opacity={0.7}
              wireframe
            />
          </mesh>
        )}

        {/* Hotspots */}
        {isScanMode &&
          isInteractive &&
          planet.hotspots?.map((spot) => (
            <group key={spot.id} position={spot.position}>
              <Html center distanceFactor={8}>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    sounds.playBeep(1200);
                    onSelectHotspot(selectedHotspot?.id === spot.id ? null : spot);
                  }}
                  className="cursor-pointer group relative flex items-center justify-center pointer-events-auto"
                >
                  <span className="absolute w-5 h-5 rounded-full bg-cyan-400/40 animate-ping" />
                  <span className="relative w-3.5 h-3.5 rounded-full bg-cyan-300 border-2 border-white shadow-[0_0_15px_#00f0ff]" />

                  <div
                    className={`absolute bottom-6 left-1/2 -translate-x-1/2 w-48 p-2.5 rounded-xl bg-black/95 border border-cyan-400/60 backdrop-blur-md text-left transition-all duration-200 pointer-events-none shadow-2xl ${
                      selectedHotspot?.id === spot.id ? "opacity-100 scale-100" : "opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100"
                    }`}
                  >
                    <div className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                      TARGET // {spot.name}
                    </div>
                    <div className="text-[11px] text-neutral-200 mt-1 leading-snug">
                      {spot.detail}
                    </div>
                  </div>
                </div>
              </Html>
            </group>
          ))}
      </group>
    </group>
  );
}

// คำนวณเวกเตอร์ตำแหน่งตามประเภท flyTrajectory โดยรักษาระนาบให้อยู่ในฝั่งของดาว (ไม่ล้ำไปทับ HUD)
function getTrajectoryVector(
  trajectory: TransitionVector,
  isExit: boolean,
  direction: number,
  isPlanetOnRight: boolean
): [number, number, number] {
  const sign = direction >= 0 ? 1 : -1;
  // ค่า X ต้องอยู่ในแดนของตัวเองเสมอ (ถ้าดาวอยู่ขวา ขยับเข้า-ออกเฉพาะโซนขวา ถ้าอยู่ซ้ายเฉพาะโซนซ้าย)
  const xSide = isPlanetOnRight ? 1 : -1;

  switch (trajectory) {
    case "dive-top":
      // ดิ่งลงมาจากด้านบนในโซนของตัวเอง
      return isExit ? [0, -9 * sign, 4] : [0, 9 * sign, -8];

    case "ascend-bottom":
      // ทะยานขึ้นมาจากด้านล่างในโซนของตัวเอง
      return isExit ? [0, 9 * sign, 4] : [0, -9 * sign, -8];

    case "fly-in-right":
      // โฉบเข้าออกจากขอบนอกจอ (ไม่ตัดผ่านกึ่งกลางไปฝั่งข้อความ)
      return isExit ? [xSide * 3, 0, 7] : [xSide * 5, 0, -8];

    case "fly-in-left":
      return isExit ? [-xSide * 3, 0, 7] : [-xSide * 5, 0, -8];

    case "diagonal-slice":
      return isExit ? [xSide * 2, -5 * sign, 5] : [xSide * 3, 6 * sign, -9];

    case "hyper-spiral":
    default:
      return isExit ? [0, 0, 8] : [0, 0, -14];
  }
}

// ฟังก์ชัน Easing เดียวกันกับ Framer Motion (Cubic-Bezier [0.16, 1, 0.3, 1] - Cinematic EaseOut)
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function PlanetStage({
  allPlanets = [],
  currentIndex = 0,
  currentPlanet,
  prevPlanet,
  transitionProgress,
  direction,
  rotationSpeed,
  isScanMode,
  isCoreMode,
  selectedHotspot,
  onSelectHotspot,
}: PlanetStageProps) {
  // progress 0 ถึง 1
  const t = THREE.MathUtils.clamp(transitionProgress, 0, 1);
  const easedEnter = easeOutCubic(t);
  const easedExit = easeOutCubic(t);

  const isCurrentRight = currentPlanet.position3D[0] > 0;
  const isPrevRight = prevPlanet ? prevPlanet.position3D[0] > 0 : true;

  // คำนวณ Offset Vector สำหรับดาวดวงใหม่ที่กำลังเข้ามา
  const curTrajOffset = getTrajectoryVector(currentPlanet.flyTrajectory, false, direction, isCurrentRight);
  const curX = currentPlanet.position3D[0] + curTrajOffset[0] * (1 - easedEnter);
  const curY = currentPlanet.position3D[1] + curTrajOffset[1] * (1 - easedEnter);
  const curZ = currentPlanet.position3D[2] + curTrajOffset[2] * (1 - easedEnter);
  
  // Opacity ของดาวใหม่: เริ่มจาก 0 และกลายเป็น 1 เต็มที่ตั้งแต่ t >= 0.7 และไม่มีวันหายไปเมื่อ t=1
  const curOpacity = THREE.MathUtils.clamp(t * 1.6, 0, 1);
  const curScale = 0.85 + easedEnter * 0.15;

  // คำนวณ Offset Vector สำหรับดาวดวงก่อนหน้าที่กำลังจะลับไป
  const prevTrajOffset = prevPlanet
    ? getTrajectoryVector(prevPlanet.flyTrajectory, true, direction, isPrevRight)
    : [0, 0, 8];
  const prevX = prevPlanet ? prevPlanet.position3D[0] + prevTrajOffset[0] * easedExit : 0;
  const prevY = prevPlanet ? prevPlanet.position3D[1] + prevTrajOffset[1] * easedExit : 0;
  const prevZ = prevPlanet ? prevPlanet.position3D[2] + prevTrajOffset[2] * easedExit : 0;
  const prevOpacity = THREE.MathUtils.clamp(1 - t * 1.5, 0, 1);
  const prevScale = 1.0 + easedExit * 0.2;

  return (
    <group>
      {/* แถวดาวที่ผ่านมาแล้วทั้งหมด: เรียงแถวเฉียงขึ้นมุมซ้ายบนอย่างชัดเจน (Steep Top-Left Orbital Line) */}
      {currentIndex > 0 && (
        <group>
          {allPlanets.slice(0, currentIndex).map((prevBody, pIdx) => {
            // dist = 1 คือดวงที่เพิ่งเลื่อนผ่านมา (เช่น ถ้าอยู่ Venus ดวงนี้คือ Mercury)
            // ยิ่ง dist มาก ยิ่งอยู่ลึกลงไปจนถึงดวงอาทิตย์
            const dist = currentIndex - pIdx;

            // ปรับองศาเฉียงมุมซ้ายบนให้เอียงเยอะขึ้น และชัดเจน:
            // ดวงแรกสุด (dist = 1) ไปลอยอยู่ครึ่งทางรอที่ [-4.5, 2.2, -6.5]
            // ดวงก่อนๆ (dist > 1) ขยับต่อแถวเฉียงขึ้นไปทางมุมซ้ายบนเรื่อยๆ ตามกัน
            const posX = -4.5 - (dist - 1) * 2.8;
            const posY = 2.2 + (dist - 1) * 1.5; // พุ่งขึ้นมุมซ้ายบนชัดเจน
            const posZ = -6.5 - (dist - 1) * 6.5; // ถอยลึกระดับที่ยังมองเห็นทุกดวงชัด

            // เอียงโมเดลรับสายตาในแนวเฉียงมุมซ้ายบน
            const rotX = 0.35 + dist * 0.04;
            const rotY = 0.55 + dist * 0.06;
            const rotZ = -0.32 - dist * 0.03;

            // ขนาดโมเดล: ให้คงขนาดที่ใหญ่พอที่จะมองเห็นผิวดาวและเอกลักษณ์ชัดเจน
            const baseScale = prevBody.id === "sun" ? 1.75 : 0.72;
            const scaleVal = Math.max(0.42, baseScale / Math.pow(1.1, dist - 1));
            const opacityVal = Math.max(0.65, 0.95 - (dist - 1) * 0.06);

            return (
              <group
                key={`prev-body-${prevBody.id}-${pIdx}`}
                position={[posX, posY, posZ]}
                rotation={[rotX, rotY, rotZ]}
              >
                <StylizedPlanetMesh
                  planet={prevBody}
                  opacity={opacityVal}
                  position={[0, 0, 0]}
                  scale={scaleVal}
                  rotationSpeed={0.5}
                  isScanMode={false}
                  isCoreMode={false}
                  selectedHotspot={null}
                  onSelectHotspot={() => {}}
                  isInteractive={false}
                />
              </group>
            );
          })}
        </group>
      )}

      {/* ดาวดวงปัจจุบัน: โดดเด่น ชัดเจน อยู่ด้านหน้า */}
      <StylizedPlanetMesh
        key={`curr-${currentPlanet.id}`}
        planet={currentPlanet}
        opacity={t >= 1 ? 1 : curOpacity}
        position={[t >= 1 ? currentPlanet.position3D[0] : curX, t >= 1 ? currentPlanet.position3D[1] : curY, t >= 1 ? currentPlanet.position3D[2] : curZ]}
        scale={t >= 1 ? 1 : curScale}
        rotationSpeed={rotationSpeed}
        isScanMode={isScanMode}
        isCoreMode={isCoreMode}
        selectedHotspot={selectedHotspot}
        onSelectHotspot={onSelectHotspot}
        isInteractive={t >= 0.95}
      />
    </group>
  );
}
