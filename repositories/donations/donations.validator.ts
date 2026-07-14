/**
 * Donations Validator
 */

import { z } from "zod"

const urgencyLevels = ["LOW", "NORMAL", "HIGH", "CRITICAL"] as const
const paymentMethods = ["CARD", "UPI", "NET_BANKING", "WALLET", "BANK_TRANSFER", "CASH", "CHEQUE"] as const
const donationStatuses = ["PENDING", "PROCESSING", "COMPLETED", "FAILED", "REFUNDED"] as const

export const createCampaignSchema = z.object({
  title: z.string().min(1).max(200),
  titleKannada: z.string().max(200).optional(),
  description: z.string().optional(),
  descriptionKannada: z.string().optional(),
  targetAmount: z.number().positive().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  videoUrl: z.string().url().optional().or(z.literal("")),
  active: z.boolean().optional().default(true),
  featured: z.boolean().optional().default(false),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  urgencyLevel: z.enum(urgencyLevels).optional().default("NORMAL"),
  category: z.string().max(100).optional(),
})

export const updateCampaignSchema = createCampaignSchema.partial()

export const createDonationSchema = z.object({
  userId: z.string().optional(),
  campaignId: z.string().optional(),
  amount: z.number().positive("Amount must be positive"),
  currency: z.string().length(3).optional().default("INR"),
  paymentMethod: z.enum(paymentMethods).optional(),
  paymentId: z.string().optional(),
  transactionId: z.string().optional(),
  donorName: z.string().min(1).max(200),
  donorEmail: z.string().email(),
  donorPhone: z.string().regex(/^[+]?[\d\s-]{10,}$/).optional().or(z.literal("")),
  anonymous: z.boolean().optional().default(false),
  message: z.string().max(500).optional(),
  dedication: z.string().max(200).optional(),
})

export const updateDonationSchema = z.object({
  status: z.enum(donationStatuses).optional(),
  paymentId: z.string().optional(),
  transactionId: z.string().optional(),
  receiptNumber: z.string().optional(),
  receiptUrl: z.string().url().optional(),
})

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>
export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>
export type CreateDonationInput = z.infer<typeof createDonationSchema>
export type UpdateDonationInput = z.infer<typeof updateDonationSchema>

export function validateCreateCampaign(data: unknown) { return createCampaignSchema.safeParse(data) }
export function validateUpdateCampaign(data: unknown) { return updateCampaignSchema.safeParse(data) }
export function validateCreateDonation(data: unknown) { return createDonationSchema.safeParse(data) }
export function validateUpdateDonation(data: unknown) { return updateDonationSchema.safeParse(data) }
