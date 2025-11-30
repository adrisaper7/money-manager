import { useState, useEffect, useMemo } from 'react';
import { generateMonthId } from '../utils';
import { defaultCategories } from '../constants';

export const useFireData = (currentUserId) => {
    const [data, setData] = useState([]);

    // Get storage key based on current user
    const getStorageKey = () => {
        return currentUserId ? `fireData_${currentUserId}_v1` : 'fireData_es_v1';
    };

    // Initialize with some dummy data if empty
    useEffect(() => {
        const storageKey = getStorageKey();
        const savedData = localStorage.getItem(storageKey);
        if (savedData) {
            let parsedData = JSON.parse(savedData);
            // Migrar datos antiguos que no tengan debtCollaboration
            parsedData = parsedData.map(month => ({
                ...month,
                debtCollaboration: month.debtCollaboration || defaultCategories.liabilities.reduce((acc, curr) => ({ ...acc, [curr]: 0 }), {})
            }));
            setData(parsedData);
        } else {
            // Create initial month with empty structure
            const initialData = [];
            for (let i = 0; i >= 0; i--) {
                const d = new Date();
                d.setMonth(d.getMonth() - i);
                const id = generateMonthId(d);
                initialData.push({
                    id,
                    monthLabel: d.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
                    income: defaultCategories.income.reduce((acc, curr) => ({ ...acc, [curr]: 0 }), {}),
                    taxes: defaultCategories.taxes.reduce((acc, curr) => ({ ...acc, [curr]: 0 }), {}),
                    expenses: defaultCategories.expenses.reduce((acc, curr) => ({ ...acc, [curr]: 0 }), {}),
                    assets: defaultCategories.assets.reduce((acc, curr) => ({ ...acc, [curr]: 0 }), {}),
                    liabilities: defaultCategories.liabilities.reduce((acc, curr) => ({ ...acc, [curr]: 0 }), {}),
                    collaboratesInDebt: false,
                    debtCollaboration: defaultCategories.liabilities.reduce((acc, curr) => ({ ...acc, [curr]: 0 }), {}),
                });
            }
            setData(initialData);
        }
    }, [currentUserId]);

    // Auto-create current month if it doesn't exist
    useEffect(() => {
        if (data.length === 0) return;

        const currentMonthId = generateMonthId(new Date());
        const currentMonthExists = data.some(d => d.id === currentMonthId);

        if (!currentMonthExists) {
            const lastMonth = data[data.length - 1];
            const newDate = new Date();

            const newEntry = {
                id: currentMonthId,
                monthLabel: newDate.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
                income: defaultCategories.income.reduce((acc, curr) => ({ ...acc, [curr]: 0 }), {}),
                taxes: defaultCategories.taxes.reduce((acc, curr) => ({ ...acc, [curr]: 0 }), {}),
                expenses: defaultCategories.expenses.reduce((acc, curr) => ({ ...acc, [curr]: 0 }), {}),
                // Copy assets and liabilities from last month
                assets: { ...lastMonth.assets },
                liabilities: { ...lastMonth.liabilities },
                collaboratesInDebt: lastMonth?.collaboratesInDebt || false,
                debtCollaboration: { ...lastMonth.debtCollaboration },
            };

            setData([...data, newEntry]);
        }
    }, [data]);

    // Save data on change
    useEffect(() => {
        if (data.length > 0) {
            const storageKey = getStorageKey();
            localStorage.setItem(storageKey, JSON.stringify(data));
        }
    }, [data, currentUserId]);

    const updateData = (monthId, type, category, value) => {
        setData(prev => prev.map(item => {
            if (item.id === monthId) {
                let updatedItem = { ...item };
                
                // Handle boolean field for collaboratesInDebt
                if (type === 'collaboratesInDebt') {
                    updatedItem.collaboratesInDebt = value;
                } 
                // Handle debtCollaboration table
                else if (type === 'debtCollaboration') {
                    updatedItem.debtCollaboration = {
                        ...item.debtCollaboration,
                        [category]: Number(value)
                    };
                }
                // Handle regular asset/liability updates
                else {
                    updatedItem[type] = {
                        ...item[type],
                        [category]: Number(value)
                    };
                }

                // Auto-calculate Banco if we're updating investments or debt collaboration
                if ((type === 'assets' && category !== 'Banco') || type === 'debtCollaboration' || type === 'income' || type === 'taxes' || type === 'expenses') {
                    const grossIncome = Object.values(updatedItem.income || {}).reduce((a, b) => a + Number(b), 0);
                    const taxes = Object.values(updatedItem.taxes || {}).reduce((a, b) => a + Number(b), 0);
                    const expenses = Object.values(updatedItem.expenses || {}).reduce((a, b) => a + Number(b), 0);
                    const netIncome = grossIncome - taxes;
                    const availableFunds = netIncome - expenses;

                    // Dinero asignado a inversiones (excepto Banco)
                    const otherInvestments = Object.entries(updatedItem.assets || {}).reduce((acc, [key, val]) => {
                        if (key !== 'Banco') return acc + Number(val || 0);
                        return acc;
                    }, 0);

                    const assignedToDebt = Object.values(updatedItem.debtCollaboration || {}).reduce((a, b) => a + Number(b), 0);
                    const totalOtherAssignments = otherInvestments + assignedToDebt;

                    // Banco = dinero disponible - dinero asignado a otras inversiones
                    const newBancoValue = Math.max(0, availableFunds - totalOtherAssignments);
                    updatedItem.assets = {
                        ...updatedItem.assets,
                        'Banco': newBancoValue
                    };
                }

                return updatedItem;
            }
            return item;
        }));
    };

    const isMonthZero = (month) => {
        if (!month) return true;
        const totalIncome = Object.values(month.income || {}).reduce((a, b) => a + Number(b || 0), 0);
        const totalTaxes = Object.values(month.taxes || {}).reduce((a, b) => a + Number(b || 0), 0);
        const totalExpenses = Object.values(month.expenses || {}).reduce((a, b) => a + Number(b || 0), 0);
        const totalAssets = Object.values(month.assets || {}).reduce((a, b) => a + Number(b || 0), 0);
        const totalLiabilities = Object.values(month.liabilities || {}).reduce((a, b) => a + Number(b || 0), 0);
        
        return totalIncome === 0 && totalTaxes === 0 && totalExpenses === 0 && 
               totalAssets === 0 && totalLiabilities === 0;
    };

    const addPreviousMonth = () => {
        if (data.length === 0) return;

        const firstMonth = data[0];
        const [year, month] = firstMonth.id.split('-').map(Number);
        const prevDate = new Date(year, month - 2, 1);

        const newEntry = {
            id: generateMonthId(prevDate),
            monthLabel: prevDate.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
            income: defaultCategories.income.reduce((acc, curr) => ({ ...acc, [curr]: 0 }), {}),
            taxes: defaultCategories.taxes.reduce((acc, curr) => ({ ...acc, [curr]: 0 }), {}),
            expenses: defaultCategories.expenses.reduce((acc, curr) => ({ ...acc, [curr]: 0 }), {}),
            assets: { ...firstMonth.assets },
            liabilities: { ...firstMonth.liabilities },
            collaboratesInDebt: false,
            debtCollaboration: defaultCategories.liabilities.reduce((acc, curr) => ({ ...acc, [curr]: 0 }), {}),
        };

        setData([newEntry, ...data]);
    };

    const removeLastMonth = () => {
        if (!data || data.length <= 1) {
            alert('No se puede eliminar. Debe quedar al menos un mes.');
            return;
        }

        const firstMonth = data[0];
        const monthLabel = firstMonth?.monthLabel || 'Desconocido';
        const message = `¿Estás seguro de que quieres eliminar el mes ${monthLabel}? (el más antiguo)`;

        if (window.confirm(message)) {
            const newData = data.slice(1);
            setData(newData);
        }
    };

    const loadData = (newData) => {
        setData(newData);
    };

    return {
        data,
        setData,
        updateData,
        addPreviousMonth,
        removeLastMonth,
        loadData
    };
};

