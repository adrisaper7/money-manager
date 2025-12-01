import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Brush } from 'recharts';
import { X } from 'lucide-react';
import { formatCurrency } from '../../utils';

export const CategoryTrendModal = ({ isOpen, onClose, title, data, language, exchangeRates }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-slate-100 text-slate-500"
                        aria-label="Cerrar gráfico"
                    >
                        <X size={18} />
                    </button>
                </div>
                <div className="p-6">
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="monthLabel"
                                    stroke="#94a3b8"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#94a3b8"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(val) => formatCurrency(val, 'en', exchangeRates).replace(/\D00(?=\D*$)/, '')}
                                />
                                <Tooltip
                                    formatter={(value) => formatCurrency(value, 'en', exchangeRates)}
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        borderRadius: '8px',
                                        border: '1px solid #e2e8f0',
                                        fontSize: '12px'
                                    }}
                                />
                                <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} maxBarSize={32} />
                                <Brush dataKey="monthLabel" height={20} stroke="#2563eb" travellerWidth={10} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};
