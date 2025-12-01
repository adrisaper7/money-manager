import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatCurrency } from '../../utils';

const COLORS = [
    '#3b82f6', // blue
    '#10b981', // emerald
    '#f59e0b', // amber
    '#ef4444', // red
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#06b6d4', // cyan
];

export const AssetLiabilityChart = ({ data, type, categories, title, language, exchangeRates }) => {
    const chartData = useMemo(() => {
        if (!data || data.length === 0) return [];

        return data.map(month => {
            const dataPoint = {
                monthLabel: month.monthLabel,
            };

            categories.forEach(category => {
                dataPoint[category] = Number(month[type]?.[category] || 0);
            });

            return dataPoint;
        });
    }, [data, type, categories]);

    if (chartData.length === 0) return null;

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4">{title}</h3>
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="monthLabel"
                            stroke="#94a3b8"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#94a3b8"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(val) => formatCurrency(val, 'en', exchangeRates).replace(/\D00(?=\D*$)/, '')}
                        />
                        <Tooltip
                            formatter={(value) => formatCurrency(value, 'en', exchangeRates)}
                            contentStyle={{
                                backgroundColor: '#fff',
                                borderRadius: '8px',
                                border: '1px solid #e2e8f0',
                                fontSize: '12px'
                            }}
                        />
                        <Legend
                            wrapperStyle={{ fontSize: '12px' }}
                            iconType="line"
                        />
                        {categories.map((category, index) => (
                            <Line
                                key={category}
                                type="monotone"
                                dataKey={category}
                                stroke={COLORS[index % COLORS.length]}
                                strokeWidth={2}
                                dot={false}
                                activeDot={false}
                                name={category}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
