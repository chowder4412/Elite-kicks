import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Info, AlertTriangle, AlertCircle } from 'lucide-react';

export type ToastType = 'success' | 'info' | 'warning' | 'error';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

interface NotificationToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export default function NotificationToast({ toasts, onDismiss }: NotificationToastProps) {
  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-55 flex flex-col gap-2 w-[90%] max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastCard({ toast, onDismiss }: { toast: ToastMessage; onDismiss: (id: string) => void; key?: string }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-400 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />,
  };

  const bgColors = {
    success: 'bg-emerald-950 border-emerald-900 text-emerald-100',
    info: 'bg-blue-950 border-blue-900 text-blue-100',
    warning: 'bg-amber-950 border-amber-900 text-amber-100',
    error: 'bg-red-950 border-red-900 text-red-100',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, y: -10 }}
      layout
      onClick={() => onDismiss(toast.id)}
      className={`pointer-events-auto cursor-pointer p-4 rounded-xl border flex items-center gap-3 shadow-2xl ${bgColors[toast.type]}`}
    >
      {icons[toast.type]}
      <p className="text-xs font-semibold leading-relaxed">{toast.message}</p>
    </motion.div>
  );
}
