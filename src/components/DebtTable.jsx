import React, { useMemo } from 'react';
import { DataEntryTable } from './DataEntryTable';
import { TrendingDown, AlertCircle, Info } from 'lucide-react';
import { formatCurrency } from '../utils';

export const DebtTable = ({
    title,
    subtitle,
    type,
    categories,
    updateData,
    exchangeRates,
    historicalData,
    showTrendIcon,
    selectedMonthIndex,
    t,
    secondaryColumn
}) => {
    const debtMetrics = useMemo(() => {
        if (!historicalData || historicalData.length === 0) {
            return { totalDebt: 0, debtReduction: 0, debtToAssetRatio: 0 };
        }

        const currentMonth = historicalData[selectedMonthIndex];
        const previousMonth = selectedMonthIndex > 0 ? historicalData[selectedMonthIndex - 1] : null;

        const totalDebt = Object.values(currentMonth?.liabilities || {}).reduce((a, b) => a + Number(b || 0), 0);
        const totalAssets = Object.values(currentMonth?.assets || {}).reduce((a, b) => a + Number(b || 0), 0);

        let debtReduction = 0;
        
        if (previousMonth) {
            const previousDebt = Object.values(previousMonth?.liabilities || {}).reduce((a, b) => a + Number(b || 0), 0);
            debtReduction = previousDebt - totalDebt;
        }
        // If no previous month, debtReduction stays 0 (no comparison possible)

        const debtToAssetRatio = totalAssets > 0 ? (totalDebt / totalAssets) * 100 : 0;

        return { totalDebt, debtReduction, debtToAssetRatio };
    }, [historicalData, selectedMonthIndex, JSON.stringify(historicalData?.[selectedMonthIndex]?.liabilities), JSON.stringify(historicalData?.[selectedMonthIndex]?.debtCollaboration)]);

    return (
        <div className="space-y-4">
            {/* Debt Metrics Summary Cards */}
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-medium text-red-700">{t('networth.totalDebt')}</p>
                        <AlertCircle size={14} className="text-red-500" />
                    </div>
                    <p className="text-lg font-bold text-red-600">
                        {formatCurrency(debtMetrics.totalDebt, 'en', exchangeRates)}
                    </p>
                </div>

                <div className={`border rounded-lg p-3 ${debtMetrics.debtReduction >= 0
                    ? 'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200'
                    : 'bg-gradient-to-br from-red-50 to-orange-50 border-red-200'
                    }`}>
                    <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-medium text-slate-700">{t('networth.paidDown')}</p>
                        {debtMetrics.debtReduction > 0 && <TrendingDown size={14} className="text-emerald-500" />}
                    </div>
                    <p className={`text-lg font-bold ${debtMetrics.debtReduction >= 0 ? 'text-emerald-600' : 'text-red-600'
                        }`}>
                        {debtMetrics.debtReduction >= 0 ? '+' : ''}{formatCurrency(Math.abs(debtMetrics.debtReduction), 'en', exchangeRates)}
                    </p>
                    {debtMetrics.debtReduction === 0 && historicalData.length <= 1 && (
                        <p className="text-xs text-slate-500 mt-1">Add previous month to see changes</p>
                    )}
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-medium text-blue-700">Debt Ratio</p>
                        <Info size={14} className="text-blue-500" title="Percentage of assets offset by debt" />
                    </div>
                    <p className="text-lg font-bold text-blue-600">
                        {debtMetrics.debtToAssetRatio.toFixed(1)}%
                    </p>
                </div>
            </div>

            {/* Debt Table with Red Theme */}
            <div className="relative">
                <DataEntryTable
                    title={title}
                    subtitle={subtitle}
                    type={type}
                    categories={categories}
                    updateData={updateData}
                    exchangeRates={exchangeRates}
                    historicalData={historicalData}
                    showTrendIcon={showTrendIcon}
                    secondaryColumn={secondaryColumn}
                />
            </div>
        </div>
    );
};
