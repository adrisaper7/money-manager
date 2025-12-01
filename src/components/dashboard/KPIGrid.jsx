import React from 'react';
import { Wallet, Target, Activity, TrendingUp } from 'lucide-react';
import { KPICard } from '../KPICard';
import { formatCurrency, formatPercent, formatNumberWithComma } from '../../utils';

const buildTrend = (comparison, formatter, percentFormatter, label) => {
    if (!comparison) return null;
    const differenceText = formatter(comparison.difference);
    const percentText = comparison.percent != null ? percentFormatter(comparison.percent) : null;

    return {
        text: differenceText,
        percentText,
        positive: comparison.difference >= 0,
        label
    };
};

const formatPercentText = (value) => {
    return `${value >= 0 ? '+' : ''}${formatNumberWithComma(value, 1, 1)}%`;
};

export const KPIGrid = ({ stats, t, exchangeRates }) => {
    const baselineLabel = stats?.yearComparisons?.baselineLabel;
    const labelText = baselineLabel ? baselineLabel : t('dashboard.startOfYear') || 'Start of Year';

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
                title={t('navigation.networth')}
                value={formatCurrency(stats?.netWorth || 0, 'en', exchangeRates)}
                subtext={`${t('networth.assets')}: ${formatCurrency(stats?.totalAssets || 0, 'en', exchangeRates)} | ${t('networth.liabilities')}: ${formatCurrency(stats?.totalLiabilities || 0, 'en', exchangeRates)}`}
                icon={Wallet}
                color="emerald"
                trend={buildTrend(
                    stats?.yearComparisons?.netWorth,
                    (value) => `${value >= 0 ? '+' : ''}${formatCurrency(Math.abs(value), 'en', exchangeRates)}`,
                    (value) => formatPercentText(value),
                    labelText
                )}
            />
            <KPICard
                title="Target Net Worth"
                value={formatCurrency(stats?.fiNumber || 0, 'en', exchangeRates)}
                subtext={`${formatNumberWithComma(stats?.progress || 0, 1, 1)}% Completed`}
                icon={Target}
                color="indigo"
                trend={buildTrend(
                    stats?.yearComparisons?.assets,
                    (value) => `${value >= 0 ? '+' : ''}${formatCurrency(Math.abs(value), 'en', exchangeRates)}`,
                    (value) => formatPercentText(value),
                    labelText
                )}
            />
            <KPICard
                title="Estimated Annual Spending"
                value={formatCurrency(stats?.yearlySpend || 0, 'en', exchangeRates)}
                subtext="Based on average expenses"
                icon={Activity}
                color="amber"
                trend={buildTrend(
                    stats?.yearComparisons?.yearlySpend,
                    (value) => `${value >= 0 ? '+' : ''}${formatCurrency(Math.abs(value), 'en', exchangeRates)}`,
                    (value) => formatPercentText(value),
                    labelText
                )}
            />
            <KPICard
                title="Savings Rate"
                value={formatPercent(stats?.savingsRate || 0, 'en')}
                subtext={`Monthly Savings: ${formatCurrency(stats?.savings || 0, 'en', exchangeRates)}`}
                icon={TrendingUp}
                color="blue"
                trend={buildTrend(
                    stats?.yearComparisons?.savingsRate,
                    (value) => `${value >= 0 ? '+' : ''}${formatNumberWithComma(value, 1, 1)} pts`,
                    (value) => formatPercentText(value),
                    labelText
                )}
            />
        </div>
    );
};

