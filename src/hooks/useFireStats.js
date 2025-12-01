import { useMemo } from 'react';
import { getInvestmentCategoriesForLanguage } from '../constants';

export const useFireStats = (data, config) => {
    const investmentCategories = getInvestmentCategoriesForLanguage();
    const stats = useMemo(() => {
        if (data.length === 0) return null;
        const current = data[data.length - 1];
        const currentYear = new Date().getFullYear();
        const previousYear = currentYear - 1;

        // Net Worth
        const sumValues = (obj = {}) => {
            let total = 0;
            for (const value of Object.values(obj)) {
                const num = Number(value || 0);
                // Validación para evitar overflow
                if (!isNaN(num) && isFinite(num) && Math.abs(num) < 1e15) {
                    total += num;
                } else if (num !== 0) {
                    console.warn('Valor numérico inválido o muy grande:', value);
                }
            }
            return total;
        };
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
        let investmentAssetsTotal = 0;
        for (const [key, val] of Object.entries(current.assets || {})) {
            if (investmentCategories.includes(key)) {
                const num = Number(val || 0);
                if (!isNaN(num) && isFinite(num) && Math.abs(num) < 1e15) {
                    investmentAssetsTotal += num;
                }
            }
        }

        // Cash Flow (Last Month)
        const grossIncome = sumValues(current.income);
        const totalTaxes = sumValues(current.taxes);
        const totalExpenses = sumValues(current.expenses);

        const netIncome = grossIncome - totalTaxes;
        const savings = netIncome - totalExpenses;


        // Calculate average savings rate for the current year
        const currentYearMonths = data.filter(month => month.id.startsWith(`${currentYear}-`));
        const yearlySavingsRates = currentYearMonths.map(month => {
            const mGrossIncome = sumValues(month.income);
            const mTaxes = sumValues(month.taxes);
            const mExpenses = sumValues(month.expenses);
            const mNetIncome = mGrossIncome - mTaxes;
            const mSavings = mNetIncome - mExpenses;
            return mNetIncome > 0 ? (mSavings / mNetIncome) * 100 : 0;
        });

        let savingsRate = 0;
        if (yearlySavingsRates.length > 0) {
            const totalRate = yearlySavingsRates.reduce((acc, rate) => acc + rate, 0);
            savingsRate = totalRate / yearlySavingsRates.length;
        }

        // Yearly Average Spend (Last 12 months or available)
        const monthsToAvg = Math.min(data.length, 12);
        const recentData = data.slice(-monthsToAvg);
        let totalMonthlySpend = 0;
        for (const month of recentData) {
            totalMonthlySpend += sumValues(month.expenses);
        }
        const avgMonthlySpend = totalMonthlySpend / monthsToAvg;
        const yearlySpend = avgMonthlySpend * 12;

        // Objetivo de Inversión (usar campo de configuración específico)
        const targetInvestment = config.targetInvestment || 0;
        // Progreso hacia el objetivo usando solo activos de inversión (la casa/inmuebles no cuentan)
        const progress = targetInvestment > 0 ? (investmentAssetsTotal / targetInvestment) * 100 : 0;

        // Calcular patrimonio necesario hoy para alcanzar el objetivo (Coast FI)
        const targetYear = config.targetYear || currentYear + 10;
        const yearsRemaining = Math.max(0, targetYear - currentYear);
        const expectedReturn = (config.expectedReturn || 7.0) / 100;

        // Optimización para evitar problemas con números grandes
        let coastFiNumber = targetInvestment;
        if (yearsRemaining > 0 && expectedReturn > 0 && targetInvestment > 0) {
            try {
                // Limitar el cálculo para evitar overflow
                const maxSafeInvestment = 1e15; // 1 quadrillion
                const safeInvestment = Math.min(targetInvestment, maxSafeInvestment);

                // Usar cálculo más seguro para números grandes
                if (yearsRemaining <= 50 && safeInvestment < 1e12) {
                    coastFiNumber = safeInvestment / Math.pow(1 + expectedReturn, yearsRemaining);
                } else {
                    // Para números muy grandes o muchos años, usar aproximación
                    coastFiNumber = safeInvestment * Math.exp(-yearsRemaining * Math.log(1 + expectedReturn));
                }
            } catch (error) {
                console.warn('Error en cálculo Coast FI, usando valor seguro:', error);
                coastFiNumber = targetInvestment;
            }
        }

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
    }, [data, config, investmentCategories]);

    return stats;
};

