import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { generateMonthId } from '../utils';
import { defaultCategories, getCategoriesForLanguage } from '../constants';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useFirestoreStatus } from './useFirestoreStatus';

export const useFireData = (currentUserId) => {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const { isFirestoreAvailable, errorMessage } = useFirestoreStatus(currentUserId);

    // Debouncing para evitar conflictos con Firebase
    const saveTimeoutRef = useRef(null);
    const pendingSaveRef = useRef(null);

    // Get categories
    const currentCategories = useMemo(() => getCategoriesForLanguage(), []);

    // Helper function to generate initial data (1 month)
    const generateInitialData = () => {
        const initialData = [];
        for (let i = 0; i >= 0; i--) {  // Creates 1 month: current (i=0)
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const id = generateMonthId(d);
            initialData.push({
                id,
                monthLabel: d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
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

    // Load data on component mount and user changes
    useEffect(() => {
        if (!currentUserId) {
            console.log('⚠️ No user ID provided, no data loaded');
            return;
        }

        setIsLoading(true);
        console.log('🔄 Loading data from Firebase only for user:', currentUserId);

        // Only use Firebase (cloud storage)
        if (isFirestoreAvailable === true) {
            const userDocRef = getUserDocRef();
            if (!userDocRef) {
                console.log('❌ No user document reference available');
                setIsLoading(false);
                return;
            }

            console.log('☁️ Loading data from Firebase cloud for user:', currentUserId);
            const unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
                console.log('☁️ Firebase snapshot received:', docSnapshot.exists());
                if (docSnapshot.exists()) {
                    const firestoreData = docSnapshot.data().data || [];
                    console.log('✅ Data loaded from Firebase:', firestoreData.length, 'months');
                    setData(firestoreData);
                } else {
                    console.log('⚠️ No data in Firebase, creating initial data...');
                    const initialData = generateInitialData();
                    setData(initialData);
                    // Save to Firebase
                    setDoc(userDocRef, { data: initialData }, { merge: true })
                        .then(() => console.log('☁️ Initial data saved to Firebase'))
                        .catch(error => console.error('❌ Error saving initial data to Firebase:', error));
                }
                setIsLoading(false);
            }, (error) => {
                console.error('❌ Error loading from Firebase:', error);
                console.log('⚠️ Firebase error - no data loaded');
                setData(generateInitialData());
                setIsLoading(false);
            });

            return () => unsubscribe();
        } else {
            console.log('⚠️ Firebase not available - no data loaded');
            setData(generateInitialData());
            setIsLoading(false);
        }
    }, [currentUserId, isFirestoreAvailable, currentCategories]);

    // Migrate data when language changes

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
                monthLabel: newDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
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

    // Save data to Firebase only on change (with debouncing)
    useEffect(() => {
        if (data.length > 0 && currentUserId) {
            console.log('☁️ Scheduling Firebase save for user:', currentUserId);

            // Cancelar timeout anterior si existe
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }

            // Guardar referencia para el próximo save
            pendingSaveRef.current = data;

            // Programar save con debounce (1 segundo)
            saveTimeoutRef.current = setTimeout(() => {
                if (pendingSaveRef.current && isFirestoreAvailable === true) {
                    const userDocRef = getUserDocRef();
                    if (userDocRef) {
                        console.log('☁️ Executing debounced save to Firebase...');
                        setDoc(userDocRef, { data: pendingSaveRef.current }, { merge: true })
                            .then(() => console.log('☁️ Data saved to Firebase successfully'))
                            .catch(error => {
                                console.error('❌ Error saving to Firebase:', error);
                                console.log('⚠️ Data not saved - Firebase unavailable');
                            });
                    }
                }
                saveTimeoutRef.current = null;
                pendingSaveRef.current = null;
            }, 1000); // 1 segundo de debounce
        }

        // Cleanup
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, [data, currentUserId, isFirestoreAvailable, getUserDocRef]);

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
                    // Ensure we have valid numbers - handle empty string as 0
                    const rawValue = value === '' ? 0 : Number(value);
                    const newValue = isNaN(rawValue) ? 0 : rawValue;

                    updatedItem.debtCollaboration = {
                        ...item.debtCollaboration,
                        [category]: newValue
                    };
                }
                // Handle regular updates (income, taxes, expenses, assets, liabilities)
                else {
                    // Handle empty string as 0, ensure valid number
                    const rawValue = value === '' ? 0 : Number(value);
                    const newValue = isNaN(rawValue) ? 0 : rawValue;

                    updatedItem[type] = {
                        ...item[type],
                        [category]: newValue
                    };
                }

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
            monthLabel: prevDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
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
            alert('Cannot remove. At least one month must remain.');
            return;
        }

        const firstMonth = data[0];
        const monthLabel = firstMonth?.monthLabel || 'Unknown';
        const message = `Are you sure you want to remove month ${monthLabel}? (the oldest one)`;

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
        isLoading,
        isFirestoreAvailable,
        errorMessage
    };
};
