import React from 'react';
import { PieChart } from 'lucide-react';

export const Logo = ({ t }) => (
  <div className="flex items-center gap-2">
    <div className="bg-blue-600 p-2 rounded-lg text-white">
      <PieChart size={20} />
    </div>
    <span className="font-bold text-xl tracking-tight text-slate-800">
      {t ? t('app.title') : 'Gestor de Dinero'}
    </span>
  </div>
);

