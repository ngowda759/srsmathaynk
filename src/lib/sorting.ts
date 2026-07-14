/**
 * Sorting Utilities
 * 
 * Provides utilities for building Prisma-compatible sort queries.
 */

import type { SortOptions, SortOrder } from "@/types";

// ============================================================================
// Allowed Sort Fields (whitelist for security)
// ============================================================================

export interface SortableFields {
  [key: string]: string[];
}

/**
 * Default sortable fields - override in specific repositories
 */
export const DEFAULT_SORTABLE_FIELDS: SortableFields = {
  // Common fields available on most entities
  common: ["createdAt", "updatedAt", "id"],
};

/**
 * Validate if a field is allowed to be sorted
 */
export function isSortable(
  field: string,
  allowedFields: string[] = DEFAULT_SORTABLE_FIELDS.common
): boolean {
  return allowedFields.includes(field);
}

// ============================================================================
// Sort Builder
// ============================================================================

/**
 * Build a single sort option for Prisma
 */
export function buildSort<T extends object>(
  options: SortOptions
): Record<string, SortOrder> {
  const { field, order } = options;
  
  return { [field]: order };
}

/**
 * Build multiple sort options for Prisma
 */
export function buildSorts(
  sorts: SortOptions[] = []
): Record<string, SortOrder>[] {
  return sorts.map(buildSort);
}

// ============================================================================
// Query Parameter Parsing
// ============================================================================

/**
 * Parse sort params from query string
 * Format: field:order (e.g., createdAt:desc)
 * Default order is asc
 */
export function parseSortParams(
  params: Record<string, string | undefined>,
  allowedFields?: string[]
): SortOptions[] {
  const sorts: SortOptions[] = [];
  const sortParam = params.sort || params.orderBy;

  if (!sortParam) {
    return sorts;
  }

  // Split by comma for multiple sort fields
  const fields = sortParam.split(",");

  for (const field of fields) {
    const parts = field.trim().split(":");
    const fieldName = parts[0];
    const order = (parts[1]?.toLowerCase() as SortOrder) || "asc";

    // Validate field and order
    if (!fieldName) {
      continue;
    }

    if (allowedFields && !isSortable(fieldName, allowedFields)) {
      continue;
    }

    if (order !== "asc" && order !== "desc") {
      continue;
    }

    sorts.push({ field: fieldName, order });
  }

  return sorts;
}

/**
 * Parse sort from a single string
 * Format: field:order (e.g., createdAt:desc)
 */
export function parseSingleSort(
  param: string,
  allowedFields?: string[]
): SortOptions | null {
  const parts = param.trim().split(":");
  const fieldName = parts[0];
  const order = (parts[1]?.toLowerCase() as SortOrder) || "asc";

  if (!fieldName) {
    return null;
  }

  if (allowedFields && !isSortable(fieldName, allowedFields)) {
    return null;
  }

  if (order !== "asc" && order !== "desc") {
    return null;
  }

  return { field: fieldName, order };
}

// ============================================================================
// Common Sort Helpers
// ============================================================================

/**
 * Create a default sort (by createdAt descending)
 */
export function defaultSort(): SortOptions {
  return { field: "createdAt", order: "desc" };
}

/**
 * Create a sort by ID
 */
export function sortById(order: SortOrder = "asc"): SortOptions {
  return { field: "id", order };
}

/**
 * Create a sort by multiple fields
 */
export function multiFieldSort(
  fields: string[],
  primaryOrder: SortOrder = "asc"
): SortOptions[] {
  return fields.map((field, index) => ({
    field,
    order: index === 0 ? primaryOrder : "asc",
  }));
}

// ============================================================================
// Sort Display Helpers
// ============================================================================

/**
 * Format sort for display
 */
export function formatSortForDisplay(sorts: SortOptions[]): string {
  if (sorts.length === 0) {
    return "";
  }

  return sorts
    .map((s) => `${s.field} ${s.order}`)
    .join(", ");
}

/**
 * Toggle sort order
 */
export function toggleSortOrder(current: SortOrder): SortOrder {
  return current === "asc" ? "desc" : "asc";
}

/**
 * Get the opposite sort direction for a column
 */
export function getOppositeSort(
  currentSorts: SortOptions[],
  field: string
): SortOptions {
  const existing = currentSorts.find((s) => s.field === field);
  
  if (existing) {
    return { field, order: toggleSortOrder(existing.order) };
  }
  
  return { field, order: "asc" };
}
