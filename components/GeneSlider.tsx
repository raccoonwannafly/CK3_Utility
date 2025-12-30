
import React, { useMemo } from 'react';
import { GeneDefinition } from '../types';
import GeneInfo from './GeneInfo';

interface GeneSliderProps {
  definition: GeneDefinition;
  value: number;
  templateIndex: number;
  onChange: (id: string, val: number) => void;
  onTemplateChange: (id: string, index: number) => void;
}

const EMOJI_MAP: Record<string, string> = {
    'face': '😐',
    'eyes': '👁️',
    'ears': '👂',
    'nose': '👃',
    'mouth': '👄',
    'head_neck': '👤',
    'body': '🧍',
    'hair': '🎨' // Using palette for hair/color group
};

const GeneSlider: React.FC<GeneSliderProps> = ({ definition, value, templateIndex, onChange, onTemplateChange }) => {
  // Determine effective range based on selected template or default
  const activeTemplate = definition.templates?.find(t => t.index === templateIndex) || definition.templates?.[0];
  
  const min = activeTemplate?.range?.min ?? definition.min;
  const max = activeTemplate?.range?.max ?? definition.max;

  const percentage = useMemo(() => {
    return ((value - min) / (max - min)) * 100;
  }, [value, min, max]);

  const displayValue = min === 0 && max > 10 
    ? value.toFixed(0)
    : value.toFixed(3);

  const emoji = EMOJI_MAP[definition.group] || '🧬';

  return (
    <div className="group relative bg-ck3-glass backdrop-blur-md rounded-xl p-5 border border-ck3-border hover:border-ck3-borderActive transition-all duration-300 shadow-lg hover:shadow-glow flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div className="flex flex-col flex-1 min-w-0 mr-4">
          <div className="flex items-center gap-2">
            <span className="text-base select-none grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all">{emoji}</span>
            <label className="text-xs font-serif text-ck3-textMuted uppercase tracking-[0.15em] font-semibold group-hover:text-ck3-accent transition-colors truncate">
              {definition.name}
            </label>
            <GeneInfo definition={definition} />
          </div>
          <span className="text-[9px] font-mono text-ck3-textMuted/40 mt-1 select-all hover:text-ck3-textMuted transition-colors truncate">
            {definition.id}
          </span>
        </div>
        
        <div className="font-mono text-xs text-ck3-accent bg-ck3-accentDark/10 px-2 py-0.5 rounded border border-ck3-accent/20 shrink-0">
          {displayValue}
        </div>
      </div>

      {definition.templates && definition.templates.length > 0 && (
        <div className="w-full">
          <select 
            value={templateIndex}
            onChange={(e) => onTemplateChange(definition.id, parseInt(e.target.value))}
            className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 text-xs text-ck3-textMuted focus:text-ck3-accent focus:border-ck3-accent/50 outline-none appearance-none cursor-pointer transition-colors"
          >
            {definition.templates.map(t => (
              <option key={t.index} value={t.index}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      )}
      
      <div className="relative h-8 w-full flex items-center">
        <input
          type="range"
          min={min}
          max={max}
          step={max - min > 5 ? 1 : 0.001}
          value={value}
          onChange={(e) => onChange(definition.id, parseFloat(e.target.value))}
          className="absolute z-20 w-full opacity-0 cursor-pointer h-full"
        />
        
        {/* Track Background */}
        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden relative z-10">
           {/* Active Fill */}
          <div 
            className="h-full bg-gradient-to-r from-ck3-accentDark to-ck3-accent opacity-80 group-hover:opacity-100 transition-opacity"
            style={{ width: `${Math.min(Math.max(percentage, 0), 100)}%` }}
          />
        </div>

        {/* Custom Thumb */}
        <div 
          className="absolute h-5 w-5 bg-ck3-surface border-2 border-ck3-accent rotate-45 shadow-[0_0_10px_rgba(212,175,55,0.4)] pointer-events-none z-10 transition-transform duration-75 group-hover:scale-110 flex items-center justify-center"
          style={{ 
            left: `calc(${Math.min(Math.max(percentage, 0), 100)}% - 10px)`,
          }}
        >
          <div className="w-1.5 h-1.5 bg-ck3-accent rounded-full" />
        </div>
      </div>
      
      <div className="flex justify-between -mt-2 text-[9px] text-ck3-textMuted/50 font-mono tracking-wider">
        <span>{min.toFixed(1)}</span>
        <div className="h-px flex-1 mx-2 bg-white/5 self-center"></div>
        <span>{max.toFixed(1)}</span>
      </div>
    </div>
  );
};

export default GeneSlider;
