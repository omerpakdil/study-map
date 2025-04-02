"use client";

import React, { useRef, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Hover kartı props
interface HoverCardProps {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color: string;
  delay: number;
  icon: number;  // İkon tipini belirler (0-5 arası)
}

// Hover kartı bileşeni
function HoverCard({ position, rotation, scale, color, delay, icon }: HoverCardProps) {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [startPosition] = useState<[number, number, number]>([...position]);
  
  // Hover efektleri
  const onHover = (e: any) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = "pointer";
  };
  
  const onUnhover = () => {
    setHovered(false);
    document.body.style.cursor = "auto";
  };
  
  // Kart animasyonu
  useFrame(({ clock }) => {
    if (meshRef.current) {
      const time = clock.getElapsedTime() * 0.4 + delay;
      
      // Uçuşan hareket
      meshRef.current.position.x = startPosition[0] + Math.sin(time * 0.4) * 0.3;
      meshRef.current.position.y = startPosition[1] + Math.cos(time * 0.5) * 0.2;
      meshRef.current.position.z = startPosition[2] + Math.sin(time * 0.3) * 0.1;
      
      // Yavaş dönüş animasyonu
      meshRef.current.rotation.x = rotation[0] + Math.sin(time * 0.3) * 0.05;
      meshRef.current.rotation.y = rotation[1] + time * 0.1;
      meshRef.current.rotation.z = rotation[2] + Math.cos(time * 0.4) * 0.05;
      
      // Hover durumu
      if (hovered) {
        meshRef.current.scale.set(
          scale[0] * 1.15, 
          scale[1] * 1.15, 
          scale[2] * 1.15
        );
      } else {
        meshRef.current.scale.set(scale[0], scale[1], scale[2]);
      }
    }
  });
  
  return (
    <group 
      ref={meshRef} 
      position={position} 
      rotation={rotation} 
      scale={scale}
      onPointerOver={onHover}
      onPointerOut={onUnhover}
    >
      {/* Ana kart gövdesi */}
      <mesh receiveShadow>
        <boxGeometry args={[1, 1.4, 0.05]} />
        <meshStandardMaterial 
          color={color} 
          metalness={0.2}
          roughness={0.3}
          opacity={0.85}
          transparent
        />
      </mesh>
      
      {/* Kart ön yüzü - Parlak efekt */}
      <mesh position={[0, 0, 0.026]}>
        <boxGeometry args={[0.95, 1.35, 0.01]} />
        <meshStandardMaterial 
          color="#ffffff" 
          metalness={0.5}
          roughness={0.2}
          opacity={0.3}
          transparent
        />
      </mesh>
      
      {/* İkonlar - Farklı şekiller */}
      {icon === 0 && (
        // Kitap ikonu
        <group position={[0, 0, 0.06]} scale={[0.5, 0.5, 0.5]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.8, 1, 0.2]} />
            <meshStandardMaterial 
              color="#ffffff" 
              metalness={0.3}
              roughness={0.2}
            />
          </mesh>
          <mesh position={[0, 0.1, 0.11]}>
            <boxGeometry args={[0.7, 0.7, 0.01]} />
            <meshStandardMaterial 
              color={color} 
              metalness={0.5}
              roughness={0.2}
            />
          </mesh>
        </group>
      )}
      
      {icon === 1 && (
        // Kalem ikonu
        <group position={[0, 0, 0.06]} rotation={[0, 0, Math.PI/4]} scale={[0.5, 0.5, 0.5]}>
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 1.2, 12]} />
            <meshStandardMaterial 
              color="#ffffff" 
              metalness={0.3}
              roughness={0.2}
            />
          </mesh>
          <mesh position={[0, -0.65, 0]}>
            <coneGeometry args={[0.1, 0.3, 12]} />
            <meshStandardMaterial 
              color={color} 
              metalness={0.5}
              roughness={0.2}
            />
          </mesh>
        </group>
      )}
      
      {icon === 2 && (
        // Saat ikonu
        <group position={[0, 0, 0.06]} scale={[0.5, 0.5, 0.5]}>
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.6, 0.6, 0.1, 32]} />
            <meshStandardMaterial 
              color="#ffffff" 
              metalness={0.3}
              roughness={0.2}
            />
          </mesh>
          <mesh position={[0, 0, 0.06]} rotation={[0, 0, Math.PI/4]}>
            <boxGeometry args={[0.05, 0.4, 0.02]} />
            <meshStandardMaterial color={color} />
          </mesh>
          <mesh position={[0, 0, 0.06]} rotation={[0, 0, Math.PI/1.5]}>
            <boxGeometry args={[0.05, 0.3, 0.02]} />
            <meshStandardMaterial color={color} />
          </mesh>
        </group>
      )}
      
      {icon === 3 && (
        // Test ikonu
        <group position={[0, 0, 0.06]} scale={[0.5, 0.5, 0.5]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.8, 1, 0.05]} />
            <meshStandardMaterial 
              color="#ffffff" 
              metalness={0.3}
              roughness={0.2}
            />
          </mesh>
          {/* Çizgiler */}
          {[-0.2, 0, 0.2].map((y, i) => (
            <mesh key={i} position={[0, y, 0.03]}>
              <boxGeometry args={[0.6, 0.04, 0.01]} />
              <meshStandardMaterial color={color} />
            </mesh>
          ))}
          {/* Onay işareti */}
          <mesh position={[-0.2, -0.3, 0.03]} rotation={[0, 0, Math.PI/4]}>
            <boxGeometry args={[0.2, 0.04, 0.01]} />
            <meshStandardMaterial color={color} />
          </mesh>
          <mesh position={[-0.08, -0.38, 0.03]} rotation={[0, 0, -Math.PI/6]}>
            <boxGeometry args={[0.3, 0.04, 0.01]} />
            <meshStandardMaterial color={color} />
          </mesh>
        </group>
      )}
      
      {icon === 4 && (
        // Takvim ikonu
        <group position={[0, 0, 0.06]} scale={[0.5, 0.5, 0.5]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.9, 1, 0.05]} />
            <meshStandardMaterial 
              color="#ffffff" 
              metalness={0.3}
              roughness={0.2}
            />
          </mesh>
          {/* Takvim üst kısmı */}
          <mesh position={[0, 0.4, 0.03]}>
            <boxGeometry args={[0.9, 0.2, 0.01]} />
            <meshStandardMaterial color={color} />
          </mesh>
          {/* Takvim çizgileri */}
          {[-0.2, 0, 0.2].map((y, i) => (
            <mesh key={i} position={[0, y, 0.03]}>
              <boxGeometry args={[0.7, 0.02, 0.01]} />
              <meshStandardMaterial color="#888888" />
            </mesh>
          ))}
          {/* Takvim tarihi */}
          <mesh position={[0, -0.25, 0.03]}>
            <boxGeometry args={[0.3, 0.3, 0.01]} />
            <meshStandardMaterial color={color} />
          </mesh>
        </group>
      )}
    </group>
  );
}

// Ana bileşen
function HoverCardsCollection() {
  const groupRef = useRef<THREE.Group>(null);
  
  // Kart verileri
  const cards = useMemo(() => {
    const cardData: HoverCardProps[] = [];
    const colors = ["#7856FF", "#FF5675", "#56AEFF", "#4CAF50", "#FFC107"];
    
    for (let i = 0; i < 7; i++) {
      // Daire şeklinde dizilim
      const angle = (i / 7) * Math.PI * 2;
      const radius = 2.2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = (Math.random() - 0.5) * 0.5;
      
      // Rotation
      const rotX = (Math.random() - 0.5) * 0.2;
      const rotY = Math.random() * Math.PI * 2;
      const rotZ = (Math.random() - 0.5) * 0.2;
      
      // Scale
      const baseScale = 0.7 + Math.random() * 0.3;
      
      cardData.push({
        position: [x, y, z] as [number, number, number],
        rotation: [rotX, rotY, rotZ] as [number, number, number],
        scale: [baseScale, baseScale, baseScale] as [number, number, number],
        color: colors[i % colors.length],
        delay: i * 2.5,
        icon: i % 5 // 5 farklı ikon tipi
      });
    }
    
    return cardData;
  }, []);
  
  // Ana grup animasyonu
  useFrame(({ clock }) => {
    if (groupRef.current) {
      // Yavaşça dönen kartlar grubu
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.05;
    }
  });
  
  return (
    <group ref={groupRef}>
      {cards.map((card, i) => (
        <HoverCard 
          key={i}
          position={card.position}
          rotation={card.rotation}
          scale={card.scale}
          color={card.color}
          delay={card.delay}
          icon={card.icon}
        />
      ))}
    </group>
  );
}

// Dışa aktarılan ana bileşen
export function HoverCards() {
  return (
    <div className="h-[320px] md:h-[350px] lg:h-[380px] w-full">
      <Canvas 
        camera={{ position: [0, 0, 6], fov: 40 }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['transparent']} />
        
        {/* Işıklar */}
        <ambientLight intensity={0.7} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />
        <pointLight position={[-10, -10, -10]} intensity={0.3} color="#d0a0f0" />
        
        {/* Kartlar */}
        <HoverCardsCollection />
      </Canvas>
    </div>
  );
}

export default HoverCards; 