/**
 * Knowledge Categories API Route
 * GET    /api/knowledge/categories - List categories
 * POST   /api/knowledge/categories - Create category
 */

import { NextRequest, NextResponse } from "next/server";
import { knowledgeService } from "@/services/knowledge.service";
import { z } from "zod";

const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  nameKn: z.string().optional(),
  slug: z.string().optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  order: z.number().optional(),
  active: z.boolean().optional(),
});

// Predefined temple knowledge categories
const KNOWLEDGE_CATEGORIES = [
  { name: "Temple History", slug: "temple-history", icon: "landmark", color: "#8B4513" },
  { name: "Guru Parampara", slug: "guru-parampara", icon: "users", color: "#4A5568" },
  { name: "Rayaru (Swami Raghavendra)", slug: "rayaru", icon: "sparkles", color: "#D69E2E" },
  { name: "Madhwa Philosophy", slug: "madhwa-philosophy", icon: "book-open", color: "#2B6CB0" },
  { name: "Aaradhanes", slug: "aaradhanes", icon: "flame", color: "#C53030" },
  { name: "Panchanga", slug: "panchanga", icon: "calendar", color: "#38A169" },
  { name: "Sevas", slug: "sevas", icon: "gem", color: "#9F7AEA" },
  { name: "Festivals", slug: "festivals", icon: "party-popper", color: "#ED8936" },
  { name: "Slokas & Stothras", slug: "slokas", icon: "music", color: "#667EEA" },
  { name: "Daily Rituals", slug: "daily-rituals", icon: "clock", color: "#319795" },
  { name: "FAQs", slug: "faqs", icon: "help-circle", color: "#718096" },
];

// GET /api/knowledge/categories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const options: {
      active?: boolean;
    } = {};

    if (searchParams.get("active")) {
      options.active = searchParams.get("active") === "true";
    }

    const result = await knowledgeService.getCategories(options);

    // Enhance with predefined category info if available
    const enrichedCategories = result.categories.map((cat) => {
      const predefined = KNOWLEDGE_CATEGORIES.find((p) => p.slug === cat.slug);
      return {
        ...cat,
        icon: cat.icon || predefined?.icon || "folder",
        color: cat.color || predefined?.color || "#718096",
      };
    });

    console.log(`[API] Fetched ${result.total} knowledge categories`);

    return NextResponse.json({
      success: true,
      data: enrichedCategories,
      total: result.total,
      predefined: KNOWLEDGE_CATEGORIES,
    });
  } catch (error) {
    console.error("[API] Failed to fetch categories:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

// POST /api/knowledge/categories
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = createCategorySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const id = await knowledgeService.createCategory(validation.data);

    console.log(`[API] Category created: ${id}`);

    return NextResponse.json(
      { success: true, data: { id }, message: "Category created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API] Failed to create category:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create category" },
      { status: 500 }
    );
  }
}
