"use client";

import { motion } from "framer-motion";
import { PlanetData } from "@/data/planets";
import { Sun } from "lucide-react";

interface SolarMiniMapProps {
  planets: PlanetData[];
  currentIndex: number;
  onSelectIndex: (index: number) => void;
}

export function SolarMiniMap({ planets, currentIndex, onSelectIndex }: SolarMiniMapProps) {
  const activePlanet = planets[currentIndex];

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-[92vw] max-w-[860px] pointer-events-auto select-none">
      <div className="px-5 py-3 rounded-2xl bg-[#040812]/80 border border-white/10 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] flex flex-col gap-2">
        {/* Header แถบแสดงสถานะระยะห่างจากดวงอาทิตย์แบบเรียลไทม์ */}
        <div className="flex items-center justify-between text-[10px] font-mono tracking-widest text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span className="text-amber-300 font-semibold uppercase flex items-center gap-1">
              <Sun className="w-3 h-3 text-amber-400" />
              HELIOCENTRIC ORBITAL TRACK
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-neutral-500 uppercase">SOLAR DISTANCE:</span>
            <span className="text-cyan-400 font-semibold">{activePlanet.distanceFromSun}</span>
          </div>
        </div>

        {/* รางเส้นวงโคจรสุริยะ (Interactive Orbital Ruler) */}
        <div className="relative w-full h-10 flex items-center">
          {/* เส้นแกนวงโคจรหลัก */}
          <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-amber-400/80 via-cyan-400/50 to-purple-500/80 rounded-full" />

          {/* สัญลักษณ์ดวงอาทิตย์ที่จุดศูนย์กลาง (Sun Center Origin) */}
          <div
            onClick={() => onSelectIndex(0)}
            className="relative z-10 flex flex-col items-center mr-4 cursor-pointer group"
          >
            <div className={`w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 shadow-[0_0_18px_#f59e0b] border border-amber-200 flex items-center justify-center transition-transform ${
              currentIndex === 0 ? "scale-125 ring-2 ring-white" : "hover:scale-110 opacity-70 group-hover:opacity-100"
            }`}>
              <Sun className="w-3.5 h-3.5 text-amber-950 animate-spin" style={{ animationDuration: "12s" }} />
            </div>
            <span className={`text-[8px] font-mono font-bold mt-1 uppercase tracking-wider ${
              currentIndex === 0 ? "text-amber-300 underline font-black" : "text-amber-400/80"
            }`}>
              SUN
            </span>
          </div>

          {/* รายการดาวเคราะห์ทั้ง 8 ดวง + Gargantua เรียงตามระยะห่างจริงจากดวงอาทิตย์ */}
          <div className="relative flex-1 flex items-center justify-between pl-1">
            {planets.slice(1).map((p, pIdx) => {
              const idx = pIdx + 1;
              const isActive = idx === currentIndex;
              return (
                <div
                  key={p.id}
                  onClick={() => onSelectIndex(idx)}
                  className="relative flex flex-col items-center cursor-pointer group py-1"
                >
                  {/* ตัวจุดและขนาดสัมพัทธ์ของดาว */}
                  <div className="relative flex items-center justify-center">
                    {isActive && (
                      <motion.div
                        layoutId="activePlanetBeacon"
                        className="absolute -inset-1.5 rounded-full border border-cyan-400/80 animate-ping pointer-events-none"
                      />
                    )}
                    <div
                      style={{
                        backgroundColor: p.color,
                        boxShadow: isActive ? `0 0 16px ${p.atmosphereColor || p.color}` : "none",
                      }}
                      className={`rounded-full transition-all duration-300 ${
                        isActive
                          ? "w-4 h-4 ring-2 ring-white scale-110"
                          : "w-2.5 h-2.5 opacity-60 group-hover:opacity-100 group-hover:scale-125"
                      }`}
                    />
                  </div>

                  {/* ชื่อย่อและดัชนี */}
                  <span
                    className={`text-[9px] font-mono mt-1 tracking-wider uppercase transition-all duration-200 ${
                      isActive
                        ? "text-cyan-300 font-bold scale-105"
                        : "text-neutral-500 group-hover:text-neutral-300"
                    }`}
                  >
                    {p.id === "blackhole" ? "VOID" : p.name.slice(0, 3)}
                  </span>

                  {/* Tooltip ชี้บอกระยะเมื่อ Hover */}
                  <div className="absolute bottom-12 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 px-2 py-1 rounded bg-black/95 border border-white/20 text-[9px] font-mono text-neutral-200 whitespace-nowrap shadow-xl">
                    <span className="text-cyan-400 font-bold">{p.name}</span> // {p.distanceFromSun}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
