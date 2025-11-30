import React from 'react';
import { Globe } from 'lucide-react';

export const LanguageSwitcher = ({ language, onChangeLanguage, t }) => {
    return (
        <div className="flex items-center gap-2 px-4">
            <Globe size={18} className="text-slate-600" />
            <select
                value={language}
                onChange={(e) => onChangeLanguage(e.target.value)}
                className="px-3 py-1 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
            >
                <option value="es">Español</option>
                <option value="en">English</option>
            </select>
        </div>
    );
};
