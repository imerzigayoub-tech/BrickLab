
import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';

interface AIAssistantProps {
  brickCount: number;
  currentType: string;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ brickCount, currentType }) => {
  const [suggestion, setSuggestion] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const generateIdea = useCallback(async () => {
    setLoading(true);
    try {
      // Initialize with correct parameter name and direct access to environment variables
      const ai = new GoogleGenAI({ apiKey: (import.meta.env.VITE_GEMINI_API_KEY || (import.meta.env.GEMINI_API_KEY as string)) });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `You are a Lego Master. The user is in a 3D editor. 
        They currently have ${brickCount} bricks placed.
        Their current selected part is a ${currentType}.
        Suggest a creative building project or a "Mini-Challenge" for them.
        Keep the suggestion under 40 words. 
        Make it inspiring and playful.`,
        config: {
          temperature: 0.8,
          topP: 0.95,
        },
      });

      // Use the text property directly instead of a method as per latest SDK guidelines
      setSuggestion(response.text || 'Build a tiny micro-bot using only primary colors!');
    } catch (error) {
      console.error('AI Error:', error);
      setSuggestion('How about building a miniature lighthouse?');
    } finally {
      setLoading(false);
    }
  }, [brickCount, currentType]);

  return (
    <div className="bg-slate-800/80 backdrop-blur-md rounded-3xl p-5 border border-white/10 mt-6 shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-[10px] text-white">
            <i className="fa-solid fa-wand-magic-sparkles"></i>
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Creative Pilot</span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-slate-500 hover:text-white transition-colors"
        >
          <i className={`fa-solid fa-chevron-${isOpen ? 'up' : 'down'}`}></i>
        </button>
      </div>

      {isOpen && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <p className="text-xs text-slate-300 leading-relaxed font-medium">
            {suggestion || 'Need a spark of inspiration for your next masterpiece?'}
          </p>

          <button
            onClick={generateIdea}
            disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] text-white transition-all shadow-lg shadow-indigo-900/40"
          >
            {loading ? (
              <i className="fa-solid fa-circle-notch animate-spin"></i>
            ) : (
              'Request Inspiration'
            )}
          </button>
        </div>
      )}
    </div>
  );
};
