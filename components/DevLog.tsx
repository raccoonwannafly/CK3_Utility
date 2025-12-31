
import React, { useState, useEffect, useMemo, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { ReferenceDocument } from '../types';
import { LOADED_DOCUMENTS } from '../services/docLoader';
import { dbService } from '../services/dbService';
import { FileText, History, Lightbulb, Book, Scroll, Edit3, Upload, Download, Trash2, Save, Plus, X } from 'lucide-react';

const DevLog: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'versions' | 'dev notes' | 'wiki' | 'PRD'>('versions');
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  
  // State for documents including user imported ones
  const [dbDocs, setDbDocs] = useState<ReferenceDocument[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  
  // Editor State
  const [editContent, setEditContent] = useState('');
  const [editTitle, setEditTitle] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load docs from DB on mount
  useEffect(() => {
      const loadLocalDocs = async () => {
          try {
              const local = await dbService.getAllDocs();
              setDbDocs(local);
          } catch (e) {
              console.error("Failed to load local docs", e);
          }
      };
      loadLocalDocs();
  }, []);

  // Derived lists based on current state (Static + DB + Deletion Logic)
  const allDocuments = useMemo(() => {
      // 1. Start with built-in documents
      let combined = [...LOADED_DOCUMENTS];
      
      // 2. Apply DB overrides and new documents
      dbDocs.forEach(d => {
          const idx = combined.findIndex(c => c.id === d.id);
          
          if (d.deleted) {
              // Soft Delete: If flagged as deleted in DB, remove it from the list
              if (idx !== -1) {
                  combined.splice(idx, 1);
              }
          } else {
              // Update or Add
              if (idx !== -1) {
                  combined[idx] = d; // Override built-in
              } else {
                  combined.push(d); // Add new custom
              }
          }
      });
      
      return combined;
  }, [dbDocs]);

  const docs = useMemo(() => {
      return {
          versions: allDocuments.filter(d => d.category === "versions"),
          notes: allDocuments.filter(d => d.category === "dev notes"),
          wiki: allDocuments.filter(d => d.category === "wiki"),
          prd: allDocuments.filter(d => d.category === "PRD")
      };
  }, [allDocuments]);

  // Auto-select first document when switching tabs if nothing selected or current selection is invalid
  useEffect(() => {
      const list = docs[activeTab === 'dev notes' ? 'notes' : activeTab === 'PRD' ? 'prd' : activeTab];
      
      const currentExistsInTab = list.find(d => d.id === selectedDocId);
      
      if (!currentExistsInTab && list && list.length > 0) {
          setSelectedDocId(list[0].id);
      } else if (!currentExistsInTab) {
          setSelectedDocId(''); 
      }
  }, [activeTab, docs, selectedDocId]);

  const currentDoc = allDocuments.find(d => d.id === selectedDocId);
  const isCustomDoc = currentDoc?.path === 'local';

  // Update editor state when document changes
  useEffect(() => {
      if (currentDoc) {
          setEditContent(currentDoc.content || '');
          setEditTitle(currentDoc.title);
          setIsEditing(false);
      }
  }, [currentDoc]);

  // --- HANDLERS ---

  const handleCreateNew = async () => {
      const newId = `doc_${Date.now()}`;
      const today = new Date().toLocaleDateString();
      const newDoc: ReferenceDocument = {
          id: newId,
          title: "New Page",
          category: activeTab,
          content: `# New Entry - ${today}\n\nStart typing here...`,
          path: "local",
          description: "Custom Entry"
      };
      
      await dbService.saveDoc(newDoc);
      setDbDocs(prev => [...prev, newDoc]);
      setSelectedDocId(newId);
      setIsEditing(true);
  };

  const handleSave = async () => {
      if (!currentDoc) return;
      
      const updatedDoc: ReferenceDocument = {
          ...currentDoc,
          title: editTitle,
          content: editContent,
          path: 'local', // Enforce local path for edited docs
          category: activeTab // Keep in current tab or allow moving? For now current.
      };

      await dbService.saveDoc(updatedDoc);
      
      // Update local state
      setDbDocs(prev => {
          const idx = prev.findIndex(d => d.id === updatedDoc.id);
          if (idx !== -1) {
              const copy = [...prev];
              copy[idx] = updatedDoc;
              return copy;
          }
          return [...prev, updatedDoc];
      });
      
      setIsEditing(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
          const content = event.target?.result as string;
          const newDoc: ReferenceDocument = {
              id: `imported_${Date.now()}_${file.name.replace(/\s+/g, '_')}`,
              title: file.name.replace(/\.[^/.]+$/, ""),
              category: activeTab,
              content: content,
              path: 'local',
              description: 'Imported'
          };
          
          await dbService.saveDoc(newDoc);
          setDbDocs(prev => [...prev, newDoc]);
          setSelectedDocId(newDoc.id);
      };
      reader.readAsText(file);
      e.target.value = '';
  };

  const handleDelete = async (doc: ReferenceDocument, e?: React.MouseEvent) => {
      if (e) e.stopPropagation();
      
      if (!confirm(`Permanently delete "${doc.title}"?`)) return;

      const isBuiltIn = LOADED_DOCUMENTS.some(d => d.id === doc.id);

      if (isBuiltIn) {
          // Soft Delete for built-ins: Mark as deleted in DB to hide it
          const tombstone: ReferenceDocument = { ...doc, deleted: true };
          await dbService.saveDoc(tombstone);
          
          // Update state to include this tombstone (which triggers the filter in useMemo)
          setDbDocs(prev => {
              const idx = prev.findIndex(d => d.id === doc.id);
              if (idx !== -1) {
                  const copy = [...prev];
                  copy[idx] = tombstone;
                  return copy;
              }
              return [...prev, tombstone];
          });
      } else {
          // Hard Delete for locals
          await dbService.deleteDoc(doc.id);
          setDbDocs(prev => prev.filter(d => d.id !== doc.id));
      }
      
      if (selectedDocId === doc.id) setSelectedDocId('');
  };

  const handleDownload = () => {
      if (!currentDoc || !currentDoc.content) return;
      const blob = new Blob([currentDoc.content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentDoc.title}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  };

  const renderSidebar = (items: ReferenceDocument[], icon: React.ReactNode) => (
      <div className="w-64 border-r border-stone-700 bg-stone-950/50 flex flex-col shrink-0 overflow-hidden">
          <div className="p-3 border-b border-stone-800 bg-black/20 text-xs font-bold uppercase tracking-widest text-stone-500 flex items-center justify-between">
              <div className="flex items-center gap-2">{icon} Documents</div>
              <div className="flex gap-1">
                <button 
                    onClick={handleCreateNew}
                    className="text-stone-400 hover:text-ck3-gold transition-colors p-1"
                    title="New Page"
                >
                    <Plus size={14} />
                </button>
                <button 
                    onClick={() => fileInputRef.current?.click()} 
                    className="text-stone-400 hover:text-white transition-colors p-1"
                    title="Import Document"
                >
                    <Upload size={14} />
                </button>
              </div>
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-1">
              {items.map(doc => (
                  <div
                      key={doc.id}
                      onClick={() => setSelectedDocId(doc.id)}
                      className={`w-full text-left px-3 py-2 rounded text-xs font-medium transition-all flex items-center justify-between gap-2 group cursor-pointer ${
                          selectedDocId === doc.id 
                          ? 'bg-ck3-gold/10 text-ck3-gold border border-ck3-gold/20' 
                          : 'text-stone-400 hover:bg-white/5 hover:text-stone-200 border border-transparent'
                      }`}
                  >
                      <div className="flex items-center gap-2 truncate flex-1">
                          {doc.path === 'local' ? <Edit3 size={12} className="opacity-50 shrink-0" /> : <FileText size={12} className="opacity-50 shrink-0" />}
                          <span className="truncate">{doc.title}</span>
                      </div>
                      <button 
                        className="text-stone-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1 hover:bg-stone-800 rounded"
                        onClick={(e) => handleDelete(doc, e)}
                        title="Delete"
                      >
                          <Trash2 size={12} />
                      </button>
                  </div>
              ))}
              {items.length === 0 && (
                  <div className="text-center py-10 text-stone-600 italic text-xs">
                      No documents found.
                      <br/>
                      <button onClick={handleCreateNew} className="mt-2 text-ck3-gold hover:underline">Create One</button>
                  </div>
              )}
          </div>
      </div>
  );

  return (
    <div className="flex flex-col h-full animate-fade-in space-y-4">
      {/* Hidden File Input */}
      <input type="file" ref={fileInputRef} className="hidden" accept=".txt,.md" onChange={handleFileUpload} />

      <header className="flex flex-col md:flex-row md:items-end justify-between border-b border-stone-700 pb-4 gap-4">
        <div>
           <h2 className="text-3xl font-serif text-ck3-gold mb-1">Developer Hub</h2>
           <p className="text-stone-400 text-sm">Project tracking, technical documentation, and version history.</p>
        </div>
        
        <div className="flex bg-stone-900 p-1 rounded-lg border border-stone-700 shadow-sm flex-wrap gap-1">
            <button 
                onClick={() => setActiveTab('versions')}
                className={`px-4 py-2 text-xs font-bold rounded transition-all flex items-center gap-2 ${activeTab === 'versions' ? 'bg-ck3-gold text-white shadow-md' : 'text-stone-500 hover:text-stone-300 hover:bg-stone-800'}`}
            >
                <History size={14}/> Versions
            </button>
            <button 
                onClick={() => setActiveTab('dev notes')}
                className={`px-4 py-2 text-xs font-bold rounded transition-all flex items-center gap-2 ${activeTab === 'dev notes' ? 'bg-ck3-gold text-white shadow-md' : 'text-stone-500 hover:text-stone-300 hover:bg-stone-800'}`}
            >
                <Lightbulb size={14}/> Dev Notes
            </button>
            <button 
                onClick={() => setActiveTab('wiki')}
                className={`px-4 py-2 text-xs font-bold rounded transition-all flex items-center gap-2 ${activeTab === 'wiki' ? 'bg-ck3-gold text-white shadow-md' : 'text-stone-500 hover:text-stone-300 hover:bg-stone-800'}`}
            >
                <Book size={14}/> Wiki
            </button>
            <button 
                onClick={() => setActiveTab('PRD')}
                className={`px-4 py-2 text-xs font-bold rounded transition-all flex items-center gap-2 ${activeTab === 'PRD' ? 'bg-purple-700 text-white shadow-md' : 'text-purple-400 hover:text-purple-300 hover:bg-stone-800'}`}
            >
                <Scroll size={14}/> PRD
            </button>
        </div>
      </header>
      
      <div className="flex-1 min-h-0 flex border border-stone-700 rounded-lg overflow-hidden bg-stone-900 shadow-xl">
          {activeTab === 'versions' && renderSidebar(docs.versions, <History size={14}/>)}
          {activeTab === 'dev notes' && renderSidebar(docs.notes, <Lightbulb size={14}/>)}
          {activeTab === 'wiki' && renderSidebar(docs.wiki, <Book size={14}/>)}
          {activeTab === 'PRD' && renderSidebar(docs.prd, <Scroll size={14}/>)}
          
          <div className="flex-1 flex flex-col bg-[#111] overflow-hidden relative">
               {currentDoc ? (
                   <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                       <div className="max-w-4xl mx-auto h-full flex flex-col">
                           
                           {/* Doc Header */}
                           <div className="mb-6 pb-4 border-b border-stone-800 flex justify-between items-start shrink-0">
                               <div className="flex-1 mr-4">
                                   {isEditing ? (
                                       <input 
                                          className="text-3xl font-serif text-stone-200 mb-2 bg-stone-900 border border-stone-700 rounded p-1 w-full outline-none focus:border-ck3-gold"
                                          value={editTitle}
                                          onChange={e => setEditTitle(e.target.value)}
                                          placeholder="Document Title"
                                       />
                                   ) : (
                                       <h1 className="text-3xl font-serif text-stone-200 mb-2">{currentDoc.title}</h1>
                                   )}
                                   <div className="text-[10px] font-mono text-stone-600 flex items-center gap-2">
                                       <span className="bg-stone-800 px-2 py-0.5 rounded text-stone-500">{currentDoc.id}</span>
                                       <span>{currentDoc.description}</span>
                                       {isCustomDoc && <span className="text-emerald-600 bg-emerald-900/20 px-2 py-0.5 rounded">Custom</span>}
                                   </div>
                               </div>
                               <div className="flex gap-2">
                                   {isEditing ? (
                                       <>
                                           <button 
                                                onClick={handleSave}
                                                className="flex items-center gap-2 bg-ck3-gold hover:bg-ck3-goldLight text-stone-900 font-bold px-3 py-1.5 rounded text-xs transition-colors"
                                           >
                                               <Save size={14}/> Save
                                           </button>
                                           <button 
                                                onClick={() => setIsEditing(false)}
                                                className="flex items-center gap-2 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold px-3 py-1.5 rounded text-xs transition-colors"
                                           >
                                               <X size={14}/> Cancel
                                           </button>
                                       </>
                                   ) : (
                                       <>
                                            <button 
                                                onClick={() => { setEditContent(currentDoc.content || ''); setIsEditing(true); }}
                                                className="text-stone-400 hover:text-white transition-colors p-2 rounded hover:bg-white/5"
                                                title="Edit Document"
                                            >
                                                <Edit3 size={18} />
                                            </button>
                                            <button 
                                                onClick={handleDownload}
                                                className="text-stone-500 hover:text-ck3-gold transition-colors p-2 rounded hover:bg-white/5"
                                                title="Export Document"
                                            >
                                                <Download size={18} />
                                            </button>
                                       </>
                                   )}
                               </div>
                           </div>

                           {/* Doc Content */}
                           {isEditing ? (
                               <textarea 
                                   className="w-full flex-1 bg-stone-900 border border-stone-700 rounded p-4 font-mono text-sm text-stone-300 outline-none focus:border-ck3-gold resize-none leading-relaxed"
                                   value={editContent}
                                   onChange={e => setEditContent(e.target.value)}
                                   placeholder="# Markdown Supported..."
                               />
                           ) : (
                               <div className="prose prose-invert prose-stone prose-sm max-w-none flex-1 overflow-y-auto pr-4">
                                   <ReactMarkdown>{currentDoc.content}</ReactMarkdown>
                               </div>
                           )}
                       </div>
                   </div>
               ) : (
                   <div className="flex-1 flex items-center justify-center text-stone-600 flex-col gap-4">
                       <div className="p-4 bg-stone-900 rounded-full">
                           <Edit3 size={48} className="opacity-20"/>
                       </div>
                       <div className="text-center">
                           <p className="mb-2">Select a document to view</p>
                           <button onClick={handleCreateNew} className="bg-stone-800 hover:bg-stone-700 text-stone-300 px-4 py-2 rounded text-xs font-bold transition-colors">
                               Create New Page
                           </button>
                       </div>
                   </div>
               )}
          </div>
      </div>
    </div>
  );
};

export default DevLog;
