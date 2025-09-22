/**
 * Progress and statistics utility functions
 */

/**
 * Get progress color based on completion rate
 * @param rate - Completion rate percentage (0-100)
 * @returns Tailwind color class
 */
export const getProgressColor = (rate: number): string => {
  if (rate < 30) return "text-red-500"; // rendah
  if (rate < 70) return "text-yellow-500"; // sedang
  return "text-green-500"; // tinggi
};

/**
 * Calculate completion rate
 * @param total - Total number of tasks
 * @param completed - Number of completed tasks
 * @returns Completion rate percentage
 */
export const calculateCompletionRate = (
  total: number,
  completed: number
): number => {
  return total ? Math.round((completed / total) * 100) : 0;
};

/**
 * Get progress description based on rate
 * @param rate - Completion rate percentage
 * @returns Human-readable progress description
 */
export const getProgressDescription = (rate: number): string => {
  if (rate === 100) return "Perfect! All tasks completed! 🎉";
  if (rate >= 80) return "Great progress! Almost done! 💪";
  if (rate >= 60) return "Good work! Keep it up! 👍";
  if (rate >= 40) return "Making progress! 📈";
  if (rate >= 20) return "Getting started! 🚀";
  return "Let's begin your journey! ✨";
};
