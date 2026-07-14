/**
 * Announcement Mapper
 * 
 * Maps between Prisma Announcement model and AnnouncementDomain.
 */

import { BaseMapper } from "../base.mapper";
import type { Announcement, Prisma } from "@prisma/client";
import type { AnnouncementDomain } from "@/types/interfaces";
import { AnnouncementType, Priority } from "@prisma/client";

// ============================================================================
// Announcement Mapper
// ============================================================================

export class AnnouncementMapper extends BaseMapper<Announcement, AnnouncementDomain> {
  /**
   * Determine announcement status based on dates and flags
   */
  private determineStatus(announcement: Announcement): AnnouncementDomain["status"] {
    const now = new Date();
    
    if (!announcement.isActive) {
      return "ARCHIVED";
    }
    
    if (announcement.publishAt && announcement.publishAt > now) {
      return "SCHEDULED";
    }
    
    if (announcement.expiresAt && announcement.expiresAt < now) {
      return "ARCHIVED";
    }
    
    return "PUBLISHED";
  }

  /**
   * Map Prisma Announcement to AnnouncementDomain
   */
  toDomain(prisma: Announcement): AnnouncementDomain {
    return {
      id: prisma.id,
      title: prisma.title,
      content: prisma.content,
      excerpt: prisma.excerpt,
      type: prisma.type as AnnouncementDomain["type"],
      priority: prisma.priority as AnnouncementDomain["priority"],
      isPinned: prisma.isPinned,
      isActive: prisma.isActive,
      status: this.determineStatus(prisma),
      publishAt: this.toDate(prisma.publishAt),
      expiresAt: this.toDate(prisma.expiresAt),
      authorId: prisma.authorId,
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
      excerpt: domain.excerpt || null,
      type: (domain.type as AnnouncementType) || "GENERAL",
      priority: (domain.priority as Priority) || "NORMAL",
      isPinned: domain.isPinned ?? false,
      isActive: domain.isActive ?? true,
      publishAt: domain.publishAt || null,
      expiresAt: domain.expiresAt || null,
      authorId: domain.authorId || null,
    };
  }

  /**
   * Map domain input to Prisma update input
   */
  toUpdateInput(domain: Partial<AnnouncementDomain>): Prisma.AnnouncementUpdateInput {
    const input: Prisma.AnnouncementUpdateInput = {};

    if (domain.title !== undefined) input.title = domain.title;
    if (domain.content !== undefined) input.content = domain.content;
    if (domain.excerpt !== undefined) input.excerpt = domain.excerpt;
    if (domain.type !== undefined) input.type = domain.type as AnnouncementType;
    if (domain.priority !== undefined) input.priority = domain.priority as Priority;
    if (domain.isPinned !== undefined) input.isPinned = domain.isPinned;
    if (domain.isActive !== undefined) input.isActive = domain.isActive;
    if (domain.publishAt !== undefined) input.publishAt = domain.publishAt;
    if (domain.expiresAt !== undefined) input.expiresAt = domain.expiresAt;

    return input;
  }
}

// Singleton instance
export const announcementMapper = new AnnouncementMapper();
