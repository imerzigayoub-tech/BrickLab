
import { useState, useCallback, useEffect } from 'react';
import { BrickInstance } from '../types';

const SAVE_KEY = 'lego-studio-3d-v1-save';

export const useHistory = (initialBricks: BrickInstance[] = []) => {
    const [bricks, setBricks] = useState<BrickInstance[]>(initialBricks);
    const [history, setHistory] = useState<BrickInstance[][]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [isSaved, setIsSaved] = useState(true);

    const saveToHistory = useCallback((newState: BrickInstance[]) => {
        setHistory(prev => {
            const newHistory = prev.slice(0, historyIndex + 1);
            newHistory.push([...newState]);
            if (newHistory.length > 50) newHistory.shift();
            return newHistory;
        });
        setHistoryIndex(prev => prev + 1);
        setIsSaved(false);
    }, [historyIndex]);

    const undo = useCallback(() => {
        if (historyIndex > 0) {
            const prevIndex = historyIndex - 1;
            setBricks(history[prevIndex]);
            setHistoryIndex(prevIndex);
            setIsSaved(false);
            return history[prevIndex];
        } else if (historyIndex === 0) {
            setBricks([]);
            setHistoryIndex(-1);
            setIsSaved(false);
            return [];
        }
        return null;
    }, [history, historyIndex]);

    const redo = useCallback(() => {
        if (historyIndex < history.length - 1) {
            const nextIndex = historyIndex + 1;
            setBricks(history[nextIndex]);
            setHistoryIndex(nextIndex);
            setIsSaved(false);
            return history[nextIndex];
        }
        return null;
    }, [history, historyIndex]);

    const saveProject = useCallback(() => {
        try {
            localStorage.setItem(SAVE_KEY, JSON.stringify(bricks));
            setIsSaved(true);
        } catch (e) {
            console.error("Failed to save project:", e);
            alert("Storage full or unavailable. Could not save project.");
        }
    }, [bricks]);

    const loadProject = useCallback(() => {
        const saved = localStorage.getItem(SAVE_KEY);
        if (saved) {
            try {
                const parsedBricks = JSON.parse(saved);
                setBricks(parsedBricks);
                setHistory([parsedBricks]);
                setHistoryIndex(0);
                setIsSaved(true);
                return parsedBricks;
            } catch (e) {
                console.error("Failed to parse saved project:", e);
            }
        }
        return null;
    }, []);

    const clearProject = useCallback(() => {
        setBricks([]);
        setHistory([]);
        setHistoryIndex(-1);
        localStorage.removeItem(SAVE_KEY);
        setIsSaved(true);
    }, []);

    return {
        bricks,
        setBricks,
        history,
        historyIndex,
        isSaved,
        setIsSaved,
        saveToHistory,
        undo,
        redo,
        saveProject,
        loadProject,
        clearProject
    };
};
