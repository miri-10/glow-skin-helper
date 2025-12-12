import { Canvas } from "@react-three/fiber";
import { Float, Sphere } from "@react-three/drei";
import { Suspense } from "react";

function Cell({ position, color, size }: { position: [number, number, number]; color: string; size: number }) {
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <Sphere args={[size, 32, 32]} position={position}>
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.6}
          roughness={0.3}
          metalness={0.1}
        />
      </Sphere>
    </Float>
  );
}

export default function FloatingCell() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.6} />
          <pointLight position={[10, 10, 10]} intensity={0.8} />
          <pointLight position={[-10, -10, -10]} intensity={0.4} />
          
          {/* Floating cells scattered around */}
          <Cell position={[-3.5, 2, -1]} color="#5eadb0" size={0.3} />
          <Cell position={[3.5, -1.5, -2]} color="#7ec8ca" size={0.25} />
          <Cell position={[-2.5, -2, -1.5]} color="#a8dfe0" size={0.2} />
          <Cell position={[2.8, 2.5, -1]} color="#5eadb0" size={0.35} />
          <Cell position={[0, 3, -2]} color="#7ec8ca" size={0.15} />
          <Cell position={[-4, 0, -2]} color="#a8dfe0" size={0.28} />
          <Cell position={[4, 0.5, -1.5]} color="#5eadb0" size={0.22} />
          <Cell position={[-1.5, -3, -1]} color="#7ec8ca" size={0.18} />
          <Cell position={[1.5, -2.8, -2]} color="#a8dfe0" size={0.32} />
        </Suspense>
      </Canvas>
    </div>
  );
}
