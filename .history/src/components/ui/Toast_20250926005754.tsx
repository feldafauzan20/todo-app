// components/ui/Toast.tsx - CREATE NEW FILE
"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bell, AlertCircle, CheckCircle, Clock } from "lucide-react";

interface Toast {
  id: string;
  type: "reminder" | "overdue" | "success" | "error";
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastProps {
  toast: Toast;
  onClose: (id: string) => void;
}

const toastConfig = {
  reminder: {
    icon: Clock,
    bgColor: "bg-orange-500",
    borderColor: "border-orange-400",
    textColor: "text-white",
  },
  overdue: {
    icon: AlertCircle,
    bgColor: "bg-red-500",
    borderColor: "border-red-400",
    textColor: "text-white",
  },
  success: {
    icon: CheckCircle,
    bgColor: "bg-green-500",
    borderColor: "border-green-400",
    textColor: "text-white",
  },
  error: {
    icon: AlertCircle,
    bgColor: "bg-red-500",
    borderColor: "border-red-400",
    textColor: "text-white",
  },
};

function ToastItem({ toast, onClose }: ToastProps) {
  const config = toastConfig[toast.type];
  const Icon = config.icon;

  useEffect(() => {
    if (toast.duration !== 0) {
      const timer = setTimeout(() => {
        onClose(toast.id);
      }, toast.duration || 5000);

      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.duration, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.9 }}
      whileHover={{ scale: 1.02 }}
      className={`
        ${config.bgColor} ${config.borderColor} ${config.textColor}
        border-l-4 rounded-lg shadow-lg p-4 mb-3 max-w-sm w-full
        backdrop-blur-sm bg-opacity-95
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="font-semibold text-sm">{toast.title}</h4>
            <p className="text-sm opacity-90 mt-1">{toast.message}</p>
            
            {toast.action && (
              <button
                onClick={toast.action.onClick}
                className="mt-2 text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded transition-colors"
              >
                {toast.action.label}
              </button>
            )}
          </div>
        </div>
        
        <button
          onClick={() => onClose(toast.id)}
          className="text-white/80 hover:text-white ml-2 flex-shrink-0"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 pointer-events-none">
      <div className="pointer-events-auto">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <ToastItem
              key={toast.id}
              toast={toast}
              onClose={onClose}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export type { Toast };