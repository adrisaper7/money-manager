import React from 'react';

export const ConfigurationModal = ({ 
  isOpen, 
  onClose, 
  currency, 
  onCurrencyChange, 
  language,
  onLanguageChange,
  t 
}) => {
  if (!isOpen) return null;

  const currencies = [
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'USD', symbol: '$', name: 'US Dollar' }
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {t('configuration.title')}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Ajusta el idioma de la interfaz y la moneda en la que se muestran tus datos.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Language section */}
          <section className="bg-slate-50 rounded-xl border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-800 mb-2">{t('configuration.language')}</h3>
            <p className="text-xs text-slate-500 mb-3">
              Selecciona el idioma en el que quieres ver la aplicación.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => onLanguageChange('es')}
                className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                  language === 'es'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                Español
              </button>
              <button
                type="button"
                onClick={() => onLanguageChange('en')}
                className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                  language === 'en'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                English
              </button>
            </div>
          </section>

          {/* Currency section */}
          <section className="bg-slate-50 rounded-xl border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-800 mb-2">{t('configuration.currency')}</h3>
            <p className="text-xs text-slate-500 mb-3">
              Elige en qué moneda quieres ver los importes. Los datos base están en EUR.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {currencies.map((curr) => (
                <button
                  key={curr.code}
                  type="button"
                  onClick={() => onCurrencyChange(curr.code)}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    currency === curr.code
                      ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="text-base font-semibold">{curr.symbol} {curr.code}</div>
                  <div className="text-xs text-slate-500 mt-1">{curr.name}</div>
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="px-6 py-3 border-t border-slate-100 flex justify-end bg-slate-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('common.save')}
          </button>
        </div>
      </div>
    </div>
  );
}
