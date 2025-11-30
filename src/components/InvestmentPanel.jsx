import React from 'react';
import { investmentCategories } from '../constants';
import { formatCurrency } from '../utils';
import { MonthlyInvestmentAllocator } from './MonthlyInvestmentAllocator';

export const InvestmentPanel = ({ data, stats, updateData, language, exchangeRates }) => {
    const current = data && data.length > 0 ? data[data.length - 1] : null;

    const rows = investmentCategories.map(cat => ({
        category: cat,
        value: Number(current?.assets?.[cat] || 0)
    }));

    const total = rows.reduce((acc, r) => acc + r.value, 0);

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Activos - Inversión</h3>

            <div className="overflow-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left text-slate-600">
                            <th className="pb-2">Categoría</th>
                            <th className="pb-2 text-right">Valor</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map(r => (
                            <tr key={r.category} className="border-t border-slate-100">
                                <td className="py-3">{r.category}</td>
                                <td className="py-3 text-right font-mono">{formatCurrency(r.value, language, exchangeRates)}</td>
                            </tr>
                        ))}
                        <tr className="border-t border-slate-200 font-semibold">
                            <td className="py-3">Total</td>
                            <td className="py-3 text-right font-mono">{formatCurrency(total, language, exchangeRates)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="mt-4">
                <MonthlyInvestmentAllocator data={data} stats={stats} updateData={updateData} language={language} exchangeRates={exchangeRates} />
            </div>
        </div>
    );
};
