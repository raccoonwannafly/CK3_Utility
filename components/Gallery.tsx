
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { fetchGallery, saveToGallery, updateCharacter, deleteCharacter, importFromSteam } from '../services/geminiService';
import { exportGallery, importGallery } from '../services/ioService';
import { StoredCharacter } from '../types';
import { TRAITS, HISTORICAL_CHARACTERS } from '../constants';
import { 
    Folder, History, Layers, Plus, Trash2, FolderInput, Library, LayoutGrid, 
    List, Search, Upload, Image as ImageIcon, Check, X, Maximize2, Minimize2, 
    Move, Star, ImagePlus, GripHorizontal, ChevronLeft, ChevronRight, ZoomIn 
} from 'lucide-react';

interface GalleryProps {
  onNavigate: (tab: string) => void;
}

// Helper: Image Compression
const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                
                // Max width/height to prevent huge base64 strings (1000px is sufficient for portraits)
                const MAX_SIZE = 1000;
                if (width > height) {
                    if (width > MAX_SIZE) {
                        height *= MAX_SIZE / width;
                        width = MAX_SIZE;
                    }
                } else {
                    if (height > MAX_SIZE) {
                        width *= MAX_SIZE / height;
                        height = MAX_SIZE;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);
                
                // Compress to JPEG at 0.7 quality (good balance)
                const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                resolve(dataUrl);
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
};

const Gallery: React.FC<GalleryProps> = ({ onNavigate }) => {
  const [items, setItems] = useState<StoredCharacter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'server' | 'local'>('server');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Navigation State
  const [activeView, setActiveView] = useState<'all' | 'historical' | 'unsorted' | string>('all');
  
  // Custom Collections
  const [customCollections, setCustomCollections] = useState<string[]>(() => {
    const saved = localStorage.getItem('ck3_utility_collections');
    return saved ? JSON.parse(saved) : ['Campaign 1'];
  });

  // Selection State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // UI Views
  const [view, setView] = useState<'grid' | 'form' | 'details'>('grid');
  const [selectedItem, setSelectedItem] = useState<StoredCharacter | null>(null);
  
  // Window State (Details View)
  const [winPos, setWinPos] = useState({ x: 100, y: 50 });
  const [winSize, setWinSize] = useState({ w: 900, h: 600 });
  const [isMaximized, setIsMaximized] = useState(false);
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isAddingImage, setIsAddingImage] = useState(false);
  const [isFullViewOpen, setIsFullViewOpen] = useState(false);

  // Refs for drag/resize
  const dragRef = useRef<{ startX: number, startY: number, startLeft: number, startTop: number } | null>(null);
  const resizeRef = useRef<{ startX: number, startY: number, startW: number, startH: number } | null>(null);
  
  // Modals
  const [isSteamModalOpen, setIsSteamModalOpen] = useState(false);
  const [steamUrl, setSteamUrl] = useState('');
  const [steamLoading, setSteamLoading] = useState(false);
  
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');

  // Form State
  const [formData, setFormData] = useState<Partial<StoredCharacter>>({});
  const [formErrors, setFormErrors] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hidden inputs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageUploadRef = useRef<HTMLInputElement>(null);
  const detailsImageUploadRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('ck3_utility_collections', JSON.stringify(customCollections));
  }, [customCollections]);

  // Initial Window Centering
  useEffect(() => {
      if (view === 'details') {
          const w = window.innerWidth;
          const h = window.innerHeight;
          setWinPos({ x: Math.max(50, w/2 - 450), y: Math.max(50, h/2 - 300) });
          setWinSize({ w: 900, h: 600 });
          setActiveImgIdx(0);
          setIsFullViewOpen(false);
      }
  }, [view, selectedItem]);

  // Window Drag/Resize Handlers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (dragRef.current) {
        const deltaX = e.clientX - dragRef.current.startX;
        const deltaY = e.clientY - dragRef.current.startY;
        setWinPos({
          x: dragRef.current.startLeft + deltaX,
          y: dragRef.current.startTop + deltaY
        });
      }
      if (resizeRef.current) {
        const deltaX = e.clientX - resizeRef.current.startX;
        const deltaY = e.clientY - resizeRef.current.startY;
        setWinSize({
          w: Math.max(400, resizeRef.current.startW + deltaX),
          h: Math.max(300, resizeRef.current.startH + deltaY)
        });
      }
    };

    const handleMouseUp = () => {
      dragRef.current = null;
      resizeRef.current = null;
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };

    if (view === 'details') {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [view]);

  const startDrag = (e: React.MouseEvent) => {
    if (isMaximized) return;
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startLeft: winPos.x,
      startTop: winPos.y
    };
    document.body.style.userSelect = 'none';
  };

  const startResize = (e: React.MouseEvent) => {
    e.stopPropagation();
    resizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startW: winSize.w,
      startH: winSize.h
    };
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'nwse-resize';
  };

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
  const counts = useMemo(() => {
      const historical = HISTORICAL_CHARACTERS.length;
      // All now includes historical to ensure gallery is populated
      const all = items.length + historical;
      const unsorted = items.filter(i => !i.collection || i.collection === 'Unsorted').length;
      const collections: Record<string, number> = {};
      
      customCollections.forEach(c => collections[c] = 0);
      items.forEach(i => {
          if (i.collection && i.collection !== 'Unsorted') {
              collections[i.collection] = (collections[i.collection] || 0) + 1;
          }
      });
      
      return { all, historical, unsorted, collections };
  }, [items, customCollections]);

  const filteredItems = useMemo(() => {
      let baseList: StoredCharacter[] = [];

      if (activeView === 'historical') {
          baseList = HISTORICAL_CHARACTERS;
      } else if (activeView === 'all') {
          // Merge items and historical for the 'All' view
          // Ensure no duplicates by ID
          const historicalIds = new Set(HISTORICAL_CHARACTERS.map(h => h.id));
          const uniqueItems = items.filter(i => !historicalIds.has(i.id));
          baseList = [...uniqueItems, ...HISTORICAL_CHARACTERS];
      } else if (activeView === 'unsorted') {
          baseList = items.filter(i => !i.collection || i.collection === 'Unsorted');
      } else {
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
  const openCreateCollectionModal = () => {
      setNewCollectionName('');
      setIsCreateModalOpen(true);
  };

  const confirmCreateCollection = () => {
      const name = newCollectionName.trim();
      if (name && !customCollections.includes(name)) {
          setCustomCollections(prev => [...prev, name]);
          setIsCreateModalOpen(false);
      } else if (!name) {
          alert("Please enter a collection name.");
      } else {
          alert("Collection already exists.");
      }
  };

  const handleDeleteCollection = (e: React.MouseEvent, name: string) => {
      e.stopPropagation();
      if (!confirm(`Delete collection "${name}"? Characters inside will be moved to Unsorted.`)) return;
      
      setCustomCollections(prev => prev.filter(c => c !== name));
      
      const charsToUpdate = items.filter(i => i.collection === name);
      setItems(prev => prev.map(i => i.collection === name ? { ...i, collection: 'Unsorted' } : i));
      
      if (activeView === name) setActiveView('all');
      
      charsToUpdate.forEach(char => {
          updateCharacter(char.id, { collection: 'Unsorted' });
      });
  };

  const handleBulkMove = async (targetCollection: string) => {
      if (selectedIds.size === 0) return;
      
      setLoading(true);
      try {
          const idsToMove = Array.from(selectedIds) as string[];
          setItems(prev => prev.map(item => 
              idsToMove.includes(item.id) ? { ...item, collection: targetCollection } : item
          ));
          
          for (const id of idsToMove) {
             await updateCharacter(id, { collection: targetCollection });
          }
          
          clearSelection();
          setIsMoveModalOpen(false);
      } catch (e: any) {
          alert("Failed to move some items.");
      } finally {
          setLoading(false);
      }
  };

  const handleBulkDelete = async () => {
      if (selectedIds.size === 0) return;
      if (!confirm(`Are you sure you want to delete ${selectedIds.size} characters? This action cannot be undone.`)) return;

      setLoading(true);
      try {
          const idsToDelete = Array.from(selectedIds) as string[];
          
          // Optimistic UI Update
          setItems(prev => prev.filter(item => !idsToDelete.includes(item.id)));
          
          for (const id of idsToDelete) {
             await deleteCharacter(id);
          }

          if (selectedItem && idsToDelete.includes(selectedItem.id)) {
              setSelectedItem(null);
              if (view === 'details') setView('grid');
          }
          
          clearSelection();
      } catch (e: any) {
          alert("Failed to delete some items.");
          loadGallery(); // Re-sync
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

  // --- IMAGE MANAGEMENT (DETAILS VIEW) ---
  const handleAddImageToCharacter = async () => {
    if (!selectedItem || !newImageUrl) return;
    const updatedImages = [...selectedItem.images, newImageUrl];
    const updatedChar = { ...selectedItem, images: updatedImages };
    
    setSelectedItem(updatedChar);
    setItems(prev => prev.map(i => i.id === updatedChar.id ? updatedChar : i));
    
    await updateCharacter(updatedChar.id, { images: updatedImages });
    setNewImageUrl('');
    setIsAddingImage(false);
    setActiveImgIdx(updatedImages.length - 1);
  };

  const handleDetailsImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedItem || !e.target.files?.length) return;
    const files = Array.from(e.target.files);
    
    try {
        const compressedBase64s = await Promise.all(files.map(f => compressImage(f)));
        const updatedImages = [...selectedItem.images, ...compressedBase64s];
        const updatedChar = { ...selectedItem, images: updatedImages };

        setSelectedItem(updatedChar);
        setItems(prev => prev.map(i => i.id === updatedChar.id ? updatedChar : i));
        
        await updateCharacter(updatedChar.id, { images: updatedImages });
        setActiveImgIdx(updatedImages.length - 1);
    } catch (err) {
        alert("Failed to upload image(s).");
    } finally {
        e.target.value = ''; // Reset
    }
  };

  const handleSetThumbnail = async (index: number) => {
      if (!selectedItem) return;
      const images = [...selectedItem.images];
      // Move selected to front
      const target = images[index];
      images.splice(index, 1);
      images.unshift(target); 
      
      const updatedChar = { ...selectedItem, images };
      setSelectedItem(updatedChar);
      setItems(prev => prev.map(i => i.id === updatedChar.id ? updatedChar : i));
      setActiveImgIdx(0);
      
      await updateCharacter(updatedChar.id, { images });
  };
  
  const handleDeleteImage = async (index: number) => {
      if (!selectedItem) return;
      if (!confirm("Remove this image?")) return;
      const images = [...selectedItem.images];
      images.splice(index, 1);
      
      const updatedChar = { ...selectedItem, images };
      setSelectedItem(updatedChar);
      setItems(prev => prev.map(i => i.id === updatedChar.id ? updatedChar : i));
      if(activeImgIdx >= images.length) setActiveImgIdx(Math.max(0, images.length - 1));
      
      await updateCharacter(updatedChar.id, { images });
  };


  // --- IMAGE UPLOAD (FORM VIEW) ---
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;

      try {
          // Compress all selected images
          const compressedImages = await Promise.all(files.map(file => compressImage(file)));
          
          setFormData(prev => ({
              ...prev,
              images: [...(prev.images || []), ...compressedImages]
          }));
      } catch (err) {
          alert("Failed to process images.");
      } finally {
          e.target.value = ''; // Reset input
      }
  };

  const removeFormImage = (index: number) => {
      setFormData(prev => {
          const newImages = [...(prev.images || [])];
          newImages.splice(index, 1);
          return { ...prev, images: newImages };
      });
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

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
      if(e) e.stopPropagation();
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

  const handleSaveForm = async () => {
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
                       <button onClick={openCreateCollectionModal} className="text-stone-500 hover:text-ck3-gold"><Plus size={14} /></button>
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
                     <button onClick={handleImportClick} className="flex-1 bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white py-1.5 rounded text-[10px] font-bold uppercase border border-stone-700 transition-colors">Import JSON</button>
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

      {/* Grid of Characters */}
      {view === 'grid' && (
          <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
              {filteredItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-stone-600">
                      <History size={48} className="mb-4 opacity-20"/>
                      <p>No characters found in the archives.</p>
                      {searchTerm && <p className="text-xs mt-2">Try a different search term.</p>}
                  </div>
              ) : (
                  <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {filteredItems.map(item => (
                          <div 
                              key={item.id}
                              onClick={() => { setSelectedItem(item); setView('details'); }}
                              className={`group relative aspect-[3/4] bg-black/40 rounded-lg overflow-hidden border transition-all cursor-pointer shadow-lg hover:shadow-2xl hover:-translate-y-1 ${selectedIds.has(item.id) ? 'border-ck3-gold ring-1 ring-ck3-gold' : 'border-stone-800 hover:border-stone-600'}`}
                          >
                              {item.images[0] ? (
                                  <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                              ) : (
                                  <div className="w-full h-full flex flex-col items-center justify-center bg-stone-900 text-stone-700">
                                      <ImageIcon size={32} />
                                      <span className="text-[10px] mt-2 uppercase font-bold tracking-widest">No Portrait</span>
                                  </div>
                              )}
                              
                              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                  <h3 className="font-serif text-white text-lg leading-tight drop-shadow-md">{item.name}</h3>
                                  <div className="flex items-center gap-2 mt-1">
                                      {item.category === 'historical' && <span className="bg-purple-900/60 text-purple-200 text-[9px] px-1.5 py-0.5 rounded border border-purple-500/30">Historical</span>}
                                      {item.collection && item.collection !== 'Unsorted' && <span className="bg-ck3-gold/20 text-ck3-goldLight text-[9px] px-1.5 py-0.5 rounded border border-ck3-gold/30">{item.collection}</span>}
                                  </div>
                              </div>
                              
                              {/* Selection Checkbox */}
                              <button 
                                  onClick={(e) => toggleSelection(item.id, e)}
                                  className={`absolute top-2 right-2 w-6 h-6 rounded-full border flex items-center justify-center transition-all ${selectedIds.has(item.id) ? 'bg-ck3-gold border-ck3-gold text-white' : 'bg-black/40 border-white/20 text-transparent hover:border-white/50'}`}
                              >
                                  <Check size={14} />
                              </button>
                          </div>
                      ))}
                  </div>
              )}
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
                                           openCreateCollectionModal();
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
                       
                       {/* Images (Import) */}
                        <div>
                           <label className="block text-xs uppercase font-bold text-stone-500 mb-2">Gallery & Portraits</label>
                           <div className="flex gap-2 mb-3">
                             <input 
                                  className="flex-1 bg-stone-800 border border-stone-700 rounded p-3 text-stone-100 outline-none focus:border-ck3-gold placeholder:text-stone-600 text-sm"
                                  placeholder="Paste Image URL..."
                                  onKeyDown={(e) => {
                                      if(e.key === 'Enter') {
                                          const url = e.currentTarget.value;
                                          if(url) {
                                              setFormData(prev => ({...prev, images: [...(prev.images || []), url]}));
                                              e.currentTarget.value = '';
                                          }
                                      }
                                  }}
                             />
                             <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                multiple
                                ref={imageUploadRef}
                                onChange={handleImageUpload}
                             />
                             <button 
                                onClick={() => imageUploadRef.current?.click()}
                                className="bg-stone-700 hover:bg-stone-600 text-white px-4 rounded border border-stone-600 flex items-center gap-2"
                                title="Upload Images (Stored locally, auto-compressed)"
                             >
                                <Upload size={16} /> Upload
                             </button>
                           </div>
                           
                           {/* Preview Grid */}
                           {formData.images && formData.images.length > 0 && (
                               <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 bg-stone-900/50 p-2 rounded border border-stone-800">
                                   {formData.images.map((img, idx) => (
                                       <div key={idx} className="aspect-square relative group rounded overflow-hidden border border-stone-700">
                                           <img src={img} className="w-full h-full object-cover" />
                                           <button 
                                                onClick={() => removeFormImage(idx)}
                                                className="absolute top-1 right-1 bg-red-900/80 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                                           >
                                               &times;
                                           </button>
                                       </div>
                                   ))}
                               </div>
                           )}
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
                                onClick={handleSaveForm} 
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
      
      {/* DETAILS WINDOW (Draggable & Resizable) */}
      {view === 'details' && selectedItem && (
          <div 
              className={`fixed z-50 bg-stone-900 border border-ck3-gold rounded-lg shadow-2xl overflow-hidden flex flex-col animate-fade-in ${isMaximized ? 'inset-4' : ''}`}
              style={!isMaximized ? { left: winPos.x, top: winPos.y, width: winSize.w, height: winSize.h } : {}}
          >
              {/* Header Bar */}
              <div 
                className="h-10 bg-stone-950 border-b border-stone-800 flex justify-between items-center px-4 cursor-move select-none shrink-0"
                onMouseDown={startDrag}
              >
                  <div className="flex items-center gap-2">
                       <Move size={14} className="text-stone-500" />
                       <span className="font-serif text-ck3-gold font-bold text-sm truncate max-w-[200px]">{selectedItem.name}</span>
                       <span className="text-xs text-stone-600 bg-stone-800 px-1.5 rounded">{selectedItem.collection}</span>
                  </div>
                  <div className="flex items-center gap-2">
                      <button onClick={() => setIsMaximized(!isMaximized)} className="text-stone-500 hover:text-white p-1">
                          {isMaximized ? <Minimize2 size={14}/> : <Maximize2 size={14}/>}
                      </button>
                      <button onClick={() => setView('grid')} className="text-stone-500 hover:text-white p-1">
                          <X size={16}/>
                      </button>
                  </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                  
                  {/* Left Column: Images */}
                  <div className="w-full md:w-1/3 bg-black/40 border-r border-stone-800 flex flex-col p-4 gap-4 overflow-y-auto">
                      
                      {/* Main Image Display */}
                      <div className="aspect-[3/4] bg-stone-950 rounded border border-stone-700 relative group overflow-hidden shadow-lg">
                          {selectedItem.images[activeImgIdx] ? (
                              <img src={selectedItem.images[activeImgIdx]} className="w-full h-full object-cover" />
                          ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-stone-700">
                                  <ImageIcon size={48} />
                                  <span className="text-xs mt-2 uppercase font-bold">No Image</span>
                              </div>
                          )}
                          
                          {/* Controls Overlay */}
                          <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              {selectedItem.images[activeImgIdx] && (
                                <button
                                    onClick={() => setIsFullViewOpen(true)}
                                    className="bg-black/50 hover:bg-ck3-gold text-white p-2 rounded-full backdrop-blur-sm transition-colors"
                                    title="View Full Image"
                                >
                                    <ZoomIn size={14} />
                                </button>
                              )}
                              
                              {activeImgIdx !== 0 && (
                                  <button 
                                    onClick={() => handleSetThumbnail(activeImgIdx)}
                                    className="bg-black/50 hover:bg-ck3-gold text-white p-2 rounded-full backdrop-blur-sm transition-colors"
                                    title="Set as Main Thumbnail"
                                  >
                                      <Star size={14} />
                                  </button>
                              )}
                              <button 
                                onClick={() => handleDeleteImage(activeImgIdx)}
                                className="bg-black/50 hover:bg-red-600 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
                                title="Delete Image"
                              >
                                  <Trash2 size={14} />
                              </button>
                          </div>

                          {selectedItem.dna && (
                              <div className="absolute bottom-4 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => copyDna(selectedItem.dna)} className="bg-ck3-gold hover:bg-ck3-goldLight text-stone-900 font-bold px-4 py-1.5 rounded shadow-lg text-xs">
                                      Copy DNA
                                  </button>
                              </div>
                          )}
                      </div>

                      {/* Thumbnails Strip */}
                      <div className="space-y-2">
                          <label className="text-[10px] uppercase font-bold text-stone-500 flex justify-between items-center">
                              <span>Gallery ({selectedItem.images.length})</span>
                              <button onClick={() => setIsAddingImage(!isAddingImage)} className="text-ck3-gold hover:underline flex items-center gap-1">
                                  <ImagePlus size={12}/> Add
                              </button>
                          </label>
                          
                          {isAddingImage && (
                              <div className="flex gap-2 mb-2 animate-fade-in">
                                  <input 
                                      className="flex-1 bg-stone-800 border border-stone-600 rounded px-2 py-1 text-xs text-white outline-none focus:border-ck3-gold"
                                      placeholder="Image URL..."
                                      value={newImageUrl}
                                      onChange={(e) => setNewImageUrl(e.target.value)}
                                      onKeyDown={(e) => e.key === 'Enter' && handleAddImageToCharacter()}
                                  />
                                  <input 
                                    type="file" 
                                    accept="image/*" 
                                    multiple
                                    className="hidden" 
                                    ref={detailsImageUploadRef}
                                    onChange={handleDetailsImageUpload}
                                  />
                                  <button 
                                      onClick={() => detailsImageUploadRef.current?.click()} 
                                      className="bg-stone-700 hover:bg-stone-600 text-white px-2 py-1 rounded text-xs"
                                      title="Upload Local File"
                                  >
                                      <Upload size={12}/>
                                  </button>
                                  <button onClick={handleAddImageToCharacter} className="bg-stone-700 hover:bg-stone-600 text-white px-2 py-1 rounded text-xs">OK</button>
                              </div>
                          )}

                          <div className="grid grid-cols-4 gap-2">
                              {selectedItem.images.map((img, idx) => (
                                  <div 
                                    key={idx}
                                    onClick={() => setActiveImgIdx(idx)}
                                    className={`aspect-square rounded overflow-hidden cursor-pointer border-2 transition-all ${idx === activeImgIdx ? 'border-ck3-gold opacity-100 scale-105' : 'border-transparent opacity-50 hover:opacity-80'}`}
                                  >
                                      <img src={img} className="w-full h-full object-cover" />
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>

                  {/* Right Column: Info */}
                  <div className="w-full md:w-2/3 p-6 overflow-y-auto bg-stone-900">
                       <h1 className="text-3xl font-serif text-white mb-2">{selectedItem.name}</h1>
                       {selectedItem.dynastyMotto && <p className="text-sm font-serif text-stone-500 italic mb-6">"{selectedItem.dynastyMotto}"</p>}

                       <div className="grid grid-cols-2 gap-4 mb-6 text-sm bg-black/20 p-4 rounded border border-stone-800">
                           <div>
                               <label className="block text-stone-500 uppercase text-[10px] font-bold mb-1">Culture</label>
                               <span className="text-stone-300">{selectedItem.culture || 'Unknown'}</span>
                           </div>
                           <div>
                               <label className="block text-stone-500 uppercase text-[10px] font-bold mb-1">Religion</label>
                               <span className="text-stone-300">{selectedItem.religion || 'Unknown'}</span>
                           </div>
                           <div className="col-span-2 pt-2 border-t border-stone-800 mt-2">
                               <label className="block text-stone-500 uppercase text-[10px] font-bold mb-1">Goal</label>
                               <span className="text-stone-300">{selectedItem.goal || 'None'}</span>
                           </div>
                       </div>

                       <div className="prose prose-invert prose-sm text-stone-400 mb-6">
                           <p className="whitespace-pre-wrap">{selectedItem.bio}</p>
                       </div>

                       <div className="flex flex-wrap gap-2 mb-8">
                            {selectedItem.traits.map(tid => {
                                const t = TRAITS.find(tr => tr.id === tid);
                                return <span key={tid} className="bg-stone-800 px-2 py-1 rounded text-xs text-stone-300 border border-stone-700">{t?.name || tid}</span>;
                            })}
                       </div>

                       {selectedItem.category !== 'historical' && (
                           <div className="flex gap-4 pt-4 border-t border-stone-800 mt-auto">
                               <button onClick={() => handleEdit(selectedItem)} className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-white rounded text-xs font-bold uppercase transition-colors border border-stone-600">
                                   Edit Details
                               </button>
                               <button onClick={(e) => handleDelete(selectedItem.id, e)} className="px-4 py-2 bg-red-900/20 hover:bg-red-900/40 text-red-400 rounded text-xs font-bold uppercase transition-colors border border-red-900/30">
                                   Delete Record
                               </button>
                           </div>
                       )}
                  </div>
              </div>

              {/* Resize Handle */}
              {!isMaximized && (
                  <div 
                    className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize flex items-end justify-end p-0.5 text-stone-600 hover:text-ck3-gold"
                    onMouseDown={startResize}
                  >
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                          <path d="M10 10L0 10L10 0z" />
                      </svg>
                  </div>
              )}
          </div>
      )}

      {/* FULL IMAGE VIEW MODAL */}
      {isFullViewOpen && selectedItem && selectedItem.images[activeImgIdx] && (
          <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 animate-fade-in" onClick={() => setIsFullViewOpen(false)}>
              <button 
                  onClick={() => setIsFullViewOpen(false)} 
                  className="absolute top-4 right-4 text-white/50 hover:text-white p-2 transition-colors"
              >
                  <X size={32} />
              </button>
              <img 
                  src={selectedItem.images[activeImgIdx]} 
                  className="max-w-full max-h-full object-contain shadow-2xl rounded-sm select-none"
                  onClick={(e) => e.stopPropagation()} 
              />
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
      
      {/* CREATE COLLECTION MODAL */}
      {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
              <div className="bg-stone-900 border border-stone-700 rounded-lg p-6 w-full max-w-sm shadow-2xl">
                  <h3 className="font-serif text-lg text-white mb-4">New Collection</h3>
                  <input 
                      autoFocus
                      type="text"
                      className="w-full bg-stone-800 border border-stone-600 rounded p-2 text-stone-200 outline-none focus:border-ck3-gold mb-4"
                      placeholder="Collection Name"
                      value={newCollectionName}
                      onChange={e => setNewCollectionName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && confirmCreateCollection()}
                  />
                  <div className="flex gap-2">
                      <button onClick={() => setIsCreateModalOpen(false)} className="flex-1 py-2 border border-stone-700 rounded text-xs text-stone-500 hover:text-white transition-colors uppercase font-bold">Cancel</button>
                      <button onClick={confirmCreateCollection} className="flex-1 py-2 bg-ck3-gold hover:bg-ck3-goldLight text-stone-900 rounded text-xs font-bold uppercase transition-colors shadow-lg">Create</button>
                  </div>
              </div>
          </div>
      )}

      </main>
    </div>
  );
};

export default Gallery;
