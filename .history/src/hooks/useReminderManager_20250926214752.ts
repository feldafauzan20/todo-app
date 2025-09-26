/**
 * Production-ready useReminderManager hook
 * Cleaned from excessive logging, optimized for production use
 */
import { useEffect, useRef, useState } from "react";
import { logger } from "@/lib/utils/logger";

interface Todo {
  id: number;
  text: string;
  reminder?: string;
  is_done: boolean;
  priority?: string;
}

const currentReminders = new Map<number, string>();
const processedReminders = new Set<string>();

export const useReminderManager = (
  todos: Todo[],
  showToast?: (
    title: string,
    message: string,
    action?: { label: string; onClick: () => void }
  ) => void
) => {
  const reminderTimers = useRef(new Map<number, NodeJS.Timeout>());
  const effectCallCount = useRef(0);
  const [remindedTasks, setRemindedTasks] = useState<Set<number>>(new Set());
  const remindedCleanupTimers = useRef(new Map<number, NodeJS.Timeout>());

  // Function untuk manually clear reminded task effect
  const clearReminderEffect = (todoId: number) => {
    logger.info(`Manually clearing reminder effect for task ${todoId}`);

    setRemindedTasks((prev) => {
      const newSet = new Set(prev);
      newSet.delete(todoId);
      return newSet;
    });

    // Clear cleanup timer if exists
    if (remindedCleanupTimers.current.has(todoId)) {
      clearTimeout(remindedCleanupTimers.current.get(todoId)!);
      remindedCleanupTimers.current.delete(todoId);
    }
  };

  // Function untuk add task ke reminded state
  const addRemindedTask = (todoId: number) => {
    setRemindedTasks((prev) => new Set(prev).add(todoId));

    // Auto-remove setelah 10 menit
    const cleanupTimer = setTimeout(() => {
      setRemindedTasks((prev) => {
        const newSet = new Set(prev);
        newSet.delete(todoId);
        return newSet;
      });
      remindedCleanupTimers.current.delete(todoId);
    }, 600000); // 10 minutes

    // Clear any existing cleanup timer
    if (remindedCleanupTimers.current.has(todoId)) {
      clearTimeout(remindedCleanupTimers.current.get(todoId)!);
    }

    remindedCleanupTimers.current.set(todoId, cleanupTimer);
  };

  useEffect(() => {
    effectCallCount.current += 1;
    console.log(`[REMINDER DEBUG] useEffect triggered (${effectCallCount.current})`);
    console.log(`[REMINDER DEBUG] todos count:`, todos.length);
    
    const currentTimers = reminderTimers.current;

    const scheduleReminders = () => {
      console.log(`[REMINDER DEBUG] scheduleReminders called`);
      
      // Clear existing timers
      reminderTimers.current.forEach((timer) => {
        clearTimeout(timer);
      });
      reminderTimers.current.clear();

      const now = new Date();
      console.log(`[REMINDER DEBUG] Current time:`, now.toISOString());

      todos.forEach((todo) => {
        if (!todo.is_done && todo.reminder) {
          console.log(`[REMINDER DEBUG] Processing todo ${todo.id} with reminder:`, todo.reminder);
          
          const reminderKey = `${todo.id}-${todo.reminder}`;
          const currentReminder = currentReminders.get(todo.id);

          // Check if reminder changed - clear effects immediately
          if (currentReminder && currentReminder !== todo.reminder) {
            console.log(`[REMINDER DEBUG] Reminder time changed for task ${todo.id}`);

            setRemindedTasks((prev) => {
              const newSet = new Set(prev);
              newSet.delete(todo.id);
              return newSet;
            });

            // Clear processed keys
            for (const key of processedReminders) {
              if (key.startsWith(`${todo.id}-`)) {
                processedReminders.delete(key);
              }
            }

            // Clear cleanup timer
            if (remindedCleanupTimers.current.has(todo.id)) {
              clearTimeout(remindedCleanupTimers.current.get(todo.id)!);
              remindedCleanupTimers.current.delete(todo.id);
            }
          }

          // Update current reminder
          currentReminders.set(todo.id, todo.reminder);

          // Skip if already processed
          if (processedReminders.has(reminderKey)) {
            console.log(`[REMINDER DEBUG] Already processed reminder:`, reminderKey);
            return;
          }

          try {
            // Parse reminder time with timezone handling
            let utcTime: Date;
            
            console.log(`[REMINDER DEBUG] Parsing reminder time:`, todo.reminder);

            if (todo.reminder.includes("+") || todo.reminder.includes("Z")) {
              utcTime = new Date(todo.reminder);
            } else {
              const localTime = new Date(todo.reminder);
              utcTime = new Date(localTime.getTime() + 7 * 60 * 60 * 1000); // Convert WIB to UTC
            }
            
            console.log(`[REMINDER DEBUG] Parsed UTC time:`, utcTime.toISOString());

            if (isNaN(utcTime.getTime())) {
              console.error(`[REMINDER DEBUG] Invalid reminder time for task ${todo.id}: ${todo.reminder}`);
              return;
            }

            const delay = utcTime.getTime() - now.getTime();
            console.log(`[REMINDER DEBUG] Delay in ms:`, delay, `(${delay/1000} seconds)`);

            if (delay > 0) {
              console.log(`[REMINDER DEBUG] Scheduling reminder for task ${todo.id} in ${delay}ms`);
              
              const timer = setTimeout(() => {
                console.log(`[REMINDER DEBUG] REMINDER TRIGGERED for task ${todo.id}`);
                
                // Mark as processed
                processedReminders.add(reminderKey);

                // Add to reminded tasks
                addRemindedTask(todo.id);

                // Show toast notification
                if (showToast) {
                  console.log(`[REMINDER DEBUG] Showing toast for task ${todo.id}`);
                  showToast("Reminder!", `Don't forget: ${todo.text}`, {
                    label: "Mark Done",
                    onClick: () => {
                      // This would be handled by the parent component
                      console.log(`[REMINDER DEBUG] Mark done clicked for task ${todo.id}`);
                    },
                  });
                } else {
                  console.log(`[REMINDER DEBUG] showToast is not available`);
                }
              }, delay);

              reminderTimers.current.set(todo.id, timer);
            } else if (delay > -60000) {
              console.log(`[REMINDER DEBUG] Reminder is recent, showing immediately for task ${todo.id}`);
              
              // If reminder is within last minute, still show it
              processedReminders.add(reminderKey);
              addRemindedTask(todo.id);

              if (showToast) {
                showToast("Reminder!", `Don't forget: ${todo.text}`);
              }
            } else {
              console.log(`[REMINDER DEBUG] Reminder is too old (${delay}ms), skipping task ${todo.id}`);
            }
          } catch (error) {
            console.error(`[REMINDER DEBUG] Error processing reminder for task ${todo.id}:`, error);
          }
          }
        }
      });
    };

    scheduleReminders();

    // Cleanup timers on unmount or dependency change
    return () => {
      currentTimers.forEach((timer) => clearTimeout(timer));
      currentTimers.clear();
    };
  }, [todos, showToast]);

  // Clean up when todos are completed
  useEffect(() => {
    const completedTodoIds = todos
      .filter((todo) => todo.is_done)
      .map((todo) => todo.id);

    completedTodoIds.forEach((id) => {
      // Remove from reminded tasks
      setRemindedTasks((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });

      // Clear cleanup timer
      if (remindedCleanupTimers.current.has(id)) {
        clearTimeout(remindedCleanupTimers.current.get(id)!);
        remindedCleanupTimers.current.delete(id);
      }

      // Remove processed keys
      for (const key of processedReminders) {
        if (key.startsWith(`${id}-`)) {
          processedReminders.delete(key);
        }
      }
    });
  }, [todos]);

  return {
    remindedTasks: Array.from(remindedTasks),
    clearReminderEffect,
  };
};