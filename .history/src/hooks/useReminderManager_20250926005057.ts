// hooks/useReminderManager.ts - FINAL FIX timezone parsing
import { useEffect, useRef } from "react";

interface Todo {
  id: number;
  text: string;
  reminder?: string;
  is_done: boolean;
  priority?: string;
}

export const useReminderManager = (todos: Todo[]) => {
  const notifiedReminders = useRef(new Set<number>());
  const reminderTimers = useRef(new Map<number, NodeJS.Timeout>());

  useEffect(() => {
    const scheduleReminders = () => {
      // Clear existing timers
      reminderTimers.current.forEach((timer) => {
        clearTimeout(timer);
      });
      reminderTimers.current.clear();

      const now = new Date();

      todos.forEach((todo) => {
        if (
          !todo.is_done &&
          todo.reminder &&
          !notifiedReminders.current.has(todo.id)
        ) {
          // ✅ FIX: Parse timezone correctly
          const reminderTimeString = todo.reminder;

          // Parse the datetime string dan convert ke local time
          // Remove timezone info dan treat as local time
          let reminderTime;

          if (reminderTimeString.includes("+")) {
            // Remove timezone offset (e.g., "+00:00")
            const cleanTimeString = reminderTimeString.split("+")[0];
            reminderTime = new Date(cleanTimeString);
          } else if (reminderTimeString.includes("Z")) {
            // Remove Z and treat as local
            const cleanTimeString = reminderTimeString.replace("Z", "");
            reminderTime = new Date(cleanTimeString);
          } else {
            // Already clean
            reminderTime = new Date(reminderTimeString);
          }

          // ✅ DETAILED DEBUG:
          console.log(`=== DEBUGGING REMINDER TIME ===`);
          console.log(`Raw reminder string: "${todo.reminder}"`);
          console.log(`Current time: ${now.toISOString()}`);
          console.log(
            `Current time (local): ${now.toLocaleString("id-ID", {
              timeZone: "Asia/Jakarta",
            })}`
          );
          console.log(
            `Current time (simple): ${now.getHours()}:${now
              .getMinutes()
              .toString()
              .padStart(2, "0")}`
          );
          console.log(`Reminder time: ${reminderTime.toISOString()}`);
          console.log(
            `Reminder time (local): ${reminderTime.toLocaleString("id-ID", {
              timeZone: "Asia/Jakarta",
            })}`
          );
          console.log(
            `Reminder time (simple): ${reminderTime.getHours()}:${reminderTime
              .getMinutes()
              .toString()
              .padStart(2, "0")}`
          );
          console.log(`Task: "${todo.text}"`);

          const timeUntilReminder = reminderTime.getTime() - now.getTime();
          const minutesUntil = Math.round(timeUntilReminder / 1000 / 60);
          const secondsUntil = Math.round(timeUntilReminder / 1000);

          console.log(`Time difference in ms: ${timeUntilReminder}`);
          console.log(`Time difference in seconds: ${secondsUntil}`);
          console.log(`Minutes until reminder: ${minutesUntil}`);
          console.log(`=== END DEBUG ===`);

          // Jika reminder time sudah lewat dalam 1 menit, skip
          if (timeUntilReminder <= -60000) {
            console.log(
              `⏭️ Reminder for "${todo.text}" already passed (more than 1 minute ago)`
            );
            return;
          }

          // Jika reminder time sudah lewat tapi kurang dari 1 menit, trigger immediately
          if (timeUntilReminder <= 0 && timeUntilReminder > -60000) {
            console.log(
              `🔥 Reminder for "${todo.text}" is overdue, triggering immediately`
            );
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

            console.log(
              `✅ Reminder scheduled for "${todo.text}" in ${minutesUntil} minutes (${secondsUntil} seconds)`
            );
          }
        }
      });
    };

    const showReminderNotification = async (todo: Todo) => {
      try {
        console.log(`🔔 Showing reminder notification for: "${todo.text}"`);

        // ✅ DEBUG notification permission
        console.log(`Notification permission: ${Notification.permission}`);
        console.log(
          `Notification supported: ${typeof Notification !== "undefined"}`
        );

        // Show browser notification
        if (Notification.permission === "granted") {
          console.log(`📋 Creating notification popup...`);

          const notification = new Notification("⏰ Reminder!", {
            body: `"${todo.text}" - Time to start this task!`,
            icon: "/favicon.ico",
            badge: "/favicon.ico",
            tag: `reminder-${todo.id}`,
            requireInteraction: false,
          });

          console.log(`✅ Notification created:`, notification);

          // Auto close after 5 seconds
          setTimeout(() => {
            notification.close();
            console.log(`🗂️ Notification closed after 5s`);
          }, 5000);
        } else {
          console.warn(
            `❌ Notification permission not granted: ${Notification.permission}`
          );
        }

        // Play reminder sound
        await playReminderSound();

        console.log(`✅ Reminder notification sent: "${todo.text}"`);
      } catch (error) {
        console.error("❌ Failed to show reminder notification:", error);
      }
    };

    const playReminderSound = async (): Promise<void> => {
      try {
        // Check if sound is enabled
        const soundEnabled =
          localStorage.getItem("notification-sound") !== "false";
        if (!soundEnabled) {
          console.log("🔇 Sound disabled, skipping reminder sound");
          return;
        }

        // Use reminder sound file
        const audio = new Audio("/sounds/cat-notification-reminder.mp3");
        audio.volume = 0.7;

        await audio.play();
        console.log("🎵 Reminder sound played");
      } catch (error) {
        console.warn("❌ Reminder sound failed:", error);

        // Vibration fallback for mobile
        if ("vibrate" in navigator) {
          navigator.vibrate([300, 100, 300, 100, 300]);
          console.log("📳 Vibration fallback triggered");
        }
      }
    };

    // Initial schedule
    scheduleReminders();

    // Check every 30 seconds untuk lebih responsive
    const interval = setInterval(scheduleReminders, 30000);

    return () => {
      clearInterval(interval);
      reminderTimers.current.forEach((timer) => {
        clearTimeout(timer);
      });
      reminderTimers.current.clear();
    };
  }, [todos]);

  // Clear notifications untuk completed todos
  useEffect(() => {
    const completedTodoIds = todos
      .filter((todo) => todo.is_done)
      .map((todo) => todo.id);

    completedTodoIds.forEach((id) => {
      notifiedReminders.current.delete(id);
      const timer = reminderTimers.current.get(id);
      if (timer) {
        clearTimeout(timer);
        reminderTimers.current.delete(id);
      }
    });
  }, [todos]);
};
