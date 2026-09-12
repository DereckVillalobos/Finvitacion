import { useEffect, useRef, useState, Component, type ReactNode } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import SunsetEnvironment from './SunsetEnvironment';
import WaterSurface from './WaterSurface';
import SharkController from './SharkController';
import BubbleParticles from './BubbleParticles';
import type { OceanProps, WorldClock } from './types';

function Scene({
  discovered,
  reduced,
  onDiscover,
  onReady,
  low,
}: {
  discovered: boolean;
  reduced: boolean;
  onDiscover: () => void;
  onReady: () => void;
  low: boolean;
}) {
  const clock = useRef<WorldClock>({ time: 0, reveal: 0, speed: 1 });
  const camera = useThree((s) => s.camera);
  const ready = useRef(false);
  useEffect(() => {
    camera.position.set(0, 2.1, 8);
    camera.lookAt(0, 0.3, -7);
  }, [camera]);
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.04);
    const target = discovered ? 0.38 : 1;
    clock.current.speed += (target - clock.current.speed) * dt * 2;
    clock.current.time += reduced ? 0 : dt * clock.current.speed;
    if (discovered && !reduced) clock.current.reveal += dt;
    else clock.current.reveal = 0;
    if (!ready.current) {
      ready.current = true;
      onReady();
    }
    if (!reduced)
      camera.position.y = 2.1 + Math.sin(clock.current.time * 0.35) * 0.035;
  });
  return (
    <>
      <SunsetEnvironment />
      <WaterSurface clock={clock} low={low} />
      <SharkController
        clock={clock}
        discovered={discovered}
        reduced={reduced}
        onDiscover={onDiscover}
      />
      <BubbleParticles
        clock={clock}
        active={discovered}
        low={low}
        reduced={reduced}
      />
    </>
  );
}
class WorldBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
function OceanFallback({
  onReady,
  onDiscover,
  discovered,
}: Pick<OceanProps, 'onReady' | 'onDiscover' | 'discovered'>) {
  useEffect(onReady, [onReady]);
  return (
    <div className="ocean-fallback">
      <div className="fallback-sun" />
      <div className="fallback-water" />
      {!discovered && (
        <button className="fallback-secret" onClick={onDiscover}>
          <span aria-hidden="true">✧</span> Descubrir tu sorpresa
        </button>
      )}
    </div>
  );
}
export default function OceanWorld(props: OceanProps) {
  const [low, setLow] = useState(false),
    [dpr, setDpr] = useState(1),
    [visible, setVisible] = useState(true),
    [capable, setCapable] = useState<boolean | null>(null);
  useEffect(() => {
    let ok = false;
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2');
      ok = !!gl;
      gl?.getExtension('WEBGL_lose_context')?.loseContext();
    } catch {}
    setCapable(ok);
    const small = window.innerWidth < 768 || navigator.hardwareConcurrency <= 4;
    setLow(small);
    setDpr(Math.min(window.devicePixelRatio, small ? 1.35 : 1.75));
    const handler = () => setVisible(!document.hidden);
    document.addEventListener('visibilitychange', handler);
    return () => {
      document.removeEventListener('visibilitychange', handler);
      document.body.style.cursor = '';
    };
  }, []);
  const fallback = <OceanFallback {...props} />;
  if (capable === false) return fallback;
  if (capable === null) return null;
  return (
    <WorldBoundary fallback={fallback}>
      <Canvas
        dpr={dpr}
        camera={{ position: [0, 2.1, 8], fov: 48, near: 0.1, far: 250 }}
        gl={{
          antialias: false,
          alpha: false,
          powerPreference: 'high-performance',
        }}
        frameloop={visible ? 'always' : 'never'}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener(
            'webglcontextlost',
            (e) => {
              e.preventDefault();
              setCapable(false);
            },
            { once: true },
          );
        }}
        fallback={fallback}
      >
        <PerformanceMonitor
          onDecline={() => {
            setLow(true);
            setDpr(1);
          }}
          onFallback={() => {
            setLow(true);
            setDpr(0.85);
          }}
          flipflops={2}
        >
          <Scene {...props} low={low} />
        </PerformanceMonitor>
      </Canvas>
    </WorldBoundary>
  );
}
