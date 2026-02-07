
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { WORLD_THEMES } from '../constants';
import { WorldTheme } from '../types';

interface GroundProps {
  theme: WorldTheme;
}

export const Ground: React.FC<GroundProps> = ({ theme }) => {
  const themeConfig = WORLD_THEMES[theme];
  const size = 1000;
  
  // Create a stylized, theme-aware baseplate texture using a canvas
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    
    // Fill base theme color
    ctx.fillStyle = themeConfig.groundColor;
    ctx.fillRect(0, 0, 256, 256);
    
    // Procedural Detail Layers
    if (theme === 'meadow') {
      // Grass Noise
      for (let i = 0; i < 500; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
        ctx.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
      }
    } else if (theme === 'desert') {
      // Sand Ripples
      ctx.strokeStyle = 'rgba(0,0,0,0.03)';
      ctx.lineWidth = 10;
      ctx.beginPath();
      for (let y = 0; y < 256; y += 40) {
        ctx.moveTo(0, y);
        for (let x = 0; x < 256; x += 10) {
          ctx.lineTo(x, y + Math.sin(x * 0.05) * 5);
        }
      }
      ctx.stroke();
    } else if (theme === 'ocean') {
      // Water Caustics
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      for (let i = 0; i < 20; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * 256, Math.random() * 256, Math.random() * 40 + 20, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (theme === 'mars') {
      // Craters & Dust
      ctx.fillStyle = 'rgba(0,0,0,0.1)';
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * 256, Math.random() * 256, Math.random() * 30 + 10, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // Studio: Clean Grid Lines
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, 256, 256);
    }

    // Draw Iconic LEGO Stud Grid (Center of the 256x256 texture corresponds to the unit center)
    // Scale: 256px = 1 Unit (1x1 area). We draw 1 stud in the center.
    const studCenter = 128;
    const studRadius = 80; // Large enough to look like a stud in the 1x1 unit

    // Stud Outer Rim (Highlight)
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(studCenter, studCenter, studRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Stud Inner Shadow
    ctx.strokeStyle = 'rgba(0,0,0,0.08)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(studCenter, studCenter, studRadius - 4, 0, Math.PI * 2);
    ctx.stroke();

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(size, size);
    tex.anisotropy = 16; // Improved sharpness at grazing angles
    return tex;
  }, [theme, themeConfig.groundColor]);

  const groundGeo = useMemo(() => new THREE.PlaneGeometry(size, size), [size]);
  
  return (
    <group>
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.02, 0]} 
        receiveShadow
        geometry={groundGeo}
      >
        <meshStandardMaterial 
          color={themeConfig.groundColor} 
          roughness={theme === 'ocean' ? 0.2 : 0.8}
          metalness={theme === 'ocean' ? 0.3 : 0.1}
          map={texture}
          transparent={theme === 'ocean'}
          opacity={theme === 'ocean' ? 0.9 : 1.0}
        />
      </mesh>
      
      {/* Dynamic Visual Fog for depth */}
      <fog attach="fog" args={[themeConfig.fogColor, 20, 150]} />
    </group>
  );
};
