/**
 * Donation Service - Sprint 4.3
 * Full CRUD operations using Prisma
 */

import { prisma } from "@/lib/db";
import {
  DonationRecord,
  DonationRequest,
  DonationCampaignRequest,
  DonationStats,
  DonationCampaignRecord,
} from "@/types/donation";
import { Prisma } from "@prisma/client";

// Helper to convert Prisma Decimal to number
function decimalToNumber(value: unknown): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === "object" && value !== null && "__value" in value) {
    return Number((value as { __value: string }).__value);
  }
  return Number(value);
}

// Donation Service
export const donationService = {
  // Donations
  async createDonation(data: DonationRequest): Promise<string> {
    const donation = await prisma.donation.create({
      data: {
        profileId: data.profileId,
        campaignId: data.campaignId,
        amount: new Prisma.Decimal(data.amount),
        currency: data.currency || "INR",
        paymentMethod: data.paymentMethod,
        donorName: data.donorName,
        donorEmail: data.donorEmail,
        donorPhone: data.donorPhone,
        donorAddress: data.donorAddress,
        anonymous: data.anonymous || false,
        message: data.message,
        dedication: data.dedication,
        status: "PENDING",
      },
    });

    // Update campaign raised amount if linked
    if (data.campaignId) {
      await this.updateCampaignRaisedAmount(data.campaignId);
    }

    return donation.id;
  },

  async getDonations(options?: {
    campaignId?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<{ donations: DonationRecord[]; total: number }> {
    const where: Prisma.DonationWhereInput = {
      deletedAt: null,
      ...(options?.campaignId && { campaignId: options.campaignId }),
      ...(options?.status && { status: options.status as Prisma.EnumDonationStatusFilter["equals"] }),
      ...(options?.startDate && { createdAt: { gte: options.startDate } }),
      ...(options?.endDate && { createdAt: { lte: options.endDate } }),
    };

    const [donations, total] = await Promise.all([
      prisma.donation.findMany({
        where,
        include: {
          campaign: true,
          profile: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        take: options?.limit,
        skip: options?.offset,
      }),
      prisma.donation.count({ where }),
    ]);

    return {
      donations: donations.map((d) => ({
        ...d,
        amount: decimalToNumber(d.amount),
        raisedAmount: d.campaign ? decimalToNumber(d.campaign.raisedAmount) : undefined,
      })) as unknown as DonationRecord[],
      total,
    };
  },

  async getDonationById(id: string): Promise<DonationRecord | null> {
    const donation = await prisma.donation.findUnique({
      where: { id },
      include: {
        campaign: true,
        profile: { select: { id: true, name: true, email: true } },
        payments: { orderBy: { attemptedAt: "desc" } },
      },
    });

    if (!donation) return null;

    return {
      ...donation,
      amount: decimalToNumber(donation.amount),
    } as unknown as DonationRecord;
  },

  async updateDonation(
    id: string,
    data: Partial<DonationRequest & { status?: string }>
  ): Promise<void> {
    const updateData: Prisma.DonationUpdateInput = {};

    if (data.amount !== undefined) updateData.amount = new Prisma.Decimal(data.amount);
    if (data.status) updateData.status = data.status as Prisma.EnumDonationStatusFieldUpdateOperationsInput;
    if (data.paymentMethod) updateData.paymentMethod = data.paymentMethod;
    if (data.donorName) updateData.donorName = data.donorName;
    if (data.donorEmail) updateData.donorEmail = data.donorEmail;
    if (data.donorPhone !== undefined) updateData.donorPhone = data.donorPhone;
    if (data.donorAddress !== undefined) updateData.donorAddress = data.donorAddress;
    if (data.anonymous !== undefined) updateData.anonymous = data.anonymous;
    if (data.message !== undefined) updateData.message = data.message;
    if (data.dedication !== undefined) updateData.dedication = data.dedication;
    if (data.receiptNumber) updateData.receiptNumber = data.receiptNumber;
    if (data.receiptUrl) updateData.receiptUrl = data.receiptUrl;

    await prisma.donation.update({
      where: { id },
      data: updateData,
    });

    // Update campaign raised amount if status changed to completed
    if (data.status === "COMPLETED") {
      const donation = await prisma.donation.findUnique({ where: { id } });
      if (donation?.campaignId) {
        await this.updateCampaignRaisedAmount(donation.campaignId);
      }
    }
  },

  async updateDonationStatus(id: string, status: string): Promise<void> {
    await this.updateDonation(id, { status });
  },

  async deleteDonation(id: string): Promise<void> {
    const donation = await prisma.donation.findUnique({ where: { id } });
    await prisma.donation.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    if (donation?.campaignId) {
      await this.updateCampaignRaisedAmount(donation.campaignId);
    }
  },

  async permanentDeleteDonation(id: string): Promise<void> {
    const donation = await prisma.donation.findUnique({ where: { id } });
    await prisma.donation.delete({ where: { id } });
    if (donation?.campaignId) {
      await this.updateCampaignRaisedAmount(donation.campaignId);
    }
  },

  // Campaign methods
  async createCampaign(data: DonationCampaignRequest): Promise<string> {
    const campaign = await prisma.donationCampaign.create({
      data: {
        title: data.title,
        titleKn: data.titleKn,
        description: data.description,
        descriptionKn: data.descriptionKn,
        targetAmount: data.targetAmount ? new Prisma.Decimal(data.targetAmount) : null,
        imageId: data.imageId,
        videoUrl: data.videoUrl,
        active: data.active ?? true,
        featured: data.featured ?? false,
        startDate: data.startDate,
        endDate: data.endDate,
        urgencyLevel: data.urgencyLevel || "NORMAL",
        category: data.category,
      },
    });
    return campaign.id;
  },

  async getCampaigns(options?: {
    active?: boolean;
    featured?: boolean;
    category?: string;
    limit?: number;
  }): Promise<{ campaigns: DonationCampaignRecord[]; total: number }> {
    const where: Prisma.DonationCampaignWhereInput = {
      deletedAt: null,
      ...(options?.active !== undefined && { active: options.active }),
      ...(options?.featured !== undefined && { featured: options.featured }),
      ...(options?.category && { category: options.category }),
    };

    const [campaigns, total] = await Promise.all([
      prisma.donationCampaign.findMany({
        where,
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
        take: options?.limit,
      }),
      prisma.donationCampaign.count({ where }),
    ]);

    return {
      campaigns: campaigns.map((c) => ({
        ...c,
        targetAmount: c.targetAmount ? decimalToNumber(c.targetAmount) : null,
        raisedAmount: decimalToNumber(c.raisedAmount),
      })) as unknown as DonationCampaignRecord[],
      total,
    };
  },

  async getCampaignById(id: string): Promise<DonationCampaignRecord | null> {
    const campaign = await prisma.donationCampaign.findUnique({
      where: { id },
      include: {
        donations: {
          where: { status: "COMPLETED", deletedAt: null },
          select: { amount: true },
        },
      },
    });

    if (!campaign) return null;

    return {
      ...campaign,
      targetAmount: campaign.targetAmount ? decimalToNumber(campaign.targetAmount) : null,
      raisedAmount: decimalToNumber(campaign.raisedAmount),
    } as unknown as DonationCampaignRecord;
  },

  async updateCampaign(id: string, data: Partial<DonationCampaignRequest>): Promise<void> {
    const updateData: Prisma.DonationCampaignUpdateInput = {};

    if (data.title) updateData.title = data.title;
    if (data.titleKn !== undefined) updateData.titleKn = data.titleKn;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.descriptionKn !== undefined) updateData.descriptionKn = data.descriptionKn;
    if (data.targetAmount !== undefined) updateData.targetAmount = data.targetAmount ? new Prisma.Decimal(data.targetAmount) : null;
    if (data.imageId !== undefined) (updateData as any).imageId = data.imageId;
    if (data.videoUrl !== undefined) updateData.videoUrl = data.videoUrl;
    if (data.active !== undefined) updateData.active = data.active;
    if (data.featured !== undefined) updateData.featured = data.featured;
    if (data.startDate !== undefined) updateData.startDate = data.startDate;
    if (data.endDate !== undefined) updateData.endDate = data.endDate;
    if (data.urgencyLevel) updateData.urgencyLevel = data.urgencyLevel;
    if (data.category !== undefined) updateData.category = data.category;

    await prisma.donationCampaign.update({
      where: { id },
      data: updateData,
    });
  },

  async deleteCampaign(id: string): Promise<void> {
    await prisma.donationCampaign.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },

  async toggleFeaturedCampaign(id: string): Promise<boolean> {
    const campaign = await prisma.donationCampaign.findUnique({ where: { id } });
    if (!campaign) throw new Error("Campaign not found");
    const newFeatured = !campaign.featured;
    await prisma.donationCampaign.update({
      where: { id },
      data: { featured: newFeatured },
    });
    return newFeatured;
  },

  async toggleActiveCampaign(id: string): Promise<boolean> {
    const campaign = await prisma.donationCampaign.findUnique({ where: { id } });
    if (!campaign) throw new Error("Campaign not found");
    const newActive = !campaign.active;
    await prisma.donationCampaign.update({
      where: { id },
      data: { active: newActive },
    });
    return newActive;
  },

  // Private helper to recalculate raised amount
  async updateCampaignRaisedAmount(campaignId: string): Promise<void> {
    const result = await prisma.donation.aggregate({
      where: {
        campaignId,
        status: "COMPLETED",
        deletedAt: null,
      },
      _sum: { amount: true },
    });

    await prisma.donationCampaign.update({
      where: { id: campaignId },
      data: {
        raisedAmount: new Prisma.Decimal(result._sum.amount ? decimalToNumber(result._sum.amount) : 0),
      },
    });
  },

  // Statistics
  async getStatistics(options?: {
    startDate?: Date;
    endDate?: Date;
    campaignId?: string;
  }): Promise<DonationStats> {
    const where: Prisma.DonationWhereInput = {
      deletedAt: null,
      ...(options?.startDate && { createdAt: { gte: options.startDate } }),
      ...(options?.endDate && { createdAt: { lte: options.endDate } }),
      ...(options?.campaignId && { campaignId: options.campaignId }),
    };

    const [
      totalResult,
      countByStatus,
      monthlyData,
      topCampaigns,
    ] = await Promise.all([
      prisma.donation.aggregate({
        where: { ...where, status: "COMPLETED" },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.donation.groupBy({
        by: ["status"],
        where,
        _count: true,
      }),
      prisma.$queryRaw<{ month: string; total: bigint }[]>`
        SELECT TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') as month,
               SUM( amount::numeric ) as total
        FROM donations
        WHERE deleted_at IS NULL
          AND status = 'COMPLETED'
          ${options?.startDate ? Prisma.sql`AND created_at >= ${options.startDate}` : Prisma.empty}
          ${options?.endDate ? Prisma.sql`AND created_at <= ${options.endDate}` : Prisma.empty}
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY month DESC
        LIMIT 12
      `,
      prisma.donation.findMany({
        where: { ...where, status: "COMPLETED", campaignId: { not: null } },
        select: {
          campaignId: true,
          campaign: { select: { title: true } },
          amount: true,
        },
      }),
    ]);

    const totalAmount = decimalToNumber(totalResult._sum.amount);
    const totalDonations = totalResult._count;

    // Process top campaigns
    const campaignTotals = new Map<string, { title: string; total: number }>();
    topCampaigns.forEach((d) => {
      const existing = campaignTotals.get(d.campaignId!);
      const amount = decimalToNumber(d.amount);
      if (existing) {
        existing.total += amount;
      } else {
        campaignTotals.set(d.campaignId!, {
          title: d.campaign?.title || "Unknown",
          total: amount,
        });
      }
    });

    const statusCounts = countByStatus.reduce(
      (acc, s) => ({ ...acc, [s.status]: s._count }),
      {} as Record<string, number>
    );

    return {
      totalAmount,
      totalDonations,
      pendingCount: statusCounts["PENDING"] || 0,
      completedCount: statusCounts["COMPLETED"] || 0,
      failedCount: statusCounts["FAILED"] || 0,
      refundedCount: statusCounts["REFUNDED"] || 0,
      averageDonation: totalDonations > 0 ? totalAmount / totalDonations : 0,
      topCampaigns: Array.from(campaignTotals.entries())
        .sort((a, b) => b[1].total - a[1].total)
        .slice(0, 5)
        .map(([campaignId, { title, total }]) => ({
          campaignId,
          title,
          totalAmount: total,
        })),
      monthlyTrend: monthlyData.map((m) => ({
        month: m.month,
        amount: Number(m.total),
        count: 0,
      })),
    };
  },

  // Archive (soft delete)
  async archiveDonations(ids: string[]): Promise<void> {
    await prisma.donation.updateMany({
      where: { id: { in: ids } },
      data: { deletedAt: new Date() },
    });
  },

  async restoreDonations(ids: string[]): Promise<void> {
    await prisma.donation.updateMany({
      where: { id: { in: ids } },
      data: { deletedAt: null },
    });
  },

  async getArchivedDonations(): Promise<DonationRecord[]> {
    const donations = await prisma.donation.findMany({
      where: { deletedAt: { not: null } },
      include: { campaign: true },
      orderBy: { deletedAt: "desc" },
    });
    return donations.map((d) => ({
      ...d,
      amount: decimalToNumber(d.amount),
    })) as unknown as DonationRecord[];
  },

  // Receipt generation
  async generateReceiptNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await prisma.donation.count({
      where: {
        receiptNumber: { startsWith: `SRS/${year}/` },
        deletedAt: null,
      },
    });
    const sequence = String(count + 1).padStart(6, "0");
    return `SRS/${year}/${sequence}`;
  },
};
