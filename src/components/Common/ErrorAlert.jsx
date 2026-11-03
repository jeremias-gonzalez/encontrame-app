import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export function ErrorAlert({ message, onRetry }) {
  return (
    <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl p-6 text-rose-800 dark:text-rose-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-300">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-bold text-base">Ocurrió un problema</h4>
          <p className="text-sm opacity-90">{message}</p>
        </div>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-sm whitespace-nowrap cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          Reintentar
        </button>
      )}
    </div>
  );
}

export default ErrorAlert;

