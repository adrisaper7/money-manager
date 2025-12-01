import React from 'react';
import { Logo } from './header/Logo';
import { FileActions } from './header/FileActions';
import { NavigationTabs } from './header/NavigationTabs';
import { LoginView } from './LoginView';
import { ConfigurationButton } from './ConfigurationButton';
import { ConfigurationModal } from './ConfigurationModal';

export const Header = ({ 
  activeTab, 
  setActiveTab, 
  onDownload, 
  onUpload, 
  currentUser, 
  onLogout, 
  currency,
  onChangeCurrency,
  t 
}) => {
  const [isConfigModalOpen, setIsConfigModalOpen] = React.useState(false);

  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Logo t={t} />
            <div className="flex items-center gap-4">
              <FileActions onDownload={onDownload} onUpload={onUpload} t={t} />
              <ConfigurationButton 
                onClick={() => setIsConfigModalOpen(true)} 
                t={t} 
              />
              {currentUser && <LoginView currentUser={currentUser} onLogout={onLogout} t={t} />}
            </div>
          </div>
          <NavigationTabs activeTab={activeTab} setActiveTab={setActiveTab} t={t} />
        </div>
      </header>

      <ConfigurationModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        currency={currency}
        onCurrencyChange={onChangeCurrency}
        t={t}
      />
    </>
  );
};

