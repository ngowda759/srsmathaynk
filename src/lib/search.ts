/**
 * Search Builder
 * 
 * Provides a fluent API for building complex search queries.
 * Supports multiple operators: contains, equals, startsWith, endsWith, etc.
 * 
 * Usage:
 * ```typescript
 * const query = new SearchBuilder<Announcement>()
 *   .contains("title", searchTerm)
 *   .equals("type", "EVENT")
 *   .in("status", ["ACTIVE", "PENDING"])
 *   .greaterThan("price", 0)
 *   .build();
 * 
 * // In repository
 * const results = await prisma.announcement.findMany({ where: query });
 * ```
 */

import type { Prisma } from "@prisma/client";

// ============================================================================
// Search Operators
// ============================================================================

export enum SearchOperator {
  EQUALS = "equals",
  NOT_EQUALS = "notEquals",
  CONTAINS = "contains",
  NOT_CONTAINS = "notContains",
  STARTS_WITH = "startsWith",
  ENDS_WITH = "endsWith",
  IN = "in",
  NOT_IN = "notIn",
  GREATER_THAN = "gt",
  GREATER_THAN_OR_EQUAL = "gte",
  LESS_THAN = "lt",
  LESS_THAN_OR_EQUAL = "lte",
  IS_NULL = "isNull",
  IS_NOT_NULL = "isNotNull",
  IS_TRUE = "isTrue",
  IS_FALSE = "isFalse",
}

// ============================================================================
// Search Condition
// ============================================================================

export interface SearchCondition<T = string> {
  field: T;
  operator: SearchOperator;
  value?: unknown;
}

// ============================================================================
// Search Builder
// ============================================================================

export class SearchBuilder<T = Record<string, unknown>> {
  private conditions: SearchCondition<keyof T>[] = [];
  private andGroups: SearchBuilder<T>[] = [];
  private orGroups: SearchBuilder<T>[] = [];
  private notGroup?: SearchBuilder<T>;
  private orderBy: Array<{ field: keyof T; direction: "asc" | "desc" }> = [];

  /**
   * Add an equals condition
   */
  equals<K extends keyof T>(field: K, value: T[K]): this {
    this.conditions.push({ field, operator: SearchOperator.EQUALS, value });
    return this;
  }

  /**
   * Add a not equals condition
   */
  notEquals<K extends keyof T>(field: K, value: T[K]): this {
    this.conditions.push({ field, operator: SearchOperator.NOT_EQUALS, value });
    return this;
  }

  /**
   * Add a contains condition (case-insensitive substring match)
   */
  contains<K extends keyof T>(field: K, value: string): this {
    this.conditions.push({ field, operator: SearchOperator.CONTAINS, value });
    return this;
  }

  /**
   * Add a not contains condition
   */
  notContains<K extends keyof T>(field: K, value: string): this {
    this.conditions.push({ field, operator: SearchOperator.NOT_CONTAINS, value });
    return this;
  }

  /**
   * Add a starts with condition
   */
  startsWith<K extends keyof T>(field: K, value: string): this {
    this.conditions.push({ field, operator: SearchOperator.STARTS_WITH, value });
    return this;
  }

  /**
   * Add an ends with condition
   */
  endsWith<K extends keyof T>(field: K, value: string): this {
    this.conditions.push({ field, operator: SearchOperator.ENDS_WITH, value });
    return this;
  }

  /**
   * Add an IN condition
   */
  in<K extends keyof T>(field: K, values: T[K][]): this {
    this.conditions.push({ field, operator: SearchOperator.IN, value: values });
    return this;
  }

  /**
   * Add a NOT IN condition
   */
  notIn<K extends keyof T>(field: K, values: T[K][]): this {
    this.conditions.push({ field, operator: SearchOperator.NOT_IN, value: values });
    return this;
  }

  /**
   * Add a greater than condition
   */
  greaterThan<K extends keyof T>(field: K, value: number | Date): this {
    this.conditions.push({ field, operator: SearchOperator.GREATER_THAN, value });
    return this;
  }

  /**
   * Add a greater than or equal condition
   */
  greaterThanOrEqual<K extends keyof T>(field: K, value: number | Date): this {
    this.conditions.push({ field, operator: SearchOperator.GREATER_THAN_OR_EQUAL, value });
    return this;
  }

  /**
   * Add a less than condition
   */
  lessThan<K extends keyof T>(field: K, value: number | Date): this {
    this.conditions.push({ field, operator: SearchOperator.LESS_THAN, value });
    return this;
  }

  /**
   * Add a less than or equal condition
   */
  lessThanOrEqual<K extends keyof T>(field: K, value: number | Date): this {
    this.conditions.push({ field, operator: SearchOperator.LESS_THAN_OR_EQUAL, value });
    return this;
  }

  /**
   * Add an IS NULL condition
   */
  isNull<K extends keyof T>(field: K): this {
    this.conditions.push({ field, operator: SearchOperator.IS_NULL });
    return this;
  }

  /**
   * Add an IS NOT NULL condition
   */
  isNotNull<K extends keyof T>(field: K): this {
    this.conditions.push({ field, operator: SearchOperator.IS_NOT_NULL });
    return this;
  }

  /**
   * Add an IS TRUE condition
   */
  isTrue<K extends keyof T>(field: K): this {
    this.conditions.push({ field, operator: SearchOperator.IS_TRUE, value: true });
    return this;
  }

  /**
   * Add an IS FALSE condition
   */
  isFalse<K extends keyof T>(field: K): this {
    this.conditions.push({ field, operator: SearchOperator.IS_FALSE, value: false });
    return this;
  }

  /**
   * Add a group of conditions to AND together
   */
  and(buildFn: (builder: SearchBuilder<T>) => void): this {
    const group = new SearchBuilder<T>();
    buildFn(group);
    this.andGroups.push(group);
    return this;
  }

  /**
   * Add a group of conditions to OR together
   */
  or(buildFn: (builder: SearchBuilder<T>) => void): this {
    const group = new SearchBuilder<T>();
    buildFn(group);
    this.orGroups.push(group);
    return this;
  }

  /**
   * Add a NOT group
   */
  not(buildFn: (builder: SearchBuilder<T>) => void): this {
    const group = new SearchBuilder<T>();
    buildFn(group);
    this.notGroup = group;
    return this;
  }

  /**
   * Add order by clause
   */
  orderBy(field: keyof T, direction: "asc" | "desc" = "asc"): this {
    this.orderBy.push({ field, direction });
    return this;
  }

  /**
   * Build the Prisma where clause
   */
  build(): Prisma.Args<any, "findMany">["where"] {
    const result: Record<string, unknown> = {};

    // Add simple conditions
    for (const condition of this.conditions) {
      const where = this.buildCondition(condition);
      Object.assign(result, where);
    }

    // Add AND groups
    if (this.andGroups.length > 0) {
      const andWhere = this.andGroups.map((g) => g.build());
      result.AND = andWhere;
    }

    // Add OR groups
    if (this.orGroups.length > 0) {
      const orWhere = this.orGroups.map((g) => g.build());
      result.OR = orWhere;
    }

    // Add NOT group
    if (this.notGroup) {
      result.NOT = this.notGroup.build();
    }

    return result;
  }

  /**
   * Build a single condition into Prisma where clause
   */
  private buildCondition(condition: SearchCondition<keyof T>): Record<string, unknown> {
    const { field, operator, value } = condition;
    const fieldName = String(field);

    switch (operator) {
      case SearchOperator.EQUALS:
        return { [fieldName]: value };

      case SearchOperator.NOT_EQUALS:
        return { [fieldName]: { not: value } };

      case SearchOperator.CONTAINS:
        return { [fieldName]: { contains: value, mode: "insensitive" } };

      case SearchOperator.NOT_CONTAINS:
        return { [fieldName]: { not: { contains: value, mode: "insensitive" } } };

      case SearchOperator.STARTS_WITH:
        return { [fieldName]: { startsWith: value, mode: "insensitive" } };

      case SearchOperator.ENDS_WITH:
        return { [fieldName]: { endsWith: value, mode: "insensitive" } };

      case SearchOperator.IN:
        return { [fieldName]: { in: value } };

      case SearchOperator.NOT_IN:
        return { [fieldName]: { notIn: value } };

      case SearchOperator.GREATER_THAN:
        return { [fieldName]: { gt: value } };

      case SearchOperator.GREATER_THAN_OR_EQUAL:
        return { [fieldName]: { gte: value } };

      case SearchOperator.LESS_THAN:
        return { [fieldName]: { lt: value } };

      case SearchOperator.LESS_THAN_OR_EQUAL:
        return { [fieldName]: { lte: value } };

      case SearchOperator.IS_NULL:
        return { [fieldName]: null };

      case SearchOperator.IS_NOT_NULL:
        return { [fieldName]: { not: null } };

      case SearchOperator.IS_TRUE:
        return { [fieldName]: true };

      case SearchOperator.IS_FALSE:
        return { [fieldName]: false };

      default:
        return {};
    }
  }

  /**
   * Build orderBy clause
   */
  buildOrderBy(): Prisma.Args<any, "findMany">["orderBy"] {
    if (this.orderBy.length === 0) {
      return undefined;
    }

    if (this.orderBy.length === 1) {
      const { field, direction } = this.orderBy[0];
      return { [String(field)]: direction };
    }

    return this.orderBy.map(({ field, direction }) => ({ [String(field)]: direction }));
  }
}

// ============================================================================
// Query Builder Extensions
// ============================================================================

export interface QueryParams {
  search?: string;
  searchFields?: string[];
  filters?: Record<string, unknown>;
  sortField?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

/**
 * Build a complete query from search params
 */
export function buildSearchQuery<T>(
  params: QueryParams,
  defaultSortField: keyof T = "createdAt" as keyof T,
  defaultSortOrder: "asc" | "desc" = "desc"
): {
  where: Prisma.Args<any, "findMany">["where"];
  orderBy: Prisma.Args<any, "findMany">["orderBy"];
  skip: number;
  take: number;
} {
  const builder = new SearchBuilder<T>();

  // Add search across multiple fields
  if (params.search && params.searchFields) {
    for (const field of params.searchFields) {
      builder.contains(field as keyof T, params.search);
    }
  }

  // Add filters
  if (params.filters) {
    for (const [key, value] of Object.entries(params.filters)) {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          builder.in(key as keyof T, value as any[]);
        } else if (typeof value === "string") {
          builder.contains(key as keyof T, value);
        } else {
          builder.equals(key as keyof T, value as any);
        }
      }
    }
  }

  // Calculate pagination
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || 20));
  const skip = (page - 1) * limit;

  // Build orderBy
  const sortField = params.sortField || String(defaultSortField);
  const sortOrder = params.sortOrder || defaultSortOrder;

  return {
    where: {
      deletedAt: null, // Soft delete filter
      ...builder.build(),
    },
    orderBy: { [sortField]: sortOrder },
    skip,
    take: limit,
  };
}

// ============================================================================
// Full-Text Search (Future Enhancement)
// ============================================================================

// Note: For full-text search, consider using PostgreSQL's tsvector/tsquery
// Example for future implementation:
//
// export class FullTextSearchBuilder<T> {
//   private fields: string[] = [];
//   private searchTerm = "";
//   private ranking = false;
//
//   search(fields: string[], term: string): this {
//     this.fields = fields;
//     this.searchTerm = term;
//     return this;
//   }
//
//   withRanking(): this {
//     this.ranking = true;
//     return this;
//   }
//
//   build(): { query: object; select?: object } {
//     // PostgreSQL full-text search implementation
//     // ...
//   }
// }
