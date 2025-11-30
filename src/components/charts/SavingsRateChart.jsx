import React from 'react';
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const SavingsRateChart = ({ data }) => {
    const chartData = data.map(row => {
        const gross = Object.values(row.income || {}).reduce((a, b) => a + Number(b), 0);
        const taxes = Object.values(row.taxes || {}).reduce((a, b) => a + Number(b), 0);
        const expenses = Object.values(row.expenses || {}).reduce((a, b) => a + Number(b), 0);
        const netIncome = gross - taxes;
        const savings = netIncome - expenses;
        const rate = netIncome > 0 ? (savings / netIncome) * 100 : 0;

        return {
            monthLabel: row.monthLabel,
            savingsRate: rate,
            goal: 30
        };
    });

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Savings Rate</h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="monthLabel" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} angle={-45} textAnchor="end" height={60} />
                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} domain={[0, 60]} />
                        <Tooltip formatter={(value) => `${value.toFixed(1)}%`} contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                        <Legend />
                        <Line type="monotone" dataKey="goal" name="Meta" stroke="#94a3b8" strokeDasharray="5 5" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="savingsRate" name="Tasa Ahorro" stroke="#10b981" strokeWidth={3} />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

