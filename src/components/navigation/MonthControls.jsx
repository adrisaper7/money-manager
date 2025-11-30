import React from 'react';
import { Lock, Unlock, Plus, Trash2 } from 'lucide-react';
import { generateMonthId } from '../../utils';
import { useMonthNavigation } from '../../contexts/MonthNavigationContext';

export const MonthControls = ({ onAddPreviousMonth, onRemoveLastMonth }) => {
    const {
        selectedMonth,
        selectedMonthIndex,
        editMode,
        setEditMode,
        totalMonths
    } = useMonthNavigation();

    const currentMonthId = generateMonthId(new Date());
    const isCurrentMonth = selectedMonth?.id === currentMonthId;
    const isLastMonth = selectedMonthIndex === totalMonths - 1;
    const isFirstMonth = selectedMonthIndex === 0;
    
    const canDeleteFirstMonth = totalMonths > 1 && isFirstMonth && editMode;

    const toggleEditMode = () => {
        setEditMode(!editMode);
    };

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={onAddPreviousMonth}
                className="text-sm bg-green-600 text-white px-3 py-1.5 rounded-md hover:bg-green-700 flex items-center gap-1 transition-colors shadow-sm"
                title="Agregar mes anterior"
            >
                <Plus size={14} />
                Mes Anterior
            </button>

            {(!isCurrentMonth || isLastMonth) && (
                <button
                    onClick={toggleEditMode}
                    className={`text-sm px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-md font-medium ${editMode
                            ? 'bg-amber-600 text-white hover:bg-amber-700 hover:shadow-lg'
                            : 'bg-slate-700 text-white hover:bg-slate-800 hover:shadow-lg'
                        }`}
                >
                    {editMode ? <Unlock size={16} /> : <Lock size={16} />}
                    {editMode ? 'Bloquear Edición' : 'Habilitar Edición'}
                </button>
            )}

            {canDeleteFirstMonth && onRemoveLastMonth && (
                <button
                    onClick={onRemoveLastMonth}
                    className="text-sm bg-red-600 text-white px-3 py-1.5 rounded-md hover:bg-red-700 flex items-center gap-1 transition-colors shadow-sm"
                    title="Eliminar primer mes (el más antiguo, solo si está vacío)"
                >
                    <Trash2 size={14} />
                    Eliminar Mes
                </button>
            )}
        </div>
    );
};

