/**
 * Event Repository
 * 
 * Data access layer for events.
 * Uses mapper to convert Prisma objects to domain objects.
 */

import { prisma } from "@/lib/db";
import { BaseRepository } from "@/repositories/base";
import { eventMapper } from "@/mappers/event";
import type { EventDomain, IEventRepository } from "@/types/interfaces";

// ============================================================================
// Repository Implementation
// ============================================================================

export class EventRepository
  extends BaseRepository<EventDomain>
  implements IEventRepository
{
  constructor() {
    super(prisma.event);
  }

  protected getModelName(): string {
    return "Event";
  }

  // ==========================================================================
  // Domain Methods
  // ==========================================================================

  /**
   * Find upcoming events
   */
  async findUpcoming(): Promise<EventDomain[]> {
    const now = new Date();
    
    const records = await (this.model as any).findMany({
      where: {
        status: { in: ["UPCOMING", "ONGOING"] },
        endDate: { gte: now },
        deletedAt: null,
      },
      orderBy: { startDate: "asc" },
    });

    return eventMapper.toDomainList(records);
  }

  /**
   * Find events by date range
   */
  async findByDateRange(start: Date, end: Date): Promise<EventDomain[]> {
    const records = await (this.model as any).findMany({
      where: {
        OR: [
          {
            startDate: { gte: start, lte: end },
          },
          {
            endDate: { gte: start, lte: end },
          },
          {
            AND: [
              { startDate: { lte: start } },
              { endDate: { gte: end } },
            ],
          },
        ],
        deletedAt: null,
      },
      orderBy: { startDate: "asc" },
    });

    return eventMapper.toDomainList(records);
  }

  /**
   * Find featured events
   */
  async findFeatured(): Promise<EventDomain[]> {
    const records = await (this.model as any).findMany({
      where: {
        isFeatured: true,
        deletedAt: null,
      },
      orderBy: { startDate: "asc" },
    });

    return eventMapper.toDomainList(records);
  }

  // ==========================================================================
  // Override base methods to return domain objects
  // ==========================================================================

  async findById(id: string): Promise<EventDomain> {
    const prismaRecord = await (this.model as any).findUnique({
      where: { id },
    });

    if (!prismaRecord) {
      throw new Error(`${this.getModelName()} not found: ${id}`);
    }

    return eventMapper.toDomain(prismaRecord);
  }

  async create(data: Partial<EventDomain>): Promise<EventDomain> {
    const input = eventMapper.toCreateInput(data);
    const prismaRecord = await (this.model as any).create({ data: input });
    return eventMapper.toDomain(prismaRecord);
  }

  async update(id: string, data: Partial<EventDomain>): Promise<EventDomain> {
    const input = eventMapper.toUpdateInput(data);
    const prismaRecord = await (this.model as any).update({
      where: { id },
      data: input,
    });
    return eventMapper.toDomain(prismaRecord);
  }
}

// Singleton instance
export const eventRepository = new EventRepository();
