import React from 'react';
import { formatCurrency } from '../utils';
import { useMonthNavigation } from '../contexts/MonthNavigationContext';

export const AvailableFundsPanel = ({ data, language, exchangeRates, t }) => {
    const { selectedMonth } = useMonthNavigation();

    if (!selectedMonth) {
        return null;
    }

    // Calcular ingresos netos disponibles
    const grossIncome = Object.values(selectedMonth?.income || {}).reduce((a, b) => a + Number(b), 0);
    const taxes = Object.values(selectedMonth?.taxes || {}).reduce((a, b) => a + Number(b), 0);
    const expenses = Object.values(selectedMonth?.expenses || {}).reduce((a, b) => a + Number(b), 0);
    const netIncome = grossIncome - taxes;
    const availableFunds = netIncome - expenses;

    // Calcular asignaciones (excluyendo Banco/Cash que es el remanente)
    const otherAssets = Object.entries(selectedMonth?.assets || {}).reduce((acc, [key, val]) => {
        if (key === 'Banco') return acc;
        return acc + Number(val || 0);
    }, 0);
    const debtCollaboration = Object.values(selectedMonth?.debtCollaboration || {}).reduce((a, b) => a + Number(b), 0);
    const assignedToOthers = otherAssets + debtCollaboration;

    // El Cash es lo que queda (o lo que ya está calculado en el objeto assets['Banco'])
    const cash = Number(selectedMonth?.assets?.['Banco'] || 0);

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Distribución de Fondos</h3>

            <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-600">Dinero Disponible (Ingresos - Gastos)</span>
                    <span className="font-mono font-bold text-slate-800">{formatCurrency(availableFunds, language, exchangeRates)}</span>
                </div>

                <div className="flex justify-between items-center px-3">
                    <span className="text-slate-500">Menos: Inversiones y Deudas</span>
                    <span className="font-mono font-semibold text-slate-600">-{formatCurrency(assignedToOthers, language, exchangeRates)}</span>
                </div>

                <div className="border-t border-slate-200 pt-3">
                    <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                        <div>
                            <span className="block font-bold text-emerald-800">Cash (Restante)</span>
                            <span className="text-xs text-emerald-600">Se asigna automáticamente a Banco</span>
                        </div>
                        <span className="font-mono text-xl font-bold text-emerald-700">
                            {formatCurrency(cash, language, exchangeRates)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
