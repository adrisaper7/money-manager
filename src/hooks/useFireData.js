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
                const categoryMap = {
                    'es_en': {
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
                        'Gas (Hogar)': 'Gas (Home)',
                        'Electricidad': 'Electric',
                        'Internet': 'Internet',
                        'Seguros': 'Insurance',
                        'Supermercado': 'Groceries',
                        'Comer fuera': 'Eating Out',
                        'Gasolina': 'Gas (Car)',
                        'Transporte compartido': 'Rideshare',
                        'Transporte público': 'Public Transit',
                        'Peajes': 'Tolls',
                        'Entretenimiento': 'Entertainment',
                        'Ropa': 'Clothing',
                        'Cuidado personal': 'Self Care',
                        'Tintorería': 'Dry Cleaning',
                        'Gimnasio': 'Gym',
                        'Música': 'Music',
                        'Educación': 'Education',
                        'Médico': 'Medical',
                        'Regalos': 'Gifts',
                        'Donaciones': 'Charity',
                        'Comisiones': 'Fees',
                        'Varios': 'Misc'
                    },
                    'en_es': {
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
                        'Gas (Home)': 'Gas (Hogar)',
                        'Electric': 'Electricidad',
                        'Internet': 'Internet',
                        'Insurance': 'Seguros',
                        'Groceries': 'Supermercado',
                        'Eating Out': 'Comer fuera',
                        'Gas (Car)': 'Gasolina',
                        'Rideshare': 'Transporte compartido',
                        'Public Transit': 'Transporte público',
                        'Tolls': 'Peajes',
                        'Entertainment': 'Entretenimiento',
                        'Clothing': 'Ropa',
                        'Self Care': 'Cuidado personal',
                        'Dry Cleaning': 'Tintorería',
                        'Gym': 'Gimnasio',
                        'Music': 'Música',
                        'Education': 'Educación',
                        'Medical': 'Médico',
                        'Gifts': 'Regalos',
                        'Charity': 'Donaciones',
                        'Fees': 'Comisiones',
                        'Misc': 'Varios'
                    }
                };

                // Map old categories to new categories
                toCategories[type].forEach(newCategory => {
                    // Look up the old category name in the source language
                    const mapKey = `${fromLang}_${toLang}`;
                    const oldCategoryName = categoryMap[mapKey]?.[newCategory];
                    
                    if (oldCategoryName && month[type]?.[oldCategoryName] !== undefined) {
                        // Found the old category name, use its value
                        migratedValues[newCategory] = month[type][oldCategoryName];
                    } else if (month[type]?.[newCategory] !== undefined) {
                        // Category name is the same in both languages
                        migratedValues[newCategory] = month[type][newCategory];
                    } else {
                        // Category not found, default to 0
                        migratedValues[newCategory] = 0;
                    }
                });

                migratedMonth[type] = migratedValues;
            });

            // Migrate debtCollaboration
            if (migratedMonth.debtCollaboration) {
                const migratedDebtCollaboration = {};
                const debtMap = {
                    'es_en': {
                        'Hipoteca': 'Mortgage',
                        'Préstamo Coche': 'Car Loan',
                        'Tarjetas': 'Credit Cards',
                        'Otros': 'Other'
                    },
                    'en_es': {
                        'Mortgage': 'Hipoteca',
                        'Car Loan': 'Préstamo Coche',
                        'Credit Cards': 'Tarjetas',
                        'Other': 'Otros'
                    }
                };

                toCategories.liabilities.forEach(newCategory => {
                    const mapKey = `${fromLang}_${toLang}`;
                    const oldCategoryName = debtMap[mapKey]?.[newCategory];
                    
                    if (oldCategoryName && month.debtCollaboration?.[oldCategoryName] !== undefined) {
                        migratedDebtCollaboration[newCategory] = month.debtCollaboration[oldCategoryName];
                    } else if (month.debtCollaboration?.[newCategory] !== undefined) {
                        migratedDebtCollaboration[newCategory] = month.debtCollaboration[newCategory];
                    } else {
                        migratedDebtCollaboration[newCategory] = 0;
                    }
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
        // Also keep localStorage as backup and notify other tabs
        if (data.length > 0) {
            const storageKey = currentUserId ? `fireData_${currentUserId}_v1` : 'fireData_es_v1';
            try {
                localStorage.setItem(storageKey, JSON.stringify(data));
                // Write a companion timestamp key to reliably notify other tabs of an update
                localStorage.setItem(`${storageKey}_updatedAt`, String(Date.now()));
                console.log('Data saved to localStorage:', storageKey);
            } catch (err) {
                console.error('Error saving to localStorage:', err);
            }
        }
    }, [data, currentUserId, getUserDocRef]);

    // Sync across multiple open tabs/windows using the storage event.
    useEffect(() => {
        const handleStorage = (event) => {
            if (!event.key) return;

            // Determine the storageKey for this context (user or anonymous)
            const expectedPrefix = currentUserId ? `fireData_${currentUserId}_v1` : 'fireData_es_v1';

            // If the relevant data key or the companion updatedAt key changed, reload from storage
            if (event.key === expectedPrefix || event.key === `${expectedPrefix}_updatedAt`) {
                try {
                    const raw = localStorage.getItem(expectedPrefix);
                    if (!raw) return;
                    const parsed = JSON.parse(raw);

                    // Simple check to avoid unnecessary setState calls
                    const currentString = JSON.stringify(data || []);
                    const incomingString = JSON.stringify(parsed || []);
                    if (currentString !== incomingString) {
                        console.log('Detected external localStorage update, syncing data from storage');
                        setData(parsed.map(month => ({
                            ...month,
                            debtCollaboration: month.debtCollaboration || currentCategories.liabilities.reduce((acc, curr) => ({ ...acc, [curr]: 0 }), {})
                        })));
                    }
                } catch (err) {
                    console.error('Failed to parse localStorage data during sync:', err);
                }
            }
        };

        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, [currentUserId, data, currentCategories.liabilities]);

    const updateData = (monthId, type, category, value) => {
        console.log('updateData called:', { monthId, type, category, value });
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

                // No auto-calculation for Bank - it's independent
                // Bank value is only updated when directly edited

                console.log('updatedItem for month', monthId, updatedItem);
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

