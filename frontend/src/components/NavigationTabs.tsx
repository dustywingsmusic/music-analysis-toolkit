import React from 'react';
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { trackNavClick } from '../utils/tracking';

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
      icon: '🎼',
      color: 'text-primary'
    },
    { 
      id: 'discover' as TabType, 
      label: '🔍 Discover', 
      title: 'Mode Discovery',
      icon: '🔍',
      color: 'text-secondary'
    },
    { 
      id: 'harmony' as TabType, 
      label: '🎵 Harmony', 
      title: 'Chords & Harmony',
      icon: '🎵',
      color: 'text-primary'
    },
    { 
      id: 'reference' as TabType, 
      label: '📚 Reference', 
      title: 'Scale Tables & Reference',
      icon: '📚',
      color: 'text-accent'
    },
  ];

  const handleTabChange = (tab: TabType) => {
    // Track navigation click
    const selectedTab = tabs.find(t => t.id === tab);
    if (selectedTab) {
      trackNavClick(`Main Navigation - ${selectedTab.title}`);
    }
    // Call original handler
    onTabChange(tab);
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange}>
      <TabsList className="grid w-full grid-cols-4 bg-background border-border">
        {tabs.map((tab) => (
          <TabsTrigger 
            key={tab.id} 
            value={tab.id}
            title={tab.title}
            className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground text-muted-foreground hover:text-foreground flex items-center gap-2 transition-all duration-200"
          >
            <span className={`text-lg transition-all duration-200 ${activeTab === tab.id ? tab.color : 'text-muted-foreground'} hover:scale-110`}>
              {tab.icon}
            </span>
            <span className="text-sm font-medium">
              {tab.label.split(' ').slice(1).join(' ')}
            </span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};

export default NavigationTabs;
