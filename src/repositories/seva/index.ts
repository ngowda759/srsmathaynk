/**
 * Seva Repository
 * 
 * Data access layer for sevas.
 * Uses mapper to convert Prisma objects to domain objects.
 */

import { prisma } from "@/lib/db";
import { BaseRepository } from "@/repositories/base";
import { sevaMapper } from "@/mappers/seva";
import type { SevaDomain, ISevaRepository } from "@/types/interfaces";

// ============================================================================
// Repository Implementation
// ============================================================================

export class SevaRepository
  extends BaseRepository<SevaDomain>
  implements ISevaRepository
{
  constructor() {
    super(prisma.seva);
  }

  protected getModelName(): string {
    return "Seva";
  }

  // ==========================================================================
  // Domain Methods
  // ==========================================================================

  /**
   * Find all active sevas
   */
  async findActive(): Promise<SevaDomain[]> {
    const records = await (this.model as any).findMany({
      where: {
        isActive: true,
        deletedAt: null,
      },
      orderBy: { name: "asc" },
    });

    return sevaMapper.toDomainList(records);
  }

  /**
   * Find sevas by category
   */
  async findByCategory(categoryId: string): Promise<SevaDomain[]> {
    const records = await (this.model as any).findMany({
      where: {
        categoryId,
        isActive: true,
        deletedAt: null,
      },
      orderBy: { name: "asc" },
    });

    return sevaMapper.toDomainList(records);
  }

  /**
   * Find available sevas (active with capacity)
   */
  async findAvailable(): Promise<SevaDomain[]> {
    const records = await (this.model as any).findMany({
      where: {
        isActive: true,
        deletedAt: null,
        OR: [
          { capacity: null },
          { capacity: { gt: 0 } },
        ],
      },
      orderBy: { name: "asc" },
    });

    return sevaMapper.toDomainList(records);
  }

  // ==========================================================================
  // Override base methods to return domain objects
  // ==========================================================================

  async findById(id: string): Promise<SevaDomain> {
    const prismaRecord = await (this.model as any).findUnique({
      where: { id },
    });

    if (!prismaRecord) {
      throw new Error(`${this.getModelName()} not found: ${id}`);
    }

    return sevaMapper.toDomain(prismaRecord);
  }

  async create(data: Partial<SevaDomain>): Promise<SevaDomain> {
    const input = sevaMapper.toCreateInput(data);
    const prismaRecord = await (this.model as any).create({ data: input });
    return sevaMapper.toDomain(prismaRecord);
  }

  async update(id: string, data: Partial<SevaDomain>): Promise<SevaDomain> {
    const input = sevaMapper.toUpdateInput(data);
    const prismaRecord = await (this.model as any).update({
      where: { id },
      data: input,
    });
    return sevaMapper.toDomain(prismaRecord);
  }
}

// Singleton instance
export const sevaRepository = new SevaRepository();
