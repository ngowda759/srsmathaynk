"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import toast from "react-hot-toast";
import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { donationService } from "@/services/donation.service";
import { donationCategoryOptions, urgencyLevelOptions } from "@/types/donation";

export default function NewCampaignPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Campaign title is required.");
      return;
    }

    try {
      setLoading(true);
      const campaignData = {
        title: formData.title,
        titleKn: formData.titleKn || undefined,
        description: formData.description || undefined,
        descriptionKn: formData.descriptionKn || undefined,
        targetAmount: formData.targetAmount ? parseFloat(formData.targetAmount) : undefined,
        category: formData.category || undefined,
        urgencyLevel: formData.urgencyLevel as "LOW" | "NORMAL" | "HIGH" | "CRITICAL",
        active: formData.active,
        featured: formData.featured,
        startDate: formData.startDate ? new Date(formData.startDate) : undefined,
        endDate: formData.endDate ? new Date(formData.endDate) : undefined,
      };

      const id = await donationService.createCampaign(campaignData);
      toast.success("Campaign created successfully!");
      router.push(`/admin/donations/campaigns/${id}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to create campaign.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" asChild>
          <Link href="/admin/donations/campaigns">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>

      <AdminPageHeader
        title="New Campaign"
        description="Create a new donation campaign."
      />

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
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
          <Button type="submit" disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? "Creating..." : "Create Campaign"}
          </Button>
        </div>
      </form>
    </div>
  );
}
