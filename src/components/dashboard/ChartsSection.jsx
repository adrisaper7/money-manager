import React from 'react';
import { NetWorthChart } from '../charts/NetWorthChart';
import { AssetAllocationChart } from '../charts/AssetAllocationChart';
import { NetIncomeExpensesChart } from '../charts/NetIncomeExpensesChart';
import { SavingsRateChart } from '../charts/SavingsRateChart';
import { FireProjectionChart } from '../charts/FireProjectionChart';

export const ChartsSection = ({ data, config, exchangeRates = {} }) => {
    const safeConfig = config || { withdrawalRate: 4.0, retirementAge: 45, currentAge: 27, expectedReturn: 7.0 };

    return (
        <>
            {/* First row of charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <NetWorthChart data={data} exchangeRates={exchangeRates} />
                <AssetAllocationChart data={data} />
            </div>

            {/* Second row of charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <NetIncomeExpensesChart data={data} exchangeRates={exchangeRates} />
                <SavingsRateChart data={data} />
            </div>

            {/* Third row - FIRE projection */}
            <div className="grid grid-cols-1 gap-6">
                <FireProjectionChart data={data} config={safeConfig} exchangeRates={exchangeRates} />
            </div>
        </>
    );
};

