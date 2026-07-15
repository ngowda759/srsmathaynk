/**
 * Document Search API Route
 * GET /api/documents/search?q=query - Search documents
 */

import { NextRequest, NextResponse } from "next/server";
import { documentService } from "@/services/document.service";

// GET /api/documents/search?q=query
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

    const documents = await documentService.search(query);

    console.log(`[API] Document search: "${query}" returned ${documents.length} results`);

    return NextResponse.json({
      success: true,
      data: documents,
      query,
    });
  } catch (error) {
    console.error("[API] Failed to search documents:", error);
    return NextResponse.json(
      { success: false, error: "Failed to search documents" },
      { status: 500 }
    );
  }
}
