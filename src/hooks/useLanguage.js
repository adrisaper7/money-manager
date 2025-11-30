import { useState, useEffect } from 'react';
import { translations } from '../i18n/translations';

export const useLanguage = () => {
    const [language, setLanguage] = useState('es');
    const [isLoading, setIsLoading] = useState(true);

    // Initialize language from localStorage
    useEffect(() => {
        const savedLanguage = localStorage.getItem('fireApp_language');
        
        if (savedLanguage && (savedLanguage === 'es' || savedLanguage === 'en')) {
            setLanguage(savedLanguage);
        } else {
            // Try to detect browser language
            const browserLanguage = navigator.language.split('-')[0];
            
            const detectedLanguage = browserLanguage === 'es' ? 'es' : 'en';
            setLanguage(detectedLanguage);
        }
        setIsLoading(false);
    }, []);

    const changeLanguage = (lang) => {
        if (lang === 'es' || lang === 'en') {
            setLanguage(lang);
            localStorage.setItem('fireApp_language', lang);
        }
    };

    const t = (path) => {
        const keys = path.split('.');
        let value = translations[language];
        
        for (const key of keys) {
            if (value && typeof value === 'object') {
                value = value[key];
            } else {
                return path; // Return the path if translation not found
            }
        }
        
        return value || path;
    };

    return {
        language,
        isLoading,
        changeLanguage,
        t
    };
};
