import React from 'react';
import { KPIGrid } from './dashboard/KPIGrid';
import { ChartsSection } from './dashboard/ChartsSection';

export const DashboardView = ({ stats, data, config, t, language, exchangeRates }) => {
    // Validar que data existe y tiene elementos
    if (!data || data.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-slate-500">No hay datos para mostrar. Por favor, agrega información en las pestañas de Presupuesto o Patrimonio.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <KPIGrid stats={stats} t={t} language={language} exchangeRates={exchangeRates} />
            <ChartsSection data={data} config={config} language={language} exchangeRates={exchangeRates} />
        </div>
    );
};
