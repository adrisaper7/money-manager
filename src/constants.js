export const initialConfig = {
    targetInvestment: 1000000, // Objetivo de inversión (cantidad en activos invertidos)
    targetYear: 2035, // Año objetivo para alcanzar el objetivo de inversión
    expectedReturn: 7.0, // Retorno anual esperado (para cálculos de proyección)
    monthlyInvestment: null,
    investmentRate: 15, // % de ingresos netos destinado a inversión
};

export const categoriesByLanguage = {
    es: {
        assets: ['Banco', 'Fondo Emergencia', 'Cartera Inversión', 'Fondos Indexados', 'Planes Pensiones', 'Inmobiliario', 'Cripto'],
        liabilities: ['Hipoteca', 'Préstamo Coche', 'Tarjetas', 'Otros'],
        income: ['Salario Bruto', 'Bonus', 'Dividendos', 'Negocio', 'Otros'],
        taxes: ['IRPF', 'Seguridad Social', 'Cuota Autónomos'],
        expenses: ['Vivienda', 'Supermercado', 'Restaurantes', 'Suministros', 'Seguros', 'Transporte', 'Ocio', 'Salud', 'Varios']
    },
    en: {
        assets: ['Bank', 'Emergency Fund', 'Investment Portfolio', 'Index Funds', 'Pension Plans', 'Real Estate', 'Crypto'],
        liabilities: ['Mortgage', 'Car Loan', 'Credit Cards', 'Other'],
        income: ['Gross Salary', 'Bonus', 'Dividends', 'Business', 'Other'],
        taxes: ['Income Tax', 'Social Security', 'Self-Employment Tax'],
        expenses: ['Housing', 'Groceries', 'Restaurants', 'Utilities', 'Insurance', 'Transportation', 'Leisure', 'Health', 'Miscellaneous']
    }
};

// Helper function to get categories for current language
export const getCategoriesForLanguage = (language) => {
    return categoriesByLanguage[language] || categoriesByLanguage.es;
};

// Default categories (Spanish - for backward compatibility)
export const defaultCategories = categoriesByLanguage.es;

// Categorías consideradas como objetivos de inversión (no incluir inmuebles que no generan "% anual")
export const investmentCategoriesByLanguage = {
    es: ['Fondo Emergencia', 'Cartera Inversión', 'Fondos Indexados', 'Planes Pensiones', 'Cripto'],
    en: ['Emergency Fund', 'Investment Portfolio', 'Index Funds', 'Pension Plans', 'Crypto']
};

export const getInvestmentCategoriesForLanguage = (language) => {
    return investmentCategoriesByLanguage[language] || investmentCategoriesByLanguage.es;
};

// Default investment categories (Spanish - for backward compatibility)
export const investmentCategories = investmentCategoriesByLanguage.es;
