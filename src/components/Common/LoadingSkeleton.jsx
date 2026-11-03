import React from 'react';

export function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Skeleton de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-surface rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800/60 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-700/60"></div>
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-slate-200 dark:bg-slate-700/60 rounded w-1/2"></div>
              <div className="h-6 bg-slate-300 dark:bg-slate-600/70 rounded w-1/3"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Skeleton de Cards de Mascotas */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-surface rounded-2xl border border-slate-200/60 dark:border-slate-800/60 overflow-hidden p-5 space-y-4 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-200 dark:bg-slate-700"></div>
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/2"></div>
              </div>
            </div>
            <div className="h-14 bg-slate-100 dark:bg-slate-800/50 rounded-xl"></div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800/60">
              <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-lg w-24"></div>
              <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-lg w-20"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LoadingSkeleton;

