"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BarChart3, Plus, Archive, Receipt, Filter } from "lucide-react";
import toast from "react-hot-toast";
import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import SearchBox from "@/components/admin/common/SearchBox";
import Button from "@/components/ui/button";
import { donationColumns } from "./columns";
import { donationService } from "@/services/donation.service";
import { DonationRecord, DonationStats } from "@/types/donation";

export default function DonationsPage() {
  const router = useRouter();
  const [donations, setDonations] = useState<DonationRecord[]>([]);
  const [stats, setStats] = useState<DonationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [donationsResult, statsData] = await Promise.all([
        donationService.getDonations(),
        donationService.getStatistics(),
      ]);
      setDonations(donationsResult.donations);
      setStats(statsData);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load donations.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredDonations = useMemo(() => {
    const keyword = search.toLowerCase().trim();
    return donations.filter((donation) => {
      const matchesSearch =
        !keyword ||
        [
          donation.donorName,
          donation.donorEmail,
          donation.donorPhone,
          donation.receiptNumber,
        ].some((value) => value?.toLowerCase().includes(keyword));
      const matchesStatus = statusFilter === "all" || donation.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [donations, search, statusFilter]);

  async function handleStatusUpdate(donation: DonationRecord, status: string) {
    try {
      await donationService.updateDonationStatus(donation.id, status);
      toast.success("Donation updated.");
      await loadData();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update donation.");
    }
  }

  async function handleDelete(donation: DonationRecord) {
    if (!window.confirm(`Delete donation from ${donation.donorName}?`)) {
      return;
    }
    try {
      await donationService.deleteDonation(donation.id);
      toast.success("Donation deleted.");
      await loadData();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete donation.");
    }
  }

  async function handleGenerateReceipt(donation: DonationRecord) {
    try {
      const response = await fetch(`/api/donations/${donation.id}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generateReceipt" }),
      });
      const result = await response.json();
      if (result.success) {
        toast.success(`Receipt generated: ${result.data.receiptNumber}`);
        await loadData();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate receipt.");
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

  async function handleBatchArchive() {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Archive ${selectedIds.size} donation(s)?`)) return;
    try {
      await fetch("/api/donations/archive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });
      toast.success(`${selectedIds.size} donation(s) archived.`);
      setSelectedIds(new Set());
      await loadData();
    } catch (error) {
      toast.error("Failed to archive donations.");
    }
  }

  const isAllSelected = filteredDonations.length > 0 && selectedIds.size === filteredDonations.length;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Donations"
        description="Manage temple donations and campaigns."
        action={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/admin/donations/statistics">
                <BarChart3 className="mr-2 h-4 w-4" />
                Statistics
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/donations/archive">
                <Archive className="mr-2 h-4 w-4" />
                Archive
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/donations/campaigns">
                <Filter className="mr-2 h-4 w-4" />
                Campaigns
              </Link>
            </Button>
            <Button asChild>
              <Link href="/admin/donations/receipts">
                <Receipt className="mr-2 h-4 w-4" />
                Receipts
              </Link>
            </Button>
          </div>
        }
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-stone-500">Total Donations</p>
          <h2 className="mt-2 text-3xl font-bold">
            ₹{stats?.totalAmount.toLocaleString() || 0}
          </h2>
        </div>
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-stone-500">Pending</p>
          <h2 className="mt-2 text-3xl font-bold text-amber-600">
            {stats?.pendingCount || 0}
          </h2>
        </div>
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-stone-500">Completed</p>
          <h2 className="mt-2 text-3xl font-bold text-green-600">
            {stats?.completedCount || 0}
          </h2>
        </div>
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-stone-500">Avg. Donation</p>
          <h2 className="mt-2 text-3xl font-bold">
            ₹{stats?.averageDonation.toLocaleString(undefined, { maximumFractionDigits: 0 }) || 0}
          </h2>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="flex-1">
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Search by donor name, email, phone, or receipt..."
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-stone-300 bg-white px-4 py-3"
        >
          <option value="all">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="PROCESSING">Processing</option>
          <option value="COMPLETED">Completed</option>
          <option value="FAILED">Failed</option>
          <option value="REFUNDED">Refunded</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="rounded-xl border bg-white p-8 text-center">
          Loading donations...
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
          {selectedIds.size > 0 && (
            <div className="border-b bg-stone-50 p-3">
              <span className="text-sm text-stone-600">
                {selectedIds.size} selected
              </span>
              <Button size="sm" variant="outline" className="ml-4" onClick={handleBatchArchive}>
                Archive Selected
              </Button>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-stone-100">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={() => {
                        if (isAllSelected) {
                          setSelectedIds(new Set());
                        } else {
                          setSelectedIds(new Set(filteredDonations.map((d) => d.id)));
                        }
                      }}
                      className="h-4 w-4 rounded border-stone-300"
                    />
                  </th>
                  {donationColumns.map((col) => (
                    <th
                      key={col.key}
                      className="px-6 py-4 text-left text-sm font-semibold text-stone-700"
                    >
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredDonations.length === 0 ? (
                  <tr>
                    <td colSpan={donationColumns.length + 1} className="px-6 py-10 text-center text-stone-500">
                      No donations found.
                    </td>
                  </tr>
                ) : (
                  filteredDonations.map((donation) => (
                    <tr key={donation.id} className="border-t transition-colors hover:bg-stone-50">
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
                      <td className="px-6 py-4 text-sm font-medium">{donation.donorName}</td>
                      <td className="px-6 py-4 text-sm text-stone-600">{donation.donorEmail}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-green-700">
                        ₹{donation.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {donation.campaign?.title || "General"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {donation.paymentMethod || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            donation.status === "COMPLETED"
                              ? "bg-green-100 text-green-800"
                              : donation.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-800"
                              : donation.status === "FAILED"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {donation.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-stone-500">
                        {donation.receiptNumber || "-"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/admin/donations/${donation.id}`)}
                          >
                            View
                          </Button>
                          {donation.status === "PENDING" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleGenerateReceipt(donation)}
                            >
                              Complete
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(donation)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
