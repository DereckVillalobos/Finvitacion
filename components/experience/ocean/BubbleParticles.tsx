import { useMemo, useRef, type MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { InstancedMesh, Object3D } from 'three';
import type { WorldClock } from './types';
export default function BubbleParticles({
  clock,
  active,
  low,
  reduced,
}: {
  clock: MutableRefObject<WorldClock>;
  active: boolean;
  low: boolean;
  reduced: boolean;
}) {
  const mesh = useRef<InstancedMesh>(null);
  const count = low ? 12 : 24;
  const data = useMemo(
    () => ({
      dummy: new Object3D(),
      seeds: Array.from({ length: 24 }, (_, i) => ({
        x: Math.sin(i * 23.1) * 1.35,
        z: Math.cos(i * 13.7) * 0.8 + 2.3,
        delay: (i % 8) * 0.13,
        size: 0.025 + (i % 4) * 0.012,
      })),
    }),
    [],
  );
  useFrame(() => {
    if (!mesh.current) return;
    for (let i = 0; i < count; i++) {
      const s = data.seeds[i];
      const age = clock.current.reveal - s.delay;
      const visible = active && !reduced && age > 0 && age < 5;
      data.dummy.position.set(
        s.x + Math.sin(age * 1.1 + i) * 0.12,
        age * 0.48,
        s.z,
      );
      data.dummy.scale.setScalar(
        visible ? s.size * Math.min(age * 3, 1) * Math.max(0, 1 - age / 5) : 0,
      );
      data.dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, data.dummy.matrix);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh
      ref={mesh}
      args={[undefined, undefined, count]}
      frustumCulled={false}
    >
      <sphereGeometry args={[1, 10, 8]} />
      <meshPhysicalMaterial
        color="#ffd4e6"
        transparent
        opacity={0.55}
        roughness={0.06}
        metalness={0.25}
      />
    </instancedMesh>
  );
}
