import { CrudColumn } from "@/types/crud";
import { DonationRecord, DonationCampaignRecord } from "@/types/donation";
import { format } from "date-fns";

export const donationColumns: CrudColumn<DonationRecord>[] = [
  {
    key: "createdAt",
    header: "Date",
    formatter: (value) => format(new Date(value as string), "dd MMM yyyy"),
    sortable: true,
  },
  {
    key: "donorName",
    header: "Donor",
    sortable: true,
  },
  {
    key: "donorEmail",
    header: "Email",
  },
  {
    key: "amount",
    header: "Amount",
    type: "currency",
    sortable: true,
  },
  {
    key: "campaign",
    header: "Campaign",
    formatter: (value) => (value as DonationCampaignRecord)?.title || "General",
  },
  {
    key: "paymentMethod",
    header: "Payment",
    formatter: (value) => {
      if (!value) return "-";
      const methods: Record<string, string> = {
        CARD: "Card",
        UPI: "UPI",
        NET_BANKING: "Net Banking",
        WALLET: "Wallet",
        BANK_TRANSFER: "Bank Transfer",
        CASH: "Cash",
        CHEQUE: "Cheque",
      };
      return methods[value as string] || value;
    },
  },
  {
    key: "status",
    header: "Status",
    formatter: (value) => {
      const statusMap: Record<string, { label: string; color: string }> = {
        PENDING: { label: "Pending", color: "bg-yellow-100 text-yellow-800" },
        PROCESSING: { label: "Processing", color: "bg-blue-100 text-blue-800" },
        COMPLETED: { label: "Completed", color: "bg-green-100 text-green-800" },
        FAILED: { label: "Failed", color: "bg-red-100 text-red-800" },
        REFUNDED: { label: "Refunded", color: "bg-gray-100 text-gray-800" },
      };
      const status = statusMap[value as string] || { label: value as string, color: "bg-gray-100" };
      return `<span class="px-2 py-1 rounded-full text-xs font-medium ${status.color}">${status.label}</span>`;
    },
    sortable: true,
  },
  {
    key: "receiptNumber",
    header: "Receipt",
    formatter: (value) => value || "-",
  },
  {
    key: "actions",
    header: "Actions",
    type: "actions",
  },
];

export const campaignColumns: CrudColumn<DonationCampaignRecord>[] = [
  {
    key: "title",
    header: "Campaign",
    sortable: true,
  },
  {
    key: "category",
    header: "Category",
  },
  {
    key: "targetAmount",
    header: "Target",
    type: "currency",
    formatter: (value) => (value ? `₹${Number(value).toLocaleString()}` : "-"),
  },
  {
    key: "raisedAmount",
    header: "Raised",
    type: "currency",
    sortable: true,
  },
  {
    key: "urgencyLevel",
    header: "Urgency",
    formatter: (value) => {
      const urgencyMap: Record<string, { label: string; color: string }> = {
        LOW: { label: "Low", color: "bg-blue-100 text-blue-800" },
        NORMAL: { label: "Normal", color: "bg-green-100 text-green-800" },
        HIGH: { label: "High", color: "bg-amber-100 text-amber-800" },
        CRITICAL: { label: "Critical", color: "bg-red-100 text-red-800" },
      };
      const urgency = urgencyMap[value as string] || { label: value as string, color: "bg-gray-100" };
      return `<span class="px-2 py-1 rounded-full text-xs font-medium ${urgency.color}">${urgency.label}</span>`;
    },
  },
  {
    key: "featured",
    header: "Featured",
    formatter: (value) => (value ? "⭐" : ""),
  },
  {
    key: "active",
    header: "Status",
    formatter: (value) => {
      const isActive = value as boolean;
      return `<span class="px-2 py-1 rounded-full text-xs font-medium ${isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}">${isActive ? "Active" : "Inactive"}</span>`;
    },
    sortable: true,
  },
  {
    key: "actions",
    header: "Actions",
    type: "actions",
  },
];
