import React from 'react';
import { Save, Upload } from 'lucide-react';

export const FileActions = ({ onDownload, onUpload }) => (
  <div className="hidden md:flex items-center space-x-4">
    <button
      onClick={onDownload}
      className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
    >
      <Save size={16} /> Guardar
    </button>
    <label className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors cursor-pointer">
      <Upload size={16} /> Cargar
      <input type="file" onChange={onUpload} className="hidden" accept=".json" />
    </label>
  </div>
);

