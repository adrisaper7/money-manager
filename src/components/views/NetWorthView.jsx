import React, { useMemo } from 'react';
import { MonthNavigationBar } from '../MonthNavigationBar';
import { DataEntryTable } from '../DataEntryTable';
import { AssetLiabilityChart } from '../charts/AssetLiabilityChart';
import { MonthNavigationProvider, useMonthNavigation } from '../../contexts/MonthNavigationContext';
import { getCategoriesForLanguage } from '../../constants';
import { formatCurrency } from '../../utils';

export const NetWorthView = ({ data, stats, onAddPreviousMonth, onRemoveLastMonth, updateData, t, language, exchangeRates }) => (
    <MonthNavigationProvider data={data}>
        <NetWorthContent
            data={data}
            stats={stats}
            onAddPreviousMonth={onAddPreviousMonth}
            onRemoveLastMonth={onRemoveLastMonth}
            updateData={updateData}
            t={t}
            language={language}
            exchangeRates={exchangeRates}
        />
    </MonthNavigationProvider>
);

const NetWorthContent = ({ data, stats, onAddPreviousMonth, onRemoveLastMonth, updateData, t, language, exchangeRates }) => {
    const { selectedMonthIndex } = useMonthNavigation();
    const categories = getCategoriesForLanguage(language);

    const calculateNetWorth = (month) => {
        if (!month) return 0;
        const assets = Object.values(month.assets || {}).reduce((a, b) => a + Number(b || 0), 0);
        const liabilities = Object.values(month.liabilities || {}).reduce((a, b) => a + Number(b || 0), 0);
        const debtCollab = Object.values(month.debtCollaboration || {}).reduce((a, b) => a + Number(b || 0), 0);
        return assets + debtCollab - liabilities;
    };

    const netWorthChange = useMemo(() => {
        if (!data || data.length < 2) return 0;
        if (selectedMonthIndex <= 0) return 0;

        const currentMonth = data[selectedMonthIndex];
        const previousMonth = data[selectedMonthIndex - 1];

        return calculateNetWorth(currentMonth) - calculateNetWorth(previousMonth);
    }, [data, selectedMonthIndex]);

    const annualNetWorthChange = useMemo(() => {
        if (!data || data.length < 2) return 0;
        const currentMonth = selectedMonthIndex;
        const yearAgoIndex = Math.max(0, currentMonth - 12);
        if (currentMonth === yearAgoIndex) return 0;

        return calculateNetWorth(data[currentMonth]) - calculateNetWorth(data[yearAgoIndex]);
    }, [data, selectedMonthIndex]);

    const selectedMonth = data[selectedMonthIndex] || null;
    const displayNetWorth = selectedMonth ? calculateNetWorth(selectedMonth) : stats?.netWorth || 0;
    const isPositive = netWorthChange >= 0;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">{t('networth.title')}</h2>
                    <p className="text-slate-500">{t('networth.subtitle')}</p>
                </div>
                <div className="flex gap-6">
                    <div className="text-right">
                        <p className="text-sm text-slate-500">{t('networth.totalNetWorth')}</p>
                        <p className="text-2xl font-bold text-emerald-600">{formatCurrency(displayNetWorth, language, exchangeRates)}</p>
                    </div>
                    <div className="text-right border-l border-slate-300 pl-6">
                        <p className="text-sm text-slate-500">{t('networth.netChange')}</p>
                        <p className={`text-2xl font-bold ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                            {isPositive ? '+' : ''}{formatCurrency(netWorthChange, language, exchangeRates)}
                        </p>
                    </div>
                    <div className="text-right border-l border-slate-300 pl-6">
                        <p className="text-sm text-slate-500">{t('networth.annualChange')}</p>
                        <p className={`text-2xl font-bold ${annualNetWorthChange >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {annualNetWorthChange >= 0 ? '+' : ''}{formatCurrency(annualNetWorthChange, language, exchangeRates)}
                        </p>
                    </div>
                </div>
            </div>

            <MonthNavigationBar
                data={data}
                onAddPreviousMonth={onAddPreviousMonth}
                onRemoveLastMonth={onRemoveLastMonth}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DataEntryTable
                    title={t('networth.assets')}
                    type="assets"
                    categories={categories.assets}
                    updateData={updateData}
                    language={language}
                    exchangeRates={exchangeRates}
                    historicalData={data}
                    showTrendIcon
                />
                <DataEntryTable
                    title={t('networth.liabilities')}
                    type="liabilities"
                    categories={categories.liabilities}
                    updateData={updateData}
                    language={language}
                    exchangeRates={exchangeRates}
                    historicalData={data}
                    showTrendIcon
                    secondaryColumn={{
                        header: t('networth.paid'),
                        getValue: (month, category) => month?.debtCollaboration?.[category] || 0,
                        formatValue: (value) => formatCurrency(value, language, exchangeRates),
                        editable: true,
                        type: 'debtCollaboration'
                    }}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AssetLiabilityChart
                    data={data}
                    type="assets"
                    categories={categories.assets}
                    title={t('networth.assetEvolution')}
                    language={language}
                    exchangeRates={exchangeRates}
                />
                <AssetLiabilityChart
                    data={data}
                    type="liabilities"
                    categories={categories.liabilities}
                    title={t('networth.liabilityEvolution')}
                    language={language}
                    exchangeRates={exchangeRates}
                />
            </div>
        </div>
    );
};
