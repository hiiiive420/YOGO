/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Info, X, XCircle } from 'lucide-react';

const ToastContext = createContext(null);

const icons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type = 'info', title, message }) => {
      const id = crypto.randomUUID();
      setToasts((current) => [...current, { id, type, title, message }]);
      window.setTimeout(() => removeToast(id), 4200);
    },
    [removeToast],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-[10000] grid w-[calc(100vw-2rem)] max-w-sm gap-3">
        <AnimatePresence>
          {toasts.map((toast) => {
            const Icon = icons[toast.type] || Info;

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 24, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 24, scale: 0.96 }}
                className="rounded-lg border border-white/10 bg-obsidian/95 p-4 text-pearl shadow-luxury backdrop-blur-xl"
              >
                <div className="flex gap-3">
                  <Icon
                    className={
                      toast.type === 'error' ? 'text-red-300' : 'text-champagne'
                    }
                    size={20}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold">{toast.title}</p>
                    {toast.message && (
                      <p className="mt-1 text-sm leading-6 text-pearl/62">
                        {toast.message}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    aria-label="Dismiss notification"
                    onClick={() => removeToast(toast.id)}
                    className="text-pearl/48 transition hover:text-pearl"
                  >
                    <X size={17} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used inside ToastProvider');
  }

  return context;
}
