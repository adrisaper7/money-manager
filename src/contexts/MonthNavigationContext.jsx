import React, { createContext, useContext, useState, useEffect } from 'react';

const MonthNavigationContext = createContext();

export const useMonthNavigation = () => {
    const context = useContext(MonthNavigationContext);
    if (!context) {
        throw new Error('useMonthNavigation must be used within MonthNavigationProvider');
    }
    return context;
};

export const MonthNavigationProvider = ({ children, data }) => {
    const [selectedMonthIndex, setSelectedMonthIndex] = useState(Math.max(0, data.length - 1));
    const [editMode, setEditMode] = useState(false);

    // Ajustar índice si los datos cambian
    useEffect(() => {
        if (data.length === 0) {
            setSelectedMonthIndex(0);
        } else if (selectedMonthIndex >= data.length) {
            setSelectedMonthIndex(Math.max(0, data.length - 1));
        }
    }, [data.length]); // Remover selectedMonthIndex de las dependencias para evitar loops

    const value = {
        selectedMonthIndex,
        setSelectedMonthIndex,
        editMode,
        setEditMode,
        selectedMonth: data.length > 0 ? data[selectedMonthIndex] : null,
        totalMonths: data.length
    };

    return (
        <MonthNavigationContext.Provider value={value}>
            {children}
        </MonthNavigationContext.Provider>
    );
};
