"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function WarpDriveTunnel({ isWarping, isBlackHole }: { isWarping: boolean; isBlackHole?: boolean }) {
  const lineCount = 260;
  const linesRef = useRef<THREE.LineSegments>(null!);

  const [positions, initialZ, speeds] = useMemo(() => {
    const pos = new Float32Array(lineCount * 6); // 2 จุดต่อ 1 เส้น (หัว-ท้าย)
    const zOrg = new Float32Array(lineCount);
    const spd = new Float32Array(lineCount);

    for (let i = 0; i < lineCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 3.5 + Math.random() * 14;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const z = (Math.random() - 0.5) * 80;

      pos[i * 6] = x;
      pos[i * 6 + 1] = y;
      pos[i * 6 + 2] = z;

      // ปลายเส้นยาวออกไปด้านหลัง
      pos[i * 6 + 3] = x;
      pos[i * 6 + 4] = y;
      pos[i * 6 + 5] = z - 6.5;

      zOrg[i] = z;
      spd[i] = 40 + Math.random() * 30;
    }
    return [pos, zOrg, spd];
  }, []);

  useFrame((_, delta) => {
    if (!linesRef.current) return;
    const attr = linesRef.current.geometry.attributes.position;
    const arr = attr.array as Float32Array;

    // ถ้ากำลังวาร์ป เส้นลำแสงจะเร่งความเร็วพุ่งผ่านหน้าตา
    const activeSpeed = isWarping ? 1.0 : 0.05;

    for (let i = 0; i < lineCount; i++) {
      let z = arr[i * 6 + 2] + delta * speeds[i] * activeSpeed;
      if (z > 25) z -= 80;

      arr[i * 6 + 2] = z;
      arr[i * 6 + 5] = z - (isWarping ? 12 : 2.5); // ยืดยาวเป็นเส้นสตรีมตอนวาร์ป
    }
    attr.needsUpdate = true;
    linesRef.current.rotation.z += delta * (isWarping ? 0.8 : 0.05);
  });

  return (
    <lineSegments ref={linesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <lineBasicMaterial
        color={isBlackHole ? "#ff5500" : "#38bdf8"}
        transparent
        opacity={isWarping ? 0.92 : isBlackHole ? 0.45 : 0.12}
        blending={THREE.AdditiveBlending}
      />
    </lineSegments>
  );
}
