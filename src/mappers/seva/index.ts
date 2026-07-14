/**
 * Seva Mapper
 * 
 * Maps between Prisma Seva model and SevaDomain.
 */

import { BaseMapper } from "../base.mapper";
import type { Seva, Prisma } from "@prisma/client";
import type { SevaDomain } from "@/types/interfaces";

// ============================================================================
// Seva Mapper
// ============================================================================

export class SevaMapper extends BaseMapper<Seva, SevaDomain> {
  /**
   * Map Prisma Seva to SevaDomain
   */
  toDomain(prisma: Seva): SevaDomain {
    return {
      id: prisma.id,
      name: prisma.name,
      nameKn: prisma.nameKn,
      description: prisma.description,
      descriptionKn: prisma.descriptionKn,
      duration: prisma.duration,
      price: prisma.price ? Number(prisma.price) : null,
      capacity: prisma.capacity,
      isActive: prisma.isActive,
      imageUrl: prisma.imageUrl,
      createdAt: new Date(prisma.createdAt),
      updatedAt: new Date(prisma.updatedAt),
      deletedAt: prisma.deletedAt ? new Date(prisma.deletedAt) : null,
    };
  }

  /**
   * Map domain input to Prisma create input
   */
  toCreateInput(domain: Partial<SevaDomain>): Prisma.SevaCreateInput {
    return {
      name: domain.name!,
      nameKn: domain.nameKn,
      description: domain.description,
      descriptionKn: domain.descriptionKn,
      duration: domain.duration,
      price: domain.price,
      capacity: domain.capacity,
      isActive: domain.isActive ?? true,
      imageUrl: domain.imageUrl,
    };
  }

  /**
   * Map domain input to Prisma update input
   */
  toUpdateInput(domain: Partial<SevaDomain>): Prisma.SevaUpdateInput {
    const input: Prisma.SevaUpdateInput = {};

    if (domain.name !== undefined) input.name = domain.name;
    if (domain.nameKn !== undefined) input.nameKn = domain.nameKn;
    if (domain.description !== undefined) input.description = domain.description;
    if (domain.descriptionKn !== undefined) input.descriptionKn = domain.descriptionKn;
    if (domain.duration !== undefined) input.duration = domain.duration;
    if (domain.price !== undefined) input.price = domain.price;
    if (domain.capacity !== undefined) input.capacity = domain.capacity;
    if (domain.isActive !== undefined) input.isActive = domain.isActive;
    if (domain.imageUrl !== undefined) input.imageUrl = domain.imageUrl;

    return input;
  }
}

// Singleton instance
export const sevaMapper = new SevaMapper();
