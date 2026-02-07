
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Environment, ContactShadows, PerspectiveCamera, Sky } from '@react-three/drei';
import * as THREE from 'three';
import { Scene } from './components/Scene';
import { Sidebar } from './components/Sidebar';
import { SelectionPanel } from './components/SelectionPanel';
import { Instructions } from './components/Instructions';
import { BrickInstance, BrickType, SymmetryAxis, WorldTheme } from './types';
import { LEGO_COLORS, PREFABS, Prefab, WORLD_THEMES } from './constants';
import { useHistory } from './hooks/useHistory';
import { useSelection } from './hooks/useSelection';

const SEEN_INSTRUCTIONS_KEY = 'bricklab-seen-instructions';

const App: React.FC = () => {
  const {
    bricks,
    setBricks,
    isSaved,
    historyIndex,
    history,
    saveToHistory,
    undo,
    redo,
    saveProject,
    loadProject,
    clearProject
  } = useHistory();

  const {
    selectedIds,
    setSelectedIds,
    updateBrickProperties,
    removeBricks,
    groupSelectedBricks,
    ungroupSelectedBricks,
    mirrorSelection
  } = useSelection(bricks, saveToHistory);

  const [showInstructions, setShowInstructions] = useState(false);
  const [selectedColor, setSelectedColor] = useState(LEGO_COLORS[0].hex);
  const [selectedType, setSelectedType] = useState<BrickType>('2x2');
  const [selectedRoughness, setSelectedRoughness] = useState(0.2);
  const [selectedMetalness, setSelectedMetalness] = useState(0.1);
  const [rotation, setRotation] = useState(0);
  const [symmetryAxis, setSymmetryAxis] = useState<SymmetryAxis>('none');
  const [worldTheme, setWorldTheme] = useState<WorldTheme>('studio');

  const [activeGhostParts, setActiveGhostParts] = useState<{ type: BrickType; color: string; offset: [number, number, number]; rotation: number; roughness?: number; metalness?: number; id?: string }[] | null>(null);
  const [isMovingSelection, setIsMovingSelection] = useState(false);
  const [selectionBox, setSelectionBox] = useState<{ start: { x: number, y: number }, end: { x: number, y: number } } | null>(null);

  const orbitControlsRef = useRef<any>(null);

  useEffect(() => {
    const loadedBricks = loadProject();
    const seen = localStorage.getItem(SEEN_INSTRUCTIONS_KEY);
    if (!seen) {
      setShowInstructions(true);
      localStorage.setItem(SEEN_INSTRUCTIONS_KEY, 'true');
    }
  }, [loadProject]);

  const addBrick = useCallback((brick: Omit<BrickInstance, 'id'>) => {
    const newBrick = {
      ...brick,
      id: Math.random().toString(36).substr(2, 9),
      roughness: brick.roughness ?? selectedRoughness,
      metalness: brick.metalness ?? selectedMetalness
    };
    const next = [...bricks, newBrick];
    setBricks(next);
    saveToHistory(next);
    setSelectedIds([]);
    setActiveGhostParts(null);
  }, [bricks, setBricks, saveToHistory, selectedRoughness, selectedMetalness, setSelectedIds]);

  const addBricks = useCallback((newBricksData: Omit<BrickInstance, 'id'>[]) => {
    const newBricks = newBricksData.map(b => ({
      ...b,
      id: Math.random().toString(36).substr(2, 9),
      roughness: b.roughness ?? selectedRoughness,
      metalness: b.metalness ?? selectedMetalness
    }));
    const next = [...bricks, ...newBricks];
    setBricks(next);
    saveToHistory(next);
    setSelectedIds([]);
    setActiveGhostParts(null);
    setIsMovingSelection(false);
  }, [bricks, setBricks, saveToHistory, selectedRoughness, selectedMetalness, setSelectedIds]);

  const finishMovingBricks = useCallback((movedData: { id: string, position: [number, number, number], rotation: number }[]) => {
    const next = bricks.map(b => {
      const moved = movedData.find(m => m.id === b.id);
      if (moved) {
        return { ...b, position: moved.position, rotation: moved.rotation };
      }
      return b;
    });
    setBricks(next);
    saveToHistory(next);
    setSelectedIds([]);
    setActiveGhostParts(null);
    setIsMovingSelection(false);
  }, [bricks, setBricks, saveToHistory, setSelectedIds]);

  const startCloning = useCallback(() => {
    if (selectedIds.length === 0) return;
    const selection = bricks.filter(b => selectedIds.includes(b.id));
    const anchor = selection[0];
    const parts = selection.map(b => ({
      type: b.type,
      color: b.color,
      rotation: b.rotation,
      offset: [
        b.position[0] - anchor.position[0],
        b.position[1] - anchor.position[1],
        b.position[2] - anchor.position[2]
      ] as [number, number, number],
      roughness: b.roughness,
      metalness: b.metalness
    }));
    setActiveGhostParts(parts);
    setSelectedIds([]);
    setIsMovingSelection(false);
  }, [bricks, selectedIds, setSelectedIds]);

  const startMovingSelection = useCallback(() => {
    if (selectedIds.length === 0) return;
    const selection = bricks.filter(b => selectedIds.includes(b.id));
    const anchor = selection[0];
    const parts = selection.map(b => ({
      type: b.type,
      color: b.color,
      rotation: b.rotation,
      id: b.id,
      offset: [
        b.position[0] - anchor.position[0],
        b.position[1] - anchor.position[1],
        b.position[2] - anchor.position[2]
      ] as [number, number, number],
      roughness: b.roughness,
      metalness: b.metalness
    }));
    setActiveGhostParts(parts as any);
    setIsMovingSelection(true);
  }, [bricks, selectedIds]);

  const clearAll = useCallback(() => {
    if (window.confirm("ARE YOU SURE? This will permanently delete every brick on your canvas and clear your history.")) {
      clearProject();
      setSelectedIds([]);
      setActiveGhostParts(null);
      setIsMovingSelection(false);
      console.log("Canvas Wiped Successfully.");
    }
  }, [clearProject, setSelectedIds]);

  const resetCamera = useCallback(() => {
    if (orbitControlsRef.current) {
      orbitControlsRef.current.reset();
    }
  }, []);

  const handleSelectPrefab = useCallback((prefab: Prefab) => {
    setActiveGhostParts(prefab.parts);
    setSelectedIds([]);
    setIsMovingSelection(false);
  }, [setSelectedIds]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if ((e.ctrlKey || e.metaKey)) {
        if (e.key === 'z') { e.preventDefault(); if (e.shiftKey) redo(); else undo(); }
        if (e.key === 's') { e.preventDefault(); saveProject(); }
        if (e.key === 'g') { e.preventDefault(); groupSelectedBricks(); }
        if (e.key === 'd') { e.preventDefault(); startCloning(); }
      }
      if (e.key.toLowerCase() === 'r') setRotation(prev => (prev + Math.PI / 2) % (Math.PI * 2));
      if (e.key.toLowerCase() === 'm' && selectedIds.length > 0) startMovingSelection();
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedIds.length > 0) {
        const next = removeBricks(selectedIds);
        setBricks(next);
      }
      if (e.key === 'Escape') {
        setSelectedIds([]);
        setActiveGhostParts(null);
        setIsMovingSelection(false);
      }
      if (e.key === '?' || e.key === 'F1') setShowInstructions(prev => !prev);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIds, setSelectedIds, undo, redo, groupSelectedBricks, startCloning, saveProject, startMovingSelection, removeBricks, setBricks]);

  const getBoxStyle = () => {
    if (!selectionBox) return { display: 'none' };
    const left = Math.min(selectionBox.start.x, selectionBox.end.x);
    const top = Math.min(selectionBox.start.y, selectionBox.end.y);
    const width = Math.abs(selectionBox.start.x - selectionBox.end.x);
    const height = Math.abs(selectionBox.start.y - selectionBox.end.y);
    return {
      left, top, width, height,
      position: 'absolute' as const,
      border: '1.5px dashed rgba(59, 130, 246, 0.8)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderRadius: '4px',
      pointerEvents: 'none' as const,
      zIndex: 10,
    };
  };

  const currentThemeConfig = WORLD_THEMES[worldTheme];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0f172a] font-sans">
      <Instructions isOpen={showInstructions} onClose={() => setShowInstructions(false)} />

      <div className="flex-grow relative bg-[#f8fafc] rounded-l-[3rem] my-3 ml-3 shadow-2xl overflow-hidden">
        <div style={getBoxStyle()} />

        <Canvas
          shadows
          gl={{
            antialias: true,
            logarithmicDepthBuffer: true,
            powerPreference: 'high-performance',
            toneMapping: THREE.ACESFilmicToneMapping,
          }}
          onContextMenu={(e) => e.preventDefault()}
        >
          <Sky distance={450000} sunPosition={currentThemeConfig.sunPosition} inclination={0} azimuth={0.25} />
          <PerspectiveCamera makeDefault position={[20, 20, 20]} fov={30} />
          <Environment preset="city" />
          <ambientLight intensity={0.4} />
          <directionalLight
            position={currentThemeConfig.sunPosition}
            intensity={1.5}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-bias={-0.0001}
          />

          <Scene
            bricks={bricks}
            addBrick={addBrick}
            addBricks={addBricks}
            finishMovingBricks={finishMovingBricks}
            selectedType={selectedType}
            selectedColor={selectedColor}
            selectedRoughness={selectedRoughness}
            selectedMetalness={selectedMetalness}
            rotation={rotation}
            setRotation={setRotation}
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
            activeGhostParts={activeGhostParts}
            setActiveGhostParts={setActiveGhostParts}
            isMovingSelection={isMovingSelection}
            symmetryAxis={symmetryAxis}
            setSelectionBoxUI={setSelectionBox}
            worldTheme={worldTheme}
          />

          <OrbitControls
            ref={orbitControlsRef}
            makeDefault
            maxPolarAngle={Math.PI / 2.1}
            minDistance={5}
            maxDistance={250}
            enableDamping
            dampingFactor={0.1}
            mouseButtons={{ LEFT: null, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.ROTATE }}
          />

          <Grid
            infiniteGrid
            fadeDistance={150}
            fadeStrength={8}
            cellSize={1}
            sectionSize={5}
            sectionColor="#94a3b8"
            cellColor="#cbd5e1"
            sectionThickness={1.2}
            cellThickness={0.5}
            position={[0, -0.015, 0]}
          />

          <ContactShadows position={[0, 0, 0]} opacity={0.25} scale={100} blur={2.5} far={10} color="#000" />
        </Canvas>

        <div className="absolute top-8 left-8 pointer-events-none flex flex-col gap-6 w-full pr-16">
          <div className="flex justify-between items-start">
            <div className="bg-white/90 backdrop-blur shadow-xl px-6 py-4 rounded-3xl border border-white/40 flex items-center gap-4 pointer-events-auto">
              <div className="w-8 h-8 bg-slate-900 rounded-xl flex items-center justify-center text-white text-sm">
                <i className="fa-solid fa-shapes"></i>
              </div>
              <h1 className="text-xl font-black text-slate-900 tracking-tighter uppercase">
                Brick<span className="text-blue-600">Lab</span>
              </h1>
              <div className="h-4 w-px bg-slate-200"></div>
              <div className={`flex items-center gap-1.5 transition-opacity duration-500 ${isSaved ? 'opacity-30' : 'opacity-100'}`}>
                <div className={`w-2 h-2 rounded-full ${isSaved ? 'bg-slate-300' : 'bg-orange-500 animate-pulse'}`}></div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {isSaved ? 'All changes saved' : 'Unsaved changes'}
                </span>
              </div>
            </div>

            <div className="pointer-events-auto flex gap-2">
              <button onClick={() => setShowInstructions(true)} title="Help & Controls (?)" className="w-10 h-10 bg-white shadow-lg rounded-xl border border-slate-200 flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors"><i className="fa-solid fa-question"></i></button>
              <button onClick={saveProject} title="Save Project (Ctrl+S)" className="w-10 h-10 bg-white shadow-lg rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"><i className="fa-solid fa-save"></i></button>
              <button onClick={() => { const next = undo(); if (next) setBricks(next); }} disabled={historyIndex < 0} title="Undo (Ctrl+Z)" className="w-10 h-10 bg-white shadow-lg rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 disabled:opacity-20 hover:bg-slate-50 transition-colors"><i className="fa-solid fa-rotate-left"></i></button>
              <button onClick={() => { const next = redo(); if (next) setBricks(next); }} disabled={historyIndex >= history.length - 1} title="Redo (Ctrl+Shift+Z)" className="w-10 h-10 bg-white shadow-lg rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 disabled:opacity-20 hover:bg-slate-50 transition-colors"><i className="fa-solid fa-rotate-right"></i></button>
              <button onClick={resetCamera} title="Reset Camera" className="w-10 h-10 bg-white shadow-lg rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"><i className="fa-solid fa-home"></i></button>
            </div>
          </div>
        </div>

        {selectedIds.length > 0 && !isMovingSelection && (
          <SelectionPanel
            selectedBricks={bricks.filter(b => selectedIds.includes(b.id))}
            onUpdate={(updates) => {
              const next = updateBrickProperties(selectedIds, updates);
              setBricks(next);
            }}
            onClose={() => setSelectedIds([])}
            onMove={startMovingSelection}
            onClone={startCloning}
            onDelete={() => {
              const next = removeBricks(selectedIds);
              setBricks(next);
            }}
            onGroup={() => {
              const next = groupSelectedBricks();
              if (next) setBricks(next);
            }}
            onUngroup={() => {
              const next = ungroupSelectedBricks();
              if (next) setBricks(next);
            }}
            onMirror={(axis) => {
              const next = mirrorSelection(axis);
              if (next) setBricks(next);
            }}
          />
        )}

        {isMovingSelection && (
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-indigo-600 text-white p-4 rounded-3xl shadow-2xl border border-white flex items-center gap-6 animate-in slide-in-from-bottom-8 pointer-events-auto">
            <div className="flex items-center gap-3">
              <i className="fa-solid fa-arrows-up-down-left-right animate-pulse"></i>
              <span className="text-sm font-black uppercase tracking-widest">Moving Selection</span>
            </div>
            <div className="h-4 w-px bg-white/20"></div>
            <div className="text-[10px] font-bold opacity-80 uppercase tracking-widest">
              Left click to place • Escape to cancel
            </div>
          </div>
        )}
      </div>

      <Sidebar
        selectedColor={selectedColor} setSelectedColor={setSelectedColor}
        selectedType={selectedType} setSelectedType={setSelectedType}
        selectedRoughness={selectedRoughness} setSelectedRoughness={setSelectedRoughness}
        selectedMetalness={selectedMetalness} setSelectedMetalness={setSelectedMetalness}
        clearAll={clearAll} brickCount={bricks.length}
        rotation={rotation} setRotation={setRotation}
        undo={() => { const next = undo(); if (next) setBricks(next); }}
        redo={() => { const next = redo(); if (next) setBricks(next); }}
        canUndo={historyIndex >= 0} canRedo={historyIndex < history.length - 1}
        symmetryAxis={symmetryAxis} setSymmetryAxis={setSymmetryAxis}
        worldTheme={worldTheme} setWorldTheme={setWorldTheme}
        saveProject={saveProject}
        loadProject={loadProject}
        onSelectPrefab={handleSelectPrefab}
        onShowHelp={() => setShowInstructions(true)}
      />
    </div>
  );
};

export default App;
