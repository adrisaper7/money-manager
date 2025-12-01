import React, { useMemo } from 'react';
import { MonthNavigationBar } from '../MonthNavigationBar';
import { DataEntryTable } from '../DataEntryTable';
import { MonthNavigationProvider, useMonthNavigation } from '../../contexts/MonthNavigationContext';
import { getCategoriesForLanguage } from '../../constants';
import { formatPercent, calculateCategoryAverages, formatCurrency } from '../../utils';
import { useCurrency } from '../../hooks/useCurrency';

export const BudgetView = ({ data, stats, onAddPreviousMonth, onRemoveLastMonth, updateData, t, exchangeRates }) => (
    <MonthNavigationProvider data={data}>
        <BudgetContent
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

const BudgetContent = ({ data, stats, onAddPreviousMonth, onRemoveLastMonth, updateData, t, exchangeRates }) => {
    const { selectedMonthIndex, selectedMonth } = useMonthNavigation();
    const categories = getCategoriesForLanguage();
    const { currency } = useCurrency(); // Track currency changes
    
    console.log('🔥 BudgetContent render - selectedMonthIndex:', selectedMonthIndex, 'total months:', data.length);
    console.log('🔥 All months:', data.map(m => m.monthLabel));
    
    // Calculate monthly profit for selected month
    const calculateMonthlyProfit = (month) => {
        if (!month) return 0;
        console.log('🔍 Calculating profit for month:', month.monthLabel);
        console.log('📊 Income:', month.income);
        console.log('💰 Taxes:', month.taxes);
        console.log('💸 Expenses:', month.expenses);
        
        const grossIncome = Object.values(month.income || {}).reduce((a, b) => a + Number(b || 0), 0);
        const taxes = Object.values(month.taxes || {}).reduce((a, b) => a + Number(b || 0), 0);
        const expenses = Object.values(month.expenses || {}).reduce((a, b) => a + Number(b || 0), 0);
        const netIncome = grossIncome - taxes;
        const savings = netIncome - expenses;
        
        console.log('💵 Gross Income:', grossIncome);
        console.log('🧾 Net Income:', netIncome);
        console.log('🏦 Savings (profit):', savings);
        
        return savings;
    };

    const monthlyProfit = useMemo(() => calculateMonthlyProfit(selectedMonth), [selectedMonth]);
    
    // Calculate yearly profit from last 12 months or available months
    const calculateYearlyProfit = () => {
        if (!data || data.length === 0) return 0;
        
        const monthsToSum = Math.min(data.length, 12);
        const recentData = data.slice(-monthsToSum);
        
        let totalYearlyProfit = 0;
        for (const month of recentData) {
            const grossIncome = Object.values(month.income || {}).reduce((a, b) => a + Number(b || 0), 0);
            const taxes = Object.values(month.taxes || {}).reduce((a, b) => a + Number(b || 0), 0);
            const expenses = Object.values(month.expenses || {}).reduce((a, b) => a + Number(b || 0), 0);
            const netIncome = grossIncome - taxes;
            const savings = netIncome - expenses;
            totalYearlyProfit += savings;
        }
        
        return totalYearlyProfit;
    };
    
    const yearlyProfit = calculateYearlyProfit();
    
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
            <div className="space-y-6">
                <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">{t('budget.title')}</h2>
                    <p className="text-slate-500">{t('budget.subtitle')}</p>
                </div>
                <div className="flex gap-6">
                    <div className="text-right">
                        <p className="text-sm text-slate-500">{t('budget.savingsRate')}</p>
                        <p className="text-2xl font-bold text-blue-600">{formatPercent(stats?.savingsRate || 0, 'en')}</p>
                    </div>
                    <div className="text-right border-l border-slate-300 pl-6">
                        <p className="text-sm text-slate-500">Monthly Profit</p>
                        <p className="text-2xl font-bold text-green-600">{formatCurrency(monthlyProfit, 'en', exchangeRates)}</p>
                    </div>
                    <div className="text-right border-l border-slate-300 pl-6">
                        <p className="text-sm text-slate-500">Yearly Profit</p>
                        <p className="text-2xl font-bold text-green-700">{formatCurrency(yearlyProfit, 'en', exchangeRates)}</p>
                    </div>
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
    );
};

