import React, { useState, useEffect, useRef } from 'react';

export const OptimizedNumberInput = ({ 
    value, 
    onChange, 
    placeholder = "0", 
    disabled = false,
    className = "",
    min = -999999999999,
    max = 999999999999
}) => {
    const [localValue, setLocalValue] = useState(value?.toString() || '');
    const [isFocused, setIsFocused] = useState(false);
    const timeoutRef = useRef(null);
    const inputRef = useRef(null);

    // Sincronizar con el valor externo cuando no estamos enfocados
    useEffect(() => {
        if (!isFocused) {
            setLocalValue(value?.toString() || '');
        }
    }, [value, isFocused]);

    const handleChange = (e) => {
        const newValue = e.target.value;
        setLocalValue(newValue);

        // Validar y actualizar inmediatamente para respuesta rápida
        if (newValue === '') {
            onChange?.('');
            return;
        }

        const numValue = Number(newValue);
        if (numValue >= min && numValue <= max) {
            onChange?.(newValue);
        } else {
            console.warn('Número fuera de rango:', newValue);
            // Revertir al valor anterior
            setLocalValue(value?.toString() || '');
        }
    };

    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleBlur = () => {
        setIsFocused(false);
        // Asegurar sincronización final
        const finalValue = localValue || '0';
        const numValue = Number(finalValue);
        if (numValue >= min && numValue <= max) {
            onChange?.(finalValue);
        } else {
            setLocalValue(value?.toString() || '');
        }
    };

    return (
        <input
            ref={inputRef}
            type="number"
            value={localValue}
            placeholder={placeholder}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled}
            className={className}
        />
    );
};
