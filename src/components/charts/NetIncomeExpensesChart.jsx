import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../utils';

export const NetIncomeExpensesChart = ({ data, language = 'es', exchangeRates = {} }) => {
    const chartData = data.map(row => {
        const gross = Object.values(row.income || {}).reduce((a, b) => a + Number(b), 0);
        const taxes = Object.values(row.taxes || {}).reduce((a, b) => a + Number(b), 0);
        const expenses = Object.values(row.expenses || {}).reduce((a, b) => a + Number(b), 0);
        const netIncome = gross - taxes;

        return {
            monthLabel: row.monthLabel,
            netIncome,
            expenses
        };
    });

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Net Income vs Expenses</h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="monthLabel" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} angle={-45} textAnchor="end" height={60} />
                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val / 1000}k€`} />
                        <Tooltip formatter={(value) => formatCurrency(value, language, exchangeRates)} contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                        <Legend />
                        <Bar
                            dataKey="netIncome"
                            name="Ingreso Neto"
                            fill="#6366f1"
                        />
                        <Bar
                            dataKey="expenses"
                            name="Gastos"
                            fill="#f43f5e"
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

