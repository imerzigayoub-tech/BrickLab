
import React, { useCallback, useRef, useEffect, useState } from 'react';
import { ThreeEvent, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Brick } from './Brick';
import { Ground } from './Ground';
import { BrickInstance, BrickType, SymmetryAxis, WorldTheme, GhostPart } from '../types';
import { PLATE_HEIGHT } from '../constants';
import { useGhostSystem } from '../hooks/useGhostSystem';

interface SceneProps {
  bricks: BrickInstance[];
  addBrick: (brick: Omit<BrickInstance, 'id'>) => void;
  addBricks: (bricks: Omit<BrickInstance, 'id'>[]) => void;
  finishMovingBricks: (movedData: { id: string, position: [number, number, number], rotation: number }[]) => void;
  selectedType: BrickType;
  selectedColor: string;
  selectedRoughness: number;
  selectedMetalness: number;
  rotation: number;
  setRotation: (r: number | ((prev: number) => number)) => void;
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
  activeGhostParts: GhostPart[] | null;
  setActiveGhostParts: (parts: GhostPart[] | null) => void;
  isMovingSelection: boolean;
  symmetryAxis: SymmetryAxis;
  setSelectionBoxUI: (box: { start: { x: number, y: number }, end: { x: number, y: number } } | null) => void;
  worldTheme: WorldTheme;
}

const SnapPoints: React.FC = React.memo(() => {
  const size = 64;
  const count = size * size;
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const dotGeo = React.useMemo(() => new THREE.CircleGeometry(0.04, 8), []);
  const dotMat = React.useMemo(() => new THREE.MeshBasicMaterial({
    color: '#ffffff',
    transparent: true,
    opacity: 0.15,
    depthWrite: false
  }), []);

  useEffect(() => {
    if (!meshRef.current) return;
    const matrix = new THREE.Matrix4();
    let idx = 0;
    const half = size / 2;
    for (let x = 0; x < size; x++) {
      for (let z = 0; z < size; z++) {
        matrix.setPosition(x - half + 0.5, 0.001, z - half + 0.5);
        matrix.makeRotationX(-Math.PI / 2);
        meshRef.current.setMatrixAt(idx++, matrix);
      }
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, []);

  return <instancedMesh ref={meshRef} args={[dotGeo, dotMat, count]} frustumCulled={false} />;
});

const SymmetryPlane: React.FC<{ axis: SymmetryAxis }> = React.memo(({ axis }) => {
  if (axis === 'none') return null;
  return (
    <group>
      <mesh
        rotation={axis === 'X' ? [0, Math.PI / 2, 0] : [0, 0, 0]}
        position={[0, 15, 0]}
      >
        <planeGeometry args={[200, 30]} />
        <meshBasicMaterial
          color="#3b82f6"
          transparent
          opacity={0.03}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <gridHelper args={[128, 64, 0x3b82f6, 0x3b82f6]} rotation={axis === 'X' ? [0, 0, Math.PI / 2] : [Math.PI / 2, 0, 0]} position={[0, 15, 0]} />
    </group>
  );
});

const SnapIndicator: React.FC<{ position: [number, number, number]; color: string; isInvalid: boolean }> = React.memo(({ position, color, isInvalid }) => {
  const ringGeo = React.useMemo(() => {
    const geo = new THREE.RingGeometry(0.42, 0.48, 32);
    geo.computeBoundingSphere();
    return geo;
  }, []);

  const ringMat = React.useMemo(() => new THREE.MeshBasicMaterial({
    color: isInvalid ? '#ef4444' : color,
    transparent: true,
    opacity: 0.9,
    side: THREE.DoubleSide,
    depthWrite: false
  }), [color, isInvalid]);

  return (
    <mesh position={[position[0], position[1] + 0.01, position[2]]} rotation={[-Math.PI / 2, 0, 0]} geometry={ringGeo} material={ringMat} />
  );
});

export const Scene: React.FC<SceneProps> = ({
  bricks, addBricks, finishMovingBricks, selectedType, selectedColor, selectedRoughness, selectedMetalness, rotation, selectedIds, setSelectedIds, activeGhostParts, isMovingSelection, symmetryAxis, setSelectionBoxUI, worldTheme
}) => {
  const { raycaster, camera, mouse, gl } = useThree();

  // Throttle state for performance optimization (Issue 2.1)
  const lastUpdateTimeRef = useRef(0);
  const THROTTLE_MS = 16; // ~60fps cap for ghost updates

  const ghostSystem = useGhostSystem(
    bricks,
    selectedType,
    selectedColor,
    selectedRoughness,
    selectedMetalness,
    rotation,
    activeGhostParts,
    symmetryAxis,
    isMovingSelection
  );

  const physicalBricksRef = useRef<THREE.Group>(null);
  const floorRef = useRef<THREE.Mesh>(null);
  const groundPlane = React.useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);

  const dragStartRef = useRef<{ x: number, y: number } | null>(null);
  const isDraggingRef = useRef(false);

  const updateGhost = useCallback(() => {
    // Throttle updates for performance (Issue 2.1)
    const now = performance.now();
    if (now - lastUpdateTimeRef.current < THROTTLE_MS) return;
    lastUpdateTimeRef.current = now;

    raycaster.setFromCamera(mouse, camera);
    const targets: THREE.Object3D[] = [];
    if (floorRef.current) targets.push(floorRef.current);
    if (physicalBricksRef.current) {
      physicalBricksRef.current.children.forEach(child => {
        if (child instanceof THREE.Mesh && child.geometry) {
          targets.push(child);
        } else if (child instanceof THREE.Group) {
          targets.push(child);
        }
      });
    }

    const hits = raycaster.intersectObjects(targets, true);
    let snapped: [number, number, number];

    const anchorType = activeGhostParts ? activeGhostParts[0].type : selectedType;
    const anchorRot = activeGhostParts ? activeGhostParts[0].rotation + rotation : rotation;

    if (hits.length > 0) {
      const hit = hits[0];
      const worldNormal = hit.face ? hit.face.normal.clone().applyQuaternion(hit.object.getWorldQuaternion(new THREE.Quaternion())).normalize() : new THREE.Vector3(0, 1, 0);
      snapped = ghostSystem.getSnappedPosition(hit.point, worldNormal, anchorType, anchorRot);
    } else {
      const intersectPoint = new THREE.Vector3();
      raycaster.ray.intersectPlane(groundPlane, intersectPoint);
      snapped = ghostSystem.getSnappedPosition(intersectPoint, new THREE.Vector3(0, 1, 0), anchorType, anchorRot);
    }

    const hasCollisionAt = (pos: [number, number, number], rot: number, parts: GhostPart[] | null) => {
      if (parts) {
        return parts.some(part => {
          const partPos: [number, number, number] = [
            pos[0] + part.offset[0],
            pos[1] + part.offset[1],
            pos[2] + part.offset[2]
          ];
          return ghostSystem.checkCollision(partPos, part.type, part.rotation + rot - rotation);
        });
      }
      return ghostSystem.checkCollision(pos, selectedType, rot);
    };

    const resolveStacking = (startPos: [number, number, number], rot: number) => {
      let finalPos = [...startPos] as [number, number, number];
      let attempts = 0;
      const maxAttempts = 50;
      const currentParts = activeGhostParts;

      while (hasCollisionAt(finalPos, rot, currentParts) && attempts < maxAttempts) {
        finalPos[1] += PLATE_HEIGHT;
        attempts++;
      }
      return { pos: finalPos, invalid: attempts === maxAttempts || hasCollisionAt(finalPos, rot, currentParts) };
    };

    const mainResolved = resolveStacking(snapped, rotation);
    ghostSystem.setGhostPos(mainResolved.pos);
    ghostSystem.setIsInvalid(mainResolved.invalid);

    const mirrored = ghostSystem.calculateMirroredState(mainResolved.pos, rotation, anchorType);
    if (mirrored) {
      const mirResolved = resolveStacking(mirrored.pos, mirrored.rot);
      ghostSystem.setMirroredGhostPos(mirResolved.pos);
      ghostSystem.setMirroredRotation(mirrored.rot);
      ghostSystem.setIsMirroredInvalid(mirResolved.invalid);
    } else {
      ghostSystem.setMirroredGhostPos(null);
    }
  }, [raycaster, camera, mouse, selectedType, rotation, groundPlane, activeGhostParts, symmetryAxis, ghostSystem]);

  const performBoxSelection = useCallback((start: { x: number, y: number }, end: { x: number, y: number }, additive: boolean) => {
    const left = Math.min(start.x, end.x);
    const top = Math.min(start.y, end.y);
    const right = Math.max(start.x, end.x);
    const bottom = Math.max(start.y, end.y);

    const newlySelected: string[] = [];
    const tempVec = new THREE.Vector3();

    bricks.forEach(brick => {
      tempVec.set(brick.position[0], brick.position[1], brick.position[2]);
      tempVec.project(camera);
      const px = (tempVec.x + 1) * gl.domElement.clientWidth / 2;
      const py = (-tempVec.y + 1) * gl.domElement.clientHeight / 2;
      if (px >= left && px <= right && py >= top && py <= bottom) {
        newlySelected.push(brick.id);
      }
    });

    if (additive) {
      const unique = new Set([...selectedIds, ...newlySelected]);
      setSelectedIds(Array.from(unique));
    } else {
      setSelectedIds(newlySelected);
    }
  }, [bricks, camera, gl, selectedIds, setSelectedIds]);

  const onPointerDown = useCallback((e: ThreeEvent<PointerEvent>) => {
    if (e.button === 0) {
      dragStartRef.current = { x: e.clientX, y: e.clientY };
      isDraggingRef.current = false;
      return;
    }

    if (e.button === 2) {
      if (physicalBricksRef.current) {
        const hits = raycaster.intersectObjects(physicalBricksRef.current.children, true);
        if (hits.length > 0) {
          let current: THREE.Object3D | null = hits[0].object;
          while (current && !current.userData.brickId) current = current.parent;

          if (current?.userData.brickId) {
            const brickId = current.userData.brickId;
            const clickedBrick = bricks.find(b => b.id === brickId);
            let groupIds = [brickId];
            if (clickedBrick?.groupId) groupIds = bricks.filter(b => b.groupId === clickedBrick.groupId).map(b => b.id);

            if (e.shiftKey) {
              const isAlreadySelected = selectedIds.includes(brickId);
              if (isAlreadySelected) setSelectedIds(selectedIds.filter(id => !groupIds.includes(id)));
              else setSelectedIds([...selectedIds, ...groupIds]);
            } else {
              setSelectedIds(groupIds);
            }
          } else setSelectedIds([]);
        } else setSelectedIds([]);
      }
    }
  }, [bricks, raycaster, selectedIds, setSelectedIds]);

  const onPointerMove = useCallback((e: ThreeEvent<PointerEvent>) => {
    if (dragStartRef.current) {
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      if (Math.sqrt(dx * dx + dy * dy) > 5) {
        isDraggingRef.current = true;
        setSelectionBoxUI({ start: dragStartRef.current, end: { x: e.clientX, y: e.clientY } });
      }
    }
  }, [setSelectionBoxUI]);

  const onPointerUp = useCallback((e: ThreeEvent<PointerEvent>) => {
    if (e.button !== 0) return;

    if (isDraggingRef.current && dragStartRef.current) {
      performBoxSelection(dragStartRef.current, { x: e.clientX, y: e.clientY }, e.shiftKey);
    } else if (dragStartRef.current) {
      if (!ghostSystem.isInvalid) {
        if (isMovingSelection && activeGhostParts) {
          const movedData = activeGhostParts.map(part => ({
            id: part.id as string,
            position: [
              ghostSystem.ghostPos[0] + part.offset[0],
              ghostSystem.ghostPos[1] + part.offset[1],
              ghostSystem.ghostPos[2] + part.offset[2]
            ] as [number, number, number],
            rotation: part.rotation + rotation
          }));
          finishMovingBricks(movedData);
        } else {
          const newPartsToPlace: Omit<BrickInstance, 'id'>[] = [];
          if (activeGhostParts) {
            const mainGroup = activeGhostParts.map(part => ({
              type: part.type,
              color: part.color,
              position: [
                ghostSystem.ghostPos[0] + part.offset[0],
                ghostSystem.ghostPos[1] + part.offset[1],
                ghostSystem.ghostPos[2] + part.offset[2]
              ] as [number, number, number],
              rotation: part.rotation + rotation,
              roughness: part.roughness ?? selectedRoughness,
              metalness: part.metalness ?? selectedMetalness
            }));
            newPartsToPlace.push(...mainGroup);

            if (ghostSystem.mirroredGhostPos) {
              const mirroredGroup = activeGhostParts.map(part => {
                const mir = ghostSystem.calculateMirroredState([part.offset[0], part.offset[1], part.offset[2]], part.rotation, part.type);
                return {
                  type: part.type,
                  color: part.color,
                  position: [
                    ghostSystem.mirroredGhostPos![0] + (mir?.pos[0] || 0),
                    ghostSystem.mirroredGhostPos![1] + (mir?.pos[1] || 0),
                    ghostSystem.mirroredGhostPos![2] + (mir?.pos[2] || 0)
                  ] as [number, number, number],
                  rotation: (mir?.rot || 0) + ghostSystem.mirroredRotation,
                  roughness: part.roughness ?? selectedRoughness,
                  metalness: part.metalness ?? selectedMetalness
                };
              });
              newPartsToPlace.push(...mirroredGroup);
            }
          } else {
            newPartsToPlace.push({ type: selectedType, color: selectedColor, position: ghostSystem.ghostPos, rotation: rotation, roughness: selectedRoughness, metalness: selectedMetalness });
            if (ghostSystem.mirroredGhostPos) {
              newPartsToPlace.push({ type: selectedType, color: selectedColor, position: ghostSystem.mirroredGhostPos, rotation: ghostSystem.mirroredRotation, roughness: selectedRoughness, metalness: selectedMetalness });
            }
          }
          addBricks(newPartsToPlace);
        }
      }
    }

    dragStartRef.current = null;
    isDraggingRef.current = false;
    setSelectionBoxUI(null);
  }, [activeGhostParts, addBricks, finishMovingBricks, ghostSystem, isMovingSelection, performBoxSelection, rotation, selectedColor, selectedMetalness, selectedRoughness, selectedType, setSelectionBoxUI]);

  useEffect(() => {
    let raf: number;
    const loop = () => {
      updateGhost();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [updateGhost]);

  const movingIds = isMovingSelection ? (activeGhostParts?.map(p => p.id).filter(Boolean) as string[]) : [];

  return (
    <group onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}>
      <SnapPoints />
      <SymmetryPlane axis={symmetryAxis} />

      {!isDraggingRef.current && (
        <>
          <SnapIndicator position={ghostSystem.ghostPos} color={selectedColor} isInvalid={ghostSystem.isInvalid} />
          {ghostSystem.mirroredGhostPos && (
            <SnapIndicator position={ghostSystem.mirroredGhostPos} color={selectedColor} isInvalid={ghostSystem.isMirroredInvalid} />
          )}
        </>
      )}

      <Ground theme={worldTheme} />
      <mesh ref={floorRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[2000, 2000]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>

      <group ref={physicalBricksRef}>
        {bricks.map((brick) => (
          !movingIds.includes(brick.id) && (
            <Brick key={brick.id} {...brick} isSelected={selectedIds.includes(brick.id)} />
          )
        ))}
      </group>

      {!isDraggingRef.current && (
        activeGhostParts ? (
          <>
            <group position={ghostSystem.ghostPos}>
              {activeGhostParts.map((part, i) => (
                <Brick
                  key={i}
                  type={part.type}
                  color={part.color}
                  position={part.offset}
                  rotation={part.rotation + rotation}
                  roughness={part.roughness ?? selectedRoughness}
                  metalness={part.metalness ?? selectedMetalness}
                  isGhost
                  isInvalid={ghostSystem.isInvalid}
                />
              ))}
            </group>
            {ghostSystem.mirroredGhostPos && (
              <group position={ghostSystem.mirroredGhostPos}>
                {activeGhostParts.map((part, i) => {
                  const mir = ghostSystem.calculateMirroredState([part.offset[0], part.offset[1], part.offset[2]], part.rotation, part.type);
                  return (
                    <Brick
                      key={`mir-${i}`}
                      type={part.type}
                      color={part.color}
                      position={mir?.pos || part.offset}
                      rotation={(mir?.rot || 0) + ghostSystem.mirroredRotation}
                      roughness={part.roughness ?? selectedRoughness}
                      metalness={part.metalness ?? selectedMetalness}
                      isGhost
                      isInvalid={ghostSystem.isMirroredInvalid}
                    />
                  );
                })}
              </group>
            )}
          </>
        ) : (
          <>
            <Brick type={selectedType} color={selectedColor} position={ghostSystem.ghostPos} rotation={rotation} isGhost isInvalid={ghostSystem.isInvalid} roughness={selectedRoughness} metalness={selectedMetalness} />
            {ghostSystem.mirroredGhostPos && (
              <Brick type={selectedType} color={selectedColor} position={ghostSystem.mirroredGhostPos} rotation={ghostSystem.mirroredRotation} isGhost isInvalid={ghostSystem.isMirroredInvalid} roughness={selectedRoughness} metalness={selectedMetalness} />
            )}
          </>
        )
      )}
    </group>
  );
};
