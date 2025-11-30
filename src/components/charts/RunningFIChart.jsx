import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { investmentCategories } from '../../constants';

export const RunningFIChart = ({ data, config }) => {
    const targetInvestment = config?.targetInvestment || 0;

    const chartData = data.map(row => {
        // calcular solo activos de inversión por fila
        const investmentAssets = Object.entries(row.assets || {}).reduce((acc, [key, val]) => {
            if (investmentCategories.includes(key)) return acc + Number(val || 0);
            return acc;
        }, 0);

        const progress = targetInvestment > 0 ? (investmentAssets / targetInvestment) * 100 : 0;

        return {
            monthLabel: row.monthLabel,
            progress: Math.min(Math.max(progress, 0), 100) || 0
        };
    });

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Progreso hacia Objetivo de Inversión</h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorFI" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="monthLabel" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} domain={[0, 100]} />
                        <Tooltip formatter={(value) => `${value.toFixed(1)}%`} contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                        <Area
                            type="monotone"
                            dataKey="progress"
                            stroke="#10b981"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorFI)"
                            name="Progreso"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

