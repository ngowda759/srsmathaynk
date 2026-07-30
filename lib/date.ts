/**
 * Date utilities - Prisma-based implementation
 * This file now uses standard Date objects instead of Dates
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
