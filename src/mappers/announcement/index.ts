/**
 * Announcement Mapper
 * 
 * Maps between Prisma Announcement model and AnnouncementDomain.
 */

import { BaseMapper } from "../base.mapper";
import type { Announcement, Prisma } from "@prisma/client";
import type { AnnouncementDomain } from "@/types/interfaces";

// ============================================================================
// Announcement Mapper
// ============================================================================

export class AnnouncementMapper extends BaseMapper<Announcement, AnnouncementDomain> {
  /**
   * Map Prisma Announcement to AnnouncementDomain
   */
  toDomain(prisma: Announcement): AnnouncementDomain {
    return {
      id: prisma.id,
      title: prisma.title,
      content: prisma.content,
      type: prisma.type as AnnouncementDomain["type"],
      priority: prisma.priority as AnnouncementDomain["priority"],
      isActive: prisma.isActive,
      publishAt: this.toDate(prisma.publishAt),
      expiresAt: this.toDate(prisma.expiresAt),
      createdAt: new Date(prisma.createdAt),
      updatedAt: new Date(prisma.updatedAt),
      deletedAt: prisma.deletedAt ? new Date(prisma.deletedAt) : null,
    };
  }

  /**
   * Map domain input to Prisma create input
   */
  toCreateInput(domain: Partial<AnnouncementDomain>): Prisma.AnnouncementCreateInput {
    return {
      title: domain.title!,
      content: domain.content!,
      type: domain.type,
      priority: domain.priority,
      isActive: domain.isActive ?? true,
      publishAt: domain.publishAt,
      expiresAt: domain.expiresAt,
    };
  }

  /**
   * Map domain input to Prisma update input
   */
  toUpdateInput(domain: Partial<AnnouncementDomain>): Prisma.AnnouncementUpdateInput {
    const input: Prisma.AnnouncementUpdateInput = {};

    if (domain.title !== undefined) input.title = domain.title;
    if (domain.content !== undefined) input.content = domain.content;
    if (domain.type !== undefined) input.type = domain.type;
    if (domain.priority !== undefined) input.priority = domain.priority;
    if (domain.isActive !== undefined) input.isActive = domain.isActive;
    if (domain.publishAt !== undefined) input.publishAt = domain.publishAt;
    if (domain.expiresAt !== undefined) input.expiresAt = domain.expiresAt;

    return input;
  }
}

// Singleton instance
export const announcementMapper = new AnnouncementMapper();
