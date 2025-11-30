import React from 'react';
import { MonthNavigationBar } from '../MonthNavigationBar';
import { ReadOnlyDataTable } from '../ReadOnlyDataTable';
import { MonthNavigationProvider } from '../../contexts/MonthNavigationContext';
import { defaultCategories } from '../../constants';
import { formatCurrency } from '../../utils';

export const NetWorthView = ({ data, stats, onAddPreviousMonth, onRemoveLastMonth, updateData, t, language, exchangeRates }) => {
    return (
        <MonthNavigationProvider data={data}>
            <div className="space-y-6">
                <div className="flex justify-between items-end">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">{t('networth.title')}</h2>
                        <p className="text-slate-500">{t('networth.subtitle')}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-slate-500">{t('networth.totalNetWorth')}</p>
                        <p className="text-2xl font-bold text-emerald-600">{formatCurrency(stats?.netWorth || 0, language, exchangeRates)}</p>
                    </div>
                </div>

                <MonthNavigationBar 
                    data={data} 
                    onAddPreviousMonth={onAddPreviousMonth} 
                    onRemoveLastMonth={onRemoveLastMonth} 
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ReadOnlyDataTable
                        title={t('networth.assets')}
                        type="assets"
                        categories={defaultCategories.assets}
                        language={language}
                        exchangeRates={exchangeRates}
                    />
                    <ReadOnlyDataTable
                        title={t('networth.liabilities')}
                        type="liabilities"
                        categories={defaultCategories.liabilities}
                        language={language}
                        exchangeRates={exchangeRates}
                    />
                </div>
            </div>
        </MonthNavigationProvider>
    );
};

