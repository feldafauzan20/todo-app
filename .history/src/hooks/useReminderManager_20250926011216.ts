// hooks/useReminderManager.ts - FIX edit reminder functionality
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
  showToast?: (title: string, message: string, action?: { label: string; onClick: () => void }) => void
) => {
  const notifiedReminders = useRef(new Set<number>());
  const reminderTimers = useRef(new Map<number, NodeJS.Timeout>());
  // ✅ ADD: Track previous reminder times untuk detect changes
  const previousReminders = useRef(new Map<number, string>());

  useEffect(() => {
    const scheduleReminders = () => {
      console.log("🔄 Scheduling reminders...");
      
      // ✅ Clear ALL existing timers first (important for edit functionality)
      reminderTimers.current.forEach((timer, todoId) => {
        console.log(`🗑️ Clearing existing timer for todo ${todoId}`);
        clearTimeout(timer);
      });
      reminderTimers.current.clear();

      const now = new Date();

      todos.forEach((todo) => {
        if (!todo.is_done && todo.reminder) {
          // ✅ CHECK: If reminder time changed, remove from notified set
          const previousReminderTime = previousReminders.current.get(todo.id);
          if (previousReminderTime && previousReminderTime !== todo.reminder) {
            console.log(`📝 Reminder time changed for "${todo.text}", clearing notification flag`);
            notifiedReminders.current.delete(todo.id);
          }
          
          // ✅ UPDATE: Store current reminder time
          previousReminders.current.set(todo.id, todo.reminder);

          // Skip if already notified (and reminder time hasn't changed)
          if (notifiedReminders.current.has(todo.id)) {
            console.log(`⏭️ Reminder for "${todo.text}" already notified, skipping`);
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
          console.log(`Current time: ${now.toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })}`);
          console.log(`Reminder time: ${reminderTime.toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })}`);

          const timeUntilReminder = reminderTime.getTime() - now.getTime();
          const minutesUntil = Math.round(timeUntilReminder / 1000 / 60);
          const secondsUntil = Math.round(timeUntilReminder / 1000);

          console.log(`Minutes until reminder: ${minutesUntil}`);

          // Jika reminder time sudah lewat lebih dari 1 menit, skip
          if (timeUntilReminder <= -60000) {
            console.log(`⏭️ Reminder for "${todo.text}" already passed (more than 1 minute ago)`);
            return;
          }

          // Jika reminder time sudah lewat tapi kurang dari 1 menit, trigger immediately
          if (timeUntilReminder <= 0 && timeUntilReminder > -60000) {
            console.log(`🔥 Reminder for "${todo.text}" is overdue, triggering immediately`);
            showReminderNotification(todo);
            notifiedReminders.current.add(todo.id);
            return;
          }

          // Schedule reminder untuk masa depan
          if (timeUntilReminder > 0) {
            const timer = setTimeout(() => {
              console.log(`⏰ TIMER TRIGGERED for "${todo.text}"`);
              showReminderNotification(todo);
              notifiedReminders.current.add(todo.id);
              reminderTimers.current.delete(todo.id);
            }, timeUntilReminder);

            reminderTimers.current.set(todo.id, timer);

            console.log(`✅ Reminder scheduled for "${todo.text}" in ${minutesUntil} minutes (${secondsUntil} seconds)`);
          }
        } else {
          // ✅ CLEANUP: Remove from previous reminders if no reminder or completed
          previousReminders.current.delete(todo.id);
        }
      });

      // ✅ CLEANUP: Remove deleted todos from tracking
      const todoIds = new Set(todos.map(todo => todo.id));
      for (const [todoId] of previousReminders.current) {
        if (!todoIds.has(todoId)) {
          previousReminders.current.delete(todoId);
          notifiedReminders.current.delete(todoId);
        }
      }
    };

    const showReminderNotification = async (todo: Todo) => {
      try {
        console.log(`🔔 Showing reminder notification for: "${todo.text}"`);

        // ✅ SHOW IN-APP TOAST NOTIFICATION
        if (showToast) {
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
        const soundEnabled = localStorage.getItem("notification-sound") !== "false";
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

    // Check every 30 seconds untuk lebih responsive
    const interval = setInterval(() => {
      console.log("🔄 Periodic reminder check...");
      scheduleReminders();
    }, 30000);

    return () => {
      console.log("🧹 Cleaning up reminder manager...");
      clearInterval(interval);
      reminderTimers.current.forEach((timer) => {
        clearTimeout(timer);
      });
      reminderTimers.current.clear();
    };
  }, [todos, showToast]);

  // ✅ Clear notifications untuk completed todos
  useEffect(() => {
    const completedTodoIds = todos
      .filter((todo) => todo.is_done)
      .map((todo) => todo.id);

    completedTodoIds.forEach((id) => {
      console.log(`✅ Todo ${id} completed, clearing reminder notifications`);
      notifiedReminders.current.delete(id);
      previousReminders.current.delete(id);
      
      const timer = reminderTimers.current.get(id);
      if (timer) {
        clearTimeout(timer);
        reminderTimers.current.delete(id);
      }
    });
  }, [todos]);
};
