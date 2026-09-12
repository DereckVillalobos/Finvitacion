import { useMemo, useRef, type MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { CatmullRomCurve3, Group, Vector3, MathUtils } from 'three';
import PinkShark from './PinkShark';
import type { WorldClock } from './types';
export default function SharkController({
  clock,
  discovered,
  reduced,
  onDiscover,
}: {
  clock: MutableRefObject<WorldClock>;
  discovered: boolean;
  reduced: boolean;
  onDiscover: () => void;
}) {
  const group = useRef<Group>(null),
    hover = useRef(false),
    start = useRef<Vector3 | null>(null),
    startAngle = useRef(0);
  const data = useMemo(
    () => ({
      curve: new CatmullRomCurve3(
        [
          new Vector3(-1.6, 0.33, 1.5),
          new Vector3(0.8, 0.38, 2.3),
          new Vector3(2.7, 0.26, -1),
          new Vector3(0.7, 0.22, -6),
          new Vector3(-3, 0.32, -3),
        ],
        true,
        'catmullrom',
        0.5,
      ),
      point: new Vector3(),
      tangent: new Vector3(),
      next: new Vector3(),
      projected: new Vector3(),
      target: new Vector3(),
    }),
    [],
  );
  useFrame(({ camera, pointer }, delta) => {
    const g = group.current;
    if (!g) return;
    const dt = Math.min(delta, 0.04),
      time = clock.current.time;
    if (discovered && reduced) {
      g.position.set(0.8, 0.4, 2.3);
      g.rotation.set(0, 0, 0);
      return;
    }
    if (discovered) {
      if (!start.current) {
        start.current = g.position.clone();
        startAngle.current = g.rotation.y;
      }
      const r = clock.current.reveal,
        progress = MathUtils.smoothstep(r, 0, 4);
      data.target.set(0.8, 0.4, 3.5);
      g.position.lerpVectors(start.current, data.target, progress);
      g.position.y += Math.sin(progress * Math.PI) * 0.25;
      g.rotation.y =
        startAngle.current + Math.PI * 2 * MathUtils.smoothstep(r, 0, 3.4);
      g.rotation.z = Math.sin(progress * Math.PI * 2) * 0.13;
      g.scale.setScalar(1 - progress * 0.15);
      return;
    }
    start.current = null;
    const phase = reduced ? 0.08 : (time * 0.026 + 0.08) % 1;
    data.curve.getPointAt(phase, data.point);
    data.curve.getTangentAt(phase, data.tangent);
    data.projected.copy(data.point).project(camera);
    const near =
      Math.hypot(pointer.x - data.projected.x, pointer.y - data.projected.y) <
      0.3;
    if (!reduced && (hover.current || near)) {
      data.point.z += 0.38;
      data.point.x += pointer.x * 0.18;
    }
    g.position.lerp(data.point, 1 - Math.exp(-dt * 3));
    g.rotation.y = Math.atan2(-data.tangent.z, data.tangent.x);
    data.curve.getTangentAt((phase + 0.015) % 1, data.next);
    g.rotation.z = reduced
      ? 0
      : MathUtils.clamp((data.next.z - data.tangent.z) * 1.5, -0.18, 0.18) +
        Math.sin(time * 1.7) * 0.025;
  });
  return (
    <PinkShark
      ref={group}
      reduced={reduced}
      onTouch={onDiscover}
      onHover={(value) => {
        hover.current = value;
        document.body.style.cursor = value && !discovered ? 'pointer' : '';
      }}
    />
  );
}
