/**
 * Base Repository
 * 
 * Provides generic CRUD operations with pagination, filtering, and sorting.
 * All database access MUST go through repositories per ADR-001.
 * 
 * Usage:
 * ```typescript
 * import { BaseRepository } from "@/repositories/base";
 * import { prisma } from "@/lib/db";
 * 
 * class AnnouncementRepository extends BaseRepository<Announcement> {
 *   constructor() {
 *     super(prisma.announcement);
 *   }
 * 
 *   protected getModelName(): string {
 *     return "Announcement";
 *   }
 * }
 * ```
 */

import { prisma, BasePrismaClient } from "@/lib/db";
import { logger } from "@/lib/logger";
import {
  NotFoundError,
  ConflictError,
  DatabaseError,
} from "@/errors";
import { normalizePagination, calculatePaginationMeta, createPaginatedResult } from "@/lib/pagination";
import { activeFilter } from "@/lib/filter";
import { buildSortOptions } from "@/lib/sorting";
import type {
  PaginationOptions,
  PaginatedResult,
  FilterOptions,
  QueryOptions,
} from "@/types";

// Re-export the repository type
export type { BasePrismaClient };

// ============================================================================
// Base Repository Class
// ============================================================================

export abstract class BaseRepository<T extends { id: string }> {
  protected model: BasePrismaClient;

  constructor(model: BasePrismaClient) {
    this.model = model;
  }

  // ==========================================================================
  // Generic CRUD Operations
  // ==========================================================================

  /**
   * Find a single record by ID
   */
  async findById(
    id: string,
    options?: { include?: Record<string, boolean | object> }
  ): Promise<T> {
    try {
      const record = await (this.model as any).findUnique({
        where: { id },
        ...options,
      });

      if (!record) {
        throw new NotFoundError(this.getModelName(), id);
      }

      return record as T;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      logger.error(`Failed to find ${this.getModelName()} by ID`, error as Error, { id });
      throw new DatabaseError(`Failed to find ${this.getModelName()}`);
    }
  }

  /**
   * Find a single record by field
   */
  async findByField<K extends keyof T>(
    field: K,
    value: T[K],
    options?: { include?: Record<string, boolean | object> }
  ): Promise<T | null> {
    try {
      const record = await (this.model as any).findFirst({
        where: { [field]: value },
        ...options,
      });

      return record as T | null;
    } catch (error) {
      logger.error(`Failed to find ${this.getModelName()} by field`, error as Error, {
        field: String(field),
        value,
      });
      throw new DatabaseError(`Failed to find ${this.getModelName()}`);
    }
  }

  /**
   * Find all records with optional query options
   */
  async findAll(options?: QueryOptions): Promise<PaginatedResult<T>> {
    try {
      const pagination = normalizePagination(options?.pagination);
      const where = this.buildWhereClause(options?.filters);
      const orderBy = buildSortOptions(options?.sort || []);

      const [data, total] = await Promise.all([
        (this.model as any).findMany({
          where,
          orderBy,
          skip: pagination.offset,
          take: pagination.limit,
          ...(options?.include && { include: options.include }),
          ...(options?.select && { select: options.select }),
          ...(options?.distinct && { distinct: options.distinct }),
        }),
        (this.model as any).count({ where }),
      ]);

      return createPaginatedResult(data as T[], total, pagination);
    } catch (error) {
      logger.error(`Failed to find all ${this.getModelName()}`, error as Error);
      throw new DatabaseError(`Failed to find ${this.getModelName()} records`);
    }
  }

  /**
   * Find a single record or throw NotFoundError
   */
  async findOne(options?: QueryOptions): Promise<T> {
    const result = await this.findAll({ ...options, pagination: { page: 1, limit: 1 } });
    
    if (result.data.length === 0) {
      throw new NotFoundError(this.getModelName());
    }

    return result.data[0];
  }

  /**
   * Create a new record
   */
  async create(data: Partial<T>): Promise<T> {
    try {
      const record = await (this.model as any).create({
        data,
      });

      logger.info(`Created ${this.getModelName()}`, { id: record.id });
      return record as T;
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictError(`A record with this data already exists`);
      }
      logger.error(`Failed to create ${this.getModelName()}`, error as Error);
      throw new DatabaseError(`Failed to create ${this.getModelName()}`);
    }
  }

  /**
   * Create multiple records in a transaction
   */
  async createMany(data: Partial<T>[]): Promise<{ count: number }> {
    try {
      const result = await (this.model as any).createMany({
        data,
        skipDuplicates: true,
      });

      logger.info(`Created ${result.count} ${this.getModelName()} records`);
      return { count: result.count };
    } catch (error) {
      logger.error(`Failed to create many ${this.getModelName()}`, error as Error);
      throw new DatabaseError(`Failed to create ${this.getModelName()} records`);
    }
  }

  /**
   * Update a record by ID
   */
  async update(id: string, data: Partial<T>): Promise<T> {
    try {
      const record = await (this.model as any).update({
        where: { id },
        data,
      });

      logger.info(`Updated ${this.getModelName()}`, { id });
      return record as T;
    } catch (error) {
      if (this.isNotFoundError(error)) {
        throw new NotFoundError(this.getModelName(), id);
      }
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictError(`A record with this data already exists`);
      }
      logger.error(`Failed to update ${this.getModelName()}`, error as Error, { id });
      throw new DatabaseError(`Failed to update ${this.getModelName()}`);
    }
  }

  /**
   * Update multiple records
   */
  async updateMany(where: Record<string, unknown>, data: Partial<T>): Promise<{ count: number }> {
    try {
      const result = await (this.model as any).updateMany({
        where,
        data,
      });

      logger.info(`Updated ${result.count} ${this.getModelName()} records`);
      return { count: result.count };
    } catch (error) {
      logger.error(`Failed to update many ${this.getModelName()}`, error as Error);
      throw new DatabaseError(`Failed to update ${this.getModelName()} records`);
    }
  }

  /**
   * Soft delete a record by ID
   */
  async delete(id: string, deletedById?: string): Promise<T> {
    try {
      const record = await (this.model as any).update({
        where: { id },
        data: {
          deletedAt: new Date(),
          ...(deletedById && { updatedById: deletedById }),
        },
      });

      logger.info(`Soft deleted ${this.getModelName()}`, { id });
      return record as T;
    } catch (error) {
      if (this.isNotFoundError(error)) {
        throw new NotFoundError(this.getModelName(), id);
      }
      logger.error(`Failed to delete ${this.getModelName()}`, error as Error, { id });
      throw new DatabaseError(`Failed to delete ${this.getModelName()}`);
    }
  }

  /**
   * Hard delete a record by ID (use with caution)
   */
  async hardDelete(id: string): Promise<T> {
    try {
      const record = await (this.model as any).delete({
        where: { id },
      });

      logger.info(`Hard deleted ${this.getModelName()}`, { id });
      return record as T;
    } catch (error) {
      if (this.isNotFoundError(error)) {
        throw new NotFoundError(this.getModelName(), id);
      }
      logger.error(`Failed to hard delete ${this.getModelName()}`, error as Error, { id });
      throw new DatabaseError(`Failed to delete ${this.getModelName()}`);
    }
  }

  /**
   * Count records matching criteria
   */
  async count(filters?: FilterOptions[]): Promise<number> {
    try {
      const where = this.buildWhereClause(filters);
      return await (this.model as any).count({ where });
    } catch (error) {
      logger.error(`Failed to count ${this.getModelName()}`, error as Error);
      throw new DatabaseError(`Failed to count ${this.getModelName()}`);
    }
  }

  /**
   * Check if a record exists
   */
  async exists(id: string): Promise<boolean> {
    try {
      const count = await (this.model as any).count({
        where: { id },
      });
      return count > 0;
    } catch (error) {
      logger.error(`Failed to check existence of ${this.getModelName()}`, error as Error);
      return false;
    }
  }

  /**
   * Check if a record exists with given conditions
   */
  async existsWhere(conditions: Record<string, unknown>): Promise<boolean> {
    try {
      const count = await (this.model as any).count({
        where: conditions,
      });
      return count > 0;
    } catch (error) {
      logger.error(`Failed to check existence of ${this.getModelName()}`, error as Error);
      return false;
    }
  }

  // ==========================================================================
  // Helper Methods
  // ==========================================================================

  /**
   * Build where clause from filters
   */
  protected buildWhereClause(filters?: FilterOptions[]): Record<string, unknown> {
    const conditions: Record<string, unknown>[] = [];

    // Add active filter by default
    conditions.push(activeFilter());

    if (filters && filters.length > 0) {
      for (const filter of filters) {
        conditions.push(this.buildComplexFilter(filter));
      }
    }

    if (conditions.length === 1) {
      return conditions[0];
    }

    return { AND: conditions };
  }

  /**
   * Build a complex filter condition
   */
  protected buildComplexFilter(filter: FilterOptions): Record<string, unknown> {
    const { field, operator, value } = filter;

    switch (operator) {
      case "eq":
        return { [field]: value };
      case "ne":
        return { [field]: { not: value } };
      case "gt":
        return { [field]: { gt: value } };
      case "gte":
        return { [field]: { gte: value } };
      case "lt":
        return { [field]: { lt: value } };
      case "lte":
        return { [field]: { lte: value } };
      case "contains":
        return { [field]: { contains: value, mode: "insensitive" } };
      case "startsWith":
        return { [field]: { startsWith: value, mode: "insensitive" } };
      case "endsWith":
        return { [field]: { endsWith: value, mode: "insensitive" } };
      case "in":
        return { [field]: { in: value } };
      case "notIn":
        return { [field]: { notIn: value } };
      case "isNull":
        return { [field]: null };
      case "isNotNull":
        return { [field]: { not: null } };
      default:
        return { [field]: value };
    }
  }

  /**
   * Get the model name for error messages
   */
  protected abstract getModelName(): string;

  /**
   * Check if error is a not found error
   */
  protected isNotFoundError(error: unknown): boolean {
    return (
      error instanceof Error &&
      error.name === "NotFoundError"
    );
  }

  /**
   * Check if error is a unique constraint error
   */
  protected isUniqueConstraintError(error: unknown): boolean {
    if (error && typeof error === "object" && "code" in error) {
      return (error as { code: string }).code === "P2002";
    }
    return false;
  }
}
