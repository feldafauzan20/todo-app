"use client";

class NotificationService {
  private audio: HTMLAudioElement | null = null;
  private reminderAudio: HTMLAudioElement | null = null; // New audio for reminders
  private notifiedTasks: Set<number> = new Set();
  private audioReady: boolean = false; // Track if audio is ready for autoplay

  constructor() {
    // Initialize cat sound audio
    if (typeof window !== "undefined") {
      this.audio = new Audio("/sounds/cat-notification.mp3");
      this.audio.volume = 0.7; // Set default volume

      // Initialize reminder sound audio
      this.reminderAudio = new Audio("/sounds/cat-notification-reminder.mp3");
      this.reminderAudio.volume = 0.7; // Set default volume

      // No automatic audio preparation - let it fail gracefully on first play
    }
  }

  // Setup listener for first user interaction to prepare audio
  private setupUserInteractionListener(): void {
    const prepareAudio = async () => {
      try {
        // Prepare audio context by setting volume to 0, play, then reset
        if (this.audio && this.reminderAudio && !this.audioReady) {
          // Temporarily mute audio for preparation
          const originalAudioVolume = this.audio.volume;
          const originalReminderVolume = this.reminderAudio.volume;

          this.audio.volume = 0;
          this.reminderAudio.volume = 0;

          // Play silently to unlock audio context
          const audioPromise = this.audio.play();
          const reminderPromise = this.reminderAudio.play();

          await Promise.all([audioPromise, reminderPromise]);

          // Immediately pause and reset
          this.audio.pause();
          this.audio.currentTime = 0;
          this.reminderAudio.pause();
          this.reminderAudio.currentTime = 0;

          // Restore original volumes
          this.audio.volume = originalAudioVolume;
          this.reminderAudio.volume = originalReminderVolume;

          this.audioReady = true;
          console.log("Audio context prepared silently");
        }
      } catch (error) {
        console.warn("Could not prepare audio context:", error);
      }

      // Remove listeners after first successful interaction
      document.removeEventListener("click", prepareAudio);
      document.removeEventListener("keydown", prepareAudio);
      document.removeEventListener("touchstart", prepareAudio);
    };

    // Listen for various user interactions
    document.addEventListener("click", prepareAudio);
    document.addEventListener("keydown", prepareAudio);
    document.addEventListener("touchstart", prepareAudio);
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
