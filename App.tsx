
import React, { useState } from 'react';
import Layout from './components/Layout';
import TraitPlanner from './components/TraitPlanner';
import RoyalAdvisor from './components/RoyalAdvisor';
import Gallery from './components/Gallery';
import DnaManager from './components/DnaManager';
import DnaComparator from './components/DnaComparator';
import DnaComparatorExperimental from './components/DnaComparatorExperimental';
import DnaForge from './components/DnaForge/index';
import DevLog from './components/DevLog';
import { CharacterBuild } from './types';
import { fetchAllDocuments } from './services/docLoader';
import { useEffect } from 'react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('forge');

  // Load documentation from server on mount
  useEffect(() => {
    fetchAllDocuments();
  }, []);
  const [isPersistentMode, setIsPersistentMode] = useState(false);
  const [build, setBuild] = useState<CharacterBuild>({
    name: '',
    culture: '',
    religion: '',
    goal: '',
    traits: []
  });

  const [designSettings, setDesignSettings] = useState({
    enableAnimations: true,
    enableGlassmorphism: true,
    enable3DTilt: true,
    enableImmersiveFonts: true
  });

  const updateBuild = (updates: Partial<CharacterBuild>) => {
    setBuild(prev => ({ ...prev, ...updates }));
  };

  return (
    <Layout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      isPersistentMode={isPersistentMode}
      onPersistentModeChange={setIsPersistentMode}
      designSettings={designSettings}
      onDesignSettingsChange={setDesignSettings}
    >
      {activeTab === 'planner' && (
        <TraitPlanner
          build={build}
          updateBuild={updateBuild}
          onSwitchToAdvisor={() => setActiveTab('advisor')}
        />
      )}
      {activeTab === 'advisor' && <RoyalAdvisor build={build} />}
      {activeTab === 'gallery' && <Gallery onNavigate={setActiveTab} isPersistentMode={isPersistentMode} designSettings={designSettings} />}
      {activeTab === 'dna' && <DnaManager />}
      {activeTab === 'comparator' && <DnaComparator />}
      {activeTab === 'morph_lab' && <DnaComparatorExperimental />}
      {activeTab === 'forge' && <DnaForge />}
      {activeTab === 'devlog' && <DevLog />}
    </Layout>
  );
};

export default App;
