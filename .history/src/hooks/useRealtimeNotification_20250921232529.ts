"use client";

import { useEffect, useRef } from 'react';
import { notificationService } from '@/services/NotificationService';

type Todo = {
  id: number;
  text: string;
  is_done: boolean;
  priority?: "low" | "medium" | "high";
  deadline?: string;
  reminder?: string;
};

export const useRealtimeNotification = (
  todos: Todo[], 
  isNotificationEnabled: boolean,
  overdueTodos: Todo[],
  overdueCount: number,
  getHighestPriorityOverdue: () => Todo | null
) => {
  const notifiedTasksRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (!isNotificationEnabled || overdueCount === 0) return;

    const checkAndTriggerNotification = () => {
      const now = new Date();
      const nowInWIB = new Date(now.getTime() + (7 * 60 * 60 * 1000));

      // Check each todo for exact timing
      todos.forEach(todo => {
        if (todo.is_done || !todo.deadline) return;
        if (notifiedTasksRef.current.has(todo.id)) return; // Already notified

        const deadlineDate = new Date(todo.deadline);
        const notificationTime = new Date(deadlineDate.getTime() + (1 * 60 * 1000)); // +1 minute

        // Check if we just reached notification time (within 1 second window)
        const timeDiff = Math.abs(nowInWIB.getTime() - notificationTime.getTime());
        const isExactTime = timeDiff <= 1000; // Within 1 second

        if (isExactTime) {
          console.log(`🔔 Triggering notification for: "${todo.text}" at exactly 1 minute after deadline`);
          
          // Show notification
          notificationService.showOverdueNotification(1, {
            id: todo.id,
            text: todo.text,
            priority: todo.priority || 'medium'
          });

          // Mark as notified
          notifiedTasksRef.current.add(todo.id);
        }
      });
    };

    // Check every second for exact timing
    const intervalId = setInterval(checkAndTriggerNotification, 1000);

    return () => clearInterval(intervalId);
  }, [todos, isNotificationEnabled, overdueCount]);

  // Clear notification when task completed/deleted
  const clearTaskNotification = (taskId: number) => {
    notifiedTasksRef.current.delete(taskId);
    notificationService.clearNotifiedTask(taskId);
  };

  return {
    clearTaskNotification
  };
};