import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getCategoriesForLanguage } from '../../constants';

const ASSET_COLORS = {
    'Banco': '#8b5cf6',
    'Fondo Emergencia': '#ec4899',
    'Cartera Inversión': '#f59e0b',
    'Fondos Indexados': '#10b981',
    'Planes Pensiones': '#3b82f6',
    'Inmobiliario': '#14b8a6',
    'Cripto': '#ef4444',
    'Bank': '#8b5cf6',
    'Emergency Fund': '#ec4899',
    'Investment Portfolio': '#f59e0b',
    'Index Funds': '#10b981',
    'Pension Plans': '#3b82f6',
    'Real Estate': '#14b8a6',
    'Crypto': '#ef4444'
};

export const AssetAllocationChart = ({ data }) => {
    const categories = getCategoriesForLanguage();
    
    const chartData = data.map(row => {
        const total = Object.values(row.assets || {}).reduce((a, b) => a + Number(b), 0);
        const result = { monthLabel: row.monthLabel };
        if (total > 0) {
            categories.assets.forEach(asset => {
                result[asset] = (Number(row.assets?.[asset] || 0) / total) * 100;
            });
        } else {
            categories.assets.forEach(asset => {
                result[asset] = 0;
            });
        }
        return result;
    });

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4">
                Asset Allocation
            </h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="monthLabel" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} angle={-45} textAnchor="end" height={60} />
                        <YAxis
                            stroke="#94a3b8"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            domain={[0, 100]}
                            tickFormatter={(val) => `${val.toFixed(0)}%`}
                        />
                        <Tooltip formatter={(value) => `${value.toFixed(1)}%`} contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                        <Legend wrapperStyle={{ fontSize: '11px' }} />
                        {categories.assets.map(asset => (
                            <Area key={asset} type="monotone" dataKey={asset} stackId="1" stroke={ASSET_COLORS[asset]} fill={ASSET_COLORS[asset]} />
                        ))}
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

