/**
 * Text formatting utility functions
 */

/**
 * Truncate text with ellipsis if exceeds max length
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
export const truncateText = (text: string, maxLength: number = 35): string => {
  return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
};

/**
 * Capitalize first letter of each word
 * @param text - Text to capitalize
 * @returns Capitalized text
 */
export const capitalizeWords = (text: string): string => {
  return text.replace(/\b\w/g, (char) => char.toUpperCase());
};

/**
 * Clean and validate text input
 * @param text - Input text
 * @returns Cleaned text
 */
export const cleanText = (text: string): string => {
  return text.trim().replace(/\s+/g, " ");
};
