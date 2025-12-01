import React from 'react';
import { MonthNavigationBar } from '../MonthNavigationBar';
import { DataEntryTable } from '../DataEntryTable';
import { MonthNavigationProvider } from '../../contexts/MonthNavigationContext';
import { getCategoriesForLanguage } from '../../constants';
import { formatPercent, calculateCategoryAverages, formatCurrency } from '../../utils';
import { useCurrency } from '../../hooks/useCurrency';

export const BudgetView = ({ data, stats, onAddPreviousMonth, onRemoveLastMonth, updateData, t, exchangeRates }) => {
    const categories = getCategoriesForLanguage();
    const { currency } = useCurrency(); // Track currency changes
    
    // Calculate averages for each category type
    const incomeAverages = calculateCategoryAverages(data, 'income', categories.income);
    const taxesAverages = calculateCategoryAverages(data, 'taxes', categories.taxes);
    const expensesAverages = calculateCategoryAverages(data, 'expenses', categories.expenses);
    
    // Create secondary column configuration for averages
    const createAveragesColumn = (type, averages) => ({
        header: 'Average',
        getValue: (selectedMonth, category) => {
            return averages[category] || 0;
        },
        formatValue: (value) => {
            const formattedValue = formatCurrency(value, 'en', exchangeRates);
            return `(${formattedValue})`;
        },
        editable: false
    });
    
    return (
        <MonthNavigationProvider data={data}>
            <div className="space-y-6">
                <div className="flex justify-between items-end">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">{t('budget.title')}</h2>
                        <p className="text-slate-500">{t('budget.subtitle')}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-slate-500">{t('budget.savingsRate')}</p>
                        <p className="text-2xl font-bold text-blue-600">{formatPercent(stats?.savingsRate || 0, 'en')}</p>
                    </div>
                </div>

                <MonthNavigationBar 
                    data={data} 
                    onAddPreviousMonth={onAddPreviousMonth} 
                    onRemoveLastMonth={onRemoveLastMonth} 
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <DataEntryTable
                        title={t('budget.income')}
                        type="income"
                        categories={categories.income}
                        updateData={updateData}
                        exchangeRates={exchangeRates}
                        historicalData={data}
                        secondaryColumn={createAveragesColumn('income', incomeAverages)}
                        showTrendIcon={true}
                    />
                    <DataEntryTable
                        title={t('budget.taxes')}
                        type="taxes"
                        categories={categories.taxes}
                        updateData={updateData}
                        exchangeRates={exchangeRates}
                        historicalData={data}
                        secondaryColumn={createAveragesColumn('taxes', taxesAverages)}
                        showTrendIcon={true}
                    />
                    <DataEntryTable
                        title={t('budget.expenses')}
                        type="expenses"
                        categories={categories.expenses}
                        updateData={updateData}
                        exchangeRates={exchangeRates}
                        historicalData={data}
                        secondaryColumn={createAveragesColumn('expenses', expensesAverages)}
                        showTrendIcon={true}
                    />
                </div>
            </div>
        </MonthNavigationProvider>
    );
};

