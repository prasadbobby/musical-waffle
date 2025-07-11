// src/components/3d/Scene3D.js
'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float, Environment, PerspectiveCamera } from '@react-three/drei';
import { Suspense, useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Simple 3D Village House Component
function VillageHouse({ position, rotation, scale = 1 }) {
  const houseRef = useRef();
  
  useFrame((state) => {
    if (houseRef.current) {
      houseRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group ref={houseRef} position={position} rotation={rotation} scale={scale}>
      {/* House Base */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2, 1.5, 2]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      
      {/* Roof */}
      <mesh position={[0, 1.2, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[1.8, 1, 4]} />
        <meshStandardMaterial color="#CD853F" />
      </mesh>
      
      {/* Door */}
      <mesh position={[0, -0.2, 1.01]}>
        <boxGeometry args={[0.4, 0.8, 0.1]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      
      {/* Windows */}
      <mesh position={[-0.6, 0.2, 1.01]}>
        <boxGeometry args={[0.3, 0.3, 0.1]} />
        <meshStandardMaterial color="#87CEEB" />
      </mesh>
      <mesh position={[0.6, 0.2, 1.01]}>
        <boxGeometry args={[0.3, 0.3, 0.1]} />
        <meshStandardMaterial color="#87CEEB" />
      </mesh>
    </group>
  );
}

// Floating Particles
function FloatingParticles() {
  const particlesRef = useRef();
  
  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.002;
    }
  });

  const particles = [];
  for (let i = 0; i < 30; i++) {
    particles.push(
      <Float key={i} speed={2} rotationIntensity={1} floatIntensity={2}>
        <mesh position={[
          (Math.random() - 0.5) * 20,
          Math.random() * 10,
          (Math.random() - 0.5) * 20
        ]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={0.2} />
        </mesh>
      </Float>
    );
  }

  return <group ref={particlesRef}>{particles}</group>;
}

// Error Boundary for 3D components
function Scene3DContent() {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 5, 10]} />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <directionalLight position={[-10, 10, 5]} intensity={0.5} />
      
      <Environment preset="sunset" />
      
      {/* Multiple Village Houses */}
      <VillageHouse position={[-3, 0, 0]} rotation={[0, 0.5, 0]} />
      <VillageHouse position={[0, 0, -2]} rotation={[0, 0, 0]} scale={0.8} />
      <VillageHouse position={[3, 0, 1]} rotation={[0, -0.5, 0]} scale={1.2} />
      
      {/* Floating Particles */}
      <FloatingParticles />
      
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
    </>
  );
}

// Main 3D Scene with error handling
function Scene3D() {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleError = (error) => {
      console.error('3D Scene Error:', error);
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">V</span>
          </div>
          <p className="text-gray-600">3D Experience Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Canvas className="w-full h-full" gl={{ antialias: true, alpha: true }}>
      <Suspense fallback={null}>
        <Scene3DContent />
      </Suspense>
    </Canvas>
  );
}

export default Scene3D;