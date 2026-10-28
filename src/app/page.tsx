"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, OrbitControls } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import { PLANETS, PlanetData, HotspotData } from "@/data/planets";
import { Starfield } from "@/components/3d/Starfield";
import { WarpDriveTunnel } from "@/components/3d/WarpDriveTunnel";
import { PlanetStage } from "@/components/3d/PlanetStage";
import { FullSolarSystemOverview } from "@/components/3d/FullSolarSystemOverview";
import { PlanetHUD } from "@/components/ui/PlanetHUD";
import { NavigationDots } from "@/components/ui/NavigationDots";
import { HUDToolbar } from "@/components/ui/HUDToolbar";
import { SolarMiniMap } from "@/components/ui/SolarMiniMap";
import { sounds } from "@/utils/sounds";
import { RotateCcw } from "lucide-react";

function DynamicLighting({ planetIndex, isOverviewMode }: { planetIndex: number; isOverviewMode: boolean }) {
  const lightRef = useRef<THREE.DirectionalLight>(null!);

  useFrame(() => {
    if (!lightRef.current) return;
    if (isOverviewMode) {
      lightRef.current.position.set(0, 50, 20);
      return;
    }
    const angle = planetIndex * 1.6;
    const targetX = Math.cos(angle) * 10;
    const targetZ = Math.sin(angle) * 10 + 5;
    lightRef.current.position.x = THREE.MathUtils.lerp(lightRef.current.position.x, targetX, 0.04);
    lightRef.current.position.z = THREE.MathUtils.lerp(lightRef.current.position.z, targetZ, 0.04);
  });

  return (
    <>
      <ambientLight intensity={isOverviewMode ? 0.75 : 0.35} />
      <directionalLight
        ref={lightRef}
        position={[10, 5, 8]}
        intensity={isOverviewMode ? 2.5 : 3.8}
        color="#ffffff"
      />
    </>
  );
}

function CameraRig({ isWarping, isOverviewMode }: { isWarping: boolean; isOverviewMode: boolean }) {
  useFrame((state) => {
    if (isOverviewMode) {
      // In overview mode OrbitControls controls the camera
      return;
    }
    const targetZ = isWarping ? 9.8 : 7.8;
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetZ, 0.04);
    const targetCamX = state.pointer.x * 0.45;
    const targetCamY = state.pointer.y * 0.45;
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

  // เมื่อ currentIndex เป็นดวงสุดท้าย (GARGANTUA/VOID) ให้เป็นโหมดภาพรวมระบบสุริยะทั้งระบบ
  const isOverviewMode = currentIndex === PLANETS.length - 1;

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

  const goToPlanetIndex = useCallback((targetIndex: number) => {
    if (isTransitioningRef.current || targetIndex === currentIndex) return;

    const dirVal = targetIndex > currentIndex ? 1 : -1;
    isTransitioningRef.current = true;
    setDirection(dirVal);
    sounds.playWarp();
    setIsWarping(true);
    setSelectedHotspot(null);
    setIsCoreMode(false);

    setPrevPlanet(PLANETS[currentIndex]);
    setCurrentIndex(targetIndex);
    setTransitionProgress(0);

    setTimeout(() => {
      setIsWarping(false);
      setTransitionProgress(1);
      isTransitioningRef.current = false;
      setPrevPlanet(null);
    }, 850);
  }, [currentIndex]);

  const changePlanet = useCallback((dir: "next" | "prev") => {
    const total = PLANETS.length;
    let nextIndex = currentIndex;
    if (dir === "next" && currentIndex < total - 1) {
      nextIndex = currentIndex + 1;
    } else if (dir === "prev" && currentIndex > 0) {
      nextIndex = currentIndex - 1;
    }
    if (nextIndex !== currentIndex) {
      goToPlanetIndex(nextIndex);
    }
  }, [currentIndex, goToPlanetIndex]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isOverviewMode) {
        // In Overview mode, let wheel zoom in/out with OrbitControls
        return;
      }
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
      if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === "ArrowRight") {
        changePlanet("next");
      } else if (e.key === "ArrowUp" || e.key === "PageUp" || e.key === "ArrowLeft") {
        changePlanet("prev");
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [changePlanet, isOverviewMode]);

  const activePlanet = PLANETS[currentIndex];

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#020205] text-white select-none">
      
      {/* 1. 3D WebGL Canvas */}
      <div className="absolute inset-0 w-full h-full z-0">
        <Canvas
          shadows
          camera={
            isOverviewMode
              ? { position: [0, 48, 55], fov: 45 }
              : { position: [0, 0, 7.8], fov: 45 }
          }
        >
          <DynamicLighting planetIndex={currentIndex} isOverviewMode={isOverviewMode} />
          {!isOverviewMode && (
            <pointLight position={[-8, -4, -2]} intensity={2.0} color={activePlanet.atmosphereColor} />
          )}

          <CameraRig isWarping={isWarping} isOverviewMode={isOverviewMode} />
          <WarpDriveTunnel isWarping={isWarping} isBlackHole={activePlanet.id === "blackhole"} />
          <Starfield isWarping={isWarping} />

          {/* ถ้าเป็นโหมด Overview ให้เปิด OrbitControls หมุน 360 อิสระทุกมุมมอง */}
          {isOverviewMode ? (
            <>
              <OrbitControls
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                maxDistance={120}
                minDistance={12}
                maxPolarAngle={Math.PI / 2.05}
              />
              <FullSolarSystemOverview onSelectPlanet={goToPlanetIndex} />
            </>
          ) : (
            <Float speed={1.5} rotationIntensity={0.05} floatIntensity={0.1}>
              <PlanetStage
                allPlanets={PLANETS}
                currentIndex={currentIndex}
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
          )}
        </Canvas>
      </div>

      {/* 2. Shockwave วาร์ป */}
      <AnimatePresence>
        {isWarping && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: [0, 0.45, 0], scale: [0.8, 1.4, 2.0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.75, ease: "easeOut" }}
            className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center"
          >
            <div className="w-[85vw] h-[85vw] rounded-full border-2 border-cyan-400/30 shadow-[0_0_90px_rgba(0,240,255,0.4)]" />
          </motion.div>
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

      {/* 4. เลเยอร์ UI ข้อมูล Telemetry (จะซ่อน HUD ซ้ายเมื่ออยู่ในโหมด Overview เพื่อให้เห็นโมเดลทั้งระบบสุริยะเต็มตา) */}
      <div className="absolute inset-0 w-full h-full z-20 pointer-events-none">
        {!isOverviewMode ? (
          <PlanetHUD planet={activePlanet} direction={direction} isCoreMode={isCoreMode} />
        ) : (
          /* Overview Top-Down Mission Title Overlay */
          <div className="absolute top-16 left-8 pointer-events-auto max-w-md animate-fade-in">
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs tracking-widest uppercase">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>HELIOCENTRIC SOLAR SYSTEM MATRIX</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mt-1">
              FULL ORBITAL SYSTEM
            </h1>
            <p className="text-xs text-neutral-300 mt-2 leading-relaxed bg-black/60 backdrop-blur-md p-3 rounded-xl border border-white/10">
              ภาพรวมระบบสุริยะทั้งหมดจากมุมมองอวกาศเบื้องบน คลิกและลากเมาส์เพื่อหมุนดูได้ 360 องศารอบทิศทาง หมุนลูกกลิ้งเพื่อซูมเข้า/ออก หรือคลิกเลือกดาวดวงใดก็ได้เพื่อเข้าชมรายดวง
            </p>
          </div>
        )}

        <NavigationDots planets={PLANETS} currentIndex={currentIndex} />

        {/* 5. แถบแผนผังวงโคจรสุริยะแบบอินเตอร์แอคทีฟ (Heliocentric Solar Minimap) */}
        <SolarMiniMap
          planets={PLANETS}
          currentIndex={currentIndex}
          onSelectIndex={goToPlanetIndex}
        />
      </div>

    </div>
  );
}
