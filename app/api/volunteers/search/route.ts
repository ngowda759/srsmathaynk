/**
 * Volunteer Search API Route
 * GET /api/volunteers/search?q=query - Search volunteers
 */

import { NextRequest, NextResponse } from "next/server";
import { volunteerService } from "@/services/volunteer.service";

// GET /api/volunteers/search?q=query
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.length < 2) {
      return NextResponse.json(
        { success: false, error: "Query must be at least 2 characters" },
        { status: 400 }
      );
    }

    const volunteers = await volunteerService.getAllVolunteers();

    console.log(`[API] Volunteer search: "${query}" returned ${volunteers.length} results`);

    return NextResponse.json({
      success: true,
      data: volunteers,
      query,
    });
  } catch (error) {
    console.error("[API] Failed to search volunteers:", error);
    return NextResponse.json(
      { success: false, error: "Failed to search volunteers" },
      { status: 500 }
    );
  }
}
