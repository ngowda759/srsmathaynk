/**
 * Announcement Repository
 * 
 * Data access layer for announcements.
 * Uses mapper to convert Prisma objects to domain objects.
 * 
 * Usage:
 * ```typescript
 * import { AnnouncementRepository } from "@/repositories/announcement";
 * 
 * const repo = new AnnouncementRepository();
 * const announcements = await repo.findActive();
 * ```
 */

import { prisma } from "@/lib/db";
import { BaseRepository } from "@/repositories/base";
import { announcementMapper } from "@/mappers/announcement";
import type { Announcement, Prisma } from "@prisma/client";
import type { AnnouncementDomain, IAnnouncementRepository } from "@/types/interfaces";

// ============================================================================
// Repository Implementation
// ============================================================================

export class AnnouncementRepository
  extends BaseRepository<AnnouncementDomain>
  implements IAnnouncementRepository
{
  constructor() {
    super(prisma.announcement);
  }

  protected getModelName(): string {
    return "Announcement";
  }

  // ==========================================================================
  // Domain Methods
  // ==========================================================================

  /**
   * Find all active announcements
   */
  async findActive(): Promise<AnnouncementDomain[]> {
    const records = await (this.model as any).findMany({
      where: {
        isActive: true,
        deletedAt: null,
      },
      orderBy: { createdAt: "desc" },
    });

    return announcementMapper.toDomainList(records);
  }

  /**
   * Find announcements by type
   */
  async findByType(type: string): Promise<AnnouncementDomain[]> {
    const records = await (this.model as any).findMany({
      where: {
        type,
        deletedAt: null,
      },
      orderBy: { createdAt: "desc" },
    });

    return announcementMapper.toDomainList(records);
  }

  /**
   * Find published announcements (active and within publish window)
   */
  async findPublished(): Promise<AnnouncementDomain[]> {
    const now = new Date();
    
    const records = await (this.model as any).findMany({
      where: {
        isActive: true,
        deletedAt: null,
        OR: [
          { publishAt: null },
          { publishAt: { lte: now } },
        ],
        AND: [
          {
            OR: [
              { expiresAt: null },
              { expiresAt: { gte: now } },
            ],
          },
        ],
      },
      orderBy: [
        { priority: "desc" },
        { createdAt: "desc" },
      ],
    });

    return announcementMapper.toDomainList(records);
  }

  // ==========================================================================
  // Override base methods to return domain objects
  // ==========================================================================

  async findById(id: string): Promise<AnnouncementDomain> {
    const prismaRecord = await (this.model as any).findUnique({
      where: { id },
    });

    if (!prismaRecord) {
      throw new Error(`${this.getModelName()} not found: ${id}`);
    }

    return announcementMapper.toDomain(prismaRecord);
  }

  async create(data: Partial<AnnouncementDomain>): Promise<AnnouncementDomain> {
    const input = announcementMapper.toCreateInput(data);
    const prismaRecord = await (this.model as any).create({ data: input });
    return announcementMapper.toDomain(prismaRecord);
  }

  async update(id: string, data: Partial<AnnouncementDomain>): Promise<AnnouncementDomain> {
    const input = announcementMapper.toUpdateInput(data);
    const prismaRecord = await (this.model as any).update({
      where: { id },
      data: input,
    });
    return announcementMapper.toDomain(prismaRecord);
  }
}

// Singleton instance
export const announcementRepository = new AnnouncementRepository();
