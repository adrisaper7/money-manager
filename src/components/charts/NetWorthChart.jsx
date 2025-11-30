import React from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../utils';
import { defaultCategories } from '../../constants';

const ASSET_COLORS = {
    'Banco': '#8b5cf6',
    'Fondo Emergencia': '#ec4899',
    'Cartera Inversión': '#f59e0b',
    'Fondos Indexados': '#10b981',
    'Planes Pensiones': '#3b82f6',
    'Inmobiliario': '#14b8a6',
    'Cripto': '#ef4444'
};

export const NetWorthChart = ({ data, language = 'es', exchangeRates = {} }) => {
    const chartData = data.map(row => {
        const result = { monthLabel: row.monthLabel };
        defaultCategories.assets.forEach(asset => {
            result[asset] = Number(row.assets?.[asset] || 0);
        });
        const totalAssets = defaultCategories.assets.reduce((sum, asset) => sum + Number(row.assets?.[asset] || 0), 0);
        const totalLiabilities = Object.values(row.liabilities || {}).reduce((a, b) => a + Number(b), 0);
        result.netWorth = totalAssets - totalLiabilities;
        return result;
    });

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Net Worth</h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="monthLabel" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} angle={-45} textAnchor="end" height={60} />
                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val / 1000}k€`} />
                        <Tooltip formatter={(value) => formatCurrency(value, language, exchangeRates)} contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                        <Legend wrapperStyle={{ fontSize: '11px' }} />
                        {defaultCategories.assets.map(asset => (
                            <Bar key={asset} dataKey={asset} stackId="a" fill={ASSET_COLORS[asset]} />
                        ))}
                        <Line
                            type="monotone"
                            dataKey="netWorth"
                            name="Patrimonio Neto"
                            stroke="#64748b"
                            strokeWidth={2}
                            strokeDasharray="3 3"
                            dot={{ fill: '#64748b', r: 2 }}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

