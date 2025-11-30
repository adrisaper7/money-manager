export const formatCurrency = (value, language = 'es', exchangeRates = null) => {
    const locales = {
        es: 'es-ES',
        en: 'en-US'
    };
    
    const currencies = {
        es: 'EUR',
        en: 'USD'
    };

    // Convertir moneda si se proporcionan tasas de cambio
    let displayValue = value;
    const targetCurrency = currencies[language] || 'EUR';
    
    if (exchangeRates && language === 'en') {
        // Convertir de EUR a USD
        displayValue = (value / (exchangeRates.EUR || 1)) * (exchangeRates.USD || 1.1);
    }

    return new Intl.NumberFormat(locales[language] || 'es-ES', {
        style: 'currency',
        currency: targetCurrency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(displayValue);
};

export const formatPercent = (value, language = 'es') => {
    const locales = {
        es: 'es-ES',
        en: 'en-US'
    };

    return new Intl.NumberFormat(locales[language] || 'es-ES', {
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
    }).format(value / 100);
};

export const generateMonthId = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

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