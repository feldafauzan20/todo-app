// hooks/useReminderManager.ts - FIX time calculation
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
          // ✅ FIX: Proper WIB time parsing
          const reminderTime = new Date(todo.reminder);
          
          // ✅ DEBUG: Log actual times
          console.log(`Current time: ${now.toISOString()}`);
          console.log(`Reminder time: ${reminderTime.toISOString()}`);
          console.log(`Task: "${todo.text}"`);
          
          const timeUntilReminder = reminderTime.getTime() - now.getTime();
          const minutesUntil = Math.round(timeUntilReminder / 1000 / 60);
          
          console.log(`Time difference in ms: ${timeUntilReminder}`);
          console.log(`Minutes until reminder: ${minutesUntil}`);

          // Jika reminder time sudah lewat dalam 1 menit, skip
          if (timeUntilReminder <= -60000) {
            console.log(`Reminder for "${todo.text}" already passed (more than 1 minute ago)`);
            return;
          }

          // Jika reminder time sudah lewat tapi kurang dari 1 menit, trigger immediately
          if (timeUntilReminder <= 0 && timeUntilReminder > -60000) {
            console.log(`Reminder for "${todo.text}" is overdue, triggering immediately`);
            showReminderNotification(todo);
            notifiedReminders.current.add(todo.id);
            return;
          }

          // Schedule reminder untuk masa depan
          if (timeUntilReminder > 0) {
            const timer = setTimeout(() => {
              showReminderNotification(todo);
              notifiedReminders.current.add(todo.id);
              reminderTimers.current.delete(todo.id);
            }, timeUntilReminder);

            reminderTimers.current.set(todo.id, timer);
            
            // ✅ FIX: Show proper minutes calculation
            console.log(`Reminder scheduled for "${todo.text}" in ${minutesUntil} minutes`);
          }
        }
      });
    };

    const showReminderNotification = async (todo: Todo) => {
      try {
        // Show browser notification
        if (Notification.permission === "granted") {
          const notification = new Notification("⏰ Reminder!", {
            body: `"${todo.text}" - Time to start this task!`,
            icon: "/favicon.ico",
            badge: "/favicon.ico",
            tag: `reminder-${todo.id}`,
            requireInteraction: false,
          });

          // Auto close after 5 seconds
          setTimeout(() => {
            notification.close();
          }, 5000);
        }

        // Play reminder sound (different from overdue)
        await playReminderSound();
        
        console.log(`✅ Reminder notification sent: "${todo.text}"`);
      } catch (error) {
        console.error("Failed to show reminder notification:", error);
      }
    };

    const playReminderSound = async (): Promise<void> => {
      try {
        // Check if sound is enabled
        const soundEnabled = localStorage.getItem("notification-sound") !== "false";
        if (!soundEnabled) {
          console.log("Sound disabled, skipping reminder sound");
          return;
        }

        // Use reminder sound file
        const audio = new Audio("/sounds/cat-notification-reminder.mp3");
        audio.volume = 0.7;
        
        await audio.play();
        console.log("🎵 Reminder sound played");
        
      } catch (error) {
        console.warn("Reminder sound failed:", error);
        
        // Vibration fallback for mobile
        if ('vibrate' in navigator) {
          navigator.vibrate([300, 100, 300, 100, 300]);
          console.log("📳 Vibration fallback triggered");
        }
      }
    };

    // Initial schedule
    scheduleReminders();

    // Check every minute untuk real-time accuracy
    const interval = setInterval(scheduleReminders, 60000);

    return () => {
      clearInterval(interval);
      // Clear all timers on cleanup
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
      // Clear timer jika ada
      const timer = reminderTimers.current.get(id);
      if (timer) {
        clearTimeout(timer);
        reminderTimers.current.delete(id);
      }
    });
  }, [todos]);
};
