import { donationService } from "@/services/donation.service";
import { sevaBookingService } from "@/services/sevaBooking.service";

import { ReportSummary } from "@/types/report";

class ReportService {
  async getSummary(): Promise<ReportSummary> {
    const [donationsResult, bookings] = await Promise.all([
      donationService.getDonations(),
      sevaBookingService.getAllBookings(),
    ]);

    const donations = donationsResult.donations;

    const donationRevenue = donations
      .filter((d) => d.status === "COMPLETED")
      .reduce((sum, d) => sum + Number(d.amount), 0);

    const sevaRevenue = bookings
      .filter(
        (b) =>
          b.status === "confirmed" ||
          b.status === "completed"
      )
      .reduce((sum, b) => sum + Number(b.sevaAmount), 0);

    return {
      revenue: {
        donationRevenue,
        sevaRevenue,
        totalRevenue:
          donationRevenue + sevaRevenue,
      },

      donations: {
        total: donations.length,
        pending: donations.filter(
          (d) => d.status === "PENDING"
        ).length,
        completed: donations.filter(
          (d) => d.status === "COMPLETED"
        ).length,
        failed: donations.filter(
          (d) => d.status === "FAILED"
        ).length,
        totalAmount: donationRevenue,
      },

      bookings: {
        total: bookings.length,
        pending: bookings.filter(
          (b) => b.status === "pending"
        ).length,
        confirmed: bookings.filter(
          (b) => b.status === "confirmed"
        ).length,
        completed: bookings.filter(
          (b) => b.status === "completed"
        ).length,
        cancelled: bookings.filter(
          (b) => b.status === "cancelled"
        ).length,
      },
    };
  }
}

export const reportService = new ReportService();
