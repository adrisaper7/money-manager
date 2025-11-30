import React from 'react';
import { Wallet, Target, Activity, TrendingUp } from 'lucide-react';
import { KPICard } from '../KPICard';
import { formatCurrency, formatPercent } from '../../utils';

export const KPIGrid = ({ stats, t, language, exchangeRates }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
            title={t('navigation.networth')}
            value={formatCurrency(stats?.netWorth || 0, language, exchangeRates)}
            subtext={`${t('networth.assets')}: ${formatCurrency(stats?.totalAssets || 0, language, exchangeRates)} | ${t('networth.liabilities')}: ${formatCurrency(stats?.totalLiabilities || 0, language, exchangeRates)}`}
            icon={Wallet}
            color="emerald"
        />
        <KPICard
            title="Patrimonio Objetivo"
            value={formatCurrency(stats?.fiNumber || 0, language, exchangeRates)}
            subtext={`${(stats?.progress || 0).toFixed(1)}% Completado`}
            icon={Target}
            color="indigo"
        />
        <KPICard
            title="Gasto Anual Est."
            value={formatCurrency(stats?.yearlySpend || 0, language, exchangeRates)}
            subtext="Basado en media de gastos"
            icon={Activity}
            color="amber"
        />
        <KPICard
            title="Tasa de Ahorro"
            value={formatPercent(stats?.savingsRate || 0, language)}
            subtext={`Ahorro mes: ${formatCurrency(stats?.savings || 0, language, exchangeRates)}`}
            icon={TrendingUp}
            color="blue"
        />
    </div>
);

