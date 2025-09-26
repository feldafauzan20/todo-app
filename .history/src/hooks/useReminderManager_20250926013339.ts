// hooks/useReminderManager.ts - FIX double toast issue
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
  // ✅ TRACK unique reminder combinations to prevent duplicates  
  const processedKeys = useRef(new Set<string>());

  useEffect(() => {
    const scheduleReminders = () => {
      console.log("🔄 Scheduling reminders...");

      // Clear ALL existing timers first
      reminderTimers.current.forEach((timer, todoId) => {
        console.log(`🗑️ Clearing existing timer for todo ${todoId}`);
        clearTimeout(timer);
      });
      reminderTimers.current.clear();

      const now = new Date();

      todos.forEach((todo) => {
        if (!todo.is_done && todo.reminder) {
          // ✅ CREATE unique key for this specific reminder
          const reminderKey = `${todo.id}-${todo.reminder}`;
          
          // ✅ SKIP if already processed this exact reminder
          if (processedKeys.current.has(reminderKey)) {
            console.log(`⏭️ Already processed: ${reminderKey}`);
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
            reminderTime = new Date(cleanTimeString);
          } else {
            reminderTime = new Date(reminderTimeString);
          }

          console.log(`=== SCHEDULING REMINDER FOR "${todo.text}" ===`);
          console.log(
            `Current time: ${now.toLocaleString("id-ID", {
              timeZone: "Asia/Jakarta",
            })}`
          );
          console.log(
            `Reminder time: ${reminderTime.toLocaleString("id-ID", {
              timeZone: "Asia/Jakarta",
            })}`
          );

          const timeUntilReminder = reminderTime.getTime() - now.getTime();
          const minutesUntil = Math.round(timeUntilReminder / 1000 / 60);
          const secondsUntil = Math.round(timeUntilReminder / 1000);

          console.log(`Minutes until reminder: ${minutesUntil}`);

          // Jika reminder time sudah lewat lebih dari 1 menit, skip
          if (timeUntilReminder <= -60000) {
            console.log(
              `⏭️ Reminder for "${todo.text}" already passed (more than 1 minute ago)`
            );
            return;
          }

          // ✅ FIX: Jika reminder time sudah lewat tapi kurang dari 1 menit, trigger ONCE
          if (timeUntilReminder <= 0 && timeUntilReminder > -60000) {
            console.log(
              `🔥 Reminder for "${todo.text}" is overdue, triggering immediately`
            );
            showReminderNotification(todo);
            notifiedReminders.current.add(todo.id);
            toastNotifications.current.add(todo.id); // ✅ ADD: Mark as toasted
            return;
          }

          // Schedule reminder untuk masa depan
          if (timeUntilReminder > 0) {
            const timer = setTimeout(() => {
              console.log(`⏰ TIMER TRIGGERED for "${todo.text}"`);
              showReminderNotification(todo);
              notifiedReminders.current.add(todo.id);
              toastNotifications.current.add(todo.id);
              reminderTimers.current.delete(todo.id);
            }, timeUntilReminder);

            reminderTimers.current.set(todo.id, timer);

            console.log(
              `✅ Reminder scheduled for "${todo.text}" in ${minutesUntil} minutes (${secondsUntil} seconds)`
            );
          }
        } else {
          // Cleanup: Remove from tracking if no reminder or completed
          previousReminders.current.delete(todo.id);
          toastNotifications.current.delete(todo.id); // ✅ ADD: Clear toast flag
        }
      });

      // Cleanup: Remove deleted todos from tracking
      const todoIds = new Set(todos.map((todo) => todo.id));
      for (const [todoId] of previousReminders.current) {
        if (!todoIds.has(todoId)) {
          previousReminders.current.delete(todoId);
          notifiedReminders.current.delete(todoId);
          toastNotifications.current.delete(todoId); // ✅ ADD: Clear toast flag
        }
      }
    };

    const showReminderNotification = async (todo: Todo) => {
      try {
        console.log(`🔔 Showing reminder notification for: "${todo.text}"`);

        // ✅ SHOW IN-APP TOAST NOTIFICATION (ONCE)
        if (showToast) {
          console.log(`🍞 Showing toast for: "${todo.text}"`);
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
        }

        // ✅ SHOW BROWSER NOTIFICATION
        if (Notification.permission === "granted") {
          console.log(`📋 Creating browser notification...`);

          const notification = new Notification("⏰ Reminder!", {
            body: `"${todo.text}" - Time to start this task!`,
            icon: "/favicon.ico",
            badge: "/favicon.ico",
            tag: `reminder-${todo.id}`,
            requireInteraction: false,
          });

          notification.onshow = () => {
            console.log(`🟢 Browser notification SHOWN successfully!`);
          };

          notification.onerror = (error) => {
            console.error(`❌ Browser notification ERROR:`, error);
          };

          setTimeout(() => {
            notification.close();
          }, 8000);
        }

        // ✅ PLAY REMINDER SOUND
        await playReminderSound();

        console.log(`✅ Reminder notification sent: "${todo.text}"`);
      } catch (error) {
        console.error("❌ Failed to show reminder notification:", error);
      }
    };

    const playReminderSound = async (): Promise<void> => {
      try {
        const soundEnabled =
          localStorage.getItem("notification-sound") !== "false";
        if (!soundEnabled) {
          console.log("🔇 Sound disabled, skipping reminder sound");
          return;
        }

        const audio = new Audio("/sounds/cat-notification-reminder.mp3");
        audio.volume = 0.7;

        await audio.play();
        console.log("🎵 Reminder sound played");
      } catch (error) {
        console.warn("❌ Reminder sound failed:", error);

        if ("vibrate" in navigator) {
          navigator.vibrate([300, 100, 300, 100, 300]);
          console.log("📳 Vibration fallback triggered");
        }
      }
    };

    // Initial schedule
    scheduleReminders();

    // ✅ FIX: Disable periodic check to prevent duplicates
    // const interval = setInterval(() => {
    //   console.log("🔄 Periodic reminder check...");
    //   scheduleReminders();
    // }, 60000);

    return () => {
      console.log("🧹 Cleaning up reminder manager...");
      // clearInterval(interval);
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
      console.log(`✅ Todo ${id} completed, clearing reminder notifications`);
      notifiedReminders.current.delete(id);
      previousReminders.current.delete(id);
      toastNotifications.current.delete(id); // ✅ ADD: Clear toast flag

      const timer = reminderTimers.current.get(id);
      if (timer) {
        clearTimeout(timer);
        reminderTimers.current.delete(id);
      }
    });
  }, [todos]);
};
