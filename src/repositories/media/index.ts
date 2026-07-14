/**
 * Media Repository
 * 
 * Data access layer for media.
 * Uses mapper to convert Prisma objects to domain objects.
 */

import { prisma } from "@/lib/db";
import { BaseRepository } from "@/repositories/base";
import { mediaMapper } from "@/mappers/media";
import type { MediaDomain, IMediaRepository } from "@/types/interfaces";

// ============================================================================
// Repository Implementation
// ============================================================================

export class MediaRepository
  extends BaseRepository<MediaDomain>
  implements IMediaRepository
{
  constructor() {
    super(prisma.media);
  }

  protected getModelName(): string {
    return "Media";
  }

  // ==========================================================================
  // Domain Methods
  // ==========================================================================

  /**
   * Find media by type
   */
  async findByType(type: string): Promise<MediaDomain[]> {
    const records = await (this.model as any).findMany({
      where: {
        type,
        deletedAt: null,
      },
      orderBy: { createdAt: "desc" },
    });

    return mediaMapper.toDomainList(records);
  }

  /**
   * Find media by bucket
   */
  async findByBucket(bucket: string): Promise<MediaDomain[]> {
    const records = await (this.model as any).findMany({
      where: {
        bucket,
        deletedAt: null,
      },
      orderBy: { createdAt: "desc" },
    });

    return mediaMapper.toDomainList(records);
  }

  // ==========================================================================
  // Override base methods to return domain objects
  // ==========================================================================

  async findById(id: string): Promise<MediaDomain> {
    const prismaRecord = await (this.model as any).findUnique({
      where: { id },
    });

    if (!prismaRecord) {
      throw new Error(`${this.getModelName()} not found: ${id}`);
    }

    return mediaMapper.toDomain(prismaRecord);
  }

  async create(data: Partial<MediaDomain>): Promise<MediaDomain> {
    const input = mediaMapper.toCreateInput(data);
    const prismaRecord = await (this.model as any).create({ data: input });
    return mediaMapper.toDomain(prismaRecord);
  }

  async update(id: string, data: Partial<MediaDomain>): Promise<MediaDomain> {
    const input = mediaMapper.toUpdateInput(data);
    const prismaRecord = await (this.model as any).update({
      where: { id },
      data: input,
    });
    return mediaMapper.toDomain(prismaRecord);
  }
}

// Singleton instance
export const mediaRepository = new MediaRepository();
