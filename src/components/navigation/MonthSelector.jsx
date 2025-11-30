import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMonthNavigation } from '../../contexts/MonthNavigationContext';

export const MonthSelector = ({ data }) => {
    const {
        selectedMonthIndex,
        setSelectedMonthIndex,
        totalMonths,
        setEditMode
    } = useMonthNavigation();

    // Determinar si debemos agrupar por años (más de 24 meses = 2 años)
    const useYearGrouping = totalMonths > 24;

    // Agrupar meses por año cuando hay muchos meses
    const yearGroups = useMemo(() => {
        if (!useYearGrouping) return null;

        const groups = {};
        data.forEach((month, index) => {
            // Extraer el año del monthLabel (formato: "nov 2025")
            const year = month.monthLabel.split(' ')[1] || month.id.split('-')[0];
            if (!groups[year]) {
                groups[year] = {
                    year,
                    startIndex: index,
                    endIndex: index,
                    months: [month]
                };
            } else {
                groups[year].endIndex = index;
                groups[year].months.push(month);
            }
        });

        return Object.values(groups);
    }, [data, useYearGrouping]);

    const handlePrevMonth = () => {
        if (selectedMonthIndex > 0) {
            setSelectedMonthIndex(selectedMonthIndex - 1);
            setEditMode(false);
        }
    };

    const handleNextMonth = () => {
        if (selectedMonthIndex < totalMonths - 1) {
            setSelectedMonthIndex(selectedMonthIndex + 1);
            setEditMode(false);
        }
    };

    const handleSliderChange = (e) => {
        setSelectedMonthIndex(Number(e.target.value));
        setEditMode(false);
    };

    if (totalMonths <= 1) return null;

    const progressPercentage = totalMonths > 1 ? (selectedMonthIndex / (totalMonths - 1)) * 100 : 0;

    // Determinar qué año está seleccionado
    const selectedYear = useYearGrouping && yearGroups
        ? yearGroups.find(group => 
            selectedMonthIndex >= group.startIndex && selectedMonthIndex <= group.endIndex
        )?.year
        : null;

    return (
        <div className="flex items-center gap-4">
            <button
                onClick={handlePrevMonth}
                disabled={selectedMonthIndex === 0}
                className="p-2 rounded-lg bg-white border-2 border-blue-300 hover:bg-blue-50 hover:border-blue-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
            >
                <ChevronLeft size={20} className="text-blue-600" />
            </button>

            <div className="flex-1 relative">
                <input
                    type="range"
                    min="0"
                    max={totalMonths - 1}
                    value={selectedMonthIndex}
                    onChange={handleSliderChange}
                    className="w-full h-3 rounded-lg appearance-none cursor-pointer slider-custom"
                    style={{
                        background: `linear-gradient(to right, 
                            #3b82f6 0%, 
                            #3b82f6 ${progressPercentage}%, 
                            #cbd5e1 ${progressPercentage}%, 
                            #cbd5e1 100%)`
                    }}
                />
                {/* Marcadores - años si hay muchos meses, meses si hay pocos */}
                <div className="flex justify-between mt-2 px-1 relative" style={{ minHeight: '20px' }}>
                    {useYearGrouping && yearGroups ? (
                        // Mostrar años cuando hay muchos meses
                        yearGroups.map((group) => {
                            const isSelected = selectedYear === group.year;
                            // Calcular posición basada en el punto medio del grupo
                            const midPoint = (group.startIndex + group.endIndex) / 2;
                            const position = totalMonths > 1 ? (midPoint / (totalMonths - 1)) * 100 : 0;
                            
                            return (
                                <div
                                    key={group.year}
                                    className={`text-xs transition-all absolute ${isSelected
                                            ? 'font-bold text-blue-600'
                                            : 'text-slate-400'
                                        }`}
                                    style={{
                                        left: `${position}%`,
                                        transform: 'translateX(-50%)',
                                        whiteSpace: 'nowrap',
                                        zIndex: isSelected ? 10 : 1
                                    }}
                                >
                                    {group.year}
                                </div>
                            );
                        })
                    ) : (
                        // Mostrar meses cuando hay pocos meses
                        data.map((month, idx) => (
                            <div
                                key={month.id}
                                className={`text-xs transition-all ${idx === selectedMonthIndex
                                        ? 'font-bold text-blue-600 scale-110'
                                        : 'text-slate-400'
                                    }`}
                                style={{
                                    width: `${100 / totalMonths}%`,
                                    textAlign: 'center'
                                }}
                            >
                                {month.monthLabel.split(' ')[0]}
                            </div>
                        ))
                    )}
                </div>
            </div>

            <button
                onClick={handleNextMonth}
                disabled={selectedMonthIndex === totalMonths - 1}
                className="p-2 rounded-lg bg-white border-2 border-blue-300 hover:bg-blue-50 hover:border-blue-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
            >
                <ChevronRight size={20} className="text-blue-600" />
            </button>
        </div>
    );
};

