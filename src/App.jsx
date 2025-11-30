import React, { useState } from 'react';
import { DashboardView } from './components/DashboardView';
import { SettingsView } from './components/SettingsView';
import { NetWorthView } from './components/views/NetWorthView';
import { BudgetView } from './components/views/BudgetView';
import { LoginView } from './components/LoginView';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { Header } from './components/Header';
import { initialConfig } from './constants';
import { useFireData } from './hooks/useFireData';
import { useFireStats } from './hooks/useFireStats';
import { useUser } from './hooks/useUser';
import { useLanguage } from './hooks/useLanguage';
import { useCurrency } from './hooks/useCurrency';
import { useExchangeRate } from './hooks/useExchangeRate';
import { downloadData, uploadData } from './utils';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [config, setConfig] = useState(initialConfig);

  const { currentUser, isLoading: userLoading, loginUser, registerUser, logoutUser } = useUser();
  const { language, isLoading: languageLoading, changeLanguage, t } = useLanguage();
  const { currency, isLoading: currencyLoading, changeCurrency } = useCurrency();
  const { rates: exchangeRates, isLoading: ratesLoading } = useExchangeRate();
  const { data, updateData, addPreviousMonth, removeLastMonth, loadData, isFirestoreAvailable, errorMessage } = useFireData(currentUser?.id);
  const stats = useFireStats(data, config);

  const handleDownload = () => {
    downloadData(data);
  };

  const handleUpload = (event) => {
    if (event.target.files && event.target.files[0]) {
      uploadData(event.target.files[0], loadData);
    }
  };

  if (userLoading || languageLoading || currencyLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">{t('app.loading')}</div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="flex justify-end mb-4">
            <LanguageSwitcher language={language} onChangeLanguage={changeLanguage} t={t} />
          </div>
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold text-slate-800 mb-2 text-center">{t('app.title')}</h1>
            <p className="text-slate-600 mb-8 text-center">{t('app.subtitle')}</p>
            <LoginView
              currentUser={currentUser}
              onLogin={loginUser}
              onRegister={registerUser}
              onLogout={logoutUser}
              t={t}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      {/* Firestore Status Notification */}
      {currentUser && isFirestoreAvailable === false && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                {errorMessage || 'Datos guardados localmente. Configure Firestore para sincronización en la nube.'}
              </p>
            </div>
          </div>
        </div>
      )}

      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onDownload={handleDownload}
        onUpload={handleUpload}
        currentUser={currentUser}
        onLogout={logoutUser}
        language={language}
        onChangeLanguage={changeLanguage}
        currency={currency}
        onChangeCurrency={changeCurrency}
        t={t}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <DashboardView stats={stats} data={data} config={config} t={t} language={language} exchangeRates={exchangeRates} />
        )}

        {activeTab === 'networth' && (
          <NetWorthView
            data={data}
            stats={stats}
            onAddPreviousMonth={addPreviousMonth}
            onRemoveLastMonth={removeLastMonth}
            updateData={updateData}
            t={t}
            language={language}
            exchangeRates={exchangeRates}
          />
        )}

        {activeTab === 'budget' && (
          <BudgetView
            data={data}
            stats={stats}
            onAddPreviousMonth={addPreviousMonth}
            onRemoveLastMonth={removeLastMonth}
            updateData={updateData}
            t={t}
            language={language}
            exchangeRates={exchangeRates}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView config={config} setConfig={setConfig} stats={stats} t={t} language={language} exchangeRates={exchangeRates} data={data} />
        )}
      </main>
    </div>
  );
}
