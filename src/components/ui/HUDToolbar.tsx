"use client";

import { Volume2, VolumeX, Crosshair, Gauge, Layers } from "lucide-react";
import { sounds } from "@/utils/sounds";

interface HUDToolbarProps {
  isMuted: boolean;
  onToggleMute: () => void;
  isScanMode: boolean;
  onToggleScan: () => void;
  isCoreMode: boolean;
  onToggleCore: () => void;
  rotationSpeed: number;
  onChangeSpeed: (spd: number) => void;
}

export function HUDToolbar({
  isMuted,
  onToggleMute,
  isScanMode,
  onToggleScan,
  isCoreMode,
  onToggleCore,
  rotationSpeed,
  onChangeSpeed,
}: HUDToolbarProps) {
  return (
    <div className="absolute top-5 sm:top-7 right-5 sm:right-8 z-30 flex items-center gap-2 sm:gap-2.5 pointer-events-auto">
      {/* 1. ปุ่ม Core Exploded View (ผ่าแกนกลางดวงดาว) */}
      <button
        onClick={() => {
          sounds.playCoreDeploy();
          onToggleCore();
        }}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-mono tracking-wider transition-all duration-200 backdrop-blur-md cursor-pointer ${
          isCoreMode
            ? "bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_25px_rgba(255,170,0,0.35)]"
            : "bg-neutral-950/80 border-white/10 text-neutral-300 hover:text-white hover:border-white/25"
        }`}
      >
        <Layers className={`w-3.5 h-3.5 ${isCoreMode ? "text-amber-400 animate-bounce" : "text-neutral-400"}`} />
        <span>{isCoreMode ? "CORE // DEPLOYED" : "INSPECT CORE"}</span>
      </button>

      {/* 2. ปุ่ม Scan Telemetry Mode */}
      <button
        onClick={() => {
          sounds.playScan();
          onToggleScan();
        }}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-mono tracking-wider transition-all duration-200 backdrop-blur-md cursor-pointer ${
          isScanMode
            ? "bg-cyan-500/15 border-cyan-400 text-cyan-300 shadow-[0_0_20px_rgba(0,240,255,0.25)]"
            : "bg-neutral-950/80 border-white/10 text-neutral-400 hover:text-white hover:border-white/25"
        }`}
      >
        <Crosshair className={`w-3.5 h-3.5 ${isScanMode ? "animate-spin text-cyan-400" : "text-neutral-400"}`} />
        <span>{isScanMode ? "SURFACE SCAN // ACTIVE" : "SCAN OVERLAY"}</span>
      </button>

      {/* 3. ปุ่ม Time Velocity Speed */}
      <button
        onClick={() => {
          sounds.playBeep(700);
          const nextSpeed = rotationSpeed === 1 ? 2.5 : rotationSpeed === 2.5 ? 0 : 1;
          onChangeSpeed(nextSpeed);
        }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-950/80 border border-white/10 hover:border-white/25 text-[11px] font-mono text-neutral-300 hover:text-white transition-all duration-200 backdrop-blur-md cursor-pointer"
      >
        <Gauge className="w-3.5 h-3.5 text-cyan-400" />
        <span>{rotationSpeed === 0 ? "ORBIT PAUSED" : `${rotationSpeed}X RATE`}</span>
      </button>

      {/* 4. ปุ่ม Audio Sound FX */}
      <button
        onClick={() => {
          onToggleMute();
          if (isMuted) {
            setTimeout(() => sounds.playBeep(950), 50);
          }
        }}
        className="p-2 rounded-xl bg-neutral-950/80 border border-white/10 hover:border-white/25 text-neutral-400 hover:text-white transition-all duration-200 backdrop-blur-md cursor-pointer"
        title={isMuted ? "Audio Unmuted" : "Audio Muted"}
      >
        {isMuted ? (
          <VolumeX className="w-4 h-4 text-neutral-500" />
        ) : (
          <Volume2 className="w-4 h-4 text-cyan-400" />
        )}
      </button>
    </div>
  );
}
