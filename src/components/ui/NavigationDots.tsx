"use client";

import { PlanetData } from "@/data/planets";

interface NavigationDotsProps {
  planets: PlanetData[];
  currentIndex: number;
}

export function NavigationDots({ planets, currentIndex }: NavigationDotsProps) {
  return (
    <div className="absolute right-5 sm:right-8 top-1/2 -translate-y-1/2 z-30 flex flex-col items-end gap-3.5 pointer-events-none">
      {planets.map((planet, idx) => {
        const isActive = idx === currentIndex;
        return (
          <div key={planet.id} className="flex items-center gap-2.5 transition-all duration-300">
            <span
              className={`text-[9px] font-mono uppercase tracking-widest transition-opacity duration-300 ${
                isActive ? "text-cyan-400 opacity-100 font-semibold" : "text-neutral-500 opacity-30"
              }`}
            >
              {planet.name}
            </span>
            <div
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                isActive
                  ? "bg-cyan-400 scale-150 shadow-[0_0_10px_rgba(0,240,255,0.9)]"
                  : "bg-neutral-600 scale-100"
              }`}
            />
          </div>
        );
      })}
    </div>
  );
}
