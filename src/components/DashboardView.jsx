import React from 'react';
import { KPIGrid } from './dashboard/KPIGrid';
import { ChartsSection } from './dashboard/ChartsSection';

export const DashboardView = ({ stats, data, config, t, exchangeRates }) => {
    // Validate that data exists and has elements
    if (!data || data.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-slate-500">No data to display. Please add information in the Budget or Net Worth tabs.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <KPIGrid stats={stats} t={t} exchangeRates={exchangeRates} />
            <ChartsSection data={data} config={config} exchangeRates={exchangeRates} />
        </div>
    );
};
