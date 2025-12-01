import { useLanguage } from '../hooks/useLanguage';
import { useMonthNavigation } from '../contexts/MonthNavigationContext';
import { MonthSelector } from './navigation/MonthSelector';
import { MonthControls } from './navigation/MonthControls';
import { MonthInfo } from './navigation/MonthInfo';

export const MonthNavigationBar = ({ data, onAddPreviousMonth, onRemoveLastMonth }) => {
    const { totalMonths } = useMonthNavigation();
    const { t } = useLanguage();

    if (totalMonths === 0) return null;

    return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-200 p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-slate-800">{t('common.monthNavigation')}</h3>
                </div>
                <MonthControls
                    onAddPreviousMonth={onAddPreviousMonth}
                    onRemoveLastMonth={onRemoveLastMonth}
                />
            </div>

            {totalMonths > 1 && <MonthSelector data={data} />}
            <MonthInfo />
        </div>
    );
};
