"use client";

import { motion, AnimatePresence } from "framer-motion";
import { PlanetData, TransitionVector } from "@/data/planets";
import {
  Activity,
  Compass,
  Thermometer,
  Layers,
  Wind,
  Orbit,
  Clock,
  Moon,
  Radio,
  Zap,
  Globe2,
  Scan,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

interface PlanetHUDProps {
  planet: PlanetData;
  direction: number;
  isCoreMode?: boolean;
}

const cinemaEase = [0.16, 1, 0.3, 1] as const;

// คำนวณ Directional Slide ที่นุ่มนวลและไม่กระชาก
const getHUDVariants = (trajectory: TransitionVector) => {
  let enterY = 25;
  let exitY = -25;
  let enterX = 0;
  let exitX = 0;

  switch (trajectory) {
    case "dive-top":
      enterY = -40;
      exitY = 40;
      break;
    case "ascend-bottom":
      enterY = 40;
      exitY = -40;
      break;
    case "fly-in-right":
      enterX = 35;
      exitX = -35;
      break;
    case "fly-in-left":
      enterX = -35;
      exitX = 35;
      break;
    case "diagonal-slice":
      enterX = 25;
      enterY = -25;
      exitX = -25;
      exitY = 25;
      break;
    case "hyper-spiral":
    default:
      enterY = 25;
      exitY = -25;
      break;
  }

  return {
    enter: {
      opacity: 0,
      x: enterX,
      y: enterY,
      scale: 0.97,
      filter: "blur(8px)",
    },
    center: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        duration: 0.85,
        ease: cinemaEase,
      },
    },
    exit: {
      opacity: 0,
      x: exitX,
      y: exitY,
      scale: 0.97,
      filter: "blur(8px)",
      transition: {
        duration: 0.85,
        ease: cinemaEase,
      },
    },
  };
};

export function PlanetHUD({ planet, direction, isCoreMode = false }: PlanetHUDProps) {
  const isRight = planet.hudPosition === "right";
  const hudVariants = getHUDVariants(planet.flyTrajectory);

  const solarIndex =
    planet.id === "mercury"
      ? "01"
      : planet.id === "venus"
      ? "02"
      : planet.id === "earth"
      ? "03"
      : planet.id === "mars"
      ? "04"
      : planet.id === "jupiter"
      ? "05"
      : planet.id === "saturn"
      ? "06"
      : planet.id === "uranus"
      ? "07"
      : planet.id === "neptune"
      ? "08"
      : "SINGULARITY";

  return (
    <div
      className={`absolute inset-y-0 ${
        isRight ? "right-0" : "left-0"
      } w-full md:w-[50vw] lg:w-[48vw] h-full flex items-center justify-center pointer-events-none select-none z-20`}
    >
      {/* วิกเน็ตความมืดแบบไล่เฉดธรรมชาติ (Vignette Shadow Backdrop) ช่วยให้อ่านง่าย คมกริบ ไร้ขอบกล่องแข็งๆ */}
      <div
        className={`absolute inset-0 pointer-events-none ${
          isRight
            ? "bg-gradient-to-l from-[#020205]/95 via-[#020205]/65 to-transparent"
            : "bg-gradient-to-r from-[#020205]/95 via-[#020205]/65 to-transparent"
        }`}
      />

      <div className="w-full max-w-[500px] lg:max-w-[540px] px-6 sm:px-8 lg:px-10 py-6 sm:py-8 relative z-10 overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={planet.id}
            variants={hudVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="w-full flex flex-col space-y-4"
          >
            {/* 1. Observatory Telemetry Mission Header */}
            <div className="flex flex-col items-start text-left space-y-2.5">
              <div className="flex items-center justify-between w-full border-b border-white/10 pb-2">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-[10px] font-mono tracking-wider text-cyan-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="uppercase font-semibold tracking-widest">{planet.type}</span>
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400 tracking-wider">
                    SECTOR // SOL-{solarIndex}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-400">
                  <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
                  <span className="tracking-widest uppercase text-cyan-400/90 font-medium">LIVE TELEMETRY</span>
                </div>
              </div>

              {/* Title & Tagline with subtle glow */}
              <div className="space-y-1">
                <div className="flex items-baseline gap-3">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-none drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
                    {planet.name}
                  </h1>
                  <span className="text-xs sm:text-sm font-mono text-cyan-400/60 font-normal">
                    /{planet.radius}
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs font-mono text-cyan-300 tracking-widest uppercase font-medium drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                  {planet.tagline}
                </p>
              </div>

              {/* Primary Coordinates Metrics (Borderless Airy Layout with Subtle Glow) */}
              <div className="grid grid-cols-2 gap-4 w-full pt-1">
                <div className="flex items-center gap-3 py-1">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                    <Compass className="w-4 h-4 text-cyan-300" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-mono uppercase text-neutral-400 tracking-wider">Solar Distance</span>
                    <span className="text-xs sm:text-sm font-mono font-semibold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                      {planet.distanceFromSun}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 py-1">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                    <Thermometer className="w-4 h-4 text-cyan-300" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-mono uppercase text-neutral-400 tracking-wider">Surface Temp</span>
                    <span className="text-xs sm:text-sm font-mono font-semibold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                      {planet.temperature}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Scientific Phenomenon Briefing (Borderless with Left-Accent Bar) */}
            <div className="w-full text-left space-y-1.5 py-1 pl-3.5 border-l-2 border-cyan-400/60 bg-gradient-to-r from-cyan-950/20 to-transparent">
              <div className="flex items-center gap-2 text-[10px] font-mono tracking-wider text-neutral-300">
                <span className="flex items-center gap-1.5 text-cyan-300 font-semibold uppercase">
                  <Zap className="w-3 h-3 text-cyan-400" />
                  DISTINCTIVE PHENOMENON
                </span>
                <span className="text-neutral-500">//</span>
                <span className="text-neutral-400 uppercase tracking-widest text-[9px]">SURFACE DATA</span>
              </div>
              <p className="text-xs sm:text-[13px] text-neutral-100 font-normal leading-relaxed drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
                {planet.highlightFact}
              </p>
            </div>

            {/* 3. Deep Telemetry Matrix Grid หรือ Core Stratigraphy ตอนผ่าแกนดาว */}
            {!isCoreMode ? (
              <div className="w-full pointer-events-auto text-left space-y-3 pt-2.5 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                    <Scan className="w-3 h-3 text-cyan-400" />
                    Physical Telemetry Matrix
                  </span>
                  <span className="text-[9px] font-mono text-neutral-500 tracking-wider">IAU ARCHIVE</span>
                </div>

                <div className="grid grid-cols-3 gap-y-3.5 gap-x-4">
                  <div className="flex flex-col space-y-0.5">
                    <div className="flex items-center gap-1 text-neutral-400">
                      <Activity className="w-3 h-3 text-cyan-400" />
                      <span className="text-[9px] font-mono uppercase tracking-wider">Gravity</span>
                    </div>
                    <div className="text-base sm:text-lg font-bold text-white tracking-tight font-mono drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                      {planet.stats.gravity}
                    </div>
                  </div>

                  <div className="flex flex-col space-y-0.5">
                    <div className="flex items-center gap-1 text-neutral-400">
                      <Orbit className="w-3 h-3 text-cyan-400" />
                      <span className="text-[9px] font-mono uppercase tracking-wider">Velocity</span>
                    </div>
                    <div className="text-base sm:text-lg font-bold text-white tracking-tight font-mono drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                      {planet.stats.orbitalVelocity}
                    </div>
                  </div>

                  <div className="flex flex-col space-y-0.5">
                    <div className="flex items-center gap-1 text-neutral-400">
                      <Clock className="w-3 h-3 text-cyan-400" />
                      <span className="text-[9px] font-mono uppercase tracking-wider">Rotation</span>
                    </div>
                    <div className="text-base sm:text-lg font-bold text-white tracking-tight font-mono drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                      {planet.stats.dayLength}
                    </div>
                  </div>

                  <div className="flex flex-col space-y-0.5">
                    <div className="flex items-center gap-1 text-neutral-400">
                      <Layers className="w-3 h-3 text-cyan-400" />
                      <span className="text-[9px] font-mono uppercase tracking-wider">Surface</span>
                    </div>
                    <div className="text-xs sm:text-sm font-semibold text-neutral-100 truncate font-mono drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                      {planet.stats.surfaceArea}
                    </div>
                  </div>

                  <div className="flex flex-col space-y-0.5">
                    <div className="flex items-center gap-1 text-neutral-400">
                      <Moon className="w-3 h-3 text-cyan-400" />
                      <span className="text-[9px] font-mono uppercase tracking-wider">Satellites</span>
                    </div>
                    <div className="text-xs sm:text-sm font-semibold text-neutral-100 truncate font-mono drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                      {planet.stats.moonsCount}
                    </div>
                  </div>

                  <div className="flex flex-col space-y-0.5">
                    <div className="flex items-center gap-1 text-neutral-400">
                      <Wind className="w-3 h-3 text-cyan-400" />
                      <span className="text-[9px] font-mono uppercase tracking-wider">Atmosphere</span>
                    </div>
                    <div className="text-[11px] sm:text-xs font-semibold text-cyan-300 truncate font-mono drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                      {planet.stats.atmosphereType}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10">
                  <p className="text-[11px] sm:text-xs text-neutral-300 leading-relaxed font-normal drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
                    {planet.description}
                  </p>
                </div>
              </div>
            ) : (
              /* Core Cross-Section Stratigraphy (ผ่าแกนกลางดวงดาว) */
              <div className="w-full pointer-events-auto text-left space-y-3 pt-2.5 border-t border-amber-500/30">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300 flex items-center gap-1.5 font-semibold">
                    <Layers className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                    CORE STRATIGRAPHY // EXPLODED HUD
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-[9px] font-mono text-amber-300 border border-amber-500/40">
                    DISSECTED
                  </span>
                </div>

                <div className="space-y-2">
                  {planet.coreData?.map((layer, idx) => (
                    <div
                      key={layer.name}
                      className="p-2.5 rounded-xl bg-amber-950/25 border border-amber-500/20 flex items-center justify-between backdrop-blur-md"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: layer.color }} />
                        <div className="flex flex-col">
                          <span className="text-xs font-mono font-bold text-white tracking-wider">
                            0{idx + 1}. {layer.name}
                          </span>
                          <span className="text-[10px] text-neutral-300 font-mono">
                            {layer.material}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end text-right">
                        <span className="text-xs font-mono font-semibold text-amber-300">
                          {layer.temp}
                        </span>
                        <span className="text-[9px] font-mono text-neutral-400">
                          {layer.depth}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
