/**
 * Profile Repository
 * 
 * Data access layer for profiles.
 * Uses mapper to convert Prisma objects to domain objects.
 */

import { prisma } from "@/lib/db";
import { BaseRepository } from "@/repositories/base";
import { profileMapper } from "@/mappers/profile";
import type { ProfileDomain, IProfileRepository } from "@/types/interfaces";

// ============================================================================
// Repository Implementation
// ============================================================================

export class ProfileRepository
  extends BaseRepository<ProfileDomain>
  implements IProfileRepository
{
  constructor() {
    super(prisma.profile);
  }

  protected getModelName(): string {
    return "Profile";
  }

  // ==========================================================================
  // Domain Methods
  // ==========================================================================

  /**
   * Find profile by user ID
   */
  async findByUserId(userId: string): Promise<ProfileDomain | null> {
    const record = await (this.model as any).findFirst({
      where: {
        userId,
        deletedAt: null,
      },
    });

    if (!record) {
      return null;
    }

    return profileMapper.toDomain(record);
  }

  /**
   * Find profile by email
   */
  async findByEmail(email: string): Promise<ProfileDomain | null> {
    const record = await (this.model as any).findFirst({
      where: {
        email,
        deletedAt: null,
      },
    });

    if (!record) {
      return null;
    }

    return profileMapper.toDomain(record);
  }

  /**
   * Update last login timestamp
   */
  async updateLastLogin(id: string): Promise<void> {
    await (this.model as any).update({
      where: { id },
      data: {
        lastLoginAt: new Date(),
      },
    });
  }

  // ==========================================================================
  // Override base methods to return domain objects
  // ==========================================================================

  async findById(id: string): Promise<ProfileDomain> {
    const prismaRecord = await (this.model as any).findUnique({
      where: { id },
    });

    if (!prismaRecord) {
      throw new Error(`${this.getModelName()} not found: ${id}`);
    }

    return profileMapper.toDomain(prismaRecord);
  }

  async create(data: Partial<ProfileDomain>): Promise<ProfileDomain> {
    const input = profileMapper.toCreateInput(data);
    const prismaRecord = await (this.model as any).create({ data: input });
    return profileMapper.toDomain(prismaRecord);
  }

  async update(id: string, data: Partial<ProfileDomain>): Promise<ProfileDomain> {
    const input = profileMapper.toUpdateInput(data);
    const prismaRecord = await (this.model as any).update({
      where: { id },
      data: input,
    });
    return profileMapper.toDomain(prismaRecord);
  }
}

// Singleton instance
export const profileRepository = new ProfileRepository();
