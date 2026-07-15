/**
 * Volunteers API Route
 * GET    /api/volunteers - List volunteers
 * POST   /api/volunteers - Create volunteer
 */

import { NextRequest, NextResponse } from "next/server";
import { volunteerService, getVolunteerStatistics } from "@/services/volunteer.service";
import { VolunteerRequest } from "@/types/volunteer";
import { z } from "zod";

const createVolunteerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  sex: z.enum(["Male", "Female", "Other"]),
  active: z.boolean().optional().default(true),
  address: z.string().optional(),
  skills: z.array(z.string()).optional(),
  availability: z.string().optional(),
});

// GET /api/volunteers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const options: {
      active?: boolean;
      search?: string;
      limit?: number;
    } = {};

    if (searchParams.get("active")) {
      options.active = searchParams.get("active") === "true";
    }
    if (searchParams.get("search")) {
      options.search = searchParams.get("search")!;
    }
    if (searchParams.get("limit")) {
      options.limit = parseInt(searchParams.get("limit")!);
    }

    const result = await volunteerService.getAllVolunteers(options);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("[API] Failed to fetch volunteers:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch volunteers" },
      { status: 500 }
    );
  }
}

// POST /api/volunteers
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = createVolunteerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const data: VolunteerRequest = validation.data;
    const id = await volunteerService.createVolunteer(data);

    console.log(`[API] Volunteer created: ${id}`);

    return NextResponse.json(
      { success: true, data: { id }, message: "Volunteer created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API] Failed to create volunteer:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create volunteer" },
      { status: 500 }
    );
  }
}
