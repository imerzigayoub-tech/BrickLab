
import React, { useMemo } from 'react';
import * as THREE from 'three';
import * as BufferGeometryUtils from 'https://esm.sh/three/examples/jsm/utils/BufferGeometryUtils.js';
import { BRICK_METADATA, STUD_RADIUS, STUD_HEIGHT, SMALL_GAP, LEGO_COLORS, PLATE_HEIGHT } from '../constants';
import { BrickType } from '../types';

interface BrickProps {
  id?: string;
  type: BrickType;
  color: string;
  position: [number, number, number];
  rotation: number;
  isSelected?: boolean;
  isGhost?: boolean;
  isInvalid?: boolean;
  roughness?: number;
  metalness?: number;
}

const GEOMETRY_CACHE: Record<string, THREE.BufferGeometry> = {};
const MATERIAL_CACHE: Record<string, THREE.MeshStandardMaterial> = {};

const getMergedGeometry = (type: BrickType): THREE.BufferGeometry => {
  if (GEOMETRY_CACHE[type]) return GEOMETRY_CACHE[type];

  const metadata = BRICK_METADATA[type];
  if (!metadata) {
    const fallback = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    fallback.computeBoundingSphere();
    return fallback;
  }

  const { w, d, h, shape = 'box' } = metadata;
  const geometries: THREE.BufferGeometry[] = [];
  const radialSegments = 32;

  let bodyGeo: THREE.BufferGeometry | null = null;
  
  if (shape === 'cylinder') {
    bodyGeo = new THREE.CylinderGeometry((w / 2) - SMALL_GAP * 2, (w / 2) - SMALL_GAP * 2, h - SMALL_GAP, radialSegments);
    bodyGeo.translate(0, h / 2, 0);
  } else if (shape === 'cone') {
    bodyGeo = new THREE.CylinderGeometry(STUD_RADIUS, (w / 2) - SMALL_GAP * 2, h - SMALL_GAP, radialSegments);
    bodyGeo.translate(0, h / 2, 0);
  } else if (shape === 'grille') {
    bodyGeo = new THREE.BoxGeometry(w - SMALL_GAP * 2, h - SMALL_GAP, d - SMALL_GAP * 2);
    bodyGeo.translate(0, h / 2, 0);
    for (let i = 0; i < 5; i++) {
       const line = new THREE.BoxGeometry(w - SMALL_GAP, PLATE_HEIGHT * 0.15, (d / 7));
       line.translate(0, h + 0.02, -d/2 + (d/6) * (i + 1));
       geometries.push(line);
    }
  } else if (shape === 'ingot') {
    bodyGeo = new THREE.BoxGeometry(w - 0.1, h - 0.05, d - 0.1);
    bodyGeo.translate(0, h / 2, 0);
    const top = new THREE.BoxGeometry(w - 0.3, 0.05, d - 0.3);
    top.translate(0, h, 0);
    geometries.push(top);
  } else if (shape === 'bracket') {
    const horiz = new THREE.BoxGeometry(w - SMALL_GAP, PLATE_HEIGHT, d - SMALL_GAP);
    horiz.translate(0, PLATE_HEIGHT / 2, 0);
    const vert = new THREE.BoxGeometry(w - SMALL_GAP, h, 0.15);
    vert.translate(0, h / 2, d / 2 - 0.075);
    geometries.push(horiz, vert);
  } else if (shape === 'flower') {
    const flowerShape = new THREE.Shape();
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      flowerShape.absarc(Math.cos(angle) * 0.4, Math.sin(angle) * 0.4, 0.25, 0, Math.PI * 2, false);
    }
    bodyGeo = new THREE.ExtrudeGeometry(flowerShape, { depth: PLATE_HEIGHT - SMALL_GAP, bevelEnabled: false });
    bodyGeo.rotateX(Math.PI / 2);
    bodyGeo.translate(0, PLATE_HEIGHT, 0);
  } else if (shape === 'leaf') {
    const leafShape = new THREE.Shape();
    leafShape.moveTo(0, 0);
    leafShape.quadraticCurveTo(0.5, 0.5, 0, 1);
    leafShape.quadraticCurveTo(-0.5, 0.5, 0, 0);
    bodyGeo = new THREE.ExtrudeGeometry(leafShape, { depth: PLATE_HEIGHT - SMALL_GAP, bevelEnabled: false });
    bodyGeo.rotateX(Math.PI / 2);
    bodyGeo.scale(0.8, 1, 0.8);
    bodyGeo.translate(0, PLATE_HEIGHT, 0);
  } else if (shape === 'arch') {
    const topPlate = new THREE.BoxGeometry(w - SMALL_GAP, PLATE_HEIGHT, d - SMALL_GAP);
    topPlate.translate(0, h - PLATE_HEIGHT / 2, 0);
    const leg1 = new THREE.BoxGeometry(w/4, h - PLATE_HEIGHT, d - SMALL_GAP);
    leg1.translate(-w/2 + w/8, (h - PLATE_HEIGHT) / 2, 0);
    const leg2 = new THREE.BoxGeometry(w/4, h - PLATE_HEIGHT, d - SMALL_GAP);
    leg2.translate(w/2 - w/8, (h - PLATE_HEIGHT) / 2, 0);
    geometries.push(topPlate, leg1, leg2);
  } else if (shape === 'slope') {
    const s3d = new THREE.Shape();
    s3d.moveTo(-d/2, 0); s3d.lineTo(d/2, 0); s3d.lineTo(-d/2, h); s3d.lineTo(-d/2, 0);
    bodyGeo = new THREE.ExtrudeGeometry(s3d, { depth: w - SMALL_GAP, bevelEnabled: false });
    bodyGeo.rotateY(Math.PI / 2);
    bodyGeo.translate(0, 0, 0);
  } else if (shape === 'curved_slope') {
    const s3d = new THREE.Shape();
    s3d.moveTo(-d/2, 0); 
    s3d.lineTo(d/2, 0); 
    s3d.lineTo(d/2, h / 3); 
    s3d.quadraticCurveTo(d/2, h, -d/2, h);
    s3d.lineTo(-d/2, 0);
    bodyGeo = new THREE.ExtrudeGeometry(s3d, { depth: w - SMALL_GAP, bevelEnabled: false });
    bodyGeo.rotateY(Math.PI / 2);
  } else if (shape === 'inv_slope') {
    const s3d = new THREE.Shape();
    s3d.moveTo(-d/2, h); s3d.lineTo(d/2, h); s3d.lineTo(-d/2, 0); s3d.lineTo(-d/2, h);
    bodyGeo = new THREE.ExtrudeGeometry(s3d, { depth: w - SMALL_GAP, bevelEnabled: false });
    bodyGeo.rotateY(Math.PI / 2);
  } else if (shape === 'wedge_l') {
    const s3d = new THREE.Shape();
    s3d.moveTo(-w/2, -d/2); s3d.lineTo(w/2, -d/2); s3d.lineTo(w/2, d/4); s3d.lineTo(-w/2, d/2); s3d.lineTo(-w/2, -d/2);
    bodyGeo = new THREE.ExtrudeGeometry(s3d, { depth: h - SMALL_GAP, bevelEnabled: false });
    bodyGeo.rotateX(Math.PI / 2);
    bodyGeo.translate(0, h, 0);
  } else if (shape === 'wedge_r') {
    const s3d = new THREE.Shape();
    s3d.moveTo(-w/2, -d/2); s3d.lineTo(w/2, -d/2); s3d.lineTo(w/2, d/2); s3d.lineTo(-w/2, d/4); s3d.lineTo(-w/2, -d/2);
    bodyGeo = new THREE.ExtrudeGeometry(s3d, { depth: h - SMALL_GAP, bevelEnabled: false });
    bodyGeo.rotateX(Math.PI / 2);
    bodyGeo.translate(0, h, 0);
  } else {
    bodyGeo = new THREE.BoxGeometry(w - SMALL_GAP * 4, h - SMALL_GAP, d - SMALL_GAP * 4);
    bodyGeo.translate(0, h / 2, 0);
  }

  if (bodyGeo) {
    geometries.push(bodyGeo);
  }

  // Define shapes that SHOULD NOT have studs on top
  const NO_STUD_SHAPES = ['tile', 'grille', 'flower', 'leaf', 'ingot', 'curved_slope', 'slope', 'inv_slope', 'wedge_l', 'wedge_r'];
  
  if (!NO_STUD_SHAPES.includes(shape)) {
    const studGeoBase = new THREE.CylinderGeometry(STUD_RADIUS, STUD_RADIUS, STUD_HEIGHT, 16);
    for (let i = 0; i < w; i++) {
      for (let j = 0; j < d; j++) {
        const studX = i - (w - 1) / 2;
        const studZ = j - (d - 1) / 2;
        
        const s = studGeoBase.clone();
        s.translate(studX, h + STUD_HEIGHT / 2, studZ);
        geometries.push(s);
      }
    }
  }

  const processedGeometries = geometries.map(g => {
    const nonIndexed = g.toNonIndexed();
    nonIndexed.computeVertexNormals();
    return nonIndexed;
  });

  const merged = BufferGeometryUtils.mergeGeometries(processedGeometries);
  
  if (!merged) {
    const fallback = new THREE.BoxGeometry(w, h, d);
    fallback.translate(0, h / 2, 0);
    fallback.computeBoundingSphere();
    GEOMETRY_CACHE[type] = fallback;
    return fallback;
  }

  merged.computeBoundingSphere();
  GEOMETRY_CACHE[type] = merged;
  return merged;
};

const getMaterial = (color: string, isGhost: boolean, isInvalid: boolean, isSelected: boolean, r?: number, m?: number): THREE.MeshStandardMaterial => {
  const cacheKey = `${color}_${isGhost}_${isInvalid}_${isSelected}_${r}_${m}`;
  if (MATERIAL_CACHE[cacheKey]) return MATERIAL_CACHE[cacheKey];

  let baseColor = color.slice(0, 7);
  let alpha = color.length >= 9 ? parseInt(color.slice(7, 9), 16) / 255 : 1.0;
  
  const preset = LEGO_COLORS.find(c => c.hex.toLowerCase().startsWith(baseColor.toLowerCase()));

  const mat = new THREE.MeshStandardMaterial({
    color: isGhost ? (isInvalid ? '#ef4444' : baseColor) : baseColor,
    opacity: isGhost ? 0.35 : alpha,
    transparent: alpha < 0.99 || isGhost,
    roughness: r ?? (preset?.roughness ?? (alpha < 0.99 ? 0.05 : 0.15)),
    metalness: m ?? (preset?.metalness ?? (alpha < 0.99 ? 0.4 : 0.05)),
    emissive: isSelected ? '#3b82f6' : '#000000',
    emissiveIntensity: isSelected ? 0.4 : 0,
    envMapIntensity: 1.5,
  });

  MATERIAL_CACHE[cacheKey] = mat;
  return mat;
};

export const Brick: React.FC<BrickProps> = ({ type, color, position, rotation, isSelected, isGhost, isInvalid, roughness, metalness, id }) => {
  const metadata = BRICK_METADATA[type];
  if (!metadata) return null;

  const geo = useMemo(() => getMergedGeometry(type), [type]);
  const mat = useMemo(() => getMaterial(color, isGhost, !!isInvalid, !!isSelected, roughness, metalness), [color, isGhost, isInvalid, isSelected, roughness, metalness]);

  return (
    <group position={position} rotation={[0, rotation, 0]} userData={!isGhost ? { brickId: id } : undefined}>
      <mesh geometry={geo} material={mat} castShadow={!isGhost} receiveShadow={!isGhost} />
      {isSelected && (
        <mesh position={[0, metadata.h / 2, 0]}>
          <boxGeometry args={[metadata.w + 0.1, metadata.h + 0.1, metadata.d + 0.1]} />
          <meshBasicMaterial color="#3b82f6" wireframe transparent opacity={0.3} />
        </mesh>
      )}
    </group>
  );
};
