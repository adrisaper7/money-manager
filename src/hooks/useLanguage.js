import { translations } from '../i18n/translations';

export const useLanguage = () => {
    const t = (path) => {
        const keys = path.split('.');
        let value = translations.en;
        
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
        language: 'en',
        isLoading: false,
        t
    };
};
