
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { fetchGallery, saveToGallery, updateCharacter, deleteCharacter, importFromSteam } from '../services/geminiService';
import { exportGallery, importGallery } from '../services/ioService';
import { StoredCharacter } from '../types';
import { TRAITS, HISTORICAL_CHARACTERS } from '../constants';
import { Folder, History, Layers, Plus, Trash2, FolderInput, Library, LayoutGrid, List } from 'lucide-react';

interface GalleryProps {
  onNavigate: (tab: string) => void;
}

const Gallery: React.FC<GalleryProps> = ({ onNavigate }) => {
  const [items, setItems] = useState<StoredCharacter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'server' | 'local'>('server');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Navigation State
  const [activeView, setActiveView] = useState<'all' | 'historical' | 'unsorted' | string>('all');
  
  // Custom Collections State (Persisted in localStorage for empty folders)
  const [customCollections, setCustomCollections] = useState<string[]>(() => {
    const saved = localStorage.getItem('ck3_utility_collections');
    return saved ? JSON.parse(saved) : ['Campaign 1'];
  });

  // Selection State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // UI Views
  const [view, setView] = useState<'grid' | 'form' | 'details'>('grid');
  const [selectedItem, setSelectedItem] = useState<StoredCharacter | null>(null);
  
  // Steam Modal
  const [isSteamModalOpen, setIsSteamModalOpen] = useState(false);
  const [steamUrl, setSteamUrl] = useState('');
  const [steamLoading, setSteamLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<StoredCharacter>>({});
  const [formErrors, setFormErrors] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Move To Modal
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);

  // Hidden file input for import
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('ck3_utility_collections', JSON.stringify(customCollections));
  }, [customCollections]);

  const loadGallery = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, source } = await fetchGallery();
      const normalized = data.map((item: any) => ({
          ...item,
          images: item.images || (item.portraitUrl ? [item.portraitUrl] : []),
          bio: item.bio || (item.advisorResponse?.backstory || ""),
          tags: item.tags || [],
          category: item.category || 'custom',
          collection: item.collection || 'Unsorted'
      }));
      setItems(normalized);
      setDataSource(source as 'server' | 'local');
    } catch (err) {
      console.warn("Gallery load failed completely:", err);
      setItems([]);
      setDataSource('local');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGallery();
  }, []);

  // --- DERIVED DATA ---
  
  // Get counts for sidebar
  const counts = useMemo(() => {
      const all = items.length;
      const historical = HISTORICAL_CHARACTERS.length;
      const unsorted = items.filter(i => !i.collection || i.collection === 'Unsorted').length;
      const collections: Record<string, number> = {};
      
      customCollections.forEach(c => collections[c] = 0); // Init 0
      items.forEach(i => {
          if (i.collection && i.collection !== 'Unsorted') {
              collections[i.collection] = (collections[i.collection] || 0) + 1;
          }
      });
      
      return { all, historical, unsorted, collections };
  }, [items, customCollections]);

  // Filter the main list
  const filteredItems = useMemo(() => {
      let baseList: StoredCharacter[] = [];

      if (activeView === 'historical') {
          baseList = HISTORICAL_CHARACTERS;
      } else if (activeView === 'all') {
          baseList = items;
      } else if (activeView === 'unsorted') {
          baseList = items.filter(i => !i.collection || i.collection === 'Unsorted');
      } else {
          // Specific collection
          baseList = items.filter(i => i.collection === activeView);
      }

      return baseList.filter(item => {
          const term = searchTerm.toLowerCase();
          return (
              !term ||
              item.name.toLowerCase().includes(term) ||
              item.culture?.toLowerCase().includes(term) ||
              item.religion?.toLowerCase().includes(term) ||
              item.race?.toLowerCase().includes(term) ||
              item.tags?.some(t => t.toLowerCase().includes(term))
          );
      });
  }, [items, activeView, searchTerm]);


  // --- SELECTION HANDLERS ---
  const toggleSelection = (id: string, e?: React.MouseEvent) => {
      if (e) e.stopPropagation();
      const newSet = new Set(selectedIds);
      if (newSet.has(id)) {
          newSet.delete(id);
      } else {
          newSet.add(id);
      }
      setSelectedIds(newSet);
  };

  const handleSelectAll = () => {
      if (selectedIds.size === filteredItems.length) {
          setSelectedIds(new Set());
      } else {
          setSelectedIds(new Set(filteredItems.map(i => i.id)));
      }
  };

  const clearSelection = () => setSelectedIds(new Set());

  // --- COLLECTION MANAGEMENT ---
  const handleCreateCollection = () => {
      const name = prompt("Enter new collection name:");
      if (name && !customCollections.includes(name)) {
          setCustomCollections(prev => [...prev, name]);
      }
  };

  const handleDeleteCollection = (e: React.MouseEvent, name: string) => {
      e.stopPropagation();
      if (!confirm(`Delete collection "${name}"? Characters inside will be moved to Unsorted.`)) return;
      
      // Update local storage list
      setCustomCollections(prev => prev.filter(c => c !== name));
      
      // Update characters to Unsorted
      const charsToUpdate = items.filter(i => i.collection === name);
      // In a real app we'd batch update. Here we do it optimistically.
      setItems(prev => prev.map(i => i.collection === name ? { ...i, collection: 'Unsorted' } : i));
      
      if (activeView === name) setActiveView('all');
      
      // Fire background updates
      charsToUpdate.forEach(char => {
          updateCharacter(char.id, { collection: 'Unsorted' });
      });
  };

  const handleBulkMove = async (targetCollection: string) => {
      if (selectedIds.size === 0) return;
      
      setLoading(true);
      try {
          const idsToMove = Array.from(selectedIds);
          // Optimistic UI update
          setItems(prev => prev.map(item => 
              idsToMove.includes(item.id) ? { ...item, collection: targetCollection } : item
          ));
          
          // Background requests
          for (const id of idsToMove) {
             await updateCharacter(id, { collection: targetCollection });
          }
          
          clearSelection();
          setIsMoveModalOpen(false);
      } catch (e) {
          alert("Failed to move some items.");
      } finally {
          setLoading(false);
      }
  };


  // --- IO HANDLERS ---
  const handleExport = () => {
      const sourceData = selectedIds.size > 0 
        ? items.filter(i => selectedIds.has(i.id))
        : filteredItems;
        
      if (sourceData.length === 0) return alert("Nothing to export.");
      exportGallery(sourceData);
      clearSelection();
  };

  const handleImportClick = () => {
      fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!confirm("Importing will add these characters to your current list. Continue?")) {
          e.target.value = ''; 
          return;
      }

      setLoading(true);
      try {
          const importedChars = await importGallery(file);
          let successCount = 0;
          for (const char of importedChars.reverse()) {
               await saveToGallery({ ...char, category: 'custom', collection: 'Unsorted' }); 
               successCount++;
          }
          await loadGallery();
          setActiveView('all'); 
          alert(`Successfully imported ${successCount} rulers.`);
      } catch (err: any) {
          alert(`Import failed: ${err.message}`);
      } finally {
          setLoading(false);
          e.target.value = '';
      }
  };

  // --- STEAM IMPORT ---
  const handleSteamImport = async () => {
      if (!steamUrl) return;
      setSteamLoading(true);
      try {
          const char = await importFromSteam(steamUrl);
          await saveToGallery({ ...char, collection: 'Unsorted' });
          await loadGallery();
          setIsSteamModalOpen(false);
          setSteamUrl("");
          setActiveView('all');
          alert(`Successfully imported ${char.name} from Steam Workshop!`);
      } catch (e: any) {
          alert(`Steam Import Failed: ${e.message}`);
      } finally {
          setSteamLoading(false);
      }
  };

  // --- CRUD HANDLERS ---
  const handleCreateNew = () => {
      setFormData({
          name: '',
          culture: '',
          religion: '',
          race: '',
          traits: [],
          images: [],
          tags: [],
          dna: '',
          bio: '',
          goal: '',
          category: 'custom',
          collection: activeView === 'all' || activeView === 'historical' ? 'Unsorted' : activeView
      });
      setFormErrors(null);
      setView('form');
  };

  const handleEdit = (item: StoredCharacter) => {
      if (item.category === 'historical') {
          alert("Historical records cannot be altered.");
          return;
      }
      setFormData({ ...item });
      setFormErrors(null);
      setView('form');
  };

  const handleDelete = async (id: string) => {
      if (activeView === 'historical') return;
      if(!confirm("Are you sure you want to burn this record from the archives?")) return;
      try {
          await deleteCharacter(id);
          setItems(prev => prev.filter(i => i.id !== id));
          if(selectedItem?.id === id) {
              setView('grid');
              setSelectedItem(null);
          }
      } catch (e) {
          alert("Failed to delete character.");
      }
  };

  const handleBulkDelete = async () => {
      if (activeView === 'historical') return alert("Cannot delete historical records.");
      if (selectedIds.size === 0) return;
      if (!confirm(`Are you sure you want to delete ${selectedIds.size} records? This cannot be undone.`)) return;
      
      setLoading(true);
      try {
          const idsToDelete = Array.from(selectedIds) as string[];
          for (const id of idsToDelete) {
              await deleteCharacter(id);
          }
          setItems(prev => prev.filter(item => !selectedIds.has(item.id)));
          setSelectedIds(new Set());
      } catch (e) {
          alert("Some items could not be deleted.");
      } finally {
          setLoading(false);
      }
  };

  const handleSave = async () => {
      if (!formData.name) return setFormErrors("A name is required for the annals of history.");
      
      setIsSubmitting(true);
      setFormErrors(null);
      
      try {
          const payload = { ...formData, category: 'custom' as const };
          
          if (formData.id) {
              const updated = await updateCharacter(formData.id, payload);
              setItems(prev => prev.map(i => i.id === updated.id ? updated : i));
          } else {
              const newChar = await saveToGallery(payload);
              setItems(prev => [newChar, ...prev]);
          }
          setView('grid');
      } catch (e: any) {
          setFormErrors(e.message || "Failed to write to the archives.");
      } finally {
          setIsSubmitting(false);
      }
  };

  const copyDna = (dna: string) => {
      if(!dna) return alert("No DNA record found.");
      navigator.clipboard.writeText(dna);
      alert("DNA sequence copied.");
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-100px)] w-full gap-0 md:gap-6 animate-fade-in relative">
      
      {/* SIDEBAR NAVIGATION */}
      {view === 'grid' && (
        <aside className="w-full md:w-64 bg-stone-900 border border-stone-700 rounded-lg flex flex-col shrink-0 overflow-hidden shadow-lg h-full">
           <div className="p-4 border-b border-stone-800 bg-black/20">
               <h3 className="font-serif text-ck3-gold text-lg flex items-center gap-2">
                   <Library size={18} /> The Archives
               </h3>
           </div>
           
           <div className="flex-1 overflow-y-auto p-3 space-y-6">
               {/* Library Section */}
               <div className="space-y-1">
                   <h4 className="text-[10px] uppercase font-bold text-stone-500 tracking-widest px-2 mb-2">Library</h4>
                   <button 
                        onClick={() => { setActiveView('all'); clearSelection(); }}
                        className={`w-full text-left px-3 py-2 rounded flex justify-between items-center text-sm font-medium transition-colors ${activeView === 'all' ? 'bg-ck3-gold/10 text-ck3-gold border border-ck3-gold/30' : 'text-stone-400 hover:bg-white/5 hover:text-stone-200'}`}
                   >
                       <span className="flex items-center gap-2"><LayoutGrid size={14}/> All Characters</span>
                       <span className="text-[10px] opacity-60 bg-black/30 px-1.5 rounded">{counts.all}</span>
                   </button>
                   <button 
                        onClick={() => { setActiveView('unsorted'); clearSelection(); }}
                        className={`w-full text-left px-3 py-2 rounded flex justify-between items-center text-sm font-medium transition-colors ${activeView === 'unsorted' ? 'bg-ck3-gold/10 text-ck3-gold border border-ck3-gold/30' : 'text-stone-400 hover:bg-white/5 hover:text-stone-200'}`}
                   >
                       <span className="flex items-center gap-2"><Layers size={14}/> Unsorted</span>
                       <span className="text-[10px] opacity-60 bg-black/30 px-1.5 rounded">{counts.unsorted}</span>
                   </button>
                   <button 
                        onClick={() => { setActiveView('historical'); clearSelection(); }}
                        className={`w-full text-left px-3 py-2 rounded flex justify-between items-center text-sm font-medium transition-colors ${activeView === 'historical' ? 'bg-purple-900/20 text-purple-300 border border-purple-700/30' : 'text-stone-400 hover:bg-white/5 hover:text-stone-200'}`}
                   >
                       <span className="flex items-center gap-2"><History size={14}/> Historical</span>
                       <span className="text-[10px] opacity-60 bg-black/30 px-1.5 rounded">{counts.historical}</span>
                   </button>
               </div>

               {/* Collections Section */}
               <div className="space-y-1">
                   <div className="flex justify-between items-center px-2 mb-2">
                       <h4 className="text-[10px] uppercase font-bold text-stone-500 tracking-widest">Collections</h4>
                       <button onClick={handleCreateCollection} className="text-stone-500 hover:text-ck3-gold"><Plus size={14} /></button>
                   </div>
                   {customCollections.map(col => (
                       <button 
                            key={col}
                            onClick={() => { setActiveView(col); clearSelection(); }}
                            className={`w-full text-left px-3 py-2 rounded flex justify-between items-center text-sm font-medium group transition-colors ${activeView === col ? 'bg-ck3-gold/10 text-ck3-gold border border-ck3-gold/30' : 'text-stone-400 hover:bg-white/5 hover:text-stone-200'}`}
                        >
                            <span className="flex items-center gap-2 truncate max-w-[140px]"><Folder size={14}/> {col}</span>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] opacity-60 bg-black/30 px-1.5 rounded">{counts.collections[col] || 0}</span>
                                <Trash2 size={12} className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity" onClick={(e) => handleDeleteCollection(e, col)} />
                            </div>
                        </button>
                   ))}
               </div>
           </div>

            {/* Bottom Actions */}
           <div className="p-4 border-t border-stone-800 bg-stone-950/50 space-y-2">
                <button 
                    onClick={handleCreateNew}
                    className="w-full bg-ck3-gold hover:bg-ck3-goldLight text-white py-2 rounded text-xs font-bold uppercase transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                    <Plus size={14}/> New Character
                </button>
                <div className="flex gap-2">
                     <button onClick={handleImportClick} className="flex-1 bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white py-1.5 rounded text-[10px] font-bold uppercase border border-stone-700 transition-colors">Import</button>
                     <button onClick={handleExport} className="flex-1 bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white py-1.5 rounded text-[10px] font-bold uppercase border border-stone-700 transition-colors">Export</button>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
           </div>
        </aside>
      )}

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 bg-stone-900/20 rounded-lg border border-stone-800/50 relative overflow-hidden h-full">
      
      {/* HEADER / TOOLBAR */}
      {view === 'grid' && (
        <div className="p-4 border-b border-stone-700 bg-stone-900 flex justify-between items-center sticky top-0 z-20">
             
             {selectedIds.size > 0 ? (
                 <div className="flex items-center gap-4 w-full animate-fade-in-down">
                     <div className="flex items-center gap-3 bg-ck3-gold/10 text-ck3-gold px-3 py-1.5 rounded border border-ck3-gold/30">
                        <span className="font-bold">{selectedIds.size} Selected</span>
                        <div className="h-4 w-px bg-ck3-gold/30"></div>
                        <button onClick={handleSelectAll} className="text-xs uppercase font-bold hover:underline">Select All</button>
                     </div>
                     <div className="flex gap-2 ml-auto">
                        <button onClick={() => setIsMoveModalOpen(true)} className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded text-xs font-bold flex items-center gap-2 border border-stone-600 transition-colors">
                            <FolderInput size={14}/> Move to...
                        </button>
                        {activeView !== 'historical' && (
                             <button onClick={handleBulkDelete} className="px-3 py-1.5 bg-red-900/50 hover:bg-red-900 text-red-300 rounded text-xs font-bold flex items-center gap-2 border border-red-900 transition-colors">
                                <Trash2 size={14}/> Delete
                             </button>
                        )}
                        <button onClick={clearSelection} className="px-3 py-1.5 text-stone-500 hover:text-white">&times;</button>
                     </div>
                 </div>
             ) : (
                 <div className="flex justify-between items-center w-full gap-4">
                     <div>
                        <h2 className="text-xl font-serif text-white capitalize flex items-center gap-2">
                             {activeView === 'all' ? 'All Characters' : activeView}
                        </h2>
                     </div>
                     
                     <div className="flex items-center gap-3">
                         <div className="relative">
                            <input 
                                type="text" 
                                placeholder="Search..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-black/30 border border-stone-700 rounded-full py-1.5 pl-8 pr-4 text-xs text-stone-300 w-48 focus:w-64 transition-all outline-none focus:border-ck3-gold"
                            />
                            <Search className="absolute left-2.5 top-1.5 text-stone-600" size={14}/>
                         </div>
                         <button onClick={() => setIsSteamModalOpen(true)} className="text-stone-400 hover:text-white transition-colors" title="Steam Import">
                             <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M11.979 0C5.666 0 .502 4.908.035 11.13l5.592 2.31c.966-2.14 3.09-3.626 5.568-3.626 3.39 0 6.136 2.748 6.136 6.136 0 3.388-2.746 6.136-6.136 6.136-3.328 0-6.039-2.65-6.13-5.952l-5.02 2.073c.963 4.298 4.79 7.514 9.355 7.514 5.342 0 9.673-4.332 9.673-9.673S17.32 0 11.979 0zm-1.85 13.918l-3.344-1.38c-.143.456-.22.94-.22 1.442 0 .59.106 1.157.302 1.685l3.29-1.358c-.02-.126-.03-.254-.03-.385 0-1.107.9-2.006 2.006-2.006.128 0 .253.012.376.03l-1.35 3.27c-.52-.19-1.08-.293-1.666-.293-1.846 0-3.415 1.157-4.04 2.82l-5.69-2.35c.983-4.086 4.67-7.11 9.073-7.11 5.166 0 9.356 4.19 9.356 9.355s-4.19 9.356-9.356 9.356c-4.14 0-7.65-2.67-8.986-6.425l5.12-2.115c.677 1.83 2.437 3.13 4.492 3.13 2.656 0 4.81-2.155 4.81-4.81s-2.154-4.81-4.81-4.81c-2.355 0-4.325 1.682-4.757 3.91l3.35 1.393c.31-.692 1.002-1.173 1.808-1.173 1.092 0 1.976.885 1.976 1.976 0 .806-.48 1.5-1.173 1.81z"/></svg>
                         </button>
                     </div>
                 </div>
             )}
      </div>
      )}

      {/* GRID VIEW */}
      {view === 'grid' && (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-thin">
            {loading && <div className="text-center py-20 text-stone-500 animate-pulse">Loading Archives...</div>}
            
            {!loading && filteredItems.length === 0 && (
                <div className="text-center py-32 opacity-50">
                    <Library size={48} className="mx-auto mb-4 text-stone-600"/>
                    <p className="text-stone-500 font-serif text-lg">No records found in this section.</p>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredItems.map(item => {
                    const isSelected = selectedIds.has(item.id);
                    return (
                        <div 
                            key={item.id} 
                            onClick={() => { setSelectedItem(item); setView('details'); }}
                            className={`group relative bg-stone-900 rounded-lg overflow-hidden border transition-all duration-200 cursor-pointer hover:-translate-y-1 hover:shadow-lg flex flex-col ${isSelected ? 'border-ck3-gold ring-1 ring-ck3-gold/50' : 'border-stone-800 hover:border-ck3-gold/40'}`}
                        >
                            {/* Selection Checkbox */}
                            <div className="absolute top-2 right-2 z-20">
                                <div 
                                    onClick={(e) => toggleSelection(item.id, e)}
                                    className={`w-5 h-5 rounded border cursor-pointer flex items-center justify-center transition-all ${isSelected ? 'bg-ck3-gold border-ck3-gold text-stone-900' : 'bg-black/50 border-stone-500 hover:border-white text-transparent'}`}
                                >
                                    <Check size={12} strokeWidth={4} />
                                </div>
                            </div>
                            
                            {/* Collection Tag */}
                            {item.collection && item.collection !== 'Unsorted' && (
                                <div className="absolute top-2 left-2 z-10 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded text-[9px] font-bold uppercase text-stone-300 border border-white/10 flex items-center gap-1">
                                    <Folder size={8} /> {item.collection}
                                </div>
                            )}

                            {/* Image */}
                            <div className="aspect-[3/4] w-full relative bg-stone-950">
                                {item.images[0] ? (
                                    <img src={item.images[0]} className={`w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity ${isSelected ? 'opacity-100' : ''}`} loading="lazy"/>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-stone-700 text-4xl">?</div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent opacity-80" />
                                
                                <div className="absolute bottom-0 left-0 w-full p-4">
                                    <h3 className="font-serif text-lg text-stone-100 leading-tight group-hover:text-ck3-gold transition-colors truncate drop-shadow-md">{item.name}</h3>
                                    <div className="text-[10px] text-stone-400 mt-1 flex items-center gap-2">
                                        {item.culture && <span>{item.culture}</span>}
                                        {item.religion && <span className="opacity-50">•</span>}
                                        {item.religion && <span>{item.religion}</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
      )}

      {/* MOVE TO MODAL */}
      {isMoveModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
              <div className="bg-stone-900 border border-stone-700 rounded-lg p-6 w-full max-w-sm shadow-2xl">
                  <h3 className="font-serif text-lg text-white mb-4">Move {selectedIds.size} Items To...</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                      <button onClick={() => handleBulkMove('Unsorted')} className="w-full text-left p-3 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 text-sm flex items-center gap-2 transition-colors">
                          <Layers size={14}/> Unsorted
                      </button>
                      {customCollections.map(c => (
                          <button key={c} onClick={() => handleBulkMove(c)} className="w-full text-left p-3 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 text-sm flex items-center gap-2 transition-colors">
                              <Folder size={14} className="text-ck3-gold"/> {c}
                          </button>
                      ))}
                  </div>
                  <button onClick={() => setIsMoveModalOpen(false)} className="mt-4 w-full py-2 border border-stone-700 rounded text-xs text-stone-500 hover:text-white transition-colors uppercase font-bold">Cancel</button>
              </div>
          </div>
      )}

      {/* DETAILS VIEW (Overlay) */}
      {view === 'details' && selectedItem && (
          <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md animate-fade-in overflow-hidden flex">
              <div className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto h-full w-full relative">
                  <button onClick={() => setView('grid')} className="absolute top-4 right-4 z-50 w-10 h-10 bg-black/50 hover:bg-white/10 rounded-full flex items-center justify-center text-white text-2xl transition-colors">&times;</button>
                  
                  {/* Left: Image */}
                  <div className="w-full md:w-1/2 h-1/2 md:h-full relative bg-stone-950">
                      {selectedItem.images[0] && <img src={selectedItem.images[0]} className="w-full h-full object-cover opacity-80" />}
                      <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-stone-900 to-transparent"></div>
                      
                      <div className="absolute bottom-8 left-8 z-10">
                          {selectedItem.dna && (
                              <button onClick={() => copyDna(selectedItem.dna)} className="bg-ck3-gold hover:bg-ck3-goldLight text-stone-900 font-bold px-6 py-3 rounded shadow-lg flex items-center gap-2 transition-transform hover:-translate-y-1">
                                  <span>🧬</span> Copy DNA
                              </button>
                          )}
                      </div>
                  </div>

                  {/* Right: Info */}
                  <div className="w-full md:w-1/2 h-1/2 md:h-full p-8 md:p-12 overflow-y-auto bg-stone-900 border-l border-stone-800">
                      <div className="max-w-xl">
                           <div className="flex gap-2 mb-4">
                               {selectedItem.collection && selectedItem.collection !== 'Unsorted' && (
                                   <span className="bg-stone-800 px-3 py-1 rounded-full text-xs font-bold uppercase text-ck3-gold border border-stone-700">{selectedItem.collection}</span>
                               )}
                               {selectedItem.category === 'historical' && <span className="bg-purple-900/30 px-3 py-1 rounded-full text-xs font-bold uppercase text-purple-300 border border-purple-800">Historical</span>}
                           </div>
                           
                           <h1 className="text-5xl font-serif text-white mb-2">{selectedItem.name}</h1>
                           {selectedItem.dynastyMotto && <p className="text-xl font-serif text-stone-500 italic mb-8">"{selectedItem.dynastyMotto}"</p>}
                           
                           <div className="grid grid-cols-2 gap-6 mb-8 text-sm border-y border-stone-800 py-6">
                               <div>
                                   <label className="block text-stone-500 uppercase text-[10px] font-bold mb-1">Culture</label>
                                   <span className="text-stone-200">{selectedItem.culture || 'Unknown'}</span>
                               </div>
                               <div>
                                   <label className="block text-stone-500 uppercase text-[10px] font-bold mb-1">Religion</label>
                                   <span className="text-stone-200">{selectedItem.religion || 'Unknown'}</span>
                               </div>
                               <div className="col-span-2">
                                   <label className="block text-stone-500 uppercase text-[10px] font-bold mb-1">Goal</label>
                                   <span className="text-stone-200">{selectedItem.goal || 'None'}</span>
                               </div>
                           </div>
                           
                           <div className="prose prose-invert prose-stone mb-8">
                               <p className="whitespace-pre-wrap">{selectedItem.bio}</p>
                           </div>

                           <div className="flex flex-wrap gap-2 mb-12">
                                {selectedItem.traits.map(tid => {
                                    const t = TRAITS.find(tr => tr.id === tid);
                                    return <span key={tid} className="bg-stone-800 px-3 py-1.5 rounded text-xs text-stone-300 border border-stone-700">{t?.name || tid}</span>;
                                })}
                           </div>
                           
                           {selectedItem.category !== 'historical' && (
                               <div className="flex gap-4 pt-8 border-t border-stone-800">
                                   <button onClick={() => handleEdit(selectedItem)} className="px-6 py-2 bg-stone-800 hover:bg-stone-700 text-white rounded font-bold text-sm transition-colors">Edit Record</button>
                                   <button onClick={() => handleDelete(selectedItem.id)} className="px-6 py-2 bg-red-900/20 hover:bg-red-900/40 text-red-400 rounded font-bold text-sm transition-colors">Delete</button>
                               </div>
                           )}
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* FORM VIEW */}
      {view === 'form' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-black/80 backdrop-blur-sm z-30 absolute inset-0">
               <div className="max-w-3xl mx-auto bg-stone-900 border border-stone-700 rounded-xl shadow-2xl overflow-hidden">
                   <div className="p-6 border-b border-stone-800 flex justify-between items-center bg-stone-950">
                       <h2 className="text-2xl font-serif text-ck3-gold">{formData.id ? 'Edit Record' : 'New Inscription'}</h2>
                       <button onClick={() => setView('grid')} className="text-stone-500 hover:text-white">&times;</button>
                   </div>
                   
                   <div className="p-8 space-y-6">
                       {/* Basic Info */}
                       <div className="space-y-4">
                           <label className="block text-xs uppercase font-bold text-stone-500">Identity</label>
                           <input 
                                className="w-full bg-stone-800 border border-stone-700 rounded p-3 text-stone-100 outline-none focus:border-ck3-gold placeholder:text-stone-600" 
                                placeholder="Name" 
                                value={formData.name} 
                                onChange={e => setFormData({...formData, name: e.target.value})}
                           />
                           <div className="grid grid-cols-2 gap-4">
                                <input 
                                    className="w-full bg-stone-800 border border-stone-700 rounded p-3 text-stone-100 outline-none focus:border-ck3-gold placeholder:text-stone-600 text-sm" 
                                    placeholder="Culture" 
                                    value={formData.culture} 
                                    onChange={e => setFormData({...formData, culture: e.target.value})}
                                />
                                <input 
                                    className="w-full bg-stone-800 border border-stone-700 rounded p-3 text-stone-100 outline-none focus:border-ck3-gold placeholder:text-stone-600 text-sm" 
                                    placeholder="Religion" 
                                    value={formData.religion} 
                                    onChange={e => setFormData({...formData, religion: e.target.value})}
                                />
                           </div>
                           
                           {/* Collection Selector */}
                           <div>
                               <label className="block text-xs uppercase font-bold text-stone-500 mb-2">Collection</label>
                               <select 
                                   className="w-full bg-stone-800 border border-stone-700 rounded p-3 text-stone-100 outline-none focus:border-ck3-gold text-sm"
                                   value={formData.collection || 'Unsorted'}
                                   onChange={e => {
                                       if(e.target.value === '__new__') {
                                           handleCreateCollection();
                                       } else {
                                           setFormData({...formData, collection: e.target.value});
                                       }
                                   }}
                               >
                                   <option value="Unsorted">Unsorted</option>
                                   {customCollections.map(c => <option key={c} value={c}>{c}</option>)}
                                   <option value="__new__" className="font-bold text-ck3-gold">+ New Collection...</option>
                               </select>
                           </div>
                       </div>

                       {/* DNA */}
                       <div>
                           <label className="block text-xs uppercase font-bold text-stone-500 mb-2">DNA String</label>
                           <textarea 
                                className="w-full h-32 bg-black/30 border border-stone-700 rounded p-3 text-xs font-mono text-stone-400 outline-none focus:border-ck3-gold resize-none"
                                value={formData.dna}
                                onChange={e => setFormData({...formData, dna: e.target.value})}
                                placeholder="Paste persistent DNA here..."
                           />
                       </div>
                       
                       {/* Images */}
                        <div>
                           <label className="block text-xs uppercase font-bold text-stone-500 mb-2">Portrait URL</label>
                           <input 
                                className="w-full bg-stone-800 border border-stone-700 rounded p-3 text-stone-100 outline-none focus:border-ck3-gold placeholder:text-stone-600 text-sm"
                                value={formData.images?.[0] || ''}
                                onChange={e => setFormData({...formData, images: [e.target.value]})}
                                placeholder="https://..."
                           />
                       </div>

                       {/* Bio */}
                       <div>
                           <label className="block text-xs uppercase font-bold text-stone-500 mb-2">Biography</label>
                           <textarea 
                                className="w-full h-32 bg-stone-800 border border-stone-700 rounded p-3 text-sm text-stone-200 outline-none focus:border-ck3-gold resize-none"
                                value={formData.bio}
                                onChange={e => setFormData({...formData, bio: e.target.value})}
                                placeholder="Character history..."
                           />
                       </div>

                       {formErrors && <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded border border-red-900/50">{formErrors}</div>}

                       <div className="flex justify-end gap-3 pt-4 border-t border-stone-800">
                           <button onClick={() => setView('grid')} className="px-6 py-2 text-stone-400 hover:text-white font-bold transition-colors">Cancel</button>
                           <button 
                                onClick={handleSave} 
                                disabled={isSubmitting}
                                className="bg-ck3-gold hover:bg-ck3-goldLight text-stone-900 px-8 py-2 rounded font-bold shadow-lg transition-transform hover:-translate-y-0.5 disabled:opacity-50"
                           >
                               {isSubmitting ? 'Saving...' : 'Save Record'}
                           </button>
                       </div>
                   </div>
               </div>
          </div>
      )}

      {/* STEAM MODAL */}
      {isSteamModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="bg-stone-900 border border-stone-700 rounded-lg p-6 max-w-lg w-full shadow-2xl">
                  <h3 className="text-lg font-serif text-white mb-4">Import from Steam</h3>
                  <input 
                      className="w-full bg-black/40 border border-stone-600 rounded p-3 text-stone-200 outline-none focus:border-ck3-gold mb-4"
                      placeholder="https://steamcommunity.com/sharedfiles/filedetails/?id=..."
                      value={steamUrl}
                      onChange={e => setSteamUrl(e.target.value)}
                  />
                  <div className="flex justify-end gap-3">
                      <button onClick={() => setIsSteamModalOpen(false)} className="px-4 py-2 text-stone-400 hover:text-white font-bold">Cancel</button>
                      <button onClick={handleSteamImport} disabled={steamLoading || !steamUrl} className="px-6 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded font-bold shadow-lg disabled:opacity-50">
                          {steamLoading ? 'Importing...' : 'Import'}
                      </button>
                  </div>
              </div>
          </div>
      )}

      </main>
    </div>
  );
};

export default Gallery;

// Lucide React Check Icon component used in the grid
function Check({ size = 24, strokeWidth = 2, className = "" }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth={strokeWidth} 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
