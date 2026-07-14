/**
 * Seva Booking Service - Firebase has been removed
 * This service now returns empty arrays as no backend is available
 */

import { SevaBooking, SevaBookingRequest, SevaBookingStatus, PaymentStatus } from "@/types/seva-booking";

const COLLECTION_NAME = "sevaBookings";

class SevaBookingService {
  async createBooking(data: SevaBookingRequest): Promise<string> {
    throw new Error("Booking creation is not available - backend services have been removed");
  }

  async getAllBookings(): Promise<SevaBooking[]> {
    console.log("[SevaBookingService] Firebase removed - returning empty array");
    return [];
  }

  async getBookingsByUser(userId: string): Promise<SevaBooking[]> {
    return [];
  }

  async getBookingById(bookingId: string): Promise<SevaBooking | null> {
    return null;
  }

  async updateBookingStatus(bookingId: string, status: SevaBookingStatus): Promise<void> {
    throw new Error("Booking status update is not available - backend services have been removed");
  }

  async updatePayment(bookingId: string, paymentData: { paymentReference: string; paymentStatus: PaymentStatus; paymentMethod: string; }): Promise<void> {
    throw new Error("Payment update is not available - backend services have been removed");
  }

  async deleteBooking(bookingId: string): Promise<void> {
    throw new Error("Booking deletion is not available - backend services have been removed");
  }
}

export const sevaBookingService = new SevaBookingService();
