/**
 * Donation Campaign Service - Firebase has been removed
 * This service now returns empty arrays as no backend is available
 */

import {
  DonationCampaign,
  DonationCampaignRequest,
} from "@/types/donationCampaign";

const COLLECTION_NAME = "donation_campaigns";

class DonationCampaignService {
  async getCampaigns(): Promise<DonationCampaign[]> {
    console.log("[DonationCampaignService] Firebase removed - returning empty array");
    return [];
  }

  async getActiveCampaigns(): Promise<DonationCampaign[]> {
    return [];
  }

  async getCampaignById(id: string): Promise<DonationCampaign | null> {
    return null;
  }

  async createCampaign(data: DonationCampaignRequest) {
    throw new Error("Campaign creation is not available - backend services have been removed");
  }

  async updateCampaign(id: string, data: Partial<DonationCampaignRequest>) {
    throw new Error("Campaign update is not available - backend services have been removed");
  }

  async deleteCampaign(id: string) {
    throw new Error("Campaign deletion is not available - backend services have been removed");
  }
}

export const donationCampaignService = new DonationCampaignService();
