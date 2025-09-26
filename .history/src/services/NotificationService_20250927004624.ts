"use client";

class NotificationService {
  private audio: HTMLAudioElement | null = null;
  private reminderAudio: HTMLAudioElement | null = null; // New audio for reminders
  private notifiedTasks: Set<number> = new Set();

  constructor() {
    // Initialize cat sound audio
    if (typeof window !== "undefined") {
      this.audio = new Audio("/sounds/cat-notification.mp3");
      this.audio.volume = 0.7; // Set default volume

      // Initialize reminder sound audio
      this.reminderAudio = new Audio("/sounds/cat-notification-reminder.mp3");
      this.reminderAudio.volume = 0.7; // Set default volume
    }
  }

  // Check if sound is enabled (from localStorage)
  isSoundEnabled(): boolean {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("notification-sound") !== "false";
  }

  // Toggle sound on/off
  toggleSound(): boolean {
    const newSetting = !this.isSoundEnabled();
    localStorage.setItem("notification-sound", newSetting.toString());
    return newSetting;
  }

  // Play cat notification sound
  async playNotificationSound(): Promise<void> {
    if (!this.audio || !this.isSoundEnabled()) return;

    try {
      // Ensure audio is ready
      this.audio.currentTime = 0; // Reset to start

      // Force unlock audio if needed
      if (this.audio.paused) {
        await this.audio.play();
      } else {
        this.audio.pause();
        this.audio.currentTime = 0;
        await this.audio.play();
      }

      console.log("✅ Overdue notification sound played successfully");
    } catch (error) {
      // Try alternative approach - create new audio element
      try {
        const urgentAudio = new Audio("/sounds/cat-notification.mp3");
        urgentAudio.volume = 0.7;
        await urgentAudio.play();
        console.log("✅ Overdue sound played via alternative method");
      } catch (alternativeError) {
        console.log(
          "🔇 Audio completely blocked - notification shown silently"
        );
      }
      throw error; // Let caller handle this
    }
  }

  // Play reminder notification sound
  async playReminderSound(): Promise<void> {
    if (!this.reminderAudio || !this.isSoundEnabled()) return;

    try {
      this.reminderAudio.currentTime = 0; // Reset to start
      await this.reminderAudio.play();
    } catch (error) {
      // Handle autoplay restriction gracefully
      console.warn("Could not play reminder sound:", error);
    }
  }

  // Show browser notification
  showOverdueNotification(
    count: number,
    taskInfo: { id: number; text: string; priority?: "low" | "medium" | "high" }
  ): void {
    if (Notification.permission !== "granted") return;

    // Check if already notified this task
    if (this.notifiedTasks.has(taskInfo.id)) return;

    const title =
      count === 1 ? "⏰ Task Overdue!" : `⏰ ${count} Tasks Overdue!`;

    const body =
      count === 1
        ? `"${taskInfo.text}" is overdue`
        : `${count} tasks including "${taskInfo.text}" are overdue`;

    const notification = new Notification(title, {
      body,
      icon: "/favicon.ico", // You can add custom icon
      badge: "/favicon.ico",
      tag: `overdue-${taskInfo.id}`, // Prevent duplicate notifications
      requireInteraction: true, // Keep notification until user interacts
    });

    // Try to play sound (will work if user has interacted before)
    console.log(
      `🔊 Attempting to play overdue sound for task: ${taskInfo.text}`
    );
    this.playNotificationSound().catch(() => {
      console.log(
        "🔇 Audio not yet unlocked - notification shown without sound"
      );
    });

    // Mark task as notified
    this.notifiedTasks.add(taskInfo.id);

    // Auto close after 10 seconds
    setTimeout(() => {
      notification.close();
    }, 10000);
  }

  // Clear notification for completed/deleted task
  clearNotifiedTask(taskId: number): void {
    this.notifiedTasks.delete(taskId);
  }

  // Enable audio after user interaction (for autoplay policy)
  enableAudioAfterInteraction(): void {
    if (!this.audio) return;

    this.audio.muted = true;
    this.audio
      .play()
      .then(() => {
        this.audio!.muted = false;
        console.log("Audio enabled for notifications");
      })
      .catch(() => {
        // Ignore error
      });
  }

  // Check and notify for overdue tasks
  checkAndNotify(
    overdueTodos: {
      id: number;
      text: string;
      priority?: "low" | "medium" | "high";
    }[],
    overdueCount: number,
    getHighestPriority: () => {
      id: number;
      text: string;
      priority?: "low" | "medium" | "high";
    } | null
  ): void {
    if (overdueCount === 0) return;

    const highestPriorityTask = getHighestPriority();
    if (highestPriorityTask) {
      this.showOverdueNotification(overdueCount, highestPriorityTask);
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
