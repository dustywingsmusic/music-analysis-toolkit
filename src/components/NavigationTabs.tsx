import React from 'react';

export type TabType = 'identify' | 'discover' | 'harmony' | 'reference';

interface NavigationTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const NavigationTabs: React.FC<NavigationTabsProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { 
      id: 'identify' as TabType, 
      label: 'Identify', 
      title: 'Mode Identification'
    },
    { 
      id: 'discover' as TabType, 
      label: 'Input', 
      title: 'Mode Discovery'
    },
    { 
      id: 'harmony' as TabType, 
      label: 'Harmonize', 
      title: 'Chords & Harmony'
    },
    { 
      id: 'reference' as TabType, 
      label: 'Reference', 
      title: 'Scale Tables & Reference'
    },
  ];

  return (
    <nav className="flex space-x-4">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-4 py-2 rounded-md transition-colors duration-200 ${
            activeTab === tab.id 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
          }`}
          title={tab.title}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
};

export default NavigationTabs;
