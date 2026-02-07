import { useReducer, useCallback, useRef, useMemo } from 'react';
import { BrickInstance, BrickType, SymmetryAxis, WorldTheme, GhostPart } from '../types';
import { LEGO_COLORS } from '../constants';

// Storage keys
const SAVE_KEY = 'lego-studio-3d-v1-save';
const SEEN_INSTRUCTIONS_KEY = 'bricklab-seen-instructions';

// State interface - all app state in one place
interface EditorState {
    // Core data
    bricks: BrickInstance[];
    history: BrickInstance[][];
    historyIndex: number;
    isSaved: boolean;

    // Selection
    selectedIds: string[];

    // Tool settings
    selectedColor: string;
    selectedType: BrickType;
    selectedRoughness: number;
    selectedMetalness: number;
    rotation: number;
    symmetryAxis: SymmetryAxis;
    worldTheme: WorldTheme;

    // Ghost/placement state
    activeGhostParts: GhostPart[] | null;
    isMovingSelection: boolean;

    // UI state
    showInstructions: boolean;
    selectionBox: { start: { x: number; y: number }; end: { x: number; y: number } } | null;
}

// Action types
type EditorAction =
    | { type: 'SET_BRICKS'; payload: BrickInstance[] }
    | { type: 'SAVE_TO_HISTORY'; payload: BrickInstance[] }
    | { type: 'UNDO' }
    | { type: 'REDO' }
    | { type: 'CLEAR_PROJECT' }
    | { type: 'LOAD_PROJECT'; payload: BrickInstance[] }
    | { type: 'MARK_SAVED' }
    | { type: 'SET_SELECTED_IDS'; payload: string[] }
    | { type: 'SET_TOOL_SETTINGS'; payload: Partial<Pick<EditorState, 'selectedColor' | 'selectedType' | 'selectedRoughness' | 'selectedMetalness' | 'rotation' | 'symmetryAxis' | 'worldTheme'>> }
    | { type: 'ROTATE' }
    | { type: 'SET_GHOST_PARTS'; payload: GhostPart[] | null }
    | { type: 'SET_MOVING_SELECTION'; payload: boolean }
    | { type: 'SET_SELECTION_BOX'; payload: EditorState['selectionBox'] }
    | { type: 'TOGGLE_INSTRUCTIONS'; payload?: boolean }
    | { type: 'ESCAPE_ALL' };

// Initial state factory
const createInitialState = (): EditorState => ({
    bricks: [],
    history: [],
    historyIndex: -1,
    isSaved: true,
    selectedIds: [],
    selectedColor: LEGO_COLORS[0].hex,
    selectedType: '2x2',
    selectedRoughness: 0.2,
    selectedMetalness: 0.1,
    rotation: 0,
    symmetryAxis: 'none',
    worldTheme: 'studio',
    activeGhostParts: null,
    isMovingSelection: false,
    showInstructions: !localStorage.getItem(SEEN_INSTRUCTIONS_KEY),
    selectionBox: null,
});

// Reducer - all state transitions in one place
function editorReducer(state: EditorState, action: EditorAction): EditorState {
    switch (action.type) {
        case 'SET_BRICKS':
            return { ...state, bricks: action.payload };

        case 'SAVE_TO_HISTORY': {
            const newHistory = state.history.slice(0, state.historyIndex + 1);
            newHistory.push([...action.payload]);
            if (newHistory.length > 50) newHistory.shift();
            return {
                ...state,
                bricks: action.payload,
                history: newHistory,
                historyIndex: Math.min(newHistory.length - 1, state.historyIndex + 1),
                isSaved: false,
            };
        }

        case 'UNDO': {
            if (state.historyIndex > 0) {
                const prevIndex = state.historyIndex - 1;
                return { ...state, bricks: state.history[prevIndex], historyIndex: prevIndex, isSaved: false };
            } else if (state.historyIndex === 0) {
                return { ...state, bricks: [], historyIndex: -1, isSaved: false };
            }
            return state;
        }

        case 'REDO': {
            if (state.historyIndex < state.history.length - 1) {
                const nextIndex = state.historyIndex + 1;
                return { ...state, bricks: state.history[nextIndex], historyIndex: nextIndex, isSaved: false };
            }
            return state;
        }

        case 'CLEAR_PROJECT':
            localStorage.removeItem(SAVE_KEY);
            return { ...state, bricks: [], history: [], historyIndex: -1, isSaved: true, selectedIds: [], activeGhostParts: null, isMovingSelection: false };

        case 'LOAD_PROJECT':
            return { ...state, bricks: action.payload, history: [action.payload], historyIndex: 0, isSaved: true };

        case 'MARK_SAVED':
            return { ...state, isSaved: true };

        case 'SET_SELECTED_IDS':
            return { ...state, selectedIds: action.payload };

        case 'SET_TOOL_SETTINGS':
            return { ...state, ...action.payload };

        case 'ROTATE':
            return { ...state, rotation: (state.rotation + Math.PI / 2) % (Math.PI * 2) };

        case 'SET_GHOST_PARTS':
            return { ...state, activeGhostParts: action.payload };

        case 'SET_MOVING_SELECTION':
            return { ...state, isMovingSelection: action.payload };

        case 'SET_SELECTION_BOX':
            return { ...state, selectionBox: action.payload };

        case 'TOGGLE_INSTRUCTIONS': {
            const show = action.payload !== undefined ? action.payload : !state.showInstructions;
            if (show && !localStorage.getItem(SEEN_INSTRUCTIONS_KEY)) {
                localStorage.setItem(SEEN_INSTRUCTIONS_KEY, 'true');
            }
            return { ...state, showInstructions: show };
        }

        case 'ESCAPE_ALL':
            return { ...state, selectedIds: [], activeGhostParts: null, isMovingSelection: false };

        default:
            return state;
    }
}

// Main hook
export function useBrickEditor() {
    const [state, dispatch] = useReducer(editorReducer, null, createInitialState);
    const orbitControlsRef = useRef<any>(null);

    // Derived state
    const canUndo = state.historyIndex >= 0;
    const canRedo = state.historyIndex < state.history.length - 1;

    // Actions
    const saveToHistory = useCallback((bricks: BrickInstance[]) => {
        dispatch({ type: 'SAVE_TO_HISTORY', payload: bricks });
    }, []);

    const undo = useCallback(() => {
        dispatch({ type: 'UNDO' });
    }, []);

    const redo = useCallback(() => {
        dispatch({ type: 'REDO' });
    }, []);

    const saveProject = useCallback(() => {
        try {
            localStorage.setItem(SAVE_KEY, JSON.stringify(state.bricks));
            dispatch({ type: 'MARK_SAVED' });
        } catch (e) {
            console.error('Failed to save project:', e);
            alert('Storage full or unavailable. Could not save project.');
        }
    }, [state.bricks]);

    const loadProject = useCallback(() => {
        const saved = localStorage.getItem(SAVE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                dispatch({ type: 'LOAD_PROJECT', payload: parsed });
                return parsed;
            } catch (e) {
                console.error('Failed to parse saved project:', e);
            }
        }
        return null;
    }, []);

    const clearProject = useCallback(() => {
        if (window.confirm('ARE YOU SURE? This will permanently delete every brick on your canvas and clear your history.')) {
            dispatch({ type: 'CLEAR_PROJECT' });
        }
    }, []);

    const addBricks = useCallback((newBricksData: Omit<BrickInstance, 'id'>[]) => {
        const newBricks = newBricksData.map(b => ({
            ...b,
            id: Math.random().toString(36).substr(2, 9),
            roughness: b.roughness ?? state.selectedRoughness,
            metalness: b.metalness ?? state.selectedMetalness,
        }));
        const next = [...state.bricks, ...newBricks];
        dispatch({ type: 'SAVE_TO_HISTORY', payload: next });
        dispatch({ type: 'SET_SELECTED_IDS', payload: [] });
        dispatch({ type: 'SET_GHOST_PARTS', payload: null });
        dispatch({ type: 'SET_MOVING_SELECTION', payload: false });
    }, [state.bricks, state.selectedRoughness, state.selectedMetalness]);

    const finishMovingBricks = useCallback((movedData: { id: string; position: [number, number, number]; rotation: number }[]) => {
        const next = state.bricks.map(b => {
            const moved = movedData.find(m => m.id === b.id);
            return moved ? { ...b, position: moved.position, rotation: moved.rotation } : b;
        });
        dispatch({ type: 'SAVE_TO_HISTORY', payload: next });
        dispatch({ type: 'SET_SELECTED_IDS', payload: [] });
        dispatch({ type: 'SET_GHOST_PARTS', payload: null });
        dispatch({ type: 'SET_MOVING_SELECTION', payload: false });
    }, [state.bricks]);

    const updateBrickProperties = useCallback((ids: string[], updates: Partial<BrickInstance>) => {
        const next = state.bricks.map(b => ids.includes(b.id) ? { ...b, ...updates } : b);
        dispatch({ type: 'SAVE_TO_HISTORY', payload: next });
        return next;
    }, [state.bricks]);

    const removeBricks = useCallback((ids: string[]) => {
        const next = state.bricks.filter(b => !ids.includes(b.id));
        dispatch({ type: 'SAVE_TO_HISTORY', payload: next });
        dispatch({ type: 'SET_SELECTED_IDS', payload: [] });
        return next;
    }, [state.bricks]);

    const groupSelectedBricks = useCallback(() => {
        if (state.selectedIds.length < 2) return;
        const groupId = Math.random().toString(36).substr(2, 9);
        const next = state.bricks.map(b => state.selectedIds.includes(b.id) ? { ...b, groupId } : b);
        dispatch({ type: 'SAVE_TO_HISTORY', payload: next });
    }, [state.bricks, state.selectedIds]);

    const ungroupSelectedBricks = useCallback(() => {
        if (state.selectedIds.length === 0) return;
        const next = state.bricks.map(b => state.selectedIds.includes(b.id) ? { ...b, groupId: undefined } : b);
        dispatch({ type: 'SAVE_TO_HISTORY', payload: next });
    }, [state.bricks, state.selectedIds]);

    const mirrorSelection = useCallback((axis: 'X' | 'Z') => {
        if (state.selectedIds.length === 0) return;
        const selection = state.bricks.filter(b => state.selectedIds.includes(b.id));
        if (selection.length === 0) return;

        let centerX = 0, centerZ = 0;
        selection.forEach(b => { centerX += b.position[0]; centerZ += b.position[2]; });
        centerX /= selection.length;
        centerZ /= selection.length;

        const next = state.bricks.map(b => {
            if (!state.selectedIds.includes(b.id)) return b;
            const pos = [...b.position] as [number, number, number];
            let rot = b.rotation;
            if (axis === 'X') { pos[0] = centerX - (b.position[0] - centerX); rot = -b.rotation; }
            else { pos[2] = centerZ - (b.position[2] - centerZ); rot = Math.PI - b.rotation; }
            return { ...b, position: pos, rotation: rot };
        });
        dispatch({ type: 'SAVE_TO_HISTORY', payload: next });
    }, [state.bricks, state.selectedIds]);

    const startCloning = useCallback(() => {
        if (state.selectedIds.length === 0) return;
        const selection = state.bricks.filter(b => state.selectedIds.includes(b.id));
        const anchor = selection[0];
        const parts: GhostPart[] = selection.map(b => ({
            type: b.type,
            color: b.color,
            rotation: b.rotation,
            offset: [b.position[0] - anchor.position[0], b.position[1] - anchor.position[1], b.position[2] - anchor.position[2]],
            roughness: b.roughness,
            metalness: b.metalness,
        }));
        dispatch({ type: 'SET_GHOST_PARTS', payload: parts });
        dispatch({ type: 'SET_SELECTED_IDS', payload: [] });
        dispatch({ type: 'SET_MOVING_SELECTION', payload: false });
    }, [state.bricks, state.selectedIds]);

    const startMovingSelection = useCallback(() => {
        if (state.selectedIds.length === 0) return;
        const selection = state.bricks.filter(b => state.selectedIds.includes(b.id));
        const anchor = selection[0];
        const parts: GhostPart[] = selection.map(b => ({
            type: b.type,
            color: b.color,
            rotation: b.rotation,
            id: b.id,
            offset: [b.position[0] - anchor.position[0], b.position[1] - anchor.position[1], b.position[2] - anchor.position[2]],
            roughness: b.roughness,
            metalness: b.metalness,
        }));
        dispatch({ type: 'SET_GHOST_PARTS', payload: parts });
        dispatch({ type: 'SET_MOVING_SELECTION', payload: true });
    }, [state.bricks, state.selectedIds]);

    const selectPrefab = useCallback((parts: GhostPart[]) => {
        dispatch({ type: 'SET_GHOST_PARTS', payload: parts });
        dispatch({ type: 'SET_SELECTED_IDS', payload: [] });
        dispatch({ type: 'SET_MOVING_SELECTION', payload: false });
    }, []);

    const resetCamera = useCallback(() => {
        orbitControlsRef.current?.reset();
    }, []);

    // Simple setters
    const setSelectedIds = useCallback((ids: string[]) => dispatch({ type: 'SET_SELECTED_IDS', payload: ids }), []);
    const setRotation = useCallback((r: number | ((prev: number) => number)) => {
        if (typeof r === 'function') dispatch({ type: 'ROTATE' });
        else dispatch({ type: 'SET_TOOL_SETTINGS', payload: { rotation: r } });
    }, []);
    const setSelectedColor = useCallback((c: string) => dispatch({ type: 'SET_TOOL_SETTINGS', payload: { selectedColor: c } }), []);
    const setSelectedType = useCallback((t: BrickType) => dispatch({ type: 'SET_TOOL_SETTINGS', payload: { selectedType: t } }), []);
    const setSelectedRoughness = useCallback((r: number) => dispatch({ type: 'SET_TOOL_SETTINGS', payload: { selectedRoughness: r } }), []);
    const setSelectedMetalness = useCallback((m: number) => dispatch({ type: 'SET_TOOL_SETTINGS', payload: { selectedMetalness: m } }), []);
    const setSymmetryAxis = useCallback((a: SymmetryAxis) => dispatch({ type: 'SET_TOOL_SETTINGS', payload: { symmetryAxis: a } }), []);
    const setWorldTheme = useCallback((t: WorldTheme) => dispatch({ type: 'SET_TOOL_SETTINGS', payload: { worldTheme: t } }), []);
    const setActiveGhostParts = useCallback((p: GhostPart[] | null) => dispatch({ type: 'SET_GHOST_PARTS', payload: p }), []);
    const setSelectionBox = useCallback((b: EditorState['selectionBox']) => dispatch({ type: 'SET_SELECTION_BOX', payload: b }), []);
    const toggleInstructions = useCallback((show?: boolean) => dispatch({ type: 'TOGGLE_INSTRUCTIONS', payload: show }), []);
    const escapeAll = useCallback(() => dispatch({ type: 'ESCAPE_ALL' }), []);

    return {
        // State
        ...state,
        canUndo,
        canRedo,
        orbitControlsRef,

        // Actions
        loadProject,
        saveProject,
        clearProject,
        undo,
        redo,
        addBricks,
        finishMovingBricks,
        updateBrickProperties,
        removeBricks,
        groupSelectedBricks,
        ungroupSelectedBricks,
        mirrorSelection,
        startCloning,
        startMovingSelection,
        selectPrefab,
        resetCamera,

        // Setters
        setSelectedIds,
        setRotation,
        setSelectedColor,
        setSelectedType,
        setSelectedRoughness,
        setSelectedMetalness,
        setSymmetryAxis,
        setWorldTheme,
        setActiveGhostParts,
        setSelectionBox,
        toggleInstructions,
        escapeAll,
    };
}
