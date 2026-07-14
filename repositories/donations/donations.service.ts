/**
 * Donations Service
 */

import { donationsRepository } from "./donations.repository"
import {
  validateCreateCampaign,
  validateUpdateCampaign,
  validateCreateDonation,
  validateUpdateDonation,
} from "./donations.validator"
import { logger } from "@/lib/logger"

export class DonationsService {
  async getCampaign(id: string) {
    return donationsRepository.findCampaignById(id)
  }

  async getCampaigns(params?: { active?: boolean; featured?: boolean; page?: number; limit?: number }) {
    return donationsRepository.findCampaigns(params)
  }

  async getActiveCampaigns() {
    return donationsRepository.findActiveCampaigns()
  }

  async createCampaign(data: unknown) {
    const validation = validateCreateCampaign(data)
    if (!validation.success) {
      return { success: false, error: validation.error.errors.map(e => e.message).join(", ") }
    }
    logger.info("Creating donation campaign", { title: validation.data.title })
    return donationsRepository.createCampaign(validation.data as any)
  }

  async updateCampaign(id: string, data: unknown) {
    const validation = validateUpdateCampaign(data)
    if (!validation.success) {
      return { success: false, error: validation.error.errors.map(e => e.message).join(", ") }
    }
    logger.info("Updating campaign", { id })
    return donationsRepository.updateCampaign(id, validation.data as any)
  }

  async deleteCampaign(id: string) {
    logger.info("Deleting campaign", { id })
    return donationsRepository.deleteCampaign(id)
  }

  async getDonation(id: string) {
    return donationsRepository.findDonationById(id)
  }

  async getUserDonations(userId: string) {
    return donationsRepository.findDonationsByUser(userId)
  }

  async getCampaignDonations(campaignId: string) {
    return donationsRepository.findDonationsByCampaign(campaignId)
  }

  async createDonation(data: unknown) {
    const validation = validateCreateDonation(data)
    if (!validation.success) {
      return { success: false, error: validation.error.errors.map(e => e.message).join(", ") }
    }

    // Validate campaign exists if provided
    if (validation.data.campaignId) {
      const campaign = await donationsRepository.findCampaignById(validation.data.campaignId)
      if (!campaign.success || !campaign.data) {
        return { success: false, error: "Campaign not found" }
      }
      if (!campaign.data.active) {
        return { success: false, error: "Campaign is not active" }
      }
    }

    logger.info("Creating donation", { amount: validation.data.amount, donorEmail: validation.data.donorEmail })
    return donationsRepository.createDonation(validation.data as any)
  }

  async updateDonation(id: string, data: unknown) {
    const validation = validateUpdateDonation(data)
    if (!validation.success) {
      return { success: false, error: validation.error.errors.map(e => e.message).join(", ") }
    }
    logger.info("Updating donation", { id })
    return donationsRepository.updateDonation(id, validation.data as any)
  }

  async completeDonation(id: string) {
    logger.info("Completing donation", { id })
    return donationsRepository.completeDonation(id)
  }

  async failDonation(id: string) {
    logger.info("Failing donation", { id })
    return donationsRepository.failDonation(id)
  }

  async addReceipt(id: string, receiptNumber: string, receiptUrl: string) {
    logger.info("Adding donation receipt", { id, receiptNumber })
    return donationsRepository.addReceipt(id, receiptNumber, receiptUrl)
  }

  async getDonationStats(campaignId?: string) {
    return donationsRepository.getDonationStats(campaignId)
  }

  async getRecentDonations(limit?: number) {
    return donationsRepository.getRecentDonations(limit)
  }
}

export const donationsService = new DonationsService()
