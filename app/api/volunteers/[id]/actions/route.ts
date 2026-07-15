/**
 * Volunteer Actions API Route
 * POST /api/volunteers/[id]/actions - Perform actions
 */

import { NextRequest, NextResponse } from "next/server";
import { volunteerService } from "@/services/volunteer.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/volunteers/[id]/actions
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action } = body;

    const volunteer = await volunteerService.getVolunteerById(id);
    if (!volunteer) {
      return NextResponse.json(
        { success: false, error: "Volunteer not found" },
        { status: 404 }
      );
    }

    switch (action) {
      case "activate":
        await volunteerService.updateVolunteer(id, { active: true });
        console.log(`[API] Volunteer activated: ${id}`);
        return NextResponse.json({
          success: true,
          message: "Volunteer activated",
        });

      case "deactivate":
        await volunteerService.updateVolunteer(id, { active: false });
        console.log(`[API] Volunteer deactivated: ${id}`);
        return NextResponse.json({
          success: true,
          message: "Volunteer deactivated",
        });

      default:
        return NextResponse.json(
          { success: false, error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("[API] Failed to perform volunteer action:", error);
    return NextResponse.json(
      { success: false, error: "Failed to perform action" },
      { status: 500 }
    );
  }
}
