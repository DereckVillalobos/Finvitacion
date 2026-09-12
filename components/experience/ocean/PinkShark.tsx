import { forwardRef, useMemo, useRef } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { Group, Shape, Vector2, DoubleSide } from 'three';

function Fin({ kind = 'dorsal' }: { kind?: 'dorsal' | 'tail' | 'side' }) {
  const shape = useMemo(() => {
    const s = new Shape();
    s.moveTo(-0.43, 0);
    if (kind === 'tail') {
      s.quadraticCurveTo(-0.5, 0.4, -0.8, 0.72);
      s.quadraticCurveTo(-0.02, 0.59, 0.15, 0.1);
      s.quadraticCurveTo(-0.12, -0.28, -0.61, -0.53);
      s.quadraticCurveTo(-0.48, -0.22, -0.43, 0);
    } else {
      s.quadraticCurveTo(-0.2, 0.24, -0.12, kind === 'dorsal' ? 0.86 : 0.64);
      s.quadraticCurveTo(0.12, 0.5, 0.48, 0);
      s.quadraticCurveTo(0.05, -0.04, -0.43, 0);
    }
    return s;
  }, [kind]);
  return (
    <mesh>
      <extrudeGeometry
        args={[
          shape,
          {
            depth: 0.055,
            bevelEnabled: true,
            bevelSegments: 3,
            steps: 1,
            bevelSize: 0.04,
            bevelThickness: 0.04,
            curveSegments: 14,
          },
        ]}
      />
      <meshPhysicalMaterial
        color="#e996b5"
        roughness={0.32}
        metalness={0.06}
        clearcoat={0.6}
        side={DoubleSide}
      />
    </mesh>
  );
}
const PinkShark = forwardRef<
  Group,
  { reduced: boolean; onTouch: () => void; onHover: (hover: boolean) => void }
>(function PinkShark({ reduced, onTouch, onHover }, ref) {
  const tail = useRef<Group>(null),
    body = useRef<Group>(null),
    left = useRef<Group>(null),
    right = useRef<Group>(null),
    timer = useRef(0);
  const points = useMemo(
    () => [
      new Vector2(0.035, -1.43),
      new Vector2(0.13, -1.18),
      new Vector2(0.27, -0.83),
      new Vector2(0.44, -0.35),
      new Vector2(0.48, 0.2),
      new Vector2(0.4, 0.67),
      new Vector2(0.24, 1.03),
      new Vector2(0.02, 1.2),
    ],
    [],
  );
  useFrame((_, dt) => {
    timer.current += Math.min(dt, 0.04);
    const t = timer.current;
    if (tail.current)
      tail.current.rotation.y = reduced ? 0 : Math.sin(t * 3.8) * 0.34;
    if (body.current)
      body.current.rotation.y = reduced ? 0 : Math.sin(t * 3.8 - 1) * 0.035;
    if (left.current)
      left.current.rotation.x = -0.65 + (reduced ? 0 : Math.sin(t * 2.5) * 0.1);
    if (right.current)
      right.current.rotation.x =
        0.65 + (reduced ? 0 : Math.sin(t * 2.5 + 1) * 0.1);
  });
  const click = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onTouch();
  };
  return (
    <group
      ref={ref}
      onClick={click}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(true);
      }}
      onPointerOut={() => onHover(false)}
    >
      <mesh visible={false}>
        <sphereGeometry args={[1.5, 12, 8]} />
        <meshBasicMaterial />
      </mesh>
      <group ref={body}>
        <mesh rotation={[0, 0, -Math.PI / 2]} scale={[1, 1, 0.76]}>
          <latheGeometry args={[points, 40]} />
          <meshPhysicalMaterial
            color="#efa5bf"
            roughness={0.28}
            metalness={0.035}
            clearcoat={0.65}
            clearcoatRoughness={0.26}
          />
        </mesh>
        <mesh position={[0.22, -0.18, 0]} scale={[0.88, 0.27, 0.325]}>
          <sphereGeometry args={[1, 32, 16]} />
          <meshStandardMaterial color="#ffe2e6" roughness={0.44} />
        </mesh>
        <group position={[-0.22, 0.36, -0.025]}>
          <Fin />
        </group>
        <group
          ref={left}
          position={[0.12, -0.13, 0.28]}
          rotation={[-0.65, 0, -0.75]}
        >
          <Fin kind="side" />
        </group>
        <group
          ref={right}
          position={[0.12, -0.13, -0.28]}
          rotation={[0.65, 0, -0.75]}
        >
          <Fin kind="side" />
        </group>
        {[1, -1].map((side) => (
          <group key={side}>
            <mesh
              position={[0.78, 0.105, 0.264 * side]}
              scale={[1, 0.92, 0.55]}
            >
              <sphereGeometry args={[0.061, 20, 16]} />
              <meshPhysicalMaterial
                color="#382536"
                roughness={0.12}
                clearcoat={1}
              />
            </mesh>
            <mesh position={[0.796, 0.124, 0.291 * side]}>
              <sphereGeometry args={[0.017, 12, 8]} />
              <meshBasicMaterial color="#fff4ef" />
            </mesh>
            {[0, 1, 2].map((i) => (
              <mesh
                key={i}
                position={[0.4 - i * 0.09, -0.027, 0.351 * side]}
                rotation={[0, 0, -0.22]}
                scale={[0.014, 0.07, 0.012]}
              >
                <sphereGeometry args={[1, 10, 8]} />
                <meshStandardMaterial color="#bb6b8b" roughness={0.6} />
              </mesh>
            ))}
          </group>
        ))}
        <group ref={tail} position={[-1.32, 0, 0]}>
          <mesh position={[-0.17, 0, 0]} scale={[0.32, 0.12, 0.12]}>
            <sphereGeometry args={[1, 20, 12]} />
            <meshStandardMaterial color="#e998b8" roughness={0.35} />
          </mesh>
          <group position={[-0.3, 0, -0.025]}>
            <Fin kind="tail" />
          </group>
        </group>
      </group>
    </group>
  );
});
export default PinkShark;
