/**
 * FAQ API - Simplified from Knowledge Base
 * GET - List FAQs
 * POST - Create FAQ (admin)
 */
import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/db"
import { z } from "zod"

const createFAQSchema = z.object({
  question: z.string().min(1).max(500),
  questionKannada: z.string().max(500).optional(),
  answer: z.string().min(1),
  answerKannada: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  order: z.number().int().min(0).optional().default(0),
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
    const search = searchParams.get("search")
    const active = searchParams.get("active")

    const where: any = {}
    if (active !== "false") where.active = true
    if (search) {
      where.OR = [
        { question: { contains: search, mode: "insensitive" } },
        { answer: { contains: search, mode: "insensitive" } },
      ]
    }

    const faqs = await prisma.aIKnowledgeArticle.findMany({
      where,
      select: {
        id: true,
        question: true,
        questionKannada: true,
        answer: true,
        answerKannada: true,
        order: true,
        viewCount: true,
        helpfulCount: true,
      },
      orderBy: [{ order: "asc" }, { viewCount: "desc" }],
    })

    return NextResponse.json(faqs)
  } catch (error) {
    console.error("Error fetching FAQs:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!await checkAdmin()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validation = createFAQSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.errors },
        { status: 400 }
      )
    }

    const result = await prisma.aIKnowledgeArticle.create({
      data: {
        question: validation.data.question,
        questionKannada: validation.data.questionKannada,
        answer: validation.data.answer,
        answerKannada: validation.data.answerKannada,
        keywords: validation.data.keywords,
        order: validation.data.order,
        active: validation.data.active,
      },
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error("Error creating FAQ:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
