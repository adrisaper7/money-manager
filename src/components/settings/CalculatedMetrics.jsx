import React from 'react';
import { formatCurrency, formatPercent } from '../../utils';

export const CalculatedMetrics = ({ stats, config, t, exchangeRates }) => {
    const currentYear = new Date().getFullYear();
    const yearsRemaining = (config?.targetYear || currentYear + 10) - currentYear;
    const progress = stats?.progress || 0;
    const remaining = (config?.targetInvestment || 0) - (stats?.investmentAssets || 0);

    return (
        <div className="mt-8 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <h4 className="font-semibold text-slate-800 mb-2">Progress towards Goal</h4>
            <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-slate-600">Current Investment:</span>
                    <span className="font-mono font-medium">{formatCurrency(stats?.investmentAssets || 0, 'en', exchangeRates)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-600">Investment Target:</span>
                    <span className="font-mono font-medium">{formatCurrency(config?.targetInvestment || 0, 'en', exchangeRates)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-600">Progress:</span>
                    <span className="font-mono font-medium text-blue-600">{formatPercent(progress, 'en')}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-600">Remaining to reach:</span>
                    <span className="font-mono font-medium">{formatCurrency(Math.max(0, remaining), 'en', exchangeRates)}</span>
                </div>
                {yearsRemaining > 0 && (
                    <div className="flex justify-between">
                        <span className="text-slate-600">Years remaining:</span>
                        <span className="font-mono font-medium">{yearsRemaining} years</span>
                    </div>
                )}
            </div>
        </div>
    );
};

