/**
 * Client-side Donation API
 * All functions make HTTP requests to the API routes
 */

const API_BASE = "/api/donations";

export interface DonationApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  total?: number;
}

// Donations
export async function getDonations(options?: {
  campaignId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}): Promise<{ donations: any[]; total: number }> {
  const params = new URLSearchParams();
  if (options?.campaignId) params.set("campaignId", options.campaignId);
  if (options?.status) params.set("status", options.status);
  if (options?.startDate) params.set("startDate", options.startDate);
  if (options?.endDate) params.set("endDate", options.endDate);
  if (options?.limit) params.set("limit", String(options.limit));
  if (options?.offset) params.set("offset", String(options.offset));

  const url = params.toString() ? `${API_BASE}?${params}` : API_BASE;
  const res = await fetch(url);
  const json: DonationApiResponse<any[]> = await res.json();
  if (!json.success) throw new Error(json.error);
  return { donations: json.data || [], total: json.total || 0 };
}

export async function getDonation(id: string): Promise<any> {
  const res = await fetch(`${API_BASE}/${id}`);
  const json: DonationApiResponse<any> = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data;
}

export async function createDonation(data: {
  campaignId?: string;
  amount: number;
  currency?: string;
  donorName: string;
  donorEmail: string;
  donorPhone?: string;
  donorAddress?: string;
  anonymous?: boolean;
  message?: string;
  dedication?: string;
  paymentMethod?: string;
}): Promise<string> {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json: DonationApiResponse<{ id: string }> = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data!.id;
}

export async function updateDonation(
  id: string,
  data: Record<string, unknown>
): Promise<void> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json: DonationApiResponse = await res.json();
  if (!json.success) throw new Error(json.error);
}

export async function deleteDonation(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
  const json: DonationApiResponse = await res.json();
  if (!json.success) throw new Error(json.error);
}

export async function updateDonationStatus(
  id: string,
  status: string
): Promise<void> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  const json: DonationApiResponse = await res.json();
  if (!json.success) throw new Error(json.error);
}

// Campaigns
export async function getCampaigns(options?: {
  active?: boolean;
  featured?: boolean;
  category?: string;
  limit?: number;
}): Promise<{ campaigns: any[]; total: number }> {
  const params = new URLSearchParams();
  if (options?.active !== undefined) params.set("active", String(options.active));
  if (options?.featured !== undefined) params.set("featured", String(options.featured));
  if (options?.category) params.set("category", options.category);
  if (options?.limit) params.set("limit", String(options.limit));

  const url = `${API_BASE}/campaigns${params.toString() ? `?${params}` : ""}`;
  const res = await fetch(url);
  const json: DonationApiResponse<any[]> = await res.json();
  if (!json.success) throw new Error(json.error);
  return { campaigns: json.data || [], total: json.total || 0 };
}

export async function getCampaign(id: string): Promise<any> {
  const res = await fetch(`${API_BASE}/campaigns/${id}`);
  const json: DonationApiResponse<any> = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data;
}

export async function createCampaign(data: {
  title: string;
  titleKn?: string;
  description?: string;
  descriptionKn?: string;
  targetAmount?: number;
  imageId?: string;
  videoUrl?: string;
  active?: boolean;
  featured?: boolean;
  startDate?: string;
  endDate?: string;
  urgencyLevel?: string;
  category?: string;
}): Promise<string> {
  const res = await fetch(`${API_BASE}/campaigns`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json: DonationApiResponse<{ id: string }> = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data!.id;
}

export async function updateCampaign(
  id: string,
  data: Record<string, unknown>
): Promise<void> {
  const res = await fetch(`${API_BASE}/campaigns/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json: DonationApiResponse = await res.json();
  if (!json.success) throw new Error(json.error);
}

export async function deleteCampaign(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/campaigns/${id}`, { method: "DELETE" });
  const json: DonationApiResponse = await res.json();
  if (!json.success) throw new Error(json.error);
}

export async function toggleFeaturedCampaign(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/campaigns/${id}/toggle-featured`, {
    method: "POST",
  });
  const json: DonationApiResponse = await res.json();
  if (!json.success) throw new Error(json.error);
}

export async function toggleActiveCampaign(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/campaigns/${id}/toggle-active`, {
    method: "POST",
  });
  const json: DonationApiResponse = await res.json();
  if (!json.success) throw new Error(json.error);
}

// Statistics
export async function getDonationStats(): Promise<any> {
  const res = await fetch(`${API_BASE}/stats`);
  const json: DonationApiResponse<any> = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data;
}

// Archived donations
export async function getArchivedDonations(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/archive`);
  const json: DonationApiResponse<any[]> = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data || [];
}

export async function permanentDeleteDonation(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/archive`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "permanent-delete", id }),
  });
  const json: DonationApiResponse = await res.json();
  if (!json.success) throw new Error(json.error);
}

// Statistics with date range
export async function getDonationStatistics(options?: { startDate?: string }): Promise<any> {
  const params = new URLSearchParams();
  if (options?.startDate) params.set("startDate", options.startDate);
  const url = `${API_BASE}/stats${params.toString() ? `?${params}` : ""}`;
  const res = await fetch(url);
  const json: DonationApiResponse<any> = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data;
}

// Reports
export async function getReportSummary(): Promise<any> {
  const res = await fetch("/api/reports");
  const json: DonationApiResponse<any> = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data;
}
