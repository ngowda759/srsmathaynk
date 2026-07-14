/**
 * Donation Mapper
 * 
 * Maps between Prisma Donation model and DonationDomain.
 */

import { BaseMapper } from "../base.mapper";
import type { Donation, Prisma } from "@prisma/client";
import type { DonationDomain } from "@/types/interfaces";

// ============================================================================
// Donation Mapper
// ============================================================================

export class DonationMapper extends BaseMapper<Donation, DonationDomain> {
  /**
   * Map Prisma Donation to DonationDomain
   */
  toDomain(prisma: Donation): DonationDomain {
    return {
      id: prisma.id,
      campaignId: prisma.campaignId,
      profileId: prisma.profileId,
      amount: Number(prisma.amount),
      paymentMethod: prisma.paymentMethod,
      status: prisma.status as DonationDomain["status"],
      message: prisma.message,
      isAnonymous: prisma.isAnonymous,
      transactionId: prisma.transactionId,
      createdAt: new Date(prisma.createdAt),
      updatedAt: new Date(prisma.updatedAt),
      deletedAt: prisma.deletedAt ? new Date(prisma.deletedAt) : null,
    };
  }

  /**
   * Map domain input to Prisma create input
   */
  toCreateInput(domain: Partial<DonationDomain>): Prisma.DonationCreateInput {
    return {
      campaignId: domain.campaignId,
      profileId: domain.profileId!,
      amount: domain.amount!,
      paymentMethod: domain.paymentMethod!,
      status: domain.status ?? "PENDING",
      message: domain.message,
      isAnonymous: domain.isAnonymous ?? false,
      transactionId: domain.transactionId,
    };
  }

  /**
   * Map domain input to Prisma update input
   */
  toUpdateInput(domain: Partial<DonationDomain>): Prisma.DonationUpdateInput {
    const input: Prisma.DonationUpdateInput = {};

    if (domain.status !== undefined) input.status = domain.status;
    if (domain.message !== undefined) input.message = domain.message;
    if (domain.transactionId !== undefined) input.transactionId = domain.transactionId;

    return input;
  }
}

// Singleton instance
export const donationMapper = new DonationMapper();
