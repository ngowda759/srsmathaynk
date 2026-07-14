/**
 * Filter Utilities
 * 
 * Provides utilities for building Prisma-compatible filter queries.
 */

import type { FilterOptions, FilterCondition, FilterOperator } from "@/types";

// ============================================================================
// Type Definitions for Prisma
// ============================================================================

export type PrismaFilter<T = Record<string, unknown>> = T;

type PrismaWhere<T> = {
  [K in keyof T]?: unknown;
};

// ============================================================================
// Operator Mapping
// ============================================================================

const OPERATOR_MAP: Record<FilterOperator, string> = {
  eq: "equals",
  ne: "not equals",
  gt: "greaterThan",
  gte: "greaterThanOrEqual",
  lt: "lessThan",
  lte: "lessThanOrEqual",
  in: "in",
  notIn: "notIn",
  contains: "contains",
  startsWith: "startsWith",
  endsWith: "endsWith",
  isNull: "isEmpty",
  isNotNull: "isNotEmpty",
};

// ============================================================================
// Filter Builder
// ============================================================================

/**
 * Build a single filter condition
 */
export function buildFilter<T extends object>(
  condition: FilterCondition<keyof T>
): Record<string, unknown> {
  const { field, operator, value } = condition;
  const prismaOperator = OPERATOR_MAP[operator];

  // Handle special cases
  if (operator === "isNull") {
    return { [String(field)]: null };
  }

  if (operator === "isNotNull") {
    return { [String(field)]: { not: null } };
  }

  if (operator === "eq" || operator === "ne") {
    return { [String(field)]: operator === "eq" ? value : { not: value } };
  }

  // Handle array operators
  if (operator === "in" || operator === "notIn") {
    return { [String(field)]: { [prismaOperator]: value } };
  }

  // Handle string operators
  if (operator === "contains" || operator === "startsWith" || operator === "endsWith") {
    return { [String(field)]: { [prismaOperator]: value } };
  }

  // Handle comparison operators
  return { [String(field)]: { [prismaOperator]: value } };
}

/**
 * Build multiple filter conditions
 */
export function buildFilters<T extends object>(
  filters: FilterCondition<keyof T>[] = []
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const filter of filters) {
    Object.assign(result, buildFilter<T>(filter));
  }

  return result;
}

/**
 * Build complex filter options with AND/OR/NOT
 */
export function buildComplexFilter<T extends object>(
  options: FilterOptions<keyof T>
): Record<string, unknown> {
  const conditions: Record<string, unknown>[] = [];

  // Add simple filters
  if (options.filters && options.filters.length > 0) {
    for (const filter of options.filters) {
      conditions.push(buildFilter<T>(filter));
    }
  }

  // Add AND conditions
  if (options.AND && options.AND.length > 0) {
    for (const andFilter of options.AND) {
      conditions.push(buildComplexFilter(andFilter));
    }
  }

  // Handle OR conditions
  if (options.OR && options.OR.length > 0) {
    const orConditions = options.OR.map((orFilter) =>
      buildComplexFilter(orFilter)
    );
    return { OR: orConditions };
  }

  // Handle NOT conditions
  if (options.NOT) {
    return { NOT: buildComplexFilter(options.NOT) };
  }

  // If multiple conditions, combine with AND
  if (conditions.length === 1) {
    return conditions[0];
  }

  if (conditions.length > 1) {
    return { AND: conditions };
  }

  return {};
}

// ============================================================================
// Query Parameter Parsing
// ============================================================================

/**
 * Parse filter params from query string
 * Format: field.operator=value
 * Example: status.eq=ACTIVE&name.contains=John
 */
export function parseFilterParams(
  params: Record<string, string | undefined>
): FilterCondition[] {
  const filters: FilterCondition[] = [];

  for (const [key, value] of Object.entries(params)) {
    if (!value || key.startsWith("_")) {
      continue;
    }

    // Parse field.operator format
    const parts = key.split(".");
    if (parts.length === 2) {
      const [field, operator] = parts;
      filters.push({
        field,
        operator: operator as FilterOperator,
        value: parseValue(value),
      });
    } else if (parts.length === 1) {
      // Default to equals if no operator specified
      filters.push({
        field: key,
        operator: "eq",
        value: parseValue(value),
      });
    }
  }

  return filters;
}

/**
 * Parse value to appropriate type
 */
function parseValue(value: string): unknown {
  // Try parsing as number
  const num = Number(value);
  if (!isNaN(num) && value.trim() !== "") {
    return num;
  }

  // Try parsing as boolean
  if (value.toLowerCase() === "true") {
    return true;
  }
  if (value.toLowerCase() === "false") {
    return false;
  }

  // Try parsing as null
  if (value.toLowerCase() === "null") {
    return null;
  }

  // Return as string
  return value;
}

// ============================================================================
// Common Filter Helpers
// ============================================================================

/**
 * Create an active filter (deletedAt is null)
 */
export function activeFilter(): Record<string, unknown> {
  return { deletedAt: null };
}

/**
 * Create a date range filter
 */
export function dateRangeFilter(
  field: string,
  startDate?: Date,
  endDate?: Date
): Record<string, unknown> {
  const filter: Record<string, unknown> = {};

  if (startDate) {
    filter.gte = startDate;
  }

  if (endDate) {
    filter.lte = endDate;
  }

  return { [field]: filter };
}

/**
 * Create a search filter for multiple fields
 */
export function searchFilter(
  fields: string[],
  searchTerm: string
): Record<string, unknown> {
  if (!searchTerm) {
    return {};
  }

  const searchConditions = fields.map((field) => ({
    [field]: {
      contains: searchTerm,
      mode: "insensitive" as const,
    },
  }));

  return { OR: searchConditions };
}

/**
 * Create a status filter
 */
export function statusFilter<T extends string>(
  statusField: string,
  statuses: T[]
): Record<string, unknown> {
  return { [statusField]: { in: statuses } };
}
