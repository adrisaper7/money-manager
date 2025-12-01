import React, { useMemo } from 'react';

export const ConfigInputs = ({
    config,
    setConfig,
    t,
    defaultMonthlyInvestment = 0,
    monthsUsed = 0,
    averageNetIncome = 0
}) => {
    const currentYear = new Date().getFullYear();
    const currencySymbol = '$'; // USD for English
    const monthlyInvestmentValue = defaultMonthlyInvestment ? Math.round(defaultMonthlyInvestment) : 0;
    const annualNetChange = monthlyInvestmentValue ? monthlyInvestmentValue * 12 : 0;
    const investmentRate = config?.investmentRate ?? 0;
    const latestInvestmentRate = config?.investmentRate ?? 0;
    const suggestedInvestment = useMemo(() => {
        if (!averageNetIncome || !latestInvestmentRate) return 0;
        return Math.round((averageNetIncome * latestInvestmentRate) / 100);
    }, [averageNetIncome, latestInvestmentRate]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Investment Target ({currencySymbol})</label>
                <input
                    type="number"
                    value={config.targetInvestment || ''}
                    onChange={(e) => setConfig({ ...config, targetInvestment: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="1000000"
                />
                <p className="text-xs text-slate-400 mt-1">Amount you want to have invested in income-generating assets</p>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Target Year</label>
                <input
                    type="number"
                    value={config.targetYear || ''}
                    onChange={(e) => setConfig({ ...config, targetYear: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={currentYear + 10}
                    min={currentYear}
                />
                <p className="text-xs text-slate-400 mt-1">Year you want to reach this net worth</p>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">% of income you want to invest</label>
                <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={investmentRate}
                    onChange={(e) => {
                        const rate = Math.max(0, Math.min(100, Number(e.target.value)));
                        setConfig({ ...config, investmentRate: rate });
                    }}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="15"
                />
                <p className="text-xs text-slate-400 mt-1">
                    Calculated based on your average net income of the last {monthsUsed || 1} months.
                </p>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Estimated monthly investment ({currencySymbol})</label>
                <input
                    type="number"
                    value={monthlyInvestmentValue}
                    className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-600"
                    readOnly
                    disabled
                />
                <p className="text-xs text-slate-400 mt-1">
                    Equivalent to {investmentRate}% of an average net income of {currencySymbol}{Math.round(averageNetIncome || 0).toLocaleString()} ({monthsUsed || 1} months).
                </p>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Expected Annual Return (%)</label>
                <input
                    type="number"
                    step="0.1"
                    value={config.expectedReturn || ''}
                    onChange={(e) => setConfig({ ...config, expectedReturn: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="7.0"
                />
                <p className="text-xs text-slate-400 mt-1">Expected annual return for projections</p>
            </div>
            <div className="md:col-span-2">
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex flex-col gap-2">
                    <span className="text-xs uppercase tracking-wide text-blue-500 font-semibold">Estimation based on the last {monthsUsed || 1} months</span>
                    <div className="flex flex-wrap items-baseline gap-3">
                        <p className="text-sm text-slate-600">
                            Average net income: <span className="font-semibold text-slate-800">{currencySymbol}{averageNetIncome ? Math.round(averageNetIncome).toLocaleString() : 0}</span>
                        </p>
                        <p className="text-sm text-slate-600">
                            Proposed investment ({latestInvestmentRate}%): <span className="font-semibold text-slate-800">{currencySymbol}{suggestedInvestment.toLocaleString()}</span>
                        </p>
                        <p className="text-sm text-slate-600">
                            Estimated annual savings rate: <span className="font-semibold text-slate-800">{(investmentRate || 0).toFixed(1)}%</span>
                        </p>
                        <p className="text-sm text-slate-600">
                            Estimated annual net change: <span className="font-semibold text-slate-800">{currencySymbol}{annualNetChange.toLocaleString()}</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

