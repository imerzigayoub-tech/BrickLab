
import React, { useState, useRef, useEffect, useCallback } from 'react';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  roughness?: number;
  onRoughnessChange?: (val: number) => void;
  metalness?: number;
  onMetalnessChange?: (val: number) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ 
  color, 
  onChange, 
  roughness, 
  onRoughnessChange, 
  metalness, 
  onMetalnessChange 
}) => {
  const [hue, setHue] = useState(0);
  const [alpha, setAlpha] = useState(100);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Parse incoming color to set initial alpha if it's hex8
  useEffect(() => {
    if (color.length === 9) {
      const a = parseInt(color.slice(7, 9), 16);
      setAlpha(Math.round((a / 255) * 100));
    } else {
      setAlpha(100);
    }
  }, [color]);

  const rgbToHex = (r: number, g: number, b: number, a: number) => {
    const toHex = (n: number) => n.toString(16).padStart(2, '0').toUpperCase();
    const alphaHex = toHex(Math.round((a / 100) * 255));
    return `#${toHex(r)}${toHex(g)}${toHex(b)}${alphaHex === 'FF' ? '' : alphaHex}`;
  };

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    const gradientH = ctx.createLinearGradient(0, 0, width, 0);
    gradientH.addColorStop(0, '#fff');
    gradientH.addColorStop(1, `hsl(${hue}, 100%, 50%)`);
    ctx.fillStyle = gradientH;
    ctx.fillRect(0, 0, width, height);

    const gradientV = ctx.createLinearGradient(0, 0, 0, height);
    gradientV.addColorStop(0, 'rgba(0,0,0,0)');
    gradientV.addColorStop(1, '#000');
    ctx.fillStyle = gradientV;
    ctx.fillRect(0, 0, width, height);
  }, [hue]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const handlePointer = (e: React.PointerEvent | PointerEvent, currentAlpha: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(canvas.width - 1, ((e.clientX - rect.left) / rect.width) * canvas.width));
    const y = Math.max(0, Math.min(canvas.height - 1, ((e.clientY - rect.top) / rect.height) * canvas.height));

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    onChange(rgbToHex(pixel[0], pixel[1], pixel[2], currentAlpha));
  };

  const updateWithAlpha = (newAlpha: number) => {
    setAlpha(newAlpha);
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    onChange(rgbToHex(r, g, b, newAlpha));
  };

  return (
    <div className="space-y-4">
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden cursor-crosshair shadow-inner border border-white/5 bg-slate-800">
        <canvas
          ref={canvasRef}
          width={200}
          height={200}
          className="w-full h-full"
          onPointerDown={(e) => {
            (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
            handlePointer(e, alpha);
          }}
          onPointerMove={(e) => {
            if (e.buttons > 0) handlePointer(e, alpha);
          }}
        />
      </div>
      
      <div className="space-y-3">
        {/* Hue */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center px-1">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Hue Selection</span>
            <span className="text-[10px] font-mono text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-white/5">{color.slice(0, 7)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="360"
            value={hue}
            onChange={(e) => setHue(parseInt(e.target.value))}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer border border-white/10"
            style={{
              background: 'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)'
            }}
          />
        </div>

        {/* Transparency */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center px-1">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Transparency</span>
            <span className="text-[10px] font-mono text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-white/5">{alpha}%</span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            value={alpha}
            onChange={(e) => updateWithAlpha(parseInt(e.target.value))}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer border border-white/10 bg-slate-700"
            style={{
              background: `linear-gradient(to right, transparent, ${color.slice(0, 7)})`
            }}
          />
        </div>

        {/* Roughness */}
        {onRoughnessChange !== undefined && roughness !== undefined && (
          <div className="space-y-1.5">
            <div className="flex justify-between items-center px-1">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Roughness</span>
              <span className="text-[10px] font-mono text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-white/5">{(roughness * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={roughness}
              onChange={(e) => onRoughnessChange(parseFloat(e.target.value))}
              className="w-full h-1.5 rounded-lg appearance-none cursor-pointer border border-white/10 bg-slate-700 accent-blue-500"
            />
          </div>
        )}

        {/* Metalness */}
        {onMetalnessChange !== undefined && metalness !== undefined && (
          <div className="space-y-1.5">
            <div className="flex justify-between items-center px-1">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Metalness</span>
              <span className="text-[10px] font-mono text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-white/5">{(metalness * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={metalness}
              onChange={(e) => onMetalnessChange(parseFloat(e.target.value))}
              className="w-full h-1.5 rounded-lg appearance-none cursor-pointer border border-white/10 bg-slate-700 accent-blue-500"
            />
          </div>
        )}
      </div>
    </div>
  );
};
