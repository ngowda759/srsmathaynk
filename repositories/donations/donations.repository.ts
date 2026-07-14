/**
 * Donations Repository
 */

import { prisma } from "@/lib/db"
import { CreateCampaignDTO, UpdateCampaignDTO, CreateDonationDTO, UpdateDonationDTO } from "./types"

export class DonationsRepository {
  // Campaign methods
  async findCampaignById(id: string) {
    try {
      const campaign = await prisma.donationCampaign.findUnique({
        where: { id },
        include: { _count: { select: { donations: true } } },
      })
      return { success: true, data: campaign }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async findCampaigns(params?: { active?: boolean; featured?: boolean; page?: number; limit?: number }) {
    const { active = true, featured, page = 1, limit = 10 } = params || {}
    const where: any = {}
    if (active !== undefined) where.active = active
    if (featured !== undefined) where.featured = featured

    try {
      const [data, total] = await Promise.all([
        prisma.donationCampaign.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.donationCampaign.count({ where }),
      ])
      return { success: true, data: { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasMore: page * limit < total } } }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async findActiveCampaigns() {
    try {
      const campaigns = await prisma.donationCampaign.findMany({
        where: { active: true },
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      })
      return { success: true, data: campaigns }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async createCampaign(data: CreateCampaignDTO) {
    try {
      const result = await prisma.donationCampaign.create({ data })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async updateCampaign(id: string, data: UpdateCampaignDTO) {
    try {
      const result = await prisma.donationCampaign.update({ where: { id }, data })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async deleteCampaign(id: string) {
    try {
      const result = await prisma.donationCampaign.delete({ where: { id } })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async updateCampaignRaisedAmount(id: string, amount: number) {
    try {
      const result = await prisma.donationCampaign.update({
        where: { id },
        data: { raisedAmount: { increment: amount } },
      })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  // Donation methods
  async findDonationById(id: string) {
    try {
      const donation = await prisma.donation.findUnique({
        where: { id },
        include: { campaign: true, profile: true },
      })
      return { success: true, data: donation }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async findDonationsByUser(userId: string) {
    try {
      const donations = await prisma.donation.findMany({
        where: { userId },
        include: { campaign: true },
        orderBy: { createdAt: "desc" },
      })
      return { success: true, data: donations }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async findDonationsByCampaign(campaignId: string) {
    try {
      const donations = await prisma.donation.findMany({
        where: { campaignId, status: "COMPLETED" },
        orderBy: { createdAt: "desc" },
      })
      return { success: true, data: donations }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async createDonation(data: CreateDonationDTO) {
    try {
      const result = await prisma.donation.create({ data })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async updateDonation(id: string, data: UpdateDonationDTO) {
    try {
      const result = await prisma.donation.update({ where: { id }, data })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async completeDonation(id: string) {
    try {
      const donation = await prisma.donation.findUnique({ where: { id } })
      if (!donation) return { success: false, error: "Donation not found" }

      const result = await prisma.donation.update({
        where: { id },
        data: { status: "COMPLETED" },
      })

      // Update campaign raised amount
      if (donation.campaignId) {
        await prisma.donationCampaign.update({
          where: { id: donation.campaignId },
          data: { raisedAmount: { increment: donation.amount } },
        })
      }

      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async failDonation(id: string) {
    try {
      const result = await prisma.donation.update({
        where: { id },
        data: { status: "FAILED" },
      })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async addReceipt(id: string, receiptNumber: string, receiptUrl: string) {
    try {
      const result = await prisma.donation.update({
        where: { id },
        data: { receiptNumber, receiptUrl },
      })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async getDonationStats(campaignId?: string) {
    try {
      const where: any = campaignId ? { campaignId, status: "COMPLETED" } : { status: "COMPLETED" }
      const [count, total] = await Promise.all([
        prisma.donation.count({ where }),
        prisma.donation.aggregate({ where, _sum: { amount: true } }),
      ])
      return { success: true, data: { count, total: total._sum.amount || 0 } }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async getRecentDonations(limit = 10) {
    try {
      const donations = await prisma.donation.findMany({
        where: { status: "COMPLETED", anonymous: false },
        include: { campaign: { select: { title: true } } },
        orderBy: { createdAt: "desc" },
        take: limit,
      })
      return { success: true, data: donations }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }
}

export const donationsRepository = new DonationsRepository()
