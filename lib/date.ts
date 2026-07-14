/**
 * Date utilities - Firebase has been removed
 * This file now uses standard Date objects instead of Firebase Timestamps
 */

export function formatEventDate(date?: Date | string | number | null) {
  if (!date) return "-";

  const d = date instanceof Date ? date : new Date(date);
  
  if (isNaN(d.getTime())) return "-";

  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
