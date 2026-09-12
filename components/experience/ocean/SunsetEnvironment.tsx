import { BackSide } from 'three';
import { skyVertex, skyFragment } from './shaders';
export default function SunsetEnvironment() {
  return (
    <>
      <mesh>
        <sphereGeometry args={[180, 32, 24]} />
        <shaderMaterial
          vertexShader={skyVertex}
          fragmentShader={skyFragment}
          side={BackSide}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <hemisphereLight args={['#ffe0d6', '#347c83', 2.4]} />
      <directionalLight
        position={[-5, 5, -8]}
        color="#ffb799"
        intensity={3.4}
      />
      <directionalLight position={[2, 3, 5]} color="#ffe7e9" intensity={2.6} />
    </>
  );
}
