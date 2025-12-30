
import { FileMorphData, MorphData, MorphMode, MorphValueType } from '../types';

export const GENES_DEFAULT_HALF = new Set([
  "chin_height", "chin_width",
  "eye_angle", "eye_depth", "eye_distance", "eye_height", "eye_shut",
  "forehead_angle", "forehead_brow_forward", "forehead_brow_height", "forehead_brow_innerHeight", "forehead_brow_outerHeight",
  "forehead_height", "forehead_roundness", "forehead_width",
  "head_body_height", "head_height", "head_hunchbacked", "head_infant_proportions", "head_profile",
  "head_top_height", "head_top_width", "head_width",
  "jaw_angle", "jaw_forward", "jaw_height", "jaw_width",
  "mouth_corner_depth", "mouth_corner_height", "mouth_forward", "mouth_height", 
  "mouth_lower_lip_size", "mouth_upper_lip_size", "mouth_width",
  "neck_length", "neck_width",
  "body_body_shape_apple", "body_body_shape_hourglass", "body_body_shape_pear",
  "body_shape_rectangle", "body_shape_triangle", "body_hunchbacked", "body_infant_proportions"
]);

export function getIsHalf(gene: string): boolean {
  const cleanGene = gene.split('#')[0];
  if (GENES_DEFAULT_HALF.has(cleanGene)) return true;
  if (cleanGene.startsWith("gene_")) {
    const suffix = cleanGene.substring(5);
    if (GENES_DEFAULT_HALF.has(suffix)) return true;
  }
  return false;
}

// --- ROBUST PARSING LOGIC ---

export interface MorphBlockLocation {
  start: number;
  end: number;
  gene: string;
  content: string;
}

/**
 * Scans text for 'morph = { ... }' blocks using brace counting.
 */
export function findMorphBlocks(text: string): MorphBlockLocation[] {
  const blocks: MorphBlockLocation[] = [];
  const regex = /morph\s*=\s*\{/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const start = match.index;
    const openBraceIndex = start + match[0].length - 1;
    
    let balance = 1;
    let end = -1;
    let inQuote = false;
    
    for (let i = openBraceIndex + 1; i < text.length; i++) {
      const char = text[i];
      
      // Handle Quotes to avoid counting braces inside strings
      if (char === '"' && text[i-1] !== '\\') {
        inQuote = !inQuote;
        continue;
      }
      
      if (inQuote) continue;

      // Brace Counting
      if (char === '{') {
        balance++;
      } else if (char === '}') {
        balance--;
        if (balance === 0) {
          end = i + 1;
          break;
        }
      }
    }

    if (end !== -1) {
      const blockContent = text.substring(start, end);
      
      // Extract gene name robustly
      const geneMatch = blockContent.match(/gene\s*=\s*"?([^"\s#\}]+)"?/); 
      
      if (geneMatch) {
         const gene = geneMatch[1].trim();
         blocks.push({ start, end, gene, content: blockContent });
      }
      
      // Advance regex index to end of this block to avoid overlapping matches
      regex.lastIndex = end; 
    }
  }
  
  return blocks;
}

export function parseCK3Morphs(text: string): Record<string, MorphData> {
  const morphs: Record<string, MorphData> = {};
  
  // Pre-process: Remove comments to avoid regex confusion, but preserve newlines
  // This helps finding "morph = {" reliably if it was commented out or if comments exist inside
  // Note: We strip comments carefully to not break strings
  const cleanText = text.replace(/#[^\n\r]*/g, '');
  
  const blocks = findMorphBlocks(cleanText);

  // Group blocks by gene name to handle duplicates
  const grouped: Record<string, MorphData[]> = {};

  // Helper to check for exact duplicate (same mode, template, and value)
  const isDuplicate = (a: MorphData, b: MorphData) => {
      const valA = typeof a.valData === 'string' ? a.valData.replace(/\s+/g, '') : a.valData;
      const valB = typeof b.valData === 'string' ? b.valData.replace(/\s+/g, '') : b.valData;
      // We purposefully check Mode here. If mode is different, it's NOT a duplicate (it's a switch case)
      return a.mode === b.mode && a.template === b.template && valA === valB; 
  };

  for (const block of blocks) {
    const blockContent = block.content;
    const gene = block.gene;

    // Extract other fields from the block content
    const modeMatch = blockContent.match(/mode\s*=\s*"?([^"\s#\}]+)"?/);
    const templateMatch = blockContent.match(/template\s*=\s*"?([^"\s#\}]+)"?/);
    const valueMatch = blockContent.match(/value\s*=\s*([\d\.-]+)/);
    const rangeMatch = blockContent.match(/range\s*=\s*\{([^}]+)\}/);

    let valData: any = 0;
    let type: MorphValueType = 'value';
    
    if (rangeMatch) {
      valData = `{ ${rangeMatch[1].trim()} }`;
      type = 'range';
    } else if (valueMatch) {
      valData = parseFloat(valueMatch[1]);
      type = 'value';
    }

    const newData: MorphData = {
      mode: (modeMatch ? modeMatch[1] : 'replace') as MorphMode,
      template: templateMatch ? templateMatch[1] : '',
      valData: valData,
      type: type
    };

    if (!grouped[gene]) grouped[gene] = [];

    // Only add if not an exact duplicate
    const exists = grouped[gene].some(existing => isDuplicate(existing, newData));
    if (!exists) {
        grouped[gene].push(newData);
    }
  }

  // Flatten into unique keys
  for (const [gene, list] of Object.entries(grouped)) {
      list.forEach((data, index) => {
          // If index is 0, keep original name. If index > 0, append suffix.
          const key = index === 0 ? gene : `${gene}#${index + 1}`;
          morphs[key] = data;
      });
  }

  return morphs;
}

export function normalizeToByte(val: any): number {
  let v = val;
  if (typeof val === 'string' && val.includes('{')) {
    const nums = val.match(/[\d\.-]+/g);
    if (nums && nums.length > 0) {
      // average of range
      v = nums.reduce((a: number, b: string) => a + parseFloat(b), 0) / nums.length;
    } else {
      v = 0;
    }
  } else if (typeof val === 'string') {
      v = parseFloat(val);
  }
  
  if (isNaN(v)) v = 0;
  
  // If it's already a byte (e.g. > 1), don't multiply. But usually morph files are 0-1 floats.
  // We assume inputs <= 1.0 are floats, inputs > 1.0 are bytes.
  // CK3 floats are usually -1.0 to 1.0. 
  // However, normalization logic can be tricky. Let's clamp to 0-255 range.
  // If v is -0.5, we probably want to map it to 0-255? 
  // Standard conversion usually maps 0.0-1.0 to 0-255. 
  // We'll stick to 0-1 -> 0-255 for standard visualization.
  return Math.round(Math.max(0, Math.min(255, v * 255)));
}

export function getNumericForSort(fileObj: FileMorphData, gene: string): number {
  if (fileObj.isDefault) {
    return getIsHalf(gene) ? 0.5 : 0;
  }
  
  const data = fileObj.morphs[gene];
  if (!data) return -999;
  
  let val = data.valData;
  if (fileObj.isBaseline || fileObj.isPatch || fileObj.isDnaPaste) {
    val = val / 255.0; 
  }
  
  if (data.type === 'range' && typeof data.valData === 'string') {
    const nums = data.valData.match(/[\d\.-]+/g);
    if (nums && nums.length > 0) {
      val = nums.reduce((a: number, b: string) => a + parseFloat(b), 0) / nums.length;
    }
  }
  return typeof val === 'number' ? val : 0;
}

export function generatePatchData(colA: FileMorphData, colB: FileMorphData, isSweetSpot: boolean, allGenes: Set<string>): Record<string, MorphData> {
  const newMorphs: Record<string, MorphData> = {};
  allGenes.forEach(gene => {
    const dataA = colA.morphs[gene];
    const dataB = colB.morphs[gene];
    
    let valA = 0; // Byte 0-255
    let valB = 0; // Byte 0-255
    let finalVal = 0;
    let finalTemplate = "";
    
    // 1. Resolve Value A (Base)
    if (dataA) {
      if (colA.isBaseline || colA.isPatch || colA.isDnaPaste || colA.isDefault) {
        valA = typeof dataA.valData === 'number' ? dataA.valData : 0; 
      } else {
        valA = normalizeToByte(dataA.valData); 
      }
      if (dataA.template) finalTemplate = dataA.template;
    } else {
      valA = getIsHalf(gene) ? 128 : 0;
    }
    
    // 2. Resolve Value B (Target/Mod)
    if (dataB) {
      if (colB.isBaseline || colB.isPatch || colB.isDnaPaste || colB.isDefault) {
        valB = typeof dataB.valData === 'number' ? dataB.valData : 0;
      } else {
        valB = normalizeToByte(dataB.valData);
      }
    } else {
      valB = getIsHalf(gene) ? 128 : 0;
    }
    
    if (isSweetSpot) {
      // --- SWEET SPOT MIXING ---
      const E = (valA + valB) / 2;
      const Diff = Math.abs(valA - valB);
      const QD = Diff / 4;
      const min = Math.max(0, E - QD);
      const max = Math.min(255, E + QD);
      finalVal = Math.floor(Math.random() * (max - min + 1)) + min;
      // Inherit template from B if present, else A
      if (dataB && dataB.template) finalTemplate = dataB.template; 
      else if (dataA && dataA.template) finalTemplate = dataA.template;

    } else {
      // --- MOD APPLICATION (Apply B onto A) ---
      // We only apply complex logic if colB is actually a Mod file (raw floats, modes)
      // Otherwise we treat it as a simple overwrite (replace)
      
      const isModFile = !colB.isBaseline && !colB.isPatch && !colB.isDefault && !colB.isDnaPaste;
      const modDataRef = colB.morphs[gene];

      if (isModFile && modDataRef) {
        // Get Mod value 0.0-1.0
        let modVal = 0;
        if (typeof modDataRef.valData === 'number') {
           modVal = modDataRef.valData;
        } else if (modDataRef.type === 'range' && typeof modDataRef.valData === 'string') {
           const nums = modDataRef.valData.match(/[\d\.-]+/g);
           if (nums && nums.length > 0) modVal = nums.reduce((a: number, b: string) => a + parseFloat(b), 0) / nums.length;
        }

        const mode = modDataRef.mode || 'replace';
        const modTemplate = modDataRef.template || "";
        const baseTemplate = dataA?.template || "";

        let baseValNorm = valA / 255.0; // Working in 0.0-1.0 space for modifiers
        
        let applied = false;

        if (mode === 'replace') {
           baseValNorm = modVal;
           finalTemplate = modTemplate; // Replace takes new template
           applied = true;
        } 
        else if (mode === 'add') {
           // Add acts as additive for scalars
           baseValNorm += modVal;
           if (modTemplate) finalTemplate = modTemplate;
           applied = true;
        } 
        else if (mode === 'modify') {
           // Modify: add value IF template matches (or mod template is empty)
           if (modTemplate === "" || modTemplate === baseTemplate) {
              baseValNorm += modVal;
              applied = true;
           }
        } 
        else if (mode === 'modify_multiply') {
           // Multiply: multiply value IF template matches (or mod template is empty)
           if (modTemplate === "" || modTemplate === baseTemplate) {
              baseValNorm *= modVal;
              applied = true;
           }
        }

        // Clamp result
        finalVal = Math.round(Math.max(0, Math.min(255, baseValNorm * 255)));

      } else {
        // Simple Overwrite (DNA to DNA copy)
        finalVal = valB;
        if (dataB && dataB.template) finalTemplate = dataB.template;
      }
    }
    
    newMorphs[gene] = {
      valData: finalVal,
      type: 'value',
      mode: 'patch',
      template: finalTemplate
    };
  });
  
  return newMorphs;
}
