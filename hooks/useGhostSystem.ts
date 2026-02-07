
import { useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { BrickInstance, BrickType, SymmetryAxis, GhostPart } from '../types';
import { BRICK_METADATA, PLATE_HEIGHT } from '../constants';

export const useGhostSystem = (
    bricks: BrickInstance[],
    selectedType: BrickType,
    selectedColor: string,
    selectedRoughness: number,
    selectedMetalness: number,
    rotation: number,
    activeGhostParts: GhostPart[] | null,
    symmetryAxis: SymmetryAxis,
    isMovingSelection: boolean
) => {

    const [ghostPos, setGhostPos] = useState<[number, number, number]>([0, 0, 0]);
    const [mirroredGhostPos, setMirroredGhostPos] = useState<[number, number, number] | null>(null);
    const [mirroredRotation, setMirroredRotation] = useState<number>(0);
    const [isInvalid, setIsInvalid] = useState(false);
    const [isMirroredInvalid, setIsMirroredInvalid] = useState(false);

    const occupiedCells = useMemo(() => {
        const cells = new Set<string>();
        const movingIds = isMovingSelection ? (activeGhostParts?.map(p => p.id).filter(Boolean) as string[]) : [];

        bricks.forEach(brick => {
            if (movingIds.includes(brick.id)) return;

            const metadata = BRICK_METADATA[brick.type];
            if (!metadata) return;
            const { w: rawW, d: rawD, h } = metadata;
            const isSwapped = Math.round(brick.rotation / (Math.PI / 2)) % 2 !== 0;
            const w = isSwapped ? rawD : rawW;
            const d = isSwapped ? rawW : rawD;

            const xStart = Math.round(brick.position[0] - (w - 1) / 2);
            const zStart = Math.round(brick.position[2] - (d - 1) / 2);
            const yStart = Math.round(brick.position[1] / PLATE_HEIGHT);
            const heightInPlates = Math.round(h / PLATE_HEIGHT);

            for (let i = 0; i < w; i++) {
                for (let j = 0; j < d; j++) {
                    for (let k = 0; k < heightInPlates; k++) {
                        cells.add(`${xStart + i},${yStart + k},${zStart + j}`);
                    }
                }
            }
        });
        return cells;
    }, [bricks, isMovingSelection, activeGhostParts]);

    const checkCollision = useCallback((pos: [number, number, number], type: BrickType, rot: number) => {
        const metadata = BRICK_METADATA[type];
        if (!metadata) return false;
        const { w: rawW, d: rawD, h } = metadata;
        const isSwapped = Math.round(rot / (Math.PI / 2)) % 2 !== 0;
        const w = isSwapped ? rawD : rawW;
        const d = isSwapped ? rawW : rawD;

        const xStart = Math.round(pos[0] - (w - 1) / 2);
        const zStart = Math.round(pos[2] - (d - 1) / 2);
        const yStart = Math.round(pos[1] / PLATE_HEIGHT);
        const heightInPlates = Math.round(h / PLATE_HEIGHT);

        if (yStart < 0) return true;

        for (let i = 0; i < w; i++) {
            for (let j = 0; j < d; j++) {
                for (let k = 0; k < heightInPlates; k++) {
                    if (occupiedCells.has(`${xStart + i},${yStart + k},${zStart + j}`)) return true;
                }
            }
        }
        return false;
    }, [occupiedCells]);

    const getSnappedPosition = useCallback((point: THREE.Vector3, normal: THREE.Vector3, typeToSnap: BrickType, rotToSnap: number): [number, number, number] => {
        const metadata = BRICK_METADATA[typeToSnap];
        if (!metadata) return [0, 0, 0];

        const isSwapped = Math.round(rotToSnap / (Math.PI / 2)) % 2 !== 0;
        const w = isSwapped ? metadata.d : metadata.w;
        const d = isSwapped ? metadata.w : metadata.d;

        const offsetX = (w % 2 === 0) ? 0.5 : 0;
        const offsetZ = (d % 2 === 0) ? 0.5 : 0;

        const target = point.clone().add(normal.clone().multiplyScalar(0.02));

        const snapX = Math.round(target.x - offsetX) + offsetX;
        const snapZ = Math.round(target.z - offsetZ) + offsetZ;

        let snapY = 0;
        if (normal.y > 0.5) {
            snapY = Math.round(point.y / PLATE_HEIGHT) * PLATE_HEIGHT;
        } else if (Math.abs(normal.y) < 0.5) {
            snapY = Math.floor(target.y / PLATE_HEIGHT) * PLATE_HEIGHT;
        } else {
            snapY = Math.ceil(target.y / PLATE_HEIGHT) * PLATE_HEIGHT;
        }

        return [snapX, Math.max(0, snapY), snapZ];
    }, []);

    const calculateMirroredState = useCallback((pos: [number, number, number], rot: number, type: BrickType): { pos: [number, number, number], rot: number } | null => {
        if (symmetryAxis === 'none') return null;

        const metadata = BRICK_METADATA[type];
        if (!metadata) return null;

        let mirroredPos = [...pos] as [number, number, number];
        let mirroredRot = rot;

        if (symmetryAxis === 'X') {
            mirroredPos[0] = -pos[0];
            mirroredRot = -rot;
        } else if (symmetryAxis === 'Z') {
            mirroredPos[2] = -pos[2];
            mirroredRot = Math.PI - rot;
        }

        const reSnapped = getSnappedPosition(new THREE.Vector3(...mirroredPos), new THREE.Vector3(0, 1, 0), type, mirroredRot);

        return { pos: reSnapped, rot: mirroredRot };
    }, [symmetryAxis, getSnappedPosition]);

    return {
        ghostPos,
        setGhostPos,
        mirroredGhostPos,
        setMirroredGhostPos,
        mirroredRotation,
        setMirroredRotation,
        isInvalid,
        setIsInvalid,
        isMirroredInvalid,
        setIsMirroredInvalid,
        occupiedCells,
        checkCollision,
        getSnappedPosition,
        calculateMirroredState
    };
};
