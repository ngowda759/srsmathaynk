/**
 * Single Document API Route
 * GET    /api/documents/[id] - Get document
 * PATCH  /api/documents/[id] - Update document
 * DELETE /api/documents/[id] - Delete document
 * POST   /api/documents/[id] - Actions (download, feature toggle)
 */

import { NextRequest, NextResponse } from "next/server";
import { documentService } from "@/services/document.service";
import { z } from "zod";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const updateDocumentSchema = z.object({
  title: z.string().min(1).optional(),
  titleKn: z.string().optional(),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  mediaId: z.string().optional(),
  featured: z.boolean().optional(),
  active: z.boolean().optional(),
  order: z.number().optional(),
});

// GET /api/documents/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const document = await documentService.getDocumentById(id);

    if (!document) {
      return NextResponse.json(
        { success: false, error: "Document not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: document });
  } catch (error) {
    console.error("[API] Failed to fetch document:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch document" },
      { status: 500 }
    );
  }
}

// PATCH /api/documents/[id]
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    const validation = updateDocumentSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const existing = await documentService.getDocumentById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Document not found" },
        { status: 404 }
      );
    }

    await documentService.updateDocument(id, validation.data);

    console.log(`[API] Document updated: ${id}`);

    return NextResponse.json({
      success: true,
      message: "Document updated successfully",
    });
  } catch (error) {
    console.error("[API] Failed to update document:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update document" },
      { status: 500 }
    );
  }
}

// DELETE /api/documents/[id]
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const existing = await documentService.getDocumentById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Document not found" },
        { status: 404 }
      );
    }

    await documentService.deleteDocument(id);

    console.log(`[API] Document deleted: ${id}`);

    return NextResponse.json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error("[API] Failed to delete document:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete document" },
      { status: 500 }
    );
  }
}

// POST /api/documents/[id] - Actions
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action } = body;

    const document = await documentService.getDocumentById(id);
    if (!document) {
      return NextResponse.json(
        { success: false, error: "Document not found" },
        { status: 404 }
      );
    }

    switch (action) {
      case "download":
        await documentService.incrementDownloadCount(id);
        console.log(`[API] Document download recorded: ${id}`);
        return NextResponse.json({
          success: true,
          message: "Download recorded",
        });

      case "toggleFeatured":
        const isFeatured = await documentService.toggleFeatured(id);
        console.log(`[API] Document featured toggled: ${id}, now featured: ${isFeatured}`);
        return NextResponse.json({
          success: true,
          data: { featured: isFeatured },
          message: isFeatured ? "Document featured" : "Document unfeatured",
        });

      case "toggleActive":
        const isActive = await documentService.toggleActive(id);
        console.log(`[API] Document active toggled: ${id}, now active: ${isActive}`);
        return NextResponse.json({
          success: true,
          data: { active: isActive },
          message: isActive ? "Document activated" : "Document deactivated",
        });

      default:
        return NextResponse.json(
          { success: false, error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("[API] Failed to perform document action:", error);
    return NextResponse.json(
      { success: false, error: "Failed to perform action" },
      { status: 500 }
    );
  }
}
