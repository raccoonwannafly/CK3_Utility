
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { GeneDefinition } from '../../types';
import { LOADED_DOCUMENTS } from '../../services/docLoader';

interface GeneInfoProps {
  definition: GeneDefinition;
}

const GeneInfo: React.FC<GeneInfoProps> = ({ definition }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 500, height: 600 });
  const [rawContent, setRawContent] = useState<string | null>(null);
  const [sourceFile, setSourceFile] = useState<string>('');
  const [loading, setLoading] = useState(false);
  
  // Refs for drag/resize calculations
  const dragOffset = useRef<{ x: number, y: number } | null>(null);
  const resizeStart = useRef<{ x: number, y: number, w: number, h: number } | null>(null);

  // Set initial position to center of screen when opened
  useEffect(() => {
    if (isOpen) {
      setPosition({
        x: Math.max(50, window.innerWidth / 2 - size.width / 2),
        y: Math.max(50, window.innerHeight / 2 - size.height / 2)
      });
      fetchGeneData();
    }
  }, [isOpen, definition.id]);

  const fetchGeneData = async () => {
    setLoading(true);
    setRawContent(null);
    setSourceFile('');
    
    // Tiny delay to allow UI to show loading state
    await new Promise(r => setTimeout(r, 10));

    try {
      let foundBlock: string | null = null;
      let foundInFile = '';

      // Search all loaded documents
      for (const doc of LOADED_DOCUMENTS) {
        if (!doc.content) continue;
        
        // Fast pre-check before expensive regex
        if (doc.content.includes(definition.id)) {
            const block = extractBlock(doc.content, definition.id);
            if (block) {
                foundBlock = block;
                foundInFile = doc.title;
                break; // Stop at first match
            }
        }
      }

      if (foundBlock) {
        setRawContent(foundBlock);
        setSourceFile(foundInFile);
      } else {
        setRawContent(`Definition for "${definition.id}" not found in any loaded documentation files.`);
      }
    } catch (error) {
      setRawContent("Error searching documentation.");
    } finally {
      setLoading(false);
    }
  };

  const extractBlock = (text: string, startKey: string): string | null => {
    // Regex to find "key = {" allowing for whitespace and start of line or whitespace before key
    const regex = new RegExp(`(^|\\s)${startKey}\\s*=\\s*\\{`, 'm');
    const match = text.match(regex);
    
    if (!match || match.index === undefined) return null;
    
    const startIndex = match.index + match[0].indexOf(startKey);
    let openBraces = 0;
    let endIndex = -1;
    let started = false;

    // Simple brace counting
    for (let i = startIndex; i < text.length; i++) {
      if (text[i] === '{') {
        openBraces++;
        started = true;
      } else if (text[i] === '}') {
        openBraces--;
      }

      if (started && openBraces === 0) {
        endIndex = i + 1;
        break;
      }
    }

    if (endIndex !== -1) {
      return text.substring(startIndex, endIndex);
    }
    return null;
  };

  // Basic syntax highlighting for the Paradox script
  const renderHighlightedCode = (code: string) => {
    // Simple tokenizer for display purposes
    const tokens = code.split(/(\s+|[{}=])/g);
    
    return tokens.map((token, i) => {
      if (['male', 'female', 'boy', 'girl'].includes(token)) {
        return <span key={i} className="text-ck3-forgeAccent font-bold">{token}</span>;
      }
      if (['setting', 'decal', 'attribute', 'value', 'min', 'max', 'age', 'curve', 'mode', 'index'].includes(token)) {
        return <span key={i} className="text-blue-300">{token}</span>;
      }
      if (token.startsWith('"') && token.endsWith('"')) {
        return <span key={i} className="text-green-300">{token}</span>;
      }
      if (!isNaN(parseFloat(token))) {
        return <span key={i} className="text-orange-300">{token}</span>;
      }
      if (token.startsWith('#')) {
         return <span key={i} className="text-gray-500">{token}</span>;
      }
      return <span key={i}>{token}</span>;
    });
  };

  // --- Dragging Logic ---
  const handleDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
    document.addEventListener('mousemove', handleDragging);
    document.addEventListener('mouseup', handleDragEnd);
  };

  const handleDragging = (e: MouseEvent) => {
    if (dragOffset.current) {
      setPosition({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y
      });
    }
  };

  const handleDragEnd = () => {
    dragOffset.current = null;
    document.removeEventListener('mousemove', handleDragging);
    document.removeEventListener('mouseup', handleDragEnd);
  };

  // --- Resizing Logic ---
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    resizeStart.current = {
      x: e.clientX,
      y: e.clientY,
      w: size.width,
      h: size.height
    };
    document.addEventListener('mousemove', handleResizing);
    document.addEventListener('mouseup', handleResizeEnd);
  };

  const handleResizing = (e: MouseEvent) => {
    if (resizeStart.current) {
      const dx = e.clientX - resizeStart.current.x;
      const dy = e.clientY - resizeStart.current.y;
      setSize({
        width: Math.max(300, resizeStart.current.w + dx),
        height: Math.max(200, resizeStart.current.h + dy)
      });
    }
  };

  const handleResizeEnd = () => {
    resizeStart.current = null;
    document.removeEventListener('mousemove', handleResizing);
    document.removeEventListener('mouseup', handleResizeEnd);
  };

  return (
    <div className="relative inline-block ml-2">
      <button
        onClick={() => setIsOpen(true)}
        className="text-stone-500 hover:text-ck3-gold transition-colors p-1 rounded hover:bg-white/5 group relative"
        aria-label="Gene Information"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
      </button>

      {isOpen && createPortal(
        <div 
          className="fixed z-[100] flex flex-col bg-[#1a1a1a]/95 backdrop-blur-xl border border-ck3-gold/30 rounded-xl shadow-2xl overflow-hidden"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            width: `${size.width}px`,
            height: `${size.height}px`
          }}
        >
          {/* Header (Draggable) */}
          <div 
            onMouseDown={handleDragStart}
            className="p-4 border-b border-white/10 bg-gradient-to-r from-ck3-gold/10 to-transparent flex justify-between items-start cursor-move select-none"
          >
            <div>
              <h3 className="text-lg font-serif text-ck3-gold font-bold pointer-events-none">{definition.name}</h3>
              <code className="text-[10px] font-mono text-stone-500 mt-1 block pointer-events-none">
                {definition.id}
              </code>
            </div>
            <button 
              onMouseDown={(e) => e.stopPropagation()} 
              onClick={() => setIsOpen(false)}
              className="text-stone-500 hover:text-white transition-colors p-1"
            >
              &times;
            </button>
          </div>

          {/* Content (Scrollable) */}
          <div className="flex-1 overflow-y-auto scrollbar-thin p-0">
            
            {/* Tabs / Overview */}
            <div className="p-6 bg-black/20 border-b border-white/5">
               <div className="text-xs text-stone-200 leading-relaxed opacity-80">
                  <span className="text-ck3-gold font-bold">Type:</span> {definition.type}
                  <span className="mx-2">|</span>
                  <span className="text-ck3-gold font-bold">Group:</span> {definition.group}
                  <span className="mx-2">|</span>
                  <span className="text-ck3-gold font-bold">Default Range:</span> {definition.min} to {definition.max}
               </div>
            </div>

            {/* Raw Code View */}
            <div className="p-4">
              <div className="flex justify-between items-center mb-3">
                 <h4 className="text-[10px] uppercase tracking-widest text-stone-500 font-bold flex items-center gap-2">
                    Source Definition
                 </h4>
                 {sourceFile && (
                     <span className="text-[9px] text-stone-600 bg-stone-900 border border-stone-800 px-2 py-0.5 rounded">
                         Found in: {sourceFile}
                     </span>
                 )}
              </div>
              
              <div className="bg-[#0a0a0a] rounded-lg border border-white/10 p-4 font-mono text-[10px] overflow-x-auto whitespace-pre leading-relaxed text-gray-400 relative min-h-[200px]">
                {loading ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    Loading...
                  </div>
                ) : rawContent ? (
                  renderHighlightedCode(rawContent)
                ) : (
                  <span className="italic opacity-50">No detailed definition available.</span>
                )}
              </div>
            </div>

            {/* Existing Template List (as a summary) */}
            {definition.templates && definition.templates.length > 0 && (
              <div className="px-6 pb-6">
                <h4 className="text-[10px] uppercase tracking-widest text-stone-500 font-bold mb-3 flex items-center gap-2">
                  Template Index
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {definition.templates.map((template, idx) => (
                    <div key={idx} className="bg-white/5 border border-white/5 rounded px-3 py-2 flex justify-between items-center hover:border-ck3-gold/20 transition-colors">
                      <span className="font-mono text-xs text-ck3-gold">{template.name}</span>
                      <span className="text-[9px] text-stone-500">Index: {template.index}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Resize Handle */}
          <div 
            onMouseDown={handleResizeStart}
            className="absolute bottom-0 right-0 w-6 h-6 flex items-center justify-center cursor-se-resize text-stone-500/30 hover:text-ck3-gold transition-colors z-10"
          >
            &#x29F2;
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default GeneInfo;
