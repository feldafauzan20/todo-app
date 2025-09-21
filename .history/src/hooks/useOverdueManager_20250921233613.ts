"use client";

import { useState, useEffect, useRef } from 'react';
import { notificationService } from '@/services/NotificationService';

type Todo = {
  id: number;
  text: string;
  is_done: boolean;
  priority?: "low" | "medium" | "high";
  deadline?: string;
  reminder?: string;
};

export const useOverdueManager = (todos: Todo[], isNotificationEnabled: boolean) => {
  const [overdueTodos, setOverdueTodos] = useState<Todo[]>([]);
  const [overdueCount, setOverdueCount] = useState(0);
  const [hasOverdue, setHasOverdue] = useState(false);
  const notifiedTasksRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    const checkOverdueAndNotify = () => {
      const now = new Date();
      // Convert current time to WIB (UTC+7)
      const nowInWIB = new Date(now.getTime() + (7 * 60 * 60 * 1000));

      const overdueList: Todo[] = [];
      const newlyOverdue: Todo[] = [];

      todos.forEach(todo => {
        // Skip completed todos or todos without deadline
        if (todo.is_done || !todo.deadline) return;

        const deadlineDate = new Date(todo.deadline);
        // Add 1 minute delay to deadline for overdue calculation
        const overdueDeadline = new Date(deadlineDate.getTime() + (1 * 60 * 1000));
        
        // Check if current time is past the deadline + 1 minute
        const isCurrentlyOverdue = nowInWIB > overdueDeadline;

        if (isCurrentlyOverdue) {
          overdueList.push(todo);

          // Check if this is newly overdue (not notified yet)
          if (!notifiedTasksRef.current.has(todo.id)) {
            newlyOverdue.push(todo);
            notifiedTasksRef.current.add(todo.id);

            console.log(`🔔 Task "${todo.text}" became overdue - triggering notification + UI update`);
          }
        }
      });

      // Update UI state
      setOverdueTodos(overdueList);
      setOverdueCount(overdueList.length);
      setHasOverdue(overdueList.length > 0);

      // Trigger notifications for newly overdue tasks
      if (isNotificationEnabled && newlyOverdue.length > 0) {
        newlyOverdue.forEach(todo => {
          notificationService.showOverdueNotification(1, {
            id: todo.id,
            text: todo.text,
            priority: todo.priority || 'medium'
          });
        });
      }
    };

    // Initial check
    checkOverdueAndNotify();

    // Set up interval to check every second for realtime updates
    const intervalId = setInterval(checkOverdueAndNotify, 1000);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [todos, isNotificationEnabled]);

  // Get highest priority overdue todo for display
  const getHighestPriorityOverdue = () => {
    if (overdueTodos.length === 0) return null;

    const priorityOrder = { high: 3, medium: 2, low: 1 };
    
    return overdueTodos.reduce((highest, current) => {
      const currentPriority = priorityOrder[current.priority || 'low'];
      const highestPriority = priorityOrder[highest.priority || 'low'];
      
      return currentPriority > highestPriority ? current : highest;
    });
  };

  // Check if specific todo is overdue (for individual todo styling)
  const isOverdue = (todo: Todo): boolean => {
    if (todo.is_done || !todo.deadline) return false;

    const now = new Date();
    const nowInWIB = new Date(now.getTime() + (7 * 60 * 60 * 1000));
    const deadlineDate = new Date(todo.deadline);
    const overdueDeadline = new Date(deadlineDate.getTime() + (1 * 60 * 1000));

    return nowInWIB > overdueDeadline;
  };

  // Clear notification when task completed/deleted
  const clearTaskNotification = (taskId: number) => {
    notifiedTasksRef.current.delete(taskId);
    notificationService.clearNotifiedTask(taskId);
  };

  return {
    overdueTodos,
    overdueCount,
    hasOverdue,
    getHighestPriorityOverdue,
    isOverdue,
    clearTaskNotification
  };
};