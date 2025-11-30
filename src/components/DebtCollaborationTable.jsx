import React from 'react';
import { formatCurrency } from '../utils';
import { useMonthNavigation } from '../contexts/MonthNavigationContext';
import { defaultCategories } from '../constants';

export const DebtCollaborationTable = ({ data, updateData, language, exchangeRates, t }) => {
    const { selectedMonth, editMode } = useMonthNavigation();
    const isCurrentMonth = selectedMonth && new Date(selectedMonth.id) >= new Date(new Date().getFullYear(), new Date().getMonth());
    const canEdit = editMode;

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
                <h3 className="font-bold text-slate-700">{t('investments.debtCollaboration')}</h3>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-600">
                        <tr>
                            <th className="px-4 py-3 font-semibold border-b border-r border-slate-200 text-left">Categoría</th>
                            <th className="px-4 py-3 font-semibold border-b border-slate-200 text-right">Valor</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {defaultCategories.liabilities.map(cat => (
                            <tr key={cat} className="hover:bg-blue-50 transition-colors">
                                <td className="px-4 py-3 font-medium text-slate-900 border-r border-slate-200">{cat}</td>
                                <td className="px-0 py-0">
                                    <input
                                        type="number"
                                        value={selectedMonth?.debtCollaboration?.[cat] ?? ''}
                                        placeholder="0"
                                        onChange={(e) => {
                                            if (!canEdit) return;
                                            updateData(selectedMonth.id, 'debtCollaboration', cat, e.target.value);
                                        }}
                                        disabled={!canEdit}
                                        className={`w-full px-4 py-3 text-right border-none outline-none transition-colors ${canEdit
                                            ? 'bg-transparent focus:ring-2 focus:ring-inset focus:ring-blue-500 cursor-text'
                                            : 'bg-slate-100 text-slate-500 cursor-not-allowed'
                                            }`}
                                    />
                                </td>
                            </tr>
                        ))}
                        <tr className="bg-slate-100 font-bold">
                            <td className="px-4 py-3 text-slate-900 border-r border-slate-200">Total</td>
                            <td className="px-4 py-3 text-right text-slate-900">
                                {formatCurrency(Object.values(selectedMonth?.debtCollaboration || {}).reduce((a, b) => a + Number(b), 0), language, exchangeRates)}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};
