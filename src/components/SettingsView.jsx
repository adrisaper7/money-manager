import React, { useMemo } from 'react';
import { Target } from 'lucide-react';
import { ConfigInputs } from './settings/ConfigInputs';
import { CalculatedMetrics } from './settings/CalculatedMetrics';
import { FireProjectionChart } from './charts/FireProjectionChart';
import { calculatePercentageBasedInvestment } from '../utils';

export const SettingsView = ({ config, setConfig, stats, t, language, exchangeRates, data }) => {
    const { monthlyInvestment, monthsUsed, averageNetIncome } = useMemo(() => (
        calculatePercentageBasedInvestment({
            data,
            investmentRate: config?.investmentRate ?? 0,
            monthsWindow: 6
        })
    ), [data, config?.investmentRate]);

    return (
        <div className="space-y-6">
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Target className="text-blue-500" />
                    {t('settings.title')}
                </h2>

                <ConfigInputs
                    config={config}
                    setConfig={setConfig}
                    t={t}
                    language={language}
                    defaultMonthlyInvestment={monthlyInvestment}
                    monthsUsed={monthsUsed}
                    averageNetIncome={averageNetIncome}
                />
                <CalculatedMetrics stats={stats} config={config} t={t} language={language} exchangeRates={exchangeRates} />
            </div>

            <div className="max-w-7xl mx-auto">
                <FireProjectionChart
                    data={data}
                    config={config}
                    language={language}
                    exchangeRates={exchangeRates}
                />
            </div>
        </div>
    );
};
