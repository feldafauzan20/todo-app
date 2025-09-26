// hooks/useReminderManager.ts - FIX persistent keys
import { useEffect, useRef } from "react";

interface Todo {
  id: number;
  text: string;
  reminder?: string;
  is_done: boolean;
  priority?: string;
}

// ✅ GLOBAL storage untuk processed keys (survives re-renders)
const globalProcessedKeys = new Set<string>();

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
    console.log(
      `🔄 [EFFECT #${effectCallCount.current}] Global processed keys:`,
      Array.from(globalProcessedKeys)
    );

    const scheduleReminders = () => {
      console.log(
        `📋 [EFFECT #${effectCallCount.current}] === SCHEDULE START ===`
      );

      // Clear timers that were created by previous effect calls
      reminderTimers.current.forEach((timer, todoId) => {
        console.log(
          `🗑️ [EFFECT #${effectCallCount.current}] Clearing timer for todo ${todoId}`
        );
        clearTimeout(timer);
      });
      reminderTimers.current.clear();

      const now = new Date();

      todos.forEach((todo, index) => {
        console.log(
          `\n--- [EFFECT #${effectCallCount.current}] Processing todo ${
            index + 1
          }/${todos.length} ---`
        );

        if (!todo.is_done && todo.reminder) {
          const reminderKey = `${todo.id}-${todo.reminder}`;
          console.log(
            `🔑 [EFFECT #${effectCallCount.current}] Generated key: ${reminderKey}`
          );
          console.log(
            `🔍 [EFFECT #${
              effectCallCount.current
            }] Key exists in GLOBAL processed: ${globalProcessedKeys.has(
              reminderKey
            )}`
          );

          // ✅ FIX: Check global processed keys
          if (globalProcessedKeys.has(reminderKey)) {
            console.log(
              `⏭️ [EFFECT #${effectCallCount.current}] SKIPPING - Already processed globally: ${reminderKey}`
            );
            return;
          }

          // Parse reminder time
          const reminderTimeString = todo.reminder;
          let reminderTime;

          if (reminderTimeString.includes("+")) {
            const cleanTimeString = reminderTimeString.split("+")[0];
            reminderTime = new Date(cleanTimeString);
          } else if (reminderTimeString.includes("Z")) {
            const cleanTimeString = reminderTimeString.replace("Z", "");
            reminderTime = new Date(reminderTimeString);
          } else {
            reminderTime = new Date(reminderTimeString);
          }

          const timeUntilReminder = reminderTime.getTime() - now.getTime();
          const minutesUntil = Math.round(timeUntilReminder / 1000 / 60);

          console.log(
            `⏳ [EFFECT #${effectCallCount.current}] Time until reminder: ${timeUntilReminder}ms (${minutesUntil} minutes)`
          );

          if (timeUntilReminder <= -60000) {
            console.log(
              `⏭️ [EFFECT #${effectCallCount.current}] SKIPPING - Reminder too old`
            );
            return;
          }

          if (timeUntilReminder > 0) {
            // ✅ FIX: Add to global processed keys IMMEDIATELY
            globalProcessedKeys.add(reminderKey);
            console.log(
              `✅ [EFFECT #${effectCallCount.current}] ADDED to global keys: ${reminderKey}`
            );
            console.log(
              `📋 [EFFECT #${effectCallCount.current}] Global keys after add:`,
              Array.from(globalProcessedKeys)
            );

            const timer = setTimeout(() => {
              console.log(
                `\n🚨 [TIMER-${todo.id}] TIMER TRIGGERED for "${todo.text}"`
              );
              showReminderNotification(todo, effectCallCount.current);
              reminderTimers.current.delete(todo.id);

              // ✅ OPTIONAL: Remove from global keys after notification (if you want to allow repeat notifications on app restart)
              // globalProcessedKeys.delete(reminderKey);
            }, timeUntilReminder);

            reminderTimers.current.set(todo.id, timer);
            console.log(
              `✅ [EFFECT #${effectCallCount.current}] Timer created for todo ${todo.id} in ${minutesUntil} minutes`
            );
          }
        }
      });

      console.log(
        `📋 [EFFECT #${effectCallCount.current}] === SCHEDULE END ===`
      );
      console.log(
        `📋 [EFFECT #${effectCallCount.current}] Final global keys:`,
        Array.from(globalProcessedKeys)
      );
    };

    const showReminderNotification = async (todo: Todo, effectNum: number) => {
      try {
        console.log(
          `\n🔔 [NOTIFICATION-${todo.id}] === NOTIFICATION START ===`
        );
        console.log(
          `🔔 [NOTIFICATION-${todo.id}] Triggered by effect #${effectNum}`
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
      reminderTimers.current.forEach((timer) => {
        clearTimeout(timer);
      });
      reminderTimers.current.clear();
    };
  }, [todos, showToast]);

  // ✅ FIX: Clean up global keys for completed todos
  useEffect(() => {
    const completedTodoIds = todos
      .filter((todo) => todo.is_done)
      .map((todo) => todo.id);

    completedTodoIds.forEach((id) => {
      // Clear global keys for completed todos
      for (const key of globalProcessedKeys) {
        if (key.startsWith(`${id}-`)) {
          globalProcessedKeys.delete(key);
          console.log(`🧹 Cleared global key: ${key}`);
        }
      }
    });
  }, [todos]);
};
