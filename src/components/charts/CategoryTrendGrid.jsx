import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { formatCurrency } from '../../utils';

const DEFAULT_MAX_POINTS = 12;

export const CategoryTrendGrid = ({
    data = [],
    type,
    categories = [],
    title,
    language,
    exchangeRates,
    maxPoints = DEFAULT_MAX_POINTS
}) => {
    const categorySeries = useMemo(() => {
        if (!data.length || !categories.length || !type) return {};

        const recentData = typeof maxPoints === 'number'
            ? data.slice(-maxPoints)
            : data;

        return categories.reduce((acc, category) => {
            acc[category] = recentData.map(month => ({
                monthLabel: month.monthLabel,
                value: Number(month[type]?.[category] || 0),
            }));
            return acc;
        }, {});
    }, [data, type, categories, maxPoints]);

    const hasSeries = Object.keys(categorySeries).length > 0;
    if (!hasSeries) return null;

    return (
        <div className="space-y-3">
            {title && <h3 className="text-lg font-bold text-slate-800">{title}</h3>}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 overflow-x-auto">
                {categories.map(category => {
                    const trend = categorySeries[category] || [];
                    const latestValue = trend.length ? trend[trend.length - 1].value : 0;

                    return (
                        <div key={category} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex items-baseline justify-between mb-3">
                                <span className="font-semibold text-slate-700">{category}</span>
                                <span className="text-sm text-slate-500">
                                    {formatCurrency(latestValue, 'en', exchangeRates)}
                                </span>
                            </div>
                            <div className="h-28">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={trend} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                        <XAxis dataKey="monthLabel" hide />
                                        <YAxis hide domain={[0, 'auto']} />
                                        <Tooltip
                                            formatter={(value) => formatCurrency(value, 'en', exchangeRates)}
                                            labelFormatter={(label) => label}
                                            contentStyle={{
                                                backgroundColor: '#fff',
                                                borderRadius: '8px',
                                                border: '1px solid #e2e8f0',
                                                fontSize: '12px'
                                            }}
                                        />
                                        <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={18} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
