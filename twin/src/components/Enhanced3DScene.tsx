import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame, extend, useThree } from '@react-three/fiber';
import { OrbitControls, Html, Sphere, Line, Box, Cylinder, Torus, Cone, Effects } from '@react-three/drei';
import { useData } from '../context/DataContext';
import { useGemini } from '../context/GeminiContext';
import styled from 'styled-components';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';

// Extend Three.js objects for React Three Fiber
extend({ EffectComposer, RenderPass, ShaderPass });

// Grayscale shader for post-processing
const GrayscaleShader = {
  uniforms: {
    tDiffuse: { value: null },
    intensity: { value: 1.0 }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float intensity;
    varying vec2 vUv;
    
    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
      gl_FragColor = vec4(vec3(gray), color.a);
    }
  `
};

// Post-processing component for grayscale effect
const GrayscaleEffect: React.FC = () => {
  const { gl, scene, camera, size } = useThree();
  const composer = useRef<EffectComposer | null>(null);
  
  useMemo(() => {
    if (composer.current) {
      composer.current.setSize(size.width, size.height);
    }
  }, [size]);

  useFrame(() => {
    if (composer.current) {
      composer.current.render();
    }
  }, 1);

  return (
    <Effects ref={composer}>
      <renderPass scene={scene} camera={camera} />
      <shaderPass
        args={[GrayscaleShader]}
        renderToScreen
      />
    </Effects>
  );
};

const CanvasContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
`;

interface Enhanced3DSceneProps {
  canvasId: string;
}

// Performance optimization: LOD thresholds
const LOD_DISTANCES = {
  HIGH: 50,
  MEDIUM: 100,
  LOW: 200
};

// Optimized particle counts based on LOD
const PARTICLE_COUNTS = {
  HIGH: { cement: 25, dust: 8, grinding: 6, raw: 12, calcined: 15, clinker: 10 },
  MEDIUM: { cement: 15, dust: 5, grinding: 4, raw: 8, calcined: 10, clinker: 6 },
  LOW: { cement: 8, dust: 3, grinding: 2, raw: 5, calcined: 6, clinker: 4 }
};

// Professional grayscale material color schemes
const MATERIAL_COLORS = {
  wireframe: {
    primary: "#00ccff",
    secondary: "#0066cc",
    accent: "#0099ff"
  },
  solid: {
    // Colorful cement plant materials
    limestone: { body: "#F5F5DC", cone: "#DEB887", emissive: "#CD853F" },
    clay: { body: "#8B7355", cone: "#6B5B47", emissive: "#4A3F35" },
    ironOre: { body: "#696969", cone: "#2F4F4F", emissive: "#1C1C1C" },
    sandstone: { body: "#D2B48C", cone: "#B8860B", emissive: "#8B7355" },
    flyAsh: { body: "#808080", cone: "#707070", emissive: "#606060" },
    gypsum: { body: "#E0E0E0", cone: "#D0D0D0", emissive: "#C0C0C0" },
    
    // Industrial equipment materials - realistic colors
    steel: { body: "#708090", cone: "#556B7A", emissive: "#3A4A5A" },
    concrete: { body: "#A0A0A0", cone: "#808080", emissive: "#606060" },
    refractory: { body: "#8B4513", cone: "#654321", emissive: "#3E2723" },
    insulation: { body: "#A0A0A0", cone: "#909090", emissive: "#808080" },
    
    // Temperature zones - realistic thermal colors
    hotMetal: { body: "#FFD700", cone: "#FFA500", emissive: "#FF8C00" },
    burningZone: { body: "#FF4500", cone: "#DC143C", emissive: "#B22222" },
    preheater: { body: "#FF6347", cone: "#FF4500", emissive: "#DC143C" },
    
    // Cooler zones - cool colors
    cooler: { body: "#87CEEB", cone: "#4682B4", emissive: "#1E90FF" },
    ambient: { body: "#F0F8FF", cone: "#E6E6FA", emissive: "#D3D3D3" }
  }
};

// Texture loading utility - simplified to avoid conditional hooks
const useIndustrialTextures = () => {
  // For now, return null textures to avoid hook issues
  // In production, you would set up proper texture loading
  const concreteTexture = null;
  const metalTexture = null;
  const steelTexture = null;
  
  return { concreteTexture, metalTexture, steelTexture };
};

// LOD calculation utility
const calculateLOD = (camera: THREE.Camera, position: [number, number, number]) => {
  const distance = camera.position.distanceTo(new THREE.Vector3(...position));
  if (distance < LOD_DISTANCES.HIGH) return 'HIGH';
  if (distance < LOD_DISTANCES.MEDIUM) return 'MEDIUM';
  return 'LOW';
};

// Enhanced material properties utility
const createEnhancedMaterial = (
  isWireframeMode: boolean, 
  materialType: keyof typeof MATERIAL_COLORS.solid,
  texture?: THREE.Texture | null
) => {
  if (isWireframeMode) {
    const wireframeColors = MATERIAL_COLORS.wireframe;
    return {
      color: wireframeColors.primary,
      transparent: true,
      opacity: 0.3,
      emissive: wireframeColors.secondary,
      emissiveIntensity: 0.5,
      wireframe: true
    };
  } else {
    const solidColors = MATERIAL_COLORS.solid[materialType];
    return {
      color: solidColors.body,
      transparent: true,
      opacity: 0.9,
      emissive: solidColors.emissive,
      emissiveIntensity: 0.1,
      wireframe: false,
      map: texture,
      roughness: 0.8,
      metalness: 0.2
    };
  }
};

// Enhanced Real-time Sensor Tooltip Component with Better UX
const SensorTooltip: React.FC<{
  sensor: {
    id: string;
    name: string;
    value: number;
    position: [number, number, number];
    color: string;
    priority: 'high' | 'medium' | 'low';
  };
  position: [number, number, number];
  priority?: 'high' | 'medium' | 'low';
  showDetails?: boolean;
}> = ({ sensor, position, priority = 'medium', showDetails = true }) => {
  const [hovered, setHovered] = useState(false);
  const { isRealtimeMode } = useData();

  // Only show high priority sensors by default
  if (priority === 'low' && !showDetails) return null;

  const size = priority === 'high' ? 0.3 : priority === 'medium' ? 0.25 : 0.2;
  const emissiveIntensity = priority === 'high' ? 0.6 : priority === 'medium' ? 0.4 : 0.3;
  
  // Enhanced visual indicators for real-time data - grayscale
  const pulseColor = isRealtimeMode ? '#808080' : '#A0A0A0';
  const borderColor = isRealtimeMode ? '#808080' : '#A0A0A0';

      return (
      <group position={position}>
        {/* Enhanced sensor sphere with real-time indicators */}
        <Sphere
          args={[size, 16, 16]}
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
          onClick={() => {
            // Sensor interaction handled
          }}
        >
          <meshStandardMaterial
            color={sensor.color}
            emissive={sensor.color}
            emissiveIntensity={emissiveIntensity}
            roughness={0.3}
            metalness={0.7}
          />
        </Sphere>

        {/* Real-time data pulse ring */}
        {isRealtimeMode && (
          <Sphere
            args={[size * 1.5, 16, 16]}
            position={[0, 0, 0]}
          >
            <meshBasicMaterial
              color={pulseColor}
              transparent
              opacity={0.3}
              side={THREE.DoubleSide}
            />
          </Sphere>
        )}

        {/* Priority indicator ring */}
        <Sphere
          args={[size * 1.2, 16, 16]}
          position={[0, 0, 0]}
        >
          <meshBasicMaterial
            color={priority === 'high' ? '#FFFFFF' : priority === 'medium' ? '#C0C0C0' : '#808080'}
            transparent
            opacity={0.2}
            side={THREE.DoubleSide}
          />
        </Sphere>

              {hovered && (
          <Html position={[0, 0.8, 0]} center>
            <div style={{
              background: 'linear-gradient(135deg, rgba(40, 40, 40, 0.98) 0%, rgba(60, 60, 60, 0.98) 100%)',
              color: '#E0E0E0',
              padding: '10px 14px',
              borderRadius: '8px',
              border: `2px solid ${borderColor}`,
              fontSize: '11px',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              backdropFilter: 'blur(15px)',
              maxWidth: '220px',
              boxShadow: `0 6px 20px rgba(0,0,0,0.5), 0 0 20px ${borderColor}40`,
              position: 'relative',
              transform: 'translateY(-10px)',
              transition: 'all 0.3s ease'
            }}>
              {/* Priority indicator */}
              <div style={{
                position: 'absolute',
                top: '-6px',
                left: '-6px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: priority === 'high' ? '#FFFFFF' : priority === 'medium' ? '#C0C0C0' : '#808080',
                border: '2px solid #fff'
              }} />

              {/* Real-time indicator */}
              {isRealtimeMode && (
                <div style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  background: '#808080',
                  border: '2px solid #fff',
                  animation: 'pulse 1.5s infinite',
                  boxShadow: '0 0 10px rgba(128, 128, 128, 0.6)'
                }} />
              )}
              
              <div style={{ 
                fontWeight: 'bold', 
                marginBottom: '6px', 
                fontSize: '13px', 
                color: '#fff',
                textShadow: '0 2px 4px rgba(0,0,0,0.5)'
              }}>
                📊 {sensor.name}
              </div>
              <div style={{ marginBottom: '4px' }}>
                <span style={{ 
                  fontSize: '18px', 
                  fontWeight: 'bold',
                  color: isRealtimeMode ? '#808080' : '#A0A0A0',
                  textShadow: isRealtimeMode ? '0 0 10px rgba(128, 128, 128, 0.6)' : '0 0 8px rgba(160, 160, 160, 0.4)'
                }}>
                  {sensor.value}
                </span>
                <span style={{ 
                  opacity: 0.9, 
                  marginLeft: '6px',
                  fontSize: '12px',
                  fontWeight: '500'
                }}>{sensor.unit}</span>
              </div>
              <div style={{ 
                fontSize: '11px', 
                opacity: 0.9, 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px',
                marginBottom: '4px'
              }}>
                <span style={{ fontWeight: '500' }}>Trend:</span>
                <span style={{
                  color: sensor.trend === 'up' ? '#FFFFFF' :
                         sensor.trend === 'down' ? '#A0A0A0' : '#808080',
                  fontWeight: 'bold',
                  fontSize: '12px'
                }}>
                  {sensor.trend === 'up' ? '↗' : sensor.trend === 'down' ? '↘' : '→'} {sensor.trend.toUpperCase()}
                </span>
              </div>
              {isRealtimeMode && (
                <div style={{ 
                  fontSize: '10px', 
                  color: '#808080', 
                  marginTop: '4px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  textShadow: '0 0 8px rgba(128, 128, 128, 0.5)'
                }}>
                  ⚡ LIVE DATA STREAMING
                </div>
              )}
              <div style={{
                fontSize: '9px',
                color: '#959595',
                marginTop: '3px',
                fontStyle: 'italic'
              }}>
                Priority: {priority.toUpperCase()}
              </div>
            </div>
          </Html>
        )}
    </group>
  );
};

// Enhanced Animated Heat Effect
const HeatEffect: React.FC<{ position: [number, number, number]; color: string; intensity?: number; isWireframeMode: boolean }> = ({ position, color, intensity = 0, isWireframeMode }) => {
  const groupRef = useRef<THREE.Group>(null);
  const particleRefs = useRef<THREE.Mesh[]>([]);
  const flameRefs = useRef<THREE.Mesh[]>([]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // Animate heat particles with floating motion
    particleRefs.current.forEach((particle, i) => {
      if (particle) {
        particle.position.y = Math.sin(time * 2 + i * 0.5) * 0.3;
        particle.rotation.x = time * 0.5 + i;
        particle.rotation.y = time * 0.3 + i * 0.7;
        
        // Pulsing opacity
        const material = particle.material as THREE.MeshBasicMaterial;
        material.opacity = 0.3 + Math.sin(time * 3 + i) * 0.2;
      }
    });

    // Animate flame bursts with rotation and scaling
    flameRefs.current.forEach((flame, i) => {
      if (flame) {
        flame.rotation.z = time * 0.8 + i * Math.PI / 3;
        flame.scale.setScalar(1 + Math.sin(time * 4 + i) * 0.2);
        
        const material = flame.material as THREE.MeshBasicMaterial;
        material.opacity = 0.4 + Math.sin(time * 2 + i) * 0.2;
      }
    });

    // Rotate entire heat effect group
    if (groupRef.current) {
      groupRef.current.rotation.y = time * 0.2;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Enhanced outer heat ring with animation */}
      <Cylinder
        args={[2.8, 3.5, 0.1, 32]}
        position={[0, 0, 0]}
      >
        <meshBasicMaterial
          color={isWireframeMode ? MATERIAL_COLORS.wireframe.primary : color}
          transparent
          opacity={isWireframeMode ? 0.3 : 0.6}
          side={THREE.DoubleSide}
          wireframe={isWireframeMode}
        />
      </Cylinder>

      {/* Enhanced inner heat core */}
      <Cylinder
        args={[2.0, 2.5, 0.08, 24]}
        position={[0, 0, 0.02]}
      >
        <meshBasicMaterial
          color={isWireframeMode ? MATERIAL_COLORS.wireframe.accent : "#FFFFFF"}
          transparent
          opacity={isWireframeMode ? 0.4 : 0.9}
          side={THREE.DoubleSide}
          wireframe={isWireframeMode}
        />
      </Cylinder>

      {/* Animated heat particles */}
      {Array.from({ length: 12 }).map((_, i) => (
        <Sphere
          key={`heat-particle-${i}`}
          ref={(ref) => { if (ref) particleRefs.current[i] = ref; }}
          args={[0.08, 8, 8]}
          position={[
            (i % 4 - 1.5) * 0.8,
            (Math.floor(i / 4) - 0.5) * 0.8,
            (i % 2 - 0.5) * 0.4
          ]}
        >
          <meshBasicMaterial
            color={isWireframeMode ? MATERIAL_COLORS.wireframe.primary : (i % 3 === 0 ? MATERIAL_COLORS.solid.burningZone.body : i % 3 === 1 ? "#FFFFFF" : color)}
            transparent
            opacity={0.5}
            wireframe={isWireframeMode}
          />
        </Sphere>
      ))}

      {/* Animated flame bursts */}
      {Array.from({ length: 6 }).map((_, i) => (
        <Cylinder
          key={`flame-burst-${i}`}
          ref={(ref) => { if (ref) flameRefs.current[i] = ref; }}
          args={[0.1, 0.3, 1.2, 8]}
          position={[
            Math.cos(i * Math.PI / 3) * 1.8,
            Math.sin(i * Math.PI / 3) * 1.8,
            0
          ]}
          rotation={[0, 0, i * Math.PI / 3]}
        >
          <meshBasicMaterial
            color={isWireframeMode ? MATERIAL_COLORS.wireframe.primary : MATERIAL_COLORS.solid.hotMetal.body}
            transparent
            opacity={0.4}
            wireframe={isWireframeMode}
          />
        </Cylinder>
      ))}

      {/* Additional energy rings for enhanced visual effect */}
      {!isWireframeMode && (
        <>
          <Torus args={[3, 0.1, 8, 32]} position={[0, 0.5, 0]}>
            <meshBasicMaterial color={color} transparent opacity={0.3} />
          </Torus>
          <Torus args={[2.5, 0.08, 8, 32]} position={[0, -0.3, 0]}>
            <meshBasicMaterial color="#ffffff" transparent opacity={0.4} />
          </Torus>
        </>
      )}
    </group>
  );
};

// Enhanced Animated Conveyor System
const AnimatedConveyor: React.FC<{ position: [number, number, number]; isWireframeMode: boolean }> = ({ position, isWireframeMode }) => {
  const beltRef = useRef<THREE.Mesh>(null);
  const materialRefs = useRef<THREE.Mesh[]>([]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // Animate conveyor belt texture scrolling
    if (beltRef.current) {
      const material = beltRef.current.material as THREE.MeshPhongMaterial;
      if (material.map) {
        material.map.offset.x = (time * 0.2) % 1;
      }
    }

    // Animate material on conveyor
    materialRefs.current.forEach((material, i) => {
      if (material) {
        material.position.x += 0.02; // Move along conveyor
        if (material.position.x > 10) material.position.x = -10; // Reset position
        
        // Slight bouncing motion
        material.position.y = 0.3 + Math.sin(time * 3 + i) * 0.05;
        material.rotation.z = time + i;
      }
    });
  });

  return (
    <group position={position}>
      {/* Enhanced conveyor belt */}
      <Box ref={beltRef} args={[20, 0.5, 2]}>
        <meshPhongMaterial 
          color={isWireframeMode ? MATERIAL_COLORS.wireframe.primary : "#34495e"}
          transparent 
          opacity={isWireframeMode ? 0.3 : 0.9}
          emissive={isWireframeMode ? MATERIAL_COLORS.wireframe.primary : "#1C1C1C"}
          emissiveIntensity={isWireframeMode ? 1.0 : 0.1}
          wireframe={isWireframeMode}
        />
      </Box>
      
      {/* Material on conveyor */}
      {Array.from({ length: 8 }).map((_, i) => (
        <Box
          key={`conveyor-material-${i}`}
          ref={(ref) => { if (ref) materialRefs.current[i] = ref; }}
          args={[0.3, 0.2, 0.3]}
          position={[-10 + i * 2.5, 0.35, 0]}
        >
          <meshPhongMaterial
            color={isWireframeMode ? MATERIAL_COLORS.wireframe.primary : MATERIAL_COLORS.solid.refractory.body}
            wireframe={isWireframeMode}
            emissive={isWireframeMode ? MATERIAL_COLORS.wireframe.secondary : MATERIAL_COLORS.solid.refractory.emissive}
            emissiveIntensity={isWireframeMode ? 0.3 : 0.1}
          />
        </Box>
      ))}
      
      {/* Conveyor supports */}
      {Array.from({ length: 8 }).map((_, i) => (
        <Box key={`support-${i}`} args={[0.3, 4, 0.3]} position={[-10 + i * 2.5, -2, 0]}>
          <meshPhongMaterial 
            color={isWireframeMode ? MATERIAL_COLORS.wireframe.primary : "#C0C0C0"}
            transparent 
            opacity={isWireframeMode ? 0.5 : 0.9}
            emissive={isWireframeMode ? MATERIAL_COLORS.wireframe.primary : "#A9A9A9"}
            emissiveIntensity={isWireframeMode ? 0.6 : 0.1}
            wireframe={isWireframeMode}
          />
        </Box>
      ))}
      
      {/* Enhanced visual effects for colorful mode */}
      {!isWireframeMode && (
        <>
          {/* Motion blur effect */}
          <Box args={[20.5, 1.0, 2.5]} position={[0, 0, 0]}>
            <meshPhongMaterial 
              color="#BDBDBD"
              transparent 
              opacity={0.2}
              emissive="#959595"
              emissiveIntensity={0.1}
            />
          </Box>
          
          {/* Direction indicators */}
          {Array.from({ length: 4 }).map((_, i) => (
            <Cone key={`direction-${i}`} args={[0.1, 0.3, 8]} position={[-8 + i * 5, 0.8, 0]} rotation={[0, 0, Math.PI / 2]}>
              <meshBasicMaterial color="#3498db" transparent opacity={0.6} />
            </Cone>
          ))}
        </>
      )}
    </group>
  );
};

// Enhanced Animated Kiln Material Display with Performance Optimization
const KilnInternalMaterial: React.FC<{ position: [number, number, number]; isWireframeMode: boolean }> = ({ position, isWireframeMode }) => {
  const groupRef = useRef<THREE.Group>(null);
  const rawMaterialRefs = useRef<THREE.Mesh[]>([]);
  const calciningRefs = useRef<THREE.Mesh[]>([]);
  const clinkerRefs = useRef<THREE.Mesh[]>([]);
  const { concreteTexture } = useIndustrialTextures();
  
  // Performance optimization: Calculate LOD based on camera distance
  const [currentLOD, setCurrentLOD] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // Performance optimization: Update LOD every 30 frames
    if (Math.floor(time * 60) % 30 === 0) {
      const newLOD = calculateLOD(state.camera, position);
      setCurrentLOD(newLOD);
    }
    
    // Skip animations if LOD is LOW and object is far
    if (currentLOD === 'LOW') return;
    
    // Animate raw material flow from inlet
    rawMaterialRefs.current.forEach((material, i) => {
      if (material) {
        // Move material through kiln
        material.position.x += 0.01; // Flow direction
        if (material.position.x > 3) material.position.x = -3; // Reset at inlet
        
        // Tumbling motion (reduced for MEDIUM LOD)
        const rotationSpeed = currentLOD === 'HIGH' ? 1 : 0.5;
        material.rotation.x = time * 2 * rotationSpeed + i;
        material.rotation.z = time * 1.5 * rotationSpeed + i * 0.5;
        
        // Slight vertical bouncing
        material.position.y = 0.5 + Math.sin(time * 3 + i) * 0.2;
      }
    });

    // Animate calcining material with heat effects
    calciningRefs.current.forEach((material, i) => {
      if (material) {
        material.position.x += 0.008; // Slower flow
        if (material.position.x > 2) material.position.x = -1;
        
        // Heat-induced movement
        material.position.y = 0.3 + Math.sin(time * 4 + i) * 0.15;
        material.rotation.y = time * 3 + i;
        
        // Color transition effect
        const heatIntensity = 0.5 + Math.sin(time * 2 + i) * 0.3;
        const material_mat = material.material as THREE.MeshPhongMaterial;
        material_mat.emissiveIntensity = heatIntensity * 0.3;
      }
    });

    // Animate clinker formation
    clinkerRefs.current.forEach((clinker, i) => {
      if (clinker) {
        clinker.position.x += 0.005; // Slowest flow
        if (clinker.position.x > 4) clinker.position.x = 0;
        
        // Cooling and settling motion
        clinker.position.y = 0.2 + Math.sin(time + i) * 0.1;
        clinker.rotation.x = time * 0.5 + i;
      }
    });

    // Rotate entire material group slightly
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(time * 0.1) * 0.05;
    }
  });

  // Get optimized particle count based on LOD
  const particleCounts = PARTICLE_COUNTS[currentLOD];
  const materialProps = createEnhancedMaterial(isWireframeMode, 'limestone', concreteTexture);

  return (
    <group ref={groupRef} position={position}>
      {/* Enhanced raw material feed with flow animation */}
      {Array.from({ length: particleCounts.raw }).map((_, i) => (
        <Sphere
          key={`raw-material-${i}`}
          ref={(ref) => { if (ref) rawMaterialRefs.current[i] = ref; }}
          args={[0.12 + Math.random() * 0.08, currentLOD === 'HIGH' ? 8 : 6, currentLOD === 'HIGH' ? 8 : 6]}
          position={[
            -3 + Math.random() * 2,
            0.3 + Math.random() * 0.4,
            (Math.random() - 0.5) * 1.2
          ]}
        >
          <meshStandardMaterial
            {...materialProps}
          />
        </Sphere>
      ))}

      {/* Enhanced intermediate calcined material with heat effects */}
      {Array.from({ length: particleCounts.calcined }).map((_, i) => (
        <Sphere
          key={`calcined-${i}`}
          ref={(ref) => { if (ref) calciningRefs.current[i] = ref; }}
          args={[0.08 + Math.random() * 0.05, currentLOD === 'HIGH' ? 8 : 6, currentLOD === 'HIGH' ? 8 : 6]}
          position={[
            -1 + Math.random() * 4,
            0.2 + Math.random() * 0.3,
            (Math.random() - 0.5) * 1.4
          ]}
        >
          <meshStandardMaterial
            {...createEnhancedMaterial(isWireframeMode, 'clay', concreteTexture)}
            emissiveIntensity={isWireframeMode ? 0.4 : 0.05}
          />
        </Sphere>
      ))}

      {/* Enhanced clinker formation with cooling animation */}
      {Array.from({ length: particleCounts.clinker }).map((_, i) => (
        <Sphere
          key={`clinker-${i}`}
          ref={(ref) => { if (ref) clinkerRefs.current[i] = ref; }}
          args={[0.06 + Math.random() * 0.04, currentLOD === 'HIGH' ? 6 : 4, currentLOD === 'HIGH' ? 6 : 4]}
          position={[
            0.5 + Math.random() * 2,
            0.1 + Math.random() * 0.2,
            (Math.random() - 0.5) * 1.0
          ]}
        >
          <meshStandardMaterial
            {...createEnhancedMaterial(isWireframeMode, 'ironOre', concreteTexture)}
            emissiveIntensity={isWireframeMode ? 0.3 : 0.15}
          />
        </Sphere>
      ))}

      {/* Additional visual effects for colorful mode */}
      {!isWireframeMode && (
        <>
          {/* Heat shimmer effect */}
          <Torus args={[2, 0.1, 8, 32]} position={[0, 0.5, 0]}>
            <meshBasicMaterial color={MATERIAL_COLORS.solid.burningZone.body} transparent opacity={0.2} />
          </Torus>
          
          {/* Material flow indicators */}
          {Array.from({ length: 3 }).map((_, i) => (
            <Cone key={`flow-indicator-${i}`} args={[0.1, 0.3, 8]} position={[-2 + i * 2, 0.8, 0]} rotation={[0, 0, Math.PI / 2]}>
              <meshBasicMaterial color="#3498db" transparent opacity={0.5} />
            </Cone>
          ))}
        </>
      )}
    </group>
  );
};

// Enhanced Animated Mill Display (Updated) with Performance Optimization and Real-time Feed Data
const MillInternalAnimationUpdated: React.FC<{ position: [number, number, number]; millId: number; isWireframeMode: boolean }> = ({ position, millId, isWireframeMode }) => {
  const groupRef = useRef<THREE.Group>(null);
  const ballRefs = useRef<THREE.Mesh[]>([]);
  const materialRefs = useRef<THREE.Mesh[]>([]);
  const dustRefs = useRef<THREE.Mesh[]>([]);
  const { metalTexture, steelTexture } = useIndustrialTextures();
  const { sensorData, millData } = useData();
  
  // Performance optimization: Calculate LOD based on camera distance
  const [currentLOD, setCurrentLOD] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');
  
  // Hover state for data display
  const [isHovered, setIsHovered] = useState(false);
  
  // Get real-time feed data from Excel data and sensor data
  const getMillFeedData = () => {
    const latestMillData = millData.length > 0 ? millData[millData.length - 1] : null;
    
    if (millId === 1) {
      return {
        feedRate: latestMillData?.mill1FeedRate || sensorData['mill-feed']?.value || 12.4,
        pressure: latestMillData?.mill1Pressure || sensorData['mill-pressure']?.value || 2.1,
        efficiency: latestMillData?.mill1Efficiency || sensorData['mill-eff']?.value || 78,
        particleSize: latestMillData?.mill1ParticleSize || sensorData['mill-particle']?.value || 12,
        powerConsumption: latestMillData?.powerConsumption || 2450,
        mediaWear: latestMillData?.grindingMediaWear || 0.15,
        productQuality: latestMillData?.productQuality || 95.2
      };
    } else {
      return {
        feedRate: latestMillData?.mill2FeedRate || 11.8,
        pressure: latestMillData?.mill2Pressure || 2.0,
        efficiency: latestMillData?.mill2Efficiency || 79,
        particleSize: latestMillData?.mill2ParticleSize || 11.5,
        powerConsumption: latestMillData?.powerConsumption || 2460,
        mediaWear: latestMillData?.grindingMediaWear || 0.15,
        productQuality: latestMillData?.productQuality || 95.3
      };
    }
  };
  
  const millFeedData = getMillFeedData();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const millSpeed = 0.5 + millId * 0.2; // Different speeds for different mills
    
    // Performance optimization: Update LOD every 30 frames
    if (Math.floor(time * 60) % 30 === 0) {
      const newLOD = calculateLOD(state.camera, position);
      setCurrentLOD(newLOD);
    }
    
    // Skip animations if LOD is LOW and object is far
    if (currentLOD === 'LOW') return;
    
    // Animate grinding balls in circular motion
    ballRefs.current.forEach((ball, i) => {
      if (ball) {
        const angle = time * millSpeed + i * Math.PI / 3;
        ball.position.x = Math.cos(angle) * 0.7;
        ball.position.z = Math.sin(angle) * 0.7;
        ball.position.y = 0.4 + Math.sin(time * 2 + i) * 0.1; // Slight vertical movement
        ball.rotation.x = time * 2 * (currentLOD === 'HIGH' ? 1 : 0.5);
        ball.rotation.y = time * 1.5;
      }
    });

    // Animate material flow with turbulent motion
    materialRefs.current.forEach((material, i) => {
      if (material) {
        const turbulence = time * 3 + i * 0.8;
        material.position.x = Math.sin(turbulence) * 0.7;
        material.position.y = Math.cos(turbulence * 1.2) * 0.15 + 0.15;
        material.position.z = Math.sin(turbulence * 0.8) * 0.7;
        
        // Pulsing scale
        const scale = 1 + Math.sin(time * 4 + i) * 0.3;
        material.scale.setScalar(scale);
      }
    });

    // Animate dust particles with upward flow
    dustRefs.current.forEach((dust, i) => {
      if (dust) {
        dust.position.y += 0.01; // Continuous upward movement
        if (dust.position.y > 1) dust.position.y = 0; // Reset position
        
        // Random horizontal drift
        dust.position.x += (Math.random() - 0.5) * 0.005;
        dust.position.z += (Math.random() - 0.5) * 0.005;
        
        // Fade out as it rises
        const material = dust.material as THREE.MeshBasicMaterial;
        material.opacity = Math.max(0.1, 0.4 - dust.position.y * 0.2);
      }
    });

    // Rotate entire mill group
    if (groupRef.current) {
      groupRef.current.rotation.y = time * 0.1;
    }
  });

  // Get optimized particle count based on LOD
  const particleCounts = PARTICLE_COUNTS[currentLOD];

  return (
    <group 
      ref={groupRef} 
      position={position}
    >
      {/* Enhanced grinding balls with animation */}
      {Array.from({ length: particleCounts.grinding }).map((_, i) => (
        <Sphere
          key={`grinding-ball-${millId}-${i}`}
          ref={(ref) => { if (ref) ballRefs.current[i] = ref; }}
          args={[0.1, currentLOD === 'HIGH' ? 12 : 8, currentLOD === 'HIGH' ? 12 : 8]}
          position={[
            Math.cos(i * Math.PI / 3) * 0.7,
            0.4,
            Math.sin(i * Math.PI / 3) * 0.7
          ]}
        >
          <meshStandardMaterial 
            color={isWireframeMode ? MATERIAL_COLORS.wireframe.primary : "#3C3C3C"} 
            wireframe={isWireframeMode}
            emissive={isWireframeMode ? MATERIAL_COLORS.wireframe.secondary : "#1a252f"}
            emissiveIntensity={isWireframeMode ? 0.3 : 0.1}
            roughness={0.2}
            metalness={0.9}
            map={steelTexture}
          />
        </Sphere>
      ))}

      {/* Enhanced cement material with turbulent animation */}
      <group>
        {Array.from({ length: particleCounts.cement }).map((_, i) => (
          <Sphere
            key={`cement-particle-${millId}-${i}`}
            ref={(ref) => { if (ref) materialRefs.current[i] = ref; }}
            args={[0.02 + Math.random() * 0.03, currentLOD === 'HIGH' ? 6 : 4, currentLOD === 'HIGH' ? 6 : 4]}
            position={[
              (Math.random() - 0.5) * 1.4,
              Math.random() * 0.3,
              (Math.random() - 0.5) * 1.4
            ]}
          >
            <meshStandardMaterial
              {...createEnhancedMaterial(isWireframeMode, 'limestone', metalTexture)}
              transparent
              opacity={isWireframeMode ? 0.3 : 0.7}
            />
          </Sphere>
        ))}
      </group>

      {/* Enhanced dust particles with upward flow animation */}
      {Array.from({ length: particleCounts.dust }).map((_, i) => (
        <Sphere
          key={`dust-particle-${millId}-${i}`}
          ref={(ref) => { if (ref) dustRefs.current[i] = ref; }}
          args={[0.02, currentLOD === 'HIGH' ? 8 : 6, currentLOD === 'HIGH' ? 8 : 6]}
          position={[
            (i % 4 - 1.5) * 0.3,
            Math.random() * 0.3,
            (i % 4 - 1.5) * 0.3
          ]}
        >
          <meshStandardMaterial
            color={isWireframeMode ? MATERIAL_COLORS.wireframe.primary : "#F5F5F5"}
            transparent
            opacity={isWireframeMode ? 0.2 : 0.4}
            wireframe={isWireframeMode}
            roughness={0.9}
            metalness={0.1}
          />
        </Sphere>
      ))}

      {/* Additional visual effects for colorful mode */}
      {!isWireframeMode && (
        <>
          {/* Energy field around mill */}
          <Torus args={[1.0, 0.03, 8, 32]} position={[0, 0.2, 0]}>
            <meshBasicMaterial color="#3498db" transparent opacity={0.3} />
          </Torus>
          
          {/* Grinding efficiency indicator */}
          <Cone args={[0.08, 0.4, 8]} position={[0, 0.8, 0]}>
            <meshBasicMaterial 
              color={isHovered ? "#3498db" : "#A0A0A0"} 
              transparent 
              opacity={isHovered ? 0.8 : 0.6} 
            />
          </Cone>
          
          {/* Hover indicator ring */}
          {isHovered && (
            <Torus args={[1.2, 0.05, 8, 32]} position={[0, 0.2, 0]}>
              <meshBasicMaterial color="#3498db" transparent opacity={0.6} />
            </Torus>
          )}
          
          {/* Interactive indicator - subtle glow */}
          <Torus args={[1.0, 0.02, 8, 32]} position={[0, 0.2, 0]}>
            <meshBasicMaterial 
              color="#3498db" 
              transparent 
              opacity={isHovered ? 0.4 : 0.1} 
            />
          </Torus>
          
          {/* Mill position marker */}
          <Sphere args={[0.1, 8, 8]} position={[0, 0.1, 0]}>
            <meshBasicMaterial 
              color="#3498db" 
              transparent 
              opacity={0.6} 
            />
          </Sphere>
          
          {/* Small pointer indicator */}
          <Html position={[0, 2.0, 0]} center>
            <div 
              style={{
                width: '10px',
                height: '10px',
                background: isHovered ? '#2ecc71' : '#3498db',
                borderRadius: '50%',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                opacity: 0.9,
                boxShadow: isHovered ? '0 0 15px rgba(46, 204, 113, 0.9)' : '0 0 10px rgba(52, 152, 219, 0.7)',
                zIndex: 1000,
                position: 'relative'
              }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
            </div>
          </Html>
          
          {/* Real-time Feed Data Display - Show on hover */}
          {isHovered && (
            <Html position={[0, 1.2, 0]} center>
            <div style={{
              background: 'rgba(0, 0, 0, 0.9)',
              border: '1px solid #3498db',
              borderRadius: '8px',
              padding: '10px',
              fontSize: '11px',
              color: '#ffffff',
              minWidth: '140px',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}>
              <div style={{ fontWeight: 'bold', color: '#3498db', marginBottom: '6px', fontSize: '12px' }}>
                Mill #{millId} Real-time Data
              </div>
              <div style={{ marginBottom: '3px' }}>
                Feed Rate: <span style={{ color: '#2ecc71' }}>{millFeedData.feedRate.toFixed(1)} t/h</span>
              </div>
              <div style={{ marginBottom: '3px' }}>
                Pressure: <span style={{ color: '#e74c3c' }}>{millFeedData.pressure.toFixed(1)} bar</span>
              </div>
              <div style={{ marginBottom: '3px' }}>
                Efficiency: <span style={{ color: '#f39c12' }}>{Math.round(millFeedData.efficiency)}%</span>
              </div>
              <div style={{ marginBottom: '3px' }}>
                Particle Size: <span style={{ color: '#9b59b6' }}>{millFeedData.particleSize.toFixed(1)} µm</span>
              </div>
              <div style={{ marginBottom: '3px' }}>
                Power: <span style={{ color: '#e67e22' }}>{Math.round(millFeedData.powerConsumption)} kW</span>
              </div>
              <div style={{ marginBottom: '3px' }}>
                Media Wear: <span style={{ color: '#8e44ad' }}>{millFeedData.mediaWear.toFixed(2)} mm/h</span>
              </div>
              <div>
                Quality: <span style={{ color: '#27ae60' }}>{millFeedData.productQuality.toFixed(1)}%</span>
              </div>
            </div>
          </Html>
          )}
        </>
      )}
    </group>
  );
};

// Raw Silo Feed Flow Visualization Component
const RawSiloFeedFlow: React.FC<{ 
  siloPosition: [number, number, number]; 
  millPosition: [number, number, number]; 
  siloId: number;
  isWireframeMode: boolean;
}> = ({ siloPosition, millPosition, siloId, isWireframeMode }) => {
  const { sensorData, millData } = useData();
  const flowRefs = useRef<THREE.Mesh[]>([]);
  
  // Hover state for data display
  const [isHovered, setIsHovered] = useState(false);
  
  // Get silo feed data from Excel data
  const getSiloFeedData = () => {
    const latestMillData = millData.length > 0 ? millData[millData.length - 1] : null;
    const baseFeedRate = siloId < 2 ? 
      (latestMillData?.mill1FeedRate || 12.4) : 
      (latestMillData?.mill2FeedRate || 11.8);
    
    return {
      feedRate: baseFeedRate + (siloId * 0.5), // Slight variation per silo
      materialType: ['Limestone', 'Clay', 'Iron Ore', 'Sandstone'][siloId % 4],
      level: 85 - siloId * 5, // Silo level percentage
      temperature: 25 + Math.random() * 5,
      particleSize: siloId < 2 ? 
        (latestMillData?.mill1ParticleSize || 12) : 
        (latestMillData?.mill2ParticleSize || 11.5),
      efficiency: siloId < 2 ? 
        (latestMillData?.mill1Efficiency || 78) : 
        (latestMillData?.mill2Efficiency || 79)
    };
  };
  
  const siloData = getSiloFeedData();
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // Animate material flow particles
    flowRefs.current.forEach((particle, i) => {
      if (particle) {
        const progress = (time * 0.5 + i * 0.2) % 1;
        const startPos = siloPosition;
        const endPos = millPosition;
        
        // Interpolate position along the flow path
        particle.position.x = startPos[0] + (endPos[0] - startPos[0]) * progress;
        particle.position.y = startPos[1] + (endPos[1] - startPos[1]) * progress + Math.sin(progress * Math.PI) * 2;
        particle.position.z = startPos[2] + (endPos[2] - startPos[2]) * progress;
        
        // Add some randomness to the flow
        particle.position.y += Math.sin(time * 2 + i) * 0.1;
        particle.position.x += Math.cos(time * 1.5 + i) * 0.05;
      }
    });
  });
  
  return (
    <group>
      {/* Material flow particles */}
      {Array.from({ length: 8 }).map((_, i) => (
        <Sphere
          key={`flow-particle-${siloId}-${i}`}
          ref={(ref) => { if (ref) flowRefs.current[i] = ref; }}
          args={[0.05, 6, 6]}
          position={siloPosition}
        >
          <meshBasicMaterial
            color={isWireframeMode ? MATERIAL_COLORS.wireframe.primary : "#8B4513"}
            transparent
            opacity={0.7}
            wireframe={isWireframeMode}
          />
        </Sphere>
      ))}
      
      {/* Flow line visualization */}
      <Line
        points={[siloPosition, millPosition]}
        color={isWireframeMode ? 0x00ccff : (isHovered ? 0x8B4513 : 0x654321)}
        lineWidth={isHovered ? 3 : 2}
        transparent
        opacity={isHovered ? 0.8 : 0.6}
      />
      
      {/* Hover indicator for silo */}
      {isHovered && (
        <Cylinder args={[2.7, 2.7, 0.2, 24]} position={[siloPosition[0], siloPosition[1] + 6, siloPosition[2]]}>
          <meshBasicMaterial color="#8B4513" transparent opacity={0.3} />
        </Cylinder>
      )}
      
      {/* Interactive indicator - subtle glow around silo */}
      <Cylinder args={[2.6, 2.6, 0.1, 24]} position={[siloPosition[0], siloPosition[1] + 6, siloPosition[2]]}>
        <meshBasicMaterial 
          color="#8B4513" 
          transparent 
          opacity={isHovered ? 0.2 : 0.05} 
        />
      </Cylinder>
      
      {/* Small pointer indicator for silo */}
      <Html position={[siloPosition[0], siloPosition[1] + 10, siloPosition[2]]} center>
        <div 
          style={{
            width: '8px',
            height: '8px',
            background: isHovered ? '#f39c12' : '#8B4513',
            borderRadius: '50%',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            opacity: 0.9,
            boxShadow: isHovered ? '0 0 12px rgba(243, 156, 18, 0.9)' : '0 0 8px rgba(139, 69, 19, 0.7)',
            zIndex: 1000,
            position: 'relative'
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
        </div>
      </Html>
      
      {/* Silo feed data display - Show on hover */}
      {isHovered && (
        <Html position={[siloPosition[0], siloPosition[1] + 2, siloPosition[2]]} center>
        <div style={{
          background: 'rgba(0, 0, 0, 0.9)',
          border: '1px solid #8B4513',
          borderRadius: '8px',
          padding: '8px',
          fontSize: '10px',
          color: '#ffffff',
          minWidth: '120px',
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}>
          <div style={{ fontWeight: 'bold', color: '#8B4513', marginBottom: '4px', fontSize: '11px' }}>
            Raw Silo #{siloId + 1}
          </div>
          <div style={{ marginBottom: '2px', color: '#D2B48C' }}>
            {siloData.materialType}
          </div>
          <div style={{ marginBottom: '2px' }}>
            Feed Rate: <span style={{ color: '#2ecc71' }}>{siloData.feedRate.toFixed(1)} t/h</span>
          </div>
          <div style={{ marginBottom: '2px' }}>
            Level: <span style={{ color: '#f39c12' }}>{Math.round(siloData.level)}%</span>
          </div>
          <div style={{ marginBottom: '2px' }}>
            Particle Size: <span style={{ color: '#9b59b6' }}>{siloData.particleSize.toFixed(1)} µm</span>
          </div>
          <div>
            Efficiency: <span style={{ color: '#e67e22' }}>{Math.round(siloData.efficiency)}%</span>
          </div>
        </div>
      </Html>
      )}
    </group>
  );
};

// Static Particle System (no animations)
const ParticleSystem: React.FC<{ position: [number, number, number]; count: number; isWireframeMode?: boolean }> = ({ position, count, isWireframeMode = false }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // More contained particle spread - positioned relative to equipment
      positions[i * 3] = position[0] + (Math.random() - 0.5) * 2;     // X spread around equipment
      positions[i * 3 + 1] = position[1] + Math.random() * 2;         // Y starting from equipment
      positions[i * 3 + 2] = position[2] + (Math.random() - 0.5) * 2; // Z spread around equipment

      // Velocities for upward movement
      velocities[i * 3] = (Math.random() - 0.5) * 0.02;     // X drift
      velocities[i * 3 + 1] = 0.02 + Math.random() * 0.03;  // Y upward
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02; // Z drift

      if (isWireframeMode) {
        // Blue holographic colors for wireframe mode
        colors[i * 3] = 0.0 + Math.random() * 0.3;     // Red
        colors[i * 3 + 1] = 0.4 + Math.random() * 0.4; // Green
        colors[i * 3 + 2] = 0.8 + Math.random() * 0.2; // Blue
      } else {
        // Brownish/orange colors for emissions in colorful mode
        colors[i * 3] = 0.8 + Math.random() * 0.2;     // Red
        colors[i * 3 + 1] = 0.3 + Math.random() * 0.4; // Green
        colors[i * 3 + 2] = 0.1 + Math.random() * 0.2; // Blue
      }
    }

    return { positions, colors, velocities };
  }, [count, position, isWireframeMode]);

  useFrame(() => {
    if (pointsRef.current) {
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < count; i++) {
        // Update positions based on velocities
        positions[i * 3] += particles.velocities[i * 3];
        positions[i * 3 + 1] += particles.velocities[i * 3 + 1];
        positions[i * 3 + 2] += particles.velocities[i * 3 + 2];

        // Reset particles that have moved too far up
        if (positions[i * 3 + 1] > position[1] + 15) {
          positions[i * 3] = position[0] + (Math.random() - 0.5) * 2;
          positions[i * 3 + 1] = position[1];
          positions[i * 3 + 2] = position[2] + (Math.random() - 0.5) * 2;
        }
      }
      
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={particles.colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial 
        size={isWireframeMode ? 0.15 : 0.1} 
        vertexColors 
        transparent 
        opacity={isWireframeMode ? 0.8 : 0.6}
      />
    </points>
  );
};



// Static Kiln Burner System (no animations)
const KilnBurner: React.FC<{ position: [number, number, number] }> = ({ position }) => {

  return (
    <group position={position}>
      {/* Burner Pipe */}
      <Cylinder args={[0.3, 0.3, 3, 8]} position={[0, 0, 0]}>
        <meshPhongMaterial color="#4A4A4A" />
      </Cylinder>

      {/* Burner Nozzle */}
      <Cylinder args={[0.4, 0.2, 1, 8]} position={[0, 1.5, 0]}>
        <meshPhongMaterial color="#3C3C3C" />
      </Cylinder>

      {/* Main Flame */}
      <Cylinder
        args={[0.8, 0.1, 2, 12]}
        position={[0, 2.5, 0]}
        rotation={[0, 0, Math.PI / 6]}
      >
        <meshBasicMaterial
          color={MATERIAL_COLORS.solid.hotMetal.body}
          transparent
          opacity={0.8}
        />
      </Cylinder>

      {/* Inner Flame Core */}
      <Cylinder args={[0.3, 0.05, 1.5, 8]} position={[0, 2.5, 0]}>
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.9}
        />
      </Cylinder>

      {/* Flame Particles */}
      {Array.from({ length: 12 }).map((_, i) => (
        <Sphere
          key={`flame-particle-${i}`}
          args={[0.1 + Math.random() * 0.1, 6, 6]}
          position={[
            (Math.random() - 0.5) * 0.8,
            2.5 + Math.random() * 1.5,
            (Math.random() - 0.5) * 0.8
          ]}
        >
          <meshBasicMaterial
            color={Math.random() > 0.5 ? MATERIAL_COLORS.solid.burningZone.body : MATERIAL_COLORS.solid.preheater.body}
            transparent
            opacity={0.6 + Math.random() * 0.4}
          />
        </Sphere>
      ))}
    </group>
  );
};

// Static Conveyor Particles (no animations)
const ConveyorParticles: React.FC<{ startPos: [number, number, number]; endPos: [number, number, number]; speed: number }> = ({ startPos, endPos, speed }) => {
  const particles = useMemo(() => {
    const count = 15;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Distribute particles along the conveyor
      const t = i / (count - 1);
      positions[i * 3] = startPos[0] + (endPos[0] - startPos[0]) * t;
      positions[i * 3 + 1] = startPos[1] + (endPos[1] - startPos[1]) * t + 0.1; // Above conveyor
      positions[i * 3 + 2] = startPos[2] + (endPos[2] - startPos[2]) * t;

      // Material colors (brownish for raw material, grayish for cement)
      colors[i * 3] = 0.4 + Math.random() * 0.4;
      colors[i * 3 + 1] = 0.3 + Math.random() * 0.4;
      colors[i * 3 + 2] = 0.2 + Math.random() * 0.3;
    }

    return { positions, colors };
  }, [startPos, endPos]);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={15}
          array={particles.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={15}
          array={particles.colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        vertexColors
        transparent
        opacity={0.8}
      />
    </points>
  );
};

// Cement Plant Components with clean UI
const CementPlant: React.FC<{ showDetails?: boolean; isWireframeMode: boolean }> = ({ showDetails = false, isWireframeMode }) => {
  const { sensorData } = useData();
  const meshRef = useRef<THREE.Group>(null);
  const kilnRef = useRef<THREE.Mesh>(null);
  const mill1Ref = useRef<THREE.Mesh>(null);
  const mill2Ref = useRef<THREE.Mesh>(null);
  
  // Load textures at component level
  const { concreteTexture } = useIndustrialTextures();

  // Visual mode toggle between wireframe and colorful solid

  return (
    <group ref={meshRef}>
      {/* JK Cement Crushing Unit - Scaled to Real Plant Dimensions */}
      <group position={[-35, 0, 12]}>
        {/* Enhanced Primary Crusher with Better Wireframes */}
        <Box args={[8, 6, 8]} position={[0, 3, 0]}>
          <meshStandardMaterial 
            color={isWireframeMode ? MATERIAL_COLORS.wireframe.primary : MATERIAL_COLORS.solid.steel.body}
            transparent 
            opacity={isWireframeMode ? 0.3 : 0.9}
            emissive={isWireframeMode ? MATERIAL_COLORS.wireframe.secondary : MATERIAL_COLORS.solid.steel.emissive}
            emissiveIntensity={isWireframeMode ? 0.5 : 0.05}
            wireframe={isWireframeMode}
            roughness={0.8}
            metalness={0.7}
          />
        </Box>
        {/* Crusher inlet - Larger hopper */}
        <Cylinder args={[2.5, 3, 4, 20]} position={[0, 7, 0]}>
          <meshStandardMaterial 
            color={isWireframeMode ? MATERIAL_COLORS.wireframe.primary : "#696969"}
            transparent 
            opacity={isWireframeMode ? 0.4 : 0.9}
            emissive={isWireframeMode ? MATERIAL_COLORS.wireframe.secondary : "#778899"}
            emissiveIntensity={isWireframeMode ? 0.4 : 0.1}
            wireframe={isWireframeMode}
            roughness={0.7}
            metalness={0.5}
          />
        </Cylinder>
        {/* Crusher outlet - Larger discharge */}
        <Cylinder args={[1.5, 1.5, 3, 20]} position={[0, -1, 0]}>
          <meshStandardMaterial 
            color={isWireframeMode ? MATERIAL_COLORS.wireframe.primary : "#34495e"}
            transparent 
            opacity={isWireframeMode ? 0.4 : 0.9}
            emissive={isWireframeMode ? MATERIAL_COLORS.wireframe.secondary : "#2c3e50"}
            emissiveIntensity={isWireframeMode ? 0.4 : 0.2}
            wireframe={isWireframeMode}
            roughness={0.6}
            metalness={0.6}
          />
        </Cylinder>
        
        {/* Enhanced Crusher Energy Field */}
        <Box args={[8.5, 6.5, 8.5]} position={[0, 3, 0]}>
          <meshPhongMaterial 
            color={isWireframeMode ? "#0066cc" : "#3498db"}
            transparent 
            opacity={isWireframeMode ? 0.15 : 0.3}
            emissive={isWireframeMode ? "#0066cc" : "#2980b9"}
            emissiveIntensity={isWireframeMode ? 0.4 : 0.6}
            wireframe={isWireframeMode}
          />
        </Box>
        
        {/* Enhanced Crusher Structural Lines */}
        {Array.from({ length: 4 }).map((_, i) => (
          <Line
            key={`crusher-vertical-${i}`}
            points={[
              [-4 + i * 2.67, 0, -4],
              [-4 + i * 2.67, 6, -4]
            ]}
            color={MATERIAL_COLORS.wireframe.primary}
            lineWidth={1.0}
          />
        ))}
        
        {Array.from({ length: 4 }).map((_, i) => (
          <Line
            key={`crusher-vertical-z-${i}`}
            points={[
              [-4, 0, -4 + i * 2.67],
              [-4, 6, -4 + i * 2.67]
            ]}
            color={MATERIAL_COLORS.wireframe.primary}
            lineWidth={1.0}
          />
        ))}
        {/* Crusher Label */}
        {showDetails && (
          <Html position={[0, 10, 0]} center>
            <div style={{
              background: 'rgba(44, 62, 80, 0.9)',
              color: 'white',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 'bold',
              border: '2px solid #2c3e50',
              pointerEvents: 'none',
              backdropFilter: 'blur(5px)'
            }}>
              🗜️ PRIMARY CRUSHER<br/>
              <span style={{fontSize: '10px', fontWeight: 'normal'}}>
                Limestone & Clay Processing
              </span>
            </div>
          </Html>
        )}
      </group>

      {/* JK Cement Raw Material Storage - Scaled to Real Plant with Distinct Colors */}
      {Array.from({ length: 7 }).map((_, i) => {
        const materialTypes = ['limestone', 'clay', 'ironOre', 'sandstone', 'flyAsh', 'gypsum', 'limestone'] as const;
        const materialType = materialTypes[i % materialTypes.length];
        
        return (
          <group key={`raw-silo-${i}`} position={[-35 + i * 6, 12, 12]}>
            <Cylinder args={[2.5, 2.5, 12, 24]} position={[0, 0, 0]}>
              <meshStandardMaterial 
                {...createEnhancedMaterial(isWireframeMode, materialType, concreteTexture)}
                opacity={isWireframeMode ? 0.3 : 0.8}
              />
            </Cylinder>
            {/* Silo cone */}
            <Cylinder args={[2.5, 0.5, 4, 24]} position={[0, -8, 0]}>
              <meshStandardMaterial 
                color={isWireframeMode ? MATERIAL_COLORS.wireframe.primary : "#B8B8B8"}
                transparent 
                opacity={isWireframeMode ? 0.4 : 0.9}
                emissive={isWireframeMode ? MATERIAL_COLORS.wireframe.secondary : "#D3D3D3"}
                emissiveIntensity={isWireframeMode ? 0.4 : 0.05}
                wireframe={isWireframeMode}
                roughness={0.7}
                metalness={0.3}
                map={concreteTexture}
              />
            </Cylinder>
            
            {/* Safety markings - Yellow warning stripes */}
            {!isWireframeMode && (
              <Cylinder args={[2.6, 2.6, 0.2, 32]} position={[0, 2, 0]}>
                <meshPhongMaterial 
                  color="#E0E0E0"
                  transparent 
                  opacity={0.8}
                />
              </Cylinder>
            )}
            
            {/* Enhanced Silo Energy Rings */}
            {Array.from({ length: 8 }).map((_, ringIndex) => (
              <Cylinder
                key={`silo-ring-${i}-${ringIndex}`}
                args={[2.7 + ringIndex * 0.08, 2.7 + ringIndex * 0.08, 0.05, 32]}
                position={[0, (ringIndex - 4) * 3, 0]}
              >
                <meshPhongMaterial 
                  color={isWireframeMode ? MATERIAL_COLORS.wireframe.primary : "#C0C0C0"}
                  transparent 
                  opacity={isWireframeMode ? 0.3 - ringIndex * 0.03 : 0.5 - ringIndex * 0.04}
                  emissive={isWireframeMode ? MATERIAL_COLORS.wireframe.primary : "#A0A0A0"}
                  emissiveIntensity={isWireframeMode ? 0.5 : 0.3}
                  wireframe={isWireframeMode}
                />
              </Cylinder>
            ))}
            
            {/* Enhanced Silo Structural Lines */}
            {Array.from({ length: 12 }).map((_, lineIndex) => (
              <Line
                key={`silo-structure-${i}-${lineIndex}`}
                points={[
                  [2.5 * Math.cos(lineIndex * Math.PI / 6), -6, 2.5 * Math.sin(lineIndex * Math.PI / 6)],
                  [2.5 * Math.cos(lineIndex * Math.PI / 6), 6, 2.5 * Math.sin(lineIndex * Math.PI / 6)]
                ]}
                color={MATERIAL_COLORS.wireframe.primary}
                lineWidth={0.6}
              />
            ))}
            {/* Silo Label */}
            {showDetails && (
              <Html position={[0, 14, 0]} center>
                <div style={{
                  background: 'rgba(149, 165, 166, 0.9)',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  border: '1px solid #7f8c8d',
                  pointerEvents: 'none',
                  backdropFilter: 'blur(5px)'
                }}>
                  📦 RAW SILO {i + 1}<br/>
                  <span style={{fontSize: '8px', fontWeight: 'normal'}}>
                    {i < 3 ? 'Limestone' : i < 5 ? 'Clay' : 'Iron Ore'}
                  </span>
                </div>
              </Html>
            )}
          </group>
        );
      })}
      
      {/* Enhanced Animated Conveyor System */}
      <AnimatedConveyor position={[-20, 2, 15]} isWireframeMode={isWireframeMode} />
      
      {/* Enhanced Conveyor Drive */}
      <Cylinder args={[0.8, 0.8, 0.5, 24]} position={[-30, 2, 15]}>
        <meshPhongMaterial 
          color={isWireframeMode ? MATERIAL_COLORS.wireframe.primary : "#808080"}
          transparent 
          opacity={isWireframeMode ? 0.4 : 0.9}
          emissive={isWireframeMode ? MATERIAL_COLORS.wireframe.primary : "#808080"}
          emissiveIntensity={isWireframeMode ? 0.7 : 0.2}
          wireframe={isWireframeMode}
        />
      </Cylinder>

      {/* Holographic Dark Blue Wireframe Raw Mill */}
      <group position={[-25, 0, 12]}>
        {/* Enhanced Raw Mill Shell with Better Wireframes */}
        <Cylinder args={[4, 4, 16, 40]} position={[0, 8, 0]}>
          <meshPhongMaterial 
            color={isWireframeMode ? MATERIAL_COLORS.wireframe.accent : "#808080"}
            transparent 
            opacity={isWireframeMode ? 0.4 : 0.9}
            emissive={isWireframeMode ? MATERIAL_COLORS.wireframe.accent : "#808080"}
            emissiveIntensity={isWireframeMode ? 1.3 : 0.2}
            wireframe={isWireframeMode}
            shininess={isWireframeMode ? 0 : 35}
          />
        </Cylinder>
        
        {/* Enhanced Holographic Mill Core */}
        {isWireframeMode && (
          <Cylinder args={[3.7, 3.7, 17, 40]} position={[0, 8, 0]}>
            <meshPhongMaterial 
              color="#3498db"
              transparent 
              opacity={0.2}
              emissive="#0099ff"
              emissiveIntensity={0.7}
              wireframe={false}
            />
          </Cylinder>
        )}
        {/* Raw Mill Drive - Larger scale */}
        <Box args={[3, 3, 4]} position={[5, 8, 0]}>
          <meshPhongMaterial 
            color={isWireframeMode ? MATERIAL_COLORS.wireframe.primary : "#BDBDBD"}
            transparent 
            opacity={isWireframeMode ? 0.4 : 0.8}
            emissive={isWireframeMode ? "#0066cc" : "#95a5a6"}
            emissiveIntensity={isWireframeMode ? 0.7 : 0.3}
            wireframe={isWireframeMode}
          />
        </Box>
        
        {/* Enhanced Mill Energy Field */}
        <Cylinder args={[4.5, 4.5, 16, 40]} position={[0, 8, 0]}>
          <meshPhongMaterial 
            color={isWireframeMode ? MATERIAL_COLORS.wireframe.primary : "#BDBDBD"}
            transparent 
            opacity={isWireframeMode ? 0.15 : 0.3}
            emissive={isWireframeMode ? "#0066cc" : "#95a5a6"}
            emissiveIntensity={isWireframeMode ? 0.4 : 0.2}
            wireframe={isWireframeMode}
          />
        </Cylinder>
        
        {/* Enhanced Raw Mill Structural Lines */}
        {Array.from({ length: 12 }).map((_, i) => (
          <Line
            key={`raw-mill-structure-${i}`}
            points={[
              [4 * Math.cos(i * Math.PI / 6), 0, 4 * Math.sin(i * Math.PI / 6)],
              [4 * Math.cos(i * Math.PI / 6), 16, 4 * Math.sin(i * Math.PI / 6)]
            ]}
            color={isWireframeMode ? MATERIAL_COLORS.wireframe.primary : "#959595"}
            lineWidth={isWireframeMode ? 0.8 : 0.5}
          />
        ))}
        {/* Raw Mill Label */}
        {showDetails && (
          <Html position={[0, 20, 0]} center>
            <div style={{
              background: 'rgba(52, 152, 219, 0.9)',
              color: 'white',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 'bold',
              border: '2px solid #2980b9',
              pointerEvents: 'none',
              backdropFilter: 'blur(5px)'
            }}>
              ⚙️ RAW MILL<br/>
              <span style={{fontSize: '10px', fontWeight: 'normal'}}>
                Raw Material Grinding
              </span>
            </div>
          </Html>
        )}
      </group>

      {/* Feeding System to Preheater - Removed as it was positioned above raw silos */}
      

      


            {/* Enhanced Holographic Wireframe Preheater Tower */}
      <Cylinder
        args={[4.0, 4.0, 30, 32]}
        position={[-6, 30, 0]}
      >
        <meshPhongMaterial
          color={isWireframeMode ? MATERIAL_COLORS.wireframe.accent : MATERIAL_COLORS.solid.refractory.body}
          transparent
          opacity={isWireframeMode ? 0.4 : 0.95}
          emissive={isWireframeMode ? "#0066cc" : "#654321"}
          emissiveIntensity={isWireframeMode ? 1.5 : 0.3}
          wireframe={isWireframeMode}
          shininess={isWireframeMode ? 0 : 30}
        />
      </Cylinder>
      
      {/* Enhanced Holographic Tower Core */}
      {isWireframeMode && (
        <Cylinder
          args={[3.5, 3.5, 32, 32]}
          position={[-6, 30, 0]}
        >
          <meshPhongMaterial
            color="#3498db"
            transparent
            opacity={0.2}
            emissive="#0099ff"
            emissiveIntensity={0.8}
            wireframe={false}
          />
        </Cylinder>
      )}
      

      

      



      




      {/* Preheater Tower Label */}
      {showDetails && (
        <Html position={[-6, 25, 0]} center>
          <div style={{
            background: 'rgba(52, 73, 94, 0.95)',
            color: 'white',
            padding: '6px 10px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 'bold',
            border: '2px solid #2c3e50',
            pointerEvents: 'none',
            backdropFilter: 'blur(5px)',
            maxWidth: '150px',
            textAlign: 'center'
          }}>
            🏗️ PREHEATER TOWER<br/>
            <span style={{fontSize: '9px', fontWeight: 'normal'}}>
              Waste Heat Recovery
            </span>
          </div>
        </Html>
      )}

      {/* Enhanced Holographic Wireframe Waste Heat Recovery System */}
      <group position={[-6, 31, 0]}>
        {/* Enhanced Chimney/Stack for preheater exhaust */}
        <Cylinder args={[1, 1, 12, 24]} position={[0, 0, 0]}>
          <meshPhongMaterial 
            color={isWireframeMode ? MATERIAL_COLORS.wireframe.primary : "#959595"}
            transparent 
            opacity={isWireframeMode ? 0.4 : 0.8}
            emissive={isWireframeMode ? "#0066cc" : "#7f8c8d"}
            emissiveIntensity={isWireframeMode ? 0.8 : 0.4}
            wireframe={isWireframeMode}
          />
        </Cylinder>
        {/* Enhanced Waste Heat Recovery Unit */}
        <Box args={[3, 2, 2]} position={[3, 0, 0]}>
          <meshPhongMaterial 
            color={isWireframeMode ? "#0066cc" : "#7f8c8d"}
            transparent 
            opacity={isWireframeMode ? 0.3 : 0.8}
            emissive={isWireframeMode ? "#0066cc" : "#6c7b7d"}
            emissiveIntensity={isWireframeMode ? 1.0 : 0.4}
            wireframe={isWireframeMode}
          />
        </Box>
        {/* Enhanced Heat Recovery Pipes */}
        <Cylinder args={[0.2, 0.2, 3, 16]} position={[1.5, 0, 0]} rotation={[0, 0, Math.PI/2]}>
          <meshPhongMaterial 
            color={isWireframeMode ? MATERIAL_COLORS.wireframe.primary : "#BDBDBD"}
            transparent 
            opacity={isWireframeMode ? 0.4 : 0.8}
            emissive={isWireframeMode ? "#0066cc" : "#95a5a6"}
            emissiveIntensity={isWireframeMode ? 0.7 : 0.3}
            wireframe={isWireframeMode}
          />
        </Cylinder>
        
        {/* Enhanced Waste Heat Recovery Energy Fields */}
        <Cylinder args={[1.2, 1.2, 12, 24]} position={[0, 0, 0]}>
          <meshPhongMaterial 
            color={isWireframeMode ? MATERIAL_COLORS.wireframe.primary : "#BDBDBD"}
            transparent 
            opacity={isWireframeMode ? 0.2 : 0.4}
            emissive={isWireframeMode ? "#0066cc" : "#95a5a6"}
            emissiveIntensity={isWireframeMode ? 0.4 : 0.2}
            wireframe={isWireframeMode}
          />
        </Cylinder>
        
        <Box args={[3.5, 2.5, 2.5]} position={[3, 0, 0]}>
          <meshPhongMaterial 
            color={isWireframeMode ? MATERIAL_COLORS.wireframe.primary : "#959595"}
            transparent 
            opacity={isWireframeMode ? 0.15 : 0.3}
            emissive={isWireframeMode ? "#0066cc" : "#7f8c8d"}
            emissiveIntensity={isWireframeMode ? 0.3 : 0.2}
            wireframe={isWireframeMode}
          />
        </Box>
        {/* Waste Heat Recovery Label */}
        {showDetails && (
          <Html position={[3, 3, 0]} center>
            <div style={{
              background: 'rgba(230, 126, 34, 0.9)',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '10px',
              fontWeight: 'bold',
              border: '1px solid #e67e22',
              pointerEvents: 'none',
              backdropFilter: 'blur(5px)'
            }}>
              🔥 WASTE HEAT RECOVERY<br/>
              <span style={{fontSize: '8px', fontWeight: 'normal'}}>
                10MW Capacity
              </span>
            </div>
          </Html>
        )}
      </group>

      {/* Stack cap */}
      <Cylinder args={[1.2, 1.2, 0.5, 12]} position={[-6, 32, 0]}>
        <meshPhongMaterial color="#1a1a1a" />
      </Cylinder>

      {/* Animated Stack Exhaust System */}
      <group position={[-6, 32, 0]}>
        {/* Main exhaust plume */}
        <Cylinder args={[1.8, 0.3, 4, 12]} position={[0, 2, 0]}>
          <meshBasicMaterial
            color="#f0f0f0"
            transparent
            opacity={0.6}
          />
        </Cylinder>

        {/* Secondary exhaust rings */}
        {Array.from({ length: 3 }).map((_, i) => (
          <Cylinder
            key={`exhaust-ring-${i}`}
            args={[1.2 + i * 0.3, 0.8 + i * 0.4, 0.05, 16]}
            position={[0, 1 + i * 0.8, 0]}
          >
            <meshBasicMaterial
              color="#ffffff"
              transparent
              opacity={0.4 - i * 0.1}
            />
          </Cylinder>
        ))}

        {/* Exhaust particles */}
        {Array.from({ length: 15 }).map((_, i) => (
          <Sphere
            key={`exhaust-particle-${i}`}
            args={[0.05 + Math.random() * 0.08, 6, 6]}
            position={[
              (Math.random() - 0.5) * 2,
              1 + Math.random() * 3,
              (Math.random() - 0.5) * 0.5
            ]}
          >
            <meshBasicMaterial
              color="#e0e0e0"
              transparent
              opacity={0.3 + Math.random() * 0.4}
            />
          </Sphere>
        ))}
      </group>

      {/* Enhanced Holographic Wireframe Rotary Kiln - Properly Scaled */}
      <Cylinder
        ref={kilnRef}
        args={[3.0, 3.0, 25, 24]} // Reduced polygon count for better performance
        position={[-6, 6, 0]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <meshStandardMaterial
          color={isWireframeMode ? MATERIAL_COLORS.wireframe.primary : "#8C8C8C"}
          transparent
          opacity={isWireframeMode ? 0.4 : 0.9}
          emissive={isWireframeMode ? MATERIAL_COLORS.wireframe.secondary : "#696969"}
          emissiveIntensity={isWireframeMode ? 0.8 : 0.1}
          wireframe={isWireframeMode}
          roughness={0.8}
          metalness={0.6}
        />
      </Cylinder>
      
      {/* Enhanced Kiln Core with Better Wireframes */}
      <Cylinder
        args={[2.8, 2.8, 25, 40]}
        position={[-6, 6, 0]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <meshPhongMaterial
          color={isWireframeMode ? "#00ffff" : "#CD853F"}
          transparent
          opacity={isWireframeMode ? 0.3 : 0.9}
          emissive={isWireframeMode ? "#0099ff" : "#D2691E"}
          emissiveIntensity={isWireframeMode ? 0.8 : 0.2}
          wireframe={false}
        />
      </Cylinder>
      

      


      
      {/* Enhanced Holographic Wireframe Clinker Cooler */}
      <Box args={[8, 3, 6]} position={[6, 2.5, 0]}>
        <meshPhongMaterial 
          color={isWireframeMode ? "#0066cc" : "#20B2AA"}
          transparent 
          opacity={isWireframeMode ? 0.3 : 0.9}
          emissive={isWireframeMode ? "#0066cc" : "#48D1CC"}
          emissiveIntensity={isWireframeMode ? 1.0 : 0.2}
          wireframe={isWireframeMode}
          shininess={isWireframeMode ? 0 : 40}
        />
      </Box>
      
      {/* Enhanced Cooler Drive */}
      <Box args={[2, 2, 2]} position={[10, 2.5, 0]}>
                  <meshPhongMaterial 
            color={isWireframeMode ? "#0066cc" : "#DC143C"}
            transparent 
            opacity={isWireframeMode ? 0.4 : 0.9}
            emissive={isWireframeMode ? "#0066cc" : "#B22222"}
            emissiveIntensity={isWireframeMode ? 0.7 : 0.2}
            wireframe={isWireframeMode}
            shininess={isWireframeMode ? 0 : 30}
          />
      </Box>
      
      {/* Enhanced Cooler Energy Field */}
      <Box args={[8.5, 3.5, 6.5]} position={[6, 2.5, 0]}>
        <meshPhongMaterial 
          color={isWireframeMode ? MATERIAL_COLORS.wireframe.primary : "#BDBDBD"}
          transparent 
          opacity={isWireframeMode ? 0.15 : 0.3}
          emissive={isWireframeMode ? "#0066cc" : "#95a5a6"}
          emissiveIntensity={isWireframeMode ? 0.4 : 0.2}
          wireframe={isWireframeMode}
        />
      </Box>
      
      {/* Enhanced Cooler Structural Lines */}
      {Array.from({ length: 5 }).map((_, i) => (
        <Line
          key={`cooler-vertical-${i}`}
          points={[
            [2 + i * 1.5, 1, -3],
            [2 + i * 1.5, 4, -3]
          ]}
          color={isWireframeMode ? MATERIAL_COLORS.wireframe.primary : "#959595"}
          lineWidth={isWireframeMode ? 1.0 : 0.6}
        />
      ))}
      
      {Array.from({ length: 4 }).map((_, i) => (
        <Line
          key={`cooler-horizontal-${i}`}
          points={[
            [2, 1 + i * 0.67, -3],
            [10, 1 + i * 0.67, -3]
          ]}
          color={isWireframeMode ? MATERIAL_COLORS.wireframe.primary : "#959595"}
          lineWidth={isWireframeMode ? 1.0 : 0.6}
        />
      ))}
      
      {/* Cooler Label */}
      {showDetails && (
        <Html position={[6, 6, 0]} center>
          <div style={{
            background: 'rgba(52, 152, 219, 0.9)',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 'bold',
            border: '2px solid #2980b9',
            pointerEvents: 'none',
            backdropFilter: 'blur(5px)'
          }}>
            ❄️ CLINKER COOLER<br/>
            <span style={{fontSize: '10px', fontWeight: 'normal'}}>
              Heat Recovery
            </span>
          </div>
        </Html>
      )}



      {/* Enhanced Holographic Wireframe Kiln Slope Indicator */}
      <Line
        points={[
          [-18.5, 8.5, 0],  // Inlet higher point (adjusted for repositioned kiln)
          [6.5, 6.8, 0]     // Outlet lower point (adjusted for repositioned kiln)
        ]}
        color={MATERIAL_COLORS.wireframe.primary}
        lineWidth={2}
      />
      
      {/* Enhanced Slope Measurement Points */}
      <Sphere args={[0.15, 8, 8]} position={[-18.5, 8.5, 0]}>
        <meshPhongMaterial 
          color={MATERIAL_COLORS.wireframe.primary} 
          transparent 
          opacity={0.6}
          emissive="#0066cc"
          emissiveIntensity={1.0}
        />
      </Sphere>
      <Sphere args={[0.15, 8, 8]} position={[6.5, 6.8, 0]}>
        <meshPhongMaterial 
          color={MATERIAL_COLORS.wireframe.primary} 
          transparent 
          opacity={0.6}
          emissive="#0066cc"
          emissiveIntensity={1.0}
        />
      </Sphere>
      
      {/* Enhanced Slope Measurement Lines */}
      {Array.from({ length: 6 }).map((_, i) => (
        <Line
          key={`slope-measure-${i}`}
          points={[
            [-18.5 + i * 4.17, 8.5 - i * 0.28, 0],
            [-18.5 + i * 4.17, 8.5 - i * 0.28 + 0.3, 0]
          ]}
          color={MATERIAL_COLORS.wireframe.primary}
          lineWidth={0.8}
        />
      ))}

      {/* Enhanced Kiln Label */}
      {showDetails && (
        <Html position={[-6, 10, 0]} center>
          <div style={{
            background: 'rgba(231, 76, 60, 0.95)',
            color: 'white',
            padding: '8px 14px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 'bold',
            border: '3px solid #c0392b',
            pointerEvents: 'none',
            backdropFilter: 'blur(5px)',
            maxWidth: '180px',
            textAlign: 'center'
          }}>
            🔥 ROTARY KILN<br/>
            <span style={{fontSize: '11px', fontWeight: 'normal'}}>
              1450°C Calcination Zone
            </span>
          </div>
        </Html>
      )}

      {/* Chimney Label */}
      {showDetails && (
        <Html position={[-6, 40, 0]} center>
          <div style={{
            background: 'rgba(44, 62, 80, 0.9)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '10px',
            fontWeight: 'bold',
            border: '1px solid #2c3e50',
            pointerEvents: 'none',
            backdropFilter: 'blur(5px)'
          }}>
            🏭 EXHAUST STACK<br/>
            <span style={{fontSize: '8px', fontWeight: 'normal'}}>
              Clean Gas to Atmosphere
            </span>
          </div>
        </Html>
      )}



      {/* Enhanced Holographic Wireframe Kiln Inlet (feed end) */}
      <Cylinder
        args={[1.6, 1.8, 2, 32]}
        position={[-13.5, 4, 0]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <meshPhongMaterial 
          color={MATERIAL_COLORS.wireframe.primary} 
          transparent 
          opacity={0.4}
          emissive="#0066cc"
          emissiveIntensity={0.8}
          wireframe={true}
        />
      </Cylinder>

      {/* Enhanced Kiln Burner System */}
      <KilnBurner position={[-15.5, 4, 0]} />

      {/* Enhanced Holographic Wireframe Kiln Outlet (discharge end) */}
      <Cylinder
        args={[1.6, 1.8, 2, 32]}
        position={[1.5, 4, 0]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <meshPhongMaterial 
          color={MATERIAL_COLORS.wireframe.primary} 
          transparent 
          opacity={0.4}
          emissive="#0066cc"
          emissiveIntensity={0.8}
          wireframe={true}
        />
      </Cylinder>
      
      {/* Enhanced Kiln Inlet/Outlet Energy Fields */}
      <Cylinder args={[1.8, 2.0, 2, 32]} position={[-13.5, 4, 0]} rotation={[0, 0, Math.PI / 2]}>
        <meshPhongMaterial 
          color={MATERIAL_COLORS.wireframe.primary} 
          transparent 
          opacity={0.2}
          emissive="#0066cc"
          emissiveIntensity={0.4}
          wireframe={true}
        />
      </Cylinder>
      
      <Cylinder args={[1.8, 2.0, 2, 32]} position={[1.5, 4, 0]} rotation={[0, 0, Math.PI / 2]}>
        <meshPhongMaterial 
          color={MATERIAL_COLORS.wireframe.primary} 
          transparent 
          opacity={0.2}
          emissive="#0066cc"
          emissiveIntensity={0.4}
          wireframe={true}
        />
      </Cylinder>

      {/* Clinker Cooler Label */}
      {showDetails && (
        <Html position={[6, 6, 0]} center>
          <div style={{
            background: 'rgba(230, 126, 34, 0.9)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '10px',
            fontWeight: 'bold',
            border: '1px solid #e67e22',
            pointerEvents: 'none',
            backdropFilter: 'blur(5px)'
          }}>
            ❄️ CLINKER COOLER<br/>
            <span style={{fontSize: '8px', fontWeight: 'normal'}}>
              Rapid Cooling
            </span>
          </div>
        </Html>
      )}

      {/* Enhanced Holographic Wireframe Clinker Cooler System */}
      <group position={[3, 0, 0]}>
        {/* Enhanced Cooler housing */}
        <Box args={[8, 3, 4]} position={[0, 1.5, 0]}>
          <meshPhongMaterial 
            color={MATERIAL_COLORS.wireframe.primary} 
            transparent 
            opacity={0.3}
            emissive="#0066cc"
            emissiveIntensity={1.0}
            wireframe={true}
          />
      </Box>

        {/* Enhanced Cooler grates */}
        {Array.from({ length: 6 }).map((_, i) => (
          <Box
            key={`grate-${i}`}
            args={[0.8, 0.1, 3.5]}
            position={[-2.5 + i * 1.2, 0.5, 0]}
          >
            <meshPhongMaterial 
              color={MATERIAL_COLORS.wireframe.primary} 
              transparent 
              opacity={0.4}
              emissive="#0066cc"
              emissiveIntensity={0.7}
              wireframe={true}
            />
          </Box>
        ))}

        {/* Enhanced Cooling fans */}
        {Array.from({ length: 4 }).map((_, i) => (
          <group key={`fan-${i}`} position={[-2 + i * 2, 3.5, 1.5]}>
            {/* Enhanced Fan housing */}
            <Cylinder args={[0.4, 0.4, 0.3, 16]} position={[0, 0, 0]}>
              <meshPhongMaterial 
                color={MATERIAL_COLORS.wireframe.primary} 
                transparent 
                opacity={0.4}
                emissive="#0066cc"
                emissiveIntensity={0.7}
                wireframe={true}
              />
            </Cylinder>

            {/* Enhanced Fan blades */}
            {Array.from({ length: 4 }).map((_, j) => (
              <Box
                key={`blade-${j}`}
                args={[0.05, 0.6, 0.1]}
                position={[0, 0, 0]}
                rotation={[0, 0, j * Math.PI / 2]}
              >
                <meshPhongMaterial 
                  color={MATERIAL_COLORS.wireframe.primary} 
                  transparent 
                  opacity={0.5}
                  emissive="#0066cc"
                  emissiveIntensity={0.6}
                  wireframe={true}
                />
              </Box>
            ))}
    </group>
        ))}

        {/* Enhanced Air ducts */}
        <Box args={[8, 0.5, 0.5]} position={[0, 0, -2]}>
          <meshPhongMaterial 
            color={MATERIAL_COLORS.wireframe.primary} 
            transparent 
            opacity={0.4}
            emissive="#0066cc"
            emissiveIntensity={0.7}
            wireframe={true}
          />
        </Box>

        {/* Enhanced Cooler discharge conveyor */}
        <Box args={[6, 0.2, 1]} position={[0, 0, 0]}>
          <meshPhongMaterial 
            color={MATERIAL_COLORS.wireframe.primary} 
            transparent 
            opacity={0.4}
            emissive="#0066cc"
            emissiveIntensity={0.7}
            wireframe={true}
          />
        </Box>
        
        {/* Enhanced Cooler Energy Field */}
        <Box args={[8.5, 3.5, 4.5]} position={[0, 1.5, 0]}>
          <meshPhongMaterial 
            color={MATERIAL_COLORS.wireframe.primary} 
            transparent 
            opacity={0.15}
            emissive="#0066cc"
            emissiveIntensity={0.4}
            wireframe={true}
          />
        </Box>
      </group>

      {/* Enhanced Holographic Wireframe Kiln Supports */}
      {Array.from({ length: 4 }).map((_, i) => (
        <Box
          key={`support-${i}`}
          args={[0.8, 0.8, 2]}
          position={[-6 + (i - 1.5) * 3.5, 3, 0]}
        >
          <meshPhongMaterial 
            color={MATERIAL_COLORS.wireframe.primary} 
            transparent 
            opacity={0.4}
            emissive="#0066cc"
            emissiveIntensity={0.7}
            wireframe={true}
          />
        </Box>
      ))}

      {/* Enhanced Kiln support rings and tires */}
      {Array.from({ length: 3 }).map((_, i) => (
        <group key={`support-system-${i}`}>
          {/* Enhanced Support Tire (ring around kiln) */}
          <Cylinder
            args={[1.6, 1.6, 0.3, 32]}
            position={[-6 + (i - 1) * 5, 4, 0]}
            rotation={[0, 0, Math.PI / 2]}
          >
            <meshPhongMaterial 
              color={MATERIAL_COLORS.wireframe.primary} 
              transparent 
              opacity={0.4}
              emissive="#0066cc"
              emissiveIntensity={0.7}
              wireframe={true}
            />
          </Cylinder>

          {/* Enhanced Support rollers */}
          {Array.from({ length: 6 }).map((_, j) => (
            <Cylinder
              key={`roller-${i}-${j}`}
              args={[0.2, 0.2, 1, 16]}
              position={[
                -6 + (i - 1) * 5 + Math.cos(j * Math.PI / 3) * 2,
                3.5,
                Math.sin(j * Math.PI / 3) * 2
              ]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <meshPhongMaterial 
                color={MATERIAL_COLORS.wireframe.primary} 
                transparent 
                opacity={0.5}
                emissive="#0066cc"
                emissiveIntensity={0.6}
                wireframe={true}
              />
            </Cylinder>
          ))}
        </group>
      ))}

      {/* Enhanced Kiln drive mechanism */}
      <Box
        args={[2, 1, 1]}
        position={[-6 - 8, 4, 0]}
      >
        <meshPhongMaterial 
          color={MATERIAL_COLORS.wireframe.primary} 
          transparent 
          opacity={0.4}
          emissive="#0066cc"
          emissiveIntensity={0.7}
          wireframe={true}
        />
      </Box>

      {/* Enhanced Drive pinion gear */}
      <Cylinder
        args={[0.5, 0.5, 0.2, 32]}
        position={[-6 - 8, 4, 1.6]}
      >
        <meshPhongMaterial 
          color={MATERIAL_COLORS.wireframe.primary} 
          transparent 
          opacity={0.4}
          emissive="#0066cc"
          emissiveIntensity={0.7}
          wireframe={true}
        />
      </Cylinder>

      {/* Spectacular Heat Effects with data-driven intensity - Properly positioned */}
      <HeatEffect position={[-6, 6, 0]} color={MATERIAL_COLORS.solid.burningZone.body} intensity={sensorData.burning?.value || 0} isWireframeMode={isWireframeMode} />
      <HeatEffect position={[-6, 25, 0]} color={MATERIAL_COLORS.solid.preheater.body} intensity={sensorData.temp1?.value || 0} isWireframeMode={isWireframeMode} />
      <HeatEffect position={[-6, 20, 0]} color={MATERIAL_COLORS.solid.hotMetal.body} intensity={sensorData.temp2?.value || 0} isWireframeMode={isWireframeMode} />

      {/* Internal Kiln Material Animation - Spectacular! */}
      <KilnInternalMaterial position={[-6, 4, 0]} isWireframeMode={isWireframeMode} />

      {/* Spectacular Particle Emissions - Properly positioned */}
      <ParticleSystem position={[-6, 35, 0]} count={50} isWireframeMode={isWireframeMode} /> {/* Stack emissions */}
      <ParticleSystem position={[-6, 37, 0]} count={30} isWireframeMode={isWireframeMode} /> {/* Chimney emissions */}
      <ParticleSystem position={[20, 8, -8]} count={25} isWireframeMode={isWireframeMode} />  {/* Mill 1 dust */}
      <ParticleSystem position={[20, 8, 8]} count={25} isWireframeMode={isWireframeMode} />   {/* Mill 2 dust */}

      {/* Enhanced Holographic Wireframe Conveyor Belts for Material Transport */}
      {/* Enhanced Kiln inlet conveyor */}
      <Box args={[8, 0.2, 1]} position={[-9.5, 3, 0]}>
        <meshPhongMaterial 
          color={MATERIAL_COLORS.wireframe.primary} 
          transparent 
          opacity={0.4}
          emissive="#0066cc"
          emissiveIntensity={0.7}
          wireframe={true}
        />
      </Box>

      {/* Enhanced Kiln outlet conveyor to mills */}
      <Box args={[6, 0.2, 1]} position={[4.5, 3, 0]}>
        <meshPhongMaterial 
          color={MATERIAL_COLORS.wireframe.primary} 
          transparent 
          opacity={0.4}
          emissive="#0066cc"
          emissiveIntensity={0.7}
          wireframe={true}
        />
      </Box>

      {/* Enhanced Mill discharge conveyors */}
      <Box args={[4, 0.2, 0.8]} position={[12, 1, -3]}>
        <meshPhongMaterial 
          color={MATERIAL_COLORS.wireframe.primary} 
          transparent 
          opacity={0.4}
          emissive="#0066cc"
          emissiveIntensity={0.7}
          wireframe={true}
        />
      </Box>

      <Box args={[4, 0.2, 0.8]} position={[12, 1, 3]}>
        <meshPhongMaterial 
          color={MATERIAL_COLORS.wireframe.primary} 
          transparent 
          opacity={0.4}
          emissive="#0066cc"
          emissiveIntensity={0.7}
          wireframe={true}
        />
      </Box>

      {/* Enhanced Silo feed conveyors */}
      <Box args={[2, 0.2, 0.6]} position={[16, 3, -4.5]}>
        <meshPhongMaterial 
          color={MATERIAL_COLORS.wireframe.primary} 
          transparent 
          opacity={0.4}
          emissive="#0066cc"
          emissiveIntensity={0.7}
          wireframe={true}
        />
      </Box>

      <Box args={[2, 0.2, 0.6]} position={[16, 3, 4.5]}>
        <meshPhongMaterial 
          color={MATERIAL_COLORS.wireframe.primary} 
          transparent 
          opacity={0.4}
          emissive="#0066cc"
          emissiveIntensity={0.7}
          wireframe={true}
        />
      </Box>
      
      {/* Enhanced Conveyor Energy Fields */}
      <Box args={[8.2, 0.4, 1.2]} position={[-9.5, 3, 0]}>
        <meshPhongMaterial 
          color={MATERIAL_COLORS.wireframe.primary} 
          transparent 
          opacity={0.2}
          emissive="#0066cc"
          emissiveIntensity={0.4}
          wireframe={true}
        />
      </Box>
      
      <Box args={[6.2, 0.4, 1.2]} position={[4.5, 3, 0]}>
        <meshPhongMaterial 
          color={MATERIAL_COLORS.wireframe.primary} 
          transparent 
          opacity={0.2}
          emissive="#0066cc"
          emissiveIntensity={0.4}
          wireframe={true}
        />
      </Box>

      {/* Animated conveyor particles */}
      <ConveyorParticles startPos={[-13.5, 1, 0]} endPos={[-5.5, 1, 0]} speed={2} />
      <ConveyorParticles startPos={[1.5, 1, 0]} endPos={[7.5, 1, 0]} speed={1.5} />
      <ConveyorParticles startPos={[11, 1, -3]} endPos={[15, 1, -3]} speed={1} />
      <ConveyorParticles startPos={[11, 1, 3]} endPos={[15, 1, 3]} speed={1} />

      {/* Holographic Dark Blue Wireframe Grinding Mills */}
      {/* Mill 1 - Complete milling system */}
      <group position={[20, 4, -8]}>
        {/* Enhanced Mill shell with Better Wireframes */}
        <Cylinder
          ref={mill1Ref}
          args={[2.5, 2.5, 10, 40]}
          position={[0, 0, 0]}
        >
          <meshPhongMaterial 
            color={isWireframeMode ? "#0066cc" : "#A9A9A9"}
            transparent 
            opacity={isWireframeMode ? 0.3 : 0.9}
            emissive={isWireframeMode ? "#0066cc" : "#808080"}
            emissiveIntensity={isWireframeMode ? 1.0 : 0.1}
            wireframe={isWireframeMode}
          />
        </Cylinder>
        
        {/* Enhanced Mill Energy Field */}
        <Cylinder
          args={[3.0, 3.0, 10, 40]}
          position={[0, 0, 0]}
        >
          <meshPhongMaterial 
            color={isWireframeMode ? "#0066cc" : "#3498db"}
            transparent 
            opacity={isWireframeMode ? 0.15 : 0.3}
            emissive={isWireframeMode ? "#0066cc" : "#2980b9"}
            emissiveIntensity={isWireframeMode ? 0.5 : 0.6}
            wireframe={isWireframeMode}
          />
        </Cylinder>
        
        {/* Enhanced Mill Structural Lines */}
        {Array.from({ length: 8 }).map((_, i) => (
          <Line
            key={`mill1-structure-${i}`}
            points={[
              [2.5 * Math.cos(i * Math.PI / 4), -5, 2.5 * Math.sin(i * Math.PI / 4)],
              [2.5 * Math.cos(i * Math.PI / 4), 5, 2.5 * Math.sin(i * Math.PI / 4)]
            ]}
            color={MATERIAL_COLORS.wireframe.primary}
            lineWidth={1.0}
          />
        ))}
        
        {/* Holographic Mill Data Streams */}
        <group position={[0, 0, 0]}>
          {Array.from({ length: 15 }).map((_, i) => (
            <Sphere
              key={`mill1-data-${i}`}
              args={[0.08, 8, 8]}
              position={[
                (Math.random() - 0.5) * 5,
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 5
              ]}
            >
              <meshPhongMaterial
                color={MATERIAL_COLORS.wireframe.primary}
                transparent
                opacity={0.6}
                emissive="#0066cc"
                emissiveIntensity={1.0}
              />
            </Sphere>
          ))}
        </group>
        
        {/* Mill 1 Label */}
        {showDetails && (
          <Html position={[0, 12, 0]} center>
            <div style={{
              background: 'rgba(52, 152, 219, 0.9)',
              color: 'white',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 'bold',
              border: '2px solid #2980b9',
              pointerEvents: 'none',
              backdropFilter: 'blur(5px)'
            }}>
              ⚙️ CEMENT MILL #1<br/>
              <span style={{fontSize: '10px', fontWeight: 'normal'}}>
                Final Grinding
              </span>
            </div>
          </Html>
        )}

        {/* Mill liners (internal protection) */}
        <Cylinder args={[1.15, 1.15, 5, 16]} position={[0, 0, 0]}>
          <meshPhongMaterial color="#5d6d7e" transparent opacity={0.7} />
        </Cylinder>

        {/* Mill diaphragms (compartment separators) */}
        <Cylinder args={[1.1, 1.1, 0.1, 16]} position={[0, 1, 0]}>
          <meshPhongMaterial color="#4A4A4A" />
        </Cylinder>
        <Cylinder args={[1.1, 1.1, 0.1, 16]} position={[0, -1, 0]}>
          <meshPhongMaterial color="#4A4A4A" />
        </Cylinder>

        {/* Grinding media inside mill (animated) */}
        {Array.from({ length: 12 }).map((_, i) => (
          <Sphere
            key={`media1-${i}`}
            args={[0.15, 8, 8]}
            position={[
              Math.cos(i * Math.PI / 6) * 0.9,
              Math.sin(i * Math.PI / 6) * 0.9,
              (Math.random() - 0.5) * 0.4
            ]}
          >
            <meshPhongMaterial color="#4A4A4A" />
          </Sphere>
        ))}

        {/* Mill inlet chute */}
        <Box args={[0.5, 2, 0.5]} position={[0, 3, 0]}>
          <meshPhongMaterial color="#95a5a6" />
        </Box>

        {/* Mill discharge */}
        <Cylinder args={[0.3, 0.3, 1, 8]} position={[0, -3, 0]}>
          <meshPhongMaterial color="#4A4A4A" />
        </Cylinder>

        {/* Mill drive system */}
        <group position={[-2, 2, 0]}>
          {/* Motor */}
          <Box args={[1, 0.8, 0.8]} position={[0, 0, 0]}>
            <meshPhongMaterial color="#3C3C3C" />
          </Box>
          {/* Gearbox */}
          <Box args={[0.8, 0.6, 0.6]} position={[0.8, -0.5, 0]}>
            <meshPhongMaterial color="#4A4A4A" />
          </Box>
          {/* Drive shaft */}
          <Cylinder args={[0.1, 0.1, 2, 8]} position={[1.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <meshPhongMaterial color="#95a5a6" />
          </Cylinder>
        </group>

        {/* Ventilation system */}
        <group position={[2, 3, 0]}>
          {/* Fan housing */}
          <Cylinder args={[0.3, 0.3, 0.2, 8]} position={[0, 0, 0]}>
            <meshPhongMaterial color="#4A4A4A" />
          </Cylinder>
          {/* Fan blades */}
          {Array.from({ length: 4 }).map((_, i) => (
            <Box
              key={`vent-blade-${i}`}
              args={[0.02, 0.4, 0.05]}
              position={[0, 0, 0]}
              rotation={[0, 0, i * Math.PI / 2]}
            >
              <meshPhongMaterial color="#95a5a6" />
            </Box>
          ))}
        </group>

        {/* Classifier (for particle separation) */}
        <Cylinder args={[0.8, 0.8, 2, 12]} position={[3, 1, 0]}>
          <meshPhongMaterial color="#bdc3c7" />
        </Cylinder>

        {/* Dust collection duct */}
        <Cylinder args={[0.2, 0.2, 3, 8]} position={[3, 3, 0]}>
          <meshPhongMaterial color="#7f8c8d" />
        </Cylinder>
      </group>

      {/* Spectacular Internal Mill Animation for Mill 1 */}
              <MillInternalAnimationUpdated position={[20, 4, -8]} millId={1} isWireframeMode={isWireframeMode} />

      {/* Raw Silo Feed Flow to Mill 1 */}
      {Array.from({ length: 2 }).map((_, i) => (
        <RawSiloFeedFlow
          key={`silo-flow-mill1-${i}`}
          siloPosition={[-35 + i * 6, 12, 12]}
          millPosition={[20, 4, -8]}
          siloId={i}
          isWireframeMode={isWireframeMode}
        />
      ))}

      {/* Mill 1 Label */}
      {showDetails && (
        <Html position={[20, 7, -8]} center>
          <div style={{
            background: 'rgba(52, 152, 219, 0.9)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '10px',
            fontWeight: 'bold',
            border: '1px solid #2980b9',
            pointerEvents: 'none',
            backdropFilter: 'blur(5px)'
          }}>
            ⚙️ CEMENT MILL #1<br/>
            <span style={{fontSize: '8px', fontWeight: 'normal'}}>
              Final Grinding
            </span>
          </div>
        </Html>
      )}

      {/* Mill 2 - Complete milling system - Moved and Scaled */}
      <group position={[20, 4, 8]}>
        {/* Enhanced Mill 2 shell with Better Wireframes */}
        <Cylinder
          ref={mill2Ref}
          args={[2.5, 2.5, 10, 40]}
          position={[0, 0, 0]}
        >
          <meshPhongMaterial 
            color={isWireframeMode ? "#0066cc" : "#A9A9A9"}
            transparent 
            opacity={isWireframeMode ? 0.3 : 0.9}
            emissive={isWireframeMode ? "#0066cc" : "#808080"}
            emissiveIntensity={isWireframeMode ? 1.0 : 0.1}
            wireframe={isWireframeMode}
          />
        </Cylinder>
        
        {/* Enhanced Mill 2 Energy Field */}
        <Cylinder
          args={[3.0, 3.0, 10, 40]}
          position={[0, 0, 0]}
        >
          <meshPhongMaterial 
            color={isWireframeMode ? "#0066cc" : "#3498db"}
            transparent 
            opacity={isWireframeMode ? 0.15 : 0.3}
            emissive={isWireframeMode ? "#0066cc" : "#2980b9"}
            emissiveIntensity={isWireframeMode ? 0.5 : 0.6}
            wireframe={isWireframeMode}
          />
        </Cylinder>
        
        {/* Enhanced Mill 2 Structural Lines */}
        {Array.from({ length: 8 }).map((_, i) => (
          <Line
            key={`mill2-structure-${i}`}
            points={[
              [2.5 * Math.cos(i * Math.PI / 4), -5, 2.5 * Math.sin(i * Math.PI / 4)],
              [2.5 * Math.cos(i * Math.PI / 4), 5, 2.5 * Math.sin(i * Math.PI / 4)]
            ]}
            color={MATERIAL_COLORS.wireframe.primary}
            lineWidth={1.0}
          />
        ))}

        {/* Mill liners (internal protection) */}
        <Cylinder args={[1.15, 1.15, 5, 16]} position={[0, 0, 0]}>
          <meshPhongMaterial color="#5d6d7e" transparent opacity={0.7} />
        </Cylinder>

        {/* Mill diaphragms (compartment separators) */}
        <Cylinder args={[1.1, 1.1, 0.1, 16]} position={[0, 1, 0]}>
          <meshPhongMaterial color="#4A4A4A" />
        </Cylinder>
        <Cylinder args={[1.1, 1.1, 0.1, 16]} position={[0, -1, 0]}>
          <meshPhongMaterial color="#4A4A4A" />
        </Cylinder>

        {/* Grinding media inside mill (animated) */}
        {Array.from({ length: 12 }).map((_, i) => (
          <Sphere
            key={`media2-${i}`}
            args={[0.15, 8, 8]}
            position={[
              Math.cos(i * Math.PI / 6) * 0.9,
              Math.sin(i * Math.PI / 6) * 0.9,
              (Math.random() - 0.5) * 0.4
            ]}
          >
            <meshPhongMaterial color="#4A4A4A" />
          </Sphere>
        ))}

        {/* Mill inlet chute */}
        <Box args={[0.5, 2, 0.5]} position={[0, 3, 0]}>
          <meshPhongMaterial color="#95a5a6" />
        </Box>

        {/* Mill discharge */}
        <Cylinder args={[0.3, 0.3, 1, 8]} position={[0, -3, 0]}>
          <meshPhongMaterial color="#4A4A4A" />
        </Cylinder>

        {/* Mill drive system */}
        <group position={[-2, 2, 0]}>
          {/* Motor */}
          <Box args={[1, 0.8, 0.8]} position={[0, 0, 0]}>
            <meshPhongMaterial color="#3C3C3C" />
          </Box>
          {/* Gearbox */}
          <Box args={[0.8, 0.6, 0.6]} position={[0.8, -0.5, 0]}>
            <meshPhongMaterial color="#4A4A4A" />
          </Box>
          {/* Drive shaft */}
          <Cylinder args={[0.1, 0.1, 2, 8]} position={[1.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <meshPhongMaterial color="#95a5a6" />
          </Cylinder>
        </group>

        {/* Ventilation system */}
        <group position={[2, 3, 0]}>
          {/* Fan housing */}
          <Cylinder args={[0.3, 0.3, 0.2, 8]} position={[0, 0, 0]}>
            <meshPhongMaterial color="#4A4A4A" />
          </Cylinder>
          {/* Fan blades */}
          {Array.from({ length: 4 }).map((_, i) => (
            <Box
              key={`vent-blade2-${i}`}
              args={[0.02, 0.4, 0.05]}
              position={[0, 0, 0]}
              rotation={[0, 0, i * Math.PI / 2]}
            >
              <meshPhongMaterial color="#95a5a6" />
            </Box>
          ))}
        </group>

        {/* Classifier (for particle separation) */}
        <Cylinder args={[0.8, 0.8, 2, 12]} position={[3, 1, 0]}>
          <meshPhongMaterial color="#bdc3c7" />
        </Cylinder>

        {/* Dust collection duct */}
        <Cylinder args={[0.2, 0.2, 3, 8]} position={[3, 3, 0]}>
          <meshPhongMaterial color="#7f8c8d" />
        </Cylinder>
      </group>

      {/* Spectacular Internal Mill Animation for Mill 2 */}
              <MillInternalAnimationUpdated position={[20, 4, 8]} millId={2} isWireframeMode={isWireframeMode} />

      {/* Raw Silo Feed Flow Visualization */}
      {Array.from({ length: 4 }).map((_, i) => (
        <RawSiloFeedFlow
          key={`silo-flow-${i}`}
          siloPosition={[-35 + i * 6, 12, 12]}
          millPosition={[20, 4, i % 2 === 0 ? -8 : 8]}
          siloId={i}
          isWireframeMode={isWireframeMode}
        />
      ))}

      {/* Mill 2 Label */}
      {showDetails && (
        <Html position={[20, 16, 8]} center>
          <div style={{
            background: 'rgba(52, 152, 219, 0.9)',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 'bold',
            border: '2px solid #2980b9',
            pointerEvents: 'none',
            backdropFilter: 'blur(5px)'
          }}>
            ⚙️ CEMENT MILL #2<br/>
            <span style={{fontSize: '10px', fontWeight: 'normal'}}>
              Final Grinding
            </span>
          </div>
        </Html>
      )}

      {/* Enhanced Holographic Wireframe Packing Plant */}
      <group position={[15, 0, 0]}>
        {/* Packing Plant Building */}
        <Box args={[6, 4, 8]} position={[0, 2, 0]}>
          <meshPhongMaterial 
            color={MATERIAL_COLORS.wireframe.primary} 
            transparent 
            opacity={0.3}
            emissive="#0066cc"
            emissiveIntensity={1.0}
            wireframe={true}
          />
        </Box>
        {/* Packing Machine */}
        <Box args={[2, 1.5, 3]} position={[0, 3.5, 0]}>
          <meshPhongMaterial 
            color={MATERIAL_COLORS.wireframe.primary} 
            transparent 
            opacity={0.4}
            emissive="#0066cc"
            emissiveIntensity={0.7}
            wireframe={true}
          />
        </Box>
        
        {/* Enhanced Packing Plant Energy Field */}
        <Box args={[6.5, 4.5, 8.5]} position={[0, 2, 0]}>
          <meshPhongMaterial 
            color={MATERIAL_COLORS.wireframe.primary} 
            transparent 
            opacity={0.15}
            emissive="#0066cc"
            emissiveIntensity={0.4}
            wireframe={true}
          />
        </Box>
        
        {/* Enhanced Packing Plant Structural Lines */}
        {Array.from({ length: 4 }).map((_, i) => (
          <Line
            key={`packing-vertical-${i}`}
            points={[
              [-3 + i * 2, 0, -4],
              [-3 + i * 2, 4, -4]
            ]}
            color={isWireframeMode ? MATERIAL_COLORS.wireframe.primary : "#959595"}
            lineWidth={isWireframeMode ? 1.0 : 0.6}
          />
        ))}
        {/* Enhanced Holographic Wireframe Cement Bags */}
        {Array.from({ length: 8 }).map((_, i) => (
          <Box 
            key={`bag-${i}`} 
            args={[0.3, 0.5, 0.2]} 
            position={[
              -2 + (i % 4) * 1.2, 
              0.5, 
              -1.5 + Math.floor(i / 4) * 1.5
            ]}
          >
            <meshPhongMaterial 
              color={isWireframeMode ? MATERIAL_COLORS.wireframe.primary : "#959595"}
              transparent 
              opacity={isWireframeMode ? 0.4 : 0.8}
              emissive={isWireframeMode ? "#0066cc" : "#7f8c8d"}
              emissiveIntensity={isWireframeMode ? 0.7 : 0.3}
              wireframe={isWireframeMode}
            />
          </Box>
        ))}
        
        {/* Enhanced Cement Bags Energy Field */}
        <Box args={[4.5, 1.0, 3.0]} position={[0, 0.7, 0]}>
          <meshPhongMaterial 
            color={isWireframeMode ? MATERIAL_COLORS.wireframe.primary : "#959595"}
            transparent 
            opacity={isWireframeMode ? 0.15 : 0.4}
            emissive={isWireframeMode ? "#0066cc" : "#7f8c8d"}
            emissiveIntensity={isWireframeMode ? 0.4 : 0.2}
            wireframe={isWireframeMode}
          />
        </Box>
        {/* Packing Plant Label */}
        {showDetails && (
          <Html position={[0, 6, 0]} center>
            <div style={{
              background: 'rgba(46, 204, 113, 0.9)',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '10px',
              fontWeight: 'bold',
              border: '1px solid #27ae60',
              pointerEvents: 'none',
              backdropFilter: 'blur(5px)'
            }}>
              📦 PACKING PLANT<br/>
              <span style={{fontSize: '8px', fontWeight: 'normal'}}>
                Final Product
              </span>
            </div>
          </Html>
        )}
      </group>

      {/* Enhanced Holographic Wireframe Dust Collection Systems */}
      {/* Combined dust collection unit */}
      <Box args={[3, 4, 2]} position={[-14, 8, -8]}>
        <meshPhongMaterial 
          color={isWireframeMode ? "#0066cc" : "#7f8c8d"}
          transparent 
          opacity={isWireframeMode ? 0.3 : 0.8}
          emissive={isWireframeMode ? "#0066cc" : "#6c7b7d"}
          emissiveIntensity={isWireframeMode ? 1.0 : 0.4}
          wireframe={isWireframeMode}
        />
      </Box>

      {/* Dust outlet */}
      <Cylinder args={[0.2, 0.2, 2, 16]} position={[-14, 6, -8]}>
        <meshPhongMaterial 
          color={isWireframeMode ? "#0066cc" : "#6c7b7d"}
          transparent 
          opacity={isWireframeMode ? 0.4 : 0.8}
          emissive={isWireframeMode ? "#0066cc" : "#5a6c7d"}
          emissiveIntensity={isWireframeMode ? 0.7 : 0.3}
          wireframe={isWireframeMode}
        />
      </Cylinder>

      {/* Enhanced Bucket Elevator */}
      <Box args={[1.2, 12, 0.8]} position={[-12, 6, 6]}>
        <meshPhongMaterial 
          color={isWireframeMode ? MATERIAL_COLORS.wireframe.primary : "#959595"}
          transparent 
          opacity={isWireframeMode ? 0.3 : 0.8}
          emissive={isWireframeMode ? "#0066cc" : "#7f8c8d"}
          emissiveIntensity={isWireframeMode ? 1.0 : 0.4}
          wireframe={isWireframeMode}
        />
      </Box>

      {/* Enhanced Elevator drive */}
      <Cylinder args={[0.5, 0.5, 0.4, 16]} position={[-12, 12.5, 6]}>
        <meshPhongMaterial 
          color={isWireframeMode ? MATERIAL_COLORS.wireframe.primary : "#BDBDBD"}
          transparent 
          opacity={isWireframeMode ? 0.4 : 0.8}
          emissive={isWireframeMode ? "#0066cc" : "#95a5a6"}
          emissiveIntensity={isWireframeMode ? 0.7 : 0.3}
          wireframe={isWireframeMode}
        />
      </Cylinder>
      
      {/* Enhanced Dust Collection Energy Fields */}
      <Box args={[3.5, 4.5, 2.5]} position={[-14, 8, -8]}>
        <meshPhongMaterial 
          color={isWireframeMode ? MATERIAL_COLORS.wireframe.primary : "#959595"}
          transparent 
          opacity={isWireframeMode ? 0.15 : 0.3}
          emissive={isWireframeMode ? "#0066cc" : "#7f8c8d"}
          emissiveIntensity={isWireframeMode ? 0.4 : 0.2}
          wireframe={isWireframeMode}
        />
      </Box>
      
      <Box args={[1.7, 12.5, 1.3]} position={[-12, 6, 6]}>
        <meshPhongMaterial 
          color={MATERIAL_COLORS.wireframe.primary} 
          transparent 
          opacity={0.15}
          emissive="#0066cc"
          emissiveIntensity={0.4}
          wireframe={true}
        />
      </Box>

      {/* Enhanced Holographic Wireframe Cement Storage Silos */}
      {Array.from({ length: 6 }).map((_, i) => (
        <Cylinder
          key={`cement-silo-${i}`}
          args={[2.5, 2.5, 12, 32]}
          position={[30, 6, (i - 2.5) * 4]}
        >
          <meshPhongMaterial 
            color={isWireframeMode ? "#00ccff" : "#D2691E"}
            transparent 
            opacity={isWireframeMode ? 0.4 : 0.9}
            emissive={isWireframeMode ? "#0099ff" : "#CD853F"}
            emissiveIntensity={isWireframeMode ? 1.3 : 0.2}
            wireframe={isWireframeMode}
            shininess={isWireframeMode ? 0 : 25}
          />
        </Cylinder>
      ))}
      
      {/* Enhanced Holographic Silo Cores */}
      {isWireframeMode && Array.from({ length: 6 }).map((_, i) => (
        <Cylinder
          key={`cement-silo-core-${i}`}
          args={[2.2, 2.2, 13, 32]}
          position={[30, 6, (i - 2.5) * 4]}
        >
          <meshPhongMaterial 
            color="#3498db"
            transparent 
            opacity={0.15}
            emissive="#0099ff"
            emissiveIntensity={0.6}
            wireframe={false}
          />
        </Cylinder>
      ))}
      

      
      {/* Enhanced Silo Structural Lines */}
      {Array.from({ length: 6 }).map((_, i) => (
        <group key={`silo-structure-${i}`} position={[30, 6, (i - 2.5) * 4]}>
          {Array.from({ length: 8 }).map((_, j) => (
            <Line
              key={`silo-line-${i}-${j}`}
              points={[
                [2.5 * Math.cos(j * Math.PI / 4), -6, 2.5 * Math.sin(j * Math.PI / 4)],
                [2.5 * Math.cos(j * Math.PI / 4), 6, 2.5 * Math.sin(j * Math.PI / 4)]
              ]}
              color={isWireframeMode ? MATERIAL_COLORS.wireframe.primary : "#959595"}
              lineWidth={isWireframeMode ? 0.8 : 0.5}
            />
          ))}
        </group>
      ))}
      
      {/* Cement Silo Labels */}
      {showDetails && (
        <Html position={[30, 14, 0]} center>
          <div style={{
            background: 'rgba(243, 156, 18, 0.9)',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 'bold',
            border: '2px solid #e67e22',
            pointerEvents: 'none',
            backdropFilter: 'blur(5px)'
          }}>
            🏗️ CEMENT SILOS<br/>
            <span style={{fontSize: '10px', fontWeight: 'normal'}}>
              Final Product Storage
            </span>
          </div>
        </Html>
      )}

      {/* Holographic Dark Blue Material Flow Connections */}
      {/* Main Process Flow (JK Cement layout) */}
      <Line
        points={[
          [-35, 6, 12],  // Raw materials (updated crusher position)
          [-25, 16, 12], // Raw mill
          [-18, 16, 12], // Feed system to preheater
          [-6, 25, 0],   // Preheater inlet (corrected position)
          [-6, 4, 0],    // Kiln inlet (updated position)
          [6, 4, 0],     // Cooler (adjusted)
          [20, 4, 0],    // Mills (updated position)
          [30, 6, 0]     // Final cement silos (updated position)
        ]}
        color={MATERIAL_COLORS.wireframe.primary}
        lineWidth={3}
      />
      
      {/* Holographic Energy Flow Particles */}
      {Array.from({ length: 30 }).map((_, i) => (
        <Sphere
          key={`flow-particle-${i}`}
          args={[0.05, 8, 8]}
          position={[
            -35 + (i / 30) * 65,
            6 + Math.sin(i * 0.5) * 2,
            12 - (i / 30) * 12
          ]}
        >
          <meshPhongMaterial
            color={MATERIAL_COLORS.wireframe.primary}
            transparent
            opacity={0.7}
            emissive="#0066cc"
            emissiveIntensity={1.0}
          />
        </Sphere>
      ))}
      
      {/* Holographic rail siding connection to crusher */}
      <Line
        points={[
          [0, 1, 15],   // Rail siding
          [-35, 1, 12], // Crusher (updated position)
        ]}
        color={MATERIAL_COLORS.wireframe.primary}
        lineWidth={2}
      />
      
      {/* Holographic raw material flow from silos to crusher */}
      <Line
        points={[
          [-29, 12, 12], // Silo 1
          [-35, 6, 12],  // Crusher
        ]}
        color={MATERIAL_COLORS.wireframe.primary}
        lineWidth={2}
      />
      
      {/* Holographic Rail Energy Particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <Sphere
          key={`rail-particle-${i}`}
          args={[0.03, 8, 8]}
          position={[
            (i / 20) * -35,
            1 + Math.sin(i * 0.3) * 0.5,
            15 - (i / 20) * 3
          ]}
        >
          <meshPhongMaterial
            color={MATERIAL_COLORS.wireframe.primary}
            transparent
            opacity={0.6}
            emissive="#0066cc"
            emissiveIntensity={0.8}
          />
        </Sphere>
      ))}

      {/* Fuel Supply */}
      <Line
        points={[
          [-18, 8, 8],   // Fuel storage
          [-15.5, 2, 0]  // Kiln burner
        ]}
        color="#e74c3c"
        lineWidth={2}
      />

      {/* Gas flow from preheater to stack (natural draft) */}
      <Line
        points={[
          [-6, 18, 0],  // Preheater outlet
          [-6, 35, 0]   // Stack inlet
        ]}
        color="#87ceeb"
        lineWidth={1}
      />

      {/* Show additional details when requested */}
      {showDetails && (
        <>
          {/* Mill ventilation */}
          <Line
            points={[
              [20, 5, -8],  // Mill 1
              [-14, 6, -8] // Dust collector
            ]}
            color="#95a5a6"
            lineWidth={1}
          />
          <Line
            points={[
              [8, 3, 3],   // Mill 2
              [-14, 6, -8] // Dust collector
            ]}
            color="#95a5a6"
            lineWidth={1}
          />

          {/* Elevator flow */}
          <Line
            points={[
              [-12, 0, 6],  // Elevator bottom
              [-12, 12, 6], // Elevator top
              [15, 8, 0]    // To silos
            ]}
            color="#74b9ff"
            lineWidth={1}
          />
        </>
      )}

            {/* JK Cement Rail Siding - Properly positioned for material transport */}
      <group position={[0, 0.1, 15]}>
        {/* Enhanced Railway Tracks */}
        {Array.from({ length: 3 }).map((_, i) => (
          <Box 
            key={`track-${i}`} 
            args={[25, 0.2, 0.3]} 
            position={[0, 0, (i - 1) * 2]}
          >
            <meshPhongMaterial 
              color={MATERIAL_COLORS.wireframe.primary} 
              transparent 
              opacity={0.4}
              emissive="#0066cc"
              emissiveIntensity={0.8}
              wireframe={true}
            />
          </Box>
        ))}
        {/* Enhanced Railway Sleepers */}
        {Array.from({ length: 25 }).map((_, i) => (
          <Box 
            key={`sleeper-${i}`} 
            args={[0.3, 0.1, 2]} 
            position={[-12 + i, 0, 0]}
          >
            <meshPhongMaterial 
              color={MATERIAL_COLORS.wireframe.primary} 
              transparent 
              opacity={0.5}
              emissive="#0066cc"
              emissiveIntensity={0.6}
              wireframe={true}
            />
          </Box>
        ))}
        
        {/* Enhanced Loading Platform */}
        <Box args={[8, 0.5, 4]} position={[-8, 0.5, 0]}>
          <meshPhongMaterial 
            color={MATERIAL_COLORS.wireframe.primary} 
            transparent 
            opacity={0.3}
            emissive="#0066cc"
            emissiveIntensity={1.0}
            wireframe={true}
          />
        </Box>
        
        {/* Enhanced Loading Crane */}
        <Box args={[1, 6, 1]} position={[-8, 3.5, 0]}>
          <meshPhongMaterial 
            color={MATERIAL_COLORS.wireframe.primary} 
            transparent 
            opacity={0.4}
            emissive="#0066cc"
            emissiveIntensity={0.7}
            wireframe={true}
          />
        </Box>
        
        {/* Enhanced Crane Arm */}
        <Box args={[6, 0.5, 0.5]} position={[-5, 6, 0]}>
          <meshPhongMaterial 
            color={MATERIAL_COLORS.wireframe.primary} 
            transparent 
            opacity={0.4}
            emissive="#0066cc"
            emissiveIntensity={0.7}
            wireframe={true}
          />
        </Box>
        
        {/* Enhanced Rail Siding Energy Field */}
        <Box args={[25.5, 0.5, 4.5]} position={[0, 0.5, 0]}>
          <meshPhongMaterial 
            color={MATERIAL_COLORS.wireframe.primary} 
            transparent 
            opacity={0.1}
            emissive="#0066cc"
            emissiveIntensity={0.3}
            wireframe={true}
          />
        </Box>
        
        {/* Rail Siding Label */}
        {showDetails && (
          <Html position={[0, 8, 0]} center>
            <div style={{
              background: 'rgba(52, 73, 94, 0.9)',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '10px',
              fontWeight: 'bold',
              border: '1px solid #2c3e50',
              pointerEvents: 'none',
              backdropFilter: 'blur(5px)'
            }}>
              🚂 RAIL SIDING<br/>
              <span style={{fontSize: '8px', fontWeight: 'normal'}}>
                Material Loading & Transport
              </span>
            </div>
          </Html>
        )}
      </group>

      {/* Holographic Dark Blue Wireframe Ground Plane */}
      <Box args={[100, 0.1, 100]} position={[0, -0.05, 0]}>
        <meshPhongMaterial
          color={isWireframeMode ? "#0066cc" : "#2c3e50"}
          transparent
          opacity={isWireframeMode ? 0.1 : 0.6}
          emissive={isWireframeMode ? "#0066cc" : "#1a252f"}
          emissiveIntensity={isWireframeMode ? 0.2 : 0.1}
          wireframe={isWireframeMode}
        />
      </Box>
      
      {/* Holographic Dark Blue Ground Grid */}
      {Array.from({ length: 20 }).map((_, i) => (
        <Line
          key={`grid-x-${i}`}
          points={[
            [-50, 0.1, -50 + i * 5],
            [50, 0.1, -50 + i * 5]
          ]}
          color={isWireframeMode ? MATERIAL_COLORS.wireframe.primary : "#959595"}
          lineWidth={isWireframeMode ? 1.0 : 0.5}
        />
      ))}
      
      {Array.from({ length: 20 }).map((_, i) => (
        <Line
          key={`grid-z-${i}`}
          points={[
            [-50 + i * 5, 0.1, -50],
            [-50 + i * 5, 0.1, 50]
          ]}
          color={isWireframeMode ? MATERIAL_COLORS.wireframe.primary : "#959595"}
          lineWidth={isWireframeMode ? 1.0 : 0.5}
        />
      ))}

      {/* Clean Sensors - Priority Based Display */}
      {Object.entries(sensorData).map(([key, sensor]) => {
        const sensorConfig: Record<string, { name: string; priority: 'high' | 'medium' | 'low' }> = {
          temp1: { name: 'Preheater Temp', priority: 'high' },
          temp2: { name: 'Calciner Temp', priority: 'high' },
          temp3: { name: 'Kiln Inlet Temp', priority: 'high' },
          vibration: { name: 'Kiln Vibration', priority: 'high' },
          load: { name: 'Motor Load', priority: 'high' },
          emission: { name: 'NOx Emission', priority: 'medium' },
          burning: { name: 'Burning Zone', priority: 'high' },
          cooler: { name: 'Cooler Temp', priority: 'high' },
          'mill-feed': { name: 'Mill #1 Feed', priority: 'medium' },
          'mill-pressure': { name: 'Mill #2 Feed', priority: 'medium' },
          'mill-particle': { name: 'Silo Level', priority: 'low' },
          'mill-eff': { name: 'Mill Efficiency', priority: 'low' },
          'particle-emission': { name: 'Particle Emission', priority: 'medium' },
          'stack-flow': { name: 'Stack Flow Rate', priority: 'medium' }
        };

        const config = sensorConfig[key] || { name: key, priority: 'low' as const };

        return (
          <SensorTooltip
            key={key}
            sensor={{
              ...sensor,
              name: config.name
            }}
            position={sensor.position}
            priority={config.priority}
            showDetails={showDetails}
          />
        );
      })}
    </group>
  );
};

// Enhanced UI Control Panel Component with Simulation & AI
const ControlPanel: React.FC<{ 
  showDetails: boolean; 
  onToggleDetails: () => void; 
  isVisible: boolean; 
  onToggleVisibility: () => void;
  isWireframeMode: boolean;
  setIsWireframeMode: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({
  showDetails,
  onToggleDetails,
  isVisible,
  onToggleVisibility,
  isWireframeMode,
  setIsWireframeMode
}) => {
  const { 
    isRealtimeMode, 
    setIsRealtimeMode, 
    simulationData, 
    millData,
    isSimulationMode,
    setSimulationMode,
    sensorData
  } = useData();
  const { analyzeKiln, analyzeMill, isLoading } = useGemini();
  const [showAIModal, setShowAIModal] = useState(false);

  return (
    <>
      {/* Enhanced Settings Icon - Always Visible */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        zIndex: 1001,
        cursor: 'pointer',
        transition: 'all 0.3s ease'
      }}>
        <button
          onClick={onToggleVisibility}
          style={{
            background: 'linear-gradient(135deg, rgba(116, 185, 255, 0.4) 0%, rgba(116, 185, 255, 0.3) 100%)',
            border: '2px solid rgba(116, 185, 255, 0.7)',
            color: '#74b9ff',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '24px',
            fontWeight: 'bold',
            transition: 'all 0.3s ease',
            boxShadow: '0 6px 20px rgba(116, 185, 255, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(15px)',
            minWidth: '56px',
            minHeight: '56px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(116, 185, 255, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(116, 185, 255, 0.4)';
          }}
          aria-label="Toggle Control Panel"
          title="Toggle Control Panel"
        >
          ⚙️
        </button>
      </div>

      {/* Enhanced Control Panel - Hideable */}
      {isVisible && (
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '90px',
          zIndex: 1000,
          background: 'linear-gradient(135deg, rgba(15, 20, 40, 0.98) 0%, rgba(44, 62, 80, 0.98) 100%)',
          border: '2px solid rgba(116, 185, 255, 0.5)',
          borderRadius: '16px',
          padding: '20px',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(116, 185, 255, 0.1)',
          animation: 'slideIn 0.3s ease-out',
          minWidth: '320px',
          maxWidth: '400px'
        }}>
      <div style={{
        color: '#74b9ff',
        fontSize: '16px',
        fontWeight: 'bold',
        marginBottom: '12px',
        textShadow: '0 2px 4px rgba(116, 185, 255, 0.3)',
        letterSpacing: '0.5px'
      }}>
        🎮 3D Scene Controls
      </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
          {/* Row 1: Basic Controls */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={onToggleDetails}
              style={{
                background: showDetails ? 'linear-gradient(135deg, rgba(255, 107, 107, 0.4) 0%, rgba(255, 107, 107, 0.3) 100%)' : 'linear-gradient(135deg, rgba(116, 185, 255, 0.4) 0%, rgba(116, 185, 255, 0.3) 100%)',
                border: `2px solid ${showDetails ? '#ff6b6b' : '#74b9ff'}`,
                color: showDetails ? '#ff6b6b' : '#74b9ff',
                padding: '12px 16px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                boxShadow: showDetails ? '0 6px 20px rgba(255, 107, 107, 0.4)' : '0 6px 20px rgba(116, 185, 255, 0.4)',
                flex: 1,
                minHeight: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = showDetails ? '0 8px 25px rgba(255, 107, 107, 0.5)' : '0 8px 25px rgba(116, 185, 255, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = showDetails ? '0 6px 20px rgba(255, 107, 107, 0.4)' : '0 6px 20px rgba(116, 185, 255, 0.4)';
              }}
              aria-label={showDetails ? 'Hide Details' : 'Show Details'}
              title={showDetails ? 'Hide Details' : 'Show Details'}
            >
              {showDetails ? '🔍 Hide' : '🔍 Show'}
            </button>

            <button
              onClick={() => setIsWireframeMode(!isWireframeMode)}
              style={{
                background: isWireframeMode ? 'linear-gradient(135deg, rgba(0, 102, 204, 0.5) 0%, rgba(0, 102, 204, 0.3) 100%)' : 'linear-gradient(135deg, rgba(46, 204, 113, 0.5) 0%, rgba(46, 204, 113, 0.3) 100%)',
                border: `2px solid ${isWireframeMode ? '#00ccff' : '#2ecc71'}`,
                color: isWireframeMode ? '#00ccff' : '#27ae60',
                padding: '12px 16px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '700',
                transition: 'all 0.3s ease',
                boxShadow: isWireframeMode ? '0 6px 25px rgba(0, 102, 204, 0.5)' : '0 6px 25px rgba(46, 204, 113, 0.5)',
                flex: 1,
                textShadow: `0 0 8px ${isWireframeMode ? '#00ccff' : '#2ecc71'}70`,
                letterSpacing: '0.5px',
                minHeight: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = isWireframeMode ? '0 8px 30px rgba(0, 102, 204, 0.6)' : '0 8px 30px rgba(46, 204, 113, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = isWireframeMode ? '0 6px 25px rgba(0, 102, 204, 0.5)' : '0 6px 25px rgba(46, 204, 113, 0.5)';
              }}
              aria-label={isWireframeMode ? 'Switch to Realistic Mode' : 'Switch to Holographic Mode'}
              title={isWireframeMode ? 'Switch to Realistic Mode' : 'Switch to Holographic Mode'}
            >
              {isWireframeMode ? '⚡ Holographic' : '🌈 Realistic'}
            </button>
          </div>

          {/* Row 2: Mode Controls */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setIsRealtimeMode(!isRealtimeMode)}
              style={{
                background: isRealtimeMode ? 'linear-gradient(135deg, rgba(0, 184, 148, 0.4) 0%, rgba(0, 184, 148, 0.3) 100%)' : 'linear-gradient(135deg, rgba(149, 165, 166, 0.4) 0%, rgba(149, 165, 166, 0.3) 100%)',
                border: `2px solid ${isRealtimeMode ? '#00b894' : '#95a5a6'}`,
                color: isRealtimeMode ? '#00b894' : '#95a5a6',
                padding: '12px 16px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                boxShadow: isRealtimeMode ? '0 6px 20px rgba(0, 184, 148, 0.4)' : '0 6px 20px rgba(149, 165, 166, 0.4)',
                flex: 1,
                minHeight: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = isRealtimeMode ? '0 8px 25px rgba(0, 184, 148, 0.5)' : '0 8px 25px rgba(149, 165, 166, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = isRealtimeMode ? '0 6px 20px rgba(0, 184, 148, 0.4)' : '0 6px 20px rgba(149, 165, 166, 0.4)';
              }}
              aria-label={isRealtimeMode ? 'Disable Real-time Mode' : 'Enable Real-time Mode'}
              title={isRealtimeMode ? 'Disable Real-time Mode' : 'Enable Real-time Mode'}
            >
              {isRealtimeMode ? '⚡ Live ON' : '⚡ Live OFF'}
            </button>

            <button
              onClick={() => setSimulationMode(!isSimulationMode)}
              style={{
                background: isSimulationMode ? 'linear-gradient(135deg, rgba(155, 89, 182, 0.4) 0%, rgba(155, 89, 182, 0.3) 100%)' : 'linear-gradient(135deg, rgba(52, 73, 94, 0.4) 0%, rgba(52, 73, 94, 0.3) 100%)',
                border: `2px solid ${isSimulationMode ? '#9b59b6' : '#34495e'}`,
                color: isSimulationMode ? '#9b59b6' : '#34495e',
                padding: '12px 16px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                boxShadow: isSimulationMode ? '0 6px 20px rgba(155, 89, 182, 0.4)' : '0 6px 20px rgba(52, 73, 94, 0.4)',
                flex: 1,
                minHeight: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = isSimulationMode ? '0 8px 25px rgba(155, 89, 182, 0.5)' : '0 8px 25px rgba(52, 73, 94, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = isSimulationMode ? '0 6px 20px rgba(155, 89, 182, 0.4)' : '0 6px 20px rgba(52, 73, 94, 0.4)';
              }}
              aria-label={isSimulationMode ? 'Disable Simulation Mode' : 'Enable Simulation Mode'}
              title={isSimulationMode ? 'Disable Simulation Mode' : 'Enable Simulation Mode'}
            >
              {isSimulationMode ? '🎮 Sim ON' : '🎮 Sim OFF'}
            </button>
          </div>

          {/* Row 3: AI Analysis */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setShowAIModal(true)}
              disabled={isLoading}
              style={{
                background: isLoading ? 'linear-gradient(135deg, rgba(149, 165, 166, 0.4) 0%, rgba(149, 165, 166, 0.3) 100%)' : 'linear-gradient(135deg, rgba(241, 196, 15, 0.4) 0%, rgba(241, 196, 15, 0.3) 100%)',
                border: `2px solid ${isLoading ? '#95a5a6' : '#f1c40f'}`,
                color: isLoading ? '#95a5a6' : '#f1c40f',
                padding: '12px 16px',
                borderRadius: '10px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                boxShadow: isLoading ? '0 6px 20px rgba(149, 165, 166, 0.4)' : '0 6px 20px rgba(241, 196, 15, 0.4)',
                flex: 1,
                opacity: isLoading ? 0.6 : 1,
                minHeight: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(241, 196, 15, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(241, 196, 15, 0.4)';
                }
              }}
              aria-label={isLoading ? 'AI Analysis in Progress' : 'Start AI Analysis'}
              title={isLoading ? 'AI Analysis in Progress' : 'Start AI Analysis'}
            >
              {isLoading ? '🤖 Analyzing...' : '🤖 AI Analysis'}
            </button>
          </div>
        </div>

        {/* Enhanced Status Display */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(15, 20, 40, 0.9) 0%, rgba(44, 62, 80, 0.9) 100%)',
          border: '1px solid rgba(116, 185, 255, 0.4)',
          borderRadius: '10px',
          padding: '12px',
          marginBottom: '16px',
          fontSize: '12px',
          color: '#74b9ff',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
            📊 System Status
            {isSimulationMode && <span style={{ color: '#9b59b6', fontSize: '11px', background: 'rgba(155, 89, 182, 0.2)', padding: '2px 6px', borderRadius: '4px' }}>🎮 SIMULATION</span>}
            {isRealtimeMode && !isSimulationMode && <span style={{ color: '#00b894', fontSize: '11px', background: 'rgba(0, 184, 148, 0.2)', padding: '2px 6px', borderRadius: '4px' }}>⚡ REAL-TIME</span>}
            {!isSimulationMode && !isRealtimeMode && <span style={{ color: '#74b9ff', fontSize: '11px', background: 'rgba(116, 185, 255, 0.2)', padding: '2px 6px', borderRadius: '4px' }}>📊 NORMAL</span>}
          </div>
          <div style={{ fontSize: '11px', opacity: 0.9, marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
            <span>Visual Mode:</span>
            <span style={{ color: isWireframeMode ? '#00ccff' : '#2ecc71' }}>
              {isWireframeMode ? '🔲 Wireframe' : '🎨 Colorful'}
            </span>
          </div>
          <div style={{ fontSize: '11px', opacity: 0.9, marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
            <span>Kiln Data:</span>
            <span style={{ color: simulationData.length > 0 ? '#2ecc71' : '#e74c3c' }}>
              {simulationData.length > 0 ? `${simulationData.length} records` : 'No data'}
            </span>
          </div>
          <div style={{ fontSize: '11px', opacity: 0.9, marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
            <span>Mill Data:</span>
            <span style={{ color: millData.length > 0 ? '#2ecc71' : '#e74c3c' }}>
              {millData.length > 0 ? `${millData.length} records` : 'No data'}
            </span>
          </div>
          <div style={{ fontSize: '11px', opacity: 0.9, marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
            <span>Feed Rate:</span>
            <span style={{ color: '#f39c12' }}>
              {sensorData['mill-feed']?.value?.toFixed(1) || '12.4'} t/h
            </span>
          </div>
          <div style={{ fontSize: '11px', opacity: 0.9, marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
            <span>Mill Efficiency:</span>
            <span style={{ color: '#27ae60' }}>
              {Math.round(sensorData['mill-eff']?.value || 78)}%
            </span>
          </div>
          <div style={{ fontSize: '11px', opacity: 0.9, marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
            <span>Active Sensors:</span>
            <span style={{ color: '#3498db' }}>
              {Object.keys(sensorData).length}
            </span>
          </div>
          {isRealtimeMode && (
            <div style={{ fontSize: '11px', opacity: 0.9, color: '#00b894', marginTop: '4px', padding: '4px 8px', background: 'rgba(0, 184, 148, 0.1)', borderRadius: '4px' }}>
              ⚡ Update: Every 2 seconds
            </div>
          )}
          {isSimulationMode && (
            <div style={{ fontSize: '11px', opacity: 0.9, color: '#9b59b6', marginTop: '4px', padding: '4px 8px', background: 'rgba(155, 89, 182, 0.1)', borderRadius: '4px' }}>
              🎮 Enhanced Visual Effects Active
            </div>
          )}
          {!isSimulationMode && !isRealtimeMode && (
            <div style={{ fontSize: '10px', opacity: 0.8, color: '#74b9ff' }}>
              Standard Display Mode
            </div>
          )}
        </div>

        {/* AI Analysis Modal */}
        {showAIModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 2000,
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(15, 20, 40, 0.98) 0%, rgba(44, 62, 80, 0.98) 100%)',
              border: '2px solid rgba(241, 196, 15, 0.4)',
              borderRadius: '12px',
              padding: '20px',
              maxWidth: '500px',
              maxHeight: '80vh',
              overflow: 'auto',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
            }}>
              <div style={{
                color: '#f1c40f',
                fontSize: '18px',
                fontWeight: 'bold',
                marginBottom: '16px',
                textAlign: 'center'
              }}>
                🤖 AI Cement Plant Analysis
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '14px', color: '#74b9ff', marginBottom: '8px' }}>
                  Select Analysis Type:
                </div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <button
                    onClick={() => {
                      analyzeKiln(sensorData);
                      setShowAIModal(false);
                    }}
                    disabled={isLoading}
                    style={{
                      background: 'linear-gradient(135deg, rgba(231, 76, 60, 0.3) 0%, rgba(231, 76, 60, 0.2) 100%)',
                      border: '2px solid #e74c3c',
                      color: '#e74c3c',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      fontSize: '12px',
                      fontWeight: '600',
                      transition: 'all 0.3s ease',
                      flex: 1,
                      opacity: isLoading ? 0.6 : 1
                    }}
                  >
                    🔥 Kiln Analysis
                  </button>
                  <button
                    onClick={() => {
                      analyzeMill(sensorData);
                      setShowAIModal(false);
                    }}
                    disabled={isLoading}
                    style={{
                      background: 'linear-gradient(135deg, rgba(52, 152, 219, 0.3) 0%, rgba(52, 152, 219, 0.2) 100%)',
                      border: '2px solid #3498db',
                      color: '#3498db',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      fontSize: '12px',
                      fontWeight: '600',
                      transition: 'all 0.3s ease',
                      flex: 1,
                      opacity: isLoading ? 0.6 : 1
                    }}
                  >
                    ⚙️ Mill Analysis
                  </button>
                </div>
              </div>

              <div style={{
                fontSize: '12px',
                color: '#959595',
                marginBottom: '16px',
                lineHeight: '1.4'
              }}>
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Analysis Includes:</div>
                <div>• Performance optimization recommendations</div>
                <div>• Energy efficiency insights</div>
                <div>• Predictive maintenance alerts</div>
                <div>• Quality control suggestions</div>
                <div>• Environmental compliance analysis</div>
              </div>

              <button
                onClick={() => setShowAIModal(false)}
                style={{
                  background: 'linear-gradient(135deg, rgba(149, 165, 166, 0.3) 0%, rgba(149, 165, 166, 0.2) 100%)',
                  border: '2px solid #95a5a6',
                  color: '#959595',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  width: '100%'
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}

      <div style={{
        color: '#959595',
        fontSize: '11px',
        marginTop: '8px',
        lineHeight: '1.4'
      }}>
        <div>• <span style={{color: '#e74c3c'}}>🔴 RED</span>: Inclined Rotary Kiln (material movement)</div>
        <div>• <span style={{color: '#34495e'}}>⚫ GRAY</span>: Preheater Tower (waste heat recovery)</div>
        <div>• <span style={{color: '#74b9ff'}}>🔵 BLUE</span>: Material flow</div>
        <div>• <span style={{color: '#87ceeb'}}>🔵 LIGHT BLUE</span>: Exhaust gas flow</div>
        <div>• 📊 <strong>ENHANCED FEATURES:</strong></div>
        <div>&nbsp;&nbsp;• Real-time Excel data streaming</div>
        <div>&nbsp;&nbsp;• AI-powered analysis & insights</div>
        <div>&nbsp;&nbsp;• Simulation mode & optimization</div>
        <div>&nbsp;&nbsp;• Visual mode toggle (Wireframe/Colorful)</div>
        <div>&nbsp;&nbsp;• JK Cement AI Assistant chatbot</div>
      </div>
        </div>
      )}
    </>
  );
};

const Enhanced3DScene: React.FC<Enhanced3DSceneProps> = ({ canvasId }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [isControlPanelVisible, setIsControlPanelVisible] = useState(false);
  const [isWireframeMode, setIsWireframeMode] = useState(false);

  return (
    <CanvasContainer>
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.2); opacity: 0.7; }
            100% { transform: scale(1); opacity: 1; }
          }
          
          @keyframes slideIn {
            0% { 
              transform: translateX(100px);
              opacity: 0;
            }
            100% { 
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
      {/* Control Panel */}
      <ControlPanel
        showDetails={showDetails}
        onToggleDetails={() => setShowDetails(!showDetails)}
        isVisible={isControlPanelVisible}
        onToggleVisibility={() => setIsControlPanelVisible(!isControlPanelVisible)}
        isWireframeMode={isWireframeMode}
        setIsWireframeMode={setIsWireframeMode}
      />

              <Canvas
          camera={{ position: [40, 45, 40], fov: 55 }}
          gl={{ 
            antialias: true, 
            alpha: true,
            shadowMap: {
              enabled: true,
              type: THREE.PCFSoftShadowMap
            } as React.CSSProperties
          }}
          scene={{ background: new THREE.Color(0x000011) }}
        >
        {/* Enhanced Dynamic Lighting System */}
        <ambientLight intensity={isWireframeMode ? 0.5 : 0.2} color={isWireframeMode ? 0x00ccff : 0xffffff} />

        <directionalLight
          position={[25, 30, 20]}
          intensity={isWireframeMode ? 1.4 : 0.8}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={100}
          shadow-camera-left={-50}
          shadow-camera-right={50}
          shadow-camera-top={50}
          shadow-camera-bottom={-50}
          color={isWireframeMode ? 0x00ccff : 0xffffff}
        />

        <directionalLight
          position={[-15, 20, -15]}
          intensity={isWireframeMode ? 1.0 : 0.6}
          color={isWireframeMode ? 0x00ccff : 0xffffff}
        />

        {/* Additional colorful mode lighting */}
        {!isWireframeMode && (
          <>
            <directionalLight
              position={[0, 40, 0]}
              intensity={0.5}
              color={0xffd700}
            />
            <directionalLight
              position={[0, -10, 20]}
              intensity={0.3}
              color={0x87ceeb}
            />
          </>
        )}

        {/* Enhanced dynamic point lights for key equipment */}
        <pointLight
          position={[-6, 6, 0]}
          intensity={isWireframeMode ? 1.5 : 0.8}
          distance={25}
          color={isWireframeMode ? 0x00ccff : 0xff4500}
          decay={1.5}
        />

        <pointLight
          position={[20, 4, -8]}
          intensity={isWireframeMode ? 0.8 : 0.6}
          distance={15}
          color={isWireframeMode ? 0x0066cc : 0x3498db}
          decay={1.5}
        />

        <pointLight
          position={[20, 4, 8]}
          intensity={isWireframeMode ? 0.8 : 0.6}
          distance={15}
          color={isWireframeMode ? 0x0066cc : 0x3498db}
          decay={1.5}
        />

        <pointLight
          position={[-6, 30, 0]}
          intensity={isWireframeMode ? 1.0 : 0.7}
          distance={25}
          color={isWireframeMode ? 0x0066cc : 0xffa726}
        />

        {/* Enhanced energy field lights */}
        <pointLight
          position={[-35, 6, 12]}
          intensity={isWireframeMode ? 0.6 : 0.4}
          distance={20}
          color={isWireframeMode ? 0x0066cc : 0x8e44ad}
        />
        
        <pointLight
          position={[-25, 16, 12]}
          intensity={isWireframeMode ? 0.6 : 0.4}
          distance={20}
          color={isWireframeMode ? 0x0066cc : 0x27ae60}
        />
        
        <pointLight
          position={[30, 6, 0]}
          intensity={isWireframeMode ? 0.6 : 0.4}
          distance={20}
          color={isWireframeMode ? 0x0066cc : 0x2ecc71}
        />

        {/* Enhanced Visual Mode Indicator */}
        {showDetails && (
          <Html position={[0, 50, 0]} center>
            <div style={{
              background: `linear-gradient(135deg, ${isWireframeMode ? '#0066cc' : '#2ecc71'}30 0%, ${isWireframeMode ? '#0066cc' : '#2ecc71'}10 100%)`,
              color: isWireframeMode ? '#00ccff' : '#27ae60',
              padding: '12px 24px',
              borderRadius: '25px',
              fontSize: '18px',
              fontWeight: 'bold',
              border: `3px solid ${isWireframeMode ? '#00ccff' : '#2ecc71'}`,
              pointerEvents: 'none',
              backdropFilter: 'blur(15px)',
              boxShadow: `0 8px 30px ${isWireframeMode ? '#0066cc' : '#2ecc71'}50`,
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              textAlign: 'center',
              animation: isWireframeMode ? 'pulse 2s infinite' : 'none',
              textShadow: `0 0 10px ${isWireframeMode ? '#00ccff' : '#2ecc71'}80`
            }}>
              {isWireframeMode ? '⚡ HOLOGRAPHIC WIREFRAME MODE' : '🌈 REALISTIC COLORFUL MODE'}
              <div style={{
                fontSize: '13px',
                fontWeight: 'normal',
                marginTop: '8px',
                opacity: 0.9,
                letterSpacing: '0.5px'
              }}>
                {isWireframeMode ? 'Advanced holographic visualization with energy fields' : 'Realistic materials with enhanced lighting and effects'}
              </div>
              <div style={{
                fontSize: '11px',
                marginTop: '5px',
                opacity: 0.7,
                fontStyle: 'italic'
              }}>
                {isWireframeMode ? 'Blue energy matrix active' : 'Full spectrum rendering active'}
              </div>
            </div>
          </Html>
        )}

        {/* Cement Plant with clean UI */}
        <CementPlant showDetails={showDetails} isWireframeMode={isWireframeMode} />

        {/* Enhanced 3D Scene Controls for Better User Experience */}
        <OrbitControls
          enableDamping
          dampingFactor={0.03}
          enableZoom
          enablePan
          maxDistance={120}
          minDistance={15}
          maxPolarAngle={Math.PI / 2.1}
          minPolarAngle={Math.PI / 8}
          target={[0, 20, 0]}
          enableRotate
          rotateSpeed={1.0}
          zoomSpeed={1.5}
          panSpeed={2.0}
          screenSpacePanning={true}
          autoRotate={false}
          autoRotateSpeed={0.5}
        />
        
        {/* Enhanced View Mode Toggle Button */}
        {showDetails && (
          <Html position={[0, 0, 0]} center>
            <div style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              background: `linear-gradient(135deg, ${isWireframeMode ? '#0066cc' : '#2ecc71'}25 0%, ${isWireframeMode ? '#0066cc' : '#2ecc71'}10 100%)`,
              color: isWireframeMode ? '#00ccff' : '#27ae60',
              padding: '14px 20px',
              borderRadius: '15px',
              border: `3px solid ${isWireframeMode ? '#00ccff' : '#2ecc71'}`,
              fontSize: '15px',
              fontFamily: 'monospace',
              backdropFilter: 'blur(15px)',
              zIndex: 1000,
              cursor: 'pointer',
              boxShadow: `0 6px 25px ${isWireframeMode ? '#0066cc' : '#2ecc71'}50`,
              transition: 'all 0.3s ease',
              textShadow: `0 0 8px ${isWireframeMode ? '#00ccff' : '#2ecc71'}60`,
              transform: 'scale(1)',
              animation: isWireframeMode ? 'pulse 3s infinite' : 'none'
            }}
            onClick={() => setIsWireframeMode(!isWireframeMode)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = `0 8px 30px ${isWireframeMode ? '#0066cc' : '#2ecc71'}70`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = `0 6px 25px ${isWireframeMode ? '#0066cc' : '#2ecc71'}50`;
            }}
            >
              <div style={{fontWeight: 'bold', textAlign: 'center', letterSpacing: '1px'}}>
                {isWireframeMode ? '⚡ HOLOGRAPHIC MODE' : '🌈 REALISTIC MODE'}
              </div>
              <div style={{fontSize: '12px', textAlign: 'center', marginTop: '8px', opacity: 0.9, letterSpacing: '0.5px'}}>
                Click to Switch Visual Style
              </div>
              <div style={{fontSize: '10px', textAlign: 'center', marginTop: '4px', opacity: 0.7, fontStyle: 'italic'}}>
                {isWireframeMode ? 'Switch to Colorful' : 'Switch to Wireframe'}
              </div>
            </div>
          </Html>
        )}
        
        {/* Post-processing grayscale effect disabled - restoring colorful scene */}
        {/* <GrayscaleEffect /> */}
      </Canvas>
    </CanvasContainer>
  );
};

export default Enhanced3DScene;
