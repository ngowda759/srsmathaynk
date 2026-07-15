"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Receipt, Download, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import Button from "@/components/ui/button";
import { DonationRecord, donationStatusOptions } from "@/types/donation";
import { updateDonationStatus, deleteDonation } from "@/lib/api/donations";

interface DonationDetailsProps {
  donation: DonationRecord;
}

export default function DonationDetails({ donation }: DonationDetailsProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleUpdateStatus(status: string) {
    try {
      await updateDonationStatus(donation.id, status);
      toast.success("Donation updated.");
      window.location.reload();
    } catch {
      toast.error("Failed to update donation.");
    }
  }

  async function generateReceipt() {
    try {
      const response = await fetch(`/api/donations/${donation.id}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generateReceipt" }),
      });
      const result = await response.json();
      if (result.success) {
        toast.success(`Receipt generated: ${result.data.receiptNumber}`);
        window.location.reload();
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Failed to generate receipt.");
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete this donation from ${donation.donorName}?`)) {
      return;
    }
    try {
      setDeleting(true);
      await deleteDonation(donation.id);
      toast.success("Donation deleted.");
      router.push("/admin/donations");
    } catch {
      toast.error("Failed to delete donation.");
      setDeleting(false);
    }
  }

  function downloadReceipt() {
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
${donation.donorAddress ? `Address: ${donation.donorAddress}` : ""}

DONATION DETAILS
-----------------
Amount: ₹${donation.amount.toLocaleString()}
Payment Method: ${donation.paymentMethod || "N/A"}
${donation.campaign ? `Campaign: ${donation.campaign.title}` : ""}
${donation.message ? `\nMessage: ${donation.message}` : ""}
${donation.dedication ? `\nDedication: ${donation.dedication}` : ""}

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

  const statusBadge = donationStatusOptions.find((s) => s.value === donation.status);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" asChild>
          <Link href="/admin/donations">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border bg-white p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Donation Details</h2>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${statusBadge?.color || "bg-gray-100 text-gray-800"}`}
              >
                {statusBadge?.label || donation.status}
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Info label="Donor Name" value={donation.anonymous ? "Anonymous" : donation.donorName} />
              <Info label="Email" value={donation.donorEmail} />
              <Info label="Phone" value={donation.donorPhone || "-"} />
              <Info label="Address" value={donation.donorAddress || "-"} />
              <Info label="Campaign" value={donation.campaign?.title || "General Donation"} />
              <Info label="Amount" value={`₹${donation.amount.toLocaleString()}`} isHighlight />
              <Info label="Payment Method" value={donation.paymentMethod || "-"} />
              <Info label="Receipt Number" value={donation.receiptNumber || "-"} />
            </div>

            {donation.message && (
              <div className="mt-6">
                <h3 className="mb-2 font-medium text-stone-700">Devotee Message</h3>
                <div className="rounded-lg border bg-stone-50 p-4 text-stone-600">
                  {donation.message}
                </div>
              </div>
            )}

            {donation.dedication && (
              <div className="mt-4">
                <h3 className="mb-2 font-medium text-stone-700">Dedication</h3>
                <div className="rounded-lg border bg-stone-50 p-4 text-stone-600">
                  {donation.dedication}
                </div>
              </div>
            )}
          </div>

          <div className="rounded-xl border bg-white p-6">
            <h3 className="mb-4 font-semibold">Actions</h3>
            <div className="flex flex-wrap gap-3">
              {donation.status === "PENDING" && (
                <Button onClick={generateReceipt}>
                  <Receipt className="mr-2 h-4 w-4" />
                  Generate Receipt
                </Button>
              )}
              {donation.receiptNumber && (
                <Button variant="outline" onClick={downloadReceipt}>
                  <Download className="mr-2 h-4 w-4" />
                  Download Receipt
                </Button>
              )}
              {donation.status !== "COMPLETED" && (
                <Button variant="outline" onClick={() => handleUpdateStatus("COMPLETED")}>
                  Mark Completed
                </Button>
              )}
              {donation.status !== "FAILED" && (
                <Button variant="outline" onClick={() => handleUpdateStatus("FAILED")}>
                  Mark Failed
                </Button>
              )}
              {donation.status !== "REFUNDED" && (
                <Button variant="outline" onClick={() => handleUpdateStatus("REFUNDED")}>
                  Mark Refunded
                </Button>
              )}
              <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                <Trash2 className="mr-2 h-4 w-4" />
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border bg-white p-6">
            <h3 className="mb-4 font-semibold">Timeline</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-stone-500">Created</span>
                <span>{new Date(donation.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-stone-500">Last Updated</span>
                <span>{new Date(donation.updatedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
              </div>
            </div>
          </div>

          {donation.profile && (
            <div className="rounded-xl border bg-white p-6">
              <h3 className="mb-4 font-semibold">Donor Profile</h3>
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="text-stone-500">User ID:</span>{" "}
                  <span className="font-mono">{donation.profile.id.slice(0, 8)}...</span>
                </div>
                {donation.profile.name && (
                  <div className="text-sm">
                    <span className="text-stone-500">Name:</span> {donation.profile.name}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Info({ label, value, isHighlight }: { label: string; value: string; isHighlight?: boolean }) {
  return (
    <div>
      <div className="text-sm text-stone-500">{label}</div>
      <div className={`font-medium ${isHighlight ? "text-2xl text-green-700" : ""}`}>{value}</div>
    </div>
  );
}
