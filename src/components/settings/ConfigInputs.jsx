import React from 'react';

export const ConfigInputs = ({ config, setConfig, t, language }) => {
    const currentYear = new Date().getFullYear();
    const currencySymbol = language === 'en' ? '$' : '€';

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Objetivo de Inversión ({currencySymbol})</label>
                <input
                    type="number"
                    value={config.targetInvestment || ''}
                    onChange={(e) => setConfig({ ...config, targetInvestment: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="1000000"
                />
                <p className="text-xs text-slate-400 mt-1">Cantidad que quieres tener invertida en activos que generan retorno</p>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Año Objetivo</label>
                <input
                    type="number"
                    value={config.targetYear || ''}
                    onChange={(e) => setConfig({ ...config, targetYear: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={currentYear + 10}
                    min={currentYear}
                />
                <p className="text-xs text-slate-400 mt-1">Año en el que quieres alcanzar este patrimonio</p>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Retorno Anual Esperado (%)</label>
                <input
                    type="number"
                    step="0.1"
                    value={config.expectedReturn || ''}
                    onChange={(e) => setConfig({ ...config, expectedReturn: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="7.0"
                />
                <p className="text-xs text-slate-400 mt-1">Retorno anual esperado para proyecciones</p>
            </div>
        </div>
    );
};

