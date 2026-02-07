
import React from 'react';

interface InstructionsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Instructions: React.FC<InstructionsProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const Shortcut = ({ keys, label }: { keys: string[], label: string }) => (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</span>
      <div className="flex gap-1">
        {keys.map(key => (
          <kbd key={key} className="px-2 py-1 bg-slate-100 border border-slate-200 rounded text-[9px] font-black text-slate-700 shadow-sm">{key}</kbd>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="bg-slate-900 p-10 text-white relative">
          <button onClick={onClose} className="absolute top-8 right-8 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
            <i className="fa-solid fa-times text-sm"></i>
          </button>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-lg">
              <i className="fa-solid fa-graduation-cap"></i>
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight">Master Builder Academy</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Version 1.2 • Pro Building Suite</p>
            </div>
          </div>
        </div>

        <div className="p-10 space-y-10 max-h-[60vh] overflow-y-auto scrollbar-hide">
          <section>
            <h3 className="text-[12px] font-black text-blue-600 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-600"></div>
              1. Getting Started
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600 leading-relaxed">
                Select a brick from the <span className="font-black text-slate-900 uppercase text-[10px]">Builder Tab</span> in the sidebar. Move your mouse over the grid to see the ghost preview. 
                <span className="block mt-2 font-bold text-slate-800 italic">"The ghost will snap automatically to existing parts or the grid floor."</span>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-[12px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
              2. Master Shortcuts
            </h3>
            <div className="grid grid-cols-1 gap-1">
              <Shortcut keys={['Left Click']} label="Place Piece" />
              <Shortcut keys={['Right Click']} label="Select/Deselect" />
              <Shortcut keys={['R']} label="Rotate Active Piece" />
              <Shortcut keys={['Shift', 'Right Click']} label="Multi-Select" />
              <Shortcut keys={['Ctrl', 'D']} label="Clone Selection" />
              <Shortcut keys={['M']} label="Move Selection" />
              <Shortcut keys={['Del']} label="Delete Selection" />
              <Shortcut keys={['Esc']} label="Clear Tool / Cancel" />
            </div>
          </section>

          <section>
            <h3 className="text-[12px] font-black text-purple-600 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-purple-600"></div>
              3. Viewport Controls
            </h3>
            <div className="grid grid-cols-1 gap-1">
              <Shortcut keys={['Right Click Drag']} label="Orbit Camera" />
              <Shortcut keys={['Middle Click']} label="Pan Viewport" />
              <Shortcut keys={['Scroll Wheel']} label="Zoom In / Out" />
            </div>
          </section>

          <section>
            <h3 className="text-[12px] font-black text-orange-600 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-orange-600"></div>
              Pro Tips
            </h3>
            <ul className="space-y-3 text-[11px] text-slate-500 font-medium">
              <li className="flex gap-3"><i className="fa-solid fa-star text-orange-400 mt-0.5"></i> <span>Use <b>Symmetry Mode</b> for vehicles and buildings to build both sides at once.</span></li>
              <li className="flex gap-3"><i className="fa-solid fa-star text-orange-400 mt-0.5"></i> <span>Check the <b>Creative Pilot</b> (AI) for building prompts when stuck!</span></li>
              <li className="flex gap-3"><i className="fa-solid fa-star text-orange-400 mt-0.5"></i> <span>The <b>Wipe Canvas</b> button in the sidebar clears your history permanently—use with caution.</span></li>
            </ul>
          </section>
        </div>

        <div className="p-10 bg-slate-50">
          <button onClick={onClose} className="w-full py-5 bg-slate-900 text-white rounded-3xl text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl hover:bg-blue-600 hover:-translate-y-1 transition-all active:scale-95">
            Start Building
          </button>
        </div>
      </div>
    </div>
  );
};
