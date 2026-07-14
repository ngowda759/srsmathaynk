/**
 * Donation Repository
 * 
 * Data access layer for donations.
 * Uses mapper to convert Prisma objects to domain objects.
 */

import { prisma } from "@/lib/db";
import { BaseRepository } from "@/repositories/base";
import { donationMapper } from "@/mappers/donation";
import type { DonationDomain, IDonationRepository } from "@/types/interfaces";

// ============================================================================
// Repository Implementation
// ============================================================================

export class DonationRepository
  extends BaseRepository<DonationDomain>
  implements IDonationRepository
{
  constructor() {
    super(prisma.donation);
  }

  protected getModelName(): string {
    return "Donation";
  }

  // ==========================================================================
  // Domain Methods
  // ==========================================================================

  /**
   * Find donations by profile
   */
  async findByProfile(profileId: string): Promise<DonationDomain[]> {
    const records = await (this.model as any).findMany({
      where: {
        profileId,
        deletedAt: null,
      },
      orderBy: { createdAt: "desc" },
    });

    return donationMapper.toDomainList(records);
  }

  /**
   * Find donations by campaign
   */
  async findByCampaign(campaignId: string): Promise<DonationDomain[]> {
    const records = await (this.model as any).findMany({
      where: {
        campaignId,
        deletedAt: null,
      },
      orderBy: { createdAt: "desc" },
    });

    return donationMapper.toDomainList(records);
  }

  /**
   * Find donations by status
   */
  async findByStatus(status: string): Promise<DonationDomain[]> {
    const records = await (this.model as any).findMany({
      where: {
        status,
        deletedAt: null,
      },
      orderBy: { createdAt: "desc" },
    });

    return donationMapper.toDomainList(records);
  }

  /**
   * Get total donations for a campaign
   */
  async findTotalByCampaign(campaignId: string): Promise<number> {
    const result = await (this.model as any).aggregate({
      where: {
        campaignId,
        status: "COMPLETED",
        deletedAt: null,
      },
      _sum: {
        amount: true,
      },
    });

    return Number(result._sum.amount) || 0;
  }

  // ==========================================================================
  // Override base methods to return domain objects
  // ==========================================================================

  async findById(id: string): Promise<DonationDomain> {
    const prismaRecord = await (this.model as any).findUnique({
      where: { id },
    });

    if (!prismaRecord) {
      throw new Error(`${this.getModelName()} not found: ${id}`);
    }

    return donationMapper.toDomain(prismaRecord);
  }

  async create(data: Partial<DonationDomain>): Promise<DonationDomain> {
    const input = donationMapper.toCreateInput(data);
    const prismaRecord = await (this.model as any).create({ data: input });
    return donationMapper.toDomain(prismaRecord);
  }

  async update(id: string, data: Partial<DonationDomain>): Promise<DonationDomain> {
    const input = donationMapper.toUpdateInput(data);
    const prismaRecord = await (this.model as any).update({
      where: { id },
      data: input,
    });
    return donationMapper.toDomain(prismaRecord);
  }
}

// Singleton instance
export const donationRepository = new DonationRepository();
