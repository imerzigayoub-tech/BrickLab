import React, { useEffect, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Environment, ContactShadows, PerspectiveCamera, Sky } from '@react-three/drei';
import * as THREE from 'three';
import { Scene } from './components/Scene';
import { Sidebar } from './components/Sidebar';
import { SelectionPanel } from './components/SelectionPanel';
import { Instructions } from './components/Instructions';
import { WORLD_THEMES, Prefab } from './constants';
import { useBrickEditor } from './hooks/useBrickEditor';

const App: React.FC = () => {
  const editor = useBrickEditor();

  // Load project on mount (single necessary useEffect)
  useEffect(() => {
    editor.loadProject();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Keyboard shortcuts - necessary useEffect for global event handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') { e.preventDefault(); e.shiftKey ? editor.redo() : editor.undo(); }
        if (e.key === 's') { e.preventDefault(); editor.saveProject(); }
        if (e.key === 'g') { e.preventDefault(); editor.groupSelectedBricks(); }
        if (e.key === 'd') { e.preventDefault(); editor.startCloning(); }
      }
      if (e.key.toLowerCase() === 'r') editor.setRotation(prev => prev);
      if (e.key.toLowerCase() === 'm' && editor.selectedIds.length > 0) editor.startMovingSelection();
      if ((e.key === 'Delete' || e.key === 'Backspace') && editor.selectedIds.length > 0) {
        editor.removeBricks(editor.selectedIds);
      }
      if (e.key === 'Escape') editor.escapeAll();
      if (e.key === '?' || e.key === 'F1') editor.toggleInstructions();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editor]);

  // Derived data - computed from state, no useState needed
  const currentThemeConfig = WORLD_THEMES[editor.worldTheme];

  const selectionBoxStyle = useMemo(() => {
    if (!editor.selectionBox) return { display: 'none' } as const;
    const { start, end } = editor.selectionBox;
    return {
      left: Math.min(start.x, end.x),
      top: Math.min(start.y, end.y),
      width: Math.abs(start.x - end.x),
      height: Math.abs(start.y - end.y),
      position: 'absolute' as const,
      border: '1.5px dashed rgba(59, 130, 246, 0.8)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderRadius: '4px',
      pointerEvents: 'none' as const,
      zIndex: 10,
    };
  }, [editor.selectionBox]);

  const selectedBricks = useMemo(
    () => editor.bricks.filter(b => editor.selectedIds.includes(b.id)),
    [editor.bricks, editor.selectedIds]
  );

  const handlePrefabSelect = (prefab: Prefab) => editor.selectPrefab(prefab.parts);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0f172a] font-sans">
      <Instructions isOpen={editor.showInstructions} onClose={() => editor.toggleInstructions(false)} />

      <div className="flex-grow relative bg-[#f8fafc] rounded-l-[3rem] my-3 ml-3 shadow-2xl overflow-hidden">
        <div style={selectionBoxStyle} />

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
            bricks={editor.bricks}
            addBrick={(brick) => editor.addBricks([brick])}
            addBricks={editor.addBricks}
            finishMovingBricks={editor.finishMovingBricks}
            selectedType={editor.selectedType}
            selectedColor={editor.selectedColor}
            selectedRoughness={editor.selectedRoughness}
            selectedMetalness={editor.selectedMetalness}
            rotation={editor.rotation}
            setRotation={editor.setRotation}
            selectedIds={editor.selectedIds}
            setSelectedIds={editor.setSelectedIds}
            activeGhostParts={editor.activeGhostParts}
            setActiveGhostParts={editor.setActiveGhostParts}
            isMovingSelection={editor.isMovingSelection}
            symmetryAxis={editor.symmetryAxis}
            setSelectionBoxUI={editor.setSelectionBox}
            worldTheme={editor.worldTheme}
          />

          <OrbitControls
            ref={editor.orbitControlsRef}
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

        {/* Header */}
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
              <div className={`flex items-center gap-1.5 transition-opacity duration-500 ${editor.isSaved ? 'opacity-30' : 'opacity-100'}`}>
                <div className={`w-2 h-2 rounded-full ${editor.isSaved ? 'bg-slate-300' : 'bg-orange-500 animate-pulse'}`}></div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {editor.isSaved ? 'All changes saved' : 'Unsaved changes'}
                </span>
              </div>
            </div>

            <div className="pointer-events-auto flex gap-2">
              <button onClick={() => editor.toggleInstructions(true)} title="Help & Controls (?)" className="w-10 h-10 bg-white shadow-lg rounded-xl border border-slate-200 flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors"><i className="fa-solid fa-question"></i></button>
              <button onClick={editor.saveProject} title="Save Project (Ctrl+S)" className="w-10 h-10 bg-white shadow-lg rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"><i className="fa-solid fa-save"></i></button>
              <button onClick={editor.undo} disabled={!editor.canUndo} title="Undo (Ctrl+Z)" className="w-10 h-10 bg-white shadow-lg rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 disabled:opacity-20 hover:bg-slate-50 transition-colors"><i className="fa-solid fa-rotate-left"></i></button>
              <button onClick={editor.redo} disabled={!editor.canRedo} title="Redo (Ctrl+Shift+Z)" className="w-10 h-10 bg-white shadow-lg rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 disabled:opacity-20 hover:bg-slate-50 transition-colors"><i className="fa-solid fa-rotate-right"></i></button>
              <button onClick={editor.resetCamera} title="Reset Camera" className="w-10 h-10 bg-white shadow-lg rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"><i className="fa-solid fa-home"></i></button>
            </div>
          </div>
        </div>

        {/* Selection Panel */}
        {editor.selectedIds.length > 0 && !editor.isMovingSelection && (
          <SelectionPanel
            selectedBricks={selectedBricks}
            onUpdate={(updates) => editor.updateBrickProperties(editor.selectedIds, updates)}
            onClose={() => editor.setSelectedIds([])}
            onMove={editor.startMovingSelection}
            onClone={editor.startCloning}
            onDelete={() => editor.removeBricks(editor.selectedIds)}
            onGroup={editor.groupSelectedBricks}
            onUngroup={editor.ungroupSelectedBricks}
            onMirror={editor.mirrorSelection}
          />
        )}

        {/* Moving Selection Indicator */}
        {editor.isMovingSelection && (
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
        selectedColor={editor.selectedColor} setSelectedColor={editor.setSelectedColor}
        selectedType={editor.selectedType} setSelectedType={editor.setSelectedType}
        selectedRoughness={editor.selectedRoughness} setSelectedRoughness={editor.setSelectedRoughness}
        selectedMetalness={editor.selectedMetalness} setSelectedMetalness={editor.setSelectedMetalness}
        clearAll={editor.clearProject} brickCount={editor.bricks.length}
        rotation={editor.rotation} setRotation={editor.setRotation}
        undo={editor.undo} redo={editor.redo}
        canUndo={editor.canUndo} canRedo={editor.canRedo}
        symmetryAxis={editor.symmetryAxis} setSymmetryAxis={editor.setSymmetryAxis}
        worldTheme={editor.worldTheme} setWorldTheme={editor.setWorldTheme}
        saveProject={editor.saveProject}
        loadProject={editor.loadProject}
        onSelectPrefab={handlePrefabSelect}
        onShowHelp={() => editor.toggleInstructions(true)}
      />
    </div>
  );
};

export default App;
