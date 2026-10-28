"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import { PLANETS, PlanetData, HotspotData } from "@/data/planets";
import { Starfield } from "@/components/3d/Starfield";
import { WarpDriveTunnel } from "@/components/3d/WarpDriveTunnel";
import { PlanetStage } from "@/components/3d/PlanetStage";
import { PlanetHUD } from "@/components/ui/PlanetHUD";
import { NavigationDots } from "@/components/ui/NavigationDots";
import { HUDToolbar } from "@/components/ui/HUDToolbar";
import { sounds } from "@/utils/sounds";

function DynamicLighting({ planetIndex }: { planetIndex: number }) {
  const lightRef = useRef<THREE.DirectionalLight>(null!);

  useFrame(() => {
    if (!lightRef.current) return;
    const angle = planetIndex * 1.6;
    const targetX = Math.cos(angle) * 10;
    const targetZ = Math.sin(angle) * 10 + 5;
    lightRef.current.position.x = THREE.MathUtils.lerp(lightRef.current.position.x, targetX, 0.04);
    lightRef.current.position.z = THREE.MathUtils.lerp(lightRef.current.position.z, targetZ, 0.04);
  });

  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight
        ref={lightRef}
        position={[10, 5, 8]}
        intensity={3.8}
        color="#ffffff"
      />
    </>
  );
}

function CameraRig({ isWarping }: { isWarping: boolean }) {
  useFrame((state) => {
    const targetZ = isWarping ? 9.8 : 7.8;
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetZ, 0.04);
    // เพิ่มการเอียงกล้อง Parallax เล็กน้อยตามพิกัดเมาส์ เพิ่มมิติ Depth Perspective
    const targetCamX = (state.pointer.x * 0.45);
    const targetCamY = (state.pointer.y * 0.45);
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, targetCamX, 0.05);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetCamY, 0.05);
    state.camera.lookAt(0, 0, 0);
  });

  return null;
}

export default function SolarTourPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevPlanet, setPrevPlanet] = useState<PlanetData | null>(null);
  const [transitionProgress, setTransitionProgress] = useState(1);
  const [direction, setDirection] = useState(1);
  const [isWarping, setIsWarping] = useState(false);
  const isTransitioningRef = useRef(false);

  // สเตตฟีเจอร์ระดับ Pro
  const [isMuted, setIsMuted] = useState(false);
  const [isScanMode, setIsScanMode] = useState(false);
  const [isCoreMode, setIsCoreMode] = useState(false);
  const [rotationSpeed, setRotationSpeed] = useState(1);
  const [selectedHotspot, setSelectedHotspot] = useState<HotspotData | null>(null);

  // ควบคุม Transition Clock เดียวกันอย่างแม่นยำด้วย Timestamp (Duration: 850ms)
  useEffect(() => {
    if (transitionProgress >= 1) return;

    let startTime: number | null = null;
    let animId: number;
    const duration = 850;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const linearT = Math.min(elapsed / duration, 1);

      setTransitionProgress(linearT);

      if (linearT < 1) {
        animId = requestAnimationFrame(animate);
      }
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [currentIndex]);

  const changePlanet = useCallback((dir: "next" | "prev") => {
    if (isTransitioningRef.current) return;

    const total = PLANETS.length;
    let nextIndex = currentIndex;
    const dirVal = dir === "next" ? 1 : -1;

    if (dir === "next" && currentIndex < total - 1) {
      nextIndex = currentIndex + 1;
    } else if (dir === "prev" && currentIndex > 0) {
      nextIndex = currentIndex - 1;
    }

    if (nextIndex === currentIndex) return;

    isTransitioningRef.current = true;
    setDirection(dirVal);
    sounds.playWarp();
    setIsWarping(true);
    setSelectedHotspot(null); // รีเซ็ต hotspot ตอนเปลี่ยนดาว
    setIsCoreMode(false); // ปิดโหมดผ่าแกนกลางกลับคืนตอนเปลี่ยนดาว

    setPrevPlanet(PLANETS[currentIndex]);
    setCurrentIndex(nextIndex);
    setTransitionProgress(0);

    setTimeout(() => {
      setIsWarping(false);
      setTransitionProgress(1); // บังคับให้เป็น 1 ชัดเจนเพื่อล็อกโมเดลดาวให้อยู่ในสถานะนิ่ง
      isTransitioningRef.current = false;
      setPrevPlanet(null);
    }, 850);

  }, [currentIndex]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (Math.abs(e.deltaY) > 25) {
        if (e.deltaY > 0) {
          changePlanet("next");
        } else {
          changePlanet("prev");
        }
      }
    };

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.code === "Space") {
          e.preventDefault();
          sounds.playCoreDeploy();
          setIsCoreMode((prev) => !prev);
          return;
        }
        if (e.key === "ArrowDown" || e.key === "PageDown") {
          changePlanet("next");
        } else if (e.key === "ArrowUp" || e.key === "PageUp") {
          changePlanet("prev");
        }
      };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [changePlanet]);

  const activePlanet = PLANETS[currentIndex];

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#020205] text-white select-none">
      
      {/* 1. 3D WebGL Canvas แบบ Interactive สมบูรณ์แบบ */}
      <div className="absolute inset-0 w-full h-full z-0">
        <Canvas shadows camera={{ position: [0, 0, 7.8], fov: 45 }}>
          <DynamicLighting planetIndex={currentIndex} />
          <pointLight position={[-8, -4, -2]} intensity={2.0} color={activePlanet.atmosphereColor} />

          <CameraRig isWarping={isWarping} />
          <WarpDriveTunnel isWarping={isWarping} isBlackHole={activePlanet.id === "blackhole"} />
          <Starfield isWarping={isWarping} />

          <Float speed={1.5} rotationIntensity={0.05} floatIntensity={0.1}>
            <PlanetStage
              currentPlanet={activePlanet}
              prevPlanet={prevPlanet}
              transitionProgress={transitionProgress}
              direction={direction}
              rotationSpeed={rotationSpeed}
              isScanMode={isScanMode}
              isCoreMode={isCoreMode}
              selectedHotspot={selectedHotspot}
              onSelectHotspot={setSelectedHotspot}
            />
          </Float>
        </Canvas>
      </div>

      {/* 2. Shockwave วาร์ป & Cinema Warp Lines */}
      <AnimatePresence>
        {isWarping && (
          <>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: [0, 0.45, 0], scale: [0.8, 1.4, 2.0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.75, ease: "easeOut" }}
              className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center"
            >
              <div className="w-[85vw] h-[85vw] rounded-full border-2 border-cyan-400/30 shadow-[0_0_90px_rgba(0,240,255,0.4)]" />
            </motion.div>

            {/* Flash Light Barrier ตอนวาร์ป */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.25, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute inset-0 pointer-events-none z-10 bg-cyan-400/10 mix-blend-screen"
            />
          </>
        )}
      </AnimatePresence>

      {/* 3. แถบเครื่องมือควบคุมด้านบนขวา (Toolbar Controls) */}
      <HUDToolbar
        isMuted={isMuted}
        onToggleMute={() => {
          setIsMuted(!isMuted);
          sounds.isMuted = !isMuted;
        }}
        isScanMode={isScanMode}
        onToggleScan={() => setIsScanMode(!isScanMode)}
        isCoreMode={isCoreMode}
        onToggleCore={() => setIsCoreMode(!isCoreMode)}
        rotationSpeed={rotationSpeed}
        onChangeSpeed={setRotationSpeed}
      />

      {/* 4. เลเยอร์ UI ข้อมูล Telemetry */}
      <div className="absolute inset-0 w-full h-full z-20 pointer-events-none">
        <PlanetHUD planet={activePlanet} direction={direction} isCoreMode={isCoreMode} />
        <NavigationDots planets={PLANETS} currentIndex={currentIndex} />

        {/* แถบแจ้งเตือนคำแนะนำด้านล่าง */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 text-[10px] font-mono tracking-widest text-cyan-400/70 uppercase">
          <span className="text-amber-400 font-semibold">[ PRESS SPACE OR 'INSPECT CORE' TO EXPLODE CORE ]</span>
          <span>•</span>
          <span>[ MOVE MOUSE OR DRAG TO ROTATE 3D ]</span>
          <span>•</span>
          <span>[ SCROLL TO WARP ]</span>
        </div>
      </div>

    </div>
  );
}
