import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

function Cell({ position, color, scale = 1, speed = 1 }: { 
  position: [number, number, number]; 
  color: string; 
  scale?: number;
  speed?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2 * speed;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3 * speed;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <Sphere ref={meshRef} args={[1, 64, 64]} position={position} scale={scale}>
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={0.4}
          speed={2}
          roughness={0.2}
          metalness={0.1}
          transparent
          opacity={0.8}
        />
      </Sphere>
    </Float>
  );
}

function InnerStructure({ position, color }: { position: [number, number, number]; color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = state.clock.getElapsedTime() * 0.5;
    }
  });

  return (
    <Float speed={3} rotationIntensity={1} floatIntensity={0.5}>
      <mesh ref={meshRef} position={position}>
        <torusGeometry args={[0.5, 0.15, 16, 100]} />
        <meshStandardMaterial color={color} transparent opacity={0.6} />
      </mesh>
    </Float>
  );
}

export default function FloatingCell() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} color="#0d9488" />
        
        {/* Main cells - positioned to sides */}
        <Cell position={[-4, 2, 0]} color="#0d9488" scale={0.8} speed={0.8} />
        <Cell position={[4.5, -1, -1]} color="#14b8a6" scale={1} speed={1} />
        <Cell position={[-3, -2.5, -2]} color="#5eead4" scale={0.6} speed={1.2} />
        <Cell position={[3, 2.5, -1]} color="#2dd4bf" scale={0.5} speed={0.9} />
        
        {/* Inner structures */}
        <InnerStructure position={[-4.5, 0, 1]} color="#99f6e4" />
        <InnerStructure position={[5, 1, 0]} color="#5eead4" />
        
        {/* Small floating particles */}
        <Float speed={4} rotationIntensity={2} floatIntensity={2}>
          <Sphere args={[0.1, 16, 16]} position={[-2, 1, 2]}>
            <meshStandardMaterial color="#14b8a6" transparent opacity={0.7} />
          </Sphere>
        </Float>
        <Float speed={3} rotationIntensity={1.5} floatIntensity={1.5}>
          <Sphere args={[0.15, 16, 16]} position={[2, -2, 1]}>
            <meshStandardMaterial color="#0d9488" transparent opacity={0.7} />
          </Sphere>
        </Float>
        <Float speed={5} rotationIntensity={2} floatIntensity={2}>
          <Sphere args={[0.08, 16, 16]} position={[0, 3, 1]}>
            <meshStandardMaterial color="#5eead4" transparent opacity={0.8} />
          </Sphere>
        </Float>
      </Canvas>
    </div>
  );
}
