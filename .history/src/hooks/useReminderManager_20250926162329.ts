// hooks/useReminderManager.ts - FIX datetime parsing consistency
import { useEffect, useRef } from "react";

interface Todo {
  id: number;
  text: string;
  reminder?: string;
  is_done: boolean;
  priority?: string;
}

// ✅ SMART storage - track current reminder time per todo
const currentReminders = new Map<number, string>(); // todoId -> reminderTime
const processedReminders = new Set<string>(); // processed reminderKeys

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

  useEffect(() => {
    effectCallCount.current += 1;
    console.log(`🔄 [EFFECT #${effectCallCount.current}] useEffect triggered`);

    const scheduleReminders = () => {
      console.log(
        `📋 [EFFECT #${effectCallCount.current}] === SCHEDULE START ===`
      );
      console.log(
        `📋 Current reminders map:`,
        Object.fromEntries(currentReminders)
      );
      console.log(`📋 Processed reminders:`, Array.from(processedReminders));

      // Clear existing timers
      reminderTimers.current.forEach((timer, todoId) => {
        console.log(`🗑️ Clearing timer for todo ${todoId}`);
        clearTimeout(timer);
      });
      reminderTimers.current.clear();

      const now = new Date();

      todos.forEach((todo, index) => {
        console.log(`\n--- Processing todo ${index + 1}/${todos.length} ---`);

        if (!todo.is_done && todo.reminder) {
          // ✅ FIX: Use original reminder string for consistency
          const reminderKey = `${todo.id}-${todo.reminder}`;
          const currentReminder = currentReminders.get(todo.id);

          console.log(`🔑 Generated key: ${reminderKey}`);
          console.log(`🔍 Original reminder string: "${todo.reminder}"`);
          console.log(`🔍 Current stored reminder: "${currentReminder}"`);
          console.log(`🔍 Are they same? ${currentReminder === todo.reminder}`);

          // ✅ SMART CHECK: If reminder time changed, allow new notification
          if (currentReminder && currentReminder !== todo.reminder) {
            console.log(`📝 REMINDER TIME CHANGED for todo ${todo.id}!`);
            console.log(`📝 Old: "${currentReminder}"`);
            console.log(`📝 New: "${todo.reminder}"`);

            // Remove old processed key
            const oldKey = `${todo.id}-${currentReminder}`;
            processedReminders.delete(oldKey);
            console.log(`🧹 Removed old processed key: ${oldKey}`);

            // ✅ Also clear any processed keys for this todo (safety cleanup)
            for (const key of processedReminders) {
              if (key.startsWith(`${todo.id}-`)) {
                processedReminders.delete(key);
                console.log(`🧹 Safety cleanup - removed key: ${key}`);
              }
            }
            
            // ✅ FORCE RE-PROCESSING: Don't check processed keys for changed reminders
            console.log(`🔄 FORCING re-processing for changed reminder`);
          }

          // ✅ Update current reminder tracking with ORIGINAL string
          currentReminders.set(todo.id, todo.reminder);

          // ✅ CHECK: Skip if this exact reminder already processed (but NOT if reminder changed)
          const hasReminderChanged = currentReminder && currentReminder !== todo.reminder;
          if (processedReminders.has(reminderKey) && !hasReminderChanged) {
            console.log(`⏭️ SKIPPING - Already processed: ${reminderKey}`);
            return;
          }

          // Parse reminder time for calculation
          const reminderTimeString = todo.reminder;
          let reminderTime;

          // ✅ FIX: Better timezone handling
          if (reminderTimeString.includes("+")) {
            // Handle format: 2025-09-26T16:19:00+00:00
            const cleanTimeString = reminderTimeString.split("+")[0];
            reminderTime = new Date(cleanTimeString);
          } else if (reminderTimeString.includes("Z")) {
            // Handle format: 2025-09-26T16:20:00.000Z
            reminderTime = new Date(reminderTimeString);
          } else {
            // Handle basic format: 2025-09-26T16:20:00
            reminderTime = new Date(reminderTimeString);
          }

          // ✅ IMPORTANT: Check if time parsing was successful
          if (isNaN(reminderTime.getTime())) {
            console.error(`❌ Invalid date format: ${reminderTimeString}`);
            return;
          }

          const timeUntilReminder = reminderTime.getTime() - now.getTime();
          const minutesUntil = Math.round(timeUntilReminder / 1000 / 60);
          const secondsUntil = Math.round(timeUntilReminder / 1000);

          console.log(`🕐 Parsed reminder time: ${reminderTime.toISOString()}`);
          console.log(`⏰ Current time: ${now.toISOString()}`);
          console.log(`⏳ Time until reminder: ${timeUntilReminder}ms (${minutesUntil} minutes, ${secondsUntil} seconds)`);

          if (timeUntilReminder <= -60000) {
            console.log(`⏭️ SKIPPING - Reminder too old (more than 1 minute ago)`);
            return;
          }

          // ✅ Handle reminders that should trigger immediately (within 1 minute)
          if (timeUntilReminder <= 0 && timeUntilReminder > -60000) {
            console.log(`🔥 IMMEDIATE trigger - reminder is overdue by ${Math.abs(secondsUntil)} seconds`);
            processedReminders.add(reminderKey);
            showReminderNotification(todo, Date.now());
            return;
          }

          if (timeUntilReminder > 0) {
            // ✅ Mark as processed IMMEDIATELY using ORIGINAL reminder string
            processedReminders.add(reminderKey);
            console.log(`✅ ADDED to processed: ${reminderKey}`);
            console.log(
              `📋 All processed keys:`,
              Array.from(processedReminders)
            );

            const timer = setTimeout(() => {
              console.log(
                `\n🚨 [TIMER-${todo.id}] TIMER TRIGGERED for "${todo.text}"`
              );
              showReminderNotification(todo, effectCallCount.current);
              reminderTimers.current.delete(todo.id);
            }, timeUntilReminder);

            reminderTimers.current.set(todo.id, timer);
            console.log(
              `✅ Timer created for todo ${todo.id} in ${minutesUntil} minutes`
            );
          } else if (timeUntilReminder > -60000) {
            // ✅ IMMEDIATE trigger untuk overdue (< 1 minute)
            console.log(`🔥 IMMEDIATE trigger - reminder is overdue`);
            processedReminders.add(reminderKey);
            showReminderNotification(todo, effectCallCount.current);
          }
        } else {
          // ✅ CLEANUP: Remove tracking for todos without reminders
          if (currentReminders.has(todo.id)) {
            console.log(`🧹 Removing reminder tracking for todo ${todo.id}`);
            currentReminders.delete(todo.id);

            // Also cleanup processed reminders for this todo
            for (const key of processedReminders) {
              if (key.startsWith(`${todo.id}-`)) {
                processedReminders.delete(key);
                console.log(`🧹 Removed processed key: ${key}`);
              }
            }
          }
        }
      });

      // ✅ CLEANUP: Remove tracking for deleted todos
      const todoIds = new Set(todos.map((todo) => todo.id));
      for (const [todoId] of currentReminders) {
        if (!todoIds.has(todoId)) {
          console.log(`🧹 Todo ${todoId} deleted, cleaning up`);
          currentReminders.delete(todoId);

          for (const key of processedReminders) {
            if (key.startsWith(`${todoId}-`)) {
              processedReminders.delete(key);
              console.log(`🧹 Removed processed key: ${key}`);
            }
          }
        }
      }

      console.log(`📋 === SCHEDULE END ===`);
      console.log(
        `📋 Final current reminders:`,
        Object.fromEntries(currentReminders)
      );
      console.log(
        `📋 Final processed reminders:`,
        Array.from(processedReminders)
      );
    };

    const showReminderNotification = async (todo: Todo, _triggerTime: number) => {
      try {
        console.log(
          `\n🔔 [NOTIFICATION-${todo.id}] === NOTIFICATION START ===`
        );

        if (showToast) {
          console.log(`🍞 [NOTIFICATION-${todo.id}] CALLING showToast...`);
          showToast(
            "⏰ Reminder!",
            `"${todo.text}" - Time to start this task!`,
            {
              label: "Mark Done",
              onClick: () => {
                console.log(`Mark "${todo.text}" as done`);
                // TODO: Implement mark as done functionality
              },
            }
          );
          console.log(
            `🍞 [NOTIFICATION-${todo.id}] showToast called successfully`
          );
        }

        await playReminderSound(todo.id);

        console.log(`✅ [NOTIFICATION-${todo.id}] === NOTIFICATION END ===\n`);
      } catch (error) {
        console.error(`❌ [NOTIFICATION-${todo.id}] Error:`, error);
      }
    };

    const playReminderSound = async (todoId: number): Promise<void> => {
      try {
        const soundEnabled =
          localStorage.getItem("notification-sound") !== "false";
        if (!soundEnabled) {
          console.log(`🔇 [SOUND-${todoId}] Sound disabled`);
          return;
        }

        const audio = new Audio("/sounds/cat-notification-reminder.mp3");
        audio.volume = 0.7;
        await audio.play();
        console.log(`🎵 [SOUND-${todoId}] Sound played successfully`);
      } catch (error) {
        console.warn(`❌ [SOUND-${todoId}] Sound failed:`, error);
      }
    };

    scheduleReminders();

    return () => {
      console.log(`🧹 [CLEANUP-${effectCallCount.current}] Cleaning up...`);
      reminderTimers.current.forEach((timer) => {
        clearTimeout(timer);
      });
      reminderTimers.current.clear();
    };
  }, [todos, showToast]);

  // ✅ FIX: Clean up for completed todos
  useEffect(() => {
    const completedTodoIds = todos
      .filter((todo) => todo.is_done)
      .map((todo) => todo.id);

    completedTodoIds.forEach((id) => {
      console.log(`✅ Todo ${id} completed, cleaning up reminders`);
      currentReminders.delete(id);

      for (const key of processedReminders) {
        if (key.startsWith(`${id}-`)) {
          processedReminders.delete(key);
          console.log(`🧹 Removed processed key for completed todo: ${key}`);
        }
      }
    });
  }, [todos]);
};
