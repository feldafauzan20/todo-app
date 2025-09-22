/**
 * Date and timezone utility functions
 */

/**
 * Format date string to Indonesian datetime format with WIB timezone
 * @param dateString - ISO date string
 * @returns Formatted Indonesian datetime string
 */
export const formatIndonesianDateTime = (dateString: string): string => {
  const date = new Date(dateString);

  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  // Use UTC methods to get exact values without timezone conversion
  const utcDay = date.getUTCDay();
  const utcDate = date.getUTCDate();
  const utcMonth = date.getUTCMonth();
  const utcYear = date.getUTCFullYear();
  const utcHours = date.getUTCHours();
  const utcMinutes = date.getUTCMinutes();

  return `${days[utcDay]}, ${utcDate} ${months[utcMonth]} ${utcYear} ${String(
    utcHours
  ).padStart(2, "0")}:${String(utcMinutes).padStart(2, "0")}`;
};

/**
 * Get current Jakarta datetime for datetime-local input
 * @returns ISO datetime string for WIB timezone
 */
export const getJakartaDateTime = (): string => {
  const now = new Date();
  // Convert to WIB (UTC+7)
  const wibDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return wibDate.toISOString().slice(0, 16);
};

/**
 * Convert datetime-local input to WIB ISO string
 * @param dateString - datetime-local value
 * @returns WIB ISO string
 */
export const convertToWIB = (dateString: string): string => {
  if (!dateString) return "";

  const date = new Date(dateString);
  // Remove the timezone offset to get actual WIB time
  const wibDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return wibDate.toISOString();
};
