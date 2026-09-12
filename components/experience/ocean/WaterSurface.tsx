import { useMemo, type MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { waterVertex, waterFragment } from './shaders';
import type { WorldClock } from './types';
export default function WaterSurface({
  clock,
  low,
}: {
  clock: MutableRefObject<WorldClock>;
  low: boolean;
}) {
  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uRipple: { value: 0 } }),
    [],
  );
  useFrame(() => {
    uniforms.uTime.value = clock.current.time;
    uniforms.uRipple.value = clock.current.reveal;
  });
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -35]}>
      <planeGeometry args={[240, 240, low ? 72 : 150, low ? 72 : 150]} />
      <shaderMaterial
        vertexShader={waterVertex}
        fragmentShader={waterFragment}
        uniforms={uniforms}
        toneMapped={false}
      />
    </mesh>
  );
}
