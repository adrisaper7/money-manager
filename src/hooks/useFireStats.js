import { useMemo } from 'react';
import { investmentCategories } from '../constants';

export const useFireStats = (data, config) => {
    const stats = useMemo(() => {
        if (data.length === 0) return null;
        const current = data[data.length - 1];

        // Net Worth
        const totalAssets = Object.values(current.assets || {}).reduce((a, b) => a + Number(b), 0);
        const totalLiabilities = Object.values(current.liabilities || {}).reduce((a, b) => a + Number(b), 0);
        
        // Colaboración en deudas (suma de lo que has pagado en deudas)
        const debtCollaborationTotal = Object.values(current.debtCollaboration || {}).reduce((a, b) => a + Number(b), 0);
        
        // Sumar la colaboración en deudas al patrimonio total
        const netWorth = totalAssets + debtCollaborationTotal - totalLiabilities;

        // Activos considerados como objetivos de inversión (filtrar por categorías)
        const investmentAssetsTotal = Object.entries(current.assets || {}).reduce((acc, [key, val]) => {
            if (investmentCategories.includes(key)) return acc + Number(val || 0);
            return acc;
        }, 0);

        // Cash Flow (Last Month)
        const grossIncome = Object.values(current.income || {}).reduce((a, b) => a + Number(b), 0);
        const totalTaxes = Object.values(current.taxes || {}).reduce((a, b) => a + Number(b), 0);
        const totalExpenses = Object.values(current.expenses || {}).reduce((a, b) => a + Number(b), 0);

        const netIncome = grossIncome - totalTaxes;
        const savings = netIncome - totalExpenses;
        const savingsRate = netIncome > 0 ? (savings / netIncome) * 100 : 0;

        // Yearly Average Spend (Last 6 months or available)
        const monthsToAvg = Math.min(data.length, 12);
        const recentData = data.slice(-monthsToAvg);
        const avgMonthlySpend = recentData.reduce((acc, month) => {
            return acc + Object.values(month.expenses || {}).reduce((a, b) => a + Number(b), 0);
        }, 0) / monthsToAvg;
        const yearlySpend = avgMonthlySpend * 12;

        // Objetivo de Inversión (usar campo de configuración específico)
        const targetInvestment = config.targetInvestment || 0;
        // Progreso hacia el objetivo usando solo activos de inversión (la casa/inmuebles no cuentan)
        const progress = targetInvestment > 0 ? (investmentAssetsTotal / targetInvestment) * 100 : 0;

        // Calcular patrimonio necesario hoy para alcanzar el objetivo (Coast FI)
        const currentYear = new Date().getFullYear();
        const targetYear = config.targetYear || currentYear + 10;
        const yearsRemaining = Math.max(0, targetYear - currentYear);
        const expectedReturn = (config.expectedReturn || 7.0) / 100;
        const coastFiNumber = yearsRemaining > 0 && expectedReturn > 0
            ? targetInvestment / Math.pow(1 + expectedReturn, yearsRemaining)
            : targetInvestment;

        return {
            netWorth,
            totalAssets,
            totalLiabilities,
            investmentAssets: investmentAssetsTotal + debtCollaborationTotal,
            savingsRate,
            yearlySpend,
            fiNumber: targetInvestment, // Mantener compatibilidad con código existente (ahora inversión)
            coastFiNumber,
            progress,
            savings
        };
    }, [data, config]);

    return stats;
};

