import React from 'react';
import { Activity, Wallet, TrendingUp, DollarSign, Settings } from 'lucide-react';

export const NavigationTabs = ({ activeTab, setActiveTab, t }) => {
  const tabs = [
    { id: 'dashboard', label: t ? t('navigation.dashboard') : 'Dashboard', icon: Activity },
    { id: 'networth', label: t ? t('navigation.networth') : 'Net Worth', icon: Wallet },
    { id: 'budget', label: t ? t('navigation.budget') : 'Budget', icon: DollarSign },
    { id: 'investment', label: t ? t('navigation.investments') : 'Investments', icon: TrendingUp },
    { id: 'settings', label: t ? t('navigation.settings') : 'Goals', icon: Settings },
  ];

  return (
    <div className="flex space-x-1 overflow-x-auto pb-1 no-scrollbar">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`
            flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
            ${activeTab === tab.id
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}
          `}
        >
          <tab.icon size={16} />
          {tab.label}
        </button>
      ))}
    </div>
  );
};

