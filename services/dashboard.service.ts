/**
 * Dashboard Service - Firebase has been removed
 * This service now returns zero counts as no backend is available
 */

import { DashboardStats } from "@/types/dashboard";

class DashboardService {
  async getStats(): Promise<DashboardStats> {
    console.log("[DashboardService] Firebase removed - returning zero counts");
    return {
      totalUsers: 0,
      totalEvents: 0,
      totalSevas: 0,
      totalGalleryImages: 0,
      totalAnnouncements: 0,
      totalTimings: 0,
      totalDonations: 0,
      totalSevaBookings: 0,
    };
  }
}

export const dashboardService = new DashboardService();
