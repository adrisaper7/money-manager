export const initialConfig = {
    targetInvestment: 1000000, // Investment goal (amount in invested assets)
    targetYear: 2035, // Target year to reach investment goal
    expectedReturn: 7.0, // Expected annual return (for projection calculations)
    monthlyInvestment: null,
    investmentRate: 15, // % of net income allocated to investment
};

export const categories = {
    assets: ['Bank', 'Emergency Fund', 'Investment Portfolio', 'Index Funds', 'Pension Plans', 'Real Estate', 'Crypto'],
    liabilities: ['Mortgage', 'Car Loan', 'Credit Cards', 'Other'],
    income: ['Gross Salary', 'Bonus', 'Dividends', 'Business', 'Other'],
    taxes: ['Income Tax', 'Social Security', 'Self-Employment Tax'],
    expenses: [
        'Housing', 'Gas (Home)', 'Electric', 'Internet', 'Insurance',
        'Groceries', 'Eating Out', 'Gas (Car)', 'Rideshare', 'Public Transit', 'Tolls',
        'Entertainment', 'Clothing', 'Self Care', 'Dry Cleaning', 'Gym',
        'Music', 'Education', 'Medical', 'Gifts', 'Charity', 'Fees', 'Misc'
    ]
};

// Helper function to get categories
export const getCategoriesForLanguage = () => {
    return categories;
};

// Default categories
export const defaultCategories = categories;

// Investment categories (assets that generate annual returns)
export const investmentCategories = ['Emergency Fund', 'Investment Portfolio', 'Index Funds', 'Pension Plans', 'Crypto'];

export const getInvestmentCategoriesForLanguage = () => {
    return investmentCategories;
};
