
import React from 'react';
import { BrickInstance, BrickType } from '../types';
import { BRICK_METADATA, PLATE_HEIGHT } from '../constants';
import { ColorPicker } from './ColorPicker';

interface SelectionPanelProps {
  selectedBricks: BrickInstance[];
  onUpdate: (updates: Partial<BrickInstance>) => void;
  onClose: () => void;
  onMove: () => void;
  onClone: () => void;
  onDelete: () => void;
  onGroup: () => void;
  onUngroup: () => void;
  onMirror: (axis: 'X' | 'Z') => void;
}

export const SelectionPanel: React.FC<SelectionPanelProps> = ({
  selectedBricks,
  onUpdate,
  onClose,
  onMove,
  onClone,
  onDelete,
  onGroup,
  onUngroup,
  onMirror,
}) => {
  if (selectedBricks.length === 0) return null;

  const isSingle = selectedBricks.length === 1;
  const first = selectedBricks[0];
  const commonType = selectedBricks.every(b => b.type === first.type) ? first.type : null;
  const commonColor = selectedBricks.every(b => b.color === first.color) ? first.color : '#MIXED';
  const commonRoughness = selectedBricks.every(b => b.roughness === first.roughness) ? (first.roughness ?? 0.2) : 0.2;
  const commonMetalness = selectedBricks.every(b => b.metalness === first.metalness) ? (first.metalness ?? 0.1) : 0.1;

  const handlePosChange = (axis: 0 | 1 | 2, value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return;
    const newPos = [...first.position] as [number, number, number];
    newPos[axis] = num;
    onUpdate({ position: newPos });
  };

  const handleRotChange = (value: string) => {
    const deg = parseFloat(value);
    if (isNaN(deg)) return;
    onUpdate({ rotation: (deg * Math.PI) / 180 });
  };

  return (
    <div className="absolute right-8 top-1/2 -translate-y-1/2 w-80 bg-white/95 backdrop-blur-2xl p-6 rounded-[2.5rem] shadow-2xl border border-white flex flex-col gap-6 animate-in slide-in-from-right-8 pointer-events-auto max-h-[80vh] overflow-y-auto scrollbar-hide">
      <div className="flex justify-between items-center">
        <div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Inspector</span>
          <h2 className="text-sm font-black text-slate-900 uppercase">
            {isSingle ? BRICK_METADATA[first.type].label : `${selectedBricks.length} PARTS`}
          </h2>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors">
          <i className="fa-solid fa-times"></i>
        </button>
      </div>

      <div className="space-y-6">
        {/* Properties Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-4 bg-blue-500 rounded flex items-center justify-center text-[8px] text-white">
              <i className="fa-solid fa-sliders"></i>
            </div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Properties</span>
          </div>

          {isSingle && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Position X</label>
                <input 
                  type="number" 
                  step="0.5" 
                  value={first.position[0]} 
                  onChange={(e) => handlePosChange(0, e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-blue-300" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Position Z</label>
                <input 
                  type="number" 
                  step="0.5" 
                  value={first.position[2]} 
                  onChange={(e) => handlePosChange(2, e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-blue-300" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Altitude (Y)</label>
                <input 
                  type="number" 
                  step={PLATE_HEIGHT} 
                  value={first.position[1]} 
                  onChange={(e) => handlePosChange(1, e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-blue-300" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Rotation (Deg)</label>
                <input 
                  type="number" 
                  step="90" 
                  value={Math.round((first.rotation * 180) / Math.PI)} 
                  onChange={(e) => handleRotChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-blue-300" 
                />
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-black text-slate-400 uppercase ml-1">Appearance</span>
              {commonColor !== '#MIXED' && (
                <div className="w-4 h-4 rounded shadow-sm border border-slate-200" style={{ backgroundColor: commonColor }}></div>
              )}
            </div>
            <ColorPicker color={commonColor === '#MIXED' ? '#FFFFFF' : commonColor} onChange={(hex) => onUpdate({ color: hex })} />
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center px-1">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Roughness</span>
              <span className="text-[10px] font-mono text-slate-500">{commonRoughness.toFixed(2)}</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01" 
              value={commonRoughness} 
              onChange={(e) => onUpdate({ roughness: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            
            <div className="flex justify-between items-center px-1">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Metalness</span>
              <span className="text-[10px] font-mono text-slate-500">{commonMetalness.toFixed(2)}</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01" 
              value={commonMetalness} 
              onChange={(e) => onUpdate({ metalness: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
        </section>

        {/* Actions Section */}
        <section className="space-y-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 mb-2">
             <div className="w-4 h-4 bg-indigo-500 rounded flex items-center justify-center text-[8px] text-white">
               <i className="fa-solid fa-bolt"></i>
             </div>
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Operations</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button onClick={onMove} className="flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all">
              <i className="fa-solid fa-arrows-up-down-left-right"></i> Move
            </button>
            <button onClick={onClone} className="flex items-center justify-center gap-2 py-3 bg-slate-100 text-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">
              <i className="fa-solid fa-copy"></i> Clone
            </button>
            <button onClick={() => onMirror('X')} className="flex items-center justify-center gap-2 py-3 bg-slate-100 text-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">
              <i className="fa-solid fa-arrows-left-right"></i> Flip X
            </button>
            <button onClick={() => onMirror('Z')} className="flex items-center justify-center gap-2 py-3 bg-slate-100 text-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">
              <i className="fa-solid fa-arrows-up-down"></i> Flip Z
            </button>
            <button onClick={onGroup} className="flex items-center justify-center gap-2 py-3 bg-slate-100 text-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">
              <i className="fa-solid fa-layer-group"></i> Group
            </button>
            <button onClick={onUngroup} className="flex items-center justify-center gap-2 py-3 bg-slate-100 text-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">
              <i className="fa-solid fa-object-ungroup"></i> Free
            </button>
          </div>

          <button onClick={onDelete} className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-all border border-red-100">
            <i className="fa-solid fa-trash-can"></i> Delete Selection
          </button>
        </section>
      </div>

      <div className="bg-slate-50 rounded-2xl p-4 mt-2">
        <p className="text-[9px] font-bold text-slate-400 uppercase leading-relaxed text-center">
          Pro Tip: Use 'R' to rotate or 'M' to move. Hold 'Shift' to multi-select.
        </p>
      </div>
    </div>
  );
};
