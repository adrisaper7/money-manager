import React from 'react';
import { formatCurrency } from '../utils';
import { useMonthNavigation } from '../contexts/MonthNavigationContext';

export const AvailableFundsPanel = ({ data, language, exchangeRates, t }) => {
    const { selectedMonth } = useMonthNavigation();

    if (!selectedMonth) {
        return null;
    }

    // Calcular ingresos netos disponibles (ingresos - gastos - impuestos)
    const grossIncome = Object.values(selectedMonth?.income || {}).reduce((a, b) => a + Number(b), 0);
    const taxes = Object.values(selectedMonth?.taxes || {}).reduce((a, b) => a + Number(b), 0);
    const expenses = Object.values(selectedMonth?.expenses || {}).reduce((a, b) => a + Number(b), 0);
    const netIncome = grossIncome - taxes;
    const availableFunds = netIncome - expenses;

    // Calcular cuánto se ha asignado a inversiones
    const investmentAssets = Object.values(selectedMonth?.assets || {}).reduce((a, b) => a + Number(b), 0);
    const debtCollaboration = Object.values(selectedMonth?.debtCollaboration || {}).reduce((a, b) => a + Number(b), 0);
    const totalAssigned = investmentAssets + debtCollaboration;

    // Calcular el dinero realmente disponible después de lo asignado
    const remainingFunds = availableFunds - totalAssigned;
    
    // Determinar si hay error
    const hasError = remainingFunds < 0;

    return (
        <div className={`bg-white p-6 rounded-xl shadow-sm border-2 ${hasError ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Dinero Disponible</h3>
            
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <span className="text-slate-600">Ingreso Neto (Bruto - Impuestos):</span>
                    <span className="font-mono font-semibold text-slate-800">{formatCurrency(netIncome, language, exchangeRates)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                    <span className="text-slate-600">Gastos:</span>
                    <span className="font-mono font-semibold text-slate-800">-{formatCurrency(expenses, language, exchangeRates)}</span>
                </div>
                
                <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
                    <span className="text-slate-600">Disponible para invertir:</span>
                    <span className="font-mono font-semibold text-emerald-600">{formatCurrency(availableFunds, language, exchangeRates)}</span>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-slate-600">Asignado (Inversiones + Deudas):</span>
                    <span className="font-mono font-semibold text-slate-800">-{formatCurrency(totalAssigned, language, exchangeRates)}</span>
                </div>

                <div className={`border-t border-slate-200 pt-3 flex justify-between items-center ${hasError ? 'bg-red-100 -mx-6 -mb-6 px-6 py-3 rounded-b-lg' : ''}`}>
                    <span className={`font-semibold ${hasError ? 'text-red-700' : 'text-slate-800'}`}>Saldo:</span>
                    <span className={`font-mono text-lg font-bold ${hasError ? 'text-red-700' : 'text-emerald-600'}`}>
                        {formatCurrency(remainingFunds, language, exchangeRates)}
                    </span>
                </div>

                {hasError && (
                    <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                        <p className="text-red-700 font-semibold text-sm">
                            ⚠️ Error: ¡Has asignado más dinero del disponible!
                        </p>
                        <p className="text-red-600 text-xs mt-1">
                            Reduce las asignaciones en Inversiones o Deudas
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
