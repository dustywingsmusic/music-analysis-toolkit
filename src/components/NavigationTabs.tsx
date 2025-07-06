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
      label: '🎼 Identify', 
      title: 'Mode Identification', 
      status: 'complete',
      statusLabel: 'Fully Implemented'
    },
    { 
      id: 'discover' as TabType, 
      label: '🔍 Discover', 
      title: 'Mode Discovery', 
      status: 'partial',
      statusLabel: 'UI Complete - Backend Pending'
    },
    { 
      id: 'harmony' as TabType, 
      label: '🎵 Harmony', 
      title: 'Chords & Harmony', 
      status: 'partial',
      statusLabel: 'UI Complete - Backend Pending'
    },
    { 
      id: 'reference' as TabType, 
      label: '📚 Reference', 
      title: 'Scale Tables & Reference', 
      status: 'complete',
      statusLabel: 'Fully Implemented'
    },
  ];

  return (
    <nav className="navigation-tabs">
      <div className="navigation-tabs__container">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`navigation-tabs__tab ${
              activeTab === tab.id ? 'navigation-tabs__tab--active' : ''
            } navigation-tabs__tab--${tab.status}`}
            title={`${tab.title} - ${tab.statusLabel}`}
          >
            <span className="navigation-tabs__tab-label">{tab.label}</span>
            <span className={`navigation-tabs__tab-status navigation-tabs__tab-status--${tab.status}`}>
              {tab.status === 'complete' ? '✓' : tab.status === 'partial' ? '⚠' : '○'}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default NavigationTabs;
