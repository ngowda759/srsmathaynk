/**
 * Donations Repository Types
 */

import { DonationCampaign, Donation } from "@prisma/client"

export type { DonationCampaign, Donation }

export interface CreateCampaignDTO {
  title: string
  titleKannada?: string
  description?: string
  descriptionKannada?: string
  targetAmount?: number
  imageUrl?: string
  videoUrl?: string
  active?: boolean
  featured?: boolean
  startDate?: Date
  endDate?: Date
  urgencyLevel?: "LOW" | "NORMAL" | "HIGH" | "CRITICAL"
  category?: string
}

export interface UpdateCampaignDTO extends Partial<CreateCampaignDTO> {}

export interface CreateDonationDTO {
  userId?: string
  campaignId?: string
  amount: number
  currency?: string
  paymentMethod?: "CARD" | "UPI" | "NET_BANKING" | "WALLET" | "BANK_TRANSFER" | "CASH" | "CHEQUE"
  paymentId?: string
  transactionId?: string
  donorName: string
  donorEmail: string
  donorPhone?: string
  anonymous?: boolean
  message?: string
  dedication?: string
}

export interface UpdateDonationDTO {
  status?: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "REFUNDED"
  paymentId?: string
  transactionId?: string
  receiptNumber?: string
  receiptUrl?: string
}
