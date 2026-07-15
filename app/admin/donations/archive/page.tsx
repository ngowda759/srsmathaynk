"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, RotateCcw, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import Button from "@/components/ui/button";
import { donationService } from "@/services/donation.service";
import { DonationRecord } from "@/types/donation";

export default function ArchivePage() {
  const [donations, setDonations] = useState<DonationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const loadArchived = useCallback(async () => {
    try {
      setLoading(true);
      const data = await donationService.getArchivedDonations();
      setDonations(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load archived donations.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadArchived();
  }, [loadArchived]);

  async function handleRestore(ids: string[]) {
    try {
      await fetch("/api/donations/archive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, action: "restore" }),
      });
      toast.success(`${ids.length} donation(s) restored.`);
      setSelectedIds(new Set());
      await loadArchived();
    } catch (error) {
      console.error(error);
      toast.error("Failed to restore donations.");
    }
  }

  async function handlePermanentDelete(ids: string[]) {
    if (!window.confirm(`Permanently delete ${ids.length} donation(s)? This cannot be undone.`)) {
      return;
    }
    try {
      for (const id of ids) {
        await donationService.permanentDeleteDonation(id);
      }
      toast.success(`${ids.length} donation(s) permanently deleted.`);
      setSelectedIds(new Set());
      await loadArchived();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete donations.");
    }
  }

  function toggleSelect(id: string) {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/admin/donations">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>
        {selectedIds.size > 0 && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleRestore(Array.from(selectedIds))}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Restore ({selectedIds.size})
            </Button>
            <Button
              variant="destructive"
              onClick={() => handlePermanentDelete(Array.from(selectedIds))}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Permanently ({selectedIds.size})
            </Button>
          </div>
        )}
      </div>

      <AdminPageHeader
        title="Archived Donations"
        description="View and manage archived donations."
      />

      {loading ? (
        <div className="flex items-center justify-center p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-600 border-t-transparent" />
        </div>
      ) : donations.length === 0 ? (
        <div className="rounded-xl border bg-white p-8 text-center">
          <p className="text-stone-500">No archived donations.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-stone-100">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === donations.length}
                      onChange={() => {
                        if (selectedIds.size === donations.length) {
                          setSelectedIds(new Set());
                        } else {
                          setSelectedIds(new Set(donations.map((d) => d.id)));
                        }
                      }}
                      className="h-4 w-4 rounded border-stone-300"
                    />
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
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-stone-700">
                    Archived On
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-stone-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {donations.map((donation) => (
                  <tr
                    key={donation.id}
                    className="border-t transition-colors hover:bg-stone-50"
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(donation.id)}
                        onChange={() => toggleSelect(donation.id)}
                        className="h-4 w-4 rounded border-stone-300"
                      />
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {new Date(donation.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      {donation.donorName}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-green-700">
                      ₹{donation.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {donation.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-stone-500">
                      {donation.deletedAt
                        ? new Date(donation.deletedAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRestore([donation.id])}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handlePermanentDelete([donation.id])}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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
