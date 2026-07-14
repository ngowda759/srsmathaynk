/**
 * Event Mapper
 * 
 * Maps between Prisma Event model and EventDomain.
 */

import { BaseMapper } from "../base.mapper";
import type { Event, Prisma } from "@prisma/client";
import type { EventDomain } from "@/types/interfaces";

// ============================================================================
// Event Mapper
// ============================================================================

export class EventMapper extends BaseMapper<Event, EventDomain> {
  /**
   * Map Prisma Event to EventDomain
   */
  toDomain(prisma: Event): EventDomain {
    return {
      id: prisma.id,
      title: prisma.title,
      titleKn: prisma.titleKn,
      description: prisma.description,
      descriptionKn: prisma.descriptionKn,
      type: prisma.type,
      status: prisma.status,
      startDate: new Date(prisma.startDate),
      endDate: new Date(prisma.endDate),
      location: prisma.location,
      isFeatured: prisma.isFeatured,
      imageUrl: prisma.imageUrl,
      createdAt: new Date(prisma.createdAt),
      updatedAt: new Date(prisma.updatedAt),
      deletedAt: prisma.deletedAt ? new Date(prisma.deletedAt) : null,
    };
  }

  /**
   * Map domain input to Prisma create input
   */
  toCreateInput(domain: Partial<EventDomain>): Prisma.EventCreateInput {
    return {
      title: domain.title!,
      titleKn: domain.titleKn,
      description: domain.description,
      descriptionKn: domain.descriptionKn,
      type: domain.type!,
      status: domain.status ?? "UPCOMING",
      startDate: domain.startDate!,
      endDate: domain.endDate!,
      location: domain.location,
      isFeatured: domain.isFeatured ?? false,
      imageUrl: domain.imageUrl,
    };
  }

  /**
   * Map domain input to Prisma update input
   */
  toUpdateInput(domain: Partial<EventDomain>): Prisma.EventUpdateInput {
    const input: Prisma.EventUpdateInput = {};

    if (domain.title !== undefined) input.title = domain.title;
    if (domain.titleKn !== undefined) input.titleKn = domain.titleKn;
    if (domain.description !== undefined) input.description = domain.description;
    if (domain.descriptionKn !== undefined) input.descriptionKn = domain.descriptionKn;
    if (domain.type !== undefined) input.type = domain.type;
    if (domain.status !== undefined) input.status = domain.status;
    if (domain.startDate !== undefined) input.startDate = domain.startDate;
    if (domain.endDate !== undefined) input.endDate = domain.endDate;
    if (domain.location !== undefined) input.location = domain.location;
    if (domain.isFeatured !== undefined) input.isFeatured = domain.isFeatured;
    if (domain.imageUrl !== undefined) input.imageUrl = domain.imageUrl;

    return input;
  }
}

// Singleton instance
export const eventMapper = new EventMapper();
