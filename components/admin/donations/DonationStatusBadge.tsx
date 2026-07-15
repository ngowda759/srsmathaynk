import { DonationStatus } from "@/types/donation";

interface DonationStatusBadgeProps {
  status: DonationStatus;
}

const styles: Record<DonationStatus, string> = {
  PENDING:
    "bg-yellow-100 text-yellow-800 border-yellow-200",
  COMPLETED:
    "bg-green-100 text-green-800 border-green-200",
  FAILED:
    "bg-red-100 text-red-800 border-red-200",
  PROCESSING:
    "bg-blue-100 text-blue-800 border-blue-200",
  REFUNDED:
    "bg-gray-100 text-gray-800 border-gray-200",
};

export default function DonationStatusBadge({
  status,
}: DonationStatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${styles[status] || "bg-gray-100 text-gray-800 border-gray-200"}`}
    >
      {status}
    </span>
  );
}
