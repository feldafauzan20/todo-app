// hooks/useToast.ts - CREATE NEW FILE
"use client";

import { useState, useCallback } from "react";

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

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(7);
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? 5000,
    };

    setToasts((prev) => [...prev, newToast]);

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Helper methods untuk different toast types
  const showReminder = useCallback(
    (title: string, message: string, action?: Toast["action"]) => {
      console.log(`[TOAST DEBUG] showReminder called with:`, { title, message, action });
      
      const id = addToast({
        type: "reminder",
        title,
        message,
        duration: 8000, // Longer duration untuk reminder
        action,
      });
      
      console.log(`[TOAST DEBUG] Toast added with id:`, id);
      return id;
    },
    [addToast]
  );

  const showOverdue = useCallback(
    (title: string, message: string, action?: Toast["action"]) => {
      return addToast({
        type: "overdue",
        title,
        message,
        duration: 6000,
        action,
      });
    },
    [addToast]
  );

  const showSuccess = useCallback(
    (title: string, message: string) => {
      return addToast({
        type: "success",
        title,
        message,
        duration: 3000,
      });
    },
    [addToast]
  );

  const showError = useCallback(
    (title: string, message: string) => {
      return addToast({
        type: "error",
        title,
        message,
        duration: 5000,
      });
    },
    [addToast]
  );

  return {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    showReminder,
    showOverdue,
    showSuccess,
    showError,
  };
};
