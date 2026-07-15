"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Download, Receipt } from "lucide-react";
import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import Button from "@/components/ui/button";
import SearchBox from "@/components/admin/common/SearchBox";
import { getDonations } from "@/lib/api/donations";
import { DonationRecord } from "@/types/donation";

export default function ReceiptsPage() {
  const [donations, setDonations] = useState<DonationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadDonations = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getDonations({ status: "COMPLETED" });
      setDonations(result.donations.filter((d: DonationRecord) => d.receiptNumber));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDonations();
  }, [loadDonations]);

  const filteredDonations = useMemo(() => {
    const keyword = search.toLowerCase().trim();
    if (!keyword) return donations;
    return donations.filter(
      (d) =>
        d.donorName.toLowerCase().includes(keyword) ||
        d.donorEmail.toLowerCase().includes(keyword) ||
        d.receiptNumber?.toLowerCase().includes(keyword)
    );
  }, [donations, search]);

  function downloadReceipt(donation: DonationRecord) {
    const receiptContent = `
DONATION RECEIPT

Sri Raghavendra Swamy Mutt

Receipt Number: ${donation.receiptNumber}
Date: ${new Date(donation.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}

DONOR DETAILS
--------------
Name: ${donation.anonymous ? "Anonymous" : donation.donorName}
Email: ${donation.donorEmail}
${donation.donorPhone ? `Phone: ${donation.donorPhone}` : ""}

DONATION DETAILS
-----------------
Amount: ₹${donation.amount.toLocaleString()}
Payment Method: ${donation.paymentMethod || "N/A"}
${donation.campaign ? `Campaign: ${donation.campaign.title}` : ""}
${donation.message ? `Message: ${donation.message}` : ""}

${donation.dedication ? `Dedication: ${donation.dedication}` : ""}

This receipt is issued pursuant to the donation made towards the temple activities.
For any queries, please contact the temple administration.

Thank you for your generous donation!

Sri Raghavendra Swamy Mutt
    `.trim();

    const blob = new Blob([receiptContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Receipt-${donation.receiptNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" asChild>
          <Link href="/admin/donations">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>

      <AdminPageHeader
        title="Donation Receipts"
        description="View and download donation receipts."
      />

      <div className="flex items-center gap-4">
        <div className="flex-1">
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Search by donor name, email, or receipt number..."
          />
        </div>
        <div className="text-sm text-stone-500">
          {filteredDonations.length} receipt(s)
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-600 border-t-transparent" />
        </div>
      ) : filteredDonations.length === 0 ? (
        <div className="rounded-xl border bg-white p-8 text-center">
          <Receipt className="mx-auto h-12 w-12 text-stone-300" />
          <p className="mt-4 text-stone-500">
            {search ? "No receipts found matching your search." : "No donation receipts available."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-stone-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-stone-700">
                    Receipt #
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-stone-700">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-stone-700">
                    Donor
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-stone-700">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-stone-700">
                    Campaign
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-stone-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredDonations.map((donation) => (
                  <tr
                    key={donation.id}
                    className="border-t transition-colors hover:bg-stone-50"
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm font-medium">
                        {donation.receiptNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {new Date(donation.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium">
                          {donation.anonymous ? "Anonymous" : donation.donorName}
                        </p>
                        <p className="text-sm text-stone-500">{donation.donorEmail}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-green-700">
                      ₹{donation.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {donation.campaign?.title || "General"}
                    </td>
                    <td className="px-6 py-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadReceipt(donation)}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
