
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { WikiPage } from '../types';

const STORAGE_KEYS = {
  LOG: 'ck3_utility_dev_log_entries',
  WIKI: 'ck3_utility_wiki_pages',
  PRD: 'ck3_utility_prd_doc'
};

const DEFAULT_WIKI: WikiPage[] = [
  { 
    id: '00_welcome', 
    title: '00. Welcome', 
    content: `# CK3 Royal Utility Suite

Welcome to the ultimate companion tool for Crusader Kings III players and modders. This suite combines character planning, DNA manipulation, and roleplay generation into one interface.

## Quick Start
1. **Trait Planner**: Design your ruler's personality and stats.
2. **Character Sheet**: Generate a backstory and portrait for your build.
3. **DNA Converter**: Convert between save-game DNA strings and console commands.
4. **Morph Lab**: For modders - analyze and mix DNA files.

Use the sidebar to navigate between these tools.
` 
  },
  { 
    id: '01_comparator', 
    title: '01. Morph Lab Guide', 
    content: `# DNA Morph Comparator

A powerful tool for analyzing and creating genetic variations.

## Key Features
1. **Visual Comparison**: Load multiple files to see gene values side-by-side. Differences vs the Reference column are highlighted in Green (Higher) or Red (Lower).
2. **Mod File Support**: Supports reading raw CK3 script files containing \`morph = { ... }\` blocks.
3. **Sweet Spot Mixing**:
   - Allows blending two DNA columns to create a natural "child" or variation.
   - **Math**: Calculates the average (E) and difference (D) between two values.
   - **Range**: [E - D/4, E + D/4].
   - **Result**: A random integer within that range.
   - This prevents extremes and creates organic variations.

## Workflow
1. Paste a base DNA string into the "Workbench" or load a file.
2. Load a second file (e.g., a "Patch" or another DNA).
3. Use the "Mix Columns" panel to blend them.
4. Export the result as a new game-ready text file.
` 
  },
  { 
    id: '02_advisor', 
    title: '02. Character Sheet', 
    content: `# Character Sheet

This component serves as your dedicated space to finalize your character's biography and appearance.

## Features
- **Lore Storage**: Write your own biography, strategy guide, and dynasty motto.
- **Portrait Visualization**: Input an image URL to associate a visual portrait with your build.
- **Gallery Integration**: Save your finalized character to the local or server archives.
` 
  }
];

interface LogEntry {
  id: string;
  title: string;
  date: string;
  content: string;
}

const INITIAL_LOG_ENTRIES: LogEntry[] = [
    {
        id: 'morph_lab_update_01',
        title: 'Morph Lab Updates',
        date: new Date().toISOString().split('T')[0],
        content: `# Morph Lab

### Updated Slider Range
Changed the **Smart Cell Editor** slider range to **0.0-1.0** to better reflect how values are handled in modding files, while still supporting DNA byte value conversion internally.

### Remove Morph Template
Added the ability to select **"No Template"** (or remove an existing template assignment) directly from the Smart Cell Editor dropdown. This is crucial for advanced modding scenarios where a specific template override is not desired.

### Smart Cell Editor Positioning
Fixed an issue where the cell editor popup would overflow off the screen if the column was near the right edge or bottom. The editor now intelligently calculates available space and flips/shifts its position to remain visible.`
    },
    {
        id: 'init',
        title: 'Project Inception',
        date: '2023-10-27',
        content: `# Developer Log

## Initial Setup

### Core Infrastructure
- Initialized React/Vite project structure.
- Integrated Tailwind CSS for styling.
- Established basic routing and layout components.`
    }
];

const INITIAL_PRD = `# CK3 Royal Utility Suite - Product Requirements Document (PRD)

## 1. Executive Summary
The **CK3 Royal Utility Suite** is a comprehensive companion application designed for players and modders of *Crusader Kings III*. It bridges the gap between technical game data (DNA strings, scripts) and immersive roleplay, providing tools to visualize, manipulate, and generate character data.

## 2. User Personas
*   **The Roleplayer**: Wants to create a deep backstory and visual identity for their starting ruler without writing fiction from scratch.
*   **The Min-Maxer**: Needs to calculate trait costs efficiently to build the perfect 400-point Ironman character.
*   **The Modder**: Needs to debug facial variations, merge DNA presets, and convert between different game data formats.

## 3. Core Features & Requirements

### 3.1 Trait Planner
*   **Goal**: Calculate character customization points.
*   **Requirements**:
    *   List all game traits categorized (Education, Personality, Congenital, etc.).
    *   Show point costs and effects.
    *   Handle trait conflicts (e.g., cannot be both *Humble* and *Arrogant*).
    *   Real-time point total calculation.

### 3.2 Character Sheet
*   **Goal**: Enhance roleplay.
*   **Requirements**:
    *   **Lore**: Write biography, strategy guide, and dynasty motto.
    *   **Portrait**: Store DNA strings and image URLs.

### 3.3 DNA Forge & Converter
*   **Goal**: Manipulate genetic strings.
*   **Requirements**:
    *   Convert between **Persistent DNA** (Save File/Ruler Designer) and **Console Commands**.
    *   **Granular Editor**: Edit individual gene bytes (0-255).
    *   **Visual Forge**: Slider-based interface for modifying genes (Chin, Eyes, Nose, etc.) with visual feedback on ranges (Male/Female/Boy/Girl).

### 3.4 Morph Lab (Comparator)
*   **Goal**: Advanced analysis for modders.
*   **Requirements**:
    *   **File Parsing**: Read \`.txt\` mod files containing \`morph = { ... }\` blocks.
    *   **Comparison**: Side-by-side view of multiple files/DNA strings.
    *   **Diffing**: Highlight value differences (Green = Higher, Red = Lower).
    *   **Sweet Spot Mixing**: Algorithm to blend two DNA sources to create a "child" or variation.
    *   **Export**: Generate valid \`.txt\` code blocks for mod usage.

### 3.5 Gallery (Archives)
*   **Goal**: Persistence.
*   **Requirements**:
    *   Save created characters locally (localStorage).
    *   Export/Import gallery as JSON for backup.
    *   Steam Workshop import (via URL scraping).

## 4. Technical Architecture
*   **Frontend**: React 19, TypeScript, Vite.
*   **Styling**: Tailwind CSS (Custom "CK3 Glass" theme).
*   **Deployment**: Static-friendly.

## 5. Roadmap
*   **Phase 1 (Complete)**: Core tools, UI framework.
*   **Phase 2 (Current)**: Advanced Morph Lab, "Sweet Spot" math, UI polish.
*   **Phase 3 (Planned)**: 
    *   3D WebGL Face Preview (High complexity).
    *   Direct Save File Parsing (.ck3 parsing).
`;

const DevLog: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'log' | 'wiki' | 'experiments' | 'prd'>('log');
  
  // --- LOG STATE ---
  const [logEntries, setLogEntries] = useState<LogEntry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LOG);
    return saved ? JSON.parse(saved) : INITIAL_LOG_ENTRIES;
  });
  const [currentLogId, setCurrentLogId] = useState(logEntries[0]?.id || 'init');
  
  // Log Editor State
  const [isLogEditing, setIsLogEditing] = useState(false);
  const [editLogTitle, setEditLogTitle] = useState('');
  const [editLogDate, setEditLogDate] = useState('');
  const [editLogContent, setEditLogContent] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOG, JSON.stringify(logEntries));
  }, [logEntries]);

  useEffect(() => {
      const entry = logEntries.find(e => e.id === currentLogId) || logEntries[0];
      if (entry) {
          setEditLogTitle(entry.title);
          setEditLogDate(entry.date);
          setEditLogContent(entry.content);
      }
  }, [currentLogId, logEntries]);

  const saveLogEntry = () => {
      setLogEntries(prev => prev.map(e => e.id === currentLogId ? { ...e, title: editLogTitle, date: editLogDate, content: editLogContent } : e));
      setIsLogEditing(false);
  };

  const addLogEntry = () => {
      const id = 'log-' + Date.now();
      const newEntry: LogEntry = {
          id,
          title: 'New Session Log',
          date: new Date().toISOString().split('T')[0],
          content: '# New Entry\n\n- '
      };
      setLogEntries([newEntry, ...logEntries]);
      setCurrentLogId(id);
      setIsLogEditing(true);
  };

  const deleteLogEntry = () => {
      if (logEntries.length <= 1) return alert("Cannot delete the last log entry.");
      if (confirm("Delete this log entry?")) {
          const newEntries = logEntries.filter(e => e.id !== currentLogId);
          setLogEntries(newEntries);
          setCurrentLogId(newEntries[0].id);
      }
  };

  // --- PRD STATE ---
  const [prdContent, setPrdContent] = useState(() => {
      return localStorage.getItem(STORAGE_KEYS.PRD) || INITIAL_PRD;
  });
  const [isPrdEditing, setIsPrdEditing] = useState(false);

  useEffect(() => {
      localStorage.setItem(STORAGE_KEYS.PRD, prdContent);
  }, [prdContent]);

  // --- WIKI STATE ---
  const [wikiPages, setWikiPages] = useState<WikiPage[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.WIKI);
    return saved ? JSON.parse(saved) : DEFAULT_WIKI;
  });

  const [currentWikiId, setCurrentWikiId] = useState(wikiPages[0]?.id || '00_welcome');
  const [wikiEditTitle, setWikiEditTitle] = useState('');
  const [wikiEditContent, setWikiEditContent] = useState('');

  useEffect(() => {
      const page = wikiPages.find(p => p.id === currentWikiId);
      if(page) {
          setWikiEditTitle(page.title);
          setWikiEditContent(page.content);
      }
  }, [currentWikiId, wikiPages]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WIKI, JSON.stringify(wikiPages));
  }, [wikiPages]);

  const saveWikiPage = () => {
      setWikiPages(prev => prev.map(p => p.id === currentWikiId ? { ...p, title: wikiEditTitle, content: wikiEditContent } : p));
      alert("Page Saved.");
  };

  const deleteWikiPage = () => {
       if(wikiPages.length <= 1) return alert("Cannot delete last page.");
       if(confirm("Delete this page?")) {
           const newPages = wikiPages.filter(p => p.id !== currentWikiId);
           setWikiPages(newPages);
           setCurrentWikiId(newPages[0].id);
       }
  };

  const addWikiPage = () => {
      const id = 'page-' + Date.now();
      const newPage = { id, title: 'New Page', content: '' };
      setWikiPages([...wikiPages, newPage]);
      setCurrentWikiId(id);
  };

  // --- EXPERIMENTS STATE ---
  const [currentTheme, setCurrentTheme] = useState<'default' | 'light'>('default');
  
  useEffect(() => {
      // Clear all
      document.body.classList.remove('theme-light');
      
      if (currentTheme === 'light') {
          document.body.classList.add('theme-light');
      }
  }, [currentTheme]);

  // --- RENDERERS ---

  const renderLog = () => (
    <div className="flex h-full border border-stone-700 rounded-lg overflow-hidden bg-stone-900 shadow-xl">
        {/* Log Sidebar */}
        <div className="w-64 border-r border-stone-700 bg-stone-950 overflow-y-auto shrink-0">
            <div className="p-3 border-b border-stone-800 flex justify-between items-center bg-stone-900 sticky top-0">
                <h3 className="font-bold text-stone-400 text-xs uppercase tracking-wider">Entries</h3>
                <button 
                    onClick={addLogEntry}
                    className="text-ck3-gold hover:text-white font-bold text-lg leading-none px-2 py-0.5 rounded hover:bg-stone-800 transition-colors"
                    title="New Log Entry"
                >
                    +
                </button>
            </div>
            <div>
                {logEntries.map(entry => (
                    <div 
                    key={entry.id}
                    onClick={() => { setCurrentLogId(entry.id); setIsLogEditing(false); }}
                    className={`p-3 cursor-pointer text-xs border-b border-stone-800/50 transition-colors ${currentLogId === entry.id ? 'bg-ck3-gold/10 text-ck3-gold border-l-4 border-l-ck3-gold' : 'text-stone-400 hover:bg-stone-900'}`}
                    >
                        <div className="font-bold truncate">{entry.title || "Untitled"}</div>
                        <div className="text-[10px] opacity-60 mt-1">{entry.date}</div>
                    </div>
                ))}
            </div>
        </div>

        {/* Log Content */}
        <div className="flex-1 flex flex-col bg-stone-900/50 h-full overflow-hidden">
            {isLogEditing ? (
                 <div className="flex flex-col h-full">
                     <div className="p-4 border-b border-stone-800 flex gap-4 bg-stone-900">
                         <input 
                            type="text" 
                            value={editLogTitle}
                            onChange={(e) => setEditLogTitle(e.target.value)}
                            className="flex-1 bg-stone-800 border border-stone-600 rounded px-3 py-1.5 text-stone-200 outline-none focus:border-ck3-gold"
                            placeholder="Entry Title"
                         />
                         <input 
                            type="date" 
                            value={editLogDate}
                            onChange={(e) => setEditLogDate(e.target.value)}
                            className="bg-stone-800 border border-stone-600 rounded px-3 py-1.5 text-stone-200 outline-none focus:border-ck3-gold text-xs"
                         />
                         <button onClick={saveLogEntry} className="px-4 py-1.5 bg-ck3-gold hover:bg-ck3-goldLight text-white rounded text-xs font-bold transition-colors shadow-sm">Save</button>
                         <button onClick={() => setIsLogEditing(false)} className="px-3 py-1.5 bg-stone-800 text-stone-400 hover:text-white rounded text-xs transition-colors">Cancel</button>
                     </div>
                     <textarea 
                        value={editLogContent}
                        onChange={(e) => setEditLogContent(e.target.value)}
                        className="flex-1 w-full bg-[#111] p-6 text-stone-300 font-mono text-sm resize-none outline-none leading-relaxed"
                        placeholder="Write your log entry in Markdown..."
                        spellCheck={false}
                     />
                 </div>
            ) : (
                <div className="flex flex-col h-full">
                    <div className="p-4 border-b border-stone-800 bg-stone-900 flex justify-between items-start">
                        <div>
                            <h2 className="text-xl font-serif text-ck3-gold font-bold">{editLogTitle}</h2>
                            <span className="text-xs text-stone-500 font-mono">{editLogDate}</span>
                        </div>
                        <div className="flex gap-2">
                             <button 
                                onClick={() => setIsLogEditing(true)}
                                className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded text-xs font-bold transition-colors border border-stone-700"
                             >
                                Edit
                             </button>
                             <button 
                                onClick={deleteLogEntry}
                                className="px-3 py-1.5 bg-stone-900 hover:bg-red-900/30 text-stone-500 hover:text-red-400 rounded text-xs font-bold transition-colors border border-stone-800"
                             >
                                Delete
                             </button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-8 prose prose-invert prose-stone max-w-none">
                         <ReactMarkdown>{editLogContent}</ReactMarkdown>
                    </div>
                </div>
            )}
        </div>
    </div>
  );

  const renderPrd = () => (
      <div className="flex-1 bg-stone-900/80 border border-stone-700 rounded-lg p-1 shadow-inner flex flex-col relative group h-full overflow-hidden">
          <div className="flex justify-between items-center p-2 border-b border-stone-800 bg-stone-900">
              <span className="text-xs font-bold text-ck3-gold uppercase tracking-wider pl-2 flex items-center gap-2">
                  <span>📋</span> Product Requirements Document
              </span>
              <div className="flex gap-2">
                  <button 
                      onClick={() => setIsPrdEditing(!isPrdEditing)}
                      className={`px-3 py-1 text-xs font-bold rounded uppercase transition-colors ${isPrdEditing ? 'bg-ck3-gold text-white' : 'bg-stone-700 text-stone-300 hover:text-white'}`}
                  >
                      {isPrdEditing ? 'Preview' : 'Edit'}
                  </button>
              </div>
          </div>

          {isPrdEditing ? (
              <textarea 
                  className="flex-1 w-full bg-transparent border-none outline-none text-stone-300 font-mono text-sm resize-none p-4 leading-relaxed selection:bg-ck3-gold selection:text-white"
                  value={prdContent}
                  onChange={(e) => setPrdContent(e.target.value)}
                  placeholder="// Define PRD here..."
                  spellCheck={false}
              />
          ) : (
              <div className="flex-1 overflow-y-auto p-6 prose prose-invert prose-stone max-w-none">
                  <ReactMarkdown>{prdContent}</ReactMarkdown>
              </div>
          )}
      </div>
  );

  const renderWiki = () => (
      <div className="flex h-full border border-stone-700 rounded-lg overflow-hidden bg-stone-900 shadow-xl">
          <div className="w-64 border-r border-stone-700 bg-stone-950 overflow-y-auto shrink-0">
              <div className="p-3 border-b border-stone-800 flex justify-between items-center bg-stone-900 sticky top-0">
                  <h3 className="font-bold text-stone-400 text-xs uppercase tracking-wider">Knowledge Base</h3>
                  <button onClick={addWikiPage} className="text-ck3-gold hover:text-white font-bold text-xl leading-none px-2 py-1 rounded hover:bg-stone-800 transition-colors">+</button>
              </div>
              <div>
                  {wikiPages.map(page => (
                      <div 
                        key={page.id}
                        onClick={() => setCurrentWikiId(page.id)}
                        className={`p-3 cursor-pointer text-xs border-b border-stone-800 transition-colors ${currentWikiId === page.id ? 'bg-ck3-gold/10 text-ck3-gold border-l-4 border-l-ck3-gold' : 'text-stone-400 hover:bg-stone-900'}`}
                      >
                          {page.title || "Untitled Page"}
                      </div>
                  ))}
              </div>
          </div>
          <div className="flex-1 flex flex-col bg-stone-900 p-6 h-full overflow-hidden">
              <div className="mb-4 flex gap-4 border-b border-stone-800 pb-4 items-center shrink-0">
                  <input 
                    type="text" 
                    value={wikiEditTitle}
                    onChange={(e) => setWikiEditTitle(e.target.value)}
                    className="flex-1 bg-transparent text-2xl font-serif text-ck3-gold outline-none placeholder-stone-700"
                    placeholder="Page Title"
                  />
                  <div className="flex gap-2">
                       <button onClick={saveWikiPage} className="px-4 py-1.5 bg-stone-800 hover:bg-ck3-gold hover:text-white text-stone-400 rounded text-xs font-bold transition-colors border border-stone-700">Save Changes</button>
                       <button onClick={deleteWikiPage} className="px-4 py-1.5 bg-stone-950 hover:bg-red-900 text-stone-500 hover:text-red-200 rounded text-xs font-bold transition-colors border border-stone-800">Delete</button>
                  </div>
              </div>
              <textarea 
                  value={wikiEditContent}
                  onChange={(e) => setWikiEditContent(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-stone-300 text-sm leading-relaxed resize-none font-sans"
                  placeholder="Write documentation, guides, or formulas..."
                  spellCheck={false}
              />
          </div>
      </div>
  );

  const ThemeCard = ({ id, name, description, icon, colors }: {id: string, name: string, description: string, icon: string, colors: string[]}) => (
      <div 
        onClick={() => setCurrentTheme(id as any)}
        className={`bg-stone-800/50 border rounded-lg p-5 flex flex-col gap-3 relative overflow-hidden group cursor-pointer transition-all hover:-translate-y-1 ${currentTheme === id ? 'border-ck3-gold shadow-[0_0_15px_rgba(217,119,6,0.3)] bg-stone-800' : 'border-stone-600 hover:border-stone-500'}`}
      >
          <div className="absolute top-0 right-0 p-2 opacity-10 text-6xl group-hover:opacity-20 transition-opacity grayscale pointer-events-none">
              {icon}
          </div>
          <div className="flex items-center gap-2 mb-1">
             <div className={`w-3 h-3 rounded-full ${currentTheme === id ? 'bg-emerald-500 shadow-sm shadow-emerald-500' : 'bg-stone-600'}`}></div>
             <h4 className={`font-bold transition-colors ${currentTheme === id ? 'text-white' : 'text-stone-300 group-hover:text-white'}`}>{name}</h4>
          </div>
          <p className="text-xs text-stone-500 leading-relaxed min-h-[2.5em]">{description}</p>
          <div className="flex gap-1 mt-auto pt-3 border-t border-white/5">
             {colors.map(c => <div key={c} className="w-4 h-4 rounded-full" style={{backgroundColor: c}}></div>)}
          </div>
      </div>
  );

  const renderExperiments = () => (
      <div className="flex-1 bg-stone-900/80 border border-stone-700 rounded-lg p-6 shadow-inner overflow-y-auto h-full">
          <header className="mb-8 border-b border-stone-700 pb-4">
              <h3 className="text-2xl font-serif text-ck3-gold flex items-center gap-2">
                  <span className="text-3xl">🧪</span> Experimental Labs
              </h3>
              <p className="text-stone-500 mt-2 text-sm">
                  Test new visual styles and modular features. These settings are temporary and reset on refresh.
              </p>
          </header>

          <div className="space-y-8">
              <section>
                  <h4 className="text-stone-300 font-bold mb-4 uppercase text-xs tracking-widest border-l-2 border-stone-600 pl-3">UI Themes</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <ThemeCard 
                        id="default"
                        name="Dark Mode (Default)"
                        description="The classic immersive medieval interface. Dark leather, stone, and gold accents."
                        icon="🏰"
                        colors={['#1c1917', '#292524', '#b45309']}
                      />
                      <ThemeCard 
                        id="light"
                        name="Light Mode"
                        description="A clean light mode inspired by parchment and ink. High legibility with warm paper tones."
                        icon="✒️"
                        colors={['#f5f5f4', '#ffffff', '#d97706']}
                      />
                  </div>
              </section>
          </div>
      </div>
  );

  return (
    <div className="flex flex-col h-full animate-fade-in space-y-4">
      <header className="flex flex-col md:flex-row md:items-end justify-between border-b border-stone-700 pb-4 gap-4">
        <div>
           <h2 className="text-3xl font-serif text-ck3-gold mb-1">Developer Hub</h2>
           <p className="text-stone-400 text-sm">Project management, documentation, and experimental tools.</p>
        </div>
        
        <div className="flex bg-stone-900 p-1 rounded-lg border border-stone-700 shadow-sm flex-wrap gap-1">
            <button 
                onClick={() => setActiveTab('log')}
                className={`px-4 py-2 text-xs font-bold rounded transition-all ${activeTab === 'log' ? 'bg-ck3-gold text-white shadow-md' : 'text-stone-500 hover:text-stone-300 hover:bg-stone-800'}`}
            >
                LOG
            </button>
            <button 
                onClick={() => setActiveTab('prd')}
                className={`px-4 py-2 text-xs font-bold rounded transition-all ${activeTab === 'prd' ? 'bg-ck3-gold text-white shadow-md' : 'text-stone-500 hover:text-stone-300 hover:bg-stone-800'}`}
            >
                PRD
            </button>
            <button 
                onClick={() => setActiveTab('wiki')}
                className={`px-4 py-2 text-xs font-bold rounded transition-all ${activeTab === 'wiki' ? 'bg-ck3-gold text-white shadow-md' : 'text-stone-500 hover:text-stone-300 hover:bg-stone-800'}`}
            >
                WIKI
            </button>
            <button 
                onClick={() => setActiveTab('experiments')}
                className={`px-4 py-2 text-xs font-bold rounded transition-all flex items-center gap-1 ${activeTab === 'experiments' ? 'bg-purple-700 text-white shadow-md' : 'text-purple-400 hover:text-purple-300 hover:bg-stone-800'}`}
            >
                <span>🧪</span> LABS
            </button>
        </div>
      </header>
      
      <div className="flex-1 min-h-0">
          {activeTab === 'log' && renderLog()}
          {activeTab === 'prd' && renderPrd()}
          {activeTab === 'wiki' && renderWiki()}
          {activeTab === 'experiments' && renderExperiments()}
      </div>
    </div>
  );
};

export default DevLog;
