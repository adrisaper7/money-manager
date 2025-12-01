import React, { useState, useEffect } from 'react';
import { investmentCategories } from '../constants';
import { formatCurrency } from '../utils';

export const MonthlyInvestmentAllocator = ({ data, stats, updateData, language, exchangeRates }) => {
    const current = data && data.length > 0 ? data[data.length - 1] : null;
    const monthId = current?.id;

    const [category, setCategory] = useState(investmentCategories[0] || '');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // Calcular ingresos netos disponibles (ingresos - gastos, sin contar impuestos)
    const grossIncome = Object.values(current?.income || {}).reduce((a, b) => a + Number(b), 0);
    const taxes = Object.values(current?.taxes || {}).reduce((a, b) => a + Number(b), 0);
    const expenses = Object.values(current?.expenses || {}).reduce((a, b) => a + Number(b), 0);
    const netIncome = grossIncome - taxes;
    const availableFunds = netIncome - expenses;

    const handleAllocate = () => {
        setMessage('');
        setError('');

        if (!monthId) {
            setError('No current month available.');
            return;
        }

        if (availableFunds <= 0) {
            setError(`You don't have available funds to assign. Available: ${formatCurrency(availableFunds, 'en', exchangeRates)}`);
            return;
        }

        const currentVal = Number(current.assets?.[category] || 0);
        const newVal = currentVal + availableFunds;

        updateData(monthId, 'assets', category, newVal);
        setMessage(`Assigned ${formatCurrency(availableFunds, 'en', exchangeRates)} to ${category}.`);
    };

    return (
        <div className="bg-white p-4 rounded-lg border border-slate-200">
            <h3 className="font-semibold text-slate-800 mb-4">Assign monthly savings</h3>
            <div className="text-sm text-slate-600 mb-4">Net money this month: <span className="font-mono font-medium text-lg text-slate-800">{formatCurrency(availableFunds, 'en', exchangeRates)}</span></div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
                <div>
                    <label className="block text-xs text-slate-600 mb-1">Investment category</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-2 border border-slate-200 rounded">
                        {investmentCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                <button 
                    onClick={handleAllocate} 
                    disabled={availableFunds <= 0}
                    className={`w-full p-2 rounded font-medium transition-colors ${
                        availableFunds <= 0 
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                >
                    Asignar
                </button>
            </div>

            {error && <p className="mt-3 text-sm text-red-600 font-medium">{error}</p>}
            {message && <p className="mt-3 text-sm text-green-600 font-medium">{message}</p>}
        </div>
    );
};
