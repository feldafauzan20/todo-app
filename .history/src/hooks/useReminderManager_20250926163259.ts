// hooks/useReminderManager.ts - FIX timezone issue
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

    const currentTimers = reminderTimers.current;

    const scheduleReminders = () => {
      console.log(
        `📋 [EFFECT #${effectCallCount.current}] === SCHEDULE START ===`
      );

      // Clear existing timers
      reminderTimers.current.forEach((timer, todoId) => {
        console.log(`🗑️ Clearing timer for todo ${todoId}`);
        clearTimeout(timer);
      });
      reminderTimers.current.clear();

      // ✅ FIX: Use local time for accurate comparison
      const now = new Date();
      const nowLocal = new Date(
        now.getTime() - now.getTimezoneOffset() * 60000
      );

      console.log(`⏰ Current UTC time: ${now.toISOString()}`);
      console.log(`⏰ Current LOCAL time: ${nowLocal.toISOString()}`);
      console.log(`🌍 Timezone offset: ${now.getTimezoneOffset()} minutes`);

      todos.forEach((todo, index) => {
        console.log(`\n--- Processing todo ${index + 1}/${todos.length} ---`);

        if (!todo.is_done && todo.reminder) {
          const reminderKey = `${todo.id}-${todo.reminder}`;
          const currentReminder = currentReminders.get(todo.id);

          console.log(`🔑 Generated key: ${reminderKey}`);
          console.log(`🔍 Original reminder string: "${todo.reminder}"`);

          // ✅ SMART CHECK: If reminder time changed, clear processed keys
          if (currentReminder && currentReminder !== todo.reminder) {
            console.log(`📝 REMINDER TIME CHANGED for todo ${todo.id}!`);
            console.log(`📝 Old: "${currentReminder}"`);
            console.log(`📝 New: "${todo.reminder}"`);

            // Clear all keys for this todo
            for (const key of processedReminders) {
              if (key.startsWith(`${todo.id}-`)) {
                processedReminders.delete(key);
                console.log(`🧹 Removed processed key: ${key}`);
              }
            }
          }

          // Update tracking
          currentReminders.set(todo.id, todo.reminder);

          // Skip if already processed
          if (processedReminders.has(reminderKey)) {
            console.log(`⏭️ SKIPPING - Already processed: ${reminderKey}`);
            return;
          }

          // ✅ FIX: Parse reminder time with proper timezone handling
          const reminderTimeString = todo.reminder;
          let reminderTime;

          if (reminderTimeString.includes("+")) {
            // Format: 2025-09-26T16:28:00+00:00
            console.log(
              `🌍 Parsing timezone-aware format: ${reminderTimeString}`
            );
            reminderTime = new Date(reminderTimeString);
          } else if (reminderTimeString.includes("Z")) {
            // Format: 2025-09-26T16:30:00.000Z (UTC)
            // ✅ FIX: Treat as LOCAL time, not UTC!
            console.log(
              `🌍 Parsing Z format as LOCAL time: ${reminderTimeString}`
            );
            const cleanTimeString = reminderTimeString
              .replace("Z", "")
              .replace(".000", "");
            // Parse as local time by NOT specifying timezone
            reminderTime = new Date(cleanTimeString);
            console.log(`🌍 Converted to local: ${reminderTime.toISOString()}`);
          } else {
            // Format: 2025-09-26T16:30:00 (local)
            console.log(`🌍 Parsing local format: ${reminderTimeString}`);
            reminderTime = new Date(reminderTimeString);
          }

          // Validate parsing
          if (isNaN(reminderTime.getTime())) {
            console.error(`❌ Invalid date format: ${reminderTimeString}`);
            return;
          }

          const timeUntilReminder = reminderTime.getTime() - now.getTime();
          const minutesUntil = Math.round(timeUntilReminder / 1000 / 60);
          const secondsUntil = Math.round(timeUntilReminder / 1000);

          console.log(`🕐 Original reminder string: ${reminderTimeString}`);
          console.log(`🕐 Parsed reminder time: ${reminderTime.toISOString()}`);
          console.log(
            `🕐 Reminder LOCAL time: ${reminderTime.toLocaleString()}`
          );
          console.log(`⏰ Current time: ${now.toISOString()}`);
          console.log(`⏰ Current LOCAL time: ${now.toLocaleString()}`);
          console.log(
            `⏳ Time until reminder: ${timeUntilReminder}ms (${minutesUntil} minutes, ${secondsUntil} seconds)`
          );

          if (timeUntilReminder <= -60000) {
            console.log(
              `⏭️ SKIPPING - Reminder too old (more than 1 minute ago)`
            );
            return;
          }

          // ✅ Handle immediate reminders (within 1 minute or overdue)
          if (timeUntilReminder <= 0 && timeUntilReminder > -60000) {
            console.log(
              `🔥 IMMEDIATE trigger - reminder is overdue by ${Math.abs(
                secondsUntil
              )} seconds`
            );
            processedReminders.add(reminderKey);
            showReminderNotification(todo);
            return;
          }

          if (timeUntilReminder > 0) {
            // Mark as processed
            processedReminders.add(reminderKey);
            console.log(`✅ ADDED to processed: ${reminderKey}`);

            const timer = setTimeout(() => {
              console.log(
                `\n🚨 [TIMER-${todo.id}] TIMER TRIGGERED for "${todo.text}"`
              );
              showReminderNotification(todo);
              reminderTimers.current.delete(todo.id);
            }, timeUntilReminder);

            reminderTimers.current.set(todo.id, timer);
            console.log(
              `✅ Timer created for todo ${todo.id} in ${minutesUntil} minutes (${secondsUntil} seconds)`
            );
          }
        } else {
          // Cleanup
          if (currentReminders.has(todo.id)) {
            console.log(`🧹 Removing reminder tracking for todo ${todo.id}`);
            currentReminders.delete(todo.id);

            for (const key of processedReminders) {
              if (key.startsWith(`${todo.id}-`)) {
                processedReminders.delete(key);
                console.log(`🧹 Removed processed key: ${key}`);
              }
            }
          }
        }
      });

      console.log(`📋 === SCHEDULE END ===`);
    };

    const showReminderNotification = async (todo: Todo) => {
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
      currentTimers.forEach((timer) => {
        clearTimeout(timer);
      });
      currentTimers.clear();
    };
  }, [todos, showToast]);

  // Clean up completed todos
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
