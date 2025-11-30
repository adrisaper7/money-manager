import React from 'react';
import { MonthNavigationBar } from '../MonthNavigationBar';
import { MonthNavigationProvider } from '../../contexts/MonthNavigationContext';
import { DataEntryTable } from '../DataEntryTable';
import { DebtCollaborationTable } from '../DebtCollaborationTable';
import { AvailableFundsPanel } from '../AvailableFundsPanel';
import { formatCurrency } from '../../utils';
import { investmentCategories } from '../../constants';

export const InvestmentView = ({ data, stats, onAddPreviousMonth, onRemoveLastMonth, updateData, t, language, exchangeRates }) => {
    return (
        <MonthNavigationProvider data={data}>
            <div className="space-y-6">
                <div className="flex justify-between items-end">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">{t('investments.title')}</h2>
                        <p className="text-slate-500">{t('investments.subtitle')}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-slate-500">{t('investments.totalInvested')}</p>
                        <p className="text-2xl font-bold text-emerald-600">{formatCurrency(stats?.investmentAssets || 0, language, exchangeRates)}</p>
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
