export const formatNumberWithComma = (value, minimumDecimals = 2, maximumDecimals = 2) => {
    if (value === null || value === undefined || isNaN(value)) {
        return '0,00';
    }

    const number = Number(value);
    const rounded = number.toFixed(maximumDecimals);
    const [integerPart, decimalPart] = rounded.split('.');

    // Add thousands separator with dots
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    // Ensure we have the required number of decimal places
    const paddedDecimal = decimalPart.padEnd(maximumDecimals, '0').slice(0, maximumDecimals);

    return `${formattedInteger},${paddedDecimal}`;
};

export const formatCurrency = (value, _language = 'en', _exchangeRates = null) => {
    // Default currency (EUR)
    let targetCurrency = 'EUR';

    // If the user has chosen a currency in the settings, use it
    try {
        if (typeof window !== 'undefined' && window.localStorage) {
            const savedCurrency = localStorage.getItem('fireApp_currency');
            if (savedCurrency && (savedCurrency === 'EUR' || savedCurrency === 'USD')) {
                targetCurrency = savedCurrency;
            }
        }
    } catch (_error) {
        // Ignore localStorage access errors (incognito mode, etc.)
    }

    // Do not convert the numeric value, only change the currency symbol
    let displayValue = value;
    // Currency conversion has been intentionally disabled
    // if (_exchangeRates && targetCurrency === 'USD') {
    //     displayValue = (value / (_exchangeRates.EUR || 1)) * (_exchangeRates.USD || 1.1);
    // }

    const currencySymbol = targetCurrency === 'USD' ? '$' : '€';
    return `${currencySymbol}${formatNumberWithComma(displayValue)}`;
};

export const formatPercent = (value, _language = 'en') => {
    if (value === null || value === undefined || isNaN(value)) {
        return '0,0%';
    }

    const number = Number(value);
    const formattedValue = formatNumberWithComma(number, 1, 1);
    return `${formattedValue}%`;
};

export const generateMonthId = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

export const calculateAverageMonthlyInvestment = (data = [], monthsWindow = 60) => {
    if (!Array.isArray(data) || data.length === 0) return 0;

    const monthsToAvg = Math.min(data.length, monthsWindow);
    if (monthsToAvg === 0) return 0;

    const recentData = data.slice(-monthsToAvg);

    const totalSavings = recentData.reduce((acc, month) => {
        const grossIncome = Object.values(month?.income || {}).reduce((a, b) => a + Number(b || 0), 0);
        const taxes = Object.values(month?.taxes || {}).reduce((a, b) => a + Number(b || 0), 0);
        const expenses = Object.values(month?.expenses || {}).reduce((a, b) => a + Number(b || 0), 0);
        const netIncome = grossIncome - taxes;
        const monthlySavings = netIncome - expenses;
        return acc + monthlySavings;
    }, 0);

    return totalSavings / monthsToAvg;
};

export const calculateAverageNetIncome = (data = [], monthsWindow = 60) => {
    if (!Array.isArray(data) || data.length === 0) return { averageNetIncome: 0, monthsUsed: 0 };

    const monthsToAvg = Math.min(data.length, monthsWindow);
    if (monthsToAvg === 0) return { averageNetIncome: 0, monthsUsed: 0 };

    const recentData = data.slice(-monthsToAvg);

    const totalNetIncome = recentData.reduce((acc, month) => {
        const grossIncome = Object.values(month?.income || {}).reduce((a, b) => a + Number(b || 0), 0);
        const taxes = Object.values(month?.taxes || {}).reduce((a, b) => a + Number(b || 0), 0);
        const netIncome = grossIncome - taxes;
        return acc + netIncome;
    }, 0);

    return { averageNetIncome: totalNetIncome / monthsToAvg, monthsUsed: monthsToAvg };
};

export const calculateMedianMonthlyInvestment = (data = [], monthsWindow = 60) => {
    if (!Array.isArray(data) || data.length === 0) return 0;

    const monthsToUse = Math.min(data.length, monthsWindow);
    if (monthsToUse === 0) return 0;

    const recentData = data.slice(-monthsToUse);

    const savingsSeries = recentData.map(month => {
        const grossIncome = Object.values(month?.income || {}).reduce((a, b) => a + Number(b || 0), 0);
        const taxes = Object.values(month?.taxes || {}).reduce((a, b) => a + Number(b || 0), 0);
        const expenses = Object.values(month?.expenses || {}).reduce((a, b) => a + Number(b || 0), 0);
        const netIncome = grossIncome - taxes;
        return netIncome - expenses;
    }).sort((a, b) => a - b);

    const mid = Math.floor(savingsSeries.length / 2);
    if (savingsSeries.length % 2 === 0) {
        return (savingsSeries[mid - 1] + savingsSeries[mid]) / 2;
    }
    return savingsSeries[mid];
};

export const calculatePercentageBasedInvestment = ({ data = [], investmentRate = 0, monthsWindow = 6 } = {}) => {
    if (!Array.isArray(data) || data.length === 0) {
        return { monthlyInvestment: 0, averageNetIncome: 0, monthsUsed: 0 };
    }

    const monthsUsed = Math.min(data.length, monthsWindow);
    if (monthsUsed === 0) {
        return { monthlyInvestment: 0, averageNetIncome: 0, monthsUsed: 0 };
    }

    const recentData = data.slice(-monthsUsed);
    const totalNetIncome = recentData.reduce((acc, month) => {
        const grossIncome = Object.values(month?.income || {}).reduce((a, b) => a + Number(b || 0), 0);
        const taxes = Object.values(month?.taxes || {}).reduce((a, b) => a + Number(b || 0), 0);
        return acc + (grossIncome - taxes);
    }, 0);

    const averageNetIncome = totalNetIncome / monthsUsed;
    const monthlyInvestment = investmentRate > 0
        ? Math.max(0, Math.round((averageNetIncome * investmentRate) / 100))
        : 0;

    return {
        monthlyInvestment,
        averageNetIncome,
        monthsUsed,
    };
};

export const calculateCategoryAverages = (data = [], type, categories = [], monthsWindow = 6) => {
    if (!Array.isArray(data) || data.length === 0 || !type || !categories.length) {
        return {};
    }

    // Use only the last specified number of months (default 6)
    const recentData = data.slice(-monthsWindow);

    const averages = {};

    categories.forEach(category => {
        const values = recentData.map(month => Number(month?.[type]?.[category] || 0));
        const validValues = values.filter(val => val > 0);

        if (validValues.length > 0) {
            averages[category] = validValues.reduce((sum, val) => sum + val, 0) / validValues.length;
        } else {
            averages[category] = 0;
        }
    });

    return averages;
};

export const downloadData = (data, filename = 'money_manager_data.json') => {
    const jsonString = JSON.stringify(data);
    const blob = new Blob([jsonString], { type: "application/json" });
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const uploadData = (file, onSuccess, onError) => {
    const fileReader = new FileReader();
    fileReader.readAsText(file, "UTF-8");
    fileReader.onload = e => {
        try {
            const parsedData = JSON.parse(e.target.result);
            onSuccess(parsedData);
        } catch (error) {
            if (onError) {
                onError(error);
            } else {
                alert('Error loading file. Please verify it is a valid JSON file.');
            }
        }
    };
    fileReader.onerror = () => {
        if (onError) {
            onError(new Error('Error reading file'));
        }
    };
};