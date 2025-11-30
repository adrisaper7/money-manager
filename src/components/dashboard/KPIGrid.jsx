import React from 'react';
import { Wallet, Target, Activity, TrendingUp } from 'lucide-react';
import { KPICard } from '../KPICard';
import { formatCurrency, formatPercent } from '../../utils';

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
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
};

export const KPIGrid = ({ stats, t, language, exchangeRates }) => {
    const baselineLabel = stats?.yearComparisons?.baselineLabel;
    const labelText = baselineLabel ? baselineLabel : t('dashboard.startOfYear') || 'inicio de año';

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
                title={t('navigation.networth')}
                value={formatCurrency(stats?.netWorth || 0, language, exchangeRates)}
                subtext={`${t('networth.assets')}: ${formatCurrency(stats?.totalAssets || 0, language, exchangeRates)} | ${t('networth.liabilities')}: ${formatCurrency(stats?.totalLiabilities || 0, language, exchangeRates)}`}
                icon={Wallet}
                color="emerald"
                trend={buildTrend(
                    stats?.yearComparisons?.netWorth,
                    (value) => `${value >= 0 ? '+' : ''}${formatCurrency(Math.abs(value), language, exchangeRates)}`,
                    (value) => formatPercentText(value),
                    labelText
                )}
            />
            <KPICard
                title="Patrimonio Objetivo"
                value={formatCurrency(stats?.fiNumber || 0, language, exchangeRates)}
                subtext={`${(stats?.progress || 0).toFixed(1)}% Completado`}
                icon={Target}
                color="indigo"
                trend={buildTrend(
                    stats?.yearComparisons?.assets,
                    (value) => `${value >= 0 ? '+' : ''}${formatCurrency(Math.abs(value), language, exchangeRates)}`,
                    (value) => formatPercentText(value),
                    labelText
                )}
            />
            <KPICard
                title="Gasto Anual Est."
                value={formatCurrency(stats?.yearlySpend || 0, language, exchangeRates)}
                subtext="Basado en media de gastos"
                icon={Activity}
                color="amber"
                trend={buildTrend(
                    stats?.yearComparisons?.yearlySpend,
                    (value) => `${value >= 0 ? '+' : ''}${formatCurrency(Math.abs(value), language, exchangeRates)}`,
                    (value) => formatPercentText(value),
                    labelText
                )}
            />
            <KPICard
                title="Tasa de Ahorro"
                value={formatPercent(stats?.savingsRate || 0, language)}
                subtext={`Ahorro mes: ${formatCurrency(stats?.savings || 0, language, exchangeRates)}`}
                icon={TrendingUp}
                color="blue"
                trend={buildTrend(
                    stats?.yearComparisons?.savingsRate,
                    (value) => `${value >= 0 ? '+' : ''}${value.toFixed(1)} pts`,
                    (value) => formatPercentText(value),
                    labelText
                )}
            />
        </div>
    );
};

