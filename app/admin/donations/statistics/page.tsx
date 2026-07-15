"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, TrendingUp, Users, Calendar } from "lucide-react";
import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import Button from "@/components/ui/button";
import { getDonationStatistics } from "@/lib/api/donations";
import { DonationStats } from "@/types/donation";

export default function StatisticsPage() {
  const [stats, setStats] = useState<DonationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<"all" | "30days" | "90days" | "year">("all");

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      const now = new Date();
      let startDate: string | undefined;

      switch (dateRange) {
        case "30days":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
          break;
        case "90days":
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
          break;
        case "year":
          startDate = new Date(now.getFullYear(), 0, 1).toISOString();
          break;
      }

      const data = await getDonationStatistics({ startDate });
      setStats(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

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
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value as typeof dateRange)}
          className="rounded-xl border border-stone-300 bg-white px-4 py-2"
        >
          <option value="all">All Time</option>
          <option value="30days">Last 30 Days</option>
          <option value="90days">Last 90 Days</option>
          <option value="year">This Year</option>
        </select>
      </div>

      <AdminPageHeader
        title="Donation Statistics"
        description="Overview of donation performance and trends."
      />

      {loading ? (
        <div className="flex items-center justify-center p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-600 border-t-transparent" />
        </div>
      ) : stats ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border bg-white p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-green-100 p-3">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-stone-500">Total Received</p>
                  <p className="text-2xl font-bold">₹{stats.totalAmount.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border bg-white p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-blue-100 p-3">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-stone-500">Total Donations</p>
                  <p className="text-2xl font-bold">{stats.totalDonations}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border bg-white p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-amber-100 p-3">
                  <Calendar className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-stone-500">Average Donation</p>
                  <p className="text-2xl font-bold">
                    ₹{stats.averageDonation.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border bg-white p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-purple-100 p-3">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-stone-500">Pending</p>
                  <p className="text-2xl font-bold text-amber-600">{stats.pendingCount}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border bg-white p-6">
              <h3 className="mb-4 font-semibold">Status Breakdown</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-green-500" />
                    <span className="text-sm">Completed</span>
                  </div>
                  <span className="font-semibold">{stats.completedCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-yellow-500" />
                    <span className="text-sm">Pending</span>
                  </div>
                  <span className="font-semibold">{stats.pendingCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-red-500" />
                    <span className="text-sm">Failed</span>
                  </div>
                  <span className="font-semibold">{stats.failedCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-gray-500" />
                    <span className="text-sm">Refunded</span>
                  </div>
                  <span className="font-semibold">{stats.refundedCount}</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border bg-white p-6">
              <h3 className="mb-4 font-semibold">Top Campaigns</h3>
              {stats.topCampaigns.length > 0 ? (
                <div className="space-y-3">
                  {stats.topCampaigns.map((campaign, index) => (
                    <div key={campaign.campaignId} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-stone-100 text-xs font-medium">
                          {index + 1}
                        </span>
                        <span className="text-sm">{campaign.title}</span>
                      </div>
                      <span className="font-semibold text-green-600">
                        ₹{campaign.totalAmount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-stone-500">No campaign data available.</p>
              )}
            </div>
          </div>

          {stats.monthlyTrend.length > 0 && (
            <div className="rounded-xl border bg-white p-6">
              <h3 className="mb-4 font-semibold">Monthly Trend</h3>
              <div className="space-y-2">
                {stats.monthlyTrend.map((month) => (
                  <div key={month.month} className="flex items-center justify-between">
                    <span className="text-sm text-stone-600">{month.month}</span>
                    <div className="flex items-center gap-4">
                      <div className="h-2 w-48 overflow-hidden rounded-full bg-stone-100">
                        <div
                          className="h-full rounded-full bg-green-500"
                          style={{
                            width: `${Math.min(100, (month.amount / (stats?.totalAmount || 1)) * 100)}%`,
                          }}
                        />
                      </div>
                      <span className="w-32 text-right font-medium">
                        ₹{month.amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-xl border bg-white p-8 text-center">
          <p className="text-stone-500">No statistics available.</p>
        </div>
      )}
    </div>
  );
}
