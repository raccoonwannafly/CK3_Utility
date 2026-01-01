import React, { useState, useEffect, useMemo, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { ReferenceDocument } from '../types';
import { FileText, History, Lightbulb, Book, Scroll, Edit3, Upload, Download, Trash2, Save, Plus, X, RefreshCw } from 'lucide-react';

const DevLog: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'versions' | 'dev notes' | 'wiki' | 'PRD'>('versions');
    const [selectedDocId, setSelectedDocId] = useState<string>('');

    // State for documents fetched from API
    const [documents, setDocuments] = useState<ReferenceDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isEditing, setIsEditing] = useState(false);

    // Editor State
    const [editContent, setEditContent] = useState('');
    const [editTitle, setEditTitle] = useState('');
    const [editFilename, setEditFilename] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load docs from API
    const fetchDocuments = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/docs');
            if (!res.ok) throw new Error('Failed to fetch docs');
            const data = await res.json();
            setDocuments(data);
        } catch (e: any) {
            console.error("Failed to load docs", e);
            setError("Server offline or unreachable. Is 'node server/index.js' running?");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    const docs = useMemo(() => {
        // Logic from server: category is one of 'versions', 'dev notes', 'wiki', 'PRD'
        return {
            versions: documents.filter(d => d.category === "versions").sort((a, b) => b.id.localeCompare(a.id)), // Sort newest versions first
            notes: documents.filter(d => d.category === "dev notes"),
            wiki: documents.filter(d => d.category === "wiki"),
            prd: documents.filter(d => d.category === "PRD")
        };
    }, [documents]);

    // Auto-select first document logic
    useEffect(() => {
        // Only auto-select if we have docs and nothing is selected (or selection invalid)
        // Avoid resetting selection if user is just switching tabs and the doc exists there? 
        // Actually, distinct lists per tab. If I switch tab, my selected doc might not be in the new tab.

        // Simplification: When tab changes, if current doc is NOT in new tab, select first of new tab.
        const list = docs[activeTab === 'dev notes' ? 'notes' : activeTab === 'PRD' ? 'prd' : activeTab];
        const currentInTab = list.find(d => d.id === selectedDocId);

        if (!currentInTab && list.length > 0) {
            setSelectedDocId(list[0].id);
        } else if (!currentInTab && list.length === 0) {
            setSelectedDocId('');
        }
    }, [activeTab, documents, selectedDocId]); // Depend on 'documents' to trigger after fetch

    const currentDoc = documents.find(d => d.id === selectedDocId);

    // Sync editor state
    useEffect(() => {
        if (currentDoc) {
            setEditContent(currentDoc.content || '');
            setEditTitle(currentDoc.title);
            setEditFilename(currentDoc.id);
            setIsEditing(false);
        }
    }, [currentDoc]);

    // --- HANDLERS ---

    const handleCreateNew = () => {
        // Temporary state for creation
        const tempId = `new_${Date.now()}`;
        const newDoc: ReferenceDocument = {
            id: tempId,
            title: "New Document",
            category: activeTab,
            content: "# New Document\n\nStart typing...",
            path: 'local',
            description: 'Draft'
        };

        setDocuments(prev => [...prev, newDoc]);
        setSelectedDocId(tempId);
        setIsEditing(true);
    };

    const handleSave = async () => {
        if (!currentDoc) return;

        try {
            let idToSend = currentDoc.id;

            // Case 1: Renaming an existing file
            if (!idToSend.startsWith('new_') && !idToSend.startsWith('imported_') && editFilename !== currentDoc.id) {
                // Call rename endpoint
                const renameRes = await fetch('/api/docs/rename', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ oldId: currentDoc.id, newId: editFilename })
                });

                if (!renameRes.ok) {
                    const err = await renameRes.json();
                    throw new Error(err.error || "Failed to rename");
                }

                // If rename successful, update our target ID
                idToSend = editFilename;
            }
            // Case 2: Saving a NEW file
            else if (idToSend.startsWith('new_') || idToSend.startsWith('imported_')) {
                // If user typed a filename, use it. Otherwise sanitize title.
                if (editFilename !== currentDoc.id && !editFilename.startsWith('new_')) {
                    idToSend = editFilename;
                } else {
                    const safeTitle = editTitle.replace(/[^a-zA-Z0-9-_]/g, '_').toLowerCase();
                    idToSend = safeTitle + ".md";
                }
            }

            const res = await fetch('/api/docs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: idToSend,
                    content: editContent,
                    category: activeTab
                })
            });

            if (!res.ok) throw new Error("Failed to save");
            const result = await res.json(); // returns { success: true, id: 'versions/v1.3.2.md' }

            // Update local state with real ID from server
            const newId = result.id;

            const updatedDoc: ReferenceDocument = {
                ...currentDoc,
                id: newId,
                title: editTitle,
                content: editContent,
                category: activeTab
            };

            setDocuments(prev => prev.map(d => d.id === currentDoc.id ? updatedDoc : d));
            setSelectedDocId(newId);
            setIsEditing(false);

        } catch (e) {
            console.error(e);
            alert("Failed to save document. Check console.");
        }
    };

    const handleDelete = async (doc: ReferenceDocument, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (!confirm(`Permanently delete "${doc.title}"? This cannot be undone.`)) return;

        // Deleting via query parameter to safely handle IDs with slashes

        try {
            const res = await fetch(`/api/docs?id=${encodeURIComponent(doc.id)}`, { method: 'DELETE' });
            if (!res.ok) throw new Error("Failed to delete");

            setDocuments(prev => prev.filter(d => d.id !== doc.id));
            if (selectedDocId === doc.id) setSelectedDocId('');
        } catch (e) {
            // If it was a local draft that wasn't saved yet
            if (doc.id.startsWith('new_')) {
                setDocuments(prev => prev.filter(d => d.id !== doc.id));
            } else {
                alert(`Failed to delete: ${e instanceof Error ? e.message : "Check server connection."}`);
            }
        }
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
                </div>
            </div>
            <div className="overflow-y-auto flex-1 p-2 space-y-1">
                {items.map(doc => (
                    <div
                        key={doc.id}
                        onClick={() => setSelectedDocId(doc.id)}
                        className={`w-full text-left px-3 py-2 rounded text-xs font-medium transition-all flex items-center justify-between gap-2 group cursor-pointer ${selectedDocId === doc.id
                            ? 'bg-ck3-gold/10 text-ck3-gold border border-ck3-gold/20'
                            : 'text-stone-400 hover:bg-white/5 hover:text-stone-200 border border-transparent'
                            }`}
                    >
                        <div className="flex items-center gap-2 truncate flex-1">
                            <FileText size={12} className="opacity-50 shrink-0" />
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
                {items.length === 0 && !loading && (
                    <div className="text-center py-10 text-stone-600 italic text-xs">
                        No documents found.
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="flex flex-col h-full animate-fade-in space-y-4">
            <header className="flex flex-col md:flex-row md:items-end justify-between border-b border-stone-700 pb-4 gap-4">
                <div>
                    <div className="flex items-center gap-4">
                        <h2 className="text-3xl font-serif text-ck3-gold mb-1">Developer Hub</h2>
                        {!loading && !error && (
                            <button onClick={fetchDocuments} title="Refresh" className="text-stone-600 hover:text-white"><RefreshCw size={14} /></button>
                        )}
                    </div>
                    <p className="text-stone-400 text-sm">External Documentation Editor (Live Sync)</p>
                </div>

                <div className="flex bg-stone-900 p-1 rounded-lg border border-stone-700 shadow-sm flex-wrap gap-1">
                    <button
                        onClick={() => setActiveTab('versions')}
                        className={`px-4 py-2 text-xs font-bold rounded transition-all flex items-center gap-2 ${activeTab === 'versions' ? 'bg-ck3-gold text-white shadow-md' : 'text-stone-500 hover:text-stone-300 hover:bg-stone-800'}`}
                    >
                        <History size={14} /> Versions
                    </button>
                    <button
                        onClick={() => setActiveTab('dev notes')}
                        className={`px-4 py-2 text-xs font-bold rounded transition-all flex items-center gap-2 ${activeTab === 'dev notes' ? 'bg-ck3-gold text-white shadow-md' : 'text-stone-500 hover:text-stone-300 hover:bg-stone-800'}`}
                    >
                        <Lightbulb size={14} /> Dev Notes
                    </button>
                    <button
                        onClick={() => setActiveTab('wiki')}
                        className={`px-4 py-2 text-xs font-bold rounded transition-all flex items-center gap-2 ${activeTab === 'wiki' ? 'bg-ck3-gold text-white shadow-md' : 'text-stone-500 hover:text-stone-300 hover:bg-stone-800'}`}
                    >
                        <Book size={14} /> Wiki
                    </button>
                    <button
                        onClick={() => setActiveTab('PRD')}
                        className={`px-4 py-2 text-xs font-bold rounded transition-all flex items-center gap-2 ${activeTab === 'PRD' ? 'bg-purple-700 text-white shadow-md' : 'text-purple-400 hover:text-purple-300 hover:bg-stone-800'}`}
                    >
                        <Scroll size={14} /> PRD
                    </button>
                </div>
            </header>

            {error && (
                <div className="bg-red-900/20 border border-red-900/50 text-red-200 p-4 rounded text-center">
                    <p className="font-bold">Connection Error</p>
                    <p className="text-sm opacity-80">{error}</p>
                </div>
            )}

            <div className="flex-1 min-h-0 flex border border-stone-700 rounded-lg overflow-hidden bg-stone-900 shadow-xl">
                {activeTab === 'versions' && renderSidebar(docs.versions, <History size={14} />)}
                {activeTab === 'dev notes' && renderSidebar(docs.notes, <Lightbulb size={14} />)}
                {activeTab === 'wiki' && renderSidebar(docs.wiki, <Book size={14} />)}
                {activeTab === 'PRD' && renderSidebar(docs.prd, <Scroll size={14} />)}

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
                                        <div className="flex flex-col gap-1 mt-1">
                                            {isEditing && currentDoc.path === 'local' ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-stone-500 text-[10px] uppercase font-bold">Filename:</span>
                                                    <input
                                                        className="bg-stone-800 border border-stone-600 rounded px-2 py-0.5 text-xs font-mono text-stone-300 w-64 outline-none focus:border-ck3-gold"
                                                        value={editFilename}
                                                        onChange={e => setEditFilename(e.target.value)}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="text-[10px] font-mono text-stone-600 flex items-center gap-2">
                                                    <span className="bg-stone-800 px-2 py-0.5 rounded text-stone-500">{currentDoc.id}</span>
                                                    {/* Source Indicator */}
                                                    {currentDoc.path === 'local' ? (
                                                        <span className="bg-emerald-900/30 text-emerald-500 px-2 py-0.5 rounded border border-emerald-900/50 flex items-center gap-1">
                                                            <FileText size={8} /> FILE
                                                        </span>
                                                    ) : (
                                                        <span className="bg-amber-900/30 text-amber-500 px-2 py-0.5 rounded border border-amber-900/50 flex items-center gap-1">
                                                            <Book size={8} /> BAKED
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {isEditing ? (
                                            <>
                                                <button
                                                    onClick={handleSave}
                                                    className="flex items-center gap-2 bg-ck3-gold hover:bg-ck3-goldLight text-stone-900 font-bold px-3 py-1.5 rounded text-xs transition-colors"
                                                >
                                                    <Save size={14} /> Save
                                                </button>
                                                <button
                                                    onClick={() => setIsEditing(false)}
                                                    className="flex items-center gap-2 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold px-3 py-1.5 rounded text-xs transition-colors"
                                                >
                                                    <X size={14} /> Cancel
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
                            {loading ? (
                                <div className="animate-pulse">Loading Documents...</div>
                            ) : (
                                <>
                                    <div className="p-4 bg-stone-900 rounded-full">
                                        <Edit3 size={48} className="opacity-20" />
                                    </div>
                                    <div className="text-center">
                                        <p className="mb-2">Select a document to edit or view source</p>
                                        <button onClick={handleCreateNew} className="bg-stone-800 hover:bg-stone-700 text-stone-300 px-4 py-2 rounded text-xs font-bold transition-colors">
                                            Create New Page
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DevLog;
