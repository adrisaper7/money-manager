import { useMemo } from 'react';
import { getInvestmentCategoriesForLanguage } from '../constants';
import { useLanguage } from './useLanguage';

export const useFireStats = (data, config) => {
    const { language } = useLanguage();
    const investmentCategories = getInvestmentCategoriesForLanguage(language);
    const stats = useMemo(() => {
        if (data.length === 0) return null;
        const current = data[data.length - 1];
        const currentYear = new Date().getFullYear();
        const previousYear = currentYear - 1;

        // Net Worth
        const sumValues = (obj = {}) => Object.values(obj).reduce((a, b) => a + Number(b || 0), 0);
        const calcMonthTotals = (month) => {
            if (!month) {
                return {
                    assets: 0,
                    liabilities: 0,
                    debtCollaboration: 0,
                    netWorth: 0,
                    savings: 0,
                    savingsRate: 0,
                };
            }

            const assets = sumValues(month.assets);
            const liabilities = sumValues(month.liabilities);
            const debtCollaboration = sumValues(month.debtCollaboration);

            const grossIncome = sumValues(month.income);
            const taxes = sumValues(month.taxes);
            const expenses = sumValues(month.expenses);
            const netIncome = grossIncome - taxes;
            const savings = netIncome - expenses;
            const savingsRate = netIncome > 0 ? (savings / netIncome) * 100 : 0;

            return {
                assets,
                liabilities,
                debtCollaboration,
                netWorth: assets + debtCollaboration - liabilities,
                savings,
                savingsRate,
            };
        };

        const totalAssets = sumValues(current.assets);
        const totalLiabilities = sumValues(current.liabilities);
        const debtCollaborationTotal = sumValues(current.debtCollaboration);
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
        const targetYear = config.targetYear || currentYear + 10;
        const yearsRemaining = Math.max(0, targetYear - currentYear);
        const expectedReturn = (config.expectedReturn || 7.0) / 100;
        const coastFiNumber = yearsRemaining > 0 && expectedReturn > 0
            ? targetInvestment / Math.pow(1 + expectedReturn, yearsRemaining)
            : targetInvestment;

        const firstMonthOfYear = data.find(month => month.id.startsWith(`${currentYear}-`)) || data[0];
        const previousYearMonths = data.filter(month => month.id.startsWith(`${previousYear}-`));

        const currentTotals = calcMonthTotals(current);
        const baselineTotals = calcMonthTotals(firstMonthOfYear);

        const calcDelta = (currentValue, baseValue) => {
            const difference = currentValue - baseValue;
            const percent = baseValue !== 0 ? (difference / baseValue) * 100 : null;
            return { difference, percent };
        };

        const netWorthDelta = calcDelta(currentTotals.netWorth, baselineTotals.netWorth);
        const assetsDelta = calcDelta(currentTotals.assets, baselineTotals.assets);
        const liabilitiesDelta = calcDelta(currentTotals.liabilities, baselineTotals.liabilities);
        const savingsDelta = calcDelta(currentTotals.savings, baselineTotals.savings);
        const savingsRateDelta = calcDelta(currentTotals.savingsRate, baselineTotals.savingsRate);

        const previousYearAvgMonthlySpend = previousYearMonths.length > 0
            ? previousYearMonths.reduce((acc, month) => acc + sumValues(month.expenses), 0) / previousYearMonths.length
            : null;
        const previousYearlySpend = previousYearAvgMonthlySpend != null ? previousYearAvgMonthlySpend * 12 : null;
        const yearlySpendDelta = previousYearlySpend != null ? calcDelta(yearlySpend, previousYearlySpend) : null;

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
            savings,
            yearComparisons: {
                baselineLabel: firstMonthOfYear?.monthLabel,
                netWorth: netWorthDelta,
                assets: assetsDelta,
                liabilities: liabilitiesDelta,
                savings: savingsDelta,
                savingsRate: savingsRateDelta,
                yearlySpend: yearlySpendDelta
            }
        };
    }, [data, config, language, investmentCategories]);

    return stats;
};

