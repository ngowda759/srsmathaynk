/**
 * AI Knowledge Base API
 * GET - List/search articles
 * POST - Create article (admin)
 */
import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/db"
import { z } from "zod"

const createArticleSchema = z.object({
  categoryId: z.string().optional(),
  question: z.string().min(1).max(500),
  questionKannada: z.string().max(500).optional(),
  answer: z.string().min(1),
  answerKannada: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  priority: z.number().int().min(0).optional().default(0),
  active: z.boolean().optional().default(true),
})

async function checkAdmin() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  
  const profile = await prisma.profile.findUnique({
    where: { userId: user.id }
  })
  
  return profile?.role === "SUPER_ADMIN" || profile?.role === "ADMIN" || profile?.role === "STAFF"
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get("categoryId")
    const search = searchParams.get("search")
    const q = searchParams.get("q") // Direct question search
    const active = searchParams.get("active")

    const where: any = {}
    if (categoryId) where.categoryId = categoryId
    if (active !== "false") where.active = true

    // Question search
    if (q) {
      where.OR = [
        { question: { contains: q, mode: "insensitive" } },
        { questionKannada: { contains: q, mode: "insensitive" } },
        { answer: { contains: q, mode: "insensitive" } },
        { keywords: { has: q.toLowerCase() } },
      ]
    }

    // General search
    if (search) {
      where.OR = [
        { question: { contains: search, mode: "insensitive" } },
        { questionKannada: { contains: search, mode: "insensitive" } },
        { answer: { contains: search, mode: "insensitive" } },
      ]
    }

    const articles = await prisma.aIKnowledgeArticle.findMany({
      where,
      orderBy: [{ priority: "desc" }, { viewCount: "desc" }],
      include: { category: true },
    })

    return NextResponse.json(articles)
  } catch (error) {
    console.error("Error fetching knowledge articles:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!await checkAdmin()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validation = createArticleSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.errors },
        { status: 400 }
      )
    }

    const result = await prisma.aIKnowledgeArticle.create({
      data: validation.data,
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error("Error creating article:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
