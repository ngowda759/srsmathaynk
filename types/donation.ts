import type {
  DonationStatus,
  PaymentMethod,
  UrgencyLevel,
  Donation,
  DonationCampaign,
  DonationPayment,
} from "@prisma/client";

// Re-export Prisma enums
export { DonationStatus, PaymentMethod, UrgencyLevel };
export type { Donation, DonationCampaign, DonationPayment };

// Donation record for frontend
export interface DonationRecord {
  id: string;
  profileId: string | null;
  campaignId: string | null;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod | null;
  paymentId: string | null;
  transactionId: string | null;
  status: DonationStatus;
  donorName: string;
  donorEmail: string;
  donorPhone: string | null;
  donorAddress: string | null;
  anonymous: boolean;
  message: string | null;
  dedication: string | null;
  receiptNumber: string | null;
  receiptUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  // Relations
  campaign?: DonationCampaignRecord | null;
  profile?: {
    id: string;
    name: string | null;
    email: string;
  } | null;
}

// Campaign record for frontend
export interface DonationCampaignRecord {
  id: string;
  title: string;
  titleKn: string | null;
  description: string | null;
  descriptionKn: string | null;
  targetAmount: number | null;
  raisedAmount: number;
  currency: string;
  imageId: string | null;
  videoUrl: string | null;
  active: boolean;
  featured: boolean;
  startDate: Date | null;
  endDate: Date | null;
  urgencyLevel: UrgencyLevel;
  category: string | null;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

// Donation request for creating new donations
export interface DonationRequest {
  profileId?: string;
  campaignId?: string;
  amount: number;
  currency?: string;
  paymentMethod?: PaymentMethod;
  donorName: string;
  donorEmail: string;
  donorPhone?: string;
  donorAddress?: string;
  anonymous?: boolean;
  message?: string;
  dedication?: string;
  receiptNumber?: string;
  receiptUrl?: string;
  status?: string;
}

// Campaign request for creating/updating campaigns
export interface DonationCampaignRequest {
  title: string;
  titleKn?: string;
  description?: string;
  descriptionKn?: string;
  targetAmount?: number;
  imageId?: string;
  videoUrl?: string;
  active?: boolean;
  featured?: boolean;
  startDate?: Date;
  endDate?: Date;
  urgencyLevel?: UrgencyLevel;
  category?: string;
}

// Statistics
export interface DonationStats {
  totalAmount: number;
  totalDonations: number;
  pendingCount: number;
  completedCount: number;
  failedCount: number;
  refundedCount: number;
  averageDonation: number;
  topCampaigns: { campaignId: string; title: string; totalAmount: number }[];
  monthlyTrend: { month: string; amount: number; count: number }[];
}

// Payment mode options for forms
export const paymentModeOptions = [
  { label: "Card", value: "CARD" },
  { label: "UPI", value: "UPI" },
  { label: "Net Banking", value: "NET_BANKING" },
  { label: "Wallet", value: "WALLET" },
  { label: "Bank Transfer", value: "BANK_TRANSFER" },
  { label: "Cash", value: "CASH" },
  { label: "Cheque", value: "CHEQUE" },
];

// Urgency level options
export const urgencyLevelOptions = [
  { label: "Low", value: "LOW", color: "text-blue-600 bg-blue-50" },
  { label: "Normal", value: "NORMAL", color: "text-green-600 bg-green-50" },
  { label: "High", value: "HIGH", color: "text-amber-600 bg-amber-50" },
  { label: "Critical", value: "CRITICAL", color: "text-red-600 bg-red-50" },
];

// Donation status options
export const donationStatusOptions = [
  { label: "Pending", value: "PENDING", color: "text-yellow-600 bg-yellow-50" },
  { label: "Processing", value: "PROCESSING", color: "text-blue-600 bg-blue-50" },
  { label: "Completed", value: "COMPLETED", color: "text-green-600 bg-green-50" },
  { label: "Failed", value: "FAILED", color: "text-red-600 bg-red-50" },
  { label: "Refunded", value: "REFUNDED", color: "text-gray-600 bg-gray-50" },
];

// Category options
export const donationCategoryOptions = [
  { label: "Temple Development", value: "Development" },
  { label: "Maintenance", value: "Maintenance" },
  { label: "Charity", value: "Charity" },
  { label: "Temple Fund", value: "Temple Fund" },
  { label: "Annadanam", value: "Annadanam" },
  { label: "Goshala", value: "Goshala" },
  { label: "Festival", value: "Festival" },
  { label: "Renovation", value: "Renovation" },
];
