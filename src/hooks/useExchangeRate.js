import { useState, useEffect } from 'react';

const CACHE_KEY = 'fireApp_exchangeRates';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas

export const useExchangeRate = () => {
    const [rates, setRates] = useState({ EUR: 1, USD: 1 });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRates = async () => {
            try {
                // Verificar si hay datos en caché
                const cachedData = localStorage.getItem(CACHE_KEY);
                if (cachedData) {
                    const { rates: cachedRates, timestamp } = JSON.parse(cachedData);
                    if (Date.now() - timestamp < CACHE_DURATION) {
                        setRates(cachedRates);
                        setIsLoading(false);
                        return;
                    }
                }

                // Usar API de exchangerate-api.com (gratuita y confiable)
                // La alternativa es usar Google Sheets como API pero esta es más directa
                const response = await fetch('https://api.exchangerate-api.com/v4/latest/EUR');
                
                if (!response.ok) throw new Error('Error al obtener tasas de cambio');
                
                const data = await response.json();
                const newRates = {
                    EUR: 1,
                    USD: data.rates.USD || 1.1 // Valor por defecto si falla
                };

                // Guardar en caché
                localStorage.setItem(CACHE_KEY, JSON.stringify({
                    rates: newRates,
                    timestamp: Date.now()
                }));

                setRates(newRates);
                setError(null);
            } catch (err) {
                console.error('Error fetching exchange rates:', err);
                setError(err.message);
                // Usar valores por defecto si falla la API
                setRates({ EUR: 1, USD: 1.1 });
            } finally {
                setIsLoading(false);
            }
        };

        fetchRates();
    }, []);

    return {
        rates,
        isLoading,
        error,
        convert: (amount, from = 'EUR', to = 'USD') => {
            if (from === to) return amount;
            const rateFromEUR = rates[from] || 1;
            const rateToEUR = rates[to] || 1;
            return (amount / rateFromEUR) * rateToEUR;
        }
    };
};
