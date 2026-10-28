"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function Starfield({ isWarping }: { isWarping: boolean }) {
  // เพิ่มดวงดาวเป็น 4,500 ดวง ให้หนาแน่นเต็มห้วงอวกาศ
  const count = 4500;
  const pointsRef = useRef<THREE.Points>(null!);

  const [positions, initialZ, velocities] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const zOrg = new Float32Array(count);
    const vel = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // กระจายดาวเป็นทรงกระบอกลึกรอบยาน
      pos[i * 3] = (Math.random() - 0.5) * 60;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 60;
      const z = (Math.random() - 0.5) * 100;
      pos[i * 3 + 2] = z;
      zOrg[i] = z;
      // ความเร็วเฉพาะของแต่ละดวง ให้เคลื่อนไหวระยิบระยับเป็นธรรมชาติ
      vel[i] = 0.5 + Math.random() * 1.5;
    }
    return [pos, zOrg, vel];
  }, []);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const attr = pointsRef.current.geometry.attributes.position;
    const arr = attr.array as Float32Array;

    // ถ้ากำลังเลื่อนสลับดาว (Warping) ให้เร่งความเร็วพุ่งปรู๊ด ถ้าปกติให้ลอยเอื่อยๆ
    const speed = isWarping ? 45.0 : 2.5;

    for (let i = 0; i < count; i++) {
      let z = arr[i * 3 + 2] + delta * speed * velocities[i];
      if (z > 30) {
        z -= 100; // วนกลับไปด้านหลังเมื่อพุ่งผ่านหน้าจอ
      }
      arr[i * 3 + 2] = z;
    }
    attr.needsUpdate = true;

    // หมุนแกนอวกาศช้าๆ ตลอดเวลา ให้รู้สึกถึงการเดินทางใน 3 มิติ
    pointsRef.current.rotation.z += delta * (isWarping ? 0.35 : 0.04);
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.11}
        color="#a5f3fc"
        transparent
        opacity={0.85}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
