// hooks/useReminderManager.ts - ADD comprehensive debugging
import { useEffect, useRef } from "react";

interface Todo {
  id: number;
  text: string;
  reminder?: string;
  is_done: boolean;
  priority?: string;
}

export const useReminderManager = (
  todos: Todo[],
  showToast?: (
    title: string,
    message: string,
    action?: { label: string; onClick: () => void }
  ) => void
) => {
  const reminderTimers = useRef(new Map<number, NodeJS.Timeout>());
  const processedKeys = useRef(new Set<string>());
  // ✅ ADD: Counter untuk track berapa kali useEffect dipanggil
  const effectCallCount = useRef(0);

  useEffect(() => {
    effectCallCount.current += 1;
    console.log(`🔄 [EFFECT #${effectCallCount.current}] useEffect triggered`);
    console.log(
      `🔄 [EFFECT #${effectCallCount.current}] Current todos:`,
      todos.map((t) => ({ id: t.id, text: t.text, reminder: t.reminder }))
    );
    console.log(
      `🔄 [EFFECT #${effectCallCount.current}] showToast function:`,
      typeof showToast
    );

    const scheduleReminders = () => {
      console.log(`📋 [EFFECT #${effectCallCount.current}] === SCHEDULE START ===`);
      console.log(
        `📋 [EFFECT #${effectCallCount.current}] Active timers:`,
        Array.from(reminderTimers.current.keys())
      );
      console.log(
        `📋 [EFFECT #${effectCallCount.current}] Processed keys:`,
        Array.from(processedKeys.current)
      );

      // Clear ALL existing timers first
      reminderTimers.current.forEach((timer, todoId) => {
        console.log(`🗑️ [EFFECT #${effectCallCount.current}] Clearing timer for todo ${todoId}`);
        clearTimeout(timer);
      });
      reminderTimers.current.clear();

      const now = new Date();
      console.log(`⏰ [EFFECT #${effectCallCount.current}] Current time:`, now.toISOString());

      todos.forEach((todo, index) => {
        console.log(`\n--- [EFFECT #${effectCallCount.current}] Processing todo ${index + 1}/${todos.length} ---`);
        console.log(`📝 [EFFECT #${effectCallCount.current}] Todo:`, {
          id: todo.id,
          text: todo.text,
          is_done: todo.is_done,
          reminder: todo.reminder,
        });

        if (!todo.is_done && todo.reminder) {
          const reminderKey = `${todo.id}-${todo.reminder}`;
          console.log(`🔑 [EFFECT #${effectCallCount.current}] Generated key: ${reminderKey}`);
          console.log(`🔍 [EFFECT #${effectCallCount.current}] Key exists in processed: ${processedKeys.current.has(reminderKey)}`);

          if (processedKeys.current.has(reminderKey)) {
            console.log(`⏭️ [EFFECT #${effectCallCount.current}] SKIPPING - Already processed: ${reminderKey}`);
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

          console.log(`🕐 [EFFECT #${effectCallCount.current}] Parsed reminder time:`, reminderTime.toISOString());

          const timeUntilReminder = reminderTime.getTime() - now.getTime();
          const minutesUntil = Math.round(timeUntilReminder / 1000 / 60);

          console.log(`⏳ [EFFECT #${effectCallCount.current}] Time until reminder: ${timeUntilReminder}ms (${minutesUntil} minutes)`);

          if (timeUntilReminder <= -60000) {
            console.log(`⏭️ [EFFECT #${effectCallCount.current}] SKIPPING - Reminder too old for "${todo.text}"`);
            return;
          }

          if (timeUntilReminder > 0) {
            console.log(`✅ [EFFECT #${effectCallCount.current}] SCHEDULING - Adding key to processed: ${reminderKey}`);
            processedKeys.current.add(reminderKey);
            console.log(
              `📋 [EFFECT #${effectCallCount.current}] Processed keys after add:`,
              Array.from(processedKeys.current)
            );

            const timer = setTimeout(() => {
              console.log(`\n🚨 [TIMER-${todo.id}] TIMER TRIGGERED for "${todo.text}"`);
              console.log(`🚨 [TIMER-${todo.id}] Effect call that created this timer: #${effectCallCount.current}`);
              showReminderNotification(todo, effectCallCount.current);
              reminderTimers.current.delete(todo.id);
            }, timeUntilReminder);

            reminderTimers.current.set(todo.id, timer);
            console.log(`✅ [EFFECT #${effectCallCount.current}] Timer created for todo ${todo.id} in ${minutesUntil} minutes`);
          }
        } else {
          console.log(`⏭️ [EFFECT #${effectCallCount.current}] SKIPPING - No reminder or completed: ${todo.text}`);
        }
      });

      console.log(`📋 [EFFECT #${effectCallCount.current}] === SCHEDULE END ===`);
      console.log(
        `📋 [EFFECT #${effectCallCount.current}] Final processed keys:`,
        Array.from(processedKeys.current)
      );
      console.log(
        `📋 [EFFECT #${effectCallCount.current}] Final active timers:`,
        Array.from(reminderTimers.current.keys())
      );
    };

    const showReminderNotification = async (todo: Todo, effectNum: number) => {
      try {
        console.log(`\n🔔 [NOTIFICATION-${todo.id}] === NOTIFICATION START ===`);
        console.log(`🔔 [NOTIFICATION-${todo.id}] Triggered by effect #${effectNum}`);
        console.log(`🔔 [NOTIFICATION-${todo.id}] Todo: ${todo.text}`);
        console.log(`🔔 [NOTIFICATION-${todo.id}] showToast available: ${typeof showToast}`);

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
          console.log(`🍞 [NOTIFICATION-${todo.id}] showToast called successfully`);
        } else {
          console.log(`🚫 [NOTIFICATION-${todo.id}] No showToast function available`);
        }

        await playReminderSound(todo.id);

        console.log(`✅ [NOTIFICATION-${todo.id}] === NOTIFICATION END ===\n`);
      } catch (error) {
        console.error(`❌ [NOTIFICATION-${todo.id}] Error:`, error);
      }
    };

    const playReminderSound = async (todoId: number): Promise<void> => {
      try {
        console.log(`🎵 [SOUND-${todoId}] Playing reminder sound...`);
        const soundEnabled = localStorage.getItem("notification-sound") !== "false";
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

  // Clear notifications untuk completed todos
  useEffect(() => {
    const completedTodoIds = todos
      .filter((todo) => todo.is_done)
      .map((todo) => todo.id);

    completedTodoIds.forEach((id) => {
      console.log(`✅ Todo ${id} completed, clearing reminders`);

      // Clear any active timers
      const timer = reminderTimers.current.get(id);
      if (timer) {
        clearTimeout(timer);
        reminderTimers.current.delete(id);
      }

      // Clear any processed keys for this todo ID
      for (const key of processedKeys.current) {
        if (key.startsWith(`${id}-`)) {
          processedKeys.current.delete(key);
          console.log(`🧹 Cleared key: ${key}`);
        }
      }
    });
  }, [todos]);
};
