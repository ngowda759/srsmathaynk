/**
 * Sevas API Route
 * GET    /api/sevas - List sevas
 * POST   /api/sevas - Create seva
 */

import { NextRequest, NextResponse } from "next/server";
import { sevaService } from "@/services/seva.service";
import { SevaRequest } from "@/types/seva";

// GET /api/sevas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const options: {
      active?: boolean;
      featured?: boolean;
      category?: string;
      limit?: number;
    } = {};

    if (searchParams.get("active")) {
      options.active = searchParams.get("active") === "true";
    }
    if (searchParams.get("featured")) {
      options.featured = searchParams.get("featured") === "true";
    }
    if (searchParams.get("category")) {
      options.category = searchParams.get("category")!;
    }
    if (searchParams.get("limit")) {
      options.limit = parseInt(searchParams.get("limit")!);
    }

    const result = await sevaService.getSevas(options);

    return NextResponse.json({
      success: true,
      data: result.sevas,
      total: result.total,
    });
  } catch (error) {
    console.error("[API] Failed to fetch sevas:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch sevas" },
      { status: 500 }
    );
  }
}

// POST /api/sevas
export async function POST(request: NextRequest) {
  try {
    const body: SevaRequest = await request.json();

    if (!body.name) {
      return NextResponse.json(
        { success: false, error: "Seva name is required" },
        { status: 400 }
      );
    }

    const id = await sevaService.createSeva(body);

    return NextResponse.json(
      { success: true, data: { id }, message: "Seva created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API] Failed to create seva:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create seva" },
      { status: 500 }
    );
  }
}
