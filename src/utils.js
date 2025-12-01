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

    // Si el usuario ha elegido una moneda en la configuración, usarla
    try {
        if (typeof window !== 'undefined' && window.localStorage) {
            const savedCurrency = localStorage.getItem('fireApp_currency');
            if (savedCurrency && (savedCurrency === 'EUR' || savedCurrency === 'USD')) {
                targetCurrency = savedCurrency;
            }
        }
    } catch (_error) {
        // Ignorar errores de acceso a localStorage (modo incógnito, etc.)
    }

    // No convertir el valor numérico, solo cambiar el símbolo de la moneda
    let displayValue = value;
    // La conversión de moneda ha sido deshabilitada intencionalmente
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

export const downloadData = (data, filename = 'fire_dashboard_data_es.json') => {
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
                alert('Error al cargar el archivo. Por favor, verifica que sea un archivo JSON válido.');
            }
        }
    };
    fileReader.onerror = () => {
        if (onError) {
            onError(new Error('Error al leer el archivo'));
        }
    };
};