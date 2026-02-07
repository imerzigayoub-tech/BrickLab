
import { useState, useCallback } from 'react';
import { BrickInstance } from '../types';

export const useSelection = (bricks: BrickInstance[], saveToHistory: (state: BrickInstance[]) => void) => {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const updateBrickProperties = useCallback((ids: string[], updates: Partial<BrickInstance>) => {
        const next = bricks.map(b => ids.includes(b.id) ? { ...b, ...updates } : b);
        saveToHistory(next);
        return next;
    }, [bricks, saveToHistory]);

    const removeBricks = useCallback((ids: string[]) => {
        const next = bricks.filter(b => !ids.includes(b.id));
        saveToHistory(next);
        setSelectedIds([]);
        return next;
    }, [bricks, saveToHistory]);

    const groupSelectedBricks = useCallback(() => {
        if (selectedIds.length < 2) return;
        const groupId = Math.random().toString(36).substr(2, 9);
        const next = bricks.map(b =>
            selectedIds.includes(b.id) ? { ...b, groupId } : b
        );
        saveToHistory(next);
        return next;
    }, [bricks, selectedIds, saveToHistory]);

    const ungroupSelectedBricks = useCallback(() => {
        if (selectedIds.length === 0) return;
        const next = bricks.map(b =>
            selectedIds.includes(b.id) ? { ...b, groupId: undefined } : b
        );
        saveToHistory(next);
        return next;
    }, [bricks, selectedIds, saveToHistory]);

    const mirrorSelection = useCallback((axis: 'X' | 'Z') => {
        if (selectedIds.length === 0) return;
        const selection = bricks.filter(b => selectedIds.includes(b.id));
        if (selection.length === 0) return;

        // Find center of selection to flip around it
        let centerX = 0, centerZ = 0;
        selection.forEach(b => {
            centerX += b.position[0];
            centerZ += b.position[2];
        });
        centerX /= selection.length;
        centerZ /= selection.length;

        const next = bricks.map(b => {
            if (!selectedIds.includes(b.id)) return b;

            const pos = [...b.position] as [number, number, number];
            let rot = b.rotation;

            if (axis === 'X') {
                pos[0] = centerX - (b.position[0] - centerX);
                rot = -b.rotation;
            } else {
                pos[2] = centerZ - (b.position[2] - centerZ);
                rot = Math.PI - b.rotation;
            }

            return { ...b, position: pos, rotation: rot };
        });
        saveToHistory(next);
        return next;
    }, [bricks, selectedIds, saveToHistory]);

    return {
        selectedIds,
        setSelectedIds,
        updateBrickProperties,
        removeBricks,
        groupSelectedBricks,
        ungroupSelectedBricks,
        mirrorSelection
    };
};
