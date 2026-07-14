/**
 * Donation Service - Firebase has been removed
 * This service now returns empty arrays as no backend is available
 */

import { DonationRecord, DonationRequest, DonationStatus } from "@/types/donation";

const COLLECTION_NAME = "donations";

class DonationService {
  async createDonation(data: DonationRequest): Promise<string> {
    throw new Error("Donation creation is not available - backend services have been removed");
  }

  async getDonations(): Promise<DonationRecord[]> {
    console.log("[DonationService] Firebase removed - returning empty array");
    return [];
  }

  async getDonationById(donationId: string): Promise<DonationRecord | null> {
    return null;
  }

  async updateDonationStatus(donationId: string, status: DonationStatus): Promise<void> {
    throw new Error("Donation status update is not available - backend services have been removed");
  }

  async updateDonation(donationId: string, data: Partial<DonationRecord>): Promise<void> {
    throw new Error("Donation update is not available - backend services have been removed");
  }

  async deleteDonation(donationId: string): Promise<void> {
    throw new Error("Donation deletion is not available - backend services have been removed");
  }
}

export const donationService = new DonationService();
