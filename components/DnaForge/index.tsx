
import React, { useState, useMemo, useEffect } from 'react';
import { GENE_DEFINITIONS, GENE_GROUPS } from '../../constants_forge';
import { GeneState, ReferenceDocument } from '../../types';
import GeneSlider from './GeneSlider';
import DnaOutput from './DnaOutput';
import { LOADED_DOCUMENTS } from '../../services/docLoader';
import { Search, FileText, ChevronRight, ChevronDown, Check, Copy, SlidersHorizontal, BookOpen, RefreshCw } from 'lucide-react';

const EMOJI_MAP: Record<string, string> = {
    'face': '😐',
    'eyes': '👁️',
    'ears': '👂',
    'nose': '👃',
    'mouth': '👄',
    'head_neck': '👤',
    'body': '🧍',
    'hair': '🎨'
};

const DnaForge: React.FC = () => {
  const [activeGroup, setActiveGroup] = useState<string>(GENE_GROUPS[0].id);
  const [activeDocId, setActiveDocId] = useState<string>('');
  const [docContent, setDocContent] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isOutputOpen, setOutputOpen] = useState(true);
  const [docCopied, setDocCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'forge' | 'docs'>('forge');

  // Initialize gene state
  const [geneValues, setGeneValues] = useState<GeneState>(() => {
    const initial: GeneState = {};
    GENE_DEFINITIONS.forEach(def => {
      const defaultMin = def.templates?.[0]?.range.min ?? def.min;
      initial[def.id] = {
        value: defaultMin < 0 ? 0 : defaultMin, 
        templateIndex: 0
      };
    });
    return initial;
  });

  // Set initial doc if available
  useEffect(() => {
    if (LOADED_DOCUMENTS.length > 0 && !activeDocId) {
      setActiveDocId(LOADED_DOCUMENTS[0].id);
    }
  }, []);

  const handleGeneChange = (id: string, val: number) => {
    setGeneValues(prev => ({
      ...prev,
      [id]: { ...prev[id], value: val }
    }));
  };

  const handleTemplateChange = (id: string, index: number) => {
    const def = GENE_DEFINITIONS.find(d => d.id === id);
    if (!def) return;

    const newTemplate = def.templates?.find(t => t.index === index);
    if (!newTemplate) return;

    const midpoint = newTemplate.range.min + (newTemplate.range.max - newTemplate.range.min) / 2;
    
    setGeneValues(prev => ({
      ...prev,
      [id]: { 
        value: midpoint, 
        templateIndex: index 
      }
    }));
  };

  const handleRandomize = () => {
    const randomState: GeneState = {};
    GENE_DEFINITIONS.forEach(def => {
      let templateIdx = 0;
      let min = def.min;
      let max = def.max;

      if (def.templates && def.templates.length > 0) {
        const randomTemplate = def.templates[Math.floor(Math.random() * def.templates.length)];
        templateIdx = randomTemplate.index;
        min = randomTemplate.range.min;
        max = randomTemplate.range.max;
      }

      const range = max - min;
      let randomVal = Math.random() * range + min;
      
      if (def.rawAttribute === 'index') {
        randomVal = Math.floor(randomVal);
      }
      
      randomState[def.id] = {
        value: parseFloat(randomVal.toFixed(3)),
        templateIndex: templateIdx
      };
    });
    setGeneValues(randomState);
  };

  const activeGenes = useMemo(() => {
    let genes = GENE_DEFINITIONS;
    if (searchTerm.trim() !== '') {
      const lower = searchTerm.toLowerCase();
      return genes.filter(g => 
        g.name.toLowerCase().includes(lower) || 
        g.id.toLowerCase().includes(lower)
      );
    }
    return genes.filter(def => def.group === activeGroup);
  }, [activeGroup, searchTerm]);

  const activeDoc = useMemo(() => {
    return LOADED_DOCUMENTS.find(d => d.id === activeDocId) || LOADED_DOCUMENTS[0];
  }, [activeDocId]);

  useEffect(() => {
    setDocContent(activeDoc?.content || "Content not found.");
  }, [activeDoc]);

  // Group documents for sidebar
  const groupedDocs = useMemo<Record<string, ReferenceDocument[]>>(() => {
      const groups: Record<string, ReferenceDocument[]> = {};
      LOADED_DOCUMENTS.forEach(doc => {
          const cat = doc.category || "General";
          if (!groups[cat]) groups[cat] = [];
          groups[cat].push(doc);
      });
      return groups;
  }, []);

  const copyDocToClipboard = () => {
    navigator.clipboard.writeText(docContent);
    setDocCopied(true);
    setTimeout(() => setDocCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] w-full bg-ck3-bg text-stone-200 overflow-hidden font-sans relative border border-stone-800 rounded-lg shadow-2xl animate-fade-in">
      
      <div className="flex flex-1 overflow-hidden relative">
          
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-stone-900 backdrop-blur-xl border-r border-stone-800 flex flex-col shrink-0 z-10">
            <div className="p-4 border-b border-stone-800 bg-black/20">
            <div className="relative group">
                <Search className="absolute left-3 top-2.5 text-stone-600" size={14} />
                <input 
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => {
                    setSearchTerm(e.target.value);
                    if (e.target.value) setViewMode('forge');
                }}
                className="w-full bg-black/40 border border-white/10 rounded-md py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-ck3-accent/50 focus:bg-black/60 transition-all placeholder:text-stone-600 text-stone-200"
                />
            </div>
            </div>
            
            <nav className="flex-1 overflow-y-auto py-2 px-3 space-y-1">
            {/* Mode Switcher */}
            <div className="flex bg-stone-950/50 p-1 rounded-lg mb-4 border border-stone-800/50">
                <button
                    onClick={() => { setViewMode('forge'); setSearchTerm(''); }}
                    className={`flex-1 flex items-center justify-center py-1.5 rounded text-xs font-bold transition-all ${viewMode === 'forge' ? 'bg-ck3-accent/10 text-ck3-accent' : 'text-stone-500 hover:text-stone-300'}`}
                >
                    <SlidersHorizontal size={12} className="mr-1.5" /> Forge
                </button>
                <button
                    onClick={() => { setViewMode('docs'); setSearchTerm(''); }}
                    className={`flex-1 flex items-center justify-center py-1.5 rounded text-xs font-bold transition-all ${viewMode === 'docs' ? 'bg-ck3-accent/10 text-ck3-accent' : 'text-stone-500 hover:text-stone-300'}`}
                >
                    <BookOpen size={12} className="mr-1.5" /> Docs
                </button>
            </div>

            {viewMode === 'forge' ? (
                // Gene Groups
                GENE_GROUPS.map(group => {
                    const isActive = activeGroup === group.id && searchTerm === '';
                    const emoji = EMOJI_MAP[group.id] || '🧬';
                    return (
                    <button
                        key={group.id}
                        onClick={() => {
                            setActiveGroup(group.id);
                            setSearchTerm('');
                        }}
                        className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 group ${
                        isActive
                            ? 'bg-ck3-accent/10 text-ck3-accent border border-ck3-accent/20'
                            : 'text-stone-500 hover:bg-white/5 hover:text-stone-200 border border-transparent'
                        }`}
                    >
                        <span className={`mr-3 text-lg transition-transform group-hover:scale-110 ${isActive ? '' : 'grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100'}`}>{emoji}</span>
                        <span className={`font-serif text-sm tracking-wide ${isActive ? 'font-bold' : 'font-medium'}`}>{group.name}</span>
                        {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-ck3-accent shadow-[0_0_8px_rgba(212,175,55,0.8)]" />}
                    </button>
                    );
                })
            ) : (
                // Doc Groups
                (Object.entries(groupedDocs) as [string, ReferenceDocument[]][]).map(([category, docs]) => (
                    <div key={category} className="mb-4">
                        <h4 className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-2 px-2 border-b border-white/5 pb-1">
                        {category}
                        </h4>
                        <div className="space-y-1">
                        {docs.map(doc => (
                            <button
                                key={doc.id}
                                onClick={() => setActiveDocId(doc.id)}
                                className={`w-full text-left p-2 pl-3 rounded border transition-all group flex items-center ${
                                activeDocId === doc.id
                                    ? 'bg-ck3-accent/10 border-ck3-accent/30 text-ck3-accent'
                                    : 'bg-transparent border-transparent text-stone-500 hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                <FileText size={12} className={`mr-2 ${activeDocId === doc.id ? 'text-ck3-accent' : 'opacity-50'}`} />
                                <span className="font-serif text-xs truncate">{doc.title}</span>
                            </button>
                        ))}
                        </div>
                    </div>
                ))
            )}
            </nav>

            {viewMode === 'forge' && (
                <div className="p-4 border-t border-stone-800 bg-gradient-to-t from-black/40 to-transparent">
                <button
                    onClick={handleRandomize}
                    className="w-full group flex justify-center items-center gap-2 bg-gradient-to-r from-red-900/80 to-red-800/80 hover:from-red-800 hover:to-red-700 text-red-50 font-serif font-bold py-3 px-4 rounded-lg border border-red-500/30 transition-all shadow-lg hover:shadow-red-900/30"
                >
                    <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
                    <span className="tracking-wide">Randomize</span>
                </button>
                </div>
            )}
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#050505] relative">
            
            {/* Top Header Bar */}
            <header className="px-6 py-4 flex justify-between items-center bg-black/40 backdrop-blur-md border-b border-white/5 sticky top-0 z-30">
            <div className="flex items-center gap-4">
                <div>
                <h2 className="text-xl font-serif text-white drop-shadow-xl font-medium truncate">
                    {searchTerm 
                    ? `Results: "${searchTerm}"` 
                    : (viewMode === 'docs' ? activeDoc?.title : GENE_GROUPS.find(g => g.id === activeGroup)?.name)}
                </h2>
                {viewMode === 'docs' && activeDoc?.category && (
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] uppercase tracking-widest text-ck3-accent">{activeDoc.category}</span>
                    </div>
                )}
                </div>
            </div>
            
            <button 
                onClick={() => setOutputOpen(!isOutputOpen)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded border transition-all text-xs font-bold uppercase tracking-wider ${isOutputOpen ? 'bg-ck3-accent/20 text-ck3-accent border-ck3-accent/30' : 'bg-black/40 text-stone-500 border-white/10 hover:border-white/30'}`}
            >
                <span className="hidden sm:inline">{isOutputOpen ? 'Hide DNA' : 'Show DNA'}</span>
                {isOutputOpen ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
            </button>
            </header>

            {/* Sliders Grid or Docs Content */}
            <main className="flex-1 overflow-hidden relative">
            {viewMode === 'docs' ? (
                <div className="flex-1 h-full overflow-hidden flex flex-col bg-black/20 relative">
                    <div className="absolute top-4 right-6 z-10">
                        {activeDoc && (
                            <button 
                                onClick={copyDocToClipboard}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${
                                docCopied 
                                    ? 'bg-green-900/50 text-green-400 border border-green-500/50' 
                                    : 'bg-stone-800/80 hover:bg-stone-700 text-stone-400 hover:text-white border border-white/10'
                                }`}
                            >
                                {docCopied ? <Check size={12} /> : <Copy size={12} />}
                                {docCopied ? 'Copied' : 'Copy Text'}
                            </button>
                        )}
                    </div>
                    <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
                        <pre className="font-mono text-xs text-stone-300 whitespace-pre-wrap leading-relaxed max-w-4xl">
                        {docContent}
                        </pre>
                    </div>
                </div>
            ) : (
                <div className="h-full overflow-y-auto px-4 sm:px-8 py-6 scrollbar-hide bg-[#050505]">
                <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4 max-w-7xl mx-auto pb-20">
                    {activeGenes.map(def => (
                    <GeneSlider
                        key={def.id}
                        definition={def}
                        value={geneValues[def.id]?.value ?? 0}
                        templateIndex={geneValues[def.id]?.templateIndex ?? 0}
                        onChange={handleGeneChange}
                        onTemplateChange={handleTemplateChange}
                    />
                    ))}
                    {activeGenes.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-32 text-stone-500 opacity-50">
                        <p className="font-serif text-lg italic">
                        {searchTerm ? 'No matching genes found.' : 'No genetic parameters located.'}
                        </p>
                    </div>
                    )}
                </div>
                </div>
            )}
            </main>
        </div>

        {/* Right Panel (Output) */}
        {isOutputOpen && (
            <div className={`w-80 lg:w-96 shadow-2xl border-l border-white/10 z-20`}>
                <DnaOutput geneValues={geneValues} definitions={GENE_DEFINITIONS} />
            </div>
        )}
      </div>
    </div>
  );
};

export default DnaForge;
