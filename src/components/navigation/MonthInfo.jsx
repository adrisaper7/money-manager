import React from 'react';
import { generateMonthId } from '../../utils';
import { useMonthNavigation } from '../../contexts/MonthNavigationContext';
import { useLanguage } from '../../hooks/useLanguage';

export const MonthInfo = () => {
    const {
        selectedMonth,
        selectedMonthIndex,
        editMode,
        totalMonths
    } = useMonthNavigation();
    const { t } = useLanguage();

    const currentMonthId = generateMonthId(new Date());
    const isCurrentMonth = selectedMonth?.id === currentMonthId;

    return (
        <div className="mt-4 text-center">
            <span className="text-xl font-bold text-slate-800">
                {selectedMonth?.monthLabel}
            </span>
            {isCurrentMonth && (
                <span className="ml-3 text-sm bg-blue-600 text-white px-3 py-1 rounded-full shadow-sm">
                    {t('common.currentMonth')}
                </span>
            )}
            {editMode && !isCurrentMonth && (
                <span className="ml-3 text-sm bg-amber-600 text-white px-3 py-1 rounded-full shadow-sm animate-pulse">
                    {t('common.editModeActive')}
                </span>
            )}
            {totalMonths > 1 && (
                <span className="ml-3 text-sm text-slate-600 bg-white px-3 py-1 rounded-full border border-slate-300">
                    {t('common.monthCount')
                        .replace('{{current}}', selectedMonthIndex + 1)
                        .replace('{{total}}', totalMonths)}
                </span>
            )}
        </div>
    );
};

