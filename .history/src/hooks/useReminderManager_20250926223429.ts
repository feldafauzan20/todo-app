/**
 * useReminderManager hook - handles reminder scheduling and visual effects
 */
import { useEffect, useRef, useState } from "react";

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
  const [remindedTasks, setRemindedTasks] = useState<Set<number>>(new Set());
  const remindedCleanupTimers = useRef(new Map<number, NodeJS.Timeout>());

  // Function untuk manually clear reminded task effect
  const clearReminderEffect = (todoId: number) => {
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

    // Clear any active reminder timer
    if (reminderTimers.current.has(todoId)) {
      clearTimeout(reminderTimers.current.get(todoId)!);
      reminderTimers.current.delete(todoId);
    }

    // Remove from processed reminders
    for (const key of processedReminders) {
      if (key.startsWith(`${todoId}-`)) {
        processedReminders.delete(key);
      }
    }
  };

  // Function untuk add task ke reminded state
  const addRemindedTask = (todoId: number) => {
    setRemindedTasks((prev) => new Set(prev).add(todoId));

    // Auto-remove highlight setelah 10 menit
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
    const currentTimers = reminderTimers.current;

    const scheduleReminders = () => {
      // Clear existing timers
      reminderTimers.current.forEach((timer) => {
        clearTimeout(timer);
      });
      reminderTimers.current.clear();

      const currentTime = new Date();

      todos.forEach((todo) => {
        if (!todo.is_done && todo.reminder) {
          const reminderKey = `${todo.id}-${todo.reminder}`;
          const currentReminder = currentReminders.get(todo.id);

          // Check if reminder changed - clear effects immediately
          if (currentReminder && currentReminder !== todo.reminder) {
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
            return;
          }

          try {
            // Simple approach: Use user's local time directly
            const now = currentTime;

            console.log(
              `[REMINDER DEBUG] Current time:`,
              now.toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })
            );
            console.log(
              `[REMINDER DEBUG] Task ${todo.id} reminder:`,
              todo.reminder
            );

            // Parse reminder time - treat as local time
            const reminderTime = new Date(todo.reminder);

            console.log(
              `[REMINDER DEBUG] Parsed reminder time:`,
              reminderTime.toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })
            );

            if (isNaN(reminderTime.getTime())) {
              console.error(
                `[REMINDER DEBUG] Invalid reminder time for task ${todo.id}: ${todo.reminder}`
              );
              return;
            }

            const delay = reminderTime.getTime() - now.getTime();
            console.log(
              `[REMINDER DEBUG] Delay in ms:`,
              delay,
              `(${Math.round(delay / 1000)} seconds)`
            );

            if (delay > 0 && delay < 24 * 60 * 60 * 1000) {
              // Only schedule if within 24 hours
              console.log(
                `[REMINDER DEBUG] Scheduling reminder for task ${
                  todo.id
                } in ${Math.round(delay / 1000)} seconds`
              );

              const timer = setTimeout(() => {
                console.log(
                  `[REMINDER DEBUG] ⏰ REMINDER TRIGGERED for task ${
                    todo.id
                  } at ${new Date().toLocaleString("id-ID", {
                    timeZone: "Asia/Jakarta",
                  })}`
                );

                // Mark as processed
                processedReminders.add(reminderKey);

                // Add to reminded tasks (highlight + badge)
                addRemindedTask(todo.id);

                // Show toast notification
                if (showToast) {
                  showToast("🔔 Reminder!", `Don't forget: ${todo.text}`, {
                    label: "Mark Done",
                    onClick: () => {
                      // This would be handled by the parent component
                    },
                  });
                }
              }, delay);

              reminderTimers.current.set(todo.id, timer);
            } else if (delay > -60000 && delay <= 0) {
              console.log(
                `[REMINDER DEBUG] Reminder is recent (${Math.round(
                  delay / 1000
                )}s ago), showing immediately for task ${todo.id}`
              );

              // If reminder is within last minute, still show it
              processedReminders.add(reminderKey);
              addRemindedTask(todo.id);

              if (showToast) {
                showToast("🔔 Reminder!", `Don't forget: ${todo.text}`);
              }
            } else {
              console.log(
                `[REMINDER DEBUG] Reminder is too old or too far (${Math.round(
                  delay / 1000
                )}s), skipping task ${todo.id}`
              );
            }
          } catch (error) {
            console.error(
              `Error processing reminder for task ${todo.id}:`,
              error
            );
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
