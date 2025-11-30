import React from 'react';
import { NetWorthChart } from '../charts/NetWorthChart';
import { AssetAllocationChart } from '../charts/AssetAllocationChart';
import { NetIncomeExpensesChart } from '../charts/NetIncomeExpensesChart';
import { SavingsRateChart } from '../charts/SavingsRateChart';
import { FireProjectionChart } from '../charts/FireProjectionChart';

export const ChartsSection = ({ data, config, language = 'es', exchangeRates = {} }) => {
    const safeConfig = config || { withdrawalRate: 4.0, retirementAge: 45, currentAge: 27, expectedReturn: 7.0 };

    return (
        <>
            {/* Primera fila de gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <NetWorthChart data={data} language={language} exchangeRates={exchangeRates} />
                <AssetAllocationChart data={data} language={language} />
            </div>

            {/* Segunda fila de gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <NetIncomeExpensesChart data={data} language={language} exchangeRates={exchangeRates} />
                <SavingsRateChart data={data} />
            </div>

            {/* Tercera fila - Proyección FIRE */}
            <div className="grid grid-cols-1 gap-6">
                <FireProjectionChart data={data} config={safeConfig} language={language} exchangeRates={exchangeRates} />
            </div>
        </>
    );
};

