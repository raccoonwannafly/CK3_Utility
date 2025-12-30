
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

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('forge');
  const [build, setBuild] = useState<CharacterBuild>({
    name: '',
    culture: '',
    religion: '',
    goal: '',
    traits: []
  });

  const updateBuild = (updates: Partial<CharacterBuild>) => {
    setBuild(prev => ({ ...prev, ...updates }));
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'planner' && (
        <TraitPlanner 
          build={build} 
          updateBuild={updateBuild} 
          onSwitchToAdvisor={() => setActiveTab('advisor')} 
        />
      )}
      {activeTab === 'advisor' && <RoyalAdvisor build={build} />}
      {activeTab === 'gallery' && <Gallery onNavigate={setActiveTab} />}
      {activeTab === 'dna' && <DnaManager />}
      {activeTab === 'comparator' && <DnaComparator />}
      {activeTab === 'morph_lab' && <DnaComparatorExperimental />}
      {activeTab === 'forge' && <DnaForge />}
      {activeTab === 'devlog' && <DevLog />}
    </Layout>
  );
};

export default App;
