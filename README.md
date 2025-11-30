# 💰 Money Manager Dashboard

A comprehensive financial dashboard built with React, Vite, and Firebase for tracking personal finances, assets, liabilities, and FIRE (Financial Independence, Retire Early) calculations.

## ✨ Features

- **🏦 Net Worth Tracking**: Monitor assets, liabilities, and overall net worth over time
- **📊 Budget Management**: Track income, taxes, and expenses with savings rate calculations
- **🔥 FIRE Projections**: Calculate retirement timeline based on current savings and investment strategies
- **📈 Interactive Charts**: Visualize financial data with Recharts
- **🌍 Multi-language Support**: English and Spanish translations
- **💾 Cloud Sync**: Firebase Firestore integration for data persistence
- **📱 Responsive Design**: Works on desktop and mobile devices
- **🎨 Modern UI**: Built with Tailwind CSS and Lucide icons

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Backend**: Firebase (Firestore, Authentication)
- **Build Tool**: Vite

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Firebase project with Firestore enabled

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/money-manager.git
cd money-manager
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Configure your Firebase credentials in `.env`:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=1:1234567890:web:abcdefghijk
```

5. Start the development server:
```bash
npm run dev
```

### Building for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 🔧 Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database
3. Enable Authentication (Email/Password)
4. Configure Firestore security rules (see `FIRESTORE_SETUP.md`)
5. Copy your Firebase configuration to `.env`

## 📱 Usage

1. **Sign Up/Login**: Create an account or sign in with email and password
2. **Add Data**: Enter your financial data for the current month
3. **Track Progress**: Monitor your net worth, savings rate, and FIRE progress
4. **Language**: Switch between English and Spanish using the language toggle
5. **Export/Import**: Download your data or upload previous data files

## 🌍 Languages

- English (en)
- Spanish (es)

## 📊 Features Overview

### Net Worth View
- Track assets (Bank, Emergency Fund, Investment Portfolio, etc.)
- Monitor liabilities (Mortgage, Car Loan, Credit Cards, etc.)
- View net worth trends over time
- Calculate debt collaboration progress

### Budget View
- Income tracking (Salary, Bonus, Dividends, etc.)
- Tax calculations (Income Tax, Social Security, etc.)
- Expense categorization (Housing, Groceries, Transportation, etc.)
- Automatic savings rate calculation

### Dashboard
- Overview charts and key metrics
- Asset allocation visualization
- FIRE projection timeline
- Monthly cash flow analysis

## 🔒 Security

- Firebase Authentication for secure user access
- Firestore security rules for data protection
- Environment variables for credential management
- No sensitive data exposed in client-side code

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React](https://reactjs.org/) for the frontend framework
- [Vite](https://vitejs.dev/) for the build tool
- [Firebase](https://firebase.google.com/) for backend services
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Recharts](https://recharts.org/) for data visualization
- [Lucide](https://lucide.dev/) for icons

## 📞 Support

If you have any questions or issues, please open an issue on GitHub.
