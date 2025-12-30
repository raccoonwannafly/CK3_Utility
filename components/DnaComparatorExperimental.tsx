
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { FileMorphData, MorphData, MorphMode } from '../types';
import { GENE_DEFINITIONS, GENE_GROUPS } from '../constants_forge';
import { 
  parseCK3Morphs, 
  getNumericForSort, 
  generatePatchData,
  findMorphBlocks,
  getIsHalf
} from '../services/morphService';
import { Layers, List, Plus, Search, X, Trash2 } from 'lucide-react';

// --- SMART CELL EDITOR COMPONENT ---
interface SmartCellEditorProps {
  cell: {
    fileName: string;
    gene: string;
    data: MorphData;
    rect: DOMRect;
    isModFile: boolean;
    isDnaFile: boolean;
  };
  onSave: (newData: MorphData) => void;
  onClose: () => void;
}

const SmartCellEditor: React.FC<SmartCellEditorProps> = ({ cell, onSave, onClose }) => {
  const definition = GENE_DEFINITIONS.find(d => d.id === cell.gene.split('#')[0]); // Strip suffix for definition lookup
  
  // State
  const [mode, setMode] = useState<MorphMode>(cell.data.mode || 'replace');
  const [inputType, setInputType] = useState<'value' | 'range'>('value');
  const [manualVal, setManualVal] = useState<string>("");
  const [sliderVal, setSliderVal] = useState<number>(0);
  const [templateIndex, setTemplateIndex] = useState(-1);
  const [templateName, setTemplateName] = useState("");

  const popupRef = useRef<HTMLDivElement>(null);

  // Initialize State
  useEffect(() => {
    // 1. Determine Type
    const isRange = cell.data.type === 'range' || (typeof cell.data.valData === 'string' && cell.data.valData.includes('{'));
    setInputType(isRange ? 'range' : 'value');

    // 2. Set Values
    if (isRange) {
        setManualVal(typeof cell.data.valData === 'string' ? cell.data.valData : `{ ${cell.data.valData} }`);
    } else {
        let numVal = typeof cell.data.valData === 'number' ? cell.data.valData : parseFloat(cell.data.valData);
        if (isNaN(numVal)) numVal = 0;
        
        // Normalize for slider (DNA uses 0-255, Mod uses 0-1 usually but can be anything)
        if (cell.isDnaFile) {
             setSliderVal(numVal / 255.0);
             setManualVal(String(numVal));
        } else {
             // For mods, keep raw value in slider if it fits range, otherwise clamp
             // If mode is replace, usually 0-1. If add, -1 to 1. 
             setSliderVal(numVal);
             setManualVal(String(numVal));
        }
    }

    // 3. Set Template
    if (cell.data.template) {
        setTemplateName(cell.data.template);
        if (definition?.templates) {
            const found = definition.templates.find(t => t.name === cell.data.template);
            if (found) setTemplateIndex(found.index);
        }
    }
  }, [cell, definition]);

  const sliderConfig = useMemo(() => {
      if (cell.isDnaFile) return { min: 0, max: 1, step: 0.001 };
      
      switch (mode) {
          case 'modify':
          case 'add':
              return { min: -1, max: 1, step: 0.001 };
          case 'modify_multiply':
              return { min: 0, max: 2, step: 0.01 };
          case 'replace':
          default:
              return { min: 0, max: 1, step: 0.001 };
      }
  }, [mode, cell.isDnaFile]);

  const handleSave = () => {
    if (inputType === 'range') {
        onSave({
            valData: manualVal,
            template: templateName,
            mode: mode,
            type: 'range'
        });
    } else {
        // Value Mode
        let finalVal = sliderVal;
        
        if (cell.isDnaFile) {
            // Convert normalized slider back to byte
            finalVal = Math.round(sliderVal * 255);
            finalVal = Math.max(0, Math.min(255, finalVal));
        } else {
            // Mod file: keep float
            finalVal = parseFloat(finalVal.toFixed(4));
        }

        onSave({
            valData: finalVal,
            template: templateName,
            mode: mode,
            type: 'value'
        });
    }
  };

  const handleTemplateChange = (idx: number) => {
      setTemplateIndex(idx);
      if (idx === -1) {
          setTemplateName("");
      } else {
          const t = definition?.templates?.find(t => t.index === idx);
          if (t) setTemplateName(t.name);
      }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') onClose();
  };

  // --- POSITIONING LOGIC ---
  const POPUP_WIDTH = 320; 
  const POPUP_EST_HEIGHT = 400; 
  
  let left = cell.rect.left;
  let top = cell.rect.bottom + 5;
  
  if (left + POPUP_WIDTH > window.innerWidth) {
      left = window.innerWidth - POPUP_WIDTH - 20;
  }
  if (left < 10) left = 10;

  if (top + POPUP_EST_HEIGHT > window.innerHeight) {
      top = cell.rect.top - POPUP_EST_HEIGHT;
      if (top < 10) top = 10; 
  }

  const style: React.CSSProperties = { top, left };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-transparent" onClick={onClose} />
      <div 
        ref={popupRef}
        className="fixed z-50 bg-ck3-surface border border-ck3-accent rounded-lg shadow-2xl p-4 w-80 flex flex-col gap-4 animate-fade-in"
        style={style}
      >
        <div className="flex justify-between items-center border-b border-stone-700 pb-2">
           <div className="flex flex-col min-w-0">
               <span className="text-xs font-serif text-ck3-accent uppercase tracking-wider truncate" title={cell.gene}>
                   {definition ? definition.name : cell.gene}
               </span>
               <span className="text-[9px] font-mono text-stone-400 truncate">{cell.gene}</span>
           </div>
           <button onClick={onClose} className="text-stone-400 hover:text-white ml-2">&times;</button>
        </div>

        {/* Input Type Toggle */}
        <div className="flex bg-stone-800 p-1 rounded border border-stone-700">
            <button 
                onClick={() => setInputType('value')}
                className={`flex-1 py-1 text-[10px] font-bold uppercase rounded transition-colors ${inputType === 'value' ? 'bg-ck3-accent text-stone-900' : 'text-stone-400 hover:text-stone-200'}`}
            >
                Value (Slider)
            </button>
            <button 
                onClick={() => setInputType('range')}
                className={`flex-1 py-1 text-[10px] font-bold uppercase rounded transition-colors ${inputType === 'range' ? 'bg-ck3-accent text-stone-900' : 'text-stone-400 hover:text-stone-200'}`}
            >
                Range {`{ }`}
            </button>
        </div>

        {/* EDITOR BODY */}
        <div className="space-y-4">
            
            {/* Template Selector */}
            {definition?.templates && definition.templates.length > 0 && (
                <div>
                    <label className="block text-[10px] uppercase text-stone-400 font-bold mb-1">Template</label>
                    <select
                        className="w-full bg-black/40 border border-stone-600 rounded px-2 py-1.5 text-xs text-stone-200 focus:text-ck3-accent focus:border-ck3-accent/50 outline-none"
                        value={templateIndex}
                        onChange={(e) => handleTemplateChange(Number(e.target.value))}
                    >
                        <option value={-1}>-- No Template --</option>
                        {definition.templates.map(t => (
                            <option key={t.index} value={t.index}>{t.name}</option>
                        ))}
                    </select>
                </div>
            )}
            
            {/* Main Value Input */}
            {inputType === 'value' ? (
                <div>
                    <div className="flex justify-between text-[10px] text-stone-300 mb-1 font-mono">
                        <span>{sliderConfig.min}</span>
                        <span className="text-ck3-accent font-bold">
                             {cell.isDnaFile ? Math.round(sliderVal * 255) : sliderVal.toFixed(3)}
                        </span>
                        <span>{sliderConfig.max}</span>
                    </div>
                    <input 
                        type="range"
                        min={sliderConfig.min}
                        max={sliderConfig.max}
                        step={sliderConfig.step}
                        value={sliderVal}
                        onChange={(e) => setSliderVal(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-ck3-accent hover:accent-ck3-accentLight"
                    />
                    <div className="mt-2 flex justify-between items-center">
                        <label className="text-[10px] text-stone-400">Manual:</label>
                        <input 
                            type="number"
                            value={sliderVal}
                            onChange={(e) => setSliderVal(parseFloat(e.target.value))}
                            className="bg-black/30 border border-stone-700 rounded w-20 px-1 text-right text-xs text-stone-200 focus:border-ck3-accent outline-none"
                        />
                    </div>
                </div>
            ) : (
                <div>
                    <label className="block text-[10px] uppercase text-stone-400 font-bold mb-1">Range Definition</label>
                    <input 
                        className="w-full bg-black/40 border border-stone-600 rounded p-2 text-sm text-white focus:border-ck3-accent outline-none font-mono"
                        value={manualVal}
                        onChange={e => setManualVal(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="{ 0.0 1.0 }"
                        autoFocus
                    />
                </div>
            )}

            {/* Mode Selector */}
            <div>
                <label className="block text-[10px] uppercase text-stone-400 font-bold mb-1">Mode</label>
                <select 
                    className="w-full bg-stone-800 border border-stone-600 rounded p-1.5 text-xs text-stone-200 outline-none focus:border-ck3-accent"
                    value={mode}
                    onChange={e => setMode(e.target.value as MorphMode)}
                    disabled={cell.isDnaFile}
                    title={cell.isDnaFile ? "DNA files always use replacement logic." : ""}
                >
                    <option value="replace">Replace (0.0 - 1.0)</option>
                    <option value="add">Add / Modify (-1.0 - 1.0)</option>
                    <option value="modify">Modify (-1.0 - 1.0)</option>
                    <option value="modify_multiply">Multiply (0.0 - 2.0)</option>
                </select>
            </div>

        </div>

        <button 
            onClick={handleSave}
            className="w-full bg-gradient-to-r from-ck3-accent/80 to-ck3-accent hover:from-ck3-accent hover:to-ck3-accentLight text-stone-900 font-bold py-2 rounded text-xs transition-all shadow-md mt-auto border border-ck3-accent/50"
        >
            Update Gene
        </button>
      </div>
    </>
  );
};

const AddMorphModal: React.FC<{ isOpen: boolean; onClose: () => void; onAdd: (gene: string) => void; existingGenes: Set<string> }> = ({ isOpen, onClose, onAdd, existingGenes }) => {
    const [search, setSearch] = useState("");
    
    // Auto focus handling
    const inputRef = useRef<HTMLInputElement>(null);
    useEffect(() => {
        if(isOpen) {
            // Small delay to ensure render
            setTimeout(() => inputRef.current?.focus(), 50);
        } else {
            setSearch("");
        }
    }, [isOpen]);

    if (!isOpen) return null;

    // Filter logic: Show all matches, even if existing (so user knows it exists)
    const filtered = GENE_DEFINITIONS.filter(g => 
        (g.id.toLowerCase().includes(search.toLowerCase()) || g.name.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
             <div className="bg-stone-900 border border-ck3-accent rounded-lg shadow-2xl w-full max-w-md flex flex-col max-h-[80vh]">
                 <div className="p-4 border-b border-stone-700 flex justify-between items-center bg-stone-950 rounded-t-lg">
                     <h3 className="font-serif text-ck3-accent font-bold">Add Morph</h3>
                     <button onClick={onClose}><X size={20} className="text-stone-400 hover:text-white" /></button>
                 </div>
                 
                 <div className="p-4 border-b border-stone-800 bg-stone-900 sticky top-0">
                     <div className="relative">
                         <Search className="absolute left-3 top-2.5 text-stone-500" size={16} />
                         <input 
                            ref={inputRef}
                            placeholder="Search available morphs..."
                            className="w-full bg-black/40 border border-stone-600 rounded-lg py-2 pl-10 pr-4 text-sm text-stone-200 focus:border-ck3-accent outline-none placeholder:text-stone-500"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                         />
                     </div>
                 </div>
                 
                 <div className="flex-1 overflow-y-auto p-2 space-y-1">
                     {filtered.map(g => {
                         const isAdded = existingGenes.has(g.id);
                         return (
                            <button 
                                key={g.id}
                                onClick={() => onAdd(g.id)}
                                className={`w-full text-left px-4 py-3 rounded flex justify-between items-center group transition-colors hover:bg-stone-800 cursor-pointer`}
                            >
                                <span className={`font-serif text-sm ${isAdded ? 'text-ck3-accent' : 'text-stone-200 group-hover:text-ck3-accentLight'}`}>
                                    {g.name}
                                </span>
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] font-mono text-stone-500">{g.id}</span>
                                    {isAdded && <span className="text-[9px] text-emerald-500 font-bold bg-emerald-900/20 px-1 rounded mt-0.5">ADDED</span>}
                                </div>
                            </button>
                         );
                     })}
                     
                     {search && !filtered.find(g => g.id === search) && (
                         <button 
                            onClick={() => onAdd(search)}
                            className="w-full text-left px-4 py-3 bg-stone-800/50 hover:bg-ck3-accent/20 rounded border border-dashed border-stone-600 hover:border-ck3-accent text-ck3-accent mt-2 font-bold text-xs"
                         >
                             + Add Custom: "{search}"
                         </button>
                     )}
                 </div>
             </div>
        </div>
    );
};

const DnaComparatorExperimental: React.FC = () => {
  // Data State
  const [globalParsedData, setGlobalParsedData] = useState<FileMorphData[]>([{
    fileName: "Default",
    morphs: {}, 
    isBaseline: true,
    isDefault: true 
  }]);
  const [globalAllGenes, setGlobalAllGenes] = useState<Set<string>>(new Set());
  const [lastPastedDNA, setLastPastedDNA] = useState("");
  
  // UI State
  const [searchTerm, setSearchTerm] = useState("");
  const [currentRefCol, setCurrentRefCol] = useState("Default");
  const [currentSort, setCurrentSort] = useState<{ col: string | null, dir: number, type: 'name' | 'value' | 'diff' }>({
    col: 'gene', dir: 1, type: 'name'
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [isGrouped, setIsGrouped] = useState(false); // Grouping State
  const [isAddMorphOpen, setIsAddMorphOpen] = useState(false);
  
  // Resizing State
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const resizingRef = useRef<{ col: string, startX: number, startWidth: number } | null>(null);

  // Cell Editor State
  const [editPopup, setEditPopup] = useState<{ fileName: string, gene: string, data: MorphData, rect: DOMRect, isModFile: boolean, isDnaFile: boolean } | null>(null);
  
  // Export Modal State
  const [exportModal, setExportModal] = useState<{ isOpen: boolean, targetFile: string | null }>({ isOpen: false, targetFile: null });
  const [selectedModForApply, setSelectedModForApply] = useState("");

  // Workbench State
  const [patchA, setPatchA] = useState("");
  const [patchB, setPatchB] = useState("");
  const [charDnaText, setCharDnaText] = useState("");
  const [dnaStatus, setDnaStatus] = useState("");

  // --- Resizing Logic ---
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
        if (resizingRef.current) {
            const { col, startX, startWidth } = resizingRef.current;
            const diff = e.clientX - startX;
            setColumnWidths(prev => ({
                ...prev,
                [col]: Math.max(50, startWidth + diff) // Min width 50
            }));
        }
    };
    const handleMouseUp = () => {
        if (resizingRef.current) {
            resizingRef.current = null;
            document.body.style.cursor = 'default';
        }
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const startResize = (e: React.MouseEvent, col: string) => {
    e.preventDefault();
    e.stopPropagation();
    const currentWidth = columnWidths[col] || (col === "Default" ? 80 : 160);
    resizingRef.current = { col, startX: e.clientX, startWidth: currentWidth };
    document.body.style.cursor = 'col-resize';
  };

  // Parse pasted DNA
  useEffect(() => {
    if (!charDnaText.trim()) {
      setGlobalParsedData(prev => prev.filter(d => d.fileName !== "Character DNA"));
      setDnaStatus("");
      setLastPastedDNA("");
      return;
    }
    const regex = /([a-zA-Z0-9_]+)\s*=\s*\{\s*(?:"([^"]*)"\s+)?(\d+)/g;
    let match;
    const dnaMorphs: Record<string, MorphData> = {};
    let count = 0;
    while ((match = regex.exec(charDnaText)) !== null) {
      const gene = match[1];
      const template = match[2] ? match[2].replace(/"/g, '') : ""; 
      const val = parseInt(match[3]);
      if (!isNaN(val)) {
        dnaMorphs[gene] = { valData: val, type: 'value', mode: 'dna', template: template };
        count++;
        setGlobalAllGenes(prev => {
            const newSet = new Set(prev);
            newSet.add(gene);
            return newSet;
        });
      }
    }
    if (count > 0) {
      setDnaStatus(`✅ Parsed ${count} genes.`);
      setGlobalParsedData(prev => {
        const existingIdx = prev.findIndex(d => d.fileName === "Character DNA");
        const newEntry: FileMorphData = { fileName: "Character DNA", morphs: dnaMorphs, isBaseline: true, isDnaPaste: true, isModified: false };
        if (existingIdx !== -1) {
          const next = [...prev];
          next[existingIdx] = newEntry;
          return next;
        }
        return [prev[0], newEntry, ...prev.slice(1)];
      });
      setLastPastedDNA(charDnaText);
    } else {
      setDnaStatus("❌ No genes found.");
    }
  }, [charDnaText]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, reset: boolean) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length === 0) return;

    let newData = reset 
      ? globalParsedData.filter(d => d.isDefault || d.isDnaPaste)
      : [...globalParsedData];
    
    const newGenes = new Set(globalAllGenes);
    
    for (const file of files) {
      const text = await file.text();
      const morphs = parseCK3Morphs(text);
      let safeName = file.name;
      let count = 1;
      while(newData.some(d => d.fileName === safeName)) {
        safeName = `${file.name.replace('.txt', '')}_${count}.txt`;
        count++;
      }
      newData.push({ fileName: safeName, morphs, isModified: false, rawText: text });
      Object.keys(morphs).forEach(g => newGenes.add(g));
    }
    
    setGlobalParsedData(newData);
    setGlobalAllGenes(newGenes);
    e.target.value = '';
  };

  const moveColumn = (index: number, direction: number) => {
    if (index + direction < 0 || index + direction >= globalParsedData.length) return;
    setGlobalParsedData(prev => {
        const newData = [...prev];
        const temp = newData[index];
        newData[index] = newData[index + direction];
        newData[index + direction] = temp;
        return newData;
    });
  };

  const deleteColumn = (fileName: string) => {
    if (globalParsedData.length <= 1) return alert("Cannot delete the last column.");
    if (confirm(`Remove column "${fileName}"?`)) {
         setGlobalParsedData(prev => prev.filter(d => d.fileName !== fileName));
         if (patchA === fileName) setPatchA("");
         if (patchB === fileName) setPatchB("");
         if (currentRefCol === fileName) setCurrentRefCol(globalParsedData[0].fileName !== fileName ? globalParsedData[0].fileName : (globalParsedData[1]?.fileName || ""));
         
         setColumnWidths(prev => {
             const next = {...prev};
             delete next[fileName];
             return next;
         });
    }
  };

  const handleDeleteCell = (fileName: string, gene: string) => {
    setGlobalParsedData(prev => prev.map(f => {
        if (f.fileName !== fileName) return f;
        const newMorphs = { ...f.morphs };
        delete newMorphs[gene];
        return { ...f, morphs: newMorphs, isModified: true };
    }));
  };
  
  const handleDeleteRow = (gene: string) => {
      if(!confirm(`Remove row "${gene}"? This will hide it from view, but data remains in files.`)) return;
      setGlobalAllGenes(prev => {
          const next = new Set(prev);
          next.delete(gene);
          return next;
      });
  };

  const handleAddMorph = (geneName: string) => {
      if (geneName && geneName.trim() !== "") {
          let key = geneName.trim();
          
          // Handle duplicates by suffixing
          if (globalAllGenes.has(key)) {
              let count = 2;
              while (globalAllGenes.has(`${key}#${count}`)) {
                  count++;
              }
              key = `${key}#${count}`;
          }

          setGlobalAllGenes(prev => {
              const newSet = new Set(prev);
              newSet.add(key);
              return newSet;
          });
          // Important: Clear search term so the new row is visible immediately
          setSearchTerm("");
          setIsAddMorphOpen(false);
          
          // Optional: Scroll to it
          setTimeout(() => {
              const el = document.getElementById(`row-${key}`);
              if(el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 100);
      }
  };

  const handleMix = (isSweetSpot: boolean = true) => {
    const colA = globalParsedData.find(d => d.fileName === patchA);
    const colB = globalParsedData.find(d => d.fileName === patchB);
    if (!colA || !colB) return alert("Select two columns.");

    const mixedMorphs = generatePatchData(colA, colB, isSweetSpot, globalAllGenes);
    const newName = isSweetSpot 
        ? `Mixed: ${colA.fileName} + ${colB.fileName}`
        : `Applied: ${colB.fileName} on ${colA.fileName}`;
    
    setGlobalParsedData(prev => [...prev, { fileName: newName, morphs: mixedMorphs, isPatch: true, isModified: false }]);
  };

  const filteredGenes = useMemo(() => {
    let genes = Array.from(globalAllGenes) as string[];
    if (searchTerm) {
      const st = searchTerm.toLowerCase();
      genes = genes.filter(g => g.toLowerCase().includes(st));
    }

    const refCol = globalParsedData.find(d => d.fileName === currentRefCol) || globalParsedData[0];

    genes.sort((a, b) => {
      if (currentSort.type === 'name') return a.localeCompare(b) * currentSort.dir;
      if (currentSort.type === 'value') {
        const fileObj = globalParsedData.find(d => d.fileName === currentSort.col);
        if (!fileObj) return 0;
        return (getNumericForSort(fileObj, a) - getNumericForSort(fileObj, b)) * currentSort.dir;
      }
      if (currentSort.type === 'diff') {
        const getDiff = (gene: string) => {
            let min = Infinity, max = -Infinity;
            let found = false;
            globalParsedData.forEach(fd => {
                const val = getNumericForSort(fd, gene);
                if (val !== -999) {
                    if (val < min) min = val;
                    if (val > max) max = val;
                    found = true;
                }
            });
            return found ? (max - min) : 0;
        };
        const diffA = getDiff(a);
        const diffB = getDiff(b);
        return (diffA - diffB) * currentSort.dir;
      }
      return 0;
    });
    return genes;
  }, [globalAllGenes, searchTerm, globalParsedData, currentSort, currentRefCol]);

  // --- GROUPING LOGIC ---
  const groupedGenesDisplay = useMemo<Record<string, string[]>>(() => {
    if (!isGrouped) return { 'All Genes': filteredGenes };

    const groups: Record<string, string[]> = {};
    const ungrouped: string[] = [];

    // Initialize groups based on constants to preserve order
    GENE_GROUPS.forEach(g => groups[g.name] = []);

    filteredGenes.forEach(geneId => {
       const cleanId = geneId.split('#')[0]; // Use clean ID for grouping
       const def = GENE_DEFINITIONS.find(d => d.id === cleanId);
       if (def) {
           const groupName = GENE_GROUPS.find(g => g.id === def.group)?.name || 'Other';
           if (!groups[groupName]) groups[groupName] = [];
           groups[groupName].push(geneId);
       } else {
           ungrouped.push(geneId);
       }
    });

    if (ungrouped.length > 0) groups['Other / Unknown'] = ungrouped;
    return groups;

  }, [filteredGenes, isGrouped]);


  // --- DOWNLOAD LOGIC ---

  const handleDownloadClick = (fileName: string) => {
    const fileObj = globalParsedData.find(d => d.fileName === fileName);
    if (!fileObj) return;

    if (fileObj.isDnaPaste || fileObj.isBaseline) {
        setExportModal({ isOpen: true, targetFile: fileName });
    } else {
        if (fileObj.isModified || fileObj.isPatch) {
            downloadString(fileObj, fileName, 'mod');
        } else {
            if(confirm(`Export original mod file "${fileName}"? This will save the parsed data back to text format.`)) {
                downloadString(fileObj, fileName, 'mod');
            }
        }
    }
  };

  const confirmDnaExport = (mode: 'manual' | 'applied') => {
     if (!exportModal.targetFile) return;
     const dnaCol = globalParsedData.find(d => d.fileName === exportModal.targetFile);
     if (!dnaCol) return;

     if (mode === 'manual') {
         downloadString(dnaCol, exportModal.targetFile, 'dna');
     } else {
         if (!selectedModForApply) return alert("Please select a mod file to apply.");
         const modCol = globalParsedData.find(d => d.fileName === selectedModForApply);
         if (!modCol) return alert("Selected mod file not found.");

         const appliedMorphs = generatePatchData(dnaCol, modCol, false, globalAllGenes);
         
         const tempCol = {
             fileName: `${exportModal.targetFile} + ${modCol.fileName}`,
             morphs: appliedMorphs,
             isPatch: true
         };
         downloadString(tempCol, `${exportModal.targetFile}_Applied_${modCol.fileName}`, 'dna');
     }
     setExportModal({ isOpen: false, targetFile: null });
  };

  const downloadString = (fileObj: FileMorphData, downloadName: string, type: 'dna' | 'mod') => {
      let content = "";
      const sortedGenes = Array.from(globalAllGenes).sort() as string[];

      if (type === 'dna') {
          let baseString = lastPastedDNA;
          if (!baseString || !baseString.includes("ruler_designer") || fileObj.isPatch) {
               baseString = "ruler_designer_exported={\n\ttype=male\n\tid=0\n\tgenes={ \n\t}\n}";
          }

          if (lastPastedDNA && !fileObj.isPatch) {
              const regex = /([a-zA-Z0-9_]+)\s*=\s*\{\s*(?:"([^"]*)"\s+)?(\d+)\s*(?:"([^"]*)"\s+)?(\d+)\s*\}/g;
              content = baseString.replace(regex, (match, gene, t1, v1, t2, v2) => {
                  const data = fileObj.morphs[gene];
                  if (data) {
                      const newVal = data.valData;
                      const template = data.template || "";
                      const tStr = template ? `"${template}" ` : "";
                      return `${gene}={ ${tStr}${newVal} ${tStr}${newVal} }`;
                  } else {
                      return match; 
                  }
              });
          } else {
              content = "ruler_designer_exported={\n\ttype=male\n\tid=0\n\tgenes={ \n";
              sortedGenes.forEach(gene => {
                  let data = fileObj.morphs[gene];
                  if (data) {
                      const val = data.valData;
                      const t = data.template ? `"${data.template}" ` : "";
                      // Clean gene name if it has suffix
                      const cleanGene = gene.split('#')[0];
                      content += `\t\t${cleanGene}={ ${t}${val} ${t}${val} }\n`;
                  }
              });
              content += "\t}\n}";
          }

      } else {
          // MOD FILE EXPORT (Simplified for this version)
          if (fileObj.rawText) {
              const originalText = fileObj.rawText;
              const blocks = findMorphBlocks(originalText);
              let result = "";
              let cursor = 0;
              
              const geneCounter: Record<string, number> = {};
              const consumedKeys = new Set<string>();

              blocks.sort((a, b) => a.start - b.start);

              for (const block of blocks) {
                  result += originalText.substring(cursor, block.start);
                  
                  const baseGene = block.gene;
                  const count = (geneCounter[baseGene] || 0) + 1;
                  geneCounter[baseGene] = count;
                  
                  const dataKey = count === 1 ? baseGene : `${baseGene}#${count}`;
                  
                  const data = fileObj.morphs[dataKey];
                  if (data) {
                      consumedKeys.add(dataKey);
                      let newBlockBody = `\n\t\t\t\tmode = ${data.mode}\n`;
                      newBlockBody += `\t\t\t\tgene = ${baseGene}\n`;
                      if (data.template) newBlockBody += `\t\t\t\ttemplate = ${data.template}\n`;
                      
                      if (data.type === 'range') {
                          newBlockBody += `\t\t\t\trange = ${data.valData}\n`;
                      } else {
                          let val = data.valData;
                          if (typeof val === 'number' && val > 1) val = Number((val / 255.0).toFixed(3));
                          newBlockBody += `\t\t\t\tvalue = ${typeof val === 'number' ? val.toFixed(3) : val}\n`;
                      }
                      newBlockBody += `\t\t\t`; 
                      result += `morph = {${newBlockBody}}`;
                  }
                  
                  cursor = block.end;
              }
              
              result += originalText.substring(cursor);
              
              const newKeys = Object.keys(fileObj.morphs).filter(k => !consumedKeys.has(k));
              
              if (newKeys.length > 0) {
                  let newBlocks = "";
                  newKeys.forEach(key => {
                      const data = fileObj.morphs[key];
                      const cleanGene = key.split('#')[0];
                      
                      newBlocks += `\n\t\t\tmorph = {\n`;
                      newBlocks += `\t\t\t\tmode = ${data.mode}\n`;
                      newBlocks += `\t\t\t\tgene = ${cleanGene}\n`;
                      if (data.template) newBlocks += `\t\t\t\ttemplate = ${data.template}\n`;
                      
                      if (data.type === 'range') {
                          newBlocks += `\t\t\t\trange = ${data.valData}\n`;
                      } else {
                          let val = typeof data.valData === 'number' ? data.valData : 0;
                          if (val > 1) val = val / 255.0; 
                          newBlocks += `\t\t\t\tvalue = ${val.toFixed(3)}\n`;
                      }
                      newBlocks += `\t\t\t}`;
                  });
                  
                  const lastBrace = result.lastIndexOf('}');
                  if (lastBrace !== -1) {
                      result = result.substring(0, lastBrace) + newBlocks + "\n\t\t" + result.substring(lastBrace);
                  } else {
                      result += "\n" + newBlocks;
                  }
              }
              content = result;

          } else {
              // SCRATCH GENERATION
              content = `# Generated by Morph Lab for ${downloadName}\n`;
              content += `exported_modifier_group = {\n\tdna_modifiers = {\n\t\thuman = {\n`;

              sortedGenes.forEach(gene => {
                  const data = fileObj.morphs[gene];
                  if (data) {
                      const cleanGene = gene.split('#')[0];
                      
                      content += `\t\t\tmorph = {\n`;
                      content += `\t\t\t\tmode = ${data.mode}\n`;
                      content += `\t\t\t\tgene = ${cleanGene}\n`;
                      if (data.template) content += `\t\t\t\ttemplate = ${data.template}\n`;
                      
                      if (data.type === 'range') {
                          content += `\t\t\t\trange = ${data.valData}\n`;
                      } else {
                          let floatVal = typeof data.valData === 'number' ? data.valData : 0;
                          if (floatVal > 1) floatVal = floatVal / 255.0; 
                          content += `\t\t\t\tvalue = ${floatVal.toFixed(3)}\n`;
                      }
                      content += `\t\t\t}\n`;
                  }
              });
              content += `\t\t}\n\t}\n}\n`;
          }
      }

      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = downloadName.endsWith('.txt') ? downloadName : `${downloadName}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  };

  const handleEditGeneName = (oldName: string) => {
    const newName = prompt("Rename Gene ID:", oldName);
    if (!newName || newName === oldName) return;

    setGlobalAllGenes(prev => {
        const next = new Set(prev);
        next.delete(oldName);
        next.add(newName);
        return next;
    });

    setGlobalParsedData(prev => prev.map(file => {
        if (file.morphs[oldName]) {
            const updatedMorphs = { ...file.morphs };
            updatedMorphs[newName] = updatedMorphs[oldName];
            delete updatedMorphs[oldName];
            return { ...file, morphs: updatedMorphs, isModified: true };
        }
        return file;
    }));
  };

  const handleCellClick = (e: React.MouseEvent, fileName: string, gene: string) => {
    e.stopPropagation();
    const fileObj = globalParsedData.find(f => f.fileName === fileName);
    if (!fileObj) return;

    // Determine type
    const isMod = !fileObj.isBaseline && !fileObj.isPatch && !fileObj.isDefault && !fileObj.isDnaPaste;
    const isDna = fileObj.isBaseline || fileObj.isPatch || fileObj.isDnaPaste || fileObj.isDefault;

    const existing = fileObj.morphs[gene];
    const data = existing || { 
        valData: 0, 
        mode: isMod ? 'replace' : 'dna', 
        template: '', 
        type: 'value' 
    };

    setEditPopup({
        fileName,
        gene,
        data,
        rect: e.currentTarget.getBoundingClientRect(),
        isModFile: isMod,
        isDnaFile: isDna
    });
  };

  const handleSaveCell = (newData: MorphData) => {
     if(!editPopup) return;
     setGlobalParsedData(prev => prev.map(f => {
         if (f.fileName !== editPopup.fileName) return f;
         const newMorphs = { ...f.morphs };
         newMorphs[editPopup.gene] = newData;
         return { ...f, morphs: newMorphs, isModified: true };
     }));
     setEditPopup(null);
  };

  const handleHeaderClick = (name: string) => {
    setCurrentSort(prev => ({
      col: name,
      dir: prev.col === name ? -prev.dir : 1,
      type: name === 'gene' ? 'name' : 'value'
    }));
  };

  const modFiles = useMemo(() => {
      return globalParsedData.filter(d => !d.isBaseline && !d.isDefault && !d.isDnaPaste && !d.isPatch);
  }, [globalParsedData]);

  return (
    <div className="flex flex-col gap-4 w-full animate-fade-in h-[calc(100vh-100px)]">
      
      {/* Cell Editor Popover */}
      {editPopup && (
          <SmartCellEditor 
            cell={editPopup}
            onSave={handleSaveCell}
            onClose={() => setEditPopup(null)}
          />
      )}

      {/* Add Morph Modal */}
      <AddMorphModal 
          isOpen={isAddMorphOpen}
          onClose={() => setIsAddMorphOpen(false)}
          onAdd={handleAddMorph}
          existingGenes={globalAllGenes}
      />

      {/* TOP PANEL: DNA WORKBENCH */}
      <div className="w-full shrink-0">
        <div className="bg-stone-900/50 p-4 rounded border border-stone-700 shadow-lg">

          <div className="flex flex-col md:flex-row gap-6">

            {/* 1. Parser Section */}
            <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-ck3-accent font-serif text-sm font-bold flex items-center gap-2">🧬 DNA Workbench</h3>
                    <div className="text-[10px] text-emerald-500 h-4">{dnaStatus}</div>
                </div>
                <textarea
                    className="w-full bg-black/50 border border-stone-700 rounded p-2 text-xs font-mono text-stone-200 focus:border-ck3-accent outline-none h-24 resize-none placeholder:text-stone-500"
                    placeholder="Paste Character DNA here..."
                    value={charDnaText}
                    onChange={e => setCharDnaText(e.target.value)}
                />
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px bg-stone-700 my-1"></div>

            {/* 2. Mixer Section */}
            <div className="flex-1 flex flex-col justify-between">
                <label className="text-[10px] uppercase text-stone-400 block font-bold mb-2">Mix Columns</label>

                <div className="flex gap-2 mb-3">
                    <select
                        className="flex-1 bg-stone-800 border border-stone-700 text-xs p-2 rounded text-stone-200 outline-none focus:border-ck3-accent appearance-none"
                        value={patchA}
                        onChange={e => setPatchA(e.target.value)}
                    >
                        <option value="" disabled>Input A...</option>
                        {globalParsedData.map(d => <option key={d.fileName} value={d.fileName}>{d.fileName}</option>)}
                    </select>

                    <select
                        className="flex-1 bg-stone-800 border border-stone-700 text-xs p-2 rounded text-stone-200 outline-none focus:border-ck3-accent appearance-none"
                        value={patchB}
                        onChange={e => setPatchB(e.target.value)}
                    >
                        <option value="" disabled>Input B...</option>
                        {globalParsedData.map(d => <option key={d.fileName} value={d.fileName}>{d.fileName}</option>)}
                    </select>
                </div>

                <div className="flex gap-2">
                    <button onClick={() => handleMix(true)} className="flex-1 bg-ck3-accent hover:bg-red-800 text-white py-2 rounded text-xs font-bold uppercase transition-colors shadow-md border border-red-900 flex items-center justify-center gap-2">
                        <span>🎲</span> Generate Mix (Sweet Spot)
                    </button>
                    <button onClick={() => handleMix(false)} className="flex-1 bg-emerald-700 hover:bg-emerald-600 text-white py-2 rounded text-xs font-bold uppercase transition-colors shadow-md border border-emerald-900 flex items-center justify-center gap-2">
                        <span>⚡</span> Create Patch Column
                    </button>
                </div>
            </div>

          </div>
        </div>
      </div>

      {/* BOTTOM PANEL: TABLE */}
      <div className="flex-1 flex flex-col min-w-0 bg-ck3-paper border border-stone-700 rounded-lg shadow-2xl overflow-hidden h-full relative">
          
          {/* Toolbar Header */}
          <div className="p-4 border-b border-stone-700 bg-stone-900/40 flex flex-wrap items-end gap-6 shrink-0">
            
            {/* FILE MANAGEMENT */}
            <div className="flex flex-col gap-2 border-r border-stone-700 pr-6">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">File Management</span>
              <div className="flex gap-2">
                 <label className="cursor-pointer bg-stone-700 hover:bg-stone-600 text-stone-200 text-xs font-bold px-4 py-2 rounded flex items-center gap-2 transition-colors uppercase shadow-sm border border-stone-600">
                    Reset & Load
                    <input type="file" multiple accept=".txt" className="hidden" onChange={(e) => handleFileUpload(e, true)} />
                 </label>
                 <label className="cursor-pointer bg-ck3-accent/20 hover:bg-ck3-accent/30 text-ck3-accentLight border border-ck3-accent/50 text-xs font-bold px-4 py-2 rounded flex items-center gap-2 transition-colors uppercase shadow-sm">
                    Add Column
                    <input type="file" multiple accept=".txt" className="hidden" onChange={(e) => handleFileUpload(e, false)} />
                 </label>
                 <button onClick={() => setIsEditMode(!isEditMode)} className={`px-4 py-2 rounded text-xs font-bold uppercase transition-colors shadow-sm border ${isEditMode ? 'bg-red-900/50 border-red-700 text-red-200 hover:bg-red-900' : 'bg-stone-800 border-stone-600 text-stone-400 hover:text-stone-200 hover:bg-stone-700'}`}>
                    {isEditMode ? 'Done Editing' : 'Edit Cols'}
                 </button>
              </div>
            </div>

            {/* COMPARISON SETTINGS */}
            <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Comparison Settings</span>
              <div className="flex gap-2 items-center">
                 <select 
                    value={currentRefCol} 
                    onChange={(e) => setCurrentRefCol(e.target.value)}
                    className="bg-stone-800 border border-stone-600 text-stone-200 text-xs rounded px-3 py-2 outline-none focus:border-ck3-accent h-[34px] min-w-[150px]"
                 >
                    {globalParsedData.map(d => <option key={d.fileName} value={d.fileName}>Vs: {d.fileName}</option>)}
                 </select>
                 <div className="relative flex-1">
                    <input 
                       type="text" 
                       placeholder="Search genes..." 
                       value={searchTerm}
                       onChange={(e) => setSearchTerm(e.target.value)}
                       className="bg-stone-900 border border-stone-600 text-stone-200 text-xs rounded px-3 py-2 pl-8 outline-none focus:border-ck3-accent w-full h-[34px] placeholder:text-stone-500"
                    />
                    <span className="absolute left-2 top-2 text-stone-500 text-xs">🔍</span>
                 </div>
                 <button
                    onClick={() => setIsGrouped(!isGrouped)}
                    className={`px-3 py-2 border rounded transition-colors text-xs font-bold uppercase flex items-center gap-2 ${isGrouped ? 'bg-ck3-accent text-stone-900 border-ck3-accent' : 'bg-stone-800 text-stone-400 border-stone-700 hover:text-white'}`}
                 >
                    {isGrouped ? <List size={14}/> : <Layers size={14}/>} 
                    {isGrouped ? 'Flat View' : 'Group View'}
                 </button>
                 <button 
                    onClick={() => handleHeaderClick('diff')}
                    className="px-3 py-2 bg-emerald-900/50 hover:bg-emerald-800 text-emerald-200 border border-emerald-800 rounded transition-colors text-xs font-bold uppercase"
                 >
                    Sort Max Diff
                 </button>
                 <button 
                    onClick={() => setIsAddMorphOpen(true)}
                    className="px-3 py-2 bg-stone-700 hover:bg-stone-600 text-stone-200 border border-stone-600 rounded transition-colors text-xs font-bold uppercase flex items-center gap-1"
                 >
                    <Plus size={12} /> Morph
                 </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto bg-black/20 w-full relative">
            <table className="w-full border-collapse text-xs table-fixed">
              <thead className="sticky top-0 z-20 bg-stone-800 border-b border-stone-600 shadow-md">
                <tr>
                  <th className="p-2 text-left w-48 border-r border-stone-700 cursor-pointer hover:bg-stone-700 transition-colors bg-stone-800 text-ck3-accent font-serif" onClick={() => handleHeaderClick('gene')}>
                    Gene Name
                    {currentSort.col === 'gene' && <span className="ml-1 text-ck3-accent">{currentSort.dir === 1 ? '▲' : '▼'}</span>}
                  </th>
                  {globalParsedData.map((fd, index) => {
                     let headerStyle: React.CSSProperties = {};
                     if(fd.fileName === currentRefCol) headerStyle = { borderTop: "3px solid #b45309" };
                     
                     // Dynamic resizing width
                     const width = columnWidths[fd.fileName] || (fd.fileName === "Default" ? 80 : 160);
                     const widthStr = `${width}px`;

                     return (
                        <th 
                            key={fd.fileName + index} 
                            style={{ ...headerStyle, width: widthStr, minWidth: widthStr }} 
                            className="p-2 text-left border-r border-stone-700 cursor-pointer hover:bg-stone-700 transition-colors bg-stone-800 relative group"
                            onClick={() => handleHeaderClick(fd.fileName)}
                        >
                          <div className="flex justify-between items-center overflow-hidden">
                            <div className="flex items-center gap-1 overflow-hidden pr-2">
                                <span className={`truncate font-serif text-stone-100 group-hover:text-white transition-colors ${fd.fileName === "Default" ? "text-[10px]" : ""}`} title={fd.fileName}>{fd.fileName}</span>
                                {fd.isModified && <span className="text-amber-500 text-[9px] font-bold" title="Contains manual edits">●</span>}
                            </div>
                            {/* DOWNLOAD BUTTON */}
                            {!fd.isDefault && (
                              <button onClick={(e) => { e.stopPropagation(); handleDownloadClick(fd.fileName); }} className="bg-stone-900 hover:bg-stone-600 text-stone-400 hover:text-white rounded px-2 py-1 text-xs border border-stone-600 transition-all opacity-70 group-hover:opacity-100 ml-1 shrink-0" title="Download">⬇️</button>
                            )}
                          </div>
                          {isEditMode ? (
                            <div className="flex items-center justify-center gap-2 mt-2 bg-black/20 p-1 rounded border border-stone-700/50">
                                <button 
                                    disabled={index === 0} 
                                    onClick={(e) => { e.stopPropagation(); moveColumn(index, -1); }}
                                    className="text-stone-400 hover:text-white disabled:opacity-20 hover:bg-stone-700 px-1.5 py-0.5 rounded transition-colors"
                                >
                                    ◀
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); deleteColumn(fd.fileName); }}
                                    className="text-red-400 hover:text-red-200 hover:bg-red-900/50 px-1.5 py-0.5 rounded transition-colors"
                                >
                                    ✖
                                </button>
                                <button 
                                    disabled={index === globalParsedData.length - 1} 
                                    onClick={(e) => { e.stopPropagation(); moveColumn(index, 1); }}
                                    className="text-stone-400 hover:text-white disabled:opacity-20 hover:bg-stone-700 px-1.5 py-0.5 rounded transition-colors"
                                >
                                    ▶
                                </button>
                            </div>
                          ) : (
                            currentSort.col === fd.fileName && <div className="text-[9px] text-ck3-accent mt-1 font-normal">{currentSort.dir === 1 ? '▲ Ascending' : '▼ Descending'}</div>
                          )}
                          
                          {/* Resizer Handle */}
                          <div
                                className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-ck3-accent z-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                onMouseDown={(e) => startResize(e, fd.fileName)}
                                onClick={(e) => e.stopPropagation()} 
                           />
                        </th>
                     );
                  })}
                </tr>
              </thead>
              <tbody>
                {Object.entries(groupedGenesDisplay).map(([groupName, genes]) => {
                   const geneList = genes as string[];
                   if (geneList.length === 0) return null;
                   return (
                     <React.Fragment key={groupName}>
                        {isGrouped && (
                            <tr className="sticky top-[42px] z-10">
                                <td colSpan={globalParsedData.length + 1} className="p-2 font-serif font-bold text-ck3-accent uppercase tracking-widest text-xs border-b border-ck3-accent/20 pl-4 bg-stone-900">
                                    {groupName}
                                </td>
                            </tr>
                        )}
                        {geneList.map(gene => {
                            const refObj = globalParsedData.find(d => d.fileName === currentRefCol) || globalParsedData[0];
                            const refVal = getNumericForSort(refObj, gene);
                            
                            // FIX: Declare cleanId first
                            const cleanId = gene.split('#')[0];
                            const def = GENE_DEFINITIONS.find(g => g.id === cleanId);
                            const isHalf = def ? def.min < 0 : false;
                            
                            return (
                                <tr id={`row-${gene}`} key={gene} className="hover:bg-stone-800/50 border-b border-stone-800/50 transition-colors group/row">
                                <td className="p-2 border-r border-stone-800 font-bold truncate text-ck3-accent cursor-pointer hover:text-white transition-colors bg-stone-900/30 flex justify-between items-center" onDoubleClick={() => handleEditGeneName(gene)}>
                                    <div>
                                        {gene.includes('#') ? (
                                            <span>
                                                {cleanId}
                                                <span className="text-[9px] text-stone-500 ml-1 opacity-70">({gene.split('#')[1]})</span>
                                            </span>
                                        ) : gene}
                                    </div>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleDeleteRow(gene); }}
                                        className="opacity-0 group-hover/row:opacity-100 text-stone-600 hover:text-red-400 transition-opacity p-1"
                                        title="Hide this row"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </td>
                                {globalParsedData.map(fd => {
                                    const data = fd.morphs[gene];
                                    
                                    if (fd.isDefault && !data) {
                                    const val = isHalf ? 0.5 : 0.0;
                                    return <td key={fd.fileName} className="p-2 border-r border-stone-800 opacity-30 italic cursor-pointer hover:opacity-100 transition-opacity text-[10px] text-stone-400" onClick={(e) => handleCellClick(e, fd.fileName, gene)}>{val.toFixed(2)}</td>;
                                    }
                                    
                                    if (!data) return (
                                        <td 
                                            key={fd.fileName} 
                                            className="p-2 border-r border-stone-800 text-stone-500 cursor-pointer hover:bg-stone-800 hover:text-stone-300 transition-colors text-center"
                                            onClick={(e) => handleCellClick(e, fd.fileName, gene)}
                                            title="Click to add value"
                                        >
                                            -
                                        </td>
                                    );
                                    
                                    const curVal = getNumericForSort(fd, gene);
                                    let valColor = "text-stone-200";
                                    if (refVal !== -999 && curVal !== -999 && fd.fileName !== currentRefCol) {
                                    if (curVal > refVal + 0.001) valColor = "text-emerald-400 font-bold";
                                    else if (curVal < refVal - 0.001) valColor = "text-red-400 font-bold";
                                    }
                
                                    const display = fd.isBaseline || fd.isPatch || fd.isDnaPaste 
                                    ? `${(data.valData/255).toFixed(2)} (${data.valData})`
                                    : typeof data.valData === 'number' ? data.valData.toFixed(3) : data.valData;
                
                                    return (
                                    <td key={fd.fileName} className="p-2 border-r border-stone-800 group relative cursor-pointer hover:bg-stone-800 transition-colors" onClick={(e) => handleCellClick(e, fd.fileName, gene)}>
                                        <div className="flex flex-col">
                                        <span className={valColor}>{display}</span>
                                        <div className="text-[9px] text-stone-400 truncate group-hover:text-stone-200 flex items-center gap-1 mt-0.5">
                                            {data.mode !== 'dna' && data.mode !== 'patch' && (
                                            <span className={`uppercase font-bold text-[8px] px-1 rounded ${
                                                data.mode === 'add' ? 'bg-cyan-900/30 text-cyan-400' : 
                                                data.mode === 'modify' ? 'bg-purple-900/30 text-purple-400' : 
                                                data.mode === 'replace' ? 'bg-stone-700 text-stone-300' : 'bg-amber-900/30 text-amber-400'
                                            }`}>{data.mode}</span>
                                            )}
                                            {data.template && <span className="italic text-stone-500">{data.template}</span>}
                                        </div>
                                        </div>
                                        
                                        {/* DELETE BUTTON */}
                                        {!fd.isDefault && (
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleDeleteCell(fd.fileName, gene); }} 
                                                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-red-500 hover:text-white bg-stone-900/50 hover:bg-red-900 rounded-full w-5 h-5 flex items-center justify-center text-[10px] transition-all"
                                                title="Delete this morph entry"
                                            >
                                                &times;
                                            </button>
                                        )}
                                    </td>
                                    );
                                })}
                                </tr>
                            );
                        })}
                     </React.Fragment>
                   );
                })}
              </tbody>
            </table>
          </div>
          
          {/* EXPORT MODAL */}
          {exportModal.isOpen && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-stone-900 border border-ck3-accent rounded-lg p-6 max-w-md w-full shadow-2xl relative">
                    <button onClick={() => setExportModal({isOpen: false, targetFile: null})} className="absolute top-2 right-2 text-stone-500 hover:text-white">&times;</button>
                    <h3 className="text-xl font-serif text-ck3-accent mb-4 border-b border-stone-800 pb-2">Export DNA</h3>
                    <p className="text-stone-400 text-sm mb-6">Choose how you want to export <strong className="text-white">{exportModal.targetFile}</strong>:</p>
                    
                    <div className="space-y-4">
                        <button onClick={() => confirmDnaExport('manual')} className="w-full bg-stone-800 hover:bg-stone-700 border border-stone-600 text-left p-4 rounded group transition-colors">
                            <div className="font-bold text-stone-200 group-hover:text-ck3-accent transition-colors">1. Current Values (Manual Edits)</div>
                            <div className="text-xs text-stone-500 mt-1">Export the column exactly as it appears in the grid, including any manual tweaks you made.</div>
                        </button>
                        
                        <div className="w-full bg-stone-800 border border-stone-600 p-4 rounded">
                            <div className="font-bold text-stone-200 mb-2">2. Apply Mod File</div>
                            <div className="text-xs text-stone-500 mb-3">Re-calculate this DNA by applying the rules from a loaded Mod file.</div>
                            <select 
                                className="w-full bg-black/30 border border-stone-700 rounded p-2 text-sm text-stone-300 outline-none focus:border-ck3-accent mb-3"
                                value={selectedModForApply}
                                onChange={e => setSelectedModForApply(e.target.value)}
                            >
                                <option value="">Select Mod File...</option>
                                {modFiles.map(f => <option key={f.fileName} value={f.fileName}>{f.fileName}</option>)}
                            </select>
                            <button 
                                onClick={() => confirmDnaExport('applied')}
                                disabled={!selectedModForApply}
                                className="w-full bg-ck3-accent hover:bg-ck3-accentLight text-white font-bold py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Apply & Download
                            </button>
                        </div>
                    </div>
                </div>
            </div>
          )}
      </div>
    </div>
  );
};

export default DnaComparatorExperimental;
