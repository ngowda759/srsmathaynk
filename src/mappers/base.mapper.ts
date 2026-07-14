/**
 * Base Mapper
 * 
 * Provides a base class for domain mappers that convert Prisma objects to domain objects.
 * This separation ensures:
 * - Repositories focus on data access
 * - Mapping logic is centralized and reusable
 * - Domain objects are independent of Prisma
 * 
 * Pattern:
 * Prisma Model → Mapper → Domain Object
 */

import type { Prisma } from "@prisma/client";

// ============================================================================
// Base Mapper Interface
// ============================================================================

export interface IMapper<PrismaModel, DomainModel> {
  /**
   * Map a Prisma model to a domain object
   */
  toDomain(prisma: PrismaModel): DomainModel;

  /**
   * Map a domain object to Prisma create input
   */
  toCreateInput(domain: Partial<DomainModel>): Partial<PrismaModel>;

  /**
   * Map a domain object to Prisma update input
   */
  toUpdateInput(domain: Partial<DomainModel>): Partial<PrismaModel>;

  /**
   * Map multiple Prisma models to domain objects
   */
  toDomainList(prismaList: PrismaModel[]): DomainModel[];
}

// ============================================================================
// Base Mapper Class
// ============================================================================

export abstract class BaseMapper<PrismaModel, DomainModel>
  implements IMapper<PrismaModel, DomainModel>
{
  /**
   * Map a Prisma model to a domain object
   */
  abstract toDomain(prisma: PrismaModel): DomainModel;

  /**
   * Map a domain object to Prisma create input
   */
  abstract toCreateInput(domain: Partial<DomainModel>): Partial<PrismaModel>;

  /**
   * Map a domain object to Prisma update input
   */
  abstract toUpdateInput(domain: Partial<DomainModel>): Partial<PrismaModel>;

  /**
   * Map multiple Prisma models to domain objects
   */
  toDomainList(prismaList: PrismaModel[]): DomainModel[] {
    return prismaList.map((prisma) => this.toDomain(prisma));
  }

  /**
   * Map optional Prisma model to domain object
   */
  toDomainOptional(prisma: PrismaModel | null | undefined): DomainModel | null {
    if (!prisma) return null;
    return this.toDomain(prisma);
  }

  /**
   * Apply default values for domain object
   */
  protected applyDefaults<T extends Record<string, unknown>>(
    domain: Partial<T>,
    defaults: Partial<T>
  ): Partial<T> {
    return { ...defaults, ...domain };
  }

  /**
   * Convert date fields
   */
  protected toDate(value: Date | string | null | undefined): Date | null {
    if (!value) return null;
    if (value instanceof Date) return value;
    return new Date(value);
  }

  /**
   * Convert enum values
   */
  protected toEnum<T>(value: string | null | undefined, enumObj: Record<string, T>): T | null {
    if (!value) return null;
    return enumObj[value] || null;
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Extract ID from a Prisma model
 */
export function extractId<T extends { id: string }>(prisma: T): string {
  return prisma.id;
}

/**
 * Extract timestamps from a Prisma model
 */
export function extractTimestamps<T extends { createdAt: Date; updatedAt: Date; deletedAt?: Date | null }>(
  prisma: T
): { createdAt: Date; updatedAt: Date; deletedAt: Date | null } {
  return {
    createdAt: new Date(prisma.createdAt),
    updatedAt: new Date(prisma.updatedAt),
    deletedAt: prisma.deletedAt ? new Date(prisma.deletedAt) : null,
  };
}

/**
 * Map Prisma include results
 */
export function mapInclude<T, R>(
  prisma: T | null,
  mapper: (item: NonNullable<T>) => R
): R | null {
  if (!prisma) return null;
  return mapper(prisma as NonNullable<T>);
}

/**
 * Map Prisma include list results
 */
export function mapIncludeList<T, R>(
  prisma: T[],
  mapper: (item: T) => R
): R[] {
  return prisma.map(mapper);
}
