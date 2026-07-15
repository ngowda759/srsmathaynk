/**
 * Bookings API Route
 * GET    /api/sevas/bookings - List bookings
 * POST   /api/sevas/bookings - Create booking
 */

import { NextRequest, NextResponse } from "next/server";
import { sevaService } from "@/services/seva.service";
import { BookingRequest } from "@/types/seva";

// GET /api/sevas/bookings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const options: {
      status?: string;
      bookingType?: string;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      offset?: number;
    } = {};

    if (searchParams.get("status")) {
      options.status = searchParams.get("status")!;
    }
    if (searchParams.get("bookingType")) {
      options.bookingType = searchParams.get("bookingType")!;
    }
    if (searchParams.get("startDate")) {
      options.startDate = new Date(searchParams.get("startDate")!);
    }
    if (searchParams.get("endDate")) {
      options.endDate = new Date(searchParams.get("endDate")!);
    }
    if (searchParams.get("limit")) {
      options.limit = parseInt(searchParams.get("limit")!);
    }
    if (searchParams.get("offset")) {
      options.offset = parseInt(searchParams.get("offset")!);
    }

    const result = await sevaService.getBookings(options);

    return NextResponse.json({
      success: true,
      data: result.bookings,
      total: result.total,
    });
  } catch (error) {
    console.error("[API] Failed to fetch bookings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

// POST /api/sevas/bookings
export async function POST(request: NextRequest) {
  try {
    const body: BookingRequest = await request.json();

    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one booking item is required" },
        { status: 400 }
      );
    }

    if (!body.contactEmail) {
      return NextResponse.json(
        { success: false, error: "Contact email is required" },
        { status: 400 }
      );
    }

    const id = await sevaService.createBooking(body);

    return NextResponse.json(
      { success: true, data: { id }, message: "Booking created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API] Failed to create booking:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
