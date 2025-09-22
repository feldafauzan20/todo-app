"use client";

class NotificationService {
  private audio: HTMLAudioElement | null = null;
  private notifiedTasks: Set<number> = new Set();

  constructor() {
    // Initialize cat sound audio
    if (typeof window !== "undefined") {
      this.audio = new Audio("/sounds/cat-notification.mp3");
      this.audio.volume = 0.7; // Set default volume
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
      this.audio.currentTime = 0; // Reset to start
      await this.audio.play();
    } catch (error) {
      // Handle autoplay restriction gracefully
      console.warn("Could not play notification sound:", error);
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

    // Play sound when notification shows
    this.playNotificationSound();

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
