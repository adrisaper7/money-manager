import React, { useMemo } from 'react';
import { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { investmentCategories } from '../../constants';
import { formatCurrency, calculatePercentageBasedInvestment } from '../../utils';

export const FireProjectionChart = ({ data, config, language, exchangeRates }) => {
    const projection = useMemo(() => {
        if (!data || data.length === 0) return null;

        const currentMonth = data[data.length - 1];

        // 1. Current Invested Assets
        const currentInvestedAssets = Object.entries(currentMonth.assets || {}).reduce((acc, [key, val]) => {
            if (investmentCategories.includes(key)) return acc + Number(val || 0);
            return acc;
        }, 0) + Object.values(currentMonth.debtCollaboration || {}).reduce((a, b) => a + Number(b), 0);

        // 2. Monthly Investment Amount (percentage-based, fallback to historical average)
        const { monthlyInvestment: rateBasedInvestment } = calculatePercentageBasedInvestment({
            data,
            investmentRate: config?.investmentRate ?? 0,
            monthsWindow: 6
        });

        let monthlyInvestment = rateBasedInvestment;

        if ((!config?.investmentRate || config.investmentRate === 0) && !monthlyInvestment) {
            const MONTHS_IN_FIVE_YEARS = 60;
            const monthsToAvg = Math.min(data.length, MONTHS_IN_FIVE_YEARS);
            const recentData = data.slice(-monthsToAvg);

            monthlyInvestment = recentData.reduce((acc, month) => {
                const grossIncome = Object.values(month.income || {}).reduce((a, b) => a + Number(b), 0);
                const taxes = Object.values(month.taxes || {}).reduce((a, b) => a + Number(b), 0);
                const expenses = Object.values(month.expenses || {}).reduce((a, b) => a + Number(b), 0);
                const netIncome = grossIncome - taxes;
                const monthlySavings = netIncome - expenses;
                return acc + monthlySavings;
            }, 0) / (monthsToAvg || 1);
        }

        // 3. Config parameters
        const targetAmount = Number(config?.targetInvestment || 0);
        const expectedReturnRate = Number(config?.expectedReturn || 7) / 100;
        const currentYear = new Date().getFullYear();

        // 4. Generate Projection
        const projectionData = [];
        let accumulatedAmount = currentInvestedAssets;
        let year = currentYear;
        let reached = false;
        let reachedYear = null;

        // Add current state
        projectionData.push({
            year: year,
            amount: accumulatedAmount,
            target: targetAmount
        });

        // Project for up to 50 years
        while (year < currentYear + 50) {
            year++;
            // Simple compound interest: (Principal * (1+r)) + (MonthlyContribution * 12)
            accumulatedAmount = (accumulatedAmount * (1 + expectedReturnRate)) + (monthlyInvestment * 12);

            projectionData.push({
                year: year,
                amount: accumulatedAmount,
                target: targetAmount
            });

            if (!reached && accumulatedAmount >= targetAmount) {
                reached = true;
                reachedYear = year;
                // Continue a bit more to show the crossover
                if (projectionData.length > 10 && accumulatedAmount > targetAmount * 1.5) break;
            }
        }

        return {
            data: projectionData,
            reachedYear,
            avgSavings: monthlyInvestment,
            targetAmount
        };
    }, [data, config]);

    if (!projection) return null;

    const { data: chartData, reachedYear, avgSavings, targetAmount } = projection;

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-800">Proyección de Patrimonio</h3>
                <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-600">
                    <div className="bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                        <span className="block text-xs text-slate-400">Inversión Mensual</span>
                        <span className="font-semibold text-slate-700">{formatCurrency(avgSavings, language, exchangeRates)}</span>
                    </div>
                    <div className="bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                        <span className="block text-xs text-slate-400">Meta</span>
                        <span className="font-semibold text-slate-700">{formatCurrency(targetAmount, language, exchangeRates)}</span>
                    </div>
                    {reachedYear ? (
                        <div className="bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">
                            <span className="block text-xs text-emerald-600">Año Estimado</span>
                            <span className="font-bold text-emerald-700">{reachedYear} ({reachedYear - new Date().getFullYear()} años)</span>
                        </div>
                    ) : (
                        <div className="bg-amber-50 px-3 py-1 rounded-lg border border-amber-100">
                            <span className="block text-xs text-amber-600">Proyección</span>
                            <span className="font-bold text-amber-700">&gt; 50 años</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="year"
                            stroke="#94a3b8"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            type="number"
                            domain={['dataMin', 'dataMax']}
                            tickCount={10}
                        />
                        <YAxis
                            stroke="#94a3b8"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(val) => formatCurrency(val, language, exchangeRates).replace(/\D00(?=\D*$)/, '')} // Simplify large numbers
                        />
                        <Tooltip
                            formatter={(value) => formatCurrency(value, language, exchangeRates)}
                            labelFormatter={(label) => `Año ${label}`}
                            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="amount"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorAmount)"
                            name="Patrimonio Proyectado"
                        />
                        <Line
                            type="monotone"
                            dataKey="target"
                            stroke="#ef4444"
                            strokeDasharray="5 5"
                            strokeWidth={2}
                            dot={false}
                            name="Objetivo"
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
