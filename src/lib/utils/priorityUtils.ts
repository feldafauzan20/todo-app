/**
 * Priority-related utility functions and constants
 */

export type Priority = "low" | "medium" | "high";

/**
 * Priority order for sorting (higher number = higher priority)
 */
export const priorityOrder: Record<Priority, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

/**
 * Priority colors for UI components
 */
export const priorityColors = {
  high: {
    bg: "bg-red-100",
    text: "text-red-700",
    button: "bg-red-600 hover:bg-red-200",
    buttonText: "text-white hover:text-red-700",
  },
  medium: {
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    button: "bg-yellow-600 hover:bg-yellow-200",
    buttonText: "text-white hover:text-yellow-700",
  },
  low: {
    bg: "bg-green-100",
    text: "text-green-700",
    button: "bg-green-600 hover:bg-green-200",
    buttonText: "text-white hover:text-green-700",
  },
};

/**
 * Get priority badge classes
 * @param priority - Priority level
 * @returns CSS classes for priority badge
 */
export const getPriorityBadgeClasses = (priority: Priority): string => {
  const colors = priorityColors[priority];
  return `px-2 py-1 text-xs font-medium rounded-full ${colors.bg} ${colors.text}`;
};

/**
 * Get priority button classes
 * @param priority - Priority level
 * @param isActive - Whether button is active
 * @returns CSS classes for priority filter button
 */
export const getPriorityButtonClasses = (
  priority: Priority,
  isActive: boolean
): string => {
  const colors = priorityColors[priority];

  if (isActive) {
    return `px-3 py-1 rounded-full text-sm transition-colors ${
      colors.button.split(" ")[0]
    } text-white`;
  }

  return `px-3 py-1 rounded-full text-sm transition-colors ${colors.bg} ${
    colors.text
  } ${colors.button.split(" ")[1]}`;
};
