
import React, { useState } from 'react';
import { BRICK_METADATA, LEGO_COLORS, BRICK_TYPES, PREFABS, Prefab, WORLD_THEMES } from '../constants';
import { BrickType, SymmetryAxis, WorldTheme } from '../types';
import { AIAssistant } from './AIAssistant';
import { ColorPicker } from './ColorPicker';

interface SidebarProps {
  selectedColor: string;
  setSelectedColor: (color: string) => void;
  selectedType: BrickType;
  setSelectedType: (type: BrickType) => void;
  selectedRoughness: number;
  setSelectedRoughness: (val: number) => void;
  selectedMetalness: number;
  setSelectedMetalness: (val: number) => void;
  clearAll: () => void;
  brickCount: number;
  rotation: number;
  setRotation: (r: number) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  symmetryAxis: SymmetryAxis;
  setSymmetryAxis: (axis: SymmetryAxis) => void;
  worldTheme: WorldTheme;
  setWorldTheme: (theme: WorldTheme) => void;
  saveProject: () => void;
  loadProject: () => void;
  onSelectPrefab: (prefab: Prefab) => void;
  onShowHelp: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  selectedColor, setSelectedColor, selectedType, setSelectedType, 
  selectedRoughness, setSelectedRoughness, selectedMetalness, setSelectedMetalness,
  clearAll, brickCount, rotation, setRotation,
  undo, redo, canUndo, canRedo, symmetryAxis, setSymmetryAxis, worldTheme, setWorldTheme, saveProject, loadProject, onSelectPrefab, onShowHelp
}) => {
  const [activeTab, setActiveTab] = useState<'bricks' | 'prefabs'>('bricks');

  const categories = {
    standard: BRICK_TYPES.filter(t => !t.endsWith('P') && !t.endsWith('T') && !t.endsWith('A') && !t.includes('FL') && !t.includes('LF') && !t.startsWith('MF_') && !['CN', 'R', 'H', 'C', 'S', 'IS', 'W_L', 'W_R', 'G', 'Ingot', 'CS'].some(suffix => t.endsWith(suffix))),
    plates: BRICK_TYPES.filter(t => t.endsWith('P')),
    tiles: BRICK_TYPES.filter(t => t.endsWith('T') || t.endsWith('G') || t.includes('Ingot')),
    slopes: BRICK_TYPES.filter(t => t.endsWith('S') || t.endsWith('IS') || t.includes('W_') || t.endsWith('CS')),
    rounds: BRICK_TYPES.filter(t => t.endsWith('R') || t.endsWith('CN') || t.endsWith('H') || t.endsWith('C')),
    technic: BRICK_TYPES.filter(t => t.includes('B') || t.includes('A')),
    botanical: BRICK_TYPES.filter(t => t.includes('FL') || t.includes('LF')),
    figures: BRICK_TYPES.filter(t => t.startsWith('MF_')),
  };

  const PartGrid = ({ list, label }: { list: BrickType[], label: string }) => (
    <div className="mb-6">
      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 border-b border-white/5 pb-1">{label}</p>
      <div className="grid grid-cols-4 gap-2">
        {list.map(type => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            title={BRICK_METADATA[type].label}
            className={`py-2 rounded-lg text-[9px] font-black border transition-all ${
              selectedType === type ? 'bg-blue-600 border-blue-400 text-white scale-105' : 'bg-slate-800 border-white/5 text-slate-400 hover:text-white'
            }`}
          >
            {type.replace('MF_', '').replace('1x1', '') || '1x1'}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-96 bg-slate-900 h-full flex flex-col shadow-2xl z-20 text-white border-l border-white/5">
      <div className="flex bg-slate-800/50 p-2 m-4 rounded-2xl gap-2">
        <button onClick={() => setActiveTab('bricks')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'bricks' ? 'bg-blue-600 shadow-lg' : 'text-slate-400 hover:text-white'}`}>Builder</button>
        <button onClick={() => setActiveTab('prefabs')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'prefabs' ? 'bg-blue-600 shadow-lg' : 'text-slate-400 hover:text-white'}`}>Prefabs</button>
      </div>

      <div className="flex-grow overflow-y-auto px-6 pb-20 space-y-8 scrollbar-hide">
        {activeTab === 'bricks' ? (
          <>
            <section className="bg-slate-800/40 rounded-3xl p-5 border border-white/5">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Active Bricks</span>
                  <h2 className="text-xl font-black">{brickCount} Parts</h2>
                </div>
                <div className="flex gap-2">
                  <button onClick={undo} disabled={!canUndo} className="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center disabled:opacity-20 transition-all hover:bg-slate-600"><i className="fa-solid fa-undo text-[10px]"></i></button>
                  <button onClick={redo} disabled={!canRedo} className="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center disabled:opacity-20 transition-all hover:bg-slate-600"><i className="fa-solid fa-redo text-[10px]"></i></button>
                </div>
              </div>
            </section>

            <PartGrid list={categories.standard} label="Standard Bricks" />
            <PartGrid list={categories.plates} label="Plates" />
            <PartGrid list={categories.tiles} label="Tiles & Detail" />
            <PartGrid list={categories.slopes} label="Slopes & Wedges" />
            <PartGrid list={categories.rounds} label="Curved & Rounds" />
            <PartGrid list={categories.technic} label="SNOT & Arches" />
            <PartGrid list={categories.botanical} label="Flora" />
            <PartGrid list={categories.figures} label="Figures" />

            <section className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Mirror Symmetry</h3>
              <div className="grid grid-cols-3 gap-2">
                <button 
                  onClick={() => setSymmetryAxis('none')} 
                  className={`py-3 rounded-xl border text-[9px] font-black uppercase transition-all ${symmetryAxis === 'none' ? 'bg-blue-600 border-blue-400' : 'bg-slate-800 border-white/5 text-slate-500'}`}
                >
                  OFF
                </button>
                <button 
                  onClick={() => setSymmetryAxis('X')} 
                  className={`py-3 rounded-xl border text-[9px] font-black uppercase transition-all ${symmetryAxis === 'X' ? 'bg-blue-600 border-blue-400' : 'bg-slate-800 border-white/5 text-slate-500'}`}
                >
                  X AXIS
                </button>
                <button 
                  onClick={() => setSymmetryAxis('Z')} 
                  className={`py-3 rounded-xl border text-[9px] font-black uppercase transition-all ${symmetryAxis === 'Z' ? 'bg-blue-600 border-blue-400' : 'bg-slate-800 border-white/5 text-slate-500'}`}
                >
                  Z AXIS
                </button>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Atmosphere</h3>
              <div className="grid grid-cols-5 gap-2">
                {(Object.keys(WORLD_THEMES) as WorldTheme[]).map(key => (
                  <button key={key} onClick={() => setWorldTheme(key)} className={`h-12 rounded-xl flex items-center justify-center border transition-all ${worldTheme === key ? 'bg-blue-600 border-blue-400' : 'bg-slate-800 border-white/5 text-slate-500'}`}>
                    <i className={`fa-solid ${WORLD_THEMES[key].icon}`}></i>
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-4">
               <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Master Palette</h3>
               <ColorPicker 
                 color={selectedColor} 
                 onChange={setSelectedColor}
                 roughness={selectedRoughness}
                 onRoughnessChange={setSelectedRoughness}
                 metalness={selectedMetalness}
                 onMetalnessChange={setSelectedMetalness}
               />
            </section>
          </>
        ) : (
          <div className="space-y-6 pt-4">
            {PREFABS.map(prefab => (
              <button key={prefab.id} onClick={() => onSelectPrefab(prefab)} className="w-full group bg-slate-800 hover:bg-slate-700 p-5 rounded-3xl flex items-center gap-5 transition-all border border-white/5 text-left">
                <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-2xl text-blue-500 group-hover:scale-110 transition-transform">
                  <i className={`fa-solid ${prefab.icon}`}></i>
                </div>
                <div>
                  <h4 className="font-black text-md">{prefab.label}</h4>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{prefab.parts.length} COMPONENTS</p>
                </div>
              </button>
            ))}
            <AIAssistant brickCount={brickCount} currentType={selectedType} />
          </div>
        )}
      </div>

      <div className="p-6 bg-slate-900 border-t border-white/5 flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-2">
          <button onClick={saveProject} className="py-3 bg-slate-800 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-700 transition-all">Export</button>
          <button onClick={loadProject} className="py-3 bg-slate-800 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-700 transition-all">Import</button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={onShowHelp} className="py-3 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-900/50">
            <i className="fa-solid fa-lightbulb mr-1.5"></i> Controls
          </button>
          <button onClick={clearAll} className="py-3 bg-red-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-500 transition-all shadow-lg shadow-red-900/50">
            <i className="fa-solid fa-fire-extinguisher mr-1.5"></i> Wipe All
          </button>
        </div>
      </div>
    </div>
  );
};
