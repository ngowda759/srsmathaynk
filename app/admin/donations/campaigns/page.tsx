"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Star, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import Button from "@/components/ui/button";
import { donationService } from "@/services/donation.service";
import { DonationCampaignRecord } from "@/types/donation";

export default function CampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<DonationCampaignRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      const result = await donationService.getCampaigns();
      setCampaigns(result.campaigns);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load campaigns.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  async function toggleFeatured(campaign: DonationCampaignRecord) {
    try {
      await donationService.toggleFeaturedCampaign(campaign.id);
      toast.success(`Campaign ${campaign.featured ? "unfeatured" : "featured"}.`);
      await loadCampaigns();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update campaign.");
    }
  }

  async function toggleActive(campaign: DonationCampaignRecord) {
    try {
      await donationService.toggleActiveCampaign(campaign.id);
      toast.success(`Campaign ${campaign.active ? "deactivated" : "activated"}.`);
      await loadCampaigns();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update campaign.");
    }
  }

  async function handleDelete(campaign: DonationCampaignRecord) {
    if (!window.confirm(`Delete campaign "${campaign.title}"?`)) {
      return;
    }
    try {
      await donationService.deleteCampaign(campaign.id);
      toast.success("Campaign deleted.");
      await loadCampaigns();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete campaign.");
    }
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Donation Campaigns"
        description="Manage donation campaigns and fundraisers."
        action={
          <Button asChild>
            <Link href="/admin/donations/campaigns/new">
              <Plus className="mr-2 h-4 w-4" />
              New Campaign
            </Link>
          </Button>
        }
      />

      {loading ? (
        <div className="rounded-xl border bg-white p-8 text-center">
          Loading campaigns...
        </div>
      ) : campaigns.length === 0 ? (
        <div className="rounded-xl border bg-white p-8 text-center">
          <p className="text-stone-500">No campaigns found.</p>
          <Button className="mt-4" asChild>
            <Link href="/admin/donations/campaigns/new">
              <Plus className="mr-2 h-4 w-4" />
              Create First Campaign
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => {
            const progress = campaign.targetAmount
              ? Math.min(100, (campaign.raisedAmount / campaign.targetAmount) * 100)
              : 0;

            return (
              <div
                key={campaign.id}
                className="rounded-xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{campaign.title}</h3>
                      {campaign.featured && (
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      )}
                    </div>
                    {campaign.category && (
                      <span className="mt-1 inline-block rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-600">
                        {campaign.category}
                      </span>
                    )}
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      campaign.active
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {campaign.active ? "Active" : "Inactive"}
                  </span>
                </div>

                {campaign.description && (
                  <p className="mb-4 text-sm text-stone-600 line-clamp-2">
                    {campaign.description}
                  </p>
                )}

                {campaign.targetAmount && (
                  <div className="mb-2">
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-stone-600">
                        ₹{campaign.raisedAmount.toLocaleString()}
                      </span>
                      <span className="text-stone-600">
                        ₹{campaign.targetAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-stone-200">
                      <div
                        className="h-full rounded-full bg-green-500 transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="mt-1 text-right text-xs text-stone-500">
                      {progress.toFixed(1)}% funded
                    </p>
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between border-t pt-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      campaign.urgencyLevel === "CRITICAL"
                        ? "bg-red-100 text-red-800"
                        : campaign.urgencyLevel === "HIGH"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {campaign.urgencyLevel}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleFeatured(campaign)}
                    >
                      <Star
                        className={`h-4 w-4 ${
                          campaign.featured ? "fill-yellow-400 text-yellow-400" : ""
                        }`}
                      />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/admin/donations/campaigns/${campaign.id}`)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(campaign)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
