/**
 * Seva Actions API Route
 * POST /api/sevas/[id]/actions - Perform actions
 */

import { NextRequest, NextResponse } from "next/server";
import { sevaService } from "@/services/seva.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/sevas/[id]/actions
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action } = body;

    const seva = await sevaService.getSevaById(id);
    if (!seva) {
      return NextResponse.json(
        { success: false, error: "Seva not found" },
        { status: 404 }
      );
    }

    switch (action) {
      case "toggleFeatured":
        const isFeatured = await sevaService.toggleFeaturedSeva(id);
        console.log(`[API] Seva featured toggled: ${id}, now featured: ${isFeatured}`);
        return NextResponse.json({
          success: true,
          data: { featured: isFeatured },
          message: isFeatured ? "Seva featured" : "Seva unfeatured",
        });

      case "toggleActive":
        const isActive = await sevaService.toggleActiveSeva(id);
        console.log(`[API] Seva active toggled: ${id}, now active: ${isActive}`);
        return NextResponse.json({
          success: true,
          data: { active: isActive },
          message: isActive ? "Seva activated" : "Seva deactivated",
        });

      case "delete":
        await sevaService.deleteSeva(id);
        console.log(`[API] Seva deleted: ${id}`);
        return NextResponse.json({
          success: true,
          message: "Seva deleted",
        });

      default:
        return NextResponse.json(
          { success: false, error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("[API] Failed to perform seva action:", error);
    return NextResponse.json(
      { success: false, error: "Failed to perform action" },
      { status: 500 }
    );
  }
}
