import React from 'react';
import { Wallet, Target, Activity, TrendingUp } from 'lucide-react';
import { formatCurrency, formatPercent } from '../utils';

const colorClasses = {
    emerald: 'bg-emerald-50 text-emerald-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    amber: 'bg-amber-50 text-amber-600',
    blue: 'bg-blue-50 text-blue-600',
};

export const KPICard = ({ title, value, subtext, icon: Icon, color = "blue" }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-start justify-between">
        <div>
            <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
            {subtext && <p className="text-xs text-slate-400 mt-2">{subtext}</p>}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color] || colorClasses.blue}`}>
            <Icon size={24} />
        </div>
    </div>
);
