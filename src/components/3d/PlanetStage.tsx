"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { PlanetData, HotspotData, TransitionVector } from "@/data/planets";
import { sounds } from "@/utils/sounds";

interface PlanetStageProps {
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

  if (planetId === "mercury") {
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
      {/* ดาวดวงเก่าจะแสดงผลเฉพาะตอนที่กำลังเปลี่ยนฉากเท่านั้น */}
      {prevPlanet && prevOpacity > 0.01 && t < 1 && (
        <StylizedPlanetMesh
          key={`prev-${prevPlanet.id}`}
          planet={prevPlanet}
          opacity={prevOpacity}
          position={[prevX, prevY, prevZ]}
          scale={prevScale}
          rotationSpeed={1}
          isScanMode={false}
          isCoreMode={false}
          selectedHotspot={null}
          onSelectHotspot={() => {}}
          isInteractive={false}
        />
      )}

      {/* ดาวดวงปัจจุบัน: จะอยู่ถาวร ไม่มีวันหายไป */}
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
