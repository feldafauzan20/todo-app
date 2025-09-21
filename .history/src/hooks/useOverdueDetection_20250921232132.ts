"use client";

import { useState, useEffect } from 'react';

type Todo = {
  id: number;
  text: string;
  is_done: boolean;
  priority?: "low" | "medium" | "high";
  deadline?: string;
  reminder?: string;
};

export const useOverdueDetection = (todos: Todo[], isNotificationEnabled: boolean) => {
  const [overdueTodos, setOverdueTodos] = useState<Todo[]>([]);
  const [overdueCount, setOverdueCount] = useState(0);
  const [hasOverdue, setHasOverdue] = useState(false);

  useEffect(() => {
    const checkOverdueTodos = () => {
      const now = new Date();
      // Convert current time to WIB (UTC+7)
      const nowInWIB = new Date(now.getTime() + (7 * 60 * 60 * 1000));

      const overdueList = todos.filter(todo => {
        // Skip completed todos
        if (todo.is_done || !todo.deadline) return false;

        const deadlineDate = new Date(todo.deadline);
        // Add 1 minute delay to deadline for overdue calculation
        const overdueDeadline = new Date(deadlineDate.getTime() + (1 * 60 * 1000));
        
        // Check if current time is past the deadline + 1 minute
        return nowInWIB > overdueDeadline;
      });

      setOverdueTodos(overdueList);
      setOverdueCount(overdueList.length);
      setHasOverdue(overdueList.length > 0);
    };

    // Initial check
    checkOverdueTodos();

    // Set up interval to check every second for realtime updates
    const intervalId = setInterval(checkOverdueTodos, 1000);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [todos]);

  // Get highest priority overdue todo for notification
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

  return {
    overdueTodos,
    overdueCount,
    hasOverdue,
    getHighestPriorityOverdue,
    isOverdue, // For individual todo checking
  };
};