/**
 * Documents API Route
 * GET    /api/documents - List documents
 * POST   /api/documents - Create document
 */

import { NextRequest, NextResponse } from "next/server";
import { documentService } from "@/services/document.service";
import { z } from "zod";

const createDocumentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  titleKn: z.string().optional(),
  description: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  mediaId: z.string().min(1, "Media file is required"),
  fileName: z.string().optional(),
  fileSize: z.number().optional(),
  mimeType: z.string().optional(),
  featured: z.boolean().optional(),
  active: z.boolean().optional(),
  order: z.number().optional(),
});

// GET /api/documents
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const options: {
      categoryId?: string;
      active?: boolean;
      featured?: boolean;
      search?: string;
      limit?: number;
    } = {};

    if (searchParams.get("categoryId")) {
      options.categoryId = searchParams.get("categoryId")!;
    }
    if (searchParams.get("active")) {
      options.active = searchParams.get("active") === "true";
    }
    if (searchParams.get("featured")) {
      options.featured = searchParams.get("featured") === "true";
    }
    if (searchParams.get("search")) {
      options.search = searchParams.get("search")!;
    }
    if (searchParams.get("limit")) {
      options.limit = parseInt(searchParams.get("limit")!);
    }

    const result = await documentService.getDocuments(options);

    console.log(`[API] Fetched ${result.total} documents`);

    return NextResponse.json({
      success: true,
      data: result.documents,
      total: result.total,
    });
  } catch (error) {
    console.error("[API] Failed to fetch documents:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}

// POST /api/documents
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = createDocumentSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const id = await documentService.createDocument(validation.data);

    console.log(`[API] Document created: ${id}`);

    return NextResponse.json(
      { success: true, data: { id }, message: "Document created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API] Failed to create document:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create document" },
      { status: 500 }
    );
  }
}
