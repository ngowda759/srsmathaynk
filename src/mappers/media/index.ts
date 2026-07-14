/**
 * Media Mapper
 * 
 * Maps between Prisma Media model and MediaDomain.
 */

import { BaseMapper } from "../base.mapper";
import type { Media, Prisma } from "@prisma/client";
import type { MediaDomain } from "@/types/interfaces";

// ============================================================================
// Media Mapper
// ============================================================================

export class MediaMapper extends BaseMapper<Media, MediaDomain> {
  /**
   * Map Prisma Media to MediaDomain
   */
  toDomain(prisma: Media): MediaDomain {
    return {
      id: prisma.id,
      url: prisma.url,
      type: prisma.type as MediaDomain["type"],
      name: prisma.name,
      alt: prisma.alt,
      caption: prisma.caption,
      bucket: prisma.bucket,
      size: prisma.size,
      mimeType: prisma.mimeType,
      width: prisma.width,
      height: prisma.height,
      createdAt: new Date(prisma.createdAt),
      updatedAt: new Date(prisma.updatedAt),
      deletedAt: prisma.deletedAt ? new Date(prisma.deletedAt) : null,
    };
  }

  /**
   * Map domain input to Prisma create input
   */
  toCreateInput(domain: Partial<MediaDomain>): Prisma.MediaCreateInput {
    return {
      url: domain.url!,
      type: domain.type!,
      name: domain.name!,
      alt: domain.alt,
      caption: domain.caption,
      bucket: domain.bucket,
      size: domain.size,
      mimeType: domain.mimeType,
      width: domain.width,
      height: domain.height,
    };
  }

  /**
   * Map domain input to Prisma update input
   */
  toUpdateInput(domain: Partial<MediaDomain>): Prisma.MediaUpdateInput {
    const input: Prisma.MediaUpdateInput = {};

    if (domain.url !== undefined) input.url = domain.url;
    if (domain.name !== undefined) input.name = domain.name;
    if (domain.alt !== undefined) input.alt = domain.alt;
    if (domain.caption !== undefined) input.caption = domain.caption;

    return input;
  }
}

// Singleton instance
export const mediaMapper = new MediaMapper();
