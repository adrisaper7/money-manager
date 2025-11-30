import { useState, useEffect, useMemo } from 'react';
import { generateMonthId } from '../utils';
import { defaultCategories, getCategoriesForLanguage } from '../constants';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useFirestoreStatus } from './useFirestoreStatus';
import { useLanguage } from './useLanguage';

export const useFireData = (currentUserId) => {
    const [data, setData] = useState([]);
    const { isFirestoreAvailable, errorMessage } = useFirestoreStatus(currentUserId);
    const { language } = useLanguage();
    
    // Get categories for current language
    const currentCategories = useMemo(() => getCategoriesForLanguage(language), [language]);

    // Helper function to check if data needs migration
    const needsMigration = (data, fromLang, toLang) => {
        if (fromLang === toLang) return false;
        if (!data || data.length === 0) return false;
        
        const fromCategories = getCategoriesForLanguage(fromLang);
        const toCategories = getCategoriesForLanguage(toLang);
        
        // Check if first month has categories from the target language
        const firstMonth = data[0];
        if (!firstMonth || !firstMonth.assets) return false;
        
        // Check if any asset category matches target language
        return !toCategories.assets.some(cat => firstMonth.assets.hasOwnProperty(cat));
    };

    // Helper function to migrate data from Spanish to current language
    const migrateDataCategories = (data, fromLang = 'es', toLang = language) => {
        if (!needsMigration(data, fromLang, toLang)) return data;
        
        const fromCategories = getCategoriesForLanguage(fromLang);
        const toCategories = getCategoriesForLanguage(toLang);
        
        return data.map(month => {
            const migratedMonth = { ...month };
            
            // Migrate each category type
            ['income', 'taxes', 'expenses', 'assets', 'liabilities'].forEach(type => {
                const migratedValues = {};
                
                // Map old categories to new categories
                toCategories[type].forEach(newCategory => {
                    // Find corresponding category in old language (by position)
                    const oldIndex = fromCategories[type].indexOf(newCategory);
                    if (oldIndex !== -1) {
                        // Same category name exists
                        migratedValues[newCategory] = month[type][newCategory] || 0;
                    } else {
                        // Category doesn't exist, find by position or set to 0
                        const categoryMap = {
                            es: {
                                en: {
                                    'Banco': 'Bank',
                                    'Fondo Emergencia': 'Emergency Fund',
                                    'Cartera Inversión': 'Investment Portfolio',
                                    'Fondos Indexados': 'Index Funds',
                                    'Planes Pensiones': 'Pension Plans',
                                    'Inmobiliario': 'Real Estate',
                                    'Cripto': 'Crypto',
                                    'Hipoteca': 'Mortgage',
                                    'Préstamo Coche': 'Car Loan',
                                    'Tarjetas': 'Credit Cards',
                                    'Otros': 'Other',
                                    'Salario Bruto': 'Gross Salary',
                                    'Bonus': 'Bonus',
                                    'Dividendos': 'Dividends',
                                    'Negocio': 'Business',
                                    'IRPF': 'Income Tax',
                                    'Seguridad Social': 'Social Security',
                                    'Cuota Autónomos': 'Self-Employment Tax',
                                    'Vivienda': 'Housing',
                                    'Supermercado': 'Groceries',
                                    'Restaurantes': 'Restaurants',
                                    'Suministros': 'Utilities',
                                    'Seguros': 'Insurance',
                                    'Transporte': 'Transportation',
                                    'Ocio': 'Leisure',
                                    'Salud': 'Health',
                                    'Varios': 'Miscellaneous'
                                }
                            },
                            en: {
                                es: {
                                    'Bank': 'Banco',
                                    'Emergency Fund': 'Fondo Emergencia',
                                    'Investment Portfolio': 'Cartera Inversión',
                                    'Index Funds': 'Fondos Indexados',
                                    'Pension Plans': 'Planes Pensiones',
                                    'Real Estate': 'Inmobiliario',
                                    'Crypto': 'Cripto',
                                    'Mortgage': 'Hipoteca',
                                    'Car Loan': 'Préstamo Coche',
                                    'Credit Cards': 'Tarjetas',
                                    'Other': 'Otros',
                                    'Gross Salary': 'Salario Bruto',
                                    'Bonus': 'Bonus',
                                    'Dividends': 'Dividendos',
                                    'Business': 'Negocio',
                                    'Income Tax': 'IRPF',
                                    'Social Security': 'Seguridad Social',
                                    'Self-Employment Tax': 'Cuota Autónomos',
                                    'Housing': 'Vivienda',
                                    'Groceries': 'Supermercado',
                                    'Restaurants': 'Restaurantes',
                                    'Utilities': 'Suministros',
                                    'Insurance': 'Seguros',
                                    'Transportation': 'Transporte',
                                    'Leisure': 'Ocio',
                                    'Health': 'Salud',
                                    'Miscellaneous': 'Varios'
                                }
                            }
                        };
                        
                        const mappedCategory = categoryMap[fromLang]?.[toLang]?.[newCategory] || newCategory;
                        migratedValues[newCategory] = month[type][mappedCategory] || 0;
                    }
                });
                
                migratedMonth[type] = migratedValues;
            });
            
            // Migrate debtCollaboration
            if (migratedMonth.debtCollaboration) {
                const migratedDebtCollaboration = {};
                toCategories.liabilities.forEach(newCategory => {
                    const categoryMap = {
                        es: {
                            en: {
                                'Hipoteca': 'Mortgage',
                                'Préstamo Coche': 'Car Loan',
                                'Tarjetas': 'Credit Cards',
                                'Otros': 'Other'
                            }
                        },
                        en: {
                            es: {
                                'Mortgage': 'Hipoteca',
                                'Car Loan': 'Préstamo Coche',
                                'Credit Cards': 'Tarjetas',
                                'Other': 'Otros'
                            }
                        }
                    };
                    
                    const mappedCategory = categoryMap[fromLang]?.[toLang]?.[newCategory] || newCategory;
                    migratedDebtCollaboration[newCategory] = month.debtCollaboration[mappedCategory] || 0;
                });
                migratedMonth.debtCollaboration = migratedDebtCollaboration;
            }
            
            return migratedMonth;
        });
    };

    // Helper function to generate initial data (1 month)
    const generateInitialData = () => {
        const initialData = [];
        for (let i = 0; i >= 0; i--) {  // Creates 1 month: current (i=0)
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const id = generateMonthId(d);
            initialData.push({
                id,
                monthLabel: d.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
                income: currentCategories.income.reduce((acc, curr) => ({ ...acc, [curr]: 0 }), {}),
                taxes: currentCategories.taxes.reduce((acc, curr) => ({ ...acc, [curr]: 0 }), {}),
                expenses: currentCategories.expenses.reduce((acc, curr) => ({ ...acc, [curr]: 0 }), {}),
                assets: currentCategories.assets.reduce((acc, curr) => ({ ...acc, [curr]: 0 }), {}),
                liabilities: currentCategories.liabilities.reduce((acc, curr) => ({ ...acc, [curr]: 0 }), {}),
                collaboratesInDebt: false,
                debtCollaboration: currentCategories.liabilities.reduce((acc, curr) => ({ ...acc, [curr]: 0 }), {}),
            });
        }
        return initialData;
    };

    // Get Firestore document reference based on current user
    const getUserDocRef = () => {
        if (!currentUserId) return null;
        return doc(db, 'users', currentUserId, 'financialData', 'main');
    };

    // Initialize data from Firestore or localStorage as fallback
    useEffect(() => {
        if (!currentUserId) {
            // Fallback to localStorage if no user
            const storageKey = 'fireData_es_v1';
            const savedData = localStorage.getItem(storageKey);
            if (savedData) {
                let parsedData = JSON.parse(savedData);
                parsedData = parsedData.map(month => ({
                    ...month,
                    debtCollaboration: month.debtCollaboration || currentCategories.liabilities.reduce((acc, curr) => ({ ...acc, [curr]: 0 }), {})
                }));
                // Migrate data to current language if needed
                const migratedData = migrateDataCategories(parsedData, 'es', language);
                setData(migratedData);
            } else {
                console.log('No user and no data, creating initial dataset...');
                const initialData = generateInitialData();
                setData(initialData);
            }
            return;
        }

        // If Firestore is not available, use localStorage only
        if (isFirestoreAvailable === false) {
            console.log('Firestore not available, using localStorage only');
            const storageKey = `fireData_${currentUserId}_v1`;
            const savedData = localStorage.getItem(storageKey);
            if (savedData) {
                let parsedData = JSON.parse(savedData);
                parsedData = parsedData.map(month => ({
                    ...month,
                    debtCollaboration: month.debtCollaboration || currentCategories.liabilities.reduce((acc, curr) => ({ ...acc, [curr]: 0 }), {})
                }));
                // Migrate data to current language if needed
                const migratedData = migrateDataCategories(parsedData, 'es', language);
                setData(migratedData);
            } else {
                console.log('No data in localStorage, creating initial dataset...');
                const initialData = generateInitialData();
                setData(initialData);
            }
            return;
        }

        // If Firestore is checking or available, try to use it
        if (isFirestoreAvailable === null || isFirestoreAvailable === true) {
            const userDocRef = getUserDocRef();
            if (!userDocRef) return;

            // Try to load from Firestore first
            console.log('Loading data from Firestore for user:', currentUserId);
            const unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
                console.log('Firestore snapshot received:', docSnapshot.exists());
                if (docSnapshot.exists()) {
                    const firestoreData = docSnapshot.data().data || [];
                    console.log('Data loaded from Firestore:', firestoreData);
                    // Migrate data to current language if needed (assuming Firestore data is in Spanish)
                    const migratedData = migrateDataCategories(firestoreData, 'es', language);
                    setData(migratedData);
                } else {
                    console.log('No data in Firestore, checking localStorage...');
                    // No data in Firestore, try localStorage migration
                    const storageKey = `fireData_${currentUserId}_v1`;
                    const savedData = localStorage.getItem(storageKey);
                    if (savedData) {
                        console.log('Found data in localStorage, migrating to Firestore...');
                        let parsedData = JSON.parse(savedData);
                        parsedData = parsedData.map(month => ({
                            ...month,
                            debtCollaboration: month.debtCollaboration || currentCategories.liabilities.reduce((acc, curr) => ({ ...acc, [curr]: 0 }), {})
                        }));
                        // Migrate data to current language if needed
                        const migratedData = migrateDataCategories(parsedData, 'es', language);
                        setData(migratedData);
                        // Migrate to Firestore (save in current language structure)
                        setDoc(userDocRef, { data: migratedData })
                            .then(() => console.log('Data migrated to Firestore successfully'))
                            .catch(error => console.error('Error migrating data to Firestore:', error));
                    } else {
                        console.log('No data found, creating initial data...');
                        const initialData = generateInitialData();
                        setData(initialData);
                        // Save to Firestore
                        setDoc(userDocRef, { data: initialData })
                            .then(() => console.log('Initial data saved to Firestore successfully'))
                            .catch(error => console.error('Error saving initial data to Firestore:', error));
                    }
                }
            }, (error) => {
                console.error('Error loading data from Firestore:', error);
                console.log('Falling back to localStorage due to Firestore error');
                // Fallback to localStorage
                const storageKey = `fireData_${currentUserId}_v1`;
                const savedData = localStorage.getItem(storageKey);
                if (savedData) {
                    let parsedData = JSON.parse(savedData);
                    parsedData = parsedData.map(month => ({
                        ...month,
                        debtCollaboration: month.debtCollaboration || currentCategories.liabilities.reduce((acc, curr) => ({ ...acc, [curr]: 0 }), {})
                    }));
                    // Migrate data to current language if needed
                    const migratedData = migrateDataCategories(parsedData, 'es', language);
                    setData(migratedData);
                    console.log('Loaded data from localStorage as fallback');
                } else {
                    console.log('No data in localStorage, creating initial dataset...');
                    const initialData = generateInitialData();
                    setData(initialData);
                }
            });

            return () => unsubscribe();
        }
    }, [currentUserId, isFirestoreAvailable, language]);

    // Migrate data when language changes
    useEffect(() => {
        if (data.length > 0 && needsMigration(data, 'es', language)) {
            const migratedData = migrateDataCategories(data, 'es', language);
            setData(migratedData);
        }
    }, [language]); // Remove data from dependencies to prevent infinite loop

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
                income: currentCategories.income.reduce((acc, curr) => ({ ...acc, [curr]: 0 }), {}),
                taxes: currentCategories.taxes.reduce((acc, curr) => ({ ...acc, [curr]: 0 }), {}),
                expenses: currentCategories.expenses.reduce((acc, curr) => ({ ...acc, [curr]: 0 }), {}),
                // Copy assets and liabilities from last month
                assets: { ...lastMonth.assets },
                liabilities: { ...lastMonth.liabilities },
                collaboratesInDebt: lastMonth?.collaboratesInDebt || false,
                debtCollaboration: { ...lastMonth.debtCollaboration },
            };

            setData(prevData => [...prevData, newEntry]);
        }
    }, [data, currentCategories.income, currentCategories.taxes, currentCategories.expenses]);

    // Save data to Firestore on change
    useEffect(() => {
        if (data.length > 0 && currentUserId) {
            console.log('Saving data to Firestore for user:', currentUserId);
            console.log('Data to save:', data);
            const userDocRef = getUserDocRef();
            if (userDocRef) {
                setDoc(userDocRef, { data })
                    .then(() => console.log('Data saved successfully to Firestore'))
                    .catch(error => {
                        console.error('Error saving to Firestore:', error);
                        console.log('Continuing with localStorage only');
                    });
            }
        }
        // Also keep localStorage as backup
        if (data.length > 0) {
            const storageKey = currentUserId ? `fireData_${currentUserId}_v1` : 'fireData_es_v1';
            localStorage.setItem(storageKey, JSON.stringify(data));
            console.log('Data saved to localStorage:', storageKey);
        }
    }, [data, currentUserId, getUserDocRef]);

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
                    // Ensure we have valid numbers
                    const rawValue = value === '' ? 0 : Number(value);
                    const newValue = isNaN(rawValue) ? 0 : rawValue;

                    updatedItem.debtCollaboration = {
                        ...item.debtCollaboration,
                        [category]: newValue
                    };
                }
                // Handle regular asset/liability updates
                else {
                    updatedItem[type] = {
                        ...item[type],
                        [category]: Number(value)
                    };
                }

                // Auto-calculate Bank if we're updating investments or debt collaboration
                const bankCategory = language === 'es' ? 'Banco' : 'Bank';
                if ((type === 'assets' && category !== bankCategory) || type === 'debtCollaboration' || type === 'income' || type === 'taxes' || type === 'expenses') {
                    const grossIncome = Object.values(updatedItem.income || {}).reduce((a, b) => a + Number(b), 0);
                    const taxes = Object.values(updatedItem.taxes || {}).reduce((a, b) => a + Number(b), 0);
                    const expenses = Object.values(updatedItem.expenses || {}).reduce((a, b) => a + Number(b), 0);
                    const netIncome = grossIncome - taxes;
                    const availableFunds = netIncome - expenses;

                    // Money assigned to investments (except Bank)
                    const otherInvestments = Object.entries(updatedItem.assets || {}).reduce((acc, [key, val]) => {
                        if (key !== bankCategory) return acc + Number(val || 0);
                        return acc;
                    }, 0);

                    const assignedToDebt = Object.values(updatedItem.debtCollaboration || {}).reduce((a, b) => a + Number(b), 0);
                    const totalOtherAssignments = otherInvestments + assignedToDebt;

                    // Bank = available funds - money assigned to other investments
                    const newBankValue = Math.max(0, availableFunds - totalOtherAssignments);
                    updatedItem.assets = {
                        ...updatedItem.assets,
                        [bankCategory]: newBankValue
                    };
                }

                return updatedItem;
            }
            return item;
        }));
    };

    
    const addPreviousMonth = () => {
        if (data.length === 0) return;

        const firstMonth = data[0];
        const [year, month] = firstMonth.id.split('-').map(Number);
        const prevDate = new Date(year, month - 2, 1);

        const newEntry = {
            id: generateMonthId(prevDate),
            monthLabel: prevDate.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
            income: currentCategories.income.reduce((acc, curr) => ({ ...acc, [curr]: 0 }), {}),
            taxes: currentCategories.taxes.reduce((acc, curr) => ({ ...acc, [curr]: 0 }), {}),
            expenses: currentCategories.expenses.reduce((acc, curr) => ({ ...acc, [curr]: 0 }), {}),
            assets: { ...firstMonth.assets },
            liabilities: { ...firstMonth.liabilities },
            collaboratesInDebt: false,
            debtCollaboration: currentCategories.liabilities.reduce((acc, curr) => ({ ...acc, [curr]: 0 }), {}),
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
        loadData,
        isFirestoreAvailable,
        errorMessage
    };
};

