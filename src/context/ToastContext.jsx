import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(undefined);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (title, message, type = 'success') => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const newToast = { id, title, message, type };

      setToasts((prev) => [newToast, ...prev].slice(0, 3));

      setTimeout(() => {
        removeToast(id);
      }, 3600);
    },
    [removeToast]
  );

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-primary shrink-0" />;
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}

      {/* Contenedor Flotante Top-Center (Dynamic Island / macOS Banner) */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2.5 pointer-events-none w-full max-w-md px-4">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -24, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.92, transition: { duration: 0.2 } }}
              transition={{ type: 'spring', stiffness: 420, damping: 28 }}
              className="pointer-events-auto w-full glass-toast rounded-2xl p-3.5 sm:px-4 sm:py-3.5 flex items-center justify-between gap-3 text-text"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-1.5 rounded-xl bg-surface/70 dark:bg-surface/50 shadow-sm border border-slate-200/40 dark:border-white/10">
                  {getIcon(toast.type)}
                </div>
                <div className="min-w-0">
                  <h5 className="text-xs font-bold text-text truncate tracking-tight">
                    {toast.title}
                  </h5>
                  {toast.message && (
                    <p className="text-[11px] text-textMuted truncate mt-0.5">
                      {toast.message}
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="p-1 rounded-lg text-textMuted hover:text-text hover:bg-surface/50 transition-colors shrink-0"
                aria-label="Cerrar notificación"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast debe ser utilizado dentro de un ToastProvider');
  }
  return ctx;
}

