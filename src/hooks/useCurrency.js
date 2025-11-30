import { useState, useEffect } from 'react';

export const useCurrency = () => {
    const [currency, setCurrency] = useState('EUR');
    const [isLoading, setIsLoading] = useState(true);

    // Initialize currency from localStorage
    useEffect(() => {
        const savedCurrency = localStorage.getItem('fireApp_currency');
        if (savedCurrency && (savedCurrency === 'EUR' || savedCurrency === 'USD')) {
            setCurrency(savedCurrency);
        } else {
            // Try to detect currency based on locale
            const locale = navigator.language || 'en-US';
            if (locale.includes('US')) {
                setCurrency('USD');
            } else {
                setCurrency('EUR');
            }
        }
        setIsLoading(false);
    }, []);

    const changeCurrency = (newCurrency) => {
        if (newCurrency === 'EUR' || newCurrency === 'USD') {
            setCurrency(newCurrency);
            localStorage.setItem('fireApp_currency', newCurrency);
        }
    };

    const getCurrencySymbol = (currencyCode) => {
        return currencyCode === 'USD' ? '$' : '€';
    };

    const formatCurrency = (amount, currencyCode = currency) => {
        const symbol = getCurrencySymbol(currencyCode);
        const formattedAmount = new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(Math.round(amount));
        
        return `${symbol}${formattedAmount}`;
    };

    return {
        currency,
        isLoading,
        changeCurrency,
        getCurrencySymbol,
        formatCurrency
    };
};
