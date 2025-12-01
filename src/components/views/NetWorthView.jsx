import React, { useMemo } from 'react';
import { MonthNavigationBar } from '../MonthNavigationBar';
import { DataEntryTable } from '../DataEntryTable';
import { DebtTable } from '../DebtTable';
import { AssetLiabilityChart } from '../charts/AssetLiabilityChart';
import { MonthNavigationProvider, useMonthNavigation } from '../../contexts/MonthNavigationContext';
import { getCategoriesForLanguage } from '../../constants';
import { formatCurrency } from '../../utils';

export const NetWorthView = ({ data, stats, onAddPreviousMonth, onRemoveLastMonth, updateData, t, exchangeRates }) => (
    <MonthNavigationProvider data={data}>
        <NetWorthContent
            data={data}
            stats={stats}
            onAddPreviousMonth={onAddPreviousMonth}
            onRemoveLastMonth={onRemoveLastMonth}
            updateData={updateData}
            t={t}
            exchangeRates={exchangeRates}
        />
    </MonthNavigationProvider>
);

const NetWorthContent = ({ data, stats, onAddPreviousMonth, onRemoveLastMonth, updateData, t, exchangeRates }) => {
    const { selectedMonthIndex } = useMonthNavigation();
    const categories = getCategoriesForLanguage();

    const calculateNetWorth = (month) => {
        if (!month) return 0;
        const assets = Object.values(month.assets || {}).reduce((a, b) => a + Number(b || 0), 0);
        const liabilities = Object.values(month.liabilities || {}).reduce((a, b) => a + Number(b || 0), 0);
        const debtCollab = Object.values(month.debtCollaboration || {}).reduce((a, b) => a + Number(b || 0), 0);

        // Net worth = assets - unpaid debt
        // For debts like mortgages/auto loans: asset value is tracked separately
        // For debts like credit cards: borrowed money should be added to Bank/Cash assets
        return assets - (liabilities - debtCollab);
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
                        <p className="text-2xl font-bold text-emerald-600">{formatCurrency(displayNetWorth, 'en', exchangeRates)}</p>
                    </div>
                    <div className="text-right border-l border-slate-300 pl-6">
                        <p className="text-sm text-slate-500">{t('networth.netChange')}</p>
                        <p className={`text-2xl font-bold ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                            {isPositive ? '+' : ''}{formatCurrency(netWorthChange, 'en', exchangeRates)}
                        </p>
                    </div>
                    <div className="text-right border-l border-slate-300 pl-6">
                        <p className="text-sm text-slate-500">{t('networth.annualChange')}</p>
                        <p className={`text-2xl font-bold ${annualNetWorthChange >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {annualNetWorthChange >= 0 ? '+' : ''}{formatCurrency(annualNetWorthChange, 'en', exchangeRates)}
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
                    subtitle={t('networth.assetsSubtitle')}
                    type="assets"
                    categories={categories.assets}
                    updateData={updateData}
                    exchangeRates={exchangeRates}
                    historicalData={data}
                    showTrendIcon
                />
                <DebtTable
                    title={t('networth.liabilities')}
                    subtitle={t('networth.liabilitiesSubtitle')}
                    type="liabilities"
                    categories={categories.liabilities}
                    updateData={updateData}
                    exchangeRates={exchangeRates}
                    historicalData={data}
                    showTrendIcon
                    selectedMonthIndex={selectedMonthIndex}
                    t={t}
                    secondaryColumn={{
                        header: t('networth.paid'),
                        getValue: (month, category) => month?.debtCollaboration?.[category] || 0,
                        formatValue: (value) => formatCurrency(value, 'en', exchangeRates),
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
                    exchangeRates={exchangeRates}
                />
                <AssetLiabilityChart
                    data={data}
                    type="liabilities"
                    categories={categories.liabilities}
                    title={t('networth.liabilityEvolution')}
                    exchangeRates={exchangeRates}
                />
            </div>
        </div>
    );
};
