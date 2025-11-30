import React from 'react';
import { useMonthNavigation } from '../contexts/MonthNavigationContext';

export const DebtCollaborationToggle = ({ data, updateData, t }) => {
    const { selectedMonth, editMode } = useMonthNavigation();
    const currentMonthId = selectedMonth?.id;
    const isCurrentMonth = selectedMonth && new Date(selectedMonth.id) >= new Date(new Date().getFullYear(), new Date().getMonth());

    if (!selectedMonth) {
        return null;
    }

    const isCollaborating = selectedMonth?.collaboratesInDebt || false;
    const canEdit = isCurrentMonth || editMode;

    const handleToggle = () => {
        if (!canEdit) return;
        updateData(currentMonthId, 'collaboratesInDebt', '', !isCollaborating);
    };

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">{t('investments.debtCollaboration')}</h3>
            
            <div className="flex items-center gap-3">
                <label className="flex items-center cursor-pointer gap-3">
                    <input
                        type="checkbox"
                        checked={isCollaborating}
                        onChange={handleToggle}
                        disabled={!canEdit}
                        className="w-5 h-5 rounded border-2 border-slate-300 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    <span className={`text-base font-medium ${isCollaborating ? 'text-emerald-600' : 'text-slate-600'}`}>
                        {isCollaborating ? t('investments.collaboratingYes') : t('investments.collaboratingNo')}
                    </span>
                </label>
            </div>
        </div>
    );
};
