
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { FileMorphData, MorphData, MorphMode } from '../types';
import { 
  parseCK3Morphs, 
  getIsHalf, 
  getNumericForSort, 
  generatePatchData,
  findMorphBlocks
} from '../services/morphService';

// --- CELL EDITOR COMPONENT ---
interface CellEditorProps {
  cell: {
    fileName: string;
    gene: string;
    data: MorphData;
    rect: DOMRect;
    isModFile: boolean;
  };
  onSave: (newData: MorphData) => void;
  onClose: () => void;
}

const CellEditor: React.FC<CellEditorProps> = ({ cell, onSave, onClose }) => {
  const [val, setVal] = useState<string>(
    typeof cell.data.valData === 'object' ? `{ ${cell.data.valData} }` : String(cell.data.valData)
  );
  const [template, setTemplate] = useState(cell.data.template || "");
  const [mode, setMode] = useState<MorphMode>(cell.data.mode || 'replace');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  const handleSave = () => {
    const isRange = val.trim().startsWith('{');
    let finalVal: any = val;
    if (!isRange) {
        finalVal = parseFloat(val);
        if (isNaN(finalVal)) finalVal = 0;
    }

    onSave({
      valData: finalVal,
      template: template.trim(),
      mode: mode,
      type: isRange ? 'range' : 'value'
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') onClose();
  };

  // Calculate position to keep it on screen roughly
  const style: React.CSSProperties = {
    top: cell.rect.bottom + window.scrollY,
    left: Math.min(cell.rect.left + window.scrollX, window.innerWidth - 320), // Prevent overflow right
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-transparent" onClick={onClose} />
      <div 
        className="absolute z-50 bg-stone-900 border border-ck3-gold rounded-lg shadow-2xl p-3 w-72 flex flex-col gap-3 animate-fade-in"
        style={style}
      >
        <div className="flex justify-between items-center border-b border-stone-700 pb-2">
           <span className="text-xs font-serif text-ck3-gold uppercase tracking-wider truncate" title={cell.gene}>{cell.gene}</span>
           <button onClick={onClose} className="text-stone-500 hover:text-white">&times;</button>
        </div>

        {/* Value Input */}
        <div>
            <label className="block text-[10px] uppercase text-stone-500 font-bold mb-1">Value</label>
            <input 
                ref={inputRef}
                className="w-full bg-black/40 border border-stone-600 rounded p-1.5 text-sm text-white focus:border-ck3-gold outline-none"
                value={val}
                onChange={e => setVal(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="0.0 or { 0 1 }"
            />
        </div>

        {/* Mode Selector - Only relevant for Mod files usually, but allowed for all to be flexible */}
        <div className="grid grid-cols-2 gap-2">
            <div>
                <label className="block text-[10px] uppercase text-stone-500 font-bold mb-1">Mode</label>
                <select 
                    className="w-full bg-stone-800 border border-stone-600 rounded p-1.5 text-xs text-stone-300 outline-none focus:border-ck3-gold"
                    value={mode}
                    onChange={e => setMode(e.target.value as MorphMode)}
                    disabled={!cell.isModFile} // Lock mode for raw DNA/Baseline usually, unless user forces it
                    title={!cell.isModFile ? "Modes are mostly for Mod/Patch files" : ""}
                >
                    <option value="replace">Replace</option>
                    <option value="add">Add</option>
                    <option value="modify">Modify</option>
                    <option value="modify_multiply">Multiply</option>
                    <option value="dna">DNA (Raw)</option>
                </select>
            </div>
            <div>
                 <label className="block text-[10px] uppercase text-stone-500 font-bold mb-1">Template</label>
                 <input 
                    className="w-full bg-black/40 border border-stone-600 rounded p-1.5 text-xs text-stone-300 focus:border-ck3-gold outline-none"
                    value={template}
                    onChange={e => setTemplate(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="template_name"
                 />
            </div>
        </div>

        <button 
            onClick={handleSave}
            className="w-full bg-ck3-gold hover:bg-ck3-goldLight text-white font-bold py-1.5 rounded text-xs transition-colors shadow-md mt-1"
        >
            Update Gene
        </button>
      </div>
    </>
  );
};

const DnaComparator: React.FC = () => {
  // Data State
  const [globalParsedData, setGlobalParsedData] = useState<FileMorphData[]>([{
    fileName: "Default Baseline",
    morphs: {}, 
    isBaseline: true,
    isDefault: true 
  }]);
  const [globalAllGenes, setGlobalAllGenes] = useState<Set<string>>(new Set());
  const [lastPastedDNA, setLastPastedDNA] = useState("");
  
  // UI State
  const [searchTerm, setSearchTerm] = useState("");
  const [currentRefCol, setCurrentRefCol] = useState("Default Baseline");
  const [currentSort, setCurrentSort] = useState<{ col: string | null, dir: number, type: 'name' | 'value' | 'diff' }>({
    col: 'gene', dir: 1, type: 'name'
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  
  // Cell Editor State
  const [editPopup, setEditPopup] = useState<{ fileName: string, gene: string, data: MorphData, rect: DOMRect, isModFile: boolean } | null>(null);
  
  // Export Modal State
  const [exportModal, setExportModal] = useState<{ isOpen: boolean, targetFile: string | null }>({ isOpen: false, targetFile: null });
  const [selectedModForApply, setSelectedModForApply] = useState("");

  // Workbench State
  const [patchA, setPatchA] = useState("");
  const [patchB, setPatchB] = useState("");
  const [charDnaText, setCharDnaText] = useState("");
  const [dnaStatus, setDnaStatus] = useState("");

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
         // Cleanup references
         if (patchA === fileName) setPatchA("");
         if (patchB === fileName) setPatchB("");
         if (currentRefCol === fileName) setCurrentRefCol(globalParsedData[0].fileName !== fileName ? globalParsedData[0].fileName : (globalParsedData[1]?.fileName || ""));
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

  const handleAddGene = () => {
      const geneName = prompt("Enter the new Gene ID (e.g., gene_nose_width):");
      if (geneName && geneName.trim() !== "") {
          const trimmed = geneName.trim();
          setGlobalAllGenes(prev => {
              const newSet = new Set(prev);
              newSet.add(trimmed);
              return newSet;
          });
      }
  };

  const handleMix = (isSweetSpot: boolean = true) => {
    const colA = globalParsedData.find(d => d.fileName === patchA);
    const colB = globalParsedData.find(d => d.fileName === patchB);
    if (!colA || !colB) return alert("Select two columns.");

    // If not sweet spot (Apply Mod), determine which is Base and which is Mod
    let base = colA;
    let mod = colB;
    
    if (!isSweetSpot) {
        // Heuristic: Mod files are usually NOT baseline/dna/patch/default. 
        // If colA is Mod and colB is DNA, swap so Base is DNA.
        const isMod = (c: FileMorphData) => !c.isBaseline && !c.isPatch && !c.isDnaPaste && !c.isDefault;
        const isDna = (c: FileMorphData) => c.isDnaPaste || c.isBaseline || c.isDefault;

        if (isDna(colB) && isMod(colA)) {
            base = colB;
            mod = colA;
        } else if (isDna(colA) && isMod(colB)) {
            base = colA;
            mod = colB;
        }
    }

    const mixedMorphs = generatePatchData(base, mod, isSweetSpot, globalAllGenes);
    const newName = isSweetSpot 
        ? `Mixed: ${colA.fileName} + ${colB.fileName}`
        : `Applied: ${mod.fileName} on ${base.fileName}`;
    
    // Add new column
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
        // Calculate max diff for sorting
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

  // --- DOWNLOAD LOGIC ---

  const handleDownloadClick = (fileName: string) => {
    const fileObj = globalParsedData.find(d => d.fileName === fileName);
    if (!fileObj) return;

    if (fileObj.isDnaPaste || fileObj.isBaseline) {
        // It's character DNA, open the choice modal
        setExportModal({ isOpen: true, targetFile: fileName });
    } else {
        // It's a Mod File or Patch
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

         // Generate temporary applied data
         const appliedMorphs = generatePatchData(dnaCol, modCol, false, globalAllGenes);
         
         // Create a temporary object to pass to downloader
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
          // DNA Export Logic
          let baseString = lastPastedDNA;
          // If we don't have a base string or we are exporting a constructed patch, create a basic template
          if (!baseString || !baseString.includes("ruler_designer") || fileObj.isPatch) {
               baseString = "ruler_designer_exported={\n\ttype=male\n\tid=0\n\tgenes={ \n\t}\n}";
          }

          if (lastPastedDNA && !fileObj.isPatch) {
              // Try to preserve structure of pasted DNA if possible
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
              // Reconstruct from scratch
              content = "ruler_designer_exported={\n\ttype=male\n\tid=0\n\tgenes={ \n";
              sortedGenes.forEach(gene => {
                  let data = fileObj.morphs[gene];
                  if (!data && fileObj.isDefault) {
                      const isHalf = getIsHalf(gene);
                      data = { valData: isHalf ? 128 : 0, template: "", type: 'value', mode: 'dna' };
                  }
                  
                  if (data) {
                      const val = data.valData;
                      const t = data.template ? `"${data.template}" ` : "";
                      content += `\t\t${gene}={ ${t}${val} ${t}${val} }\n`;
                  }
              });
              content += "\t}\n}";
          }

      } else {
          // MOD FILE EXPORT
          if (fileObj.rawText) {
              // PRESERVE MODE using Robust Brace Counting & Deduplication
              const originalText = fileObj.rawText;
              // 1. Find all morph blocks using robust parser
              const blocks = findMorphBlocks(originalText);
              
              // 2. Build result by iterating blocks and replacing valid ones
              let result = "";
              let cursor = 0;
              const processedGenes = new Set<string>();

              // Sort blocks by position (should already be in order but safe to ensure)
              blocks.sort((a, b) => a.start - b.start);

              for (const block of blocks) {
                  // Copy text before this block
                  result += originalText.substring(cursor, block.start);
                  
                  const gene = block.gene;
                  
                  if (fileObj.morphs[gene]) {
                      // We have data for this gene
                      if (!processedGenes.has(gene)) {
                          // This is the first time we encounter this gene -> Replace it
                          const data = fileObj.morphs[gene];
                          let newBlockBody = `\n\t\t\t\tmode = ${data.mode}\n`;
                          newBlockBody += `\t\t\t\tgene = ${gene}\n`;
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
                          processedGenes.add(gene);
                      } else {
                          // Duplicate - Skip
                      }
                  } else {
                      // No data for this gene, keep original block
                      result += block.content;
                  }
                  
                  cursor = block.end;
              }
              
              // Add remaining text
              result += originalText.substring(cursor);
              
              // 3. Append NEW genes (added via UI)
              const missingGenes = sortedGenes.filter(g => fileObj.morphs[g] && !processedGenes.has(g));

              if (missingGenes.length > 0) {
                  let newBlocks = "";
                  missingGenes.forEach(gene => {
                      const data = fileObj.morphs[gene];
                      newBlocks += `\n\t\t\tmorph = {\n`;
                      newBlocks += `\t\t\t\tmode = ${data.mode}\n`;
                      newBlocks += `\t\t\t\tgene = ${gene}\n`;
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

                  // Insert before closing brace heuristic
                  const lastBrace = result.lastIndexOf('}');
                  if (lastBrace !== -1) {
                      result = result.substring(0, lastBrace) + newBlocks + "\n\t\t" + result.substring(lastBrace);
                  } else {
                      result += "\n" + newBlocks;
                  }
              }
              content = result;

          } else {
              // GENERATE MODE (Scratch / Patch)
              content = `# Generated by CK3 Morph Comparator for ${downloadName}\n`;
              content += `exported_modifier_group = {\n`;
              content += `\tdna_modifiers = {\n`;
              content += `\t\thuman = {\n`;
    
              sortedGenes.forEach(gene => {
                  const data = fileObj.morphs[gene];
                  if (data) {
                      content += `\t\t\tmorph = {\n`;
                      content += `\t\t\t\tmode = ${data.mode}\n`;
                      content += `\t\t\t\tgene = ${gene}\n`;
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
              content += `\t\t}\n`;
              content += `\t}\n`;
              content += `}\n`;
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

    // Determine if it's a mod file (allows advanced modes) or base DNA
    const isMod = !fileObj.isBaseline && !fileObj.isPatch && !fileObj.isDefault && !fileObj.isDnaPaste;
    
    // Get existing data or default
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
        isModFile: isMod
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

  const hasModAndDnaSelected = useMemo(() => {
     const colA = globalParsedData.find(d => d.fileName === patchA);
     const colB = globalParsedData.find(d => d.fileName === patchB);
     if (!colA || !colB) return false;
     
     const hasDna = colA.isDnaPaste || colB.isDnaPaste;
     // A "Mod" file is anything not baseline/patch/dna/default
     const isMod = (c: FileMorphData) => !c.isBaseline && !c.isPatch && !c.isDnaPaste && !c.isDefault;
     const hasMod = isMod(colA) || isMod(colB);
     
     return hasDna && hasMod;
  }, [patchA, patchB, globalParsedData]);

  const modFiles = useMemo(() => {
      return globalParsedData.filter(d => !d.isBaseline && !d.isDefault && !d.isDnaPaste && !d.isPatch);
  }, [globalParsedData]);

  return (
    <div className="flex flex-col gap-4 w-full animate-fade-in h-[calc(100vh-100px)]">
      
      {/* Cell Editor Popover */}
      {editPopup && (
          <CellEditor 
            cell={editPopup}
            onSave={handleSaveCell}
            onClose={() => setEditPopup(null)}
          />
      )}

      {/* TOP PANEL: DNA WORKBENCH (Was Left Panel) */}
      <div className="w-full shrink-0">
        <div className="bg-stone-900/50 p-4 rounded border border-stone-700 shadow-lg">
          
          <div className="flex flex-col md:flex-row gap-6">
            
            {/* 1. Parser Section */}
            <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-ck3-gold font-serif text-sm font-bold flex items-center gap-2">🧬 DNA Workbench</h3>
                    <div className="text-[10px] text-emerald-500 h-4">{dnaStatus}</div>
                </div>
                <textarea 
                    className="w-full bg-black/50 border border-stone-700 rounded p-2 text-xs font-mono text-stone-400 focus:border-ck3-gold outline-none h-24 resize-none"
                    placeholder="Paste Character DNA here..."
                    value={charDnaText}
                    onChange={e => setCharDnaText(e.target.value)}
                />
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px bg-stone-700 my-1"></div>

            {/* 2. Mixer Section */}
            <div className="flex-1 flex flex-col justify-between">
                <label className="text-[10px] uppercase text-stone-500 block font-bold mb-2">Mix Columns</label>
                
                <div className="flex gap-2 mb-3">
                    <select 
                        className="flex-1 bg-stone-800 border border-stone-700 text-xs p-2 rounded text-stone-300 outline-none focus:border-ck3-gold appearance-none"
                        value={patchA}
                        onChange={e => setPatchA(e.target.value)}
                    >
                        <option value="" disabled>Input A...</option>
                        {globalParsedData.map(d => <option key={d.fileName} value={d.fileName}>{d.fileName}</option>)}
                    </select>
                    
                    <select 
                        className="flex-1 bg-stone-800 border border-stone-700 text-xs p-2 rounded text-stone-300 outline-none focus:border-ck3-gold appearance-none"
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
                    
                    {hasModAndDnaSelected && (
                        <button onClick={() => handleMix(false)} className="flex-1 bg-emerald-700 hover:bg-emerald-600 text-white py-2 rounded text-xs font-bold uppercase transition-colors shadow-md border border-emerald-900 animate-pulse flex items-center justify-center gap-2">
                            <span>⚡</span> Apply Mod to DNA
                        </button>
                    )}
                </div>
            </div>

          </div>
        </div>
      </div>

      {/* BOTTOM PANEL: TABLE (Was Right Panel) */}
      <div className="flex-1 flex flex-col min-h-0 bg-ck3-paper border border-stone-700 rounded-lg shadow-2xl overflow-hidden relative">
          
          {/* Toolbar Header */}
          <div className="p-4 border-b border-stone-700 bg-stone-900/40 flex flex-wrap items-end gap-6 shrink-0">
            
            {/* FILE MANAGEMENT */}
            <div className="flex flex-col gap-2 border-r border-stone-700 pr-6">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">File Management</span>
              <div className="flex gap-2">
                 <label className="cursor-pointer bg-stone-700 hover:bg-stone-600 text-stone-200 text-xs font-bold px-4 py-2 rounded flex items-center gap-2 transition-colors uppercase shadow-sm border border-stone-600">
                    Reset & Load
                    <input type="file" multiple accept=".txt" className="hidden" onChange={(e) => handleFileUpload(e, true)} />
                 </label>
                 <label className="cursor-pointer bg-ck3-gold/20 hover:bg-ck3-gold/30 text-ck3-goldLight border border-ck3-gold/50 text-xs font-bold px-4 py-2 rounded flex items-center gap-2 transition-colors uppercase shadow-sm">
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
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Comparison Settings</span>
              <div className="flex gap-2 items-center">
                 <select 
                    value={currentRefCol} 
                    onChange={(e) => setCurrentRefCol(e.target.value)}
                    className="bg-stone-800 border border-stone-600 text-stone-300 text-xs rounded px-3 py-2 outline-none focus:border-ck3-gold h-[34px] min-w-[150px]"
                 >
                    {globalParsedData.map(d => <option key={d.fileName} value={d.fileName}>Vs: {d.fileName}</option>)}
                 </select>
                 <div className="relative flex-1">
                    <input 
                       type="text" 
                       placeholder="Search genes..." 
                       value={searchTerm}
                       onChange={(e) => setSearchTerm(e.target.value)}
                       className="bg-stone-900 border border-stone-600 text-stone-300 text-xs rounded px-3 py-2 pl-8 outline-none focus:border-ck3-gold w-full h-[34px]"
                    />
                    <span className="absolute left-2 top-2 text-stone-500 text-xs">🔍</span>
                 </div>
                 <button 
                    onClick={() => handleHeaderClick('diff')}
                    className="px-3 py-2 bg-emerald-900/50 hover:bg-emerald-800 text-emerald-200 border border-emerald-800 rounded transition-colors text-xs font-bold uppercase"
                 >
                    Sort Max Diff
                 </button>
                 <button 
                    onClick={handleAddGene}
                    className="px-3 py-2 bg-stone-700 hover:bg-stone-600 text-stone-200 border border-stone-600 rounded transition-colors text-xs font-bold uppercase"
                 >
                    + Gene
                 </button>
                 <button 
                    onClick={() => setShowHelp(!showHelp)}
                    className="ml-2 px-3 py-2 bg-stone-800 text-stone-400 hover:text-ck3-gold border border-stone-700 rounded transition-colors text-xs font-bold uppercase"
                 >
                    {showHelp ? "Hide Help" : "Show Help"}
                 </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto bg-black/20 w-full relative">
            <table className="w-full border-collapse text-xs table-fixed">
              <thead className="sticky top-0 z-20 bg-stone-800 border-b border-stone-600 shadow-md">
                <tr>
                  <th className="p-2 text-left w-48 border-r border-stone-700 cursor-pointer hover:bg-stone-700 transition-colors bg-stone-800 text-ck3-gold font-serif" onClick={() => handleHeaderClick('gene')}>
                    Gene Name
                    {currentSort.col === 'gene' && <span className="ml-1 text-ck3-gold">{currentSort.dir === 1 ? '▲' : '▼'}</span>}
                  </th>
                  {globalParsedData.map((fd, index) => {
                     let headerStyle: React.CSSProperties = {};
                     if(fd.fileName === currentRefCol) headerStyle = { borderTop: "3px solid #b45309" };
                     return (
                        <th key={fd.fileName + index} style={headerStyle} className="p-2 text-left min-w-[160px] border-r border-stone-700 cursor-pointer hover:bg-stone-700 transition-colors bg-stone-800" onClick={() => handleHeaderClick(fd.fileName)}>
                          <div className="flex justify-between items-center group">
                            <div className="flex items-center gap-1 overflow-hidden">
                                <span className="truncate font-serif text-stone-300 group-hover:text-white transition-colors" title={fd.fileName}>{fd.fileName}</span>
                                {fd.isModified && <span className="text-amber-500 text-[9px] font-bold" title="Contains manual edits">●</span>}
                            </div>
                            {/* DOWNLOAD BUTTON */}
                            {!fd.isDefault && (
                              <button onClick={(e) => { e.stopPropagation(); handleDownloadClick(fd.fileName); }} className="bg-stone-900 hover:bg-stone-600 text-stone-400 hover:text-white rounded px-2 py-1 text-xs border border-stone-600 transition-all opacity-70 group-hover:opacity-100 ml-2" title="Download">⬇️</button>
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
                            currentSort.col === fd.fileName && <div className="text-[9px] text-ck3-gold mt-1 font-normal">{currentSort.dir === 1 ? '▲ Ascending' : '▼ Descending'}</div>
                          )}
                        </th>
                     );
                  })}
                </tr>
              </thead>
              <tbody>
                {filteredGenes.map(gene => {
                  const refObj = globalParsedData.find(d => d.fileName === currentRefCol) || globalParsedData[0];
                  const refVal = getNumericForSort(refObj, gene);
                  
                  return (
                    <tr key={gene} className="hover:bg-stone-800/50 border-b border-stone-800/50 transition-colors">
                      <td className="p-2 border-r border-stone-800 font-bold truncate text-stone-400 cursor-pointer hover:text-ck3-gold transition-colors bg-stone-900/30" onDoubleClick={() => handleEditGeneName(gene)}>{gene}</td>
                      {globalParsedData.map(fd => {
                        const data = fd.morphs[gene];
                        
                        if (fd.isDefault && !data) {
                          const half = getIsHalf(gene);
                          return <td key={fd.fileName} className="p-2 border-r border-stone-800 opacity-30 italic cursor-pointer hover:opacity-100 transition-opacity" onClick={(e) => handleCellClick(e, fd.fileName, gene)}>{half ? '0.50 (128)' : '0.00 (0)'}</td>;
                        }
                        
                        if (!data) return (
                            <td 
                                key={fd.fileName} 
                                className="p-2 border-r border-stone-800 text-stone-700 cursor-pointer hover:bg-stone-800 hover:text-stone-400 transition-colors text-center"
                                onClick={(e) => handleCellClick(e, fd.fileName, gene)}
                                title="Click to add value"
                            >
                                -
                            </td>
                        );
                        
                        const curVal = getNumericForSort(fd, gene);
                        let valColor = "text-stone-300";
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
                              <div className="text-[9px] text-stone-600 truncate group-hover:text-stone-400 flex items-center gap-1 mt-0.5">
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
              </tbody>
            </table>
          </div>
          
          {/* EXPORT MODAL */}
          {exportModal.isOpen && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-stone-900 border border-ck3-gold rounded-lg p-6 max-w-md w-full shadow-2xl relative">
                    <button onClick={() => setExportModal({isOpen: false, targetFile: null})} className="absolute top-2 right-2 text-stone-500 hover:text-white">&times;</button>
                    <h3 className="text-xl font-serif text-ck3-gold mb-4 border-b border-stone-800 pb-2">Export DNA</h3>
                    <p className="text-stone-400 text-sm mb-6">Choose how you want to export <strong className="text-white">{exportModal.targetFile}</strong>:</p>
                    
                    <div className="space-y-4">
                        <button onClick={() => confirmDnaExport('manual')} className="w-full bg-stone-800 hover:bg-stone-700 border border-stone-600 text-left p-4 rounded group transition-colors">
                            <div className="font-bold text-stone-200 group-hover:text-ck3-gold transition-colors">1. Current Values (Manual Edits)</div>
                            <div className="text-xs text-stone-500 mt-1">Export the column exactly as it appears in the grid, including any manual tweaks you made.</div>
                        </button>
                        
                        <div className="w-full bg-stone-800 border border-stone-600 p-4 rounded">
                            <div className="font-bold text-stone-200 mb-2">2. Apply Mod File</div>
                            <div className="text-xs text-stone-500 mb-3">Re-calculate this DNA by applying the rules from a loaded Mod file.</div>
                            <select 
                                className="w-full bg-black/30 border border-stone-700 rounded p-2 text-sm text-stone-300 outline-none focus:border-ck3-gold mb-3"
                                value={selectedModForApply}
                                onChange={e => setSelectedModForApply(e.target.value)}
                            >
                                <option value="">Select Mod File...</option>
                                {modFiles.map(f => <option key={f.fileName} value={f.fileName}>{f.fileName}</option>)}
                            </select>
                            <button 
                                onClick={() => confirmDnaExport('applied')}
                                disabled={!selectedModForApply}
                                className="w-full bg-ck3-gold hover:bg-ck3-goldLight text-white font-bold py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Apply & Download
                            </button>
                        </div>
                    </div>
                </div>
            </div>
          )}
          
          {showHelp && (
              <div className="absolute inset-0 bg-stone-900/95 z-50 p-8 overflow-auto animate-fade-in flex flex-col items-center">
                  <div className="max-w-3xl w-full relative">
                      <button onClick={() => setShowHelp(false)} className="absolute top-0 right-0 text-3xl text-stone-500 hover:text-white">&times;</button>
                      <h2 className="text-3xl font-serif text-ck3-gold mb-6">Quick Help</h2>
                      <div className="space-y-6 text-stone-300 leading-relaxed">
                          <div>
                              <h3 className="text-xl text-white font-bold mb-2">Comparison & Editing</h3>
                              <p>Load multiple DNA or Mod files to compare values. Differences are highlighted in green/red relative to the selected reference column. Double-click any cell to manually edit values.</p>
                          </div>
                          <div>
                              <h3 className="text-xl text-white font-bold mb-2">Mixing Columns</h3>
                              <p>Use the "Mix Columns" panel on the left to create a new "patch" column that blends values from any two existing columns. This is useful for creating genetic variations.</p>
                          </div>
                          <div>
                              <h3 className="text-xl text-white font-bold mb-2">Exporting</h3>
                              <p>You can export any column as a game-ready text file. If exporting a Mod file, you can choose to apply its logic to your base character DNA.</p>
                          </div>
                      </div>
                  </div>
              </div>
          )}
      </div>
    </div>
  );
};

export default DnaComparator;
