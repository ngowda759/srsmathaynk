/**
 * Profile Mapper
 * 
 * Maps between Prisma Profile model and ProfileDomain.
 */

import { BaseMapper } from "../base.mapper";
import type { Profile, Prisma } from "@prisma/client";
import type { ProfileDomain } from "@/types/interfaces";

// ============================================================================
// Profile Mapper
// ============================================================================

export class ProfileMapper extends BaseMapper<Profile, ProfileDomain> {
  /**
   * Map Prisma Profile to ProfileDomain
   */
  toDomain(prisma: Profile): ProfileDomain {
    return {
      id: prisma.id,
      userId: prisma.userId,
      email: prisma.email,
      name: prisma.name,
      phone: prisma.phone,
      address: prisma.address,
      avatarId: prisma.avatarId,
      emailVerified: prisma.emailVerified,
      isActive: prisma.isActive,
      lastLoginAt: prisma.lastLoginAt ? new Date(prisma.lastLoginAt) : null,
      createdAt: new Date(prisma.createdAt),
      updatedAt: new Date(prisma.updatedAt),
      deletedAt: prisma.deletedAt ? new Date(prisma.deletedAt) : null,
    };
  }

  /**
   * Map domain input to Prisma create input
   */
  toCreateInput(domain: Partial<ProfileDomain>): Prisma.ProfileCreateInput {
    return {
      userId: domain.userId!,
      email: domain.email!,
      name: domain.name,
      phone: domain.phone,
      address: domain.address,
      avatarId: domain.avatarId,
      emailVerified: domain.emailVerified ?? false,
      isActive: domain.isActive ?? true,
    };
  }

  /**
   * Map domain input to Prisma update input
   */
  toUpdateInput(domain: Partial<ProfileDomain>): Prisma.ProfileUpdateInput {
    const input: Prisma.ProfileUpdateInput = {};

    if (domain.name !== undefined) input.name = domain.name;
    if (domain.phone !== undefined) input.phone = domain.phone;
    if (domain.address !== undefined) input.address = domain.address;
    if (domain.avatarId !== undefined) input.avatarId = domain.avatarId;
    if (domain.emailVerified !== undefined) input.emailVerified = domain.emailVerified;
    if (domain.isActive !== undefined) input.isActive = domain.isActive;
    if (domain.lastLoginAt !== undefined) input.lastLoginAt = domain.lastLoginAt;

    return input;
  }
}

// Singleton instance
export const profileMapper = new ProfileMapper();
