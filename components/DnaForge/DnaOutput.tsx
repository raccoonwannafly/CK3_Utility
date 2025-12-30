
import React from 'react';
import { GeneState, GeneDefinition } from '../../types';

interface DnaOutputProps {
  geneValues: GeneState;
  definitions: GeneDefinition[];
}

const DnaOutput: React.FC<DnaOutputProps> = ({ geneValues, definitions }) => {
  const [copied, setCopied] = React.useState(false);

  const generateDnaString = () => {
    const dnaObject: Record<string, any> = {
      genes: {},
      meta: {
        version: "1.0.0",
        type: "ck3_simulator_dna"
      }
    };

    definitions.forEach(def => {
      const state = geneValues[def.id];
      const val = state?.value ?? (def.templates?.[0]?.range.min ?? def.min);
      const idx = state?.templateIndex ?? 0;

      // Fallback for genes without templates
      const activeTemplate = def.templates?.find(t => t.index === idx) || def.templates?.[0];
      const templateName = activeTemplate?.name || "custom";

      dnaObject.genes[def.id] = {
        value: val,
        template_index: idx,
        template_name: templateName,
        // Mimic paradox script syntax
        script_string: `${def.id}={ "value": ${val.toFixed(3)} "index": ${idx} }` 
      };
    });

    return JSON.stringify(dnaObject, null, 2);
  };

  const copyToClipboard = () => {
    const text = generateDnaString();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-ck3-glass backdrop-blur-xl border-l border-stone-800 flex flex-col h-full shadow-2xl">
      <div className="p-6 border-b border-stone-800 flex justify-between items-center bg-white/5">
        <div>
          <h2 className="font-serif text-lg text-stone-200 font-bold tracking-wide">DNA Sequence</h2>
          <p className="text-[10px] text-stone-500 uppercase tracking-widest mt-1">Export Data</p>
        </div>
        
        <button 
          onClick={copyToClipboard}
          className={`flex items-center gap-2 px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
            copied 
              ? 'bg-green-900/50 text-green-400 border border-green-500/50' 
              : 'bg-ck3-gold/10 hover:bg-ck3-gold/20 text-ck3-gold border border-ck3-gold/30 hover:shadow-glow'
          }`}
        >
          {copied ? 'Copied' : 'Copy DNA'}
        </button>
      </div>
      
      <div className="flex-1 p-0 overflow-hidden relative group">
        <textarea
          readOnly
          value={generateDnaString()}
          className="w-full h-full bg-[#080808] text-stone-500 font-mono text-xs p-6 resize-none focus:outline-none focus:text-stone-300 transition-colors selection:bg-ck3-gold/30 leading-relaxed scrollbar-hide"
          spellCheck={false}
        />
        {/* Subtle overlay gradient at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black to-transparent pointer-events-none" />
      </div>
    </div>
  );
};

export default DnaOutput;
