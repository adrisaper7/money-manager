import React from 'react';
import { formatCurrency, formatPercent } from '../../utils';

export const CalculatedMetrics = ({ stats, config, t, language, exchangeRates }) => {
    const currentYear = new Date().getFullYear();
    const yearsRemaining = (config?.targetYear || currentYear + 10) - currentYear;
    const progress = stats?.progress || 0;
    const remaining = (config?.targetInvestment || 0) - (stats?.investmentAssets || 0);

    return (
        <div className="mt-8 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <h4 className="font-semibold text-slate-800 mb-2">Progreso hacia el Objetivo</h4>
            <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-slate-600">Inversión Actual:</span>
                    <span className="font-mono font-medium">{formatCurrency(stats?.investmentAssets || 0, language, exchangeRates)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-600">Objetivo de Inversión:</span>
                    <span className="font-mono font-medium">{formatCurrency(config?.targetInvestment || 0, language, exchangeRates)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-600">Progreso:</span>
                    <span className="font-mono font-medium text-blue-600">{formatPercent(progress, language)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-600">Falta por alcanzar:</span>
                    <span className="font-mono font-medium">{formatCurrency(Math.max(0, remaining), language, exchangeRates)}</span>
                </div>
                {yearsRemaining > 0 && (
                    <div className="flex justify-between">
                        <span className="text-slate-600">Años restantes:</span>
                        <span className="font-mono font-medium">{yearsRemaining} años</span>
                    </div>
                )}
            </div>
        </div>
    );
};

