
import React, { useMemo, useState } from 'react';
import { TRAITS } from '../constants';
import { Trait, TraitCategory, CharacterBuild } from '../types';

interface TraitPlannerProps {
  build: CharacterBuild;
  updateBuild: (updates: Partial<CharacterBuild>) => void;
  onSwitchToAdvisor: () => void;
}

const TraitInfoModal: React.FC<{ trait: Trait; onClose: () => void }> = ({ trait, onClose }) => {
    // Helper to generate Wiki URL based on trait name
    const wikiUrl = `https://ck3.paradoxwikis.com/Traits#${trait.name.replace(/ /g, '_')}`;
  
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in" onClick={onClose}>
        <div 
            className="bg-ck3-paper border-2 border-ck3-gold w-full max-w-lg shadow-2xl relative overflow-hidden rounded-lg flex flex-col max-h-[90vh]" 
            onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-stone-900 p-5 border-b border-ck3-gold/50 flex justify-between items-start relative overflow-hidden">
             {/* Decorative Background for Header */}
             <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]"></div>
             
             <div className="relative z-10">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] uppercase font-bold text-stone-400 tracking-widest bg-stone-800 px-2 py-0.5 rounded border border-stone-700">
                        {trait.category}
                    </span>
                    <span className="text-[10px] font-mono text-stone-600">ID: {trait.id}</span>
                </div>
                <h3 className="text-3xl font-serif text-ck3-gold leading-none drop-shadow-md">{trait.name}</h3>
             </div>
             <button onClick={onClose} className="relative z-10 text-stone-500 hover:text-white text-2xl leading-none transition-colors">&times;</button>
          </div>
  
          {/* Body */}
          <div className="p-6 space-y-6 overflow-y-auto bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')] flex-1">
              
              {/* Cost Box */}
              <div className="flex items-center gap-4 bg-stone-800/50 p-4 rounded border border-stone-700">
                  <div className="flex-1">
                      <div className="text-xs uppercase font-bold text-stone-500">Character Cost</div>
                      <div className="text-stone-300 text-xs">Points required to add this trait in Ruler Designer.</div>
                  </div>
                  <div className={`text-2xl font-bold font-serif px-4 py-2 rounded bg-black/40 border ${trait.cost > 0 ? 'text-red-400 border-red-900/30' : 'text-emerald-400 border-emerald-900/30'}`}>
                      {trait.cost > 0 ? `-${trait.cost}` : `+${Math.abs(trait.cost)}`}
                  </div>
              </div>
  
              {/* Effects Section */}
              <div>
                  <h4 className="text-sm font-serif font-bold text-ck3-goldLight border-b border-stone-700 pb-2 mb-3 flex items-center gap-2">
                      <span>📜</span> Effects & Modifiers
                  </h4>
                  <div className="bg-black/20 p-4 rounded border border-stone-700/50 text-stone-200 text-sm leading-relaxed whitespace-pre-wrap font-serif">
                      {trait.description}
                  </div>
              </div>
  
              {/* Incompatibilities */}
              {trait.opposites && trait.opposites.length > 0 && (
                  <div>
                      <h4 className="text-xs font-bold text-stone-500 uppercase mb-3 border-b border-stone-700 pb-1">Incompatible With</h4>
                      <div className="flex flex-wrap gap-2">
                          {trait.opposites.map(oppId => {
                              const oppTrait = TRAITS.find(t => t.id === oppId);
                              return (
                                  <div key={oppId} className="flex items-center gap-2 text-xs bg-red-900/10 text-red-300 border border-red-900/30 px-2 py-1 rounded">
                                      <span className="opacity-50">🚫</span>
                                      <span className="line-through decoration-red-500/50">{oppTrait ? oppTrait.name : oppId}</span>
                                  </div>
                              );
                          })}
                      </div>
                  </div>
              )}
          </div>
  
          {/* Footer */}
          <div className="p-4 bg-stone-900 border-t border-ck3-gold/30 flex justify-between items-center gap-4">
              <span className="text-[10px] text-stone-600 italic">Data based on CK3 v1.x</span>
              <div className="flex gap-3">
                <a 
                    href={wikiUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold rounded transition-colors uppercase border border-stone-600"
                >
                    <span>🌍</span> Open Wiki
                </a>
                <button 
                    onClick={onClose}
                    className="px-6 py-2 bg-ck3-gold hover:bg-ck3-goldLight text-white text-xs font-bold rounded transition-colors uppercase shadow-md"
                >
                    Close
                </button>
              </div>
          </div>
        </div>
      </div>
    );
  };

const TraitPlanner: React.FC<TraitPlannerProps> = ({ build, updateBuild, onSwitchToAdvisor }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [viewingTrait, setViewingTrait] = useState<Trait | null>(null);
  
  const totalCost = useMemo(() => {
    return build.traits.reduce((sum, id) => {
      const trait = TRAITS.find(t => t.id === id);
      return sum + (trait?.cost || 0);
    }, 0);
  }, [build.traits]);

  const toggleTrait = (trait: Trait) => {
    const isSelected = build.traits.includes(trait.id);
    let newTraits = [...build.traits];

    if (isSelected) {
      newTraits = newTraits.filter(id => id !== trait.id);
    } else {
      // Remove incompatibles
      if (trait.opposites) {
        newTraits = newTraits.filter(id => !trait.opposites?.includes(id));
      }
      // Also check if existing traits are incompatible with this new one
      newTraits = newTraits.filter(id => {
        const existing = TRAITS.find(t => t.id === id);
        return !existing?.opposites?.includes(trait.id);
      });
      newTraits.push(trait.id);
    }
    updateBuild({ traits: newTraits });
  };

  const categories = Object.values(TraitCategory);
  
  const filteredTraits = useMemo(() => {
      let filtered = TRAITS;
      
      if (selectedCategory !== 'All') {
          filtered = filtered.filter(t => t.category === selectedCategory);
      }
      
      if (searchTerm) {
          const lowerSearch = searchTerm.toLowerCase();
          filtered = filtered.filter(t => 
              t.name.toLowerCase().includes(lowerSearch) || 
              t.description.toLowerCase().includes(lowerSearch)
          );
      }
      
      // Group by category for display
      const grouped: Record<string, Trait[]> = {};
      
      if (selectedCategory === 'All' && !searchTerm) {
          // Default ordering
          categories.forEach(cat => {
              grouped[cat] = filtered.filter(t => t.category === cat);
          });
      } else {
          // If searching or filtering, just show matching
          // We still want to group them by header though
          const distinctCats = Array.from(new Set(filtered.map(t => t.category)));
          distinctCats.forEach(cat => {
               grouped[cat] = filtered.filter(t => t.category === cat);
          });
      }
      
      return grouped;
  }, [searchTerm, selectedCategory]);

  return (
    <div className="space-y-8 animate-fade-in relative">
      
      {/* Modal */}
      {viewingTrait && <TraitInfoModal trait={viewingTrait} onClose={() => setViewingTrait(null)} />}

      {/* Header & Scoreboard */}
      <header className="flex flex-col xl:flex-row xl:items-end justify-between border-b border-stone-700 pb-6 gap-6">
        <div>
          <h2 className="text-4xl font-serif text-ck3-gold mb-2">Character Planner</h2>
          <p className="text-stone-400 max-w-2xl">Forge your dynasty's founder. Select attributes to shape their destiny, stats, and appearance.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
            {/* Stats Summary */}
            <div className="bg-stone-800 p-4 rounded-lg border border-ck3-gold/30 flex items-center justify-between gap-6 shadow-xl flex-1 xl:flex-none">
              <div className="text-right">
                <span className="block text-[10px] uppercase tracking-widest text-stone-500 font-bold">Customization Points</span>
                <span className={`text-3xl font-bold font-serif ${totalCost > 400 ? 'text-red-500' : 'text-emerald-400'}`}>
                  {totalCost} <span className="text-sm font-sans text-stone-500">/ 400</span>
                </span>
              </div>
              <div className="h-10 w-px bg-stone-600 hidden sm:block"></div>
              <button 
                onClick={onSwitchToAdvisor}
                className="bg-ck3-gold hover:bg-ck3-goldLight text-white px-6 py-3 rounded font-bold font-serif transition-colors shadow-lg flex items-center gap-2 whitespace-nowrap"
              >
                <span>👑</span> Finalize Character &rarr;
              </button>
            </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form & Selected (Sticky on XL) */}
        <div className="xl:col-span-4 space-y-6 xl:sticky xl:top-4">
             {/* Character Details Form */}
            <section className="bg-ck3-paper p-6 rounded-lg border border-stone-700 space-y-4 shadow-md">
              <h3 className="text-xl font-serif text-stone-300 border-b border-stone-700 pb-2 flex items-center gap-2">
                  <span>📜</span> Identity
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs uppercase text-stone-500 mb-1 font-bold">Name</label>
                  <input 
                    type="text" 
                    value={build.name} 
                    onChange={e => updateBuild({ name: e.target.value })}
                    className="w-full bg-stone-900 border border-stone-600 rounded p-2.5 text-stone-200 focus:border-ck3-gold outline-none transition-colors"
                    placeholder="Duke William"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs uppercase text-stone-500 mb-1 font-bold">Culture</label>
                      <input 
                        type="text" 
                        value={build.culture} 
                        onChange={e => updateBuild({ culture: e.target.value })}
                        className="w-full bg-stone-900 border border-stone-600 rounded p-2 text-sm text-stone-200 focus:border-ck3-gold outline-none"
                        placeholder="Norman"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase text-stone-500 mb-1 font-bold">Religion</label>
                      <input 
                        type="text" 
                        value={build.religion} 
                        onChange={e => updateBuild({ religion: e.target.value })}
                        className="w-full bg-stone-900 border border-stone-600 rounded p-2 text-sm text-stone-200 focus:border-ck3-gold outline-none"
                        placeholder="Catholic"
                      />
                    </div>
                </div>
                <div>
                  <label className="block text-xs uppercase text-stone-500 mb-1 font-bold">Dynastic Goal</label>
                  <input 
                    type="text" 
                    value={build.goal} 
                    onChange={e => updateBuild({ goal: e.target.value })}
                    className="w-full bg-stone-900 border border-stone-600 rounded p-2.5 text-sm text-stone-200 focus:border-ck3-gold outline-none"
                    placeholder="e.g. Unite the Spanish Thrones"
                  />
                </div>
              </div>
            </section>

            {/* Selected Traits Summary */}
            <section className="bg-ck3-paper p-6 rounded-lg border border-stone-700 space-y-4 shadow-md min-h-[100px]">
              <h3 className="text-xl font-serif text-stone-300 border-b border-stone-700 pb-2 flex justify-between items-center">
                  <span>💎 Selected Traits</span>
                  <span className="text-sm font-sans bg-stone-800 px-2 py-0.5 rounded text-stone-400">{build.traits.length}</span>
              </h3>
              {build.traits.length === 0 ? (
                <div className="text-stone-600 text-center py-8 italic border-2 border-dashed border-stone-800 rounded">No traits selected yet.</div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {build.traits.map(id => {
                    const trait = TRAITS.find(t => t.id === id);
                    if (!trait) return null;
                    return (
                      <div key={id} onClick={() => toggleTrait(trait)} className="cursor-pointer bg-stone-800 border border-stone-600 text-stone-200 px-3 py-1.5 rounded text-xs hover:bg-red-900/40 hover:border-red-500 transition-colors group relative flex items-center gap-2 shadow-sm">
                        <span>{trait.name}</span>
                        <span className={`text-[10px] font-bold px-1 rounded ${trait.cost > 0 ? 'text-red-400 bg-black/30' : 'text-emerald-400 bg-black/30'}`}>{trait.cost}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
        </div>

        {/* Right Column: Trait Selection */}
        <div className="xl:col-span-8 space-y-6">
            
            {/* Filters */}
            <div className="bg-stone-900 p-4 rounded-lg border border-stone-700 flex flex-col sm:flex-row gap-4 sticky top-0 z-20 shadow-xl backdrop-blur-md bg-stone-900/95">
                <div className="flex-1 relative">
                    <input 
                        type="text" 
                        placeholder="Search traits..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-black/40 border border-stone-600 rounded pl-9 pr-4 py-2 text-sm text-stone-200 focus:border-ck3-gold outline-none"
                    />
                    <span className="absolute left-3 top-2 text-stone-500">🔍</span>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
                    <button 
                        onClick={() => setSelectedCategory('All')}
                        className={`px-4 py-2 text-xs font-bold uppercase rounded whitespace-nowrap transition-colors ${selectedCategory === 'All' ? 'bg-ck3-gold text-white' : 'bg-stone-800 text-stone-400 hover:bg-stone-700'}`}
                    >
                        All
                    </button>
                    {categories.map(cat => (
                        <button 
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 text-xs font-bold uppercase rounded whitespace-nowrap transition-colors ${selectedCategory === cat ? 'bg-ck3-gold text-white' : 'bg-stone-800 text-stone-400 hover:bg-stone-700'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Trait Grid */}
            <div className="space-y-8 pb-32">
                {Object.keys(filteredTraits).map(category => {
                  const traits = filteredTraits[category];
                  if (traits.length === 0) return null;

                  return (
                    <section key={category} className="animate-fade-in-up">
                       <h3 className="text-xl font-serif text-stone-400 mb-3 border-b border-stone-800 pb-1 flex items-center gap-2">
                           {category} <span className="text-xs bg-stone-800 text-stone-500 px-2 py-0.5 rounded-full font-sans">{traits.length}</span>
                       </h3>
                       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                         {traits.map(trait => {
                           const isSelected = build.traits.includes(trait.id);
                           const isOpposite = build.traits.some(id => trait.opposites?.includes(id));
                           
                           return (
                             <div 
                               key={trait.id}
                               onClick={() => !isOpposite && toggleTrait(trait)}
                               className={`
                                 relative p-3 rounded border transition-all duration-200 cursor-pointer group select-none flex flex-col min-h-[110px]
                                 ${isSelected 
                                   ? 'bg-gradient-to-br from-stone-800 to-stone-900 border-ck3-gold shadow-[0_0_10px_rgba(180,83,9,0.3)]' 
                                   : isOpposite
                                     ? 'opacity-40 grayscale cursor-not-allowed border-stone-800 bg-stone-950'
                                     : 'bg-stone-900 border-stone-800 hover:border-stone-500 hover:bg-stone-800 shadow-sm'
                                 }
                               `}
                             >
                               {/* Card Header: Name + Cost/Info Group */}
                               <div className="flex justify-between items-start mb-2 gap-2">
                                  <div className="flex-1 min-w-0">
                                      <h4 className={`font-serif font-bold text-sm leading-tight truncate ${isSelected ? 'text-ck3-goldLight' : 'text-stone-300'}`}>
                                          {trait.name}
                                      </h4>
                                      <div className="text-[9px] uppercase font-bold text-stone-600 mt-0.5">{trait.category}</div>
                                  </div>
                                  
                                  <div className="flex items-center gap-1 shrink-0">
                                      {/* Cost Badge */}
                                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border border-white/5 ${trait.cost > 0 ? 'bg-red-900/30 text-red-400' : 'bg-emerald-900/30 text-emerald-400'}`}>
                                        {trait.cost}
                                      </span>
                                      
                                      {/* Info Button (Now Relative, No Obstruction) */}
                                      <button
                                          onClick={(e) => {
                                              e.stopPropagation();
                                              setViewingTrait(trait);
                                          }}
                                          className="w-5 h-5 rounded hover:bg-stone-700 text-stone-500 hover:text-ck3-gold flex items-center justify-center text-xs font-serif font-bold transition-colors"
                                          title={`View full details for ${trait.name}`}
                                      >
                                          i
                                      </button>
                                  </div>
                                </div>

                               {/* Card Body: Description */}
                               <div className="mt-auto">
                                   <p className="text-[10px] text-stone-500 leading-relaxed group-hover:text-stone-400 transition-colors line-clamp-3">
                                     {trait.description}
                                   </p>
                               </div>

                               {/* Selection Indicator */}
                               {isSelected && (
                                  <div className="absolute bottom-2 right-2 w-1.5 h-1.5 bg-ck3-gold rounded-full shadow-[0_0_5px_#b45309]"></div>
                               )}
                             </div>
                           );
                         })}
                       </div>
                    </section>
                  );
                })}
                
                {Object.keys(filteredTraits).length === 0 && (
                    <div className="text-center py-20 text-stone-600">
                        <p>No traits found matching "{searchTerm}".</p>
                    </div>
                )}
            </div>

        </div>
      </div>
    </div>
  );
};

export default TraitPlanner;
