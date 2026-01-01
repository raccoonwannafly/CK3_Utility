import React, { useEffect, useState, useRef, useMemo } from 'react';
import { fetchGallery, saveToGallery, updateCharacter, deleteCharacter, importFromSteam } from '../services/geminiService';
import { exportGallery, importGallery } from '../services/ioService';
import { StoredCharacter } from '../types';
import { TRAITS, HISTORICAL_CHARACTERS, PRESTIGE_LEVELS, PIETY_LEVELS } from '../constants';
import { compressImage } from '../utils';
import {
    Folder, History, Layers, Plus, Trash2, FolderInput, Library, LayoutGrid,
    List, Search, Upload, Image as ImageIcon, Check, X, Maximize2, Minimize2,
    Move, Star, ImagePlus, GripHorizontal, ChevronLeft, ChevronRight, ZoomIn, Tag, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Tilt from 'react-parallax-tilt';

interface GalleryProps {
    onNavigate: (tab: string) => void;
    isPersistentMode?: boolean;
    designSettings?: { enableAnimations: boolean; enableGlassmorphism: boolean; enable3DTilt: boolean; enableImmersiveFonts: boolean };
}

const Gallery: React.FC<GalleryProps> = ({ onNavigate, isPersistentMode = false, designSettings }) => {
    // --- State ---
    const [items, setItems] = useState<StoredCharacter[]>([]);
    const [apiHistoricalChars, setApiHistoricalChars] = useState<StoredCharacter[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dataSource, setDataSource] = useState<'server' | 'local'>('server');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'name' | 'dob' | 'dynasty' | 'house' | 'edited' | 'added'>('name');

    // Selection State
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Tag Input State
    const [tagInput, setTagInput] = useState('');

    // Size State (NEW)
    const [cardSize, setCardSize] = useState<'sm' | 'md' | 'lg'>('md');

    // Helper for grid class
    const getGridClass = () => {
        switch (cardSize) {
            case 'sm': return 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6';
            case 'lg': return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2';
            default: return 'grid-cols-1 md:grid-cols-3 lg:grid-cols-4';
        }
    };

    // Tag Suggestions
    const tagSuggestions = useMemo(() => {
        if (!tagInput.trim()) return [];
        const input = tagInput.toLowerCase();
        // Search in Constants TRAITS and also existing tags
        // Prioritize game traits
        const traitMatches = TRAITS.filter(t =>
            t.name.toLowerCase().includes(input) || t.id.includes(input)
        ).map(t => t.name).slice(0, 5);

        return traitMatches;
    }, [tagInput]);

    // --- Visual Settings Logic ---
    const fonts = designSettings?.enableImmersiveFonts ? {
        header: 'font-uncial tracking-wider',
        subHeader: 'font-medieval tracking-wide',
        body: 'font-cormorant font-semibold text-lg',
        accent: 'font-medieval'
    } : {
        header: 'font-serif',
        subHeader: 'font-serif',
        body: 'font-sans',
        accent: 'font-serif'
    };

    const cardGlassClass = designSettings?.enableGlassmorphism
        ? "bg-stone-900/40 backdrop-blur-md border border-white/10 shadow-glass hover:shadow-glow hover:border-ck3-gold/50"
        : "bg-stone-800 border border-stone-700 hover:border-ck3-gold/50 shadow-lg";

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    // Navigation State
    const [activeView, setActiveView] = useState<'all' | 'historical' | 'unsorted' | string>('all');

    // Custom Collections
    const [customCollections, setCustomCollections] = useState<string[]>(() => {
        const saved = localStorage.getItem('ck3_utility_collections');
        return saved ? JSON.parse(saved) : ['Campaign 1'];
    });

    const [view, setView] = useState<'grid' | 'form' | 'details'>('grid');
    const [selectedItem, setSelectedItem] = useState<StoredCharacter | null>(null);

    // Window State (Details View)
    const [winPos, setWinPos] = useState({ x: 100, y: 50 });
    const [winSize, setWinSize] = useState({ w: 900, h: 600 });
    const [isMaximized, setIsMaximized] = useState(false);
    const [activeImgIdx, setActiveImgIdx] = useState(0);
    const [newImageUrl, setNewImageUrl] = useState('');
    const [isZoomed, setIsZoomed] = useState(false);

    // Reset zoom when image changes
    useEffect(() => {
        setIsZoomed(false);
    }, [activeImgIdx, selectedItem?.id]);
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
    const [titleInput, setTitleInput] = useState('');


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
            setWinPos({ x: Math.max(50, w / 2 - 450), y: Math.max(50, h / 2 - 300) });
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
                collection: item.collection || 'Unsorted',
                // Ensure new fields exist even if old data
                events: item.events || "",
                achievements: item.achievements || "",
                dateStart: item.dateStart || "",
                dateBirth: item.dateBirth || ""
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

        // Fetch Historical Data for Persistent Mode (or just to see live edits)
        const loadHistorical = async () => {
            try {
                const res = await fetch('http://localhost:3001/api/historical');
                if (res.ok) {
                    const data = await res.json();
                    setApiHistoricalChars(data);
                }
            } catch (e) {
                console.log("Failed to load historical chars from API, using defaults.");
            }
        };
        loadHistorical();
    }, []);

    // --- DERIVED DATA ---
    const counts = useMemo(() => {
        const effectiveHistorical = apiHistoricalChars.length > 0 ? apiHistoricalChars : HISTORICAL_CHARACTERS;
        const historical = effectiveHistorical.length;
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

        // Use API fetched historical data if available, otherwise static
        const effectiveHistorical = apiHistoricalChars.length > 0 ? apiHistoricalChars : HISTORICAL_CHARACTERS;

        if (activeView === 'historical') {
            // Show historical chars, but prioritize local overrides
            const historicalItems = effectiveHistorical.filter(h => !items.some(i => i.id === h.id));
            const overriddenItems = items.filter(i => effectiveHistorical.some(h => h.id === i.id));
            baseList = [...overriddenItems, ...historicalItems];
        } else if (activeView === 'all') {
            // Merge items and historical for the 'All' view
            // Prioritize saved items (items) which may contain edits of historical chars
            const historicalItems = effectiveHistorical.filter(h => !items.some(i => i.id === h.id));
            baseList = [...items, ...historicalItems];
        } else if (activeView === 'unsorted') {
            baseList = items.filter(i => !i.collection || i.collection === 'Unsorted');
        } else {
            baseList = items.filter(i => i.collection === activeView);
        }

        const result = baseList.filter(item => {
            if (item.deleted) return false;
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

        return result.sort((a, b) => {
            if (sortBy === 'name') {
                return a.name.localeCompare(b.name);
            } else if (sortBy === 'dynasty') {
                return (a.dynastyName || '').localeCompare(b.dynastyName || '');
            } else if (sortBy === 'house') {
                return (a.houseName || '').localeCompare(b.houseName || '');
            } else if (sortBy === 'edited') {
                const dateA = a.updatedAt || a.createdAt || '0000-00-00';
                const dateB = b.updatedAt || b.createdAt || '0000-00-00';
                return dateB.localeCompare(dateA); // Newest first
            } else if (sortBy === 'added') {
                const dateA = a.createdAt || '0000-00-00';
                const dateB = b.createdAt || '0000-00-00';
                return dateB.localeCompare(dateA); // Newest first
            } else {
                // Chronological Sort (Oldest first)
                const dateA = a.dateBirth || a.createdAt || '9999-99-99';
                const dateB = b.dateBirth || b.createdAt || '9999-99-99';
                return dateA.localeCompare(dateB);
            }
        });
    }, [items, activeView, searchTerm, apiHistoricalChars, sortBy]);


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
        if (!confirm(`Are you sure you want to delete/hide ${selectedIds.size} characters?`)) return;

        setLoading(true);
        try {
            const idsToDelete = Array.from(selectedIds) as string[];
            const effectiveHistorical = apiHistoricalChars.length > 0 ? apiHistoricalChars : HISTORICAL_CHARACTERS;

            const historicalIds = idsToDelete.filter(id => effectiveHistorical.some(h => h.id === id));
            const customIds = idsToDelete.filter(id => !historicalIds.includes(id));

            // Optimistic Update
            setItems(prev => {
                // Remove custom chars
                let newItems = prev.filter(item => !customIds.includes(item.id));

                // Mark historical chars as deleted (update existing overrides)
                newItems = newItems.map(item => historicalIds.includes(item.id) ? { ...item, deleted: true } : item);

                // Add overrides for historical chars that didn't have one yet
                historicalIds.forEach(hid => {
                    if (!newItems.some(i => i.id === hid)) {
                        const histChar = effectiveHistorical.find(h => h.id === hid);
                        if (histChar) newItems.push({ ...histChar, deleted: true });
                    }
                });
                return newItems;
            });

            // Execute Custom Deletions (Hard Delete)
            for (const id of customIds) {
                await deleteCharacter(id);
            }

            // Execute Historical Deletions (Soft Delete)
            for (const id of historicalIds) {
                await updateCharacter(id, { deleted: true });
            }

            if (selectedItem && idsToDelete.includes(selectedItem.id)) {
                setSelectedItem(null);
                if (view === 'details') setView('grid');
            }

            clearSelection();
        } catch (e: any) {
            console.error("Bulk Delete Error:", e);
            alert("Failed to delete some items. See console for details.");
            loadGallery();
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
            console.error("Import Error:", err);
            alert(`Import failed: ${err.message || "Unknown error"}`);
        } finally {
            setLoading(false);
            // Crucial: Reset the input so the same file can be selected again if needed
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

        await updateCharacter(updatedChar.id, { images: updatedImages }, updatedChar);
        setNewImageUrl('');
        setIsAddingImage(false);
        setActiveImgIdx(updatedImages.length - 1);
    };

    const handleDetailsImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!selectedItem || !e.target.files?.length) return;
        const files = Array.from(e.target.files) as File[];

        try {
            const compressedBase64s = await Promise.all(files.map(f => compressImage(f)));
            const updatedImages = [...selectedItem.images, ...compressedBase64s];
            const updatedChar = { ...selectedItem, images: updatedImages };

            setSelectedItem(updatedChar);
            setItems(prev => prev.map(i => i.id === updatedChar.id ? updatedChar : i));

            await updateCharacter(updatedChar.id, { images: updatedImages }, updatedChar);
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

        await updateCharacter(updatedChar.id, { images }, updatedChar);
    };

    const handleDeleteImage = async (index: number) => {
        if (!selectedItem) return;
        if (!confirm("Remove this image?")) return;
        const images = [...selectedItem.images];
        images.splice(index, 1);

        const updatedChar = { ...selectedItem, images };
        setSelectedItem(updatedChar);
        setItems(prev => prev.map(i => i.id === updatedChar.id ? updatedChar : i));
        if (activeImgIdx >= images.length) setActiveImgIdx(Math.max(0, images.length - 1));

        await updateCharacter(updatedChar.id, { images }, updatedChar);
    };

    // Navigate images in full screen view
    const navigateImage = (direction: number) => {
        const currentImages = view === 'form' ? formData.images : selectedItem?.images;
        if (!currentImages || currentImages.length === 0) return;

        setActiveImgIdx(prev => {
            let next = prev + direction;
            if (next >= currentImages.length) next = 0;
            if (next < 0) next = currentImages.length - 1;
            return next;
        });
    };


    // --- IMAGE UPLOAD (FORM VIEW) ---
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []) as File[];
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

    const handleAddTag = () => {
        if (!tagInput.trim()) return;
        if (!formData.tags?.includes(tagInput.trim())) {
            setFormData(prev => ({
                ...prev,
                tags: [...(prev.tags || []), tagInput.trim()]
            }));
        }
        setTagInput('');
    };

    const removeTag = (tagToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags?.filter(t => t !== tagToRemove) || []
        }));
    };

    const handleAddTitle = () => {
        if (!titleInput.trim()) return;
        if (!formData.titles?.includes(titleInput.trim())) {
            setFormData(prev => ({
                ...prev,
                titles: [...(prev.titles || []), titleInput.trim()]
            }));
        }
        setTitleInput('');
    };

    const removeTitle = (titleToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            titles: prev.titles?.filter(t => t !== titleToRemove) || []
        }));
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
            birthName: '',
            titles: [],
            culture: '',
            religion: '',
            race: '',
            traits: [],
            images: [],
            tags: [],
            dna: '',
            persistentDna: '',
            bio: '',
            events: '',
            achievements: '',
            dateStart: '',
            dateBirth: '',
            goal: '',
            dynastyName: '',
            dynastyMotto: '',
            houseName: '',
            prestigeLevel: '0',
            pietyLevel: '0',
            category: 'custom',
            collection: activeView === 'all' || activeView === 'historical' ? 'Unsorted' : activeView
        });
        setTagInput('');
        setFormErrors(null);
        setView('form');
    };

    const handleEdit = (item: StoredCharacter) => {
        setFormData({ ...item });
        setTagInput('');
        setTitleInput('');
        setFormErrors(null);
        setView('form');
    };

    const handleDelete = async (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();

        // Check if it's a historical override
        const effectiveHistorical = apiHistoricalChars.length > 0 ? apiHistoricalChars : HISTORICAL_CHARACTERS;
        const isHistorical = effectiveHistorical.some(h => h.id === id);

        const confirmMsg = isHistorical
            ? "Hide this historical character from the archives?"
            : "Are you sure you want to burn this record from the archives?";

        if (!confirm(confirmMsg)) return;

        try {
            if (isHistorical) {
                // Soft delete for historical characters (create an override with deleted: true)
                const histChar = effectiveHistorical.find(h => h.id === id);
                // We must ensure we have the full object to save properly if it's a new override
                // If it's already in items, we just update it.
                // If not, we take from histChar.

                await updateCharacter(id, { deleted: true });

                setItems(prev => {
                    const exists = prev.some(i => i.id === id);
                    if (exists) {
                        return prev.map(i => i.id === id ? { ...i, deleted: true } : i);
                    } else if (histChar) {
                        return [...prev, { ...histChar, deleted: true }];
                    }
                    return prev;
                });

            } else {
                // Hard delete for custom characters
                await deleteCharacter(id);
                setItems(prev => prev.filter(i => i.id !== id));
            }

            if (selectedItem?.id === id) {
                setView('grid');
                setSelectedItem(null);
            }
        } catch (e: any) {
            console.error("Delete failed:", e);
            alert(`Failed to delete character: ${e.message || "Unknown error"}`);
        }
    };

    const handleSaveForm = async () => {
        if (!formData.name) return setFormErrors("A name is required for the annals of history.");

        setIsSubmitting(true);
        setFormErrors(null);

        try {
            const now = new Date().toISOString();
            let savedItem: StoredCharacter | null = null;

            // --- PERSISTENT EDIT MODE ---
            // If mode is active AND we are editing a character that is historically categorized (or new with 'historical' category)
            if (isPersistentMode) {
                const effectiveHistorical = apiHistoricalChars.length > 0 ? apiHistoricalChars : HISTORICAL_CHARACTERS;
                let newList = [...effectiveHistorical];

                // Determine ID: keep existing or generate new
                // For historical chars, ID should ideally be stable. if creating new in persistent mode, we should perhaps alert user or auto-prefix.
                const charId = formData.id || `hist_${Date.now()}`;

                savedItem = {
                    ...(formData as StoredCharacter),
                    id: charId,
                    createdAt: formData.createdAt || now,
                    category: 'historical' // Force historical category if saving to this file
                };

                const existingIdx = newList.findIndex(h => h.id === charId);
                if (existingIdx >= 0) {
                    newList[existingIdx] = savedItem;
                } else {
                    newList.push(savedItem);
                }

                // Write to Backend
                const res = await fetch('http://localhost:3001/api/historical', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ characters: newList })
                });

                if (!res.ok) throw new Error("Failed to save to server file system.");

                // Update local state to reflect change immediately
                setApiHistoricalChars(newList);
                alert("Character saved to Persistent Historical File.");
            }

            // --- NORMAL / USER DATABASE SAVE ---
            // Even if persistent (for redundancy) or if NOT persistent
            if (!isPersistentMode) {
                const payload = { ...formData, category: formData.category || 'custom' };
                if (formData.id) {
                    const updated = await updateCharacter(formData.id, payload, payload as StoredCharacter);
                    // Check if item exists in items array, if not add it (for editing historical chars)
                    setItems(prev => {
                        const exists = prev.some(i => i.id === updated.id);
                        if (exists) {
                            return prev.map(i => i.id === updated.id ? updated : i);
                        } else {
                            return [updated, ...prev];
                        }
                    });
                    savedItem = updated;
                } else {
                    const newChar = await saveToGallery(payload);
                    setItems(prev => [newChar, ...prev]);
                    savedItem = newChar;
                }
            }

            setView('details');
            if (savedItem) setSelectedItem(savedItem);
        } catch (e: any) {
            setFormErrors(e.message || "Failed to write to the archives.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const copyDna = (dna: string) => {
        if (!dna) return alert("No DNA record found.");
        navigator.clipboard.writeText(dna);
        alert("DNA sequence copied.");
    };

    // --- CLIPBOARD PASTE HANDLER ---
    const handlePaste = async (e: React.ClipboardEvent) => {
        // Only handle if we are in form or details view, or generally if appropriate
        if (view === 'grid') return;

        const items = e.clipboardData.items;
        const imageItems = Array.from(items).filter(item => item.type.indexOf('image') !== -1);

        if (imageItems.length === 0) return;

        e.preventDefault();

        try {
            const files = imageItems.map(item => item.getAsFile()).filter((f): f is File => f !== null);
            const compressedImages = await Promise.all(files.map(f => compressImage(f)));

            if (view === 'details' && selectedItem) {
                const updatedImages = [...selectedItem.images, ...compressedImages];
                const updatedChar = { ...selectedItem, images: updatedImages };

                setSelectedItem(updatedChar);
                setItems(prev => prev.map(i => i.id === updatedChar.id ? updatedChar : i));
                setActiveImgIdx(updatedImages.length - 1);
                await updateCharacter(updatedChar.id, { images: updatedImages }, updatedChar);
                // alert("Image pasted from clipboard.");
            } else if (view === 'form') {
                setFormData(prev => ({
                    ...prev,
                    images: [...(prev.images || []), ...compressedImages]
                }));
                // alert("Image pasted from clipboard.");
            }
        } catch (err) {
            console.error("Paste failed:", err);
        }
    };

    return (
        <div
            className="flex flex-col md:flex-row h-[calc(100vh-100px)] w-full gap-0 md:gap-6 animate-fade-in relative outline-none"
            onPaste={handlePaste}
            tabIndex={0} // Make focusable to capture paste events
        >

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
                                <span className="flex items-center gap-2"><LayoutGrid size={14} /> All Characters</span>
                                <span className="text-[10px] opacity-60 bg-black/30 px-1.5 rounded">{counts.all}</span>
                            </button>
                            <button
                                onClick={() => { setActiveView('unsorted'); clearSelection(); }}
                                className={`w-full text-left px-3 py-2 rounded flex justify-between items-center text-sm font-medium transition-colors ${activeView === 'unsorted' ? 'bg-ck3-gold/10 text-ck3-gold border border-ck3-gold/30' : 'text-stone-400 hover:bg-white/5 hover:text-stone-200'}`}
                            >
                                <span className="flex items-center gap-2"><Layers size={14} /> Unsorted</span>
                                <span className="text-[10px] opacity-60 bg-black/30 px-1.5 rounded">{counts.unsorted}</span>
                            </button>
                            <button
                                onClick={() => { setActiveView('historical'); clearSelection(); }}
                                className={`w-full text-left px-3 py-2 rounded flex justify-between items-center text-sm font-medium transition-colors ${activeView === 'historical' ? 'bg-purple-900/20 text-purple-300 border border-purple-700/30' : 'text-stone-400 hover:bg-white/5 hover:text-stone-200'}`}
                            >
                                <span className="flex items-center gap-2"><History size={14} /> Historical</span>
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
                                    <span className="flex items-center gap-2 truncate max-w-[140px]"><Folder size={14} /> {col}</span>
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
                            <Plus size={14} /> New Character
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
                                        <FolderInput size={14} /> Move to...
                                    </button>
                                    {activeView !== 'historical' && (
                                        <button onClick={handleBulkDelete} className="px-3 py-1.5 bg-red-900/50 hover:bg-red-900 text-red-300 rounded text-xs font-bold flex items-center gap-2 border border-red-900 transition-colors">
                                            <Trash2 size={14} /> Delete
                                        </button>
                                    )}
                                    <button onClick={clearSelection} className="px-3 py-1.5 text-stone-500 hover:text-white">&times;</button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex justify-between items-center w-full gap-4">
                                <div>
                                    <h2 className={`text-xl text-white capitalize flex items-center gap-2 ${fonts.header}`}>
                                        {activeView === 'all' ? 'All Characters' : activeView}
                                    </h2>
                                </div>

                                <div className="flex items-center gap-3">
                                    {/* Sorting Controls */}
                                    <div className="flex bg-stone-950/50 rounded-lg p-1 border border-stone-800">
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value as any)}
                                            className="bg-transparent text-[10px] font-bold uppercase tracking-widest text-stone-400 outline-none px-2 py-0.5 cursor-pointer hover:text-stone-200"
                                        >
                                            <option value="name">Name (A-Z)</option>
                                            <option value="dynasty">Dynasty</option>
                                            <option value="house">House</option>
                                            <option value="dob">Birth Date</option>
                                            <option value="edited">Recently Edited</option>
                                            <option value="added">Recently Added</option>
                                        </select>
                                    </div>

                                    {/* Size Controls */}
                                    <div className="flex bg-stone-950/50 rounded-lg p-1 border border-stone-800">
                                        <button onClick={() => setCardSize('sm')} className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${cardSize === 'sm' ? 'bg-stone-700 text-ck3-gold' : 'text-stone-500 hover:text-stone-300'}`} title="Small Grid">S</button>
                                        <button onClick={() => setCardSize('md')} className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${cardSize === 'md' ? 'bg-stone-700 text-ck3-gold' : 'text-stone-500 hover:text-stone-300'}`} title="Medium Grid">M</button>
                                        <button onClick={() => setCardSize('lg')} className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${cardSize === 'lg' ? 'bg-stone-700 text-ck3-gold' : 'text-stone-500 hover:text-stone-300'}`} title="Large Grid">L</button>
                                    </div>

                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Search..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="bg-black/30 border border-stone-700 rounded-full py-1.5 pl-8 pr-4 text-xs text-stone-300 w-48 focus:w-64 transition-all outline-none focus:border-ck3-gold"
                                        />
                                        <Search className="absolute left-2.5 top-1.5 text-stone-600" size={14} />
                                    </div>
                                    <button onClick={() => setIsSteamModalOpen(true)} className="text-stone-400 hover:text-white transition-colors" title="Steam Import">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M11.979 0C5.666 0 .502 4.908.035 11.13l5.592 2.31c.966-2.14 3.09-3.626 5.568-3.626 3.39 0 6.136 2.748 6.136 6.136 0 3.388-2.746 6.136-6.136 6.136-3.328 0-6.039-2.65-6.13-5.952l-5.02 2.073c.963 4.298 4.79 7.514 9.355 7.514 5.342 0 9.673-4.332 9.673-9.673S17.32 0 11.979 0zm-1.85 13.918l-3.344-1.38c-.143.456-.22.94-.22 1.442 0 .59.106 1.157.302 1.685l3.29-1.358c-.02-.126-.03-.254-.03-.385 0-1.107.9-2.006 2.006-2.006.128 0 .253.012.376.03l-1.35 3.27c-.52-.19-1.08-.293-1.666-.293-1.846 0-3.415 1.157-4.04 2.82l-5.69-2.35c.983-4.086 4.67-7.11 9.073-7.11 5.166 0 9.356 4.19 9.356 9.355s-4.19 9.356-9.356 9.356c-4.14 0-7.65-2.67-8.986-6.425l5.12-2.115c.677 1.83 2.437 3.13 4.492 3.13 2.656 0 4.81-2.155 4.81-4.81s-2.154-4.81-4.81-4.81c-2.355 0-4.325 1.682-4.757 3.91l3.35 1.393c.31-.692 1.002-1.173 1.808-1.173 1.092 0 1.976.885 1.976 1.976 0 .806-.48 1.5-1.173 1.81z" /></svg>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Grid of Characters */}
                {/* Grid of Characters - Always Rendered but Dimmed in Details View */}
                <div className={`flex-1 overflow-y-auto p-4 scrollbar-thin transition-opacity duration-500 custom-scrollbar ${selectedItem && view === 'details' && !isMaximized ? 'opacity-30 pointer-events-none blur-sm' : ''}`}>
                    {filteredItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-stone-600">
                            <History size={48} className="mb-4 opacity-20" />
                            <p>No characters found in the archives.</p>
                            {searchTerm && <p className="text-xs mt-2">Try a different search term.</p>}
                        </div>
                    ) : (
                        <motion.div
                            className={`grid gap-4 ${getGridClass()}`}
                            variants={designSettings?.enableAnimations ? containerVariants : {}}
                            initial="hidden"
                            animate="show"
                        >
                            <AnimatePresence>
                                {filteredItems.map(item => (
                                    <motion.div
                                        key={item.id}
                                        layout={designSettings?.enableAnimations}
                                        variants={designSettings?.enableAnimations ? itemVariants : {}}
                                        initial={designSettings?.enableAnimations ? "hidden" : undefined}
                                        animate={designSettings?.enableAnimations ? "show" : undefined}
                                        exit={designSettings?.enableAnimations ? { opacity: 0, scale: 0.9 } : undefined}
                                        onClick={() => { setSelectedItem(item); setView('details'); }}
                                    >
                                        <Tilt
                                            tiltEnable={designSettings?.enable3DTilt}
                                            scale={designSettings?.enable3DTilt ? 1.02 : 1}
                                            transitionSpeed={1500}
                                            className={`group relative aspect-[3/4] rounded-lg overflow-hidden border transition-all cursor-pointer shadow-lg hover:shadow-2xl hover:-translate-y-1 ${selectedIds.has(item.id) ? 'border-ck3-gold ring-1 ring-ck3-gold' : cardGlassClass}`}
                                        >
                                            {item.images[0] ? (
                                                <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center bg-stone-900 text-stone-700">
                                                    <ImageIcon size={32} />
                                                    <span className="text-[10px] mt-2 uppercase font-bold tracking-widest">No Portrait</span>
                                                </div>
                                            )}

                                            <div className="gallery-card-overlay absolute inset-0 bg-gradient-to-t from-black/100 via-black/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                                <h3 className={`text-white text-lg leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-bold ${fonts.header}`}>{item.name}</h3>
                                                {item.titles && item.titles[0] && <p className={`text-ck3-goldLight text-xs italic drop-shadow-md mb-1 ${fonts.accent}`}>{item.titles[0]}</p>}
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
                                        </Tilt>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </div>

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
                                    {/* Identity */}
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs uppercase font-bold text-stone-500 mb-1">Nickname</label>
                                                <input
                                                    className="w-full bg-stone-800 border border-stone-700 rounded p-3 text-stone-100 outline-none focus:border-ck3-gold placeholder:text-stone-600"
                                                    placeholder="Name"
                                                    value={formData.name}
                                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs uppercase font-bold text-stone-500 mb-1">Birth Name</label>
                                                <input
                                                    className="w-full bg-stone-800 border border-stone-700 rounded p-3 text-stone-100 outline-none focus:border-ck3-gold placeholder:text-stone-600"
                                                    placeholder="Original / Birth Name"
                                                    value={formData.birthName || ''}
                                                    onChange={e => setFormData({ ...formData, birthName: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        {/* Titles Input */}
                                        <div>
                                            <label className="block text-xs uppercase font-bold text-stone-500 mb-2">Titles</label>
                                            <div className="flex flex-wrap gap-2 mb-2 p-2 bg-black/20 rounded border border-stone-700 min-h-[42px]">
                                                {formData.titles?.map((title, idx) => (
                                                    <span key={idx} className="bg-ck3-gold/20 text-ck3-goldLight border border-ck3-gold/30 px-2 py-1 rounded-md text-xs flex items-center gap-1 group">
                                                        {title}
                                                        <button onClick={() => removeTitle(title)} className="text-ck3-gold hover:text-white">
                                                            <X size={12} />
                                                        </button>
                                                    </span>
                                                ))}
                                                <input
                                                    className="flex-1 bg-transparent border-none text-sm text-stone-200 outline-none min-w-[120px] placeholder:text-stone-600"
                                                    placeholder="Add title (e.g. 'King of France') & press Enter..."
                                                    value={titleInput}
                                                    onChange={e => setTitleInput(e.target.value)}
                                                    onKeyDown={e => e.key === 'Enter' && handleAddTitle()}
                                                />
                                            </div>
                                        </div>

                                        {/* Dynasty & House */}
                                        {/* Dynasty & House */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs uppercase font-bold text-stone-500 mb-1">Dynasty</label>
                                                <input
                                                    className="w-full bg-stone-800 border border-stone-700 rounded p-3 text-stone-100 outline-none focus:border-ck3-gold placeholder:text-stone-600 text-sm"
                                                    placeholder="Dynasty Name"
                                                    value={formData.dynastyName || ''}
                                                    onChange={e => setFormData({ ...formData, dynastyName: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs uppercase font-bold text-stone-500 mb-1">House</label>
                                                <input
                                                    className="w-full bg-stone-800 border border-stone-700 rounded p-3 text-stone-100 outline-none focus:border-ck3-gold placeholder:text-stone-600 text-sm"
                                                    placeholder="House Name"
                                                    value={formData.houseName || ''}
                                                    onChange={e => setFormData({ ...formData, houseName: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        {/* Dynasty Motto */}
                                        <div>
                                            <label className="block text-xs uppercase font-bold text-stone-500 mb-1">Motto</label>
                                            <input
                                                className="w-full bg-stone-800 border border-stone-700 rounded p-3 text-stone-100 outline-none focus:border-ck3-gold placeholder:text-stone-600 text-sm"
                                                placeholder="Dynasty Motto (e.g., 'Iron and Blood')"
                                                value={formData.dynastyMotto || ''}
                                                onChange={e => setFormData({ ...formData, dynastyMotto: e.target.value })}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs uppercase font-bold text-stone-500 mb-1">Culture</label>
                                                <input
                                                    className="w-full bg-stone-800 border border-stone-700 rounded p-3 text-stone-100 outline-none focus:border-ck3-gold placeholder:text-stone-600 text-sm"
                                                    placeholder="Culture"
                                                    value={formData.culture}
                                                    onChange={e => setFormData({ ...formData, culture: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs uppercase font-bold text-stone-500 mb-1">Religion</label>
                                                <input
                                                    className="w-full bg-stone-800 border border-stone-700 rounded p-3 text-stone-100 outline-none focus:border-ck3-gold placeholder:text-stone-600 text-sm"
                                                    placeholder="Religion"
                                                    value={formData.religion}
                                                    onChange={e => setFormData({ ...formData, religion: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Dates */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs uppercase font-bold text-stone-500 mb-1">Nativity (Birth Date)</label>
                                            <input
                                                className="w-full bg-stone-800 border border-stone-700 rounded p-3 text-stone-100 outline-none focus:border-ck3-gold placeholder:text-stone-600 text-sm"
                                                placeholder="e.g. 845 AD"
                                                value={formData.dateBirth || ''}
                                                onChange={e => setFormData({ ...formData, dateBirth: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs uppercase font-bold text-stone-500 mb-1">Ascension (Start Date)</label>
                                            <input
                                                className="w-full bg-stone-800 border border-stone-700 rounded p-3 text-stone-100 outline-none focus:border-ck3-gold placeholder:text-stone-600 text-sm"
                                                placeholder="e.g. 867 AD"
                                                value={formData.dateStart || ''}
                                                onChange={e => setFormData({ ...formData, dateStart: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    {/* Levels */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs uppercase font-bold text-stone-500 mb-1">Level of Fame</label>
                                            <select
                                                className="w-full bg-stone-800 border border-stone-700 rounded p-3 text-stone-100 outline-none focus:border-ck3-gold text-sm"
                                                value={formData.prestigeLevel || '0'}
                                                onChange={e => setFormData({ ...formData, prestigeLevel: e.target.value })}
                                            >
                                                {PRESTIGE_LEVELS.map((label, idx) => (
                                                    <option key={idx} value={idx}>{label} ({idx})</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs uppercase font-bold text-stone-500 mb-1">Level of Devotion</label>
                                            <select
                                                className="w-full bg-stone-800 border border-stone-700 rounded p-3 text-stone-100 outline-none focus:border-ck3-gold text-sm"
                                                value={formData.pietyLevel || '0'}
                                                onChange={e => setFormData({ ...formData, pietyLevel: e.target.value })}
                                            >
                                                {PIETY_LEVELS.map((label, idx) => (
                                                    <option key={idx} value={idx}>{label} ({idx})</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Collection Selector */}
                                    <div>
                                        <label className="block text-xs uppercase font-bold text-stone-500 mb-2">Collection</label>
                                        <select
                                            className="w-full bg-stone-800 border border-stone-700 rounded p-3 text-stone-100 outline-none focus:border-ck3-gold text-sm"
                                            value={formData.collection || 'Unsorted'}
                                            onChange={e => {
                                                if (e.target.value === '__new__') {
                                                    openCreateCollectionModal();
                                                } else {
                                                    setFormData({ ...formData, collection: e.target.value });
                                                }
                                            }}
                                        >
                                            <option value="Unsorted">Unsorted</option>
                                            {customCollections.map(c => <option key={c} value={c}>{c}</option>)}
                                            <option value="__new__" className="font-bold text-ck3-gold">+ New Collection...</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Tags / Traits Input */}
                                <div>
                                    <label className="block text-xs uppercase font-bold text-stone-500 mb-2">Tags / Traits</label>
                                    <div className="flex flex-wrap gap-2 mb-2 p-2 bg-black/20 rounded border border-stone-700 min-h-[42px]">
                                        {formData.tags?.map((tag, idx) => (
                                            <span key={idx} className="bg-stone-700 text-stone-200 px-2 py-1 rounded-md text-xs flex items-center gap-1 group">
                                                {tag}
                                                <button onClick={() => removeTag(tag)} className="text-stone-400 hover:text-white group-hover:text-red-400">
                                                    <X size={12} />
                                                </button>
                                            </span>
                                        ))}
                                        <div className="flex-1 relative min-w-[120px]">
                                            <input
                                                className="w-full bg-transparent border-none text-sm text-stone-200 outline-none placeholder:text-stone-600"
                                                placeholder="Type tag & press Enter..."
                                                value={tagInput}
                                                onChange={e => setTagInput(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && handleAddTag()}
                                            />
                                            {/* Suggestions Dropdown */}
                                            {tagSuggestions.length > 0 && (
                                                <div className="absolute top-full left-0 w-full mt-1 bg-stone-800 border border-stone-600 rounded shadow-xl z-50">
                                                    {tagSuggestions.map(s => (
                                                        <div
                                                            key={s}
                                                            className="px-3 py-1.5 hover:bg-stone-700 cursor-pointer text-xs text-stone-300 border-b border-stone-700 last:border-0"
                                                            onClick={() => { setTagInput(s); handleAddTag(); }}
                                                        >
                                                            {s}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* DNA */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs uppercase font-bold text-stone-500 mb-2">Ruler Designer DNA</label>
                                        <textarea
                                            className="w-full h-24 bg-black/30 border border-stone-700 rounded p-3 text-xs font-mono text-stone-400 outline-none focus:border-ck3-gold resize-none"
                                            value={formData.dna}
                                            onChange={e => setFormData({ ...formData, dna: e.target.value })}
                                            placeholder="ruler_designer_123={ ... }"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs uppercase font-bold text-stone-500 mb-2">Persistent DNA (Save File)</label>
                                        <textarea
                                            className="w-full h-24 bg-black/30 border border-stone-700 rounded p-3 text-xs font-mono text-stone-400 outline-none focus:border-ck3-gold resize-none"
                                            value={formData.persistentDna || ''}
                                            onChange={e => setFormData({ ...formData, persistentDna: e.target.value })}
                                            placeholder="Base64 encoded string..."
                                        />
                                    </div>
                                </div>

                                {/* Images (Import) */}
                                <div>
                                    <label className="block text-xs uppercase font-bold text-stone-500 mb-2">Gallery & Portraits</label>
                                    <div className="flex gap-2 mb-3">
                                        <input
                                            className="flex-1 bg-stone-800 border border-stone-700 rounded p-3 text-stone-100 outline-none focus:border-ck3-gold placeholder:text-stone-600 text-sm"
                                            placeholder="Paste Image URL..."
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    const url = e.currentTarget.value;
                                                    if (url) {
                                                        setFormData(prev => ({ ...prev, images: [...(prev.images || []), url] }));
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
                                                        onClick={(e) => { e.preventDefault(); removeFormImage(idx); }}
                                                        className="absolute top-1 right-1 bg-red-900/80 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                                    >
                                                        &times;
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setActiveImgIdx(idx);
                                                            setIsFullViewOpen(true);
                                                        }}
                                                        className="absolute bottom-1 right-1 bg-black/60 hover:bg-ck3-gold hover:text-black text-white p-1.5 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                                        title="Zoom"
                                                    >
                                                        <Maximize2 size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Bio Sections */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs uppercase font-bold text-stone-500 mb-2">The Saga (Biography)</label>
                                        <textarea
                                            className="w-full h-32 bg-stone-800 border border-stone-700 rounded p-3 text-sm text-stone-200 outline-none focus:border-ck3-gold resize-none"
                                            value={formData.bio}
                                            onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                            placeholder="Character history..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs uppercase font-bold text-stone-500 mb-2">The Annals (Major Life Events)</label>
                                        <textarea
                                            className="w-full h-24 bg-stone-800 border border-stone-700 rounded p-3 text-sm text-stone-200 outline-none focus:border-ck3-gold resize-none"
                                            value={formData.events || ''}
                                            onChange={e => setFormData({ ...formData, events: e.target.value })}
                                            placeholder="Notable turning points..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs uppercase font-bold text-stone-500 mb-2">Triumphs & Legacies (Achievements)</label>
                                        <textarea
                                            className="w-full h-24 bg-stone-800 border border-stone-700 rounded p-3 text-sm text-stone-200 outline-none focus:border-ck3-gold resize-none"
                                            value={formData.achievements || ''}
                                            onChange={e => setFormData({ ...formData, achievements: e.target.value })}
                                            placeholder="Feats of arms and dynastic glories..."
                                        />
                                    </div>
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
                )
                }

                {/* DETAILS OVERLAY */}
                <AnimatePresence>
                    {view === 'details' && selectedItem && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={`fixed z-50 bg-stone-900 border border-ck3-gold rounded-lg shadow-2xl overflow-hidden flex flex-col ${isMaximized ? 'inset-0 rounded-none' : 'inset-0 md:inset-10 lg:inset-20 top-10 bottom-10 m-auto max-w-6xl max-h-[90vh]'}`}
                        >
                            {/* Header Bar */}
                            <div
                                className="h-10 bg-stone-950 border-b border-stone-800 flex justify-between items-center px-4 select-none shrink-0"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="font-serif text-ck3-gold font-bold text-sm">{selectedItem.name}</span>
                                    <span className="text-xs text-stone-600 bg-stone-800 px-1.5 rounded">{selectedItem.collection}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setIsMaximized(!isMaximized)} className="text-stone-500 hover:text-white p-1" title={isMaximized ? "Exit Fullscreen" : "Fullscreen"}>
                                        {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                                    </button>
                                    <button onClick={() => setView('grid')} className="text-stone-500 hover:text-white p-1" title="Close">
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>


                            {/* Main Content */}
                            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">

                                {/* Left Column: Images */}
                                <div className="w-full md:w-1/3 bg-black/40 border-r border-stone-800 flex flex-col p-4 gap-4 overflow-y-auto">

                                    {/* Main Image Display */}
                                    <div
                                        className="aspect-[3/4] bg-stone-950 rounded border border-stone-700 relative group overflow-hidden shadow-lg"
                                    >
                                        {selectedItem.images[activeImgIdx] ? (
                                            <>
                                                <img
                                                    src={selectedItem.images[activeImgIdx]}
                                                    className={`w-full h-full object-cover transition-transform duration-300 origin-top ${isZoomed ? 'scale-[2.0] cursor-zoom-out' : 'cursor-zoom-in'}`}
                                                    onClick={() => setIsZoomed(!isZoomed)}
                                                />

                                                {/* Navigation Arrows */}
                                                {selectedItem.images.length > 1 && (
                                                    <>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setActiveImgIdx((prev) => (prev - 1 + selectedItem.images.length) % selectedItem.images.length);
                                                            }}
                                                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-ck3-gold hover:text-black text-white p-2 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 z-20"
                                                        >
                                                            <ChevronLeft size={20} />
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setActiveImgIdx((prev) => (prev + 1) % selectedItem.images.length);
                                                            }}
                                                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-ck3-gold hover:text-black text-white p-2 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 z-20"
                                                        >
                                                            <ChevronRight size={20} />
                                                        </button>
                                                    </>
                                                )}

                                                {/* Zoom Controls */}
                                                <div className="absolute top-2 left-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setIsZoomed(!isZoomed);
                                                        }}
                                                        className={`p-2 rounded-full transition-all shadow-lg ${isZoomed ? 'bg-ck3-gold text-stone-900 border-white' : 'bg-black/50 text-white hover:bg-ck3-gold hover:text-black'}`}
                                                        title={isZoomed ? "Reset Zoom" : "Quick Zoom"}
                                                    >
                                                        <ZoomIn size={16} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (selectedItem.images[activeImgIdx]) setIsFullViewOpen(true);
                                                        }}
                                                        className="p-2 bg-black/50 rounded-full hover:bg-ck3-gold hover:text-black text-white transition-all shadow-lg"
                                                        title="Full Screen View"
                                                    >
                                                        <Maximize2 size={16} />
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-stone-700">
                                                <ImageIcon size={48} />
                                                <span className="text-xs mt-2 uppercase font-bold">No Image</span>
                                            </div>
                                        )}

                                        {/* Controls Overlay (Top Right) */}
                                        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10" onClick={(e) => e.stopPropagation()}>
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
                                            <div className="absolute bottom-4 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10" onClick={(e) => e.stopPropagation()}>
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
                                                <ImagePlus size={12} /> Add
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
                                                    <Upload size={12} />
                                                </button>
                                                <button onClick={handleAddImageToCharacter} className="bg-stone-700 hover:bg-stone-600 text-white px-2 py-1 rounded text-xs">OK</button>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-4 gap-2">
                                            {selectedItem.images.map((img, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`relative aspect-square rounded overflow-hidden cursor-pointer border-2 transition-all group ${idx === activeImgIdx ? 'border-ck3-gold opacity-100 scale-105' : 'border-transparent opacity-50 hover:opacity-80'}`}
                                                    onClick={() => setActiveImgIdx(idx)}
                                                >
                                                    <img src={img} className="w-full h-full object-cover" />
                                                    {/* Quick Zoom Overlay */}
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setActiveImgIdx(idx);
                                                                setIsFullViewOpen(true);
                                                            }}
                                                            className="bg-black/60 hover:bg-ck3-gold hover:text-black text-white p-2 rounded-full pointer-events-auto transform hover:scale-110 transition-all shadow-lg"
                                                            title="Quick Zoom"
                                                        >
                                                            <Eye size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Info */}
                                <div className="w-full md:w-2/3 p-6 overflow-y-auto bg-stone-900">
                                    <h1 className={`text-4xl md:text-5xl text-ck3-gold mb-2 drop-shadow-md font-bold ${fonts.header}`}>{selectedItem.name}</h1>

                                    {selectedItem.birthName && (
                                        <p className="text-stone-500 text-sm mb-4 italic ml-1">Born as: <span className="text-stone-300">{selectedItem.birthName}</span></p>
                                    )}

                                    {selectedItem.titles && selectedItem.titles.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {selectedItem.titles.map((title, idx) => (
                                                <span key={idx} className={`bg-ck3-gold/10 text-ck3-goldLight border border-ck3-gold/20 px-3 py-1 rounded text-sm italic ${fonts.accent}`}>{title}</span>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex flex-wrap items-center gap-4 mb-6">
                                        {selectedItem.dynastyMotto && <p className={`text-lg text-stone-400 italic border-l-2 border-ck3-gold/50 pl-4 mr-4 ${fonts.subHeader}`}>"{selectedItem.dynastyMotto}"</p>}

                                        {/* Dates Display */}
                                        {(selectedItem.dateBirth || selectedItem.dateStart) && (
                                            <div className="flex gap-3 text-xs text-stone-500 font-bold uppercase tracking-widest border-l-2 border-stone-700 pl-4">
                                                {selectedItem.dateBirth && (
                                                    <div>
                                                        <span className="block text-[9px] text-stone-600">Nativity</span>
                                                        <span className="text-stone-300">{selectedItem.dateBirth}</span>
                                                    </div>
                                                )}
                                                {selectedItem.dateStart && (
                                                    <div>
                                                        <span className="block text-[9px] text-stone-600">Ascension</span>
                                                        <span className="text-stone-300">{selectedItem.dateStart}</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Dynasty & House Info */}
                                    {(selectedItem.dynastyName || selectedItem.houseName) && (
                                        <div className="flex flex-wrap gap-4 mb-8">
                                            {selectedItem.dynastyName && (
                                                <div className="bg-stone-900/50 px-4 py-2 rounded border border-ck3-gold/30 flex items-center gap-2 shadow-sm">
                                                    <span className="text-stone-500 uppercase font-bold text-xs tracking-wider">Dynasty</span>
                                                    <span className={`text-ck3-gold text-lg ${fonts.header}`}>{selectedItem.dynastyName}</span>
                                                </div>
                                            )}
                                            {selectedItem.houseName && (
                                                <div className="bg-stone-900/50 px-4 py-2 rounded border border-stone-600 flex items-center gap-2 shadow-sm">
                                                    <span className="text-stone-500 uppercase font-bold text-xs tracking-wider">House</span>
                                                    <span className="text-stone-200 font-serif text-lg">{selectedItem.houseName}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-6 mb-8 bg-stone-800/80 p-6 rounded-lg border border-stone-600 shadow-inner">
                                        <div>
                                            <label className="block text-stone-400 uppercase text-[10px] font-bold mb-1 tracking-widest">Culture</label>
                                            <span className="text-stone-100 text-lg font-serif">{selectedItem.culture || 'Unknown'}</span>
                                        </div>
                                        <div>
                                            <label className="block text-stone-400 uppercase text-[10px] font-bold mb-1 tracking-widest">Religion</label>
                                            <span className="text-stone-100 text-lg font-serif">{selectedItem.religion || 'Unknown'}</span>
                                        </div>

                                        {/* Prestige & Piety */}
                                        {(selectedItem.prestigeLevel || selectedItem.pietyLevel) && (
                                            <>
                                                <div>
                                                    <label className="block text-ck3-gold uppercase text-[10px] font-bold mb-1 tracking-widest">Fame</label>
                                                    <motion.span
                                                        animate={parseInt(selectedItem.prestigeLevel || '0') >= 4 ? {
                                                            textShadow: ["0 0 5px rgba(217, 119, 6, 0.4)", "0 0 15px rgba(217, 119, 6, 0.8)", "0 0 5px rgba(217, 119, 6, 0.4)"],
                                                            scale: [1, 1.02, 1]
                                                        } : {}}
                                                        transition={{ repeat: Infinity, duration: 3 }}
                                                        className={`block transition-all duration-300 ${parseInt(selectedItem.prestigeLevel || '0') >= 4 ? `text-ck3-goldLight text-xl drop-shadow-[0_0_8px_rgba(217,119,6,0.6)] ${fonts.header}` :
                                                            parseInt(selectedItem.prestigeLevel || '0') === 3 ? 'text-amber-200 text-lg font-serif font-bold drop-shadow-sm' :
                                                                'text-stone-300 font-serif'
                                                            }`}>
                                                        {PRESTIGE_LEVELS[parseInt(selectedItem.prestigeLevel || '0')] || 'Unknown'}
                                                    </motion.span>
                                                </div>
                                                <div>
                                                    <label className="block text-stone-400 uppercase text-[10px] font-bold mb-1 tracking-widest">Devotion</label>
                                                    <motion.span
                                                        animate={parseInt(selectedItem.pietyLevel || '0') >= 4 ? {
                                                            textShadow: ["0 0 5px rgba(168, 85, 247, 0.4)", "0 0 15px rgba(168, 85, 247, 0.8)", "0 0 5px rgba(168, 85, 247, 0.4)"],
                                                            scale: [1, 1.02, 1]
                                                        } : {}}
                                                        transition={{ repeat: Infinity, duration: 3.5 }}
                                                        className={`block transition-all duration-300 ${parseInt(selectedItem.pietyLevel || '0') >= 4 ? `text-purple-300 text-xl drop-shadow-[0_0_8px_rgba(168,85,247,0.6)] ${fonts.header}` :
                                                            parseInt(selectedItem.pietyLevel || '0') === 3 ? 'text-purple-200 text-lg font-serif font-bold drop-shadow-sm' :
                                                                'text-stone-300 font-serif'
                                                            }`}>
                                                        {PIETY_LEVELS[parseInt(selectedItem.pietyLevel || '0')] || 'Unknown'}
                                                    </motion.span>
                                                </div>
                                            </>
                                        )}

                                        <div className="col-span-2 pt-4 border-t border-stone-700/50 mt-2">
                                            <label className="block text-stone-500 uppercase text-[10px] font-bold mb-1 tracking-widest">Ambition</label>
                                            <span className="text-stone-300 italic">{selectedItem.goal || 'None'}</span>
                                        </div>
                                    </div>

                                    {/* Tags Display */}
                                    {selectedItem.tags && selectedItem.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-6">
                                            {selectedItem.tags.map((tag, idx) => (
                                                <span key={idx} className="bg-stone-800 text-stone-400 px-3 py-1 rounded-full text-xs border border-stone-700 flex items-center gap-1 font-medium">
                                                    <Tag size={10} /> {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Expanded Biography Sections */}
                                    <div className="space-y-6 mb-8">
                                        {selectedItem.bio && (
                                            <div>
                                                <h4 className="text-ck3-gold font-serif text-lg border-b border-stone-700 pb-1 mb-2">The Saga</h4>
                                                <div className="prose prose-invert prose-stone max-w-none">
                                                    <p className="whitespace-pre-wrap leading-relaxed text-stone-300">{selectedItem.bio}</p>
                                                </div>
                                            </div>
                                        )}

                                        {selectedItem.events && (
                                            <div>
                                                <h4 className="text-ck3-gold font-serif text-lg border-b border-stone-700 pb-1 mb-2">The Annals</h4>
                                                <div className="prose prose-invert prose-stone max-w-none">
                                                    <p className="whitespace-pre-wrap leading-relaxed text-stone-300">{selectedItem.events}</p>
                                                </div>
                                            </div>
                                        )}

                                        {selectedItem.achievements && (
                                            <div>
                                                <h4 className="text-ck3-gold font-serif text-lg border-b border-stone-700 pb-1 mb-2">Deeds & Conquests</h4>
                                                <div className="prose prose-invert prose-stone max-w-none">
                                                    <p className="whitespace-pre-wrap leading-relaxed text-stone-300">{selectedItem.achievements}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap gap-2 mb-8">
                                        {selectedItem.traits.map(tid => {
                                            const t = TRAITS.find(tr => tr.id === tid);
                                            return <span key={tid} className="bg-stone-800 px-3 py-1.5 rounded text-sm text-stone-300 border border-stone-600 shadow-sm">{t?.name || tid}</span>;
                                        })}
                                    </div>

                                    <div className="flex gap-4 pt-6 border-t border-stone-800 mt-auto">
                                        <button onClick={() => handleEdit(selectedItem)} className="px-6 py-2 bg-stone-800 hover:bg-stone-700 text-white rounded text-sm font-bold uppercase transition-colors border border-stone-600 shadow-md">
                                            Edit Details
                                        </button>
                                        <button onClick={(e) => handleDelete(selectedItem.id, e)} className="px-6 py-2 bg-red-900/20 hover:bg-red-900/40 text-red-400 rounded text-sm font-bold uppercase transition-colors border border-red-900/30">
                                            {HISTORICAL_CHARACTERS.some(h => h.id === selectedItem.id) ? "Revert / Delete" : "Delete Record"}
                                        </button>
                                    </div>
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
                        </motion.div>
                    )}
                </AnimatePresence>



                {/* FULL IMAGE VIEW MODAL */}
                {
                    isFullViewOpen && (
                        (() => {
                            const activeItem = view === 'form' ? (formData as StoredCharacter) : selectedItem;
                            const images = activeItem?.images || [];
                            const currentImg = images[activeImgIdx];

                            if (!currentImg) return null;

                            return (
                                <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 animate-fade-in" onClick={() => setIsFullViewOpen(false)}>
                                    <button
                                        onClick={() => setIsFullViewOpen(false)}
                                        className="absolute top-4 right-4 text-white/50 hover:text-white p-2 transition-colors z-10"
                                    >
                                        <X size={32} />
                                    </button>

                                    {/* Navigation Arrows */}
                                    {images.length > 1 && (
                                        <>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); navigateImage(-1); }}
                                                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white p-4 transition-colors z-10"
                                            >
                                                <ChevronLeft size={48} />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); navigateImage(1); }}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white p-4 transition-colors z-10"
                                            >
                                                <ChevronRight size={48} />
                                            </button>
                                        </>
                                    )}

                                    <img
                                        src={currentImg}
                                        className="max-w-full max-h-full object-contain shadow-2xl rounded-sm select-none"
                                        onClick={(e) => e.stopPropagation()}
                                    />

                                    <div className="absolute bottom-4 left-0 right-0 text-center text-white/50 text-sm pointer-events-none">
                                        Image {activeImgIdx + 1} of {images.length}
                                    </div>
                                </div>
                            );
                        })()
                    )
                }

                {/* STEAM MODAL */}
                {
                    isSteamModalOpen && (
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
                    )
                }

                {/* MOVE TO MODAL */}
                {
                    isMoveModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
                            <div className="bg-stone-900 border border-stone-700 rounded-lg p-6 w-full max-w-sm shadow-2xl">
                                <h3 className="font-serif text-lg text-white mb-4">Move {selectedIds.size} Items To...</h3>
                                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                                    <button onClick={() => handleBulkMove('Unsorted')} className="w-full text-left p-3 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 text-sm flex items-center gap-2 transition-colors">
                                        <Layers size={14} /> Unsorted
                                    </button>
                                    {customCollections.map(c => (
                                        <button key={c} onClick={() => handleBulkMove(c)} className="w-full text-left p-3 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 text-sm flex items-center gap-2 transition-colors">
                                            <Folder size={14} className="text-ck3-gold" /> {c}
                                        </button>
                                    ))}
                                </div>
                                <button onClick={() => setIsMoveModalOpen(false)} className="mt-4 w-full py-2 border border-stone-700 rounded text-xs text-stone-500 hover:text-white transition-colors uppercase font-bold">Cancel</button>
                            </div>
                        </div>
                    )
                }

                {/* CREATE COLLECTION MODAL */}
                {
                    isCreateModalOpen && (
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
                    )
                }

            </main>
        </div >
    );
};

export default Gallery;
