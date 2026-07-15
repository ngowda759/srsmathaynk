/**
 * Single Seva API Route
 * GET    /api/sevas/[id] - Get seva
 * PATCH  /api/sevas/[id] - Update seva
 * DELETE /api/sevas/[id] - Delete seva
 */

import { NextRequest, NextResponse } from "next/server";
import { sevaService } from "@/services/seva.service";
import { SevaRequest } from "@/types/seva";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/sevas/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const seva = await sevaService.getSevaById(id);

    if (!seva) {
      return NextResponse.json(
        { success: false, error: "Seva not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: seva });
  } catch (error) {
    console.error("[API] Failed to fetch seva:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch seva" },
      { status: 500 }
    );
  }
}

// PATCH /api/sevas/[id]
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body: Partial<SevaRequest> = await request.json();

    const existing = await sevaService.getSevaById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Seva not found" },
        { status: 404 }
      );
    }

    await sevaService.updateSeva(id, body);

    return NextResponse.json({
      success: true,
      message: "Seva updated successfully",
    });
  } catch (error) {
    console.error("[API] Failed to update seva:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update seva" },
      { status: 500 }
    );
  }
}

// DELETE /api/sevas/[id]
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const existing = await sevaService.getSevaById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Seva not found" },
        { status: 404 }
      );
    }

    await sevaService.deleteSeva(id);

    return NextResponse.json({
      success: true,
      message: "Seva deleted successfully",
    });
  } catch (error) {
    console.error("[API] Failed to delete seva:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete seva" },
      { status: 500 }
    );
  }
}
