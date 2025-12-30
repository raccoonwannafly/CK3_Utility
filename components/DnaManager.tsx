import React, { useState, useMemo } from 'react';
import { convertDnaStringToCode, convertCodeToDnaString, decodeDnaToData, encodeDataToDna, VANILLA_GENES, EPE_GENES } from '../services/dnaConverter';
import { DnaData } from '../types';

const DnaManager: React.FC = () => {
  const [rawDna, setRawDna] = useState('');
  const [formattedCode, setFormattedCode] = useState('');
  const [sex, setSex] = useState<'male' | 'female'>('male');
  const [mod, setMod] = useState<'vanilla' | 'epe'>('vanilla');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  // Editor State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editData, setEditData] = useState<DnaData>({});
  const [isPureBlooded, setIsPureBlooded] = useState(false);

  const handleConvertToCode = () => {
    setError(null);
    setSuccessMsg(null);
    if (!rawDna.trim()) return setError("Please input a DNA string.");
    const result = convertDnaStringToCode(rawDna, sex, mod);
    if (result.startsWith("Error")) setError(result);
    else {
      setFormattedCode(result);
      setSuccessMsg("Conversion successful!");
    }
  };

  const handleConvertToString = () => {
    setError(null);
    setSuccessMsg(null);
    if (!formattedCode.trim()) return setError("Please input Ruler Designer code.");
    const result = convertCodeToDnaString(formattedCode, mod);
    if (result.startsWith("Error")) setError(result);
    else {
      setRawDna(result);
      setSuccessMsg("Conversion successful!");
    }
  };

  const handleOpenEditor = () => {
    try {
      const data = rawDna.trim() 
        ? decodeDnaToData(rawDna, mod) 
        : (mod === 'vanilla' ? VANILLA_GENES : EPE_GENES).reduce((acc, g) => ({ ...acc, [g]: [0, 127, 0, 127] }), {});
      setEditData(data);
      setIsEditorOpen(true);
    } catch (e) {
      setError("Failed to initialize editor. Ensure Base64 DNA is valid.");
    }
  };

  const updateGene = (gene: string, index: number, value: number) => {
    setEditData(prev => {
      const newData = { ...prev };
      const currentVals = [...newData[gene]];
      currentVals[index] = Math.min(255, Math.max(0, value));
      
      if (isPureBlooded) {
        if (index === 0) currentVals[2] = currentVals[0];
        if (index === 1) currentVals[3] = currentVals[1];
      }
      
      newData[gene] = currentVals;
      return newData;
    });
  };

  const saveEditorChanges = () => {
    const newDna = encodeDataToDna(editData, mod);
    setRawDna(newDna);
    setIsEditorOpen(false);
    setSuccessMsg("Changes applied to Persistent DNA.");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccessMsg("Copied to clipboard!");
    setTimeout(() => setSuccessMsg(null), 2000);
  };

  const geneList = mod === 'vanilla' ? VANILLA_GENES : EPE_GENES;

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in p-4">
      <header className="border-b border-stone-700 pb-4 mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-serif text-ck3-gold">DNA Manager</h2>
          <p className="text-stone-400 mt-2">Convert and edit ruler DNA for save files or the Ruler Designer.</p>
        </div>
        
        <div className="flex bg-stone-900 rounded p-1 border border-stone-700">
          <button onClick={() => setMod('vanilla')} className={`px-4 py-1.5 rounded text-xs font-bold transition-colors ${mod === 'vanilla' ? 'bg-ck3-gold text-white' : 'text-stone-500 hover:text-stone-300'}`}>VANILLA</button>
          <button onClick={() => setMod('epe')} className={`px-4 py-1.5 rounded text-xs font-bold transition-colors ${mod === 'epe' ? 'bg-ck3-gold text-white' : 'text-stone-500 hover:text-stone-300'}`}>EPE MOD</button>
        </div>
      </header>

      {/* Feedback */}
      <div className="min-h-[3rem]">
        {error && <div className="bg-red-900/30 border border-red-500/50 p-3 rounded text-red-200 text-center text-sm font-bold animate-pulse">{error}</div>}
        {successMsg && <div className="bg-emerald-900/30 border border-emerald-500/50 p-3 rounded text-emerald-200 text-center text-sm font-bold">{successMsg}</div>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Persistent DNA */}
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-stone-800 p-2 rounded-t-lg border border-stone-700 border-b-0">
            <span className="font-bold text-stone-300 ml-2 text-sm uppercase tracking-wider">Persistent DNA (Save File)</span>
            <div className="flex gap-2">
               <button onClick={handleOpenEditor} className="px-3 py-1 text-xs bg-ck3-gold/20 text-ck3-goldLight border border-ck3-gold/30 hover:bg-ck3-gold/30 rounded transition-colors">Open Editor</button>
               <button onClick={() => copyToClipboard(rawDna)} className="px-3 py-1 text-xs bg-stone-700 hover:bg-stone-600 rounded transition-colors text-white">Copy</button>
            </div>
          </div>
          <textarea 
            value={rawDna}
            onChange={(e) => setRawDna(e.target.value)}
            placeholder="Paste Base64 DNA string here..."
            className="w-full h-64 bg-stone-900 border border-stone-700 rounded-b-lg p-4 font-mono text-xs text-stone-300 focus:outline-none focus:border-ck3-gold resize-none"
            spellCheck={false}
          />
          <div className="bg-stone-800 p-4 rounded border border-stone-700 flex justify-between items-center">
            <div className="flex bg-stone-900 rounded p-1">
              <button onClick={() => setSex('male')} className={`px-4 py-1.5 rounded text-xs font-bold ${sex === 'male' ? 'bg-ck3-gold text-white' : 'text-stone-500'}`}>MALE</button>
              <button onClick={() => setSex('female')} className={`px-4 py-1.5 rounded text-xs font-bold ${sex === 'female' ? 'bg-ck3-gold text-white' : 'text-stone-500'}`}>FEMALE</button>
            </div>
            <button onClick={handleConvertToCode} className="px-6 py-2 bg-ck3-gold hover:bg-ck3-goldLight text-white font-serif font-bold rounded shadow-lg transition-colors">Convert to Code &rarr;</button>
          </div>
        </div>

        {/* Ruler Designer Code */}
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-stone-800 p-2 rounded-t-lg border border-stone-700 border-b-0">
            <span className="font-bold text-stone-300 ml-2 text-sm uppercase tracking-wider">Ruler Designer Code</span>
            <button onClick={() => copyToClipboard(formattedCode)} className="px-3 py-1 text-xs bg-stone-700 hover:bg-stone-600 rounded transition-colors text-white">Copy</button>
          </div>
          <textarea 
            value={formattedCode}
            onChange={(e) => setFormattedCode(e.target.value)}
            placeholder="ruler_designer_12345={ ... }"
            className="w-full h-64 bg-stone-900 border border-stone-700 rounded-b-lg p-4 font-mono text-xs text-stone-300 focus:outline-none focus:border-ck3-gold resize-none"
            spellCheck={false}
          />
          <button onClick={handleConvertToString} className="w-full py-3 bg-ck3-paper border border-stone-500 text-stone-400 hover:bg-stone-700 hover:text-white transition-colors font-serif font-bold rounded shadow-lg">
            &larr; Convert to DNA String
          </button>
        </div>
      </div>

      {/* Editor Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-8">
          <div className="bg-ck3-paper border border-stone-600 w-full max-w-5xl h-full flex flex-col rounded-lg shadow-2xl overflow-hidden animate-fade-in-up">
            <header className="p-6 border-b border-stone-700 bg-stone-800 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-serif text-ck3-gold">Granular DNA Editor</h3>
                <p className="text-xs text-stone-500 uppercase tracking-widest mt-1">Mode: {mod.toUpperCase()}</p>
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={isPureBlooded} 
                    onChange={e => setIsPureBlooded(e.target.checked)}
                    className="w-4 h-4 rounded border-stone-600 bg-stone-900 text-ck3-gold focus:ring-0"
                  />
                  <span className="text-sm font-bold text-stone-400 group-hover:text-ck3-goldLight transition-colors">Pure-Blooded Symmetry</span>
                </label>
                <button onClick={() => setIsEditorOpen(false)} className="text-stone-500 hover:text-white text-3xl">&times;</button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
              <div className="grid grid-cols-12 gap-4 text-[10px] uppercase font-bold text-stone-500 px-4">
                <div className="col-span-4">Gene Name</div>
                <div className="col-span-2 text-center">Dom. ID</div>
                <div className="col-span-2 text-center">Dom. Val</div>
                <div className="col-span-2 text-center">Rec. ID</div>
                <div className="col-span-2 text-center">Rec. Val</div>
              </div>
              
              {geneList.map(gene => (
                <div key={gene} className="grid grid-cols-12 gap-4 items-center bg-stone-900/50 p-2 rounded border border-stone-800 hover:border-stone-700 transition-colors">
                  <div className="col-span-4 text-sm font-serif text-stone-300 truncate" title={gene}>{gene.replace('gene_', '').replace('gene_bs_', '').replace(/_/g, ' ')}</div>
                  {[0, 1, 2, 3].map(idx => (
                    <div key={idx} className="col-span-2">
                      <input 
                        type="number"
                        value={editData[gene]?.[idx] ?? 0}
                        onChange={(e) => updateGene(gene, idx, parseInt(e.target.value) || 0)}
                        disabled={isPureBlooded && (idx === 2 || idx === 3)}
                        className={`w-full bg-stone-800 border border-stone-700 rounded p-1 text-center text-sm text-stone-200 outline-none focus:border-ck3-gold disabled:opacity-30`}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <footer className="p-6 border-t border-stone-700 bg-stone-800 flex justify-end gap-4">
              <button onClick={() => setIsEditorOpen(false)} className="px-6 py-2 text-stone-400 hover:text-white transition-colors uppercase text-sm font-bold">Discard</button>
              <button onClick={saveEditorChanges} className="px-10 py-3 bg-ck3-gold hover:bg-ck3-goldLight text-white font-serif font-bold rounded shadow-xl transition-all transform hover:-translate-y-0.5">Apply Ancestry</button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};

export default DnaManager;