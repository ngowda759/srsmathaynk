/**
 * Single Volunteer API Route
 * GET    /api/volunteers/[id] - Get volunteer
 * PATCH  /api/volunteers/[id] - Update volunteer
 * DELETE /api/volunteers/[id] - Delete volunteer
 */

import { NextRequest, NextResponse } from "next/server";
import { volunteerService } from "@/services/volunteer.service";
import { z } from "zod";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const updateVolunteerSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  sex: z.enum(["Male", "Female", "Other"]).optional(),
  active: z.boolean().optional(),
  address: z.string().optional(),
  skills: z.array(z.string()).optional(),
  availability: z.string().optional(),
});

// GET /api/volunteers/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const volunteer = await volunteerService.getVolunteerById(id);

    if (!volunteer) {
      return NextResponse.json(
        { success: false, error: "Volunteer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: volunteer });
  } catch (error) {
    console.error("[API] Failed to fetch volunteer:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch volunteer" },
      { status: 500 }
    );
  }
}

// PATCH /api/volunteers/[id]
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    const validation = updateVolunteerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const existing = await volunteerService.getVolunteerById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Volunteer not found" },
        { status: 404 }
      );
    }

    await volunteerService.updateVolunteer(id, validation.data);

    console.log(`[API] Volunteer updated: ${id}`);

    return NextResponse.json({
      success: true,
      message: "Volunteer updated successfully",
    });
  } catch (error) {
    console.error("[API] Failed to update volunteer:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update volunteer" },
      { status: 500 }
    );
  }
}

// DELETE /api/volunteers/[id]
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const existing = await volunteerService.getVolunteerById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Volunteer not found" },
        { status: 404 }
      );
    }

    await volunteerService.deleteVolunteer(id);

    console.log(`[API] Volunteer deleted: ${id}`);

    return NextResponse.json({
      success: true,
      message: "Volunteer deleted successfully",
    });
  } catch (error) {
    console.error("[API] Failed to delete volunteer:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete volunteer" },
      { status: 500 }
    );
  }
}
