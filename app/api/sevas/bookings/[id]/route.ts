/**
 * Single Booking API Route
 * GET    /api/sevas/bookings/[id] - Get booking
 * PATCH  /api/sevas/bookings/[id] - Update booking
 */

import { NextRequest, NextResponse } from "next/server";
import { sevaService } from "@/services/seva.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/sevas/bookings/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const booking = await sevaService.getBookingById(id);

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: booking });
  } catch (error) {
    console.error("[API] Failed to fetch booking:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch booking" },
      { status: 500 }
    );
  }
}

// PATCH /api/sevas/bookings/[id]
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action, status } = body;

    const booking = await sevaService.getBookingById(id);
    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    if (action === "updateStatus" && status) {
      await sevaService.updateBookingStatus(id, status);
      return NextResponse.json({
        success: true,
        message: `Booking status updated to ${status}`,
      });
    }

    if (action === "cancel") {
      await sevaService.cancelBooking(id);
      return NextResponse.json({
        success: true,
        message: "Booking cancelled successfully",
      });
    }

    if (action === "complete") {
      await sevaService.completeBooking(id);
      return NextResponse.json({
        success: true,
        message: "Booking marked as completed",
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("[API] Failed to update booking:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update booking" },
      { status: 500 }
    );
  }
}
