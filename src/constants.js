export const initialConfig = {
    targetInvestment: 1000000, // Objetivo de inversión (cantidad en activos invertidos)
    targetYear: 2035, // Año objetivo para alcanzar el objetivo de inversión
    expectedReturn: 7.0, // Retorno anual esperado (para cálculos de proyección)
};

export const defaultCategories = {
    assets: ['Banco', 'Fondo Emergencia', 'Cartera Inversión', 'Fondos Indexados', 'Planes Pensiones', 'Inmobiliario', 'Cripto'],
    liabilities: ['Hipoteca', 'Préstamo Coche', 'Tarjetas', 'Otros'],
    income: ['Salario Bruto', 'Bonus', 'Dividendos', 'Negocio', 'Otros'],
    taxes: ['IRPF', 'Seguridad Social', 'Cuota Autónomos'],
    expenses: ['Vivienda', 'Supermercado', 'Restaurantes', 'Suministros', 'Seguros', 'Transporte', 'Ocio', 'Salud', 'Varios']
};

// Categorías consideradas como objetivos de inversión (no incluir inmuebles que no generan "% anual")
export const investmentCategories = [
    'Fondo Emergencia',
    'Cartera Inversión',
    'Fondos Indexados',
    'Planes Pensiones',
    'Cripto'
];
