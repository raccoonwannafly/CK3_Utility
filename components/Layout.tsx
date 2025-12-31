
import React, { useState } from 'react';
import { APP_NAME } from '../constants';
import { Moon, Sun } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
        document.body.classList.remove('theme-light');
    } else {
        document.body.classList.add('theme-light');
    }
  };

  return (
    <div className="min-h-screen bg-ck3-dark text-stone-200 font-sans selection:bg-ck3-gold selection:text-white flex flex-col md:flex-row overflow-hidden transition-colors duration-300">
      {/* Sidebar Navigation */}
      <nav 
        className={`
          flex flex-col shrink-0 relative z-20 bg-ck3-paper border-b md:border-b-0 md:border-r border-stone-700
          transition-all duration-300 ease-in-out
          w-full ${isCollapsed ? 'md:w-20' : 'md:w-64'}
        `}
      >
        <div className={`p-4 border-b border-stone-700 bg-gradient-to-b from-stone-800 to-ck3-paper flex items-center ${isCollapsed ? 'justify-center' : ''} h-[88px]`}>
           {isCollapsed ? (
             <h1 className="text-3xl font-serif font-bold text-ck3-gold">CK</h1>
           ) : (
             <div className="overflow-hidden">
                <h1 className="text-2xl font-serif font-bold text-ck3-gold truncate">{APP_NAME}</h1>
                <p className="text-xs text-stone-500 mt-1 uppercase tracking-widest truncate">Utility Suite</p>
             </div>
           )}
        </div>
        
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-2">
          {/* Priority Tools */}
          <NavButton 
            active={activeTab === 'dna'} 
            onClick={() => onTabChange('dna')}
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633z" clipRule="evenodd" /></svg>}
            label="DNA Converter"
            isCollapsed={isCollapsed}
          />
          <NavButton 
            active={activeTab === 'gallery'} 
            onClick={() => onTabChange('gallery')}
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" /></svg>}
            label="Gallery Hub"
            isCollapsed={isCollapsed}
          />
          <NavButton 
            active={activeTab === 'forge'} 
            onClick={() => onTabChange('forge')}
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 16v-4M12 8h.01"/></svg>}
            label="DNA Forge"
            isCollapsed={isCollapsed}
          />

          {/* WIP Section Divider */}
          <div className={`mt-6 mb-2 px-4 text-[10px] font-bold uppercase tracking-widest text-stone-600 ${isCollapsed ? 'hidden' : 'block'}`}>
              Work in Progress
          </div>
          <div className={`h-px bg-stone-800 mb-2 mx-4 ${isCollapsed ? 'block mt-4' : 'hidden'}`}></div>

          {/* Secondary / WIP Tools */}
          <NavButton 
            active={activeTab === 'planner'} 
            onClick={() => onTabChange('planner')}
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>}
            label="Trait Planner"
            isCollapsed={isCollapsed}
          />
          <NavButton 
            active={activeTab === 'advisor'} 
            onClick={() => onTabChange('advisor')}
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" /><path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" /></svg>}
            label="Character Sheet"
            isCollapsed={isCollapsed}
          />
          <NavButton 
            active={activeTab === 'comparator'} 
            onClick={() => onTabChange('comparator')}
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" /></svg>}
            label="Morph Comparator"
            isCollapsed={isCollapsed}
          />
          <NavButton 
            active={activeTab === 'morph_lab'} 
            onClick={() => onTabChange('morph_lab')}
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>}
            label="Morph Lab"
            isCollapsed={isCollapsed}
          />
          
          <div className={`h-px bg-stone-700 my-2 opacity-50 ${isCollapsed ? 'mx-2' : 'mx-4'}`}></div>
          
          <NavButton 
            active={activeTab === 'devlog'} 
            onClick={() => onTabChange('devlog')}
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633z" clipRule="evenodd" /><path fillRule="evenodd" d="M5.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L2.414 10l3.293 3.293a1 1 0 010 1.414zm8.586 0a1 1 0 010-1.414L17.586 10l-3.293-3.293a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>}
            label="Developer"
            isCollapsed={isCollapsed}
          />
        </div>

        {/* Footer / Toggle */}
        <div className="p-3 border-t border-stone-700 flex gap-2">
             <button 
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="flex-1 flex items-center justify-center p-2 text-stone-500 hover:text-ck3-gold hover:bg-stone-800 rounded transition-colors group"
                title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
             >
                {isCollapsed ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                ) : (
                    <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
                        <span className="text-xs uppercase font-bold tracking-wider">Collapse</span>
                    </div>
                )}
             </button>
             
             {/* Theme Toggle */}
             <button
                onClick={toggleTheme}
                className="flex-shrink-0 w-9 flex items-center justify-center p-2 text-stone-500 hover:text-white hover:bg-stone-800 rounded transition-colors"
                title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
             >
                 {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
             </button>
        </div>
        {!isCollapsed && (
             <div className="pb-3 text-[10px] text-stone-600 text-center">
                For Crusader Kings III<br/>
                Not affiliated with Paradox
            </div>
         )}
      </nav>

      {/* Main Content Area - Full Width */}
      <main className="flex-1 overflow-y-auto h-[calc(100vh-64px)] md:h-screen relative bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')]">
        <div className="w-full p-4 md:p-8 pb-32">
          {children}
        </div>
      </main>
    </div>
  );
};

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  isCollapsed: boolean;
}

const NavButton: React.FC<NavButtonProps> = ({ active, onClick, icon, label, isCollapsed }) => (
  <button
    onClick={onClick}
    title={isCollapsed ? label : undefined}
    className={`w-full flex items-center py-3 rounded-lg transition-all duration-200 border border-transparent group
      ${isCollapsed ? 'justify-center px-2' : 'space-x-3 px-4'}
      ${active 
        ? 'bg-ck3-gold/20 text-ck3-goldLight border-ck3-gold/30 font-bold shadow-lg' 
        : 'text-stone-400 hover:bg-stone-800 hover:text-stone-200'
      }`}
  >
    <div className={`shrink-0 ${active ? 'text-ck3-goldLight' : 'text-stone-500 group-hover:text-stone-300'}`}>{icon}</div>
    {!isCollapsed && <span className="font-serif tracking-wide truncate">{label}</span>}
  </button>
);

export default Layout;
