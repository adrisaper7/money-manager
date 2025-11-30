import React from 'react';
import { MonthNavigationBar } from '../MonthNavigationBar';
import { MonthNavigationProvider } from '../../contexts/MonthNavigationContext';
import { DataEntryTable } from '../DataEntryTable';
import { DebtCollaborationTable } from '../DebtCollaborationTable';
import { AvailableFundsPanel } from '../AvailableFundsPanel';
import { formatCurrency } from '../../utils';
import { investmentCategories } from '../../constants';

export const InvestmentView = ({ data, stats, onAddPreviousMonth, onRemoveLastMonth, updateData, t, language, exchangeRates }) => {
    // Calculate net worth change (current month - previous month)
    const calculateNetWorthChange = () => {
        if (!data || data.length < 2) return 0;

        const currentMonth = data[data.length - 1];
        const previousMonth = data[data.length - 2];

        const currentAssets = Object.values(currentMonth.assets || {}).reduce((a, b) => a + Number(b), 0);
        const currentLiabilities = Object.values(currentMonth.liabilities || {}).reduce((a, b) => a + Number(b), 0);
        const currentDebtCollab = Object.values(currentMonth.debtCollaboration || {}).reduce((a, b) => a + Number(b), 0);
        const currentNetWorth = currentAssets + currentDebtCollab - currentLiabilities;

        const prevAssets = Object.values(previousMonth.assets || {}).reduce((a, b) => a + Number(b), 0);
        const prevLiabilities = Object.values(previousMonth.liabilities || {}).reduce((a, b) => a + Number(b), 0);
        const prevDebtCollab = Object.values(previousMonth.debtCollaboration || {}).reduce((a, b) => a + Number(b), 0);
        const prevNetWorth = prevAssets + prevDebtCollab - prevLiabilities;

        return currentNetWorth - prevNetWorth;
    };

    const netWorthChange = calculateNetWorthChange();
    const isPositive = netWorthChange >= 0;

    return (
        <MonthNavigationProvider data={data}>
            <div className="space-y-6">
                <div className="flex justify-between items-end">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">{t('investments.title')}</h2>
                        <p className="text-slate-500">{t('investments.subtitle')}</p>
                    </div>
                    <div className="flex gap-6">
                        <div className="text-right">
                            <p className="text-sm text-slate-500">{t('investments.totalInvested')}</p>
                            <p className="text-2xl font-bold text-emerald-600">{formatCurrency(stats?.investmentAssets || 0, language, exchangeRates)}</p>
                        </div>
                        <div className="text-right border-l border-slate-300 pl-6">
                            <p className="text-sm text-slate-500">Cambio Neto (mes actual - anterior)</p>
                            <p className={`text-2xl font-bold ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                                {isPositive ? '+' : ''}{formatCurrency(netWorthChange, language, exchangeRates)}
                            </p>
                        </div>
                    </div>
                </div>

                <MonthNavigationBar
                    data={data}
                    onAddPreviousMonth={onAddPreviousMonth}
                    onRemoveLastMonth={onRemoveLastMonth}
                />

                <AvailableFundsPanel
                    data={data}
                    language={language}
                    exchangeRates={exchangeRates}
                    t={t}
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <DataEntryTable
                        type="assets"
                        categories={investmentCategories}
                        title={t('investments.investmentAssets')}
                        updateData={updateData}
                        language={language}
                        exchangeRates={exchangeRates}
                    />
                    <DebtCollaborationTable
                        data={data}
                        updateData={updateData}
                        language={language}
                        exchangeRates={exchangeRates}
                        t={t}
                    />
                </div>
            </div>
        </MonthNavigationProvider>
    );
};
