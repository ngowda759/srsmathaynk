"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getCampaign, updateCampaign, deleteCampaign } from "@/lib/api/donations";
import { DonationCampaignRecord, donationCategoryOptions, urgencyLevelOptions } from "@/types/donation";

export default function EditCampaignPage() {
  const router = useRouter();
  const params = useParams();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = useState<DonationCampaignRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    titleKn: "",
    description: "",
    descriptionKn: "",
    targetAmount: "",
    category: "",
    urgencyLevel: "NORMAL",
    active: true,
    featured: false,
    startDate: "",
    endDate: "",
  });

  const loadCampaign = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCampaign(campaignId);
      if (!data) {
        toast.error("Campaign not found.");
        router.push("/admin/donations/campaigns");
        return;
      }
      setCampaign(data);
      setFormData({
        title: data.title,
        titleKn: data.titleKn || "",
        description: data.description || "",
        descriptionKn: data.descriptionKn || "",
        targetAmount: data.targetAmount?.toString() || "",
        category: data.category || "",
        urgencyLevel: data.urgencyLevel,
        active: data.active,
        featured: data.featured,
        startDate: data.startDate ? new Date(data.startDate).toISOString().split("T")[0] : "",
        endDate: data.endDate ? new Date(data.endDate).toISOString().split("T")[0] : "",
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to load campaign.");
    } finally {
      setLoading(false);
    }
  }, [campaignId, router]);

  useEffect(() => {
    loadCampaign();
  }, [loadCampaign]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Campaign title is required.");
      return;
    }

    try {
      setSaving(true);
      await updateCampaign(campaignId, {
        title: formData.title,
        titleKn: formData.titleKn || undefined,
        description: formData.description || undefined,
        descriptionKn: formData.descriptionKn || undefined,
        targetAmount: formData.targetAmount ? parseFloat(formData.targetAmount) : undefined,
        category: formData.category || undefined,
        urgencyLevel: formData.urgencyLevel as "LOW" | "NORMAL" | "HIGH" | "CRITICAL",
        active: formData.active,
        featured: formData.featured,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
      });
      toast.success("Campaign updated successfully!");
      await loadCampaign();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update campaign.");
    } finally {
      setSaving(false);
    }
  };

  async function handleDelete() {
    if (!window.confirm(`Delete campaign "${campaign?.title}"?`)) {
      return;
    }
    try {
      await deleteCampaign(campaignId);
      toast.success("Campaign deleted.");
      router.push("/admin/donations/campaigns");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete campaign.");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-600 border-t-transparent" />
      </div>
    );
  }

  if (!campaign) {
    return null;
  }

  const progress = campaign.targetAmount
    ? Math.min(100, (campaign.raisedAmount / campaign.targetAmount) * 100)
    : 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/admin/donations/campaigns">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>
        <Button variant="destructive" onClick={handleDelete}>
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Campaign
        </Button>
      </div>

      <AdminPageHeader
        title="Edit Campaign"
        description={`Editing: ${campaign.title}`}
      />

      <div className="grid gap-8 lg:grid-cols-3">
        <form onSubmit={handleSubmit} className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border bg-white p-6">
            <h3 className="mb-4 font-semibold">Campaign Details</h3>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-stone-700">
                  Title *
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Temple Renovation Fund"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-stone-700">
                  Title (Kannada)
                </label>
                <Input
                  value={formData.titleKn}
                  onChange={(e) => setFormData({ ...formData, titleKn: e.target.value })}
                  placeholder="ಕನ್ನಡ ಶೀರ್ಷಿಕೆ"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-stone-700">
                  Description
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the campaign purpose and goals..."
                  rows={4}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-stone-700">
                  Description (Kannada)
                </label>
                <Textarea
                  value={formData.descriptionKn}
                  onChange={(e) => setFormData({ ...formData, descriptionKn: e.target.value })}
                  placeholder="ವಿವರಣೆ..."
                  rows={4}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-stone-700">
                    Target Amount (₹)
                  </label>
                  <Input
                    type="number"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                    placeholder="100000"
                    min="0"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-stone-700">
                    Category
                  </label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="">Select category</option>
                    {donationCategoryOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-stone-700">
                    Urgency Level
                  </label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.urgencyLevel}
                    onChange={(e) => setFormData({ ...formData, urgencyLevel: e.target.value })}
                  >
                    {urgencyLevelOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-4 pt-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="h-4 w-4 rounded border-stone-300"
                    />
                    <span className="text-sm">Active</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="h-4 w-4 rounded border-stone-300"
                    />
                    <span className="text-sm">Featured</span>
                  </label>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-stone-700">
                    Start Date
                  </label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-stone-700">
                    End Date
                  </label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button variant="outline" type="button" asChild>
              <Link href="/admin/donations/campaigns">Cancel</Link>
            </Button>
            <Button type="submit" disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>

        <div className="space-y-6">
          <div className="rounded-xl border bg-white p-6">
            <h3 className="mb-4 font-semibold">Progress</h3>
            <div className="mb-2 text-center">
              <span className="text-3xl font-bold text-green-600">
                ₹{campaign.raisedAmount.toLocaleString()}
              </span>
              {campaign.targetAmount && (
                <span className="text-stone-500">
                  {" "}
                  / ₹{campaign.targetAmount.toLocaleString()}
                </span>
              )}
            </div>
            {campaign.targetAmount && (
              <>
                <div className="h-3 w-full overflow-hidden rounded-full bg-stone-200">
                  <div
                    className="h-full rounded-full bg-green-500 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-2 text-center text-sm text-stone-500">
                  {progress.toFixed(1)}% funded
                </p>
              </>
            )}
          </div>

          <div className="rounded-xl border bg-white p-6">
            <h3 className="mb-4 font-semibold">Campaign Info</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-stone-500">Status</dt>
                <dd>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      campaign.active
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {campaign.active ? "Active" : "Inactive"}
                  </span>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-stone-500">Featured</dt>
                <dd>{campaign.featured ? "Yes" : "No"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-stone-500">Urgency</dt>
                <dd>{campaign.urgencyLevel}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-stone-500">Category</dt>
                <dd>{campaign.category || "-"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-stone-500">Created</dt>
                <dd>{new Date(campaign.createdAt).toLocaleDateString()}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
