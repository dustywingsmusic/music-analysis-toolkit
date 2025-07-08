import React from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
    <Tabs value={activeTab} onValueChange={onTabChange}>
      <TabsList className="grid w-full grid-cols-4 bg-slate-800 border-slate-700">
        {tabs.map((tab) => (
          <TabsTrigger 
            key={tab.id} 
            value={tab.id}
            title={tab.title}
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};

export default NavigationTabs;
