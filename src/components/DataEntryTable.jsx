import React, { useMemo, useState } from 'react';
import { LineChart as LineChartIcon } from 'lucide-react';
import { formatCurrency, generateMonthId } from '../utils';
import { useMonthNavigation } from '../contexts/MonthNavigationContext';
import { CategoryTrendModal } from './charts/CategoryTrendModal';
import { OptimizedNumberInput } from './OptimizedNumberInput';

export const DataEntryTable = ({
    type,
    categories,
    title,
    updateData,
    language,
    exchangeRates,
    historicalData = [],
    showTrendIcon = false,
    secondaryColumn = null
}) => {
    const { selectedMonth, editMode, selectedMonthIndex, totalMonths } = useMonthNavigation();
    const currentMonthId = generateMonthId(new Date());
    const isCurrentMonth = selectedMonth?.id === currentMonthId;
    const isLastMonth = selectedMonthIndex === totalMonths - 1;

    // Permitir edición si:
    // 1. Es el último mes (mes actual) - SIEMPRE editable
    // 2. El modo edición está activado manualmente - para cualquier otro caso
    const canEdit = isLastMonth || editMode;
    const [selectedCategory, setSelectedCategory] = useState(null);
    const enableTrend = showTrendIcon && historicalData.length > 0;

    const trendSeries = useMemo(() => {
        if (!selectedCategory || !enableTrend) return [];

        return historicalData.map(month => ({
            monthLabel: month.monthLabel,
            value: Number(month?.[type]?.[selectedCategory] || 0)
        }));
    }, [selectedCategory, enableTrend, historicalData, type]);

    const secondaryValues = useMemo(() => {
        if (!secondaryColumn || !selectedMonth) return {};
        return categories.reduce((acc, category) => {
            const rawValue = secondaryColumn.getValue
                ? secondaryColumn.getValue(selectedMonth, category)
                : 0;
            acc[category] = Number(rawValue) || 0;
            return acc;
        }, {});
    }, [secondaryColumn, selectedMonth, categories]);

    const secondaryTotal = useMemo(() => {
        if (!secondaryColumn) return 0;
        return Object.values(secondaryValues).reduce((sum, value) => sum + Number(value || 0), 0);
    }, [secondaryColumn, secondaryValues]);

    const formatSecondaryValue = (value) => {
        if (!secondaryColumn) return '';
        if (secondaryColumn.formatValue) return secondaryColumn.formatValue(value);
        return formatCurrency(value, 'en', exchangeRates);
    };

    const hasSecondaryColumn = Boolean(secondaryColumn);

    const handleSecondaryChange = (category, value) => {
        if (!secondaryColumn) return;

        if (secondaryColumn.onChange) {
            secondaryColumn.onChange(selectedMonth.id, category, value);
            return;
        }

        const targetType = secondaryColumn.type || type;
        updateData(selectedMonth.id, targetType, category, value);
    };

    if (!selectedMonth) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden p-8 text-center">
                <p className="text-slate-500">No hay datos para mostrar.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
                <h3 className="font-bold text-slate-700">{title}</h3>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-600">
                        <tr>
                            <th className="px-4 py-3 font-semibold border-b border-r border-slate-200 text-left">Category</th>
                            <th className="px-4 py-3 font-semibold border-b border-slate-200 text-right">Value</th>
                            {hasSecondaryColumn && (
                                <th className="px-4 py-3 font-semibold border-b border-slate-200 text-right">
                                    {secondaryColumn.header}
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {categories.map(cat => (
                            <tr key={cat} className="hover:bg-blue-50 transition-colors">
                                <td className="px-4 py-3 font-medium text-slate-900 border-r border-slate-200">
                                    <div className="flex items-center justify-between gap-2">
                                        <span>{cat}</span>
                                        {enableTrend && (
                                            <button
                                                type="button"
                                                onClick={() => setSelectedCategory(cat)}
                                                className="p-1 rounded-full text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                                                aria-label={`Ver gráfico de ${cat}`}
                                            >
                                                <LineChartIcon size={16} />
                                            </button>
                                        )}
                                    </div>
                                </td>
                                <td className="px-0 py-0">
                                    <OptimizedNumberInput
                                        value={selectedMonth?.[type]?.[cat]}
                                        onChange={(value) => updateData(selectedMonth.id, type, cat, value)}
                                        placeholder="0"
                                        disabled={!canEdit}
                                        className={`w-full px-4 py-3 text-right border-none outline-none transition-colors ${canEdit
                                            ? 'bg-transparent focus:ring-2 focus:ring-inset focus:ring-blue-500 cursor-text'
                                            : 'bg-slate-100 text-slate-500 cursor-not-allowed'
                                            }`}
                                    />
                                </td>
                                {hasSecondaryColumn && (
                                    <td className="px-4 py-3 text-right text-slate-600">
                                        {secondaryColumn.editable ? (
                                            <input
                                                type="number"
                                                value={secondaryValues[cat] ?? ''}
                                                placeholder={secondaryColumn.placeholder || '0'}
                                                onChange={(e) => {
                                                    if (!canEdit) return;
                                                    handleSecondaryChange(cat, e.target.value);
                                                }}
                                                disabled={!canEdit}
                                                className={`w-full px-4 py-3 text-right border-none outline-none transition-colors ${canEdit
                                                    ? 'bg-transparent focus:ring-2 focus:ring-inset focus:ring-blue-500 cursor-text'
                                                    : 'bg-slate-100 text-slate-500 cursor-not-allowed'
                                                    }`}
                                            />
                                        ) : (
                                            formatSecondaryValue(secondaryValues[cat] || 0)
                                        )}
                                    </td>
                                )}
                            </tr>
                        ))}
                        <tr className="bg-slate-100 font-bold">
                            <td className="px-4 py-3 text-slate-900 border-r border-slate-200">Total</td>
                            <td className="px-4 py-3 text-right text-slate-900">
                                {formatCurrency(Object.values(selectedMonth?.[type] || {}).reduce((a, b) => a + Number(b), 0), 'en', exchangeRates)}
                            </td>
                            {hasSecondaryColumn && (
                                <td className="px-4 py-3 text-right text-slate-900">
                                    {formatSecondaryValue(secondaryTotal)}
                                </td>
                            )}
                        </tr>
                    </tbody>
                </table>
            </div>

            <CategoryTrendModal
                isOpen={Boolean(selectedCategory)}
                onClose={() => setSelectedCategory(null)}
                title={selectedCategory ? `${selectedCategory} - ${title}` : ''}
                data={trendSeries}
                language={language}
                exchangeRates={exchangeRates}
            />
        </div>
    );
};
